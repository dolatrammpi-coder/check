#!/usr/bin/env python3

from flask import Flask, request, jsonify
from collections import deque
import subprocess
import threading
import time
import uuid

HOST = "127.0.0.1"
PORT = 5000

MAX_QUEUE = 100
MAX_OUTPUT = 120000
MAX_CACHE = 200
COMMAND_TIMEOUT = 300

app = Flask(__name__)

lock = threading.RLock()

inbox = deque(maxlen=MAX_QUEUE)
outbox = deque(maxlen=MAX_QUEUE)

seen = set()
result_cache = {}

seq = 0


def now():
    return time.time()


def make_id():
    return uuid.uuid4().hex


def remember_result(result):
    command_id = result.get("id")

    with lock:
        outbox.append(result)

        if command_id:
            result_cache[command_id] = result

            while len(result_cache) > MAX_CACHE:
                oldest = next(iter(result_cache))
                del result_cache[oldest]


def find_result(command_id):
    with lock:

        result = result_cache.get(command_id)

        if result is not None:
            return result

        for item in outbox:

            if item.get("id") == command_id:
                return item

    return None


# ==================================================
# HEALTH
# ==================================================

@app.get("/health")
def health():

    with lock:

        return jsonify({
            "ok": True,
            "bridge": "chatgpt-termux-v3",
            "queue": len(inbox),
            "outbox": len(outbox),
            "cached_results": len(result_cache),
            "last_sequence": seq
        })


# ==================================================
# EXECUTE COMMAND
# ==================================================

@app.post("/execute")
def execute():

    global seq

    data = request.get_json(
        silent=True
    ) or {}

    command = str(
        data.get("command")
        or data.get("cmd")
        or ""
    ).strip()

    command_id = str(
        data.get("id")
        or make_id()
    ).strip()

    if not command:

        return jsonify({
            "ok": False,
            "error": "missing command"
        }), 400

    if len(command) > 10000:

        return jsonify({
            "ok": False,
            "error": "command too long"
        }), 413


    # ----------------------------------------------
    # EXISTING RESULT
    # ----------------------------------------------

    with lock:

        cached = result_cache.get(
            command_id
        )

        if cached is not None:

            return jsonify(cached)


        # ------------------------------------------
        # COMMAND ALREADY RUNNING / SEEN
        # ------------------------------------------

        if command_id in seen:

            return jsonify({
                "ok": True,
                "pending": True,
                "id": command_id
            }), 202


        seen.add(command_id)

        seq += 1

        start_sequence = seq


    # ----------------------------------------------
    # EXECUTE
    # ----------------------------------------------

    started = now()

    try:

        process = subprocess.run(

            command,

            shell=True,

            executable=
                "/data/data/com.termux/files/usr/bin/bash",

            capture_output=True,

            text=True,

            timeout=COMMAND_TIMEOUT
        )


        stdout = process.stdout or ""
        stderr = process.stderr or ""

        output = stdout


        if stderr:

            output += (
                "\n\n[STDERR]\n"
                + stderr
            )


        output = output[:MAX_OUTPUT]


        success = (
            process.returncode == 0
        )


        result = {

            "ok": success,

            "id": command_id,

            "sequence":
                start_sequence,

            "command":
                command,

            "status":
                "done"
                if success
                else "failed",

            "returncode":
                process.returncode,

            "output":
                output,

            "duration":
                round(
                    now() - started,
                    3
                ),

            "created_at":
                now()
        }


    except subprocess.TimeoutExpired as e:

        stdout = (
            e.stdout
            if isinstance(
                e.stdout,
                str
            )
            else ""
        )

        stderr = (
            e.stderr
            if isinstance(
                e.stderr,
                str
            )
            else ""
        )


        result = {

            "ok": False,

            "id": command_id,

            "sequence":
                start_sequence,

            "command":
                command,

            "status":
                "timeout",

            "returncode":
                None,

            "output":
                (
                    stdout
                    + "\n\n[STDERR]\n"
                    + stderr
                    + "\n\nCommand timed out."
                )[:MAX_OUTPUT],

            "duration":
                round(
                    now() - started,
                    3
                ),

            "created_at":
                now()
        }


    except Exception as e:

        result = {

            "ok": False,

            "id": command_id,

            "sequence":
                start_sequence,

            "command":
                command,

            "status":
                "error",

            "returncode":
                None,

            "output":
                str(e)[:MAX_OUTPUT],

            "duration":
                round(
                    now() - started,
                    3
                ),

            "created_at":
                now()
        }


    # ----------------------------------------------
    # STORE RESULT
    # ----------------------------------------------

    remember_result(result)

    return jsonify(result)


