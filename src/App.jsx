import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Category from "./pages/Category";
import "./theme.css";

const categoryRoutes={
  "Home Decor":"decor",
  "Kitchen Cookware":"cookware",
  "Storage & Organizers":"storage",
  "Dinnerware & Serveware":"dinnerware",
  "Kitchen Tools":"tools",
  "Home Essentials":"essentials"
};

function NotFound(){return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,fontFamily:"system-ui"}}><div><h1>Page not found</h1><a href="/check/">Return home</a></div></main>;}

export default function App(){
  useEffect(()=>{
    const handleClick=(event)=>{
      const card=event.target.closest(".category-item");
      if(!card) return;
      const name=card.querySelector("strong")?.textContent?.trim();
      const slug=categoryRoutes[name];
      if(slug) window.location.href="/check/category/"+slug;
    };
    document.addEventListener("click",handleClick);
    return()=>document.removeEventListener("click",handleClick);
  },[]);
  return <BrowserRouter basename="/check"><Routes><Route path="/" element={<Home/>}/><Route path="/category/:slug" element={<Category/>}/><Route path="*" element={<NotFound/>}/></Routes></BrowserRouter>;
}