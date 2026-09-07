import http from "node:http";
import {readFileSync} from "node:fs";
const fonts={
"fraunces-normal":["Fraunces","normal","100 900","@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2"],
"fraunces-italic":["Fraunces","italic","100 900","@fontsource-variable/fraunces/files/fraunces-latin-full-italic.woff2"],
"grotesk":["Space Grotesk","normal","300 700","@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2"],
"mono":["IBM Plex Mono","normal","400","@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2"],
"mono-medium":["IBM Plex Mono","normal","500","@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2"]};
http.createServer((req,res)=>{const path=new URL(req.url,"http://localhost").pathname;const font=fonts[path.slice(1)];if(font){res.setHeader("Content-Type","font/woff2");res.end(readFileSync("node_modules/"+font[3]));return}if(!["/public-site.html","/admin.html"].includes(path)){res.writeHead(404).end();return}let html=readFileSync("design"+path,"utf8");html=html.replace(/<link[^>]*fonts\.(?:googleapis|gstatic)[^>]*>/g,"");const css=Object.entries(fonts).map(([key,[family,style,weight]])=>"@font-face{font-family:'"+family+"';font-style:"+style+";font-weight:"+weight+";src:url('/"+key+"') format('woff2');font-display:swap}").join("");res.setHeader("Content-Type","text/html");res.end(html.replace("</head>","<style>"+css+"</style></head>"))}).listen(3001,"127.0.0.1",()=>console.log("Read-only design reference on http://127.0.0.1:3001"));