# ==================================================
# RESULT LOOKUP
# ==================================================

@app.get("/v1/result/<command_id>")
def get_result(command_id):

    result = find_result(
        command_id
    )

    if result is None:

        return jsonify({

            "ok": False,

            "pending": True,

            "id": command_id

        }), 202


    return jsonify(result)


# ==================================================
# INBOX
# ==================================================

@app.post("/v1/inbox")
def receive():

    global seq

    data = request.get_json(
        silent=True
    ) or {}


    mid = str(
        data.get("id")
        or ""
    ).strip()


    text = str(
        data.get("text")
        or ""
    )


    source = str(
        data.get("source")
        or "chatgpt"
    )


    if not mid:

        return jsonify({

            "ok": False,

            "error":
                "missing id"

        }), 400


    with lock:

        if mid in seen:

            return jsonify({

                "ok": True,

                "duplicate": True,

                "id": mid

            })


        seen.add(mid)

        seq += 1


        item = {

            "id": mid,

            "sequence": seq,

            "source": source,

            "text": text,

            "status": "queued",

            "created_at":
                now()
        }


        inbox.append(item)


    return jsonify({

        "ok": True,

        "accepted": True,

        "item": item

    })


# ==================================================
# GET INBOX
# ==================================================

@app.get("/v1/inbox")
def get_inbox():

    with lock:

        return jsonify({

            "ok": True,

            "items":
                list(inbox)

        })


# ==================================================
# GET OUTBOX
# ==================================================

@app.get("/v1/outbox")
def get_outbox():

    try:

        after = int(
            request.args.get(
                "after",
                "0"
            )
        )

    except ValueError:

        after = 0


    with lock:

        items = [

            x

            for x in outbox

            if x.get(
                "sequence",
                0
            ) > after

        ]


        return jsonify({

            "ok": True,

            "items": items,

            "last_sequence": seq

        })


# ==================================================
# ACK
# ==================================================

@app.post("/v1/ack")
def ack():

    data = request.get_json(
        silent=True
    ) or {}


    mid = str(
        data.get("id")
        or ""
    ).strip()


    with lock:

        for item in inbox:

            if item.get("id") == mid:

                item["status"] = (
                    "acknowledged"
                )

                item["ack_at"] = now()


                return jsonify({

                    "ok": True,

                    "id": mid

                })


    return jsonify({

        "ok": False,

        "error":
            "id not found"

    }), 404


# ==================================================
# MANUAL RESULT
# ==================================================

@app.post("/v1/result")
def manual_result():

    global seq

    data = request.get_json(
        silent=True
    ) or {}


    mid = str(
        data.get("id")
        or make_id()
    )


    status = str(
        data.get("status")
        or "done"
    )


    output = str(
        data.get("output")
        or ""
    )


    with lock:

        seq += 1

        item = {

            "id": mid,

            "sequence": seq,

            "status": status,

            "output":
                output[:MAX_OUTPUT],

            "created_at":
                now()

        }


    remember_result(item)


    return jsonify({

        "ok": True,

        "item": item

    })


# ==================================================
# START
# ==================================================

if __name__ == "__main__":

    print(
        f"[bridge] listening on "
        f"http://{HOST}:{PORT}"
    )

    print(
        "[bridge] ChatGPT <-> Termux V3"
    )

    print(
        "[bridge] reliable result cache enabled"
    )

    print(
        "[bridge] duplicate command protection enabled"
    )

    print(
        "[bridge] result lookup enabled"
    )

    app.run(

        host=HOST,

        port=PORT,

        threaded=True
    )
