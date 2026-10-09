import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import "./theme.css";
function NotFound(){return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,fontFamily:"system-ui"}}><div><h1>Page not found</h1><a href="/">Return home</a></div></main>;}
export default function App(){return <BrowserRouter><Routes><Route path="/" element={<Home/>}/><Route path="*" element={<NotFound/>}/></Routes></BrowserRouter>;}
