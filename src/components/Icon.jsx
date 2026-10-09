import * as Icons from "lucide-react";
import { memo } from "react";

const toPascal=(s)=>(typeof s==="string"?s:"").split("-").map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join("");

function Icon({name,size=20,className="",...props}){
  if(!name)return null;
  const aliases={Instagram:"Camera",Facebook:"Users"};
  const Component=Icons[toPascal(aliases[name]||name)];
  if(!Component)return null;
  return <Component size={size} className={className} {...props}/>;
}
export default memo(Icon);
