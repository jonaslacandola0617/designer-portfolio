"use client";
import {useEffect,useState} from "react";
export function Toast({message}:{message:string}){const[visible,setVisible]=useState(false);useEffect(()=>{if(!message)return;const show=setTimeout(()=>setVisible(true),0);const hide=setTimeout(()=>setVisible(false),2200);return()=>{clearTimeout(show);clearTimeout(hide)}},[message]);return <div role="status" className={"toast"+(visible?" is-visible":"")}>{message}</div>}
