var De=[.2126,.7152,.0722],ra=216/24389,To=24389/27;var nt=(t,e,o)=>Math.min(o,Math.max(e,t)),it=t=>t>=0&&t<360?t:(t%360+360)%360;function V(t){return t<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}function et(t){return t=nt(t,0,1),t<=.0031308?12.92*t:1.055*Math.pow(t,1/2.4)-.055}function J([t,e,o]){return De[0]*t+De[1]*e+De[2]*o}function It(t){return t>ra?116*Math.cbrt(t)-16:To*t}function Zt(t){return t>8?((t+16)/116)**3:t/To}function Jt(t){let e=it(t)/60,o=Math.floor(e)%6,n=e-Math.floor(e),a=1-n;return[[1,n,0],[a,1,0],[0,1,n],[0,a,1],[n,0,1],[1,0,a]][o]}function aa([t,e,o]){let n=Math.max(t,e,o),a=n-Math.min(t,e,o);if(a===0)return 0;let r;return n===t?r=(e-o)/a:n===e?r=(o-t)/a+2:r=(t-e)/a+4,it(r*60)}function sa([t,e,o]){let n=Math.cbrt(.4122214708*t+.5363325363*e+.0514459929*o),a=Math.cbrt(.2119034982*t+.6806995451*e+.1073969566*o),r=Math.cbrt(.0883024619*t+.2817188376*e+.6299787005*o),s=1.9779984951*n-2.428592205*a+.4505937099*r,l=.0259040371*n+.7827717662*a-.808675766*r;return it(Math.atan2(l,s)*180/Math.PI)}var ot=3600,la=.25,qe=null;function Ho(){if(qe)return qe;let t=new Float64Array(ot+1),e=la*360/ot,o=0,n=0,a=0;for(let s=0;s<=ot;s++){let l=sa(Jt(s*360/ot).map(V));if(s===0){o=n=l;continue}for(;l-n>180;)l-=360;for(;l-n<-180;)l+=360;a+=Math.max(0,e-(l-n)),t[s]=l-o+a,n=l}let r=360/t[ot];for(let s=0;s<=ot;s++)t[s]*=r;return qe=t,t}function ct(t,{hue:e="oklab"}={}){if(t=it(t),e==="hsv")return t;let o=Ho(),n=0,a=ot;for(;a-n>1;){let s=n+a>>1;o[s]<=t?n=s:a=s}let r=(t-o[n])/(o[a]-o[n]);return it((n+r)*360/ot)}function Y(t,{hue:e="oklab"}={}){if(t=it(t),e==="hsv")return t;let o=Ho(),n=t/360*ot,a=Math.min(Math.floor(n),ot-1);return it(o[a]+(n-a)*(o[a+1]-o[a]))}function Ve(t,{hue:e="oklab"}={}){let o=Jt(ct(t,{hue:e})).map(V);return{pure:o,y:J(o)}}function ia({pure:t,y:e},o,n){let a=Zt(nt(o,0,100));n=nt(n,0,1);let r=a<=e?a/e:(1-a)/(1-e),s=a<=e?0:1-r,l=n*r,i=n*s+(1-n)*a;return t.map(u=>nt(l*u+i,0,1))}function Lt({h:t,l:e,s:o},n){return ia(Ve(t,n),e,o)}function Ue(t,{hue:e="oklab"}={}){let o=J(t),n=nt(It(o),0,100),a=Math.max(...t),r=Math.min(...t),s=a-r;if(s<1e-9)return{h:0,l:n,s:0};let l=aa(t.map(h=>et((h-r)/s))),i=Jt(l).map(V),u=J(i),d=o<=u?o/u:(1-o)/(1-u),c=d>0?nt(s/d,0,1):0;return{h:Y(l,{hue:e}),l:n,s:c}}function F(t,e){return Lt(t,e).map(et)}function D(t,e){return Ue(t.map(V),e)}function W(t){return t.map(e=>Math.round(nt(e,0,1)*255))}function _(t){return"#"+W(t).map(e=>e.toString(16).padStart(2,"0")).join("")}function ca(t,e,o){let n=r=>(r+it(t)/30)%12,a=e*Math.min(o,1-o);return[0,8,4].map(r=>o-a*Math.max(-1,Math.min(n(r)-3,9-n(r),1)))}function Z(t){let e=String(t).trim().toLowerCase(),o=e.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/);if(o){let n=o[1];return n.length===3&&(n=[...n].map(a=>a+a).join("")),[0,2,4].map(a=>parseInt(n.slice(a,a+2),16)/255)}if(o=e.match(/^(?:rgba?\()?\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*\)?$/),o){let n=o.slice(1,4).map(Number);if(n.every(a=>a<=255))return n.map(a=>a/255)}if(o=e.match(/^hsla?\(\s*(-?[\d.]+)(deg|turn)?\s*[,\s]\s*(-?[\d.]+)%?\s*[,\s]\s*(-?[\d.]+)%?\s*\)$/),o){let n=Number(o[1])*(o[2]==="turn"?360:1),[a,r]=[o[3],o[4]].map(s=>nt(Number(s)/100,0,1));if([n,a,r].every(Number.isFinite))return ca(n,a,r)}return null}function Qt({srgb:t=null,coords:e=null},o){let n={},a=(l,i)=>n[l]??(n[l]=i()),r=()=>a("srgb",()=>t??F(e,{hue:o})),s=([l,i,u])=>({r:l,g:i,b:u});return Object.freeze({get value(){return{...a("value",()=>e??D(t,{hue:o}))}},get rgb(){return s(W(r()))},get srgb(){return s(r())},get linear(){return s(r().map(V))},get hex(){return _(r())},with(l){return lt({...this.value,...l},{hue:o})},toString(){return this.hex}})}var ua=t=>t&&["h","l","s"].every(e=>Number.isFinite(t[e])),Ro=t=>t&&["r","g","b"].every(e=>Number.isFinite(t[e]));function Po(t,e,o){let n=Ro(t)?[t.r,t.g,t.b]:t?.length===3?[...t]:null;if(!n?.every(a=>Number.isFinite(a)&&a>=0&&a<=e))throw new RangeError(`${o} takes { r, g, b } or [r, g, b] with channels from 0 to ${e}.`);return n}function lt(t,e={}){if(typeof t=="string"){if(/^\s*(rgb|hsl)a?\(/i.test(t))return lt.fromCss(t,e);if(/^\s*#?[0-9a-f]+\s*$/i.test(t))return lt.fromHex(t,e);throw new Error(`Can't read "${t}" as a color. Use a hex code like '#ee7231', rgb() or hsl().`)}if(ua(t)){let o={h:it(t.h),l:nt(t.l,0,100),s:nt(t.s,0,1)};return Qt({coords:o},e.hue??"oklab")}if(Ro(t)||t?.length===3)return lt.fromRgb(t,e);throw new TypeError("Make a color from { h, l, s }, { r, g, b }, [r, g, b], a hex code, rgb() or hsl().")}lt.fromRgb=(t,{hue:e="oklab"}={})=>Qt({srgb:Po(t,255,"fromRgb").map(o=>o/255)},e);lt.fromSrgb=(t,{hue:e="oklab"}={})=>Qt({srgb:Po(t,1,"fromSrgb")},e);lt.fromHex=(t,{hue:e="oklab"}={})=>{let o=/^\s*#?([0-9a-f]{3}|[0-9a-f]{6})\s*$/i.test(t)?Z(t):null;if(!o)throw new Error(`Can't read "${t}" as a hex code. Use six or three hex digits, like '#ee7231' or '#e73'.`);return Qt({srgb:o},e)};lt.fromCss=(t,{hue:e="oklab"}={})=>{let o=/^\s*(rgb|hsl)a?\(/i.test(t)?Z(t):null;if(!o)throw new Error(`Can't read "${t}" as CSS. Use rgb() with channels from 0 to 255 or hsl() with percentages, like 'rgb(238, 114, 49)' or 'hsl(20.6, 84.8%, 56.3%)'.`);return Qt({srgb:o},e)};function j(t,e){if(Object.is(t,e))return!0;if(!t||!e||typeof t!="object"||typeof e!="object")return!1;let o=Object.keys(t);return o.length===Object.keys(e).length&&o.every(n=>Object.is(t[n],e[n]))}function _o(t){let e=t,o=new Set;function n(){for(let a of[...o])o.has(a)&&a()}return{get:()=>e,set(a){let r={...e,...a};j(e,r)||(e=r,n())},update(a){let r=a(e);r!==e&&(e=r,n())},watch(a,r,s=Object.is){let l=a(e),i=()=>{let u=a(e);s(u,l)||(l=u,r(u,e))};return o.add(i),r(l,e),()=>o.delete(i)}}}function ft(t){let{h:e,l:o,s:n}=D(t,{hue:"hsv"});return{hsv:e,l:o,s:n,exact:t}}function ut({color:t}){return t.exact??F({h:t.hsv,l:t.l,s:t.s},{hue:"hsv"})}function Ot({color:t,mode:e}){return{h:Y(t.hsv,{hue:e}),l:t.l,s:t.s}}function Oo(t,e){let{h:o,l:n,s:a}={...Ot(t),...e};return{hsv:ct(o,{hue:t.mode}),l:n,s:a,exact:null}}function je({color:t}){let e=t.l>50?5:95;return F({h:t.hsv,l:e,s:t.s},{hue:"hsv"})}var $o=[0,0,0],Io=[1,1,1];function Et(t){return t.theme==="black-white"?{primary:$o,background:Io}:t.theme==="white-black"?{primary:Io,background:$o}:{primary:ut(t),background:je(t)}}function Fo(t,e=document.documentElement){t.watch(o=>({color:o.color,theme:o.theme}),(o,n)=>{let{primary:a,background:r}=Et(n);e.style.setProperty("--color",_(ut(n))),e.style.setProperty("--primary",_(a)),e.style.setProperty("--background",_(r))},j)}var Ge=Array.from({length:13},(t,e)=>e*30),da=Ge.map((t,e)=>`<stop offset="${e/(Ge.length-1)}" stop-color="${_(F({h:t,l:65,s:1},{hue:"oklab"}))}"/>`).join(""),No=t=>`<rect x="1.75" y="1.75" width="20.5" height="20.5" fill="${t}"/>`,Bo=(t,e)=>`<path d="M1.75 1.75H12V22.25H1.75Z" fill="${t}" stroke="none"/><path d="M12 1.75H22.25V22.25H12Z" fill="${e}" stroke="none"/>${No("none")}`,ha=0,At=[["color","Show the page in the drifting color"],["black-white","Show the page in black on white"],["white-black","Show the page in white on black"]],pa=`linear-gradient(to right, ${Ge.map(t=>_(F({h:t,l:65,s:1},{hue:"oklab"}))).join(", ")})`;function Do(t){return t==="black-white"?"linear-gradient(to right, #000 50%, #fff 50%)":t==="white-black"?"linear-gradient(to right, #fff 50%, #000 50%)":pa}function qo(t){if(t==="black-white")return Bo("#000","#fff");if(t==="white-black")return Bo("#fff","#000");let e=`color-mode-hues-${++ha}`;return`<defs><linearGradient id="${e}">${da}</linearGradient></defs>${No(`url(#${e})`)}`}var ma=[["Color space","#color-space"],["Palette","#palette"],["Contrast","#contrast"],["Code","#code"]],fa={github:'<path d="M12 0C5.37 0 0 5.37 0 12C0 17.31 3.435 21.795 8.205 23.385C8.805 23.49 9.03 23.13 9.03 22.815C9.03 22.53 9.015 21.585 9.015 20.58C6 21.135 5.22 19.845 4.98 19.17C4.845 18.825 4.26 17.76 3.75 17.475C3.33 17.25 2.73 16.695 3.735 16.68C4.68 16.665 5.355 17.55 5.58 17.91C6.66 19.725 8.385 19.215 9.075 18.9C9.18 18.12 9.495 17.595 9.84 17.31C7.17 17.01 4.38 15.975 4.38 11.385C4.38 10.08 4.845 9 5.61 8.16C5.49 7.86 5.07 6.63 5.73 4.98C5.73 4.98 6.735 4.665 9.03 6.21C9.99 5.94 11.01 5.805 12.03 5.805C13.05 5.805 14.07 5.94 15.03 6.21C17.325 4.65 18.33 4.98 18.33 4.98C18.99 6.63 18.57 7.86 18.45 8.16C19.215 9 19.68 10.065 19.68 11.385C19.68 15.99 16.875 17.01 14.205 17.31C14.64 17.685 15.015 18.405 15.015 19.53C15.015 21.135 15 22.425 15 22.83C15 23.145 15.225 23.52 15.825 23.4C18.2096 22.595 20.2814 21.0617 21.7481 19.0163C23.2148 16.971 24.0025 14.5169 24 12C24 5.37 18.63 0 12 0Z"/>'},ga=t=>`<svg class="icon icon-${t}" viewBox="0 0 24 24" aria-hidden="true">${fa[t]}</svg>`,Vo=t=>At[(At.findIndex(([e])=>e===t)+1)%At.length],ba=Object.fromEntries(At.map(([t])=>[t,qo(t)]));function Uo({onTheme:t,onSection:e}){let o=document.createElement("nav");o.className="navigation",o.setAttribute("aria-label","Main"),o.innerHTML=`
    <ul class="navigation-links">
      ${ma.map(([r,s])=>`<li><a href="${s}">${r}</a></li>`).join("")}
    </ul>
    <div class="navigation-tools">
      <button type="button" class="color-mode"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"></svg></button>
      <a href="https://github.com/domizai/hsl-star" aria-label="HSL* on GitHub">${ga("github")}</a>
    </div>`;for(let r of o.querySelectorAll(".navigation-links a"))r.addEventListener("click",s=>{s.preventDefault(),e(r.getAttribute("href").slice(1))});let n=o.querySelector(".color-mode"),a="color";return n.addEventListener("click",()=>t(Vo(a)[0])),{element:o,update(r){a=r.theme;let[s,l]=Vo(a);n.querySelector("svg").innerHTML=ba[s],n.setAttribute("aria-label",l)}}}var Sa=`
  <svg viewBox="0 0 1288 525.286" aria-hidden="true">
    <path d="M827.469 8.51822H933.236V425.908H1160.39V516.768H827.469V8.51822Z"/>
    <path d="M593.485 525.286C479.909 525.286 416.023 470.865 401.826 362.022L501.914 352.084C506.174 380.478 515.875 401.773 531.018 415.97C546.162 430.167 567.457 437.265 594.904 437.265C619.512 437.265 637.968 431.35 650.272 419.519C663.05 407.215 669.438 392.072 669.438 374.089C669.438 357.999 664.469 344.512 654.532 333.628C644.594 322.744 628.267 313.989 605.552 307.363L541.666 288.908C503.334 277.55 473.284 259.567 451.515 234.959C430.22 209.878 419.572 179.355 419.572 143.389C419.572 118.781 425.488 95.5927 437.318 73.824C449.622 52.0554 468.315 34.3092 493.396 20.5855C518.478 6.86184 549.474 0 586.386 0C643.174 0 684.818 13.9603 711.319 41.8809C738.293 69.8016 753.437 104.111 756.749 144.809L655.241 152.617C649.563 108.607 625.428 86.6013 582.837 86.6013C562.488 86.6013 546.871 91.5702 535.987 101.508C525.576 110.973 520.371 122.803 520.371 137C520.371 151.671 525.813 163.738 536.697 173.203C547.581 182.194 564.381 189.766 587.096 195.918L641.754 211.534C686.238 223.838 719.128 243.477 740.423 270.452C761.718 297.426 772.366 328.896 772.366 364.861C772.366 393.728 765.504 420.466 751.78 445.074C738.53 469.208 718.418 488.611 691.444 503.281C664.943 517.951 632.29 525.286 593.485 525.286Z"/>
    <path d="M247.736 296.006H105.767V516.768H0V8.51822H105.767V205.146H247.736V8.51822H353.504V516.768H247.736V296.006Z"/>
    <path d="M1060.14 214.373C1077.18 193.078 1098.71 169.416 1124.74 143.389C1085.46 138.183 1054.93 132.031 1033.17 124.933L1053.04 64.5959C1076.7 72.6408 1105.33 84.7082 1138.93 100.798C1133.25 64.8325 1129.94 34.0725 1129 8.51804L1193.59 8.51804C1193.59 25.0811 1190.28 55.8411 1183.65 100.798C1209.68 88.0208 1238.55 75.9534 1270.25 64.5959L1288 124.933C1261.97 132.504 1231.69 138.893 1197.14 144.099C1225.06 171.546 1246.83 194.971 1262.45 214.373L1211.34 252.705C1196.19 232.356 1179.39 205.382 1160.94 171.783C1140.12 208.695 1123.55 235.669 1111.25 252.705L1060.14 214.373Z"/>
  </svg>`;function jo(){let t=document.createElement("h1");return t.className="box wordmark",t.innerHTML=`<span class="visually-hidden">HSL*</span>${Sa}`,{element:t}}function te(t,{half:e=!1}={}){let o=document.createElement("div");o.className=e?"box basic-text half":"box basic-text";let n=document.createElement("p");return n.append(...[t].flat()),o.append(n),{element:o}}function ze(t,e){let o=document.createElement("a");return o.href=e,o.textContent=t,o}function dt({label:t,valueOf:e,set:o,wrap:n=0}){let a=document.createElement("input");a.inputMode="decimal",a.spellcheck=!1,a.autocomplete="off",a.setAttribute("aria-label",t);let r=c=>{let h=Math.round(c);return n?(h%n+n)%n:h},s=()=>{a.style.width=`${Math.max(1,a.value.length)}ch`},l=()=>{a.value=String(r(e())),s()},i=()=>{let c=Number(a.value.replace(",","."));return a.value.trim()!==""&&Number.isFinite(c)?c:null},u=c=>{o(r(r(e())+c)),l()},d=null;return a.addEventListener("focus",()=>{d=e()}),a.addEventListener("input",()=>{s();let c=i();c!==null&&o(c)}),a.addEventListener("change",l),a.addEventListener("keydown",c=>{c.key==="Enter"&&a.blur(),c.key==="Escape"&&(d!==null&&o(d),l(),a.blur()),(c.key==="ArrowUp"||c.key==="ArrowDown")&&(c.preventDefault(),u((c.shiftKey?10:1)*(c.key==="ArrowUp"?1:-1)))}),{input:a,step:u,update(){document.activeElement!==a&&l()}}}var ht=[{key:"h",name:"H",label:"Hue",max:360,unit:"\xB0",toValue:t=>t,fromValue:t=>t},{key:"s",name:"S",label:"Saturation",max:100,unit:"%",toValue:t=>t*100,fromValue:t=>t/100},{key:"l",name:"L*",label:"Lightness",max:100,unit:"",toValue:t=>t,fromValue:t=>t}],ya=(t,e,o)=>Math.min(o,Math.max(e,t)),xa=(t,e)=>String(Math.round(e)%(t.key==="h"?360:1/0));function Ft(t,e,{valueOf:o,set:n}){let a=l=>n({[e.key]:e.fromValue(ya(l,0,e.max))}),r=l=>e.key==="h"&&Number.isFinite(l)?a(((o()+l)%360+360)%360):a(o()+l),s=l=>{let i=t.getBoundingClientRect();a((l.clientX-i.left)/i.width*e.max)};t.addEventListener("pointerdown",l=>{t.setPointerCapture(l.pointerId),t.focus(),s(l)}),t.addEventListener("pointermove",l=>{t.hasPointerCapture(l.pointerId)&&s(l)}),t.addEventListener("keydown",l=>{let i=l.shiftKey?10:1,u={ArrowRight:i,ArrowUp:i,ArrowLeft:-i,ArrowDown:-i,PageUp:10,PageDown:-10,Home:-1/0,End:1/0};l.key in u&&(l.preventDefault(),r(u[l.key]))})}function Bt(t,e,o,n,a){let r=Array.from({length:a},(l,i)=>F({...o,[e.key]:e.fromValue(i/(a-1)*e.max)},{hue:n}));t.style.background=`linear-gradient(90deg, ${r.map(_).join(", ")})`;let s=e.toValue(o[e.key]);return t.style.setProperty("--x",s/e.max),t.setAttribute("aria-valuenow",s.toFixed(1)),t.setAttribute("aria-valuetext",`${xa(e,s)}${e.unit}`),r}var va=64,wa=(t,e,o)=>Math.min(o,Math.max(e,t));function Go({onChange:t}){let e=document.createElement("div");e.className="box hsl-sliders",e.innerHTML=`
    <div class="sliders">
      ${ht.map(s=>`
        <div class="slider" data-axis="${s.key}" tabindex="0" role="slider" aria-label="${s.label}"
          aria-valuemin="0" aria-valuemax="${s.max}">
          <span class="slider-name" aria-hidden="true">${s.name}</span>
          <span class="marker" aria-hidden="true"></span>
        </div>`).join("")}
    </div>
    <div class="values">
      ${ht.map(s=>`
        <label class="value" data-axis="${s.key}">
          <span class="value-name">${s.key==="l"?'<span class="tight">L</span>*':s.name}</span>
          <span class="value-number">${s.unit}</span>
        </label>`).join("")}
    </div>`;let o={h:0,s:0,l:0},n=(s,l)=>t({[s.key]:s.fromValue(wa(l,0,s.max))}),a=s=>s.toValue(o[s.key]),r=ht.map(s=>({axis:s,slider:e.querySelector(`.slider[data-axis="${s.key}"]`),field:dt({label:s.label,valueOf:()=>a(s),set:l=>n(s,l),wrap:s.key==="h"?360:0})}));for(let{axis:s,field:l}of r)e.querySelector(`.value[data-axis="${s.key}"] .value-number`).prepend(l.input);for(let{axis:s,slider:l}of r)Ft(l,s,{valueOf:()=>a(s),set:t});return{element:e,update({coords:s,primary:l,background:i,mode:u}){o=s;let d=h=>D(h).l,c={background:d(i),primary:d(l)};for(let{axis:h,slider:f,field:m}of r){let p=Bt(f,h,o,u,va),S=d(p[0]);f.dataset.name=Math.abs(S-c.background)>Math.abs(S-c.primary)?"background":"primary",m.update()}}}}var Nt=Promise.resolve(`// HSL* 0.2.1
// A simple color space built on sRGB with perceptual lightness and perceptually spaced hue.
// https://github.com/domizai/hsl-star
// License: MIT
//
// GLSL ES 3.00 (WebGL2), also GLSL 1.30 and later on the desktop. Paste it
// after #version and the precision line; it needs highp floats. On
// Shadertoy, paste it into the Common tab.
//
// Coordinates, as vec3(h, l, s):
//   h  hue in degrees [0, 360). By default the axis is re-spaced so equal
//      steps are equal steps of OKLab hue (0 = red). With HSL_STAR_HSV it is
//      the HSV hue of the pure color on the edge of the RGB cube.
//   l  perceived lightness as CIE L* [0, 100]. Every color with the same l
//      has the same luminance, so it converts to the same grey.
//   s  saturation [0, 1]. 1 is the most vivid color of that hue and
//      lightness inside sRGB, 0 is the grey of the same lightness.
//
// The same construction as hsl-star.js, which stays the reference. The
// OKLab hue axis comes from a table generated from it (scripts/sync.js);
// results stay within a third of an 8-bit step of the library's.

const int HSL_STAR_OKLAB = 0;
const int HSL_STAR_HSV = 1;

const vec3 HSL_STAR_WEIGHTS = vec3(0.2126, 0.7152, 0.0722);

// --- sRGB transfer function and lightness -------------------------------------

vec3 hslStarDecode(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}

vec3 hslStarEncode(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(12.92 * c, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

float hslStarYFromLstar(float l) {
  float t = (l + 16.0) / 116.0;
  return l > 8.0 ? t * t * t : l * (27.0 / 24389.0);
}

float hslStarLstarFromY(float y) {
  return y > 216.0 / 24389.0 ? 116.0 * pow(y, 1.0 / 3.0) - 16.0 : y * (24389.0 / 27.0);
}

// --- Hue ----------------------------------------------------------------------

// Pure color of an HSV hue (S = V = 1), gamma-encoded.
vec3 hslStarPureHue(float h) {
  return clamp(abs(mod(h / 60.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
}

// HSV hue of a gamma-encoded color whose smallest channel is 0 and largest 1.
float hslStarHsvHueOf(vec3 c) {
  float h;
  if (c.r >= c.g && c.r >= c.b) h = c.g - c.b;
  else if (c.g >= c.b) h = c.b - c.r + 2.0;
  else h = c.r - c.g + 4.0;
  return mod(h * 60.0, 360.0);
}

// BEGIN TABLES (generated by scripts/sync.js, don't edit)
const int HSL_STAR_TABLE_STEPS = 1024;

// HSV hue at every step of the HSL* (OKLab) hue.
const float HSL_STAR_TO_HSV_HUE[1025] = float[](
  0.0000, 1.4390, 2.8780, 4.3171, 5.7556, 7.0467, 8.1400, 9.1001,
  9.9623, 10.7495, 11.4766, 12.1542, 12.7903, 13.3908, 13.9603, 14.5029,
  15.0214, 15.5185, 15.9963, 16.4565, 16.9010, 17.3306, 17.7469, 18.1507,
  18.5431, 18.9247, 19.2965, 19.6587, 20.0123, 20.3576, 20.6953, 21.0255,
  21.3489, 21.6657, 21.9764, 22.2811, 22.5802, 22.8740, 23.1627, 23.4465,
  23.7257, 24.0006, 24.2710, 24.5375, 24.8001, 25.0588, 25.3140, 25.5658,
  25.8142, 26.0594, 26.3016, 26.5408, 26.7771, 27.0107, 27.2416, 27.4700,
  27.6959, 27.9194, 28.1406, 28.3595, 28.5763, 28.7911, 29.0038, 29.2145,
  29.4234, 29.6304, 29.8357, 30.0392, 30.2412, 30.4415, 30.6402, 30.8374,
  31.0332, 31.2276, 31.4206, 31.6123, 31.8027, 31.9919, 32.1798, 32.3666,
  32.5522, 32.7368, 32.9203, 33.1028, 33.2843, 33.4649, 33.6445, 33.8232,
  34.0011, 34.1781, 34.3543, 34.5297, 34.7044, 34.8783, 35.0516, 35.2242,
  35.3961, 35.5674, 35.7381, 35.9083, 36.0779, 36.2469, 36.4155, 36.5836,
  36.7512, 36.9184, 37.0851, 37.2515, 37.4175, 37.5831, 37.7484, 37.9134,
  38.0780, 38.2424, 38.4066, 38.5705, 38.7342, 38.8977, 39.0610, 39.2242,
  39.3872, 39.5501, 39.7129, 39.8756, 40.0382, 40.2008, 40.3633, 40.5258,
  40.6883, 40.8509, 41.0135, 41.1761, 41.3388, 41.5016, 41.6645, 41.8276,
  41.9907, 42.1541, 42.3176, 42.4813, 42.6453, 42.8094, 42.9739, 43.1386,
  43.3035, 43.4688, 43.6344, 43.8004, 43.9667, 44.1334, 44.3005, 44.4681,
  44.6360, 44.8045, 44.9734, 45.1428, 45.3127, 45.4832, 45.6543, 45.8259,
  45.9981, 46.1709, 46.3444, 46.5186, 46.6935, 46.8691, 47.0454, 47.2224,
  47.4003, 47.5790, 47.7585, 47.9389, 48.1201, 48.3023, 48.4854, 48.6695,
  48.8546, 49.0407, 49.2278, 49.4160, 49.6054, 49.7958, 49.9875, 50.1803,
  50.3744, 50.5698, 50.7664, 50.9644, 51.1638, 51.3646, 51.5668, 51.7705,
  51.9757, 52.1825, 52.3909, 52.6009, 52.8127, 53.0261, 53.2414, 53.4585,
  53.6774, 53.8982, 54.1211, 54.3460, 54.5729, 54.8019, 55.0333, 55.2668,
  55.5026, 55.7408, 55.9814, 56.2246, 56.4703, 56.7186, 56.9697, 57.2236,
  57.4803, 57.7400, 58.0026, 58.2685, 58.5375, 58.8097, 59.0854, 59.3647,
  59.6474, 59.9339, 60.2233, 60.5141, 60.8061, 61.0995, 61.3942, 61.6903,
  61.9879, 62.2870, 62.5876, 62.8898, 63.1938, 63.4994, 63.8068, 64.1161,
  64.4272, 64.7404, 65.0555, 65.3727, 65.6921, 66.0137, 66.3377, 66.6640,
  66.9927, 67.3240, 67.6579, 67.9945, 68.3339, 68.6762, 69.0215, 69.3698,
  69.7213, 70.0762, 70.4344, 70.7961, 71.1615, 71.5306, 71.9036, 72.2806,
  72.6618, 73.0474, 73.4374, 73.8321, 74.2316, 74.6361, 75.0458, 75.4609,
  75.8816, 76.3082, 76.7409, 77.1799, 77.6255, 78.0780, 78.5377, 79.0049,
  79.4800, 79.9634, 80.4554, 80.9564, 81.4670, 81.9876, 82.5188, 83.0611,
  83.6152, 84.1818, 84.7616, 85.3555, 85.9644, 86.5892, 87.2312, 87.8916,
  88.5718, 89.2733, 89.9980, 90.7481, 91.5257, 92.3338, 93.1755, 94.0547,
  94.9759, 95.9449, 96.9683, 98.0551, 99.2164, 100.4672, 101.8279, 103.2661,
  104.7051, 106.1441, 107.5832, 109.0222, 110.4612, 111.9002, 113.3393, 114.7783,
  116.2173, 117.6563, 119.0954, 120.5344, 121.9734, 123.4124, 124.8514, 126.2905,
  127.7295, 129.1685, 130.6075, 132.0466, 133.4856, 134.9238, 136.2706, 137.4886,
  138.6049, 139.6380, 140.6019, 141.5068, 142.3607, 143.1700, 143.9398, 144.6745,
  145.3775, 146.0519, 146.7003, 147.3248, 147.9273, 148.5096, 149.0731, 149.6192,
  150.1490, 150.6636, 151.1639, 151.6508, 152.1252, 152.5876, 153.0387, 153.4791,
  153.9095, 154.3302, 154.7418, 155.1447, 155.5393, 155.9260, 156.3051, 156.6770,
  157.0419, 157.4002, 157.7520, 158.0978, 158.4376, 158.7718, 159.1006, 159.4241,
  159.7426, 160.0561, 160.3650, 160.6694, 160.9694, 161.2651, 161.5568, 161.8445,
  162.1284, 162.4086, 162.6852, 162.9583, 163.2280, 163.4946, 163.7579, 164.0182,
  164.2755, 164.5299, 164.7815, 165.0304, 165.2767, 165.5204, 165.7615, 166.0004,
  166.2368, 166.4709, 166.7029, 166.9326, 167.1602, 167.3859, 167.6095, 167.8312,
  168.0510, 168.2689, 168.4852, 168.6996, 168.9124, 169.1235, 169.3330, 169.5409,
  169.7474, 169.9523, 170.1559, 170.3580, 170.5588, 170.7582, 170.9564, 171.1532,
  171.3489, 171.5434, 171.7367, 171.9289, 172.1200, 172.3101, 172.4991, 172.6871,
  172.8741, 173.0601, 173.2453, 173.4295, 173.6129, 173.7954, 173.9771, 174.1580,
  174.3381, 174.5175, 174.6961, 174.8740, 175.0513, 175.2279, 175.4039, 175.5792,
  175.7539, 175.9281, 176.1017, 176.2748, 176.4474, 176.6194, 176.7910, 176.9622,
  177.1329, 177.3032, 177.4730, 177.6425, 177.8117, 177.9804, 178.1489, 178.3171,
  178.4849, 178.6525, 178.8198, 178.9869, 179.1537, 179.3204, 179.4868, 179.6531,
  179.8192, 179.9852, 180.1507, 180.3152, 180.4788, 180.6414, 180.8032, 180.9641,
  181.1241, 181.2833, 181.4417, 181.5993, 181.7561, 181.9123, 182.0676, 182.2223,
  182.3762, 182.5296, 182.6822, 182.8342, 182.9857, 183.1365, 183.2868, 183.4365,
  183.5856, 183.7343, 183.8824, 184.0301, 184.1773, 184.3240, 184.4703, 184.6162,
  184.7616, 184.9067, 185.0514, 185.1958, 185.3398, 185.4834, 185.6268, 185.7698,
  185.9126, 186.0551, 186.1974, 186.3394, 186.4812, 186.6228, 186.7642, 186.9054,
  187.0464, 187.1873, 187.3280, 187.4687, 187.6092, 187.7496, 187.8899, 188.0302,
  188.1704, 188.3105, 188.4507, 188.5908, 188.7309, 188.8710, 189.0112, 189.1514,
  189.2917, 189.4320, 189.5724, 189.7129, 189.8536, 189.9943, 190.1353, 190.2763,
  190.4175, 190.5590, 190.7006, 190.8424, 190.9845, 191.1268, 191.2694, 191.4123,
  191.5555, 191.6989, 191.8427, 191.9869, 192.1314, 192.2762, 192.4215, 192.5672,
  192.7133, 192.8599, 193.0069, 193.1544, 193.3024, 193.4510, 193.6000, 193.7497,
  193.8998, 194.0507, 194.2021, 194.3542, 194.5069, 194.6603, 194.8145, 194.9693,
  195.1249, 195.2813, 195.4385, 195.5965, 195.7555, 195.9152, 196.0759, 196.2375,
  196.4000, 196.5636, 196.7282, 196.8938, 197.0606, 197.2284, 197.3974, 197.5676,
  197.7390, 197.9117, 198.0857, 198.2610, 198.4377, 198.6158, 198.7953, 198.9764,
  199.1591, 199.3433, 199.5292, 199.7168, 199.9061, 200.0973, 200.2904, 200.4853,
  200.6823, 200.8814, 201.0825, 201.2859, 201.4915, 201.6995, 201.9100, 202.1230,
  202.3386, 202.5568, 202.7779, 203.0019, 203.2290, 203.4591, 203.6925, 203.9294,
  204.1697, 204.4137, 204.6616, 204.9134, 205.1694, 205.4298, 205.6947, 205.9644,
  206.2391, 206.5190, 206.8044, 207.0957, 207.3931, 207.6969, 208.0076, 208.3255,
  208.6511, 208.9848, 209.3273, 209.6790, 210.0407, 210.4131, 210.7970, 211.1934,
  211.6035, 212.0284, 212.4695, 212.9286, 213.4074, 213.9086, 214.4349, 214.9897,
  215.5773, 216.2032, 216.8746, 217.6008, 218.3954, 219.2776, 220.2776, 221.4469,
  222.8426, 224.2816, 225.7207, 227.1597, 228.5987, 230.0377, 231.4768, 232.9158,
  234.3548, 235.7938, 237.2328, 238.6719, 240.0986, 241.3839, 242.6693, 243.7451,
  244.6369, 245.4136, 246.1098, 246.7459, 247.3356, 247.8878, 248.4089, 248.9040,
  249.3767, 249.8302, 250.2668, 250.6886, 251.0971, 251.4937, 251.8796, 252.2559,
  252.6234, 252.9828, 253.3348, 253.6801, 254.0191, 254.3523, 254.6801, 255.0031,
  255.3213, 255.6352, 255.9451, 256.2513, 256.5539, 256.8533, 257.1495, 257.4429,
  257.7335, 258.0216, 258.3073, 258.5908, 258.8721, 259.1514, 259.4288, 259.7046,
  259.9786, 260.2511, 260.5221, 260.7918, 261.0602, 261.3275, 261.5936, 261.8586,
  262.1227, 262.3859, 262.6483, 262.9098, 263.1707, 263.4309, 263.6906, 263.9496,
  264.2082, 264.4664, 264.7241, 264.9815, 265.2387, 265.4955, 265.7521, 266.0086,
  266.2650, 266.5212, 266.7774, 267.0336, 267.2898, 267.5460, 267.8024, 268.0589,
  268.3155, 268.5723, 268.8293, 269.0866, 269.3442, 269.6021, 269.8604, 270.1190,
  270.3780, 270.6374, 270.8973, 271.1577, 271.4186, 271.6800, 271.9420, 272.2046,
  272.4677, 272.7316, 272.9961, 273.2612, 273.5271, 273.7937, 274.0611, 274.3293,
  274.5982, 274.8680, 275.1387, 275.4102, 275.6826, 275.9559, 276.2301, 276.5053,
  276.7815, 277.0587, 277.3370, 277.6162, 277.8965, 278.1779, 278.4605, 278.7441,
  279.0289, 279.3148, 279.6019, 279.8903, 280.1799, 280.4707, 280.7627, 281.0561,
  281.3507, 281.6467, 281.9441, 282.2427, 282.5428, 282.8443, 283.1471, 283.4515,
  283.7572, 284.0645, 284.3732, 284.6835, 284.9952, 285.3086, 285.6235, 285.9400,
  286.2581, 286.5778, 286.8991, 287.2222, 287.5469, 287.8733, 288.2014, 288.5313,
  288.8629, 289.1963, 289.5315, 289.8685, 290.2073, 290.5480, 290.8905, 291.2350,
  291.5814, 291.9297, 292.2799, 292.6322, 292.9864, 293.3426, 293.7009, 294.0612,
  294.4236, 294.7881, 295.1547, 295.5235, 295.8944, 296.2676, 296.6429, 297.0204,
  297.4002, 297.7824, 298.1668, 298.5535, 298.9426, 299.3341, 299.7280, 300.1240,
  300.5188, 300.9110, 301.3009, 301.6882, 302.0732, 302.4558, 302.8360, 303.2140,
  303.5896, 303.9630, 304.3341, 304.7031, 305.0698, 305.4344, 305.7968, 306.1571,
  306.5154, 306.8715, 307.2257, 307.5778, 307.9279, 308.2761, 308.6223, 308.9667,
  309.3091, 309.6497, 309.9884, 310.3253, 310.6604, 310.9938, 311.3254, 311.6552,
  311.9834, 312.3099, 312.6348, 312.9580, 313.2797, 313.5997, 313.9182, 314.2352,
  314.5506, 314.8646, 315.1771, 315.4882, 315.7979, 316.1061, 316.4130, 316.7186,
  317.0228, 317.3258, 317.6274, 317.9279, 318.2271, 318.5251, 318.8219, 319.1176,
  319.4121, 319.7055, 319.9979, 320.2892, 320.5795, 320.8687, 321.1570, 321.4443,
  321.7307, 322.0162, 322.3008, 322.5846, 322.8675, 323.1496, 323.4309, 323.7115,
  323.9913, 324.2704, 324.5489, 324.8267, 325.1039, 325.3804, 325.6565, 325.9319,
  326.2069, 326.4814, 326.7554, 327.0290, 327.3022, 327.5751, 327.8476, 328.1198,
  328.3917, 328.6634, 328.9349, 329.2062, 329.4774, 329.7485, 330.0195, 330.2904,
  330.5614, 330.8324, 331.1034, 331.3746, 331.6460, 331.9175, 332.1893, 332.4614,
  332.7338, 333.0066, 333.2797, 333.5534, 333.8276, 334.1024, 334.3777, 334.6538,
  334.9306, 335.2082, 335.4867, 335.7661, 336.0465, 336.3280, 336.6106, 336.8944,
  337.1796, 337.4661, 337.7541, 338.0436, 338.3349, 338.6278, 338.9227, 339.2196,
  339.5185, 339.8197, 340.1233, 340.4295, 340.7383, 341.0499, 341.3646, 341.6826,
  342.0039, 342.3290, 342.6579, 342.9910, 343.3286, 343.6709, 344.0183, 344.3713,
  344.7302, 345.0954, 345.4675, 345.8472, 346.2349, 346.6315, 347.0379, 347.4549,
  347.8836, 348.3255, 348.7820, 349.2551, 349.7467, 350.2597, 350.7973, 351.3642,
  351.9655, 352.6089, 353.3048, 354.0689, 354.9251, 355.9155, 357.1267, 358.5610,
  360.0000
);
// END TABLES

// The table steps evenly through the HSL* hue and gives the HSV hue,
// unwrapped, so neighbouring entries can be interpolated. Both directions
// read the same table, so they undo each other exactly: forwards by index,
// backwards by a binary search.
float hslStarToHsvHue(float h) {
  float x = mod(h, 360.0) * (float(HSL_STAR_TABLE_STEPS) / 360.0);
  int i = min(int(x), HSL_STAR_TABLE_STEPS - 1);
  return mod(mix(HSL_STAR_TO_HSV_HUE[i], HSL_STAR_TO_HSV_HUE[i + 1], x - float(i)), 360.0);
}

float hslStarFromHsvHue(float hsv) {
  hsv = mod(hsv, 360.0);
  int lo = 0;
  int hi = HSL_STAR_TABLE_STEPS;
  while (hi - lo > 1) {
    int mid = (lo + hi) / 2;
    if (HSL_STAR_TO_HSV_HUE[mid] <= hsv) lo = mid;
    else hi = mid;
  }
  float t = (hsv - HSL_STAR_TO_HSV_HUE[lo]) / (HSL_STAR_TO_HSV_HUE[hi] - HSL_STAR_TO_HSV_HUE[lo]);
  return mod((float(lo) + t) * (360.0 / float(HSL_STAR_TABLE_STEPS)), 360.0);
}

// --- Forward and inverse ------------------------------------------------------

// Linear-light sRGB, channels in [0, 1].
vec3 hslStarToLinear(vec3 hls, int hueAxis) {
  float hsv = hueAxis == HSL_STAR_HSV ? mod(hls.x, 360.0) : hslStarToHsvHue(hls.x);
  vec3 pure = hslStarDecode(hslStarPureHue(hsv));
  float yPure = dot(pure, HSL_STAR_WEIGHTS);
  float y = hslStarYFromLstar(clamp(hls.y, 0.0, 100.0));
  float s = clamp(hls.z, 0.0, 1.0);
  // Vivid color = a * pure + b (shade if b = 0, tint otherwise).
  float a = y <= yPure ? y / yPure : (1.0 - y) / (1.0 - yPure);
  float b = y <= yPure ? 0.0 : 1.0 - a;
  return clamp(s * a * pure + (s * b + (1.0 - s) * y), 0.0, 1.0);
}

vec3 hslStarFromLinear(vec3 rgb, int hueAxis) {
  float y = dot(rgb, HSL_STAR_WEIGHTS);
  float l = clamp(hslStarLstarFromY(y), 0.0, 100.0);
  float top = max(rgb.r, max(rgb.g, rgb.b));
  float bottom = min(rgb.r, min(rgb.g, rgb.b));
  float range = top - bottom;
  if (range < 1e-6) return vec3(0.0, l, 0.0);

  // Mixing with grey and scaling keep the normalised linear channels equal
  // to the pure color's, so normalising recovers it exactly.
  float hsv = hslStarHsvHueOf(hslStarEncode((rgb - bottom) / range));
  float yPure = dot(hslStarDecode(hslStarPureHue(hsv)), HSL_STAR_WEIGHTS);
  float vividRange = y <= yPure ? y / yPure : (1.0 - y) / (1.0 - yPure);
  float s = vividRange > 0.0 ? clamp(range / vividRange, 0.0, 1.0) : 0.0;
  return vec3(hueAxis == HSL_STAR_HSV ? hsv : hslStarFromHsvHue(hsv), l, s);
}

// Gamma-encoded sRGB, channels in [0, 1].
vec3 hslStarToSrgb(vec3 hls, int hueAxis) {
  return hslStarEncode(hslStarToLinear(hls, hueAxis));
}

vec3 hslStarFromSrgb(vec3 rgb, int hueAxis) {
  return hslStarFromLinear(hslStarDecode(rgb), hueAxis);
}

// The same on the default OKLab hue axis.
vec3 hslStarToLinear(vec3 hls) { return hslStarToLinear(hls, HSL_STAR_OKLAB); }
vec3 hslStarFromLinear(vec3 rgb) { return hslStarFromLinear(rgb, HSL_STAR_OKLAB); }
vec3 hslStarToSrgb(vec3 hls) { return hslStarToSrgb(hls, HSL_STAR_OKLAB); }
vec3 hslStarFromSrgb(vec3 rgb) { return hslStarFromSrgb(rgb, HSL_STAR_OKLAB); }
`);function ee({h:t,s:e,l:o}){let n=r=>(r+(t%360+360)%360/30)%12,a=e*Math.min(o,1-o);return[0,8,4].map(r=>o-a*Math.max(-1,Math.min(n(r)-3,9-n(r),1)))}function zo([t,e,o]){let n=Math.max(t,e,o),a=Math.min(t,e,o),r=(n+a)/2,s=n-a;if(s===0)return{h:0,s:0,l:r};let l=s/(1-Math.abs(2*r-1)),i;return n===t?i=(e-o)/s%6:n===e?i=(o-t)/s+2:i=(t-e)/s+4,{h:(i*60+360)%360,s:Math.min(1,l),l:r}}var oe={disc:0,square:1,field:2,hsl:3},La=`#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`,Ea=t=>`#version 300 es
precision highp float;
precision highp int;
${t}
uniform vec2 uSize;
uniform int uKind;
uniform int uAxis;
uniform float uL;
uniform float uH;
uniform float uS;
uniform bool uGrey;
out vec4 color;
vec3 hslToSrgb(float h, float s, float l) {
  vec3 k = mod(vec3(0.0, 8.0, 4.0) + h / 30.0, 12.0);
  return l - s * min(l, 1.0 - l) * clamp(min(k - 3.0, 9.0 - k), -1.0, 1.0);
}
void main() {
  vec2 p = gl_FragCoord.xy;
  // The top row is lightness 100, the bottom row 0.
  float up = (p.y - 0.5) / (uSize.y - 1.0);
  float hue = p.x / uSize.x * 360.0;
  vec3 srgb;
  float alpha = 1.0;
  if (uKind == 0) {
    float radius = uSize.x / 2.0;
    vec2 d = (p - uSize / 2.0) / radius;
    alpha = clamp((1.0 - length(d)) * radius + 0.5, 0.0, 1.0);
    float h = mod(degrees(atan(d.y, d.x)) + 360.0, 360.0);
    srgb = hslStarToSrgb(vec3(h, uL, min(length(d), 1.0)), uAxis);
  } else if (uKind == 1) {
    vec2 at = p / uSize;
    srgb = hslStarToSrgb(vec3(uH, 100.0 * at.y, at.x), uAxis);
  } else if (uKind == 2) {
    srgb = hslStarToSrgb(vec3(hue, 100.0 * up, uS), uAxis);
  } else {
    srgb = hslToSrgb(hue, uS, up);
  }
  if (uGrey) srgb = hslStarEncode(vec3(dot(hslStarDecode(srgb), HSL_STAR_WEIGHTS)));
  color = vec4(srgb * alpha, alpha);
}`;function Aa(t,e,o,{l:n,h:a,s:r,mode:s,grey:l}){let i;if(t===oe.disc){let[u,d]=[e*2-1,o*2-1],c=Math.hypot(u,d);if(c>1)return[0,0,0,0];let h=(Math.atan2(d,u)*180/Math.PI+360)%360;i=F({h,l:n,s:c},{hue:s})}else t===oe.square?i=F({h:a,l:100*o,s:e},{hue:s}):t===oe.field?i=F({h:e*360,l:100*o,s:r},{hue:s}):i=ee({h:e*360,s:r,l:o});return l&&(i=Array(3).fill(et(J(i.map(V))))),[...W(i),255]}var Yo=null;function Dt(){return Yo??(Yo=Ma()),Yo}function Ma(){let t=null,e=null,o=Nt.then(r=>{({gl:t,draw:e}=ka(r))}).catch(r=>console.warn("Painting the color fields in JS:",r.message));function n(r,s,l){let i=Math.max(1,Math.round(r.width/4)),u=Math.max(1,Math.round(r.height/4)),d=new ImageData(i,u);for(let f=0;f<u;f++)for(let m=0;m<i;m++)d.data.set(Aa(s,(m+.5)/i,1-(f+.5)/u,l),(f*i+m)*4);let c=new OffscreenCanvas(i,u);c.getContext("2d").putImageData(d,0,0);let h=r.getContext("2d");h.clearRect(0,0,r.width,r.height),h.drawImage(c,0,0,r.width,r.height)}function a(r,s,l){if(!e||t.isContextLost())return n(r,oe[s],l);e(r,oe[s],l)}return{ready:o,paint:a}}function ka(t){let e=document.createElement("canvas"),o=e.getContext("webgl2",{antialias:!1,depth:!1,preserveDrawingBuffer:!0});if(!o)throw new Error("no WebGL2");let n=(i,u)=>{let d=o.createShader(i);if(o.shaderSource(d,u),o.compileShader(d),!o.getShaderParameter(d,o.COMPILE_STATUS))throw new Error(o.getShaderInfoLog(d));return d},a=o.createProgram();if(o.attachShader(a,n(o.VERTEX_SHADER,La)),o.attachShader(a,n(o.FRAGMENT_SHADER,Ea(t))),o.linkProgram(a),!o.getProgramParameter(a,o.LINK_STATUS))throw new Error(o.getProgramInfoLog(a));o.useProgram(a);let r=Object.fromEntries(["uSize","uKind","uAxis","uL","uH","uS","uGrey"].map(i=>[i,o.getUniformLocation(a,i)]));o.bindBuffer(o.ARRAY_BUFFER,o.createBuffer()),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),o.STATIC_DRAW);let s=o.getAttribLocation(a,"aPos");o.enableVertexAttribArray(s),o.vertexAttribPointer(s,2,o.FLOAT,!1,0,0);function l(i,u,{l:d=0,h:c=0,s:h=0,mode:f,grey:m=!1}){let{width:p,height:S}=i;(e.width!==p||e.height!==S)&&(e.width=p,e.height=S),o.viewport(0,0,p,S),o.uniform2f(r.uSize,p,S),o.uniform1i(r.uKind,u),o.uniform1i(r.uAxis,f==="hsv"?1:0),o.uniform1f(r.uL,d),o.uniform1f(r.uH,c),o.uniform1f(r.uS,h),o.uniform1i(r.uGrey,m?1:0),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),o.drawArrays(o.TRIANGLES,0,3);let x=i.getContext("2d");x.clearRect(0,0,p,S),x.drawImage(e,0,0)}return{gl:o,draw:l}}async function rt(t){try{return await navigator.clipboard.writeText(t),!0}catch{let e=document.createElement("textarea");e.value=t,e.readOnly=!0,e.style.position="fixed",e.style.top="0",e.style.left="0",e.style.fontSize="16px",e.style.opacity="0",document.body.appendChild(e),e.select(),e.setSelectionRange(0,t.length);let o=!1;try{o=document.execCommand("copy")}catch{o=!1}return e.remove(),o}}var Ca='<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 9H18V18H9V9Z"/><path d="M6 16V6H16"/></svg>',ne=(t,e,o)=>Math.min(o,Math.max(e,t)),Wo=t=>(t%360+360)%360;function Xo({onChange:t}){let e=document.createElement("div");e.className="box color-fields",e.innerHTML=`
    <div class="field-swatch">
      <button type="button" class="copy" aria-label="Copy hex code">
        <span class="copy-text"></span>${Ca}
      </button>
    </div>
    <div class="field disc" tabindex="0" role="slider"
      aria-label="Hue and saturation. Left and right change the hue, up and down the saturation.">
      <canvas aria-hidden="true"></canvas>
      <span class="field-name"></span>
      <span class="marker" aria-hidden="true"></span>
    </div>
    <div class="field square" tabindex="0" role="slider"
      aria-label="Saturation and lightness. Left and right change the saturation, up and down the lightness.">
      <canvas aria-hidden="true"></canvas>
      <span class="field-name"></span>
      <span class="marker" aria-hidden="true"></span>
    </div>`;let[o,n]=e.querySelectorAll(".field"),a=e.querySelector(".copy"),r=e.querySelector(".copy-text"),s=Dt(),l={coords:{h:0,s:0,l:0},hex:"#000000",mode:"oklab"},i={disc:"",square:""},u=0,d=()=>{r.textContent=l.hex.toUpperCase()},c=x=>{r.textContent=x,clearTimeout(u),u=setTimeout(()=>{u=0,d()},1200)};a.addEventListener("click",async()=>{c(await rt(l.hex.toUpperCase())?"Copied":"Copy failed")});let h=(x,T)=>{let A=x.getBoundingClientRect();return[(T.clientX-A.left)/A.width,1-(T.clientY-A.top)/A.height]},f={disc([x,T]){let[A,w]=[x*2-1,T*2-1],C=Math.min(1,Math.hypot(A,w));return C>.001?{h:Wo(Math.atan2(w,A)*180/Math.PI),s:C}:{s:C}},square:([x,T])=>({s:ne(x,0,1),l:ne(T*100,0,100)})},m={disc:(x,T,{h:A,s:w})=>({h:Wo(A+x),s:ne(w+T/100,0,1)}),square:(x,T,{s:A,l:w})=>({s:ne(A+x/100,0,1),l:ne(w+T,0,100)})};for(let[x,T]of[[o,"disc"],[n,"square"]])x.addEventListener("pointerdown",A=>{x.setPointerCapture(A.pointerId),x.focus(),t(f[T](h(x,A)))}),x.addEventListener("pointermove",A=>{x.hasPointerCapture(A.pointerId)&&t(f[T](h(x,A)))}),x.addEventListener("keydown",A=>{let w=A.shiftKey?10:1,C={ArrowRight:[w,0],ArrowLeft:[-w,0],ArrowUp:[0,w],ArrowDown:[0,-w]};A.key in C&&(A.preventDefault(),t(m[T](...C[A.key],l.coords)))});function p(x){let T=Math.min(window.devicePixelRatio||1,2),A=Math.round(x.clientWidth*T),w=Math.round(x.clientHeight*T);return x.width===A&&x.height===w?!1:(x.width=A,x.height=w,!0)}function S(x=!1){let{coords:T,mode:A}=l;for(let[w,C,b,M]of[[o,"disc",`${T.l}|${A}`,{l:T.l,mode:A}],[n,"square",`${T.h}|${A}`,{h:T.h,mode:A}]]){let v=w.querySelector("canvas"),y=p(v);!v.width||!x&&!y&&i[C]===b||(s.paint(v,C,M),i[C]=b)}}return s.ready.then(()=>S(!0)),new ResizeObserver(()=>S()).observe(o),{element:e,update({coords:x,rgb:T,primary:A,background:w,mode:C}){l={coords:x,hex:_(T),mode:C},u||d(),S();let{h:b,s:M,l:v}=x,y=b*Math.PI/180;o.style.setProperty("--x",.5+M/2*Math.cos(y)),o.style.setProperty("--y",.5-M/2*Math.sin(y)),n.style.setProperty("--x",M),n.style.setProperty("--y",1-v/100),o.querySelector(".field-name").textContent=`L*${Math.round(v)}`,n.querySelector(".field-name").textContent=`H${Math.round(b)%360}\xB0`,o.setAttribute("aria-valuetext",`Hue ${Math.round(b)%360}\xB0, saturation ${Math.round(M*100)}%`),n.setAttribute("aria-valuetext",`Saturation ${Math.round(M*100)}%, lightness ${Math.round(v)}`);let E=L=>D(L).l,g=E(F({h:b,l:95,s:.05},{hue:C}));n.dataset.name=Math.abs(g-E(w))>Math.abs(g-E(A))?"background":"primary"}}}var Ta=`<svg class="checkbox-box" viewBox="0 0 16.5 16.5" aria-hidden="true">
  <path class="checkbox-frame" d="M0.75 0.75H15.75V15.75H0.75V0.75Z"/>
  <path class="checkbox-tick" d="M3.75 8.75L6.75 11.75L13.25 5.25"/></svg>`,at=(t,e)=>`<label class="checkbox"><input type="checkbox" data-option="${t}">${Ta}<span>${e}</span></label>`;var Ha=[["pureHues","Show pure hues"],["hueSpacing","Show hue spacing"],["lightnessOnly","Show lightness only"]],Ra=[60,120,180,240,300],pt=(t,e,o)=>Math.min(o,Math.max(e,t)),Se=t=>(t%360+360)%360,Ko={"hsl-star":[{key:"h",name:"H",label:"Hue",unit:"\xB0",wrap:360,get:({coords:t})=>t.h,put:t=>({h:Se(t)})},{key:"s",name:"S",label:"Saturation",unit:"%",get:({coords:t})=>t.s*100,put:t=>({s:pt(t,0,100)/100})},{key:"l",name:"L*",label:"Lightness",unit:"",get:({coords:t})=>t.l,put:t=>({l:pt(t,0,100)})}],hsl:[{key:"h",name:"H",label:"HSL hue",unit:"\xB0",wrap:360,get:({hsl:t})=>t.h,put:t=>({h:Se(t)})},{key:"s",name:"S",label:"HSL saturation",unit:"%",get:({hsl:t})=>t.s*100,put:t=>({s:pt(t,0,100)/100})},{key:"l",name:"L",label:"HSL lightness",unit:"%",get:({hsl:t})=>t.l*100,put:t=>({l:pt(t,0,100)/100})}]};function Zo({onCoords:t,onRgb:e,onMode:o,onOptions:n}){let a=document.createElement("div");a.className="large-picker",a.innerHTML=`
    <div class="space-toggle" role="group" aria-label="Color space">
      <button type="button" class="toggle-big" data-space="hsl-star">HSL*</button>
      <button type="button" class="toggle-big" data-space="hsl">HSL</button>
    </div>
    <div class="box picker-panel">
      <div class="picker-field" tabindex="0" role="slider"
        aria-label="Hue and lightness. Left and right change the hue, up and down the lightness.">
        <canvas aria-hidden="true"></canvas>
        <span class="marker" aria-hidden="true"></span>
      </div>
      <div class="picker-controls">
        ${Object.entries(Ko).map(([p,S])=>`
          <div class="small-values" data-space="${p}">
            ${S.map(x=>`
              <label class="small-value" data-key="${x.key}">
                <span class="small-value-name">${x.name==="L*"?'<span class="tight">L</span>*':x.name}</span>
                <span class="small-value-number">${x.unit}</span>
              </label>`).join("")}
          </div>`).join("")}
        <div class="hue-toggle" role="group" aria-label="Hue axis">
          <button type="button" class="toggle-small" data-mode="oklab">Oklab hue</button>
          <button type="button" class="toggle-small" data-mode="hsv">HSL hue</button>
        </div>
        <div class="picker-options">
          ${Ha.map(([p,S])=>at(p,S)).join("")}
        </div>
      </div>
    </div>`;let r=a.querySelector(".picker-field"),s=r.querySelector("canvas"),l=Dt(),i=null,u="";for(let p of a.querySelectorAll("button[data-space]"))p.addEventListener("click",()=>n({space:p.dataset.space}));for(let p of a.querySelectorAll("[data-mode]"))p.addEventListener("click",()=>o(p.dataset.mode));for(let p of a.querySelectorAll("[data-option]"))p.addEventListener("change",()=>n({[p.dataset.option]:p.checked}));let d=(p,S)=>p==="hsl"?e(ee({...i.hsl,...S})):t(S),c=Object.entries(Ko).flatMap(([p,S])=>S.map(x=>{let T=dt({label:x.label,valueOf:()=>x.get(i),set:A=>d(p,x.put(A)),wrap:x.wrap??0});return a.querySelector(`.small-values[data-space="${p}"] [data-key="${x.key}"] .small-value-number`).prepend(T.input),T}));function h([p,S]){let x=pt(p,0,1)*359.99;i.options.space==="hsl"?e(ee({h:x,s:i.hsl.s,l:pt(S,0,1)})):t({h:x,l:pt(S,0,1)*100})}let f=p=>{let S=r.getBoundingClientRect();return[(p.clientX-S.left)/S.width,1-(p.clientY-S.top)/S.height]};r.addEventListener("pointerdown",p=>{r.setPointerCapture(p.pointerId),r.focus(),h(f(p))}),r.addEventListener("pointermove",p=>{r.hasPointerCapture(p.pointerId)&&h(f(p))}),r.addEventListener("keydown",p=>{let S=p.shiftKey?10:1,x={ArrowRight:[S,0],ArrowLeft:[-S,0],ArrowUp:[0,S],ArrowDown:[0,-S]};if(!(p.key in x))return;p.preventDefault();let[T,A]=x[p.key];if(i.options.space==="hsl"){let{h:w,l:C}=i.hsl;d("hsl",{h:Se(w+T),l:pt(C+A/100,0,1)})}else{let{h:w,l:C}=i.coords;t({h:Se(w+T),l:pt(C+A,0,100)})}});function m(){if(!i)return;let p=Math.min(window.devicePixelRatio||1,2),S=Math.round(s.clientWidth*p),x=Math.round(s.clientHeight*p);if(!S||!x)return;let{coords:T,hsl:A,mode:w,options:C}=i,b=C.space==="hsl",M=b?A.s:T.s,v=[S,x,M,w,C.space,C.pureHues,C.hueSpacing,C.lightnessOnly].join();if(v===u)return;s.width=S,s.height=x,l.paint(s,b?"hsl":"field",{s:M,mode:w,grey:C.lightnessOnly}),u=v;let y=s.getContext("2d"),E=L=>(b?L:Y(L,{hue:w}))/360*S,g=L=>(1-L)*(x-1);if(C.hueSpacing){y.save(),y.strokeStyle="rgba(0, 0, 0, 0.35)",y.lineWidth=p,y.beginPath();for(let L of Ra){let H=Math.round(E(L))+.5;y.moveTo(H,0),y.lineTo(H,x)}y.stroke(),y.restore()}if(C.pureHues){y.save(),y.strokeStyle="rgba(0, 0, 0, 0.75)",y.lineWidth=1.25*p,y.lineJoin="round",y.setLineDash([5*p,4*p]),y.beginPath();for(let L=0;L<=S;L++){let H=L/S*360,k=b?.5:It(Ve(H,{hue:w}).y)/100;L?y.lineTo(L,g(k)):y.moveTo(L,g(k))}y.stroke(),y.restore()}}return l.ready.then(()=>{u="",m()}),new ResizeObserver(()=>m()).observe(r),{element:a,update({coords:p,rgb:S,mode:x,options:T}){i={coords:p,rgb:S,mode:x,options:T,hsl:zo(S)};let A=T.space==="hsl";for(let b of a.querySelectorAll("button[data-space]"))b.setAttribute("aria-pressed",String(b.dataset.space===T.space));for(let b of a.querySelectorAll("button[data-mode]"))b.setAttribute("aria-pressed",String(b.dataset.mode===x));a.querySelector(".hue-toggle").hidden=A;for(let b of a.querySelectorAll(".small-values"))b.hidden=b.dataset.space!==T.space;for(let b of a.querySelectorAll("[data-option]"))b.checked=T[b.dataset.option];for(let b of c)b.update();let[w,C]=A?[i.hsl.h/360,i.hsl.l]:[p.h/360,p.l/100];r.style.setProperty("--x",w),r.style.setProperty("--y",1-C),r.setAttribute("aria-valuetext",A?`HSL hue ${Math.round(i.hsl.h)%360}\xB0, lightness ${Math.round(i.hsl.l*100)}%`:`Hue ${Math.round(p.h)%360}\xB0, lightness ${Math.round(p.l)}`),m()}}}var Pa=.008856451679035631,_a=24389/27,$a=[[.4124564,.3575761,.1804375],[.2126729,.7151522,.072175],[.0193339,.119192,.9503041]],Ia=[.95047,1,1.08883];function ae(t){return $a.map(([e,o,n])=>e*t[0]+o*t[1]+n*t[2])}var Ye=t=>t>Pa?Math.cbrt(t):(_a*t+16)/116;function Jo([t,e,o],n=Ia){let a=Ye(t/n[0]),r=Ye(e/n[1]),s=Ye(o/n[2]);return[116*r-16,500*(a-r),200*(r-s)]}function kt(t){return Jo(ae(t))}var Mt=(t,e,o,n)=>{let a=(t-e)/(t<e?o:n);return Math.exp(-.5*a*a)},Oa=t=>1.056*Mt(t,599.8,37.9,31)+.362*Mt(t,442,16,26.7)-.065*Mt(t,501.1,20.4,26.2),Fa=t=>.821*Mt(t,568.8,46.9,40.5)+.286*Mt(t,530.9,16.3,31.1),Ba=t=>1.217*Mt(t,437,11.8,36)+.681*Mt(t,459,26,13.8),ye=[49.9755,54.6482,82.7549,91.486,93.4318,86.6823,104.865,117.008,117.812,114.861,115.923,108.811,109.354,107.802,104.79,107.689,104.405,104.046,100,96.3342,95.788,88.6856,90.0062,89.5991,87.6987,83.2886,83.6992,80.0268,80.2146,82.2778,78.2842,69.7213,71.6091,74.349,61.604,69.8856,75.087,63.5927,46.4182,66.8054,63.3828],Qo=5,We=380,re=(780-We)/Qo+1;function Na(t){let e=(t-We)/10,o=Math.min(Math.floor(e),ye.length-2);return ye[o]+(e-o)*(ye[o+1]-ye[o])}function Da(){let t=[];for(let o=0;o<re;o++){let n=We+o*Qo,a=Na(n);t.push([a*Oa(n),a*Fa(n),a*Ba(n)])}let e=t.reduce((o,n)=>o+n[1],0);return t.map(o=>o.map(n=>n/e))}var xe=null;function Xe(){if(xe)return xe;let t=Da(),e=[0,1,2].map(l=>t.reduce((i,u)=>i+u[l],0)),o=[[0,0,0]];for(let l=0;l<2*re;l++){let i=o[l],u=t[l%re];o.push([i[0]+u[0],i[1]+u[1],i[2]+u[2]])}let n=re,a=re+1,r=new Float32Array(n*a*3);for(let l=0;l<a;l++)for(let i=0;i<n;i++){let u=o[i],d=o[i+l],c=Jo([d[0]-u[0],d[1]-u[1],d[2]-u[2]],e);r.set(c,(l*n+i)*3)}let s=[];for(let l=0;l<a-1;l++)for(let i=0;i<n;i++){let u=(i+1)%n,d=l*n+i,c=l*n+u,h=(l+1)*n+i,f=(l+1)*n+u;s.push(d,c,f,d,f,h)}return xe={positions:r,indices:new Uint32Array(s),white:e},xe}function ve(t){let{positions:e,indices:o}=Xe(),n=[];for(let a of t)for(let r=0;r<o.length;r+=3){let s=[o[r],o[r+1],o[r+2]],l=[];for(let i=0;i<3;i++){let u=s[i]*3,d=s[(i+1)%3]*3,c=e[u],h=e[d];if(c<a!=h<a){let f=(a-c)/(h-c);l.push(a,e[u+1]+f*(e[d+1]-e[u+1]),e[u+2]+f*(e[d+2]-e[u+2]))}}l.length===6&&n.push(...l)}return new Float32Array(n)}function Q(t,e){let o=new Float32Array(16);for(let n=0;n<4;n++)for(let a=0;a<4;a++){let r=0;for(let s=0;s<4;s++)r+=t[s*4+a]*e[n*4+s];o[n*4+a]=r}return o}function tn(t,e,o,n){let a=1/Math.tan(t/2),r=1/(o-n);return new Float32Array([a/e,0,0,0,0,a,0,0,0,0,(n+o)*r,-1,0,0,2*n*o*r,0])}function Le(t,e,o){let n=1/(e-o);return new Float32Array([1/t,0,0,0,0,1,0,0,0,0,2*n,0,0,0,(o+e)*n,1])}function Ct(t,e,o){let n=Math.cos(t),a=Math.sin(t),r=Math.cos(e),s=Math.sin(e),l=new Float32Array([n,0,-a,0,0,1,0,0,a,0,n,0,0,0,0,1]),i=new Float32Array([1,0,0,0,0,r,s,0,0,-s,r,0,0,0,0,1]),u=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,-o,1]);return Q(u,Q(i,l))}var we=1.45;function qt(t,e,o,n=.92){let a=0;for(let s=-we;s<=we+1e-9;s+=.05){let l=Q(t,Ct(0,s,e));for(let[i,u,d]of o){let c=l[3]*i+l[7]*u+l[11]*d+l[15],h=(l[0]*i+l[4]*u+l[8]*d+l[12])/c,f=(l[1]*i+l[5]*u+l[9]*d+l[13])/c;a=Math.max(a,Math.abs(h),Math.abs(f))}}let r=n/a;return new Float32Array([r,0,0,0,0,r,0,0,0,0,1,0,0,0,0,1])}function Vt(t,e,o=72){return Array.from({length:o},(n,a)=>a/o*2*Math.PI).flatMap(n=>e.map(a=>[t*Math.cos(n),a,-t*Math.sin(n)]))}function gt(t,e,o,n,a){let r=(i,u)=>{let d=t.createShader(i);if(t.shaderSource(d,u),t.compileShader(d),!t.getShaderParameter(d,t.COMPILE_STATUS))throw new Error(t.getShaderInfoLog(d));return d},s=t.createProgram();if(t.attachShader(s,r(t.VERTEX_SHADER,e)),t.attachShader(s,r(t.FRAGMENT_SHADER,o)),t.linkProgram(s),!t.getProgramParameter(s,t.LINK_STATUS))throw new Error(t.getProgramInfoLog(s));let l={p:s};for(let i of n)l[i]=t.getAttribLocation(s,i);for(let i of a)l[i]=t.getUniformLocation(s,i);return l}function tt(t,e){let o=getComputedStyle(t).color.match(/[\d.]+/g)||["128","128","128"];return[o[0]/255,o[1]/255,o[2]/255,e]}var qa=4e3;function Ut(t,e,o,n,{spin:a=0}={}){let r=-1/0,s=()=>r=performance.now(),l=(p,S)=>{s(),e.yaw+=p,e.pitch=Math.max(-we,Math.min(we,e.pitch+S)),n()},i=null;if(t.addEventListener("pointerdown",p=>{t.setPointerCapture(p.pointerId),i={x:p.clientX,y:p.clientY},s()}),t.addEventListener("pointermove",p=>{!i||!t.hasPointerCapture(p.pointerId)||(l((p.clientX-i.x)*.008,(p.clientY-i.y)*.008),i={x:p.clientX,y:p.clientY})}),t.addEventListener("pointerup",()=>{i=null,s()}),t.addEventListener("dblclick",()=>{Object.assign(e,o),s(),n()}),t.addEventListener("keydown",p=>{let S=p.shiftKey?.3:.08,x={ArrowLeft:[-S,0],ArrowRight:[S,0],ArrowUp:[0,-S],ArrowDown:[0,S]};x[p.key]&&(p.preventDefault(),l(...x[p.key]))}),!a)return;let u=matchMedia("(prefers-reduced-motion: reduce)"),d=!1,c=0,h=0,f=p=>{if(c=0,!d||u.matches||!t.clientWidth)return;!i&&p-r>qa&&h&&(e.yaw+=a*Math.min(p-h,100)/1e3,n()),h=p,c=requestAnimationFrame(f)},m=()=>{c||(h=0,c=requestAnimationFrame(f))};new IntersectionObserver(([p])=>{d=p.isIntersecting,d&&m()}).observe(t),new ResizeObserver(()=>d&&m()).observe(t),u.addEventListener("change",m)}var se={hue:"hsv"},bt=180,en=100,on=16,Va=[10,20,30,40,50,60,70,80,90],Ua=35*Math.PI/180,ja=2*Math.PI/60,nn={yaw:-1.1,pitch:.5},rn=4.5,Ga=Vt(2,[-.5,.5]),za=1.4,Ya=`
attribute vec3 aLab;
attribute vec3 aColor;
uniform mat4 uMvp;
uniform float uPointSize;
uniform vec2 uOffset;
varying vec3 vColor;
varying float vL;
void main() {
  vColor = aColor;
  vL = aLab.x;
  gl_Position = uMvp * vec4(aLab.y * 0.01, (aLab.x - 50.0) * 0.01, -aLab.z * 0.01, 1.0);
  gl_Position.xy += uOffset * gl_Position.w;
  gl_PointSize = uPointSize;
}`,Wa=`
precision mediump float;
varying vec3 vColor;
varying float vL;
uniform float uCut;
void main() {
  if (vL > uCut) discard;
  gl_FragColor = vec4(vColor, 1.0);
}`,Xa=`
precision mediump float;
varying float vL;
uniform vec4 uColor;
uniform float uCut;
void main() {
  if (vL > uCut) discard;
  gl_FragColor = uColor;
}`,an=t=>et(Zt(t));function Ka(){let t=bt+1,e=en+1,o=new Float32Array(t*e*3),n=new Float32Array(t*e*3),a=new Float32Array(t*e*3);for(let r=0;r<e;r++){let s=r/en*100;for(let l=0;l<t;l++){let i=l/bt*360,u=(r*t+l)*3;o.set(kt(Lt({h:i,l:s,s:1},se)),u),n.set(F({h:i,l:s,s:1},se),u),a.fill(an(s),u,u+3)}}return{lab:o,color:n,grey:a,indices:sn(t,e)}}function Za(t){let e=bt+1,o=on+1,n=new Float32Array(e*o*3),a=new Float32Array(e*o*3),r=new Float32Array(e*o*3);for(let s=0;s<o;s++){let l=s/on;for(let i=0;i<e;i++){let u=i/bt*360,d=(s*e+i)*3,c=kt(Lt({h:u,l:t,s:l},se));c[0]=t,n.set(c,d),a.set(F({h:u,l:t,s:l},se),d),r.fill(an(t),d,d+3)}}return{lab:n,color:a,grey:r,indices:sn(e,o)}}function sn(t,e){let o=new Uint16Array((t-1)*(e-1)*6),n=0;for(let a=0;a<e-1;a++)for(let r=0;r<t-1;r++){let s=a*t+r;o.set([s,s+1,s+t+1,s,s+t+1,s+t],n),n+=6}return o}function Ja(){let t=new Float32Array((bt+1)*3);for(let e=0;e<=bt;e++)t.set(kt(Jt(e/bt*360).map(V)),e*3);return t}function ln(t,{handle:e=t,zoom:o=za,maxPixels:n=1/0,marker:a}={}){let r=t.getContext("webgl",{antialias:!0,premultipliedAlpha:!1});if(!r)return null;let s=g=>gt(r,Ya,g,["aLab","aColor"],["uMvp","uCut","uColor","uFill","uPointSize","uOffset"]),l=s(Wa),i=s(Xa),u=(g,L=r.ARRAY_BUFFER)=>{let H=r.createBuffer();return r.bindBuffer(L,H),r.bufferData(L,g,r.STATIC_DRAW),H};function d(g){return{lab:u(g.lab),color:u(g.color),grey:u(g.grey),indices:u(g.indices,r.ELEMENT_ARRAY_BUFFER),count:g.indices.length}}let c=d(Ka()),h=ve(Va),f=u(h),m=u(Ja()),p=null,S=null,x={...nn},T={key:"",adjust:null},A={h:0,l:50,s:1,optimal:!0,cut:!1,pureLine:!1,preview:!1,zoom:o},w=0,C=()=>{w||(w=requestAnimationFrame(E))};function b(g,L){r.bindBuffer(r.ARRAY_BUFFER,L),r.enableVertexAttribArray(g),r.vertexAttribPointer(g,3,r.FLOAT,!1,0,0)}function M(g,L,H){let k=l;r.useProgram(k.p),r.uniformMatrix4fv(k.uMvp,!1,L),r.uniform1f(k.uCut,H),r.uniform1f(k.uPointSize,1),b(k.aLab,g.lab),b(k.aColor,A.preview?g.grey:g.color),r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,g.indices),r.drawElements(r.TRIANGLES,g.count,r.UNSIGNED_SHORT,0),r.disableVertexAttribArray(k.aColor)}function v(g,L,H,k,R,P=1e3){let $=i;r.useProgram($.p),r.uniformMatrix4fv($.uMvp,!1,k),r.uniform1f($.uCut,P),r.uniform4fv($.uColor,R),r.uniform1f($.uPointSize,1),b($.aLab,g);let O=y();for(let q=0;q<O;q++)for(let B=0;B<O;B++)r.uniform2f($.uOffset,2*q/t.width,2*B/t.height),r.drawArrays(H,0,L)}let y=()=>(window.devicePixelRatio||1)>=1.5?2:1;function E(){w=0;let g=Math.max(t.clientWidth,t.clientHeight),L=Math.min(window.devicePixelRatio||1,2,n/g),H=Math.round(t.clientWidth*L),k=Math.round(t.clientHeight*L);if(!H||!k)return;(t.width!==H||t.height!==k)&&(t.width=H,t.height=k),r.viewport(0,0,H,k),r.clearColor(0,0,0,0),r.clear(r.COLOR_BUFFER_BIT|r.DEPTH_BUFFER_BIT);let R=H/k,P=tn(Ua,R,.1,100),$=`${H}\xD7${k}\xD7${A.zoom}`;T.key!==$&&(T={key:$,adjust:qt(P,rn,Ga,.92*A.zoom)});let O=Q(T.adjust,Q(P,Ct(x.yaw,x.pitch,rn))),q=A.cut?A.l:1e3;r.enable(r.DEPTH_TEST),r.depthMask(!0),r.disable(r.BLEND),r.enable(r.POLYGON_OFFSET_FILL),r.polygonOffset(1,1),M(c,O,q),A.cut&&(S!==A.l&&(p=d(Za(A.l)),S=A.l),M(p,O,1e3)),r.disable(r.POLYGON_OFFSET_FILL),r.enable(r.BLEND),r.blendFunc(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA),r.depthMask(!1),A.pureLine&&v(m,bt+1,r.LINE_STRIP,O,[0,0,0,.8],q),A.optimal&&v(f,h.length/3,r.LINES,O,tt(t,.7));let[B,U,G]=kt(Lt(A,se)),z=[U*.01,(B-50)*.01,-G*.01,1],K=[0,1,3].map(wt=>O[wt]*z[0]+O[4+wt]*z[1]+O[8+wt]*z[2]+O[12+wt]*z[3]);a.style.setProperty("--x",(K[0]/K[2]+1)/2),a.style.setProperty("--y",(1-K[1]/K[2])/2)}return Ut(e,x,nn,C,{spin:ja}),new ResizeObserver(C).observe(t),{update(g){A={...A,...g},C()}}}var Qa=/\S+/g;function ts(t,e){let o=document.createTreeWalker(t,NodeFilter.SHOW_TEXT),n=0;for(let a=o.nextNode();a;a=o.nextNode())for(let r of a.data.matchAll(Qa)){if(++n<e)continue;let s=r.index+r[0].length;return!a.data.slice(s).trim()&&!es(a,t)?!1:(a.data=a.data.slice(0,s).replace(/[\s,.;:–-]+$/,""),os(a,t),!0)}return!1}function es(t,e){for(let o=t;o!==e;o=o.parentNode)for(let n=o.nextSibling;n;n=n.nextSibling)if(n.textContent.trim())return!0;return!1}function os(t,e){for(let o=t;o!==e;o=o.parentNode)for(;o.nextSibling;)o.nextSibling.remove()}function St(t,{words:e=70}={}){let o=t.innerHTML,n=t.cloneNode(!0);if(!ts(n,e))return;let a=(s,l)=>`<button type="button" class="read-more" aria-expanded="${l}">${s}</button>`;function r(s,l){t.innerHTML=s?`${o} ${a("Show less",!0)}`:`${n.innerHTML}\u2026 ${a("Read more",!1)}`;let i=t.querySelector(".read-more");i.addEventListener("click",()=>r(!s,!0)),l&&i.focus()}r(!1,!1)}var Ee={desktop:1.4*(763/1400),mobile:1.4*1.11*(763/1400)},Ke=matchMedia("(max-width: 699.98px)"),ns=[["optimal","Show optimal color solid"],["cut","Cut at current lightness"]];function cn({onOptions:t}){let e=document.createElement("div");e.className="box cielab-solid",e.innerHTML=`
    <p class="lead"><strong>CIELAB solid</strong> \u2013 The colored body is every color HSL* can produce, which is the sRGB gamut. Height is L*, the floor is a* and b*. The outline is the optimal color solid: all surface colors that are physically possible under D65. Drag to rotate, double-click to reset.</p>
    <div class="cielab-options">${ns.map(([n,a])=>at(n,a)).join("")}</div>
    <div class="solid-stage">
      <div class="solid-frame" aria-hidden="true">
        <canvas class="solid-canvas"></canvas>
        <span class="marker"></span>
      </div>
      <div class="solid-handle" tabindex="0" role="img"
        aria-label="The HSL* solid in CIELAB. Drag or use the arrow keys to turn it, double-click to reset."></div>
    </div>`,St(e.querySelector(".lead"));for(let n of e.querySelectorAll("[data-option]"))n.addEventListener("change",()=>t({[n.dataset.option]:n.checked}));let o=ln(e.querySelector(".solid-canvas"),{handle:e.querySelector(".solid-handle"),zoom:Ke.matches?Ee.mobile:Ee.desktop,maxPixels:1800,marker:e.querySelector(".marker")});return Ke.addEventListener("change",()=>o?.update({zoom:Ke.matches?Ee.mobile:Ee.desktop})),{element:e,update({color:n,options:a}){for(let r of e.querySelectorAll("[data-option]"))r.checked=a[r.dataset.option];o?.update({h:n.hsv,l:n.l,s:n.s,optimal:a.optimal,cut:a.cut})}}}var un={open:'<path d="M5 12H19"/>',closed:'<path d="M5 12H19"/><path d="M12 5V19"/>'};function le(t,{onToggle:e}){let o=document.createElement("h2");o.className="box section-title",o.innerHTML=`
    <button type="button" class="section-toggle">
      <span class="section-title-text"></span>
      <svg class="icon section-title-icon" viewBox="0 0 24 24" aria-hidden="true"></svg>
    </button>`;let n=o.querySelector("button");return o.querySelector(".section-title-text").textContent=t,n.addEventListener("click",e),{element:o,update({open:a,controls:r}){n.setAttribute("aria-expanded",String(a)),n.setAttribute("aria-controls",r),o.querySelector("svg").innerHTML=a?un.open:un.closed}}}var jt=.75,Ae=2*jt,yt=360,dn=[0,25,50,75,100],hn=[0,60,120,180,240,300],rs=[.25,.5,.75,1],Tt=1.22,ie=.06,Ze=.14,as=2*Math.PI/60,pn={yaw:-.6,pitch:.35},mn=5,ss=`#version 300 es
in vec3 aHls;
uniform mat4 uMvp;
uniform float uSpread;
uniform float uLift;
out vec3 vHls;
void main() {
  float l = aHls.y + uLift;
  float s = aHls.z * uSpread;
  float a = radians(aHls.x);
  vHls = vec3(aHls.x, l, s);
  gl_Position = uMvp * vec4(s * ${jt.toFixed(6)} * cos(a), (l / 100.0 - 0.5) * ${Ae.toFixed(6)}, -s * ${jt.toFixed(6)} * sin(a), 1.0);
}`,ls=t=>`#version 300 es
precision highp float;
precision highp int;
${t}
uniform int uAxis;
uniform bool uPreview;
uniform float uCut;
in vec3 vHls;
out vec4 color;
void main() {
  if (vHls.y > uCut) discard;
  color = vec4(hslStarToSrgb(uPreview ? vec3(0.0, vHls.y, 0.0) : vHls, uAxis), 1.0);
}`,is=`
attribute vec3 aPos;
uniform mat4 uMvp;
uniform float uPointSize;
uniform vec2 uOffset;
void main() {
  gl_Position = uMvp * vec4(aPos, 1.0);
  gl_Position.xy += uOffset * gl_Position.w;
  gl_PointSize = uPointSize;
}`,cs=`
precision mediump float;
uniform vec4 uColor;
void main() {
  gl_FragColor = uColor;
}`;function X(t,e,o){let n=t*Math.PI/180;return[o*jt*Math.cos(n),(e/100-.5)*Ae,-o*jt*Math.sin(n)]}function us(){let t=[];for(let e=0;e<=yt;e++){let o=e/yt*360;t.push(o,0,1,o,100,1)}return new Float32Array(t)}function ds(){let t=[];for(let e=0;e<yt;e++){let[o,n]=[e/yt,(e+1)/yt].map(a=>a*360);t.push((o+n)/2,0,0,o,0,1,n,0,1)}return new Float32Array(t)}function fn(t,e,o,{handle:n=t,zoom:a=1,marker:r}={}){let s=t.getContext("webgl2",{antialias:!0,premultipliedAlpha:!1});if(!s)return null;let l=gt(s,ss,ls(o),["aHls"],["uMvp","uSpread","uLift","uCut","uAxis","uPreview"]),u=(k=>gt(s,is,k,["aPos"],["uMvp","uColor","uFill","uPointSize","uOffset"]))(cs),d=(k,R=s.ARRAY_BUFFER,P=s.STATIC_DRAW)=>{let $=s.createBuffer();return s.bindBuffer(R,$),s.bufferData(R,k,P),$},c=d(us()),h=d(ds()),f=d(new Float32Array(3),s.ARRAY_BUFFER,s.DYNAMIC_DRAW),m={...pn},p={hsv:0,l:50,s:1,mode:"oklab",preview:!1,atSaturation:!1,cut:!1,zoom:a},S=0,x=()=>{S||(S=requestAnimationFrame(v))};function T(k,R){s.bindBuffer(s.ARRAY_BUFFER,R),s.enableVertexAttribArray(k),s.vertexAttribPointer(k,3,s.FLOAT,!1,0,0)}function A(k,R,P,$,O){s.uniform1f(l.uLift,$),s.uniform1f(l.uCut,O),T(l.aHls,k),s.drawArrays(R,0,P)}function w(k,R,P,$){s.bindBuffer(s.ARRAY_BUFFER,f),s.bufferData(s.ARRAY_BUFFER,new Float32Array(k),s.DYNAMIC_DRAW);let O=k.length/3;s.useProgram(u.p),s.uniformMatrix4fv(u.uMvp,!1,P),s.uniform4fv(u.uColor,$),s.uniform1f(u.uPointSize,1),T(u.aPos,f);let q=t.width/t.clientWidth>=1.5?2:1;for(let B=0;B<q;B++)for(let U=0;U<q;U++)s.uniform2f(u.uOffset,2*B/t.width,2*U/t.height),s.drawArrays(R,0,O)}let C=Vt((Tt+ie+Ze)*jt,[-.5*Ae,.58*Ae]),b={key:"",adjust:null};function M(k,R,P){return b.key!==P&&(b={key:P,adjust:qt(k,R,C,.92*p.zoom)}),b.adjust}function v(){S=0;let k=Math.min(window.devicePixelRatio||1,2),R=Math.round(t.clientWidth*k),P=Math.round(t.clientHeight*k);if(!R||!P)return;(t.width!==R||t.height!==P)&&(t.width=R,t.height=P),s.viewport(0,0,R,P),s.clearColor(0,0,0,0),s.clear(s.COLOR_BUFFER_BIT|s.DEPTH_BUFFER_BIT);let $=R/P,O=Le($,.1,100),q=M(O,mn,`${R}\xD7${P}\xD7${p.zoom}`),B=Q(q,Q(O,Ct(m.yaw,m.pitch,mn)));s.enable(s.DEPTH_TEST),s.depthMask(!0),s.disable(s.BLEND),s.useProgram(l.p),s.uniformMatrix4fv(l.uMvp,!1,B),s.uniform1f(l.uSpread,p.atSaturation?p.s:1),s.uniform1i(l.uAxis,p.mode==="hsv"?1:0),s.uniform1i(l.uPreview,p.preview?1:0);let U=p.cut?p.l:1e3;A(c,s.TRIANGLE_STRIP,(yt+1)*2,0,U),A(h,s.TRIANGLES,yt*3,0,U),A(h,s.TRIANGLES,yt*3,p.cut?p.l:100,1e3),s.enable(s.BLEND),s.blendFunc(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA),s.depthMask(!1);let G=E(B),z=[...X(G,0,Tt),...X(G,100,Tt)];for(let mt of dn)z.push(...X(G,mt,Tt),...X(G,mt,Tt+ie));for(let mt of hn)z.push(...X(mt,0,1),...X(mt,0,1+ie));w(z,s.LINES,B,tt(t,.55)),s.disable(s.DEPTH_TEST);let K=[];for(let mt of rs)for(let be=0;be<72;be++)K.push(...X(be/72*360,0,mt),...X((be+1)/72*360,0,mt));w(K,s.LINES,B,tt(t,.3));let wt=Y(p.hsv,{hue:p.mode}),Co=X(wt,p.l,p.s);w([...X(0,0,0),...X(wt,0,p.s),...Co],s.LINE_STRIP,B,tt(t,.9));let[oa,na]=y(B,Co);r.style.setProperty("--x",oa),r.style.setProperty("--y",na),H(B,R,P,G)}function y(k,[R,P,$]){let O=k[3]*R+k[7]*P+k[11]*$+k[15];return[((k[0]*R+k[4]*P+k[8]*$+k[12])/O+1)/2,(1-(k[1]*R+k[5]*P+k[9]*$+k[13])/O)/2]}function E(k){return(Math.atan2(k[8],-k[0])*180/Math.PI+360)%360}let g=[...dn.map(k=>({text:String(k),at:R=>X(R,k,Tt+ie+Ze)})),{text:"L*",at:k=>X(k,108,Tt)},...hn.map(k=>({text:`${k}\xB0`,at:()=>X(k,0,1+ie+Ze)}))].map(k=>{let R=document.createElement("span");return R.textContent=k.text,e.appendChild(R),{...k,el:R}}),L=new Uint8Array(4);function H(k,R,P,$){for(let{at:O,el:q}of g){let[B,U]=y(k,O($));q.style.left=`${B*100}%`,q.style.top=`${U*100}%`;let G=Math.round(B*R),z=Math.round((1-U)*P),K=!1;G>=0&&G<R&&z>=0&&z<P&&(s.readPixels(G,z,1,1,s.RGBA,s.UNSIGNED_BYTE,L),K=L[3]>240),q.style.visibility=K?"hidden":""}}return Ut(n,m,pn,x,{spin:as}),new ResizeObserver(x).observe(t),{update(k){p={...p,...k},x()}}}var gn={desktop:1.39,mobile:1.2},Sn=matchMedia("(max-width: 699.98px)"),bn=()=>Sn.matches?gn.mobile:gn.desktop,hs=[["atSaturation","Show current saturation"],["cut","Cut at current lightness"]];function yn({onOptions:t}){let e=document.createElement("div");e.className="box cylinder",e.innerHTML=`
    <div class="cylinder-options">${hs.map(([a,r])=>at(a,r)).join("")}</div>
    <div class="cylinder-stage">
      <canvas class="cylinder-canvas" tabindex="0" role="img"
        aria-label="The HSL* coordinates as a cylinder. Drag or use the arrow keys to turn it, double-click to reset."></canvas>
      <div class="diagram-labels" aria-hidden="true"></div>
      <span class="marker" aria-hidden="true"></span>
    </div>
    <p class="lead"><strong>HSL* cylinder</strong> \u2013 The HSL* coordinates as a cylinder. Unlike HSL's, each level is one lightness, so a cut across it holds colors that look equally light. Hue goes round, saturation out from the grey axis, L* up from black to white. Lines lead to the selected color, along the floor for hue and saturation, then up for lightness. Drag to rotate, double-click to reset. The side is the color field at full saturation, or at the current saturation with the cylinder shrunk to it. A cut at the current lightness shows every hue and saturation there.</p>`,St(e.querySelector(".lead"));for(let a of e.querySelectorAll("[data-option]"))a.addEventListener("change",()=>t({[a.dataset.option]:a.checked}));let o=null,n=null;return Nt.then(a=>{o=fn(e.querySelector(".cylinder-canvas"),e.querySelector(".diagram-labels"),a,{zoom:bn(),marker:e.querySelector(".marker")}),n&&o?.update(n),Sn.addEventListener("change",()=>o?.update({zoom:bn()}))}).catch(a=>console.error(a)),{element:e,update({color:a,mode:r,options:s}){for(let l of e.querySelectorAll("[data-option]"))l.checked=s[l.dataset.option];n={hsv:a.hsv,l:a.l,s:a.s,mode:r,...s},o?.update(n)}}}var Ht=Math.PI/180,xn=25**7;var vn=(t,e)=>t===0&&e===0?0:(Math.atan2(e,t)/Ht+360)%360;function wn([t,e,o],[n,a,r]){let s=(Math.hypot(e,o)+Math.hypot(a,r))/2,l=.5*(1-Math.sqrt(s**7/(s**7+xn))),[i,u]=[e*(1+l),a*(1+l)],[d,c]=[Math.hypot(i,o),Math.hypot(u,r)],[h,f]=[vn(i,o),vn(u,r)],m=n-t,p=c-d,S=0;d*c!==0&&(S=f-h,S>180?S-=360:S<-180&&(S+=360));let x=2*Math.sqrt(d*c)*Math.sin(S/2*Ht),T=(t+n)/2,A=(d+c)/2,w=h+f;d*c!==0&&(Math.abs(h-f)<=180?w/=2:w=h+f<360?(w+360)/2:(w-360)/2);let C=1-.17*Math.cos((w-30)*Ht)+.24*Math.cos(2*w*Ht)+.32*Math.cos((3*w+6)*Ht)-.2*Math.cos((4*w-63)*Ht),b=1+.015*(T-50)**2/Math.sqrt(20+(T-50)**2),M=1+.045*A,v=1+.015*A*C,y=30*Math.exp(-(((w-275)/25)**2)),E=-2*Math.sqrt(A**7/(A**7+xn))*Math.sin(2*y*Ht),[g,L,H]=[m/b,p/M,x/v];return Math.sqrt(g*g+L*L+H*H+E*L*H)}var Je=.001,Ln=.01,ps=24,Qe=Math.PI/180;function En([t,e],o,n){let a=Math.min(1,Math.hypot(t,e)),r=a>0?(Math.atan2(e,t)/Qe+360)%360:0;return kt(Lt({h:r,l:o,s:a},{hue:n}))}var ce=(t,e)=>[e*Math.cos(t*Qe),e*Math.sin(t*Qe)];function An(t,e,o){let[n,a]=[0,-1],r=Math.min(e,o),s=t(r);if(Math.abs(s)<Ln)return r;if(s<0)for(;s<0;){if(r>=o)return null;[n,a]=[r,s],r=Math.min(r*2,o),s=t(r)}let l=0;for(let i=0;i<ps;i++){let u=r-s*(r-n)/(s-a),d=t(u);if(Math.abs(d)<Ln)return u;d>0?([r,s]=[u,d],l===1&&(a/=2),l=1):([n,a]=[u,d],l===-1&&(s/=2),l=-1)}return(n+r)/2}function Mn(t,e,{hue:o="oklab",difference:n=wn,steps:a=72}={}){let r=En(t,e,o),s=[];for(let l=0;l<a;l++){let i=2*Math.PI*l/a,[u,d]=[Math.cos(i),Math.sin(i)],c=S=>{let x=S*(t[0]*u+t[1]*d);return-x+Math.sqrt(x*x+1-(t[0]**2+t[1]**2))},h=S=>x=>n(r,En([t[0]+S*x*u,t[1]+S*x*d],e,o))-1,f=h(c(1)>Je?1:-1)(Je)+1;if(!(f>1e-9))return null;let m=Je/f,p=An(h(1),m,c(1))??An(h(-1),m,c(-1))??m;s.push([t[0]+p*u,t[1]+p*d])}return s}var kn=2,ms=[.25,.5,.75,1],fs=[.25,.5,.75],Gt=12,Cn=3,gs=t=>`#version 300 es
precision highp float;
precision highp int;
${t}
uniform vec3 uDisc; // centre x, centre y (from the bottom), radius, in device px
uniform float uL;
uniform int uAxis;
uniform bool uPreview;
out vec4 color;
void main() {
  vec2 p = (gl_FragCoord.xy - uDisc.xy) / uDisc.z;
  float s = length(p);
  if (s > 1.0) discard;
  float h = mod(degrees(atan(p.y, p.x)), 360.0);
  color = vec4(hslStarToSrgb(vec3(h, uL, uPreview ? 0.0 : s), uAxis), 1.0);
}`;function bs(t){let e=document.createElement("canvas"),o=e.getContext("webgl2",{antialias:!1,depth:!1,premultipliedAlpha:!1,preserveDrawingBuffer:!0});if(!o)return null;let n=(l,i)=>{let u=o.createShader(l);if(o.shaderSource(u,i),o.compileShader(u),!o.getShaderParameter(u,o.COMPILE_STATUS))throw new Error(o.getShaderInfoLog(u));return u},a=o.createProgram();if(o.attachShader(a,n(o.VERTEX_SHADER,`#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`)),o.attachShader(a,n(o.FRAGMENT_SHADER,gs(t))),o.linkProgram(a),!o.getProgramParameter(a,o.LINK_STATUS))throw new Error(o.getProgramInfoLog(a));o.useProgram(a);let r=l=>o.getUniformLocation(a,l);o.bindBuffer(o.ARRAY_BUFFER,o.createBuffer()),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),o.STATIC_DRAW);let s=o.getAttribLocation(a,"aPos");return o.enableVertexAttribArray(s),o.vertexAttribPointer(s,2,o.FLOAT,!1,0,0),(l,{cx:i,cy:u,radius:d},{l:c,mode:h,preview:f})=>{let{width:m,height:p}=l.canvas;(e.width!==m||e.height!==p)&&(e.width=m,e.height=p),o.viewport(0,0,m,p),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),o.uniform3f(r("uDisc"),i,p-u,d),o.uniform1f(r("uL"),c),o.uniform1i(r("uAxis"),h==="hsv"?1:0),o.uniform1i(r("uPreview"),f?1:0),o.drawArrays(o.TRIANGLES,0,3),l.drawImage(e,0,0)}}function Tn(t,{cx:e,cy:o,radius:n},{l:a,mode:r,preview:s}){let l=Math.ceil(n*2),[i,u]=[Math.floor(e-n),Math.floor(o-n)],d=t.getImageData(i,u,l,l);for(let c=0;c<l;c++)for(let h=0;h<l;h++){let f=(i+h+.5-e)/n,m=(o-(u+c+.5))/n,p=Math.hypot(f,m);if(p>1)continue;let S=(Math.atan2(m,f)*180/Math.PI+360)%360,x=W(F({h:S,l:a,s:s?0:p},{hue:r}));d.data.set([...x,255],(c*l+h)*4)}t.putImageData(d,i,u)}function Hn(t,e,{marker:o}={}){let n=Tn;try{n=bs(e)??Tn}catch(d){console.warn("Painting the \u0394E disc in JS:",d.message)}let a={hsv:0,l:50,s:1,mode:"oklab",preview:!1,line:"#ffffff"},r={key:"",shapes:[]};function s(d,c){let h=`${d} ${c}`;if(r.key===h)return r.shapes;let f=[[0,0]];for(let p of fs)for(let S=0;S<Gt;S++)f.push(ce(360*S/Gt,p));let m=f.map(p=>({centre:p,points:Mn(p,d,{hue:c})})).filter(p=>p.points);return r={key:h,shapes:m},m}let l=0,i=()=>{l||(l=requestAnimationFrame(u))};function u(){l=0;let d=Math.min(window.devicePixelRatio||1,2),c=Math.round(t.clientWidth*d),h=Math.round(t.clientHeight*d);if(!c||!h)return;(t.width!==c||t.height!==h)&&(t.width=c,t.height=h);let f=t.getContext("2d");f.clearRect(0,0,c,h);let m=parseFloat(getComputedStyle(t).fontSize)*d,p=Math.min(c,h)/2-Cn*m,S={cx:c/2,cy:h/2,radius:p},x=([E,g])=>[S.cx+E*p,S.cy-g*p],T=E=>`rgba(${tt(t,1).slice(0,3).map(g=>Math.round(g*255)).join(", ")}, ${E})`,{l:A,mode:w,preview:C}=a;n(f,S,{l:A,mode:w,preview:C}),f.lineWidth=d,f.strokeStyle="rgba(0, 0, 0, 0.18)",f.beginPath();for(let E of ms)f.moveTo(S.cx+E*p,S.cy),f.arc(S.cx,S.cy,E*p,0,2*Math.PI);for(let E=0;E<Gt;E++)f.moveTo(S.cx,S.cy),f.lineTo(...x(ce(360*E/Gt,1)));f.stroke(),f.font=`${m}px ${getComputedStyle(t).fontFamily}`,f.fillStyle=T(.6),f.textAlign="center",f.textBaseline="middle";for(let E=0;E<Gt;E+=2){let g=360*E/Gt;f.fillText(`${g}\xB0`,...x(ce(g,1+Cn*.5*m/p)))}let b=s(A,w);(()=>{f.beginPath();for(let{centre:E,points:g}of b)g.forEach(([L,H],k)=>{let R=x([E[0]+(L-E[0])*kn,E[1]+(H-E[1])*kn]);k?f.lineTo(...R):f.moveTo(...R)}),f.closePath()})(),f.strokeStyle=a.line,f.lineWidth=d,f.stroke();let[v,y]=x(ce(Y(a.hsv,{hue:w}),a.s));o.style.setProperty("--x",v/c),o.style.setProperty("--y",y/h)}return new ResizeObserver(i).observe(t),{update(d){a={...a,...d},i()}}}var Ss=50;function Rn(){let t=document.createElement("div");t.className="box delta-e",t.innerHTML=`
    <div class="delta-e-stage">
      <canvas class="delta-e-canvas" role="img" aria-label="HSL* disc at L* 50 with \u0394E 2000 ellipses"></canvas>
      <span class="marker" aria-hidden="true"></span>
    </div>
    <p class="delta-e-text"><strong>\u0394E 2000</strong> \u2013 How evenly HSL* is spaced to the eye. The disc is the HSL* field at L* 50, hue round, saturation out from the grey centre. Each ring marks the colors one \u0394E 2000 away from its centre, drawn twice as large. Large rings mean HSL* changes little to the eye there. Long ones mean a step one way shows less than a step the other way.</p>`,St(t.querySelector(".delta-e-text"));let e=null,o=null;return Nt.then(n=>{e=Hn(t.querySelector(".delta-e-canvas"),n,{marker:t.querySelector(".delta-e-stage .marker")}),o&&e.update(o)}).catch(n=>console.error(n)),{element:t,update({color:n,background:a,mode:r}){o={hsv:n.hsv,l:Ss,s:n.s,mode:r,line:_(a)},e?.update(o)}}}var to=[[380,.17411,.00496],[385,.17401,.00498],[390,.1738,.00492],[395,.17356,.00492],[400,.17334,.0048],[405,.17302,.00478],[410,.17258,.0048],[415,.17209,.00483],[420,.17141,.0051],[425,.1703,.00579],[430,.16888,.0069],[435,.1669,.00855],[440,.16441,.01086],[445,.16111,.01379],[450,.15664,.01771],[455,.15099,.02274],[460,.14396,.0297],[465,.1355,.03988],[470,.12412,.0578],[475,.1096,.08684],[480,.09129,.1327],[485,.06871,.20072],[490,.04539,.29498],[495,.02346,.4127],[500,.00817,.53842],[505,.00386,.65482],[510,.01387,.75019],[515,.03885,.81202],[520,.0743,.8338],[525,.11416,.82621],[530,.15472,.80586],[535,.19288,.78163],[540,.22962,.75433],[545,.26578,.72432],[550,.3016,.69231],[555,.33736,.65885],[560,.3731,.62445],[565,.40873,.58961],[570,.44406,.55472],[575,.47878,.5202],[580,.51249,.48659],[585,.54479,.45443],[590,.57515,.42423],[595,.60293,.3965],[600,.62704,.37249],[605,.64823,.3514],[610,.66576,.33401],[615,.68008,.31975],[620,.69151,.30834],[625,.70061,.2993],[630,.70792,.29203],[635,.71403,.28593],[640,.71903,.28094],[645,.72303,.27695],[650,.72599,.27401],[655,.72827,.27173],[660,.72997,.27003],[665,.73109,.26891],[670,.73199,.26801],[675,.73272,.26728],[680,.73342,.26658],[685,.73405,.26595],[690,.73439,.26561],[695,.73459,.26541],[700,.73469,.26531]];var Pn=([t,e,o])=>t+e+o>0?[t/(t+e+o),e/(t+e+o)]:null,ue=t=>Pn(ae(t)),Me=[[1,0,0],[0,1,0],[0,0,1]].map(ue),ke=ue([1,1,1]);function eo(){let[t,e,o]=[[1,0,0],[0,1,0],[0,0,1]].map(ae),n=t[0]*(e[1]*o[2]-o[1]*e[2])-e[0]*(t[1]*o[2]-o[1]*t[2])+o[0]*(t[1]*e[2]-e[1]*t[2]),a=[[e[1]*o[2]-o[1]*e[2],o[0]*e[2]-e[0]*o[2],e[0]*o[1]-o[0]*e[1]],[o[1]*t[2]-t[1]*o[2],t[0]*o[2]-o[0]*t[2],o[0]*t[1]-t[0]*o[1]],[t[1]*e[2]-e[1]*t[2],e[0]*t[2]-t[0]*e[2],t[0]*e[1]-e[0]*t[1]]].map(r=>r.map(s=>s/n));return[0,1,2].flatMap(r=>a.map(s=>s[r]))}function _n(t){let e=s=>ae(s)[1],o=[0,1,2,3,4,5,6,7].map(s=>[s&1,s>>1&1,s>>2&1]),n=[];for(let s of o)for(let l of o){if(s.reduce((h,f,m)=>h+(l[m]-f),0)!==1||s.some((h,f)=>h>l[f]))continue;let[i,u]=[e(s),e(l)];if((i-t)*(u-t)>0||i===u)continue;let d=(t-i)/(u-i),c=ue(s.map((h,f)=>h+d*(l[f]-h)));c&&n.push(c)}if(n.length<3)return[];let[a,r]=n.reduce(([s,l],[i,u])=>[s+i/n.length,l+u/n.length],[0,0]);return n.sort((s,l)=>Math.atan2(s[1]-r,s[0]-a)-Math.atan2(l[1]-r,l[0]-a))}function $n(t){let{white:e}=Xe(),o=ve([t]),n=r=>r>6/29?r**3:3*(6/29)**2*(r-4/29),a=[];for(let r=0;r<o.length;r+=3){let[s,l,i]=o.subarray(r,r+3),u=(s+16)/116,d=Pn([e[0]*n(u+l/500),e[1]*n(u),e[2]*n(u-i/200)]);a.push(...d)}return a}var de=.8,he=.9,zt={left:36,right:12,top:12,bottom:30},ys=[0,.1,.2,.3,.4,.5,.6,.7,.8,.9],xs=[460,480,490,500,510,520,540,560,580,600,620],vs=`#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`,ws=`#version 300 es
precision highp float;
uniform vec3 uMap;
uniform float uY;
uniform bool uPreview;
uniform mat3 uXyzToRgb;
out vec4 color;
// The sRGB transfer function, as in hsl-star.js.
vec3 encode(vec3 c) {
  return mix(12.92 * c, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}
void main() {
  vec2 xy = (gl_FragCoord.xy - uMap.xy) / uMap.z;
  if (xy.y <= 0.0) discard;
  vec3 rgb = uXyzToRgb * vec3(xy.x / xy.y * uY, uY, (1.0 - xy.x - xy.y) / xy.y * uY);
  if (any(lessThan(rgb, vec3(-1e-4))) || any(greaterThan(rgb, vec3(1.0 + 1e-4)))) discard;
  color = vec4(encode(uPreview ? vec3(uY) : clamp(rgb, 0.0, 1.0)), 1.0);
}`;function Ls(){let t=document.createElement("canvas"),e=t.getContext("webgl2",{antialias:!1,depth:!1,premultipliedAlpha:!1,preserveDrawingBuffer:!0});if(!e)return null;let o=(s,l)=>{let i=e.createShader(s);if(e.shaderSource(i,l),e.compileShader(i),!e.getShaderParameter(i,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(i));return i},n=e.createProgram();if(e.attachShader(n,o(e.VERTEX_SHADER,vs)),e.attachShader(n,o(e.FRAGMENT_SHADER,ws)),e.linkProgram(n),!e.getProgramParameter(n,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(n));e.useProgram(n);let a=s=>e.getUniformLocation(n,s);e.uniformMatrix3fv(a("uXyzToRgb"),!1,eo()),e.bindBuffer(e.ARRAY_BUFFER,e.createBuffer()),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);let r=e.getAttribLocation(n,"aPos");return e.enableVertexAttribArray(r),e.vertexAttribPointer(r,2,e.FLOAT,!1,0,0),(s,{origin:l,scale:i},u,d)=>{let{width:c,height:h}=s.canvas;(t.width!==c||t.height!==h)&&(t.width=c,t.height=h),e.viewport(0,0,c,h),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.uniform3f(a("uMap"),l[0],h-l[1],i),e.uniform1f(a("uY"),u),e.uniform1i(a("uPreview"),d?1:0),e.drawArrays(e.TRIANGLES,0,3),s.drawImage(t,0,0)}}function In(t,{origin:e,scale:o},n,a){let r=eo(),s=Me.map(([m])=>e[0]+m*o),l=Me.map(([,m])=>e[1]-m*o),[i,u]=[Math.floor(Math.min(...s)),Math.ceil(Math.max(...s))],[d,c]=[Math.floor(Math.min(...l)),Math.ceil(Math.max(...l))],h=t.getImageData(i,d,u-i,c-d),f=W([et(n)])[0];for(let m=d;m<c;m++)for(let p=i;p<u;p++){let S=(p+.5-e[0])/o,x=(e[1]-m-.5)/o;if(x<=0)continue;let T=[S/x*n,n,(1-S-x)/x*n],A=[0,1,2].map(C=>r[C]*T[0]+r[3+C]*T[1]+r[6+C]*T[2]);if(A.some(C=>C<-1e-4||C>1+1e-4))continue;let w=a?[f,f,f]:W(A.map(et));h.data.set([...w,255],((m-d)*(u-i)+(p-i))*4)}t.putImageData(h,i,d)}function On(t,{marker:e}={}){let o=In;try{o=Ls()??In}catch(l){console.warn("Filling the chromaticity chart in JS:",l.message)}let n={rgb:[.5,.5,.5],l:50,preview:!1},a=0,r=()=>{a||(a=requestAnimationFrame(s))};function s(){a=0;let l=Math.min(window.devicePixelRatio||1,2),i=Math.round(t.clientWidth*l),u=Math.round(t.clientHeight*l),d=l*parseFloat(getComputedStyle(t).fontSize)/11;if(!i||!u)return;(t.width!==i||t.height!==u)&&(t.width=i,t.height=u);let c=t.getContext("2d");c.clearRect(0,0,i,u);let h=Math.min((i-(zt.left+zt.right)*d)/de,(u-(zt.top+zt.bottom)*d)/he),f=[zt.left*d,zt.top*d+he*h],m=([y,E])=>[f[0]+y*h,f[1]-E*h],p=y=>`rgba(${tt(t,1).slice(0,3).map(E=>Math.round(E*255)).join(", ")}, ${y})`,S=`${11*d}px ${getComputedStyle(t).fontFamily}`,x=(y,{alpha:E,width:g=1,dash:L=[],close:H=!1})=>{c.beginPath(),y.forEach((k,R)=>R?c.lineTo(...m(k)):c.moveTo(...m(k))),H&&c.closePath(),c.strokeStyle=p(E),c.lineWidth=g*d,c.setLineDash(L.map(k=>k*d)),c.stroke(),c.setLineDash([])},T=Zt(n.l);o(c,{origin:f,scale:h},T,n.preview),c.font=S,c.fillStyle=p(.6);for(let y of ys)y<=de&&(x([[y,0],[y,he]],{alpha:.07}),c.textAlign="center",c.textBaseline="top",c.fillText(y.toFixed(1),...m([y,0]).map((E,g)=>E+(g?6*d:0)))),x([[0,y],[de,y]],{alpha:.07}),c.textAlign="right",c.textBaseline="middle",c.fillText(y.toFixed(1),...m([0,y]).map((E,g)=>E-(g?0:6*d)));c.textAlign="right",c.textBaseline="bottom",c.fillText("x",m([de,0])[0],m([de,0])[1]-4*d),c.textAlign="left",c.textBaseline="top",c.fillText("y",m([0,he])[0]+4*d,m([0,he])[1]);let A=to.map(([,y,E])=>[y,E]);x(A,{alpha:.75,width:1.25,close:!0}),c.fillStyle=p(.6);for(let[y,E,g]of to){if(!xs.includes(y))continue;let[L,H]=[E-ke[0],g-ke[1]],k=Math.hypot(L,H),[R,P]=[L/k,H/k];x([[E,g],[E+R*.012,g+P*.012]],{alpha:.75});let[$,O]=m([E+R*.02,g+P*.02]);c.textAlign=R>.3?"left":R<-.3?"right":"center",c.textBaseline=P>.3?"bottom":P<-.3?"top":"middle",c.fillText(String(y),$,O)}x(Me,{alpha:.5,dash:[4,3],close:!0});let w=_n(T);w.length&&x(w,{alpha:.45,close:!0});let C=$n(n.l);c.beginPath();for(let y=0;y<C.length;y+=4)c.moveTo(...m([C[y],C[y+1]])),c.lineTo(...m([C[y+2],C[y+3]]));c.strokeStyle=p(.85),c.lineWidth=1.25*d,c.stroke();let[b,M]=m(ke);c.beginPath(),c.moveTo(b-4*d,M),c.lineTo(b+4*d,M),c.moveTo(b,M-4*d),c.lineTo(b,M+4*d),c.strokeStyle=p(.7),c.lineWidth=d,c.stroke();let v=ue(n.rgb.map(V));if(e.hidden=!v,v){let[y,E]=m(v);e.style.setProperty("--x",y/i),e.style.setProperty("--y",E/u)}}return new ResizeObserver(r).observe(t),{update(l){n={...n,...l},r()}}}var oo=[{name:"BR",label:"Blue to red",from:2,to:0},{name:"RG",label:"Red to green",from:0,to:1},{name:"GB",label:"Green to blue",from:1,to:2}],Fn=1e-9;function no(t,e){let o=e[t.from]+e[t.to];return o>Fn?e[t.to]/o:.5}function ro(t,e,o){let n=e[t.from]+e[t.to],a=J(e);if(n<=Fn||a<=0)return null;let r=[...e];r[t.from]=(1-o)*n,r[t.to]=o*n;let s=a/J(r);return Ue(r.map(l=>l*s),{hue:"hsv"})}var Es='<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 9H18V18H9V9Z"/><path d="M6 16V6H16"/></svg>',ao=(t,e,o)=>Math.min(o,Math.max(e,t)),As=t=>(t%360+360)%360,Bn=[{key:"h",name:"H",label:"Hue",unit:"\xB0",wrap:360,get:t=>t.h,put:t=>({h:As(t)})},{key:"s",name:"S",label:"Saturation",unit:"%",get:t=>t.s*100,put:t=>({s:ao(t,0,100)/100})},{key:"l",name:"L*",label:"Lightness",unit:"",get:t=>t.l,put:t=>({l:ao(t,0,100)})}],Nn=["R","G","B"].map((t,e)=>({key:t.toLowerCase(),name:t,label:`${t}, 0 to 255`,channel:e}));function Ce({onCoords:t,onRgb:e,groupNames:o=!1}){let n=m=>o?`<span class="values-group-name" aria-hidden="true">${m}</span>`:"",a=document.createElement("div");a.className="color-values",a.innerHTML=`
    <div class="small-values" data-group="hsl">
      ${n("HSL*")}
      ${Bn.map(m=>`
        <label class="small-value" data-key="${m.key}">
          <span class="small-value-name">${m.name==="L*"?'<span class="tight">L</span>*':m.name}</span>
          <span class="small-value-number"><span class="small-value-unit">${m.unit}</span></span>
        </label>`).join("")}
    </div>
    <div class="small-values" data-group="rgb">
      ${n("RGB")}
      ${Nn.map(m=>`
        <label class="small-value" data-key="${m.key}">
          <span class="small-value-name">${m.name}</span>
          <span class="small-value-number"></span>
        </label>`).join("")}
    </div>
    <div class="hex-value">
      ${n("HEX")}
      <span class="small-value-number"><input class="hex-input" spellcheck="false" autocomplete="off" aria-label="Hex code"></span>
      <button type="button" class="hex-copy" aria-label="Copy hex code">${Es}</button>
      <span class="hex-note" role="status"></span>
    </div>`;let r={coords:{h:0,s:0,l:0},rgb:[0,0,0]},s=(m,p,S)=>a.querySelector(`.small-values[data-group="${m}"] [data-key="${p}"] .small-value-number`).prepend(S),l=[...Bn.map(m=>{let p=dt({label:m.label,valueOf:()=>m.get(r.coords),set:S=>t(m.put(S)),wrap:m.wrap??0});return s("hsl",m.key,p.input),p}),...Nn.map(m=>{let p=dt({label:m.label,valueOf:()=>r.rgb[m.channel]*255,set:S=>e(r.rgb.map((x,T)=>T===m.channel?ao(Math.round(S),0,255)/255:x))});return s("rgb",m.key,p.input),p})],i=a.querySelector(".hex-input"),u=()=>{i.value=_(r.rgb)},d=m=>new RegExp(`^\\s*#?([0-9a-f]{${m}})\\s*$`,"i").test(i.value)?Z(i.value):null,c=null;i.addEventListener("focus",()=>{c=r.rgb}),i.addEventListener("input",()=>{let m=d(6);m&&e(m)}),i.addEventListener("change",()=>{let m=d(3);m&&e(m),u()}),i.addEventListener("keydown",m=>{m.key==="Enter"&&i.blur(),m.key==="Escape"&&(c&&e(c),u(),i.blur())});let h=a.querySelector(".hex-note"),f=0;return a.querySelector(".hex-copy").addEventListener("click",async()=>{h.textContent=await rt(_(r.rgb))?"Copied":"Copy failed",clearTimeout(f),f=setTimeout(()=>{h.textContent=""},1200)}),{element:a,update({coords:m,rgb:p}){r={coords:m,rgb:p};for(let S of l)S.update();document.activeElement!==i&&u()}}}var Dn=32,Ms=(t,e,o)=>Math.min(o,Math.max(e,t));function qn({onCoords:t,onRgb:e,onColor:o}){let n=document.createElement("div");n.className="box xy",n.innerHTML=`
    <p class="lead xy-text"><strong><span class="keep-case">xy</span> chromaticity diagram</strong> \u2013 The colored area holds every sRGB color with the lightness of the selected color. It is one row of the HSL* field, with saturation 1 on its edge. The line around it is the edge of all physically possible surface colors of that lightness. Both shrink towards the white point as L* rises. In the CIE 1931 xy diagram behind them, the horseshoe is the spectral locus, every pure wavelength, and the dashed triangle is sRGB.</p>
    <div class="xy-stage">
      <canvas class="xy-canvas" role="img" aria-label="CIE 1931 xy chromaticity diagram with the sRGB colors at the selected lightness"></canvas>
      <span class="marker" aria-hidden="true"></span>
    </div>
    <div class="xy-controls">
      <div class="sliders xy-sliders">
        ${oo.map(u=>`
          <div class="slider" data-axis="${u.name}" tabindex="0" role="slider" aria-label="${u.label}"
            aria-valuemin="0" aria-valuemax="100">
            <span class="slider-name" aria-hidden="true">${u.name}</span>
            <span class="marker" aria-hidden="true"></span>
          </div>`).join("")}
      </div>
    </div>
    <p class="credit">Spectral locus from <a href="https://doi.org/10.25039/CIE.DS.mifmy4x4">CIE 2019</a>, licensed <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</p>`,St(n.querySelector(".xy-text"));let a=On(n.querySelector(".xy-canvas"),{marker:n.querySelector(".xy-stage .marker")}),r=[0,0,0],s=(u,d)=>{let c=ro(u,r,Ms(d,0,1));c&&o({hsv:c.h,l:c.l,s:c.s,exact:null})},l=oo.map(u=>({axis:u,slider:n.querySelector(`.slider[data-axis="${u.name}"]`)}));for(let{axis:u,slider:d}of l){let c=h=>{let f=d.getBoundingClientRect();s(u,(h.clientX-f.left)/f.width)};d.addEventListener("pointerdown",h=>{d.setPointerCapture(h.pointerId),d.focus(),c(h)}),d.addEventListener("pointermove",h=>{d.hasPointerCapture(h.pointerId)&&c(h)}),d.addEventListener("keydown",h=>{let f=h.shiftKey?.1:.01,m={ArrowRight:f,ArrowUp:f,ArrowLeft:-f,ArrowDown:-f,Home:-1,End:1};h.key in m&&(h.preventDefault(),s(u,no(u,r)+m[h.key]))})}let i=Ce({onCoords:t,onRgb:e});return i.element.classList.add("xy-values"),n.querySelector(".xy-controls").append(i.element),{element:n,update({coords:u,rgb:d,primary:c,background:h}){r=d.map(V),a.update({rgb:d,l:u.l});let f=p=>D(p).l,m={background:f(h),primary:f(c)};for(let{axis:p,slider:S}of l){let x=Array.from({length:Dn},(w,C)=>{let b=ro(p,r,C/(Dn-1));return b?F(b,{hue:"hsv"}):d});S.style.background=`linear-gradient(90deg, ${x.map(_).join(", ")})`;let T=f(x[0]);S.dataset.name=Math.abs(T-m.background)>Math.abs(T-m.primary)?"background":"primary";let A=no(p,r);S.style.setProperty("--x",A),S.setAttribute("aria-valuenow",(A*100).toFixed(1)),S.setAttribute("aria-valuetext",`${Math.round(A*100)}%`)}i.update({coords:u,rgb:d})}}}var ks=32,Cs=`<svg class="icon mini-drag" viewBox="0 0 24 24" aria-hidden="true">${[5,9,13,17].flatMap(t=>[5,9,13,17].map(e=>`<rect x="${t}" y="${e}" width="2" height="2"/>`)).join("")}</svg>`,Vn={closed:'<path d="M13 7H17V11"/><path d="M11 17L7 17L7 13"/>',open:'<path d="M18 10L14 10L14 6"/><path d="M6 14H10V18"/>'},Rt=(t,e,o)=>Math.min(o,Math.max(e,t)),Ts=t=>(t%360+360)%360,Hs=0;function Te({onCoords:t,onRgb:e,onToggle:o,onTheme:n,label:a="Mini picker",ownColors:r=!1}){let s=`mini-picker-${++Hs}`,l=document.createElement("div");l.className="mini-picker",l.setAttribute("role","dialog"),l.setAttribute("aria-label",a),l.innerHTML=`
    <div class="mini-bar">
      ${Cs}
      <span class="mini-title"></span>
      <button type="button" class="mini-toggle"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"></svg></button>
    </div>
    <div class="mini-body" id="${s}-body">
      ${n?`
        <div class="mini-modes" role="group" aria-label="Color mode">
          ${At.map(([g,L])=>`
            <button type="button" data-theme="${g}" aria-label="${L}"
              style="background: ${Do(g)}"></button>`).join("")}
        </div>`:""}
      <div class="mini-field" tabindex="0" role="slider"
        aria-label="Hue and lightness. Left and right change the hue, up and down the lightness.">
        <canvas aria-hidden="true"></canvas>
        <span class="marker" aria-hidden="true"></span>
      </div>
      <div class="sliders mini-sliders">
        ${ht.map(g=>`
          <div class="slider" data-axis="${g.key}" tabindex="0" role="slider" aria-label="${g.label}"
            aria-valuemin="0" aria-valuemax="${g.max}">
            <span class="slider-name" aria-hidden="true">${g.name}</span>
            <span class="marker" aria-hidden="true"></span>
          </div>`).join("")}
      </div>
    </div>`;let i=l.querySelector(".mini-body"),u=l.querySelector(".mini-field"),d=u.querySelector("canvas"),c=l.querySelector(".mini-toggle"),h=ht.map(g=>({axis:g,slider:l.querySelector(`.mini-sliders [data-axis="${g.key}"]`)}));for(let{axis:g,slider:L}of h)Ft(L,g,{valueOf:()=>g.toValue(p.coords[g.key]),set:t});let f=Ce({onCoords:t,onRgb:e,groupNames:!0});i.append(f.element),c.addEventListener("click",o);let m=[...l.querySelectorAll(".mini-modes button")];for(let g of m)g.addEventListener("click",()=>{g.getAttribute("aria-disabled")!=="true"&&n(g.dataset.theme)});let p=null,S=!1,x={x:Math.random(),y:Math.random()},T=()=>[Math.max(0,document.documentElement.clientWidth-l.offsetWidth),Math.max(0,window.innerHeight-l.offsetHeight)];function A(){let[g,L]=T();l.style.left=`${x.x*g}px`,l.style.top=`${x.y*L}px`}new ResizeObserver(A).observe(l),window.addEventListener("resize",A);function w(g){let[L,H]=T(),k=10,R=l.offsetWidth,P=document.documentElement.clientWidth,$=g.right+k;$+R>P&&($=g.left-k-R),$<0&&($=g.left),x.x=L?Rt($/L,0,1):0,x.y=H?Rt(g.top/H,0,1):0,A()}let C=null;l.addEventListener("pointerdown",g=>{if(g.target.closest('button, input, label, [role="slider"]'))return;g.preventDefault(),l.setPointerCapture(g.pointerId);let L=l.getBoundingClientRect();C={dx:g.clientX-L.left,dy:g.clientY-L.top},l.classList.add("is-dragging")}),l.addEventListener("pointermove",g=>{if(!C||!l.hasPointerCapture(g.pointerId))return;let[L,H]=T();x.x=L?Rt((g.clientX-C.dx)/L,0,1):0,x.y=H?Rt((g.clientY-C.dy)/H,0,1):0,A()});let b=()=>{C=null,l.classList.remove("is-dragging")};l.addEventListener("pointerup",b),l.addEventListener("pointercancel",b);function M(g){let L=u.getBoundingClientRect();t({h:Rt((g.clientX-L.left)/L.width,0,1)*359.99,l:Rt(1-(g.clientY-L.top)/L.height,0,1)*100})}u.addEventListener("pointerdown",g=>{u.setPointerCapture(g.pointerId),u.focus(),M(g)}),u.addEventListener("pointermove",g=>{u.hasPointerCapture(g.pointerId)&&M(g)}),u.addEventListener("keydown",g=>{let L=g.shiftKey?10:1,H={ArrowRight:[L,0],ArrowLeft:[-L,0],ArrowUp:[0,L],ArrowDown:[0,-L]};if(!(g.key in H)||!p)return;g.preventDefault();let[k,R]=H[g.key];t({h:Ts(p.coords.h+k),l:Rt(p.coords.l+R,0,100)})});let v=Dt(),y="";function E(){if(!p||!S)return;let g=Math.min(window.devicePixelRatio||1,2),L=Math.round(d.clientWidth*g),H=Math.round(d.clientHeight*g);if(!L||!H)return;let{coords:k,mode:R}=p,P=[L,H,k.s,R].join();P!==y&&(d.width=L,d.height=H,v.paint(d,"field",{s:k.s,mode:R}),y=P)}return v.ready.then(()=>{y="",E()}),new ResizeObserver(()=>E()).observe(u),{element:l,moveNear:w,update({coords:g,rgb:L,hex:H,primary:k=L,background:R,mode:P,open:$,theme:O,drift:q}){p={coords:g,mode:P},S=$,r&&(l.style.setProperty("--primary",H),l.style.setProperty("--color",H),l.style.setProperty("--background",_(R))),l.classList.toggle("is-open",S);for(let B of m){let U=B.dataset.theme===O&&(O!=="color"||q);B.setAttribute("aria-disabled",String(U))}if(i.hidden=!S,l.querySelector(".mini-title").textContent=S?"Select":H.toUpperCase(),c.setAttribute("aria-expanded",String(S)),c.setAttribute("aria-controls",i.id),c.setAttribute("aria-label",S?"Close the mini picker":"Open the mini picker"),c.querySelector("svg").innerHTML=S?Vn.open:Vn.closed,f.update({coords:g,rgb:L}),S){let B=G=>D(G).l,U={background:B(R),primary:B(k)};for(let{axis:G,slider:z}of h){let K=B(Bt(z,G,g,P,ks)[0]);z.dataset.name=Math.abs(K-U.background)>Math.abs(K-U.primary)?"background":"primary"}}u.style.setProperty("--x",g.h/360),u.style.setProperty("--y",1-g.l/100),u.setAttribute("aria-valuetext",`Hue ${Math.round(g.h)%360}\xB0, lightness ${Math.round(g.l)}`),E()}}}var Un={l:[20,80],s:[.5,1]},Rs=4,Ps=90/((1+Math.sqrt(5))/2),_s=90/Math.SQRT2,$s=4e3,Is=2e3,Os=(t,e,o)=>Math.min(o,Math.max(e,t)),Fs=t=>t*t*(3-2*t);function jn([t,e],o,n){let a=(t+e)/2,r=(e-t)/2,s=Math.asin(Os((n-a)/r,-1,1));return l=>a+r*Math.sin(s+2*Math.PI*l/o)}function Gn(t){let e=!1,o=-1/0,n=null,a=0;function r(i){let{color:u,mode:d}=t.get(),c={h:Y(u.hsv,{hue:d}),l:u.l,s:u.s},h=jn(Un.l,Ps,c.l),f=jn(Un.s,_s,c.s);n={since:i,mode:d,at:p=>{let S=Fs(Math.min(1,p*1e3/Is));return{h:c.h+Rs*p,l:c.l+(h(p)-c.l)*S,s:c.s+(f(p)-c.s)*S}}}}function s(i){if(a=0,!!t.get().drift){if(i-o<$s)n=null;else{(!n||n.mode!==t.get().mode)&&r(i);let{h:u,l:d,s:c}=n.at((i-n.since)/1e3);e=!0,t.update(h=>({...h,color:{hsv:ct(u,{hue:n.mode}),l:d,s:c,exact:null}})),e=!1}a=requestAnimationFrame(s)}}let l=!1;return t.watch(i=>i.color,()=>{l&&!e&&(o=performance.now())}),l=!0,t.watch(i=>i.drift,i=>{n=null,o=-1/0,i&&!a&&(a=requestAnimationFrame(s))}),{isDrifting:()=>e}}var so={"black-white":4,"white-black":8},Wn=1,Xn=4,He={palette:2,contrast:8,solid:10};function Bs({h:t,l:e,s:o}){let n=Math.round(t*10)%3600,a=Math.min(Math.max(Math.round(e*10),0),1e3),r=Math.min(Math.max(Math.round(o*1e3),0),1e3),s=(n<<20|a<<10|r)>>>0;return[s>>>24,s>>>16&255,s>>>8&255,s&255]}function Kn(t,e){let o=(t[e]<<24|t[e+1]<<16|t[e+2]<<8|t[e+3])>>>0,n=o>>>20,a=o>>>10&1023,r=o&1023;return n>=3600||a>1e3||r>1e3?null:{h:n/10,l:a/10,s:r/1e3}}var Ns=t=>btoa(String.fromCharCode(...t)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");function Ds(t){if(!/^[A-Za-z0-9_-]+$/.test(t))return null;try{return Uint8Array.from(atob(t.replace(/-/g,"+").replace(/_/g,"/")),e=>e.charCodeAt(0))}catch{return null}}var Zn=(t,e)=>t.push(...e.hex?[1,3,5].map(o=>parseInt(e.hex.slice(o,o+2),16)):Bs(e)),Jn=(t,e)=>"#"+[...t.slice(e,e+3)].map(o=>o.toString(16).padStart(2,"0")).join("");function zn(t,e){t.push(e.length);let o=new Array(Math.ceil(e.length/8)).fill(0);e.forEach((n,a)=>{n.hex||(o[a>>3]|=128>>(a&7))}),t.push(...o);for(let n of e)Zn(t,n)}function Yn(t,e){if(t.length<=e)return null;let o=t[e],n=e+1;e=n+Math.ceil(o/8);let a=[];for(let r=0;r<o;r++){let s=t[n+(r>>3)]&128>>(r&7),l=s?4:3;if(t.length<e+l)return null;if(s){let i=Kn(t,e);if(!i)return null;a.push(i)}else a.push({hex:Jn(t,e)});e+=l}return{colors:a,o:e}}function Qn({color:t,stops:e,contrast:o=[],steps:n,tones:a,longHue:r=!1,oklab:s=!1,scrollTo:l=null,theme:i="color"}){let d=[48|((r?Wn:0)|(s?Xn:0)|(He[l]??0)),(t.hex?1:0)|(l==="code"?2:0)|(so[i]??0)];return Zn(d,t),d.push(Math.min(Math.max(n,1),256)-1,Math.min(Math.max(a,0),255)),zn(d,e),zn(d,o),Ns(d)}function tr(t){let e=Ds(t),o=e&&e[0]>>4;if(!e||e.length<8||o<1||o>3)return null;let n=e[0]&15,a,r;if(o===3&&e[1]&1)a={hex:Jn(e,2)},r=5;else{let d=o===3?2:1;a=Kn(e,d),r=d+4}if(!a||e.length<r+2)return null;let s=e[r]+1,l=e[r+1],i=Yn(e,r+2);if(!i)return null;let u={colors:[],o:i.o};return o>=2&&(u=Yn(e,i.o),!u)||u.o!==e.length?null:{color:a,stops:i.colors,contrast:u.colors,steps:s,tones:l,longHue:!!(n&Wn),oklab:!!(n&Xn),scrollTo:o===3&&e[1]&2?"code":Object.keys(He).find(d=>He[d]===(n&He.solid))??null,theme:o===3&&Object.keys(so).find(d=>e[1]&so[d])||"color"}}var st=(t,e=null)=>({text:t,exact:e}),Pt=({text:t,exact:e})=>e??Z(t),pe=t=>st(_(t),t);var lo={solid:"color-space",palette:"palette",contrast:"contrast",code:"code"},qs=t=>Object.keys(lo).find(e=>lo[e]===t);function er({text:t,exact:e},o){if(e){let{h:a,l:r,s}=D(e,{hue:o});return{h:a,l:r,s}}let n=Z(t);return n?{hex:_(n)}:null}function or({color:t,mode:e,palette:o,contrast:n,theme:a},r){let s=[n.background,n.text].map(l=>er(l,e));return`#${Qn({color:t.exact?{hex:_(t.exact)}:{h:Y(t.hsv,{hue:e}),l:t.l,s:t.s},stops:o.stops.map(l=>er(l,e)).filter(Boolean),contrast:s.every(Boolean)?s:[],steps:o.steps,tones:o.tones,longHue:o.longHue,oklab:e==="oklab",scrollTo:r,theme:a})}`}function nr(t){let e=t.split(",").map(r=>r.trim());if(e.length!==3||e.some(r=>r===""))return null;let[o,n,a]=e.map(Number);return![o,n,a].every(Number.isFinite)||o<0||o>360||n<0||n>100||a<0||a>100?null:{hsv:o%360,l:n,s:a/100,exact:null}}function Vs(t){let e=nr(t);if(!e){let n=decodeURIComponent(t);return st(/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(n)?`#${n}`:n)}let o=F({h:e.hsv,l:e.l,s:e.s},{hue:"hsv"});return st(_(o),o)}function Us(t){let[e,...o]=t.split("&"),n=nr(decodeURIComponent(e)),a=Object.fromEntries(o.map(s=>[s.split("=")[0],s.slice(s.indexOf("=")+1)])),r=null;if(a.palette){let s=a.palette.split(";").filter(Boolean).map(Vs);if(s.length>=2){r={stops:s,longHue:a.long==="1"};let l=Number(a.steps),i=Number(a.tones);Number.isInteger(l)&&(r.steps=l),Number.isInteger(i)&&(r.tones=i)}}return{color:n,palette:r,contrast:null,scrollTo:a.l==="palette"?"palette":null,theme:null}}function js(t){let e=t.replace(/^#/,""),o=tr(e);if(!o)return Us(e);let n=o.oklab?"oklab":"hsv",a=i=>{if(i.hex)return st(i.hex);let u=F(i,{hue:n});return st(_(u),u)},r=o.stops.map(a),s=o.contrast.map(a),{color:l}=o;return{color:l.hex?ft(Z(l.hex)):{hsv:ct(l.h,{hue:n}),l:l.l,s:l.s,exact:null},palette:r.length>=2?{stops:r,steps:o.steps,tones:o.tones,longHue:o.longHue}:null,contrast:s.length===2?{background:s[0],text:s[1]}:null,scrollTo:o.scrollTo,theme:o.theme}}function rr(t,{isDrifting:e}){let o=null;function n(){let h=js(location.hash);o=h.scrollTo;let f=h.theme??t.get().theme;return t.update(m=>({...m,color:h.color??m.color,palette:h.palette?{...m.palette,...h.palette}:m.palette,contrast:h.contrast??m.contrast,theme:f,drift:f==="color"&&m.drift})),{color:!!h.color,scrollTo:o}}let a=(h,f="auto")=>document.getElementById(lo[h])?.scrollIntoView({behavior:f}),r=!1,s=0;function l(){clearTimeout(s),s=0;let h=or(t.get(),o);location.hash!==h&&history.replaceState(null,"",h)}function i(){r||(clearTimeout(s),s=setTimeout(l,250))}addEventListener("pointerdown",()=>r=!0,{capture:!0});for(let h of["pointerup","pointercancel"])addEventListener(h,()=>{r&&(r=!1,i())});addEventListener("hashchange",()=>{let h=n();h.scrollTo&&a(h.scrollTo)});let u=n();t.watch(h=>({color:h.color,mode:h.mode,palette:h.palette,contrast:h.contrast,theme:h.theme}),()=>{e()||i()},j),u.scrollTo&&(history.scrollRestoration="manual",requestAnimationFrame(()=>a(u.scrollTo)));let d=h=>location.href.split("#")[0]+or(t.get(),h);function c(h){let f=qs(h);f&&(o=f,l(),a(f,matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"))}return{...u,shareLink:d,goTo:c}}function Re({label:t,onEditing:e,keepOpen:o}){let n=null,a="oklab",r=Te({label:t,ownColors:!0,onCoords:h=>{if(!n)return;let f={...s(),...h};n.color={hsv:ct(f.h,{hue:a}),l:f.l,s:f.s,exact:null},i()},onRgb:h=>{n&&(n.color=ft(h),i())},onToggle:()=>c()});r.element.hidden=!0,document.body.append(r.element);let s=()=>({h:Y(n.color.hsv,{hue:a}),l:n.color.l,s:n.color.s}),l=({hsv:h,l:f,s:m,exact:p})=>p??F({h,l:f,s:m},{hue:"hsv"});function i(){n.onPick(l(n.color)),u()}function u(){let h=l(n.color);r.update({coords:s(),rgb:h,hex:_(h),background:je({color:n.color}),mode:a,open:!0})}function d(h,f,{onPick:m,onClose:p=()=>{}}){n&&c({replaced:!0}),n={color:ft(f),onPick:m,onClose:p},r.element.hidden=!1,u(),r.moveNear(h),e(!0)}function c({replaced:h=!1}={}){if(!n)return;let{onClose:f}=n;n=null,r.element.hidden=!0,f({replaced:h}),h||e(!1)}return document.addEventListener("keydown",h=>{h.key==="Escape"&&n&&c()}),document.addEventListener("pointerdown",h=>{n&&!r.element.contains(h.target)&&!h.target.closest?.(o)&&c()}),{open:d,close:c,isOpen:()=>!!n,setMode(h){a=h,n&&u()}}}var Gs=256,zs=50,Ys=4,Ws=`<svg class="icon swatch-drag" viewBox="0 0 24 24" aria-hidden="true">${[5,9,13,17].flatMap(t=>[5,9,13,17].map(e=>`<rect x="${t}" y="${e}" width="2" height="2"/>`)).join("")}</svg>`,Xs='<svg class="icon swatch-bin" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 19.1998C7.56 19.1998 7.18333 19.0432 6.87 18.7298C6.55667 18.4165 6.4 18.0398 6.4 17.5998V7.19985H5.6V5.59985H9.6V4.79985H14.4V5.59985H18.4V7.19985H17.6V17.5998C17.6 18.0398 17.4433 18.4165 17.13 18.7298C16.8167 19.0432 16.44 19.1998 16 19.1998H8ZM16 7.19985H8V17.5998H16V7.19985ZM9.6 15.9998H11.2V8.79985H9.6V15.9998ZM12.8 15.9998H14.4V8.79985H12.8V15.9998Z"/></svg>',ar=t=>`<svg viewBox="0 0 8 5" aria-hidden="true"><polyline points="${t}" fill="none" stroke="currentColor"/></svg>`,sr=(t,e,o)=>Math.min(o,Math.max(e,t));function lr({onPalette:t,onEditing:e,current:o}){let n=document.createElement("div");n.className="box palette-stops",n.innerHTML=`
    <div class="swatch-list" role="list" aria-label="Palette colors"></div>
    <div class="palette-settings">
      <label class="setting" data-key="steps"><span>Steps</span></label>
      <label class="setting" data-key="tones"><span>Tints and shades</span></label>
      ${at("longHue","Long way round the hue circle")}
    </div>`;let a=n.querySelector(".swatch-list"),r={stops:[],steps:2,tones:0,longHue:!1},s="oklab",l=b=>t({stops:b}),i=[["steps","Steps",b=>sr(Math.round(b),Math.max(2,r.stops.length),Gs)],["tones","Tints and shades",b=>sr(Math.round(b),0,zs)]].map(([b,M,v])=>{let y=dt({label:M,valueOf:()=>r[b],set:L=>t({[b]:v(L)})}),E=document.createElement("span");E.className="setting-number";let g=document.createElement("span");g.className="setting-steppers",g.innerHTML=`
      <button type="button" tabindex="-1" data-by="1" aria-label="More ${M.toLowerCase()}">${ar("0.5,4.5 4,1 7.5,4.5")}</button>
      <button type="button" tabindex="-1" data-by="-1" aria-label="Fewer ${M.toLowerCase()}">${ar("0.5,0.5 4,4 7.5,0.5")}</button>`;for(let L of g.querySelectorAll("button"))L.addEventListener("click",H=>{H.preventDefault(),y.step(Number(L.dataset.by))});return E.append(y.input,g),n.querySelector(`.setting[data-key="${b}"]`).append(E),y}),u=n.querySelector('[data-option="longHue"]');u.addEventListener("change",()=>t({longHue:u.checked}));let d=null,c=Re({label:"Edit palette color",onEditing:e,keepOpen:".swatch"});function h(b){c.open(m[b].element.getBoundingClientRect(),Pt(r.stops[b])??[.5,.5,.5],{onPick:M=>l(r.stops.map((v,y)=>y===b?pe(M):v)),onClose:({replaced:M})=>{d=null,C(),M||m[b]?.element.focus()}}),d=b,C()}let f=()=>c.close(),m=[],p=document.createElement("button");p.type="button",p.className="swatch-add",p.setAttribute("aria-label","Add the page color to the palette"),p.innerHTML='<span aria-hidden="true"></span>',p.addEventListener("click",()=>{l([...r.stops,pe(o())]),h(r.stops.length-1)});function S(b){let M=document.createElement("div");return M.className="swatch",M.setAttribute("role","listitem"),M.tabIndex=0,M.innerHTML=`${Ws}<span class="swatch-hex"></span>
      <button type="button" class="swatch-remove" aria-label="Remove color ${b+1}">${Xs}</button>`,M.querySelector(".swatch-remove").addEventListener("click",()=>{r.stops.length<=2||(f(),l(r.stops.filter((v,y)=>y!==b)))}),M.addEventListener("keydown",v=>{if(v.target===M&&((v.key==="Enter"||v.key===" ")&&(v.preventDefault(),h(b)),v.altKey&&(v.key==="ArrowLeft"||v.key==="ArrowRight"))){v.preventDefault();let y=b+(v.key==="ArrowLeft"?-1:1);if(y<0||y>=r.stops.length)return;x(b,y),m[y].element.focus()}}),w(M,b),{element:M}}function x(b,M){let v=[...r.stops],[y]=v.splice(b,1);v.splice(M,0,y),f(),l(v)}let T=document.createElement("div");T.className="swatch-drop";function A(b,M,v){let y=b.findIndex(E=>{let g=E.getBoundingClientRect();return v<g.top||v<=g.bottom&&M<g.left+g.width/2});return y===-1?b.length:y}function w(b,M){let v=null,y=!1,E=M;b.addEventListener("pointerdown",L=>{L.button!==0||L.target.closest(".swatch-remove")||(v={x:L.clientX,y:L.clientY,id:L.pointerId},b.setPointerCapture(L.pointerId))}),b.addEventListener("pointermove",L=>{if(!v||L.pointerId!==v.id)return;let H=L.clientX-v.x,k=L.clientY-v.y;if(!y){if(Math.hypot(H,k)<Ys)return;y=!0,f(),b.classList.add("is-dragging"),a.append(T)}b.style.transform=`translate(${H}px, ${k}px)`;let R=m.map(B=>B.element).filter(B=>B!==b);E=A(R,L.clientX,L.clientY);let P=a.getBoundingClientRect(),$=R[Math.min(E,R.length-1)].getBoundingClientRect(),O=parseFloat(getComputedStyle(a).columnGap)||0,q=E<R.length?$.left-O/2:$.right+O/2;T.style.left=`${q-P.left}px`,T.style.top=`${$.top-P.top}px`,T.style.height=`${$.height}px`});let g=(L,H)=>{if(!(!v||L.pointerId!==v.id)){if(v=null,!y){H||h(M);return}y=!1,b.classList.remove("is-dragging"),b.style.transform="",T.remove(),!H&&E!==M&&x(M,E)}};b.addEventListener("pointerup",L=>g(L,!1)),b.addEventListener("pointercancel",L=>g(L,!0))}function C(){let{stops:b}=r;b.length!==m.length&&(m=b.map((M,v)=>S(v)),a.replaceChildren(...m.map(M=>M.element),p)),b.forEach((M,v)=>{let{element:y}=m[v],E=Pt(M)??[.5,.5,.5],g=_(E);y.style.background=g,y.dataset.ink=D(E).l>55?"dark":"light",y.querySelector(".swatch-hex").textContent=g.toUpperCase(),y.setAttribute("aria-label",`Color ${v+1}, ${g}. Press Enter to edit it, Alt and an arrow key to move it.`),y.classList.toggle("is-editing",d===v),y.querySelector(".swatch-remove").disabled=b.length<=2})}return{element:n,update({palette:b,mode:M}){r=b,s=M,C();for(let v of i)v.update();u.checked=r.longHue,c.setMode(s)}}}function ir({onSelect:t}){let e=document.createElement("div");e.className="box palette-matrix",e.innerHTML=`
    <div class="matrix-area">
      <div class="matrix" role="group" aria-label="Palette colors with their tints and shades"></div>
    </div>
    <span class="matrix-hover" aria-hidden="true" hidden></span>`;let o=e.querySelector(".matrix"),n=e.querySelector(".matrix-hover");function a(d,c){let h=_(d),f=document.createElement("button");f.type="button",f.className="matrix-cell",f.style.background=h,f.setAttribute("aria-label",`${c?"Palette color":"Tone"} ${h}. Press Enter to pick it.`),f.addEventListener("click",()=>t(d));let m=()=>i(f,d);return f.addEventListener("pointerenter",m),f.addEventListener("focus",m),f.addEventListener("pointerleave",u),f.addEventListener("blur",u),f}let r=d=>D(Z(document.documentElement.style.getPropertyValue(d))??[0,0,0]).l,s=null;function l(){if(!s)return;let d=D(s.rgb).l<50,c=r("--primary")>r("--background");n.style.color=d===c?"var(--primary)":"var(--background)"}function i(d,c){let h=_(c);s={rgb:c},n.hidden=!1,n.textContent=h.toUpperCase(),n.style.background=h,l();let f=e.getBoundingClientRect(),m=d.getBoundingClientRect();n.style.left=`${m.left+m.width/2-f.left-e.clientLeft}px`,n.style.top=`${m.top+m.height/2-f.top-e.clientTop}px`}function u(){s=null,n.hidden=!0}return{element:e,restyle:l,update(d){if(u(),!d){o.replaceChildren();return}let{rows:c}=d,h=Math.max(...c.map(S=>S.tints.length)),f=Math.max(...c.map(S=>S.shades.length)),m=h+f+1,p=m>c.length;o.style.setProperty("--columns",p?m:c.length),o.style.setProperty("--rows",p?c.length:m),o.replaceChildren(...c.flatMap(({base:S,shades:x,tints:T},A)=>[...T.slice().reverse(),S,...x.slice().reverse()].map((w,C)=>{let b=a(w,w===S),M=h-T.length+C+1;return b.style.gridColumn=p?m+1-M:A+1,b.style.gridRow=p?A+1:M,b})))}}}function cr(t,e){if(t.length>e**3)throw new RangeError(`${t.length} colors don't fit into ${e}\xB3 voxels.`);let o=new Set,n=([r,s,l])=>(r*e+s)*e+l,a=r=>Math.min(e-1,Math.max(0,Math.floor(r*e)));return t.map(r=>{let s=r.map(a);if(!o.has(n(s)))return o.add(n(s)),s;let l=r.map(i=>i*e-.5);for(let i=1;i<e;i++){let u=null,d=1/0;for(let c=-i;c<=i;c++)for(let h=-i;h<=i;h++)for(let f=-i;f<=i;f++){if(Math.max(Math.abs(c),Math.abs(h),Math.abs(f))!==i)continue;let m=[s[0]+c,s[1]+h,s[2]+f];if(m.some(S=>S<0||S>=e)||o.has(n(m)))continue;let p=m.reduce((S,x,T)=>S+(x-l[T])**2,0);p<d&&([u,d]=[m,p])}if(u)return o.add(n(u)),u}throw new Error("No free voxel left.")})}var Ks=2*Math.PI/60,ur={yaw:-.5,pitch:.3},dr=5,Zs=.8,Yt=1.14,Wt={x:[Math.SQRT1_2,-Math.SQRT1_2,0],y:[1,1,1].map(t=>t/Math.sqrt(3)),z:[-1,-1,2].map(t=>t/Math.sqrt(6))},io=t=>`vec3(${t.map(e=>e.toFixed(8)).join(", ")})`,Js=`
vec3 place(vec3 rgb) {
  vec3 c = rgb - 0.5;
  return vec3(dot(c, ${io(Wt.x)}), dot(c, ${io(Wt.y)}), dot(c, ${io(Wt.z)}));
}`,co=(t,e)=>t[0]*e[0]+t[1]*e[1]+t[2]*e[2],uo=t=>{let e=t.map(o=>o-.5);return[co(e,Wt.x),co(e,Wt.y),co(e,Wt.z)]},Qs=`#version 300 es
in vec3 aCorner;
in vec3 aNormal;
in vec3 aVoxel;
in vec3 aColor;
uniform mat4 uMvp;
uniform float uN;
out vec3 vColor;
${Js}
void main() {
  vec3 normal = place(aNormal + 0.5);
  float light = max(dot(normal, normalize(vec3(0.35, 0.85, 0.4))), 0.0);
  vColor = aColor * (0.7 + 0.3 * light);
  gl_Position = uMvp * vec4(place((aVoxel + 0.5 + aCorner * ${Zs.toFixed(3)}) / uN), 1.0);
}`,tl=`#version 300 es
precision mediump float;
in vec3 vColor;
out vec4 color;
void main() {
  color = vec4(vColor, 1.0);
}`,el=`#version 300 es
in vec3 aPos;
uniform mat4 uMvp;
uniform vec2 uOffset;
void main() {
  gl_Position = uMvp * vec4(aPos, 1.0);
  gl_Position.xy += uOffset * gl_Position.w;
}`,ol=`#version 300 es
precision mediump float;
uniform vec4 uColor;
out vec4 color;
void main() {
  color = uColor;
}`;function nl(){let t=[[[1,0,0],[0,1,0],[0,0,1]],[[-1,0,0],[0,0,1],[0,1,0]],[[0,1,0],[0,0,1],[1,0,0]],[[0,-1,0],[1,0,0],[0,0,1]],[[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[0,1,0],[1,0,0]]],e=[],o=[];for(let[n,a,r]of t){let s=(l,i)=>n.map((u,d)=>u*.5+a[d]*l*.5+r[d]*i*.5);for(let[l,i]of[[-1,-1],[1,-1],[1,1],[-1,-1],[1,1],[-1,1]])e.push(...s(l,i)),o.push(...n)}return{corners:new Float32Array(e),normals:new Float32Array(o),count:36}}var ho=[[[0,0,0],"black"],[[1,0,0],"red"],[[0,1,0],"green"],[[0,0,1],"blue"],[[0,1,1],"cyan"],[[1,0,1],"magenta"],[[1,1,0],"yellow"],[[1,1,1],"white"]],hr=ho.flatMap(([t],e)=>ho.slice(e+1).filter(([o])=>t.reduce((n,a,r)=>n+Math.abs(a-o[r]),0)===1).flatMap(([o])=>[...uo(t),...uo(o)])),pr=1/(2*Math.sqrt(3)),rl=[...Vt(Math.sqrt(2/3)*Yt,[-pr*Yt,pr*Yt]),[0,-Math.sqrt(3)/2*Yt,0],[0,Math.sqrt(3)/2*Yt,0]];function mr(t,e){let o=t.getContext("webgl2",{antialias:!0,premultipliedAlpha:!1});if(!o)return null;let n=gt(o,Qs,tl,["aCorner","aNormal","aVoxel","aColor"],["uMvp","uN"]),a=gt(o,el,ol,["aPos"],["uMvp","uOffset","uColor"]),r=(b,M=o.STATIC_DRAW)=>{let v=o.createBuffer();return o.bindBuffer(o.ARRAY_BUFFER,v),o.bufferData(o.ARRAY_BUFFER,b,M),v},s=(b,M,v=0)=>{o.bindBuffer(o.ARRAY_BUFFER,M),o.enableVertexAttribArray(b),o.vertexAttribPointer(b,3,o.FLOAT,!1,0,0),o.vertexAttribDivisor(b,v)},l=nl(),i=r(new Float32Array(3),o.DYNAMIC_DRAW),u=r(new Float32Array(3),o.DYNAMIC_DRAW),d=o.createVertexArray();o.bindVertexArray(d),s(n.aCorner,r(l.corners)),s(n.aNormal,r(l.normals)),s(n.aVoxel,i,1),s(n.aColor,u,1);let c=o.createVertexArray();o.bindVertexArray(c),s(a.aPos,r(new Float32Array(hr))),o.bindVertexArray(null);let h={...ur},f={colors:[],n:1,count:0},m=0,p=()=>{m||(m=requestAnimationFrame(x))},S={key:"",adjust:null};function x(){m=0;let b=Math.min(window.devicePixelRatio||1,2),M=Math.round(t.clientWidth*b),v=Math.round(t.clientHeight*b);if(!M||!v)return;(t.width!==M||t.height!==v)&&(t.width=M,t.height=v),o.viewport(0,0,M,v),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT|o.DEPTH_BUFFER_BIT);let y=Le(M/v,.1,100);S.key!==`${M}\xD7${v}`&&(S={key:`${M}\xD7${v}`,adjust:qt(y,dr,rl)});let E=Q(S.adjust,Q(y,Ct(h.yaw,h.pitch,dr)));o.enable(o.DEPTH_TEST),o.depthMask(!0),o.disable(o.BLEND),f.count&&(o.useProgram(n.p),o.uniformMatrix4fv(n.uMvp,!1,E),o.uniform1f(n.uN,f.n),o.bindVertexArray(d),o.drawArraysInstanced(o.TRIANGLES,0,l.count,f.count)),o.enable(o.BLEND),o.blendFunc(o.SRC_ALPHA,o.ONE_MINUS_SRC_ALPHA),o.depthMask(!1),o.useProgram(a.p),o.uniformMatrix4fv(a.uMvp,!1,E),o.uniform4fv(a.uColor,tt(t,.45)),o.bindVertexArray(c);let g=t.width/t.clientWidth>=1.5?2:1;for(let L=0;L<g;L++)for(let H=0;H<g;H++)o.uniform2f(a.uOffset,2*L/M,2*H/v),o.drawArrays(o.LINES,0,hr.length/3);o.bindVertexArray(null),w(E,M,v)}let T=ho.map(([b,M])=>{let v=document.createElement("span");return v.textContent=M,e.appendChild(v),{at:uo(b).map(y=>y*Yt),el:v}}),A=new Uint8Array(4);function w(b,M,v){for(let{at:[y,E,g],el:L}of T){let H=b[3]*y+b[7]*E+b[11]*g+b[15],k=((b[0]*y+b[4]*E+b[8]*g+b[12])/H+1)/2,R=(1-(b[1]*y+b[5]*E+b[9]*g+b[13])/H)/2;L.style.left=`${k*100}%`,L.style.top=`${R*100}%`;let P=Math.round(k*M),$=Math.round((1-R)*v),O=!1;P>=0&&P<M&&$>=0&&$<v&&(o.readPixels(P,$,1,1,o.RGBA,o.UNSIGNED_BYTE,A),O=A[3]>240),L.style.visibility=O?"hidden":""}}function C(){let{colors:b,n:M}=f;o.bindBuffer(o.ARRAY_BUFFER,i),o.bufferData(o.ARRAY_BUFFER,new Float32Array(cr(b,M).flat()),o.DYNAMIC_DRAW),o.bindBuffer(o.ARRAY_BUFFER,u),o.bufferData(o.ARRAY_BUFFER,new Float32Array(b.flat()),o.DYNAMIC_DRAW),f.count=b.length}return Ut(t,h,ur,p,{spin:Ks}),new ResizeObserver(p).observe(t),{update(b){f={...f,...b},C(),p()},redraw:p}}function fr(){let t=document.createElement("div");t.className="box palette-cube",t.innerHTML=`
    <div class="palette-cube-stage">
      <canvas class="palette-cube-canvas" tabindex="0" role="img"
        aria-label="The palette's swatches in the RGB cube. Drag or use the arrow keys to turn it, double-click to reset."></canvas>
      <div class="diagram-labels" aria-hidden="true"></div>
      <p class="palette-cube-fallback" hidden>This browser can't show the cube (WebGL2 is unavailable).</p>
    </div>`;let e=null;try{e=mr(t.querySelector(".palette-cube-canvas"),t.querySelector(".diagram-labels"))}catch(o){console.error(o)}return e||(t.querySelector(".palette-cube-fallback").hidden=!1),{element:t,update(o,n){if(!e)return;if(!o){e.update({colors:[],n:1});return}let{rows:a,colors:r}=o;e.update({colors:[...r,...a.flatMap(({tints:s,shades:l})=>[...s,...l])],n:Math.max(r.length,n*2+1)})},redraw(){e?.redraw()}}}function _e(t){let e=t.map(r=>Array.isArray(r)?{base:r,shades:[],tints:[]}:r),o=r=>String(r+1).padStart(2,"0"),n=(r,s)=>[...r.shades.map((l,i)=>({rgb:l,index:s,tone:i-r.shades.length})),{rgb:r.base,index:s,tone:0},...r.tints.map((l,i)=>({rgb:l,index:s,tone:i+1}))],a=e.some(r=>r.shades.length||r.tints.length);return a?{grouped:a,groups:e.map((r,s)=>({name:`${o(s)} ${_(r.base)}`,swatches:n(r,s)}))}:{grouped:a,groups:[{swatches:e.flatMap(n)}]}}var po=t=>t<0?`dark ${-t}`:t>0?`light ${t}`:"",gr=({rgb:t,index:e,tone:o})=>[String(e+1).padStart(2,"0"),po(o),_(t)].filter(Boolean).join(" ");function br(t,e="palette"){let{groups:o}=_e(t);return`:root {
${o.map(({swatches:a})=>a.map(({rgb:r,index:s,tone:l})=>{let i=po(l).replace(" ","-");return`  --${e}-${s+1}${i?`-${i}`:""}: ${_(r)};`}).join(`
`)).join(`

`)}
}
`}function Sr(t,{hue:e="oklab"}={}){let{grouped:o,groups:n}=_e(t),a=s=>{let{h:l,l:i,s:u}=D(s.rgb,{hue:e});return{name:gr(s),...o&&{tone:s.tone},hex:_(s.rgb),rgb:W(s.rgb),hslStar:{h:Pe(l,2),l:Pe(i,2),s:Pe(u,4)}}},r=o?{groups:n.map(({name:s,swatches:l})=>({name:s,colors:l.map(a)}))}:{colors:n[0].swatches.map(a)};return JSON.stringify({space:"HSL*",hueAxis:e,...r},null,2)+`
`}var Pe=(t,e)=>Math.round(t*10**e)/10**e;function yr(t,e="HSL* palette"){let o=[],n=d=>{let c=new Uint8Array((d.length+1)*2);for(let h=0;h<d.length;h++)c[h*2]=d.charCodeAt(h)>>8,c[h*2+1]=d.charCodeAt(h)&255;return c},a=d=>{let c=n(d),h=new Uint8Array(2+c.length);return new DataView(h.buffer).setUint16(0,d.length+1),h.set(c,2),{type:49153,body:h}},r=d=>{let{rgb:c}=d,h=gr(d),f=n(h),m=new Uint8Array(2+f.length+4+12+2),p=new DataView(m.buffer);p.setUint16(0,h.length+1),m.set(f,2);let S=2+f.length;return m.set([82,71,66,32],S),S+=4,W(c).forEach((x,T)=>p.setFloat32(S+T*4,x/255)),p.setUint16(S+12,2),{type:1,body:m}};for(let d of _e(t).groups){let c=d.name?`${e} ${d.name}`:e;o.push(a(c),...d.swatches.map(r),{type:49154,body:new Uint8Array(0)})}let s=12+o.reduce((d,c)=>d+6+c.body.length,0),l=new Uint8Array(s),i=new DataView(l.buffer);l.set([65,83,69,70],0),i.setUint16(4,1),i.setUint16(6,0),i.setUint32(8,o.length);let u=12;for(let{type:d,body:c}of o)i.setUint16(u,d),i.setUint32(u+2,c.length),l.set(c,u+6),u+=6+c.length;return l}function xr(t,e="palette"){var r;let{groups:o}=_e(t),n=s=>({$type:"color",$value:{colorSpace:"srgb",components:s.map(l=>Pe(l,6)),alpha:1,hex:_(s).toUpperCase()}}),a={};for(let{swatches:s}of o)for(let{rgb:l,index:i,tone:u}of s){let d=a[r=i+1]??(a[r]={});d[po(u).replace(" ","-")||"base"]=n(l)}return JSON.stringify({[e]:a},null,2)+`
`}var al='<svg class="icon share-download" viewBox="0 0 18 18" aria-hidden="true"><path d="M9.06 2v9.52m4.33-4.33-4.33 4.33-4.33-4.33M3 15.85h12.12" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',vr=[["CSS","palette.css","text/css",t=>br(t)],["JSON","palette.json","application/json",(t,e)=>Sr(t,{hue:e})],["Adobe Swatch","palette.ase","application/octet-stream",t=>yr(t)],["Figma","palette.tokens.json","application/json",t=>xr(t)]];function sl(t,e,o){let n=URL.createObjectURL(new Blob([e],{type:o})),a=document.createElement("a");a.href=n,a.download=t,document.body.append(a),a.click(),a.remove(),setTimeout(()=>URL.revokeObjectURL(n),1e3)}function mo({label:t,shareLink:e,exports:o=!1}){let n=document.createElement("div");n.className="box share",n.innerHTML=`
    <button type="button" class="share-button">${t}</button>
    ${o?`<div class="share-exports">
      <span>Export</span>
      ${vr.map(([i,u],d)=>`${d===2?'<span class="share-break"></span>':""}<button type="button" class="share-export" data-export="${d}" aria-label="Download ${i} (${u})">${i}${al}</button>`).join("")}
    </div>`:""}`;let a=n.querySelector(".share-button"),r=0;a.addEventListener("click",async()=>{let i=await rt(e());a.textContent=i?"URL copied":"Failed",clearTimeout(r),r=setTimeout(()=>a.textContent=t,1500)});let s=null,l="oklab";for(let i of n.querySelectorAll("[data-export]"))i.addEventListener("click",()=>{if(!s)return;let[,u,d,c]=vr[i.dataset.export];sl(u,c(s.rows,l),d)});return{element:n,update(i,u){s=i,l=u;for(let d of n.querySelectorAll("[data-export]"))d.disabled=!s}}}var wr=[{key:"aa",label:"AA",ratio:4.5,title:"Normal text, level AA: 4.5 : 1"},{key:"aaa",label:"AAA",ratio:7,title:"Normal text, level AAA: 7 : 1"},{key:"aa-large",label:"AA large",ratio:3,title:"Large text (24 px, or 18.7 px bold), level AA: 3 : 1"},{key:"aaa-large",label:"AAA large",ratio:4.5,title:"Large text (24 px, or 18.7 px bold), level AAA: 4.5 : 1"},{key:"ui",label:"UI",ratio:3,title:"Icons, borders and form fields (WCAG 1.4.11): 3 : 1"}],fo=t=>J(W(t).map(e=>V(e/255)));function go(t,e){let o=fo(t),n=fo(e);return(Math.max(o,n)+.05)/(Math.min(o,n)+.05)}function bo(t,e){let o=fo(t),n=(o+.05)/e-.05,a=e*(o+.05)-.05;return{darker:n>=0?It(n):null,lighter:a<=1?It(a):null}}function So({h:t,l:e,s:o},n,a,r){let s=c=>go(F({h:t,l:c,s:o},r),n)>=a;if(s(e))return e;let{darker:l,lighter:i}=bo(n,a),u=[],d=(c,h)=>Math.round((c+h)*10)/10;if(l!==null){let c=Math.min(Math.ceil((l+.5)*10)/10,e);for(;c>=0&&!s(c);)c=d(c,-.1);c>=0&&u.push(c)}if(i!==null){let c=Math.max(Math.floor((i-.5)*10)/10,e);for(;c<=100&&!s(c);)c=d(c,.1);c<=100&&u.push(c)}return u.length?u.reduce((c,h)=>Math.abs(h-e)<Math.abs(c-e)?h:c):null}var ll='<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 9H18V18H9V9Z"/><path d="M6 16V6H16"/></svg>',Lr=ht.find(t=>t.key==="l"),Er={24:"Large text, from 24 px or 18.7 px bold, needs 3:1 for AA and 4.5:1 for AAA.",17:"Text at 17 px isn\u2019t large for WCAG, which starts at 24 px, so it needs 4.5:1 like the rest."},Ar=t=>`Normal text, here at ${t} px, needs 4.5:1 for AA and 7:1 for AAA. The ratio compares how much light the two colors give off, their relative luminance, from 1:1 for two equal colors to 21:1 for black on white. In HSL*, every color with the same L* has the same luminance, so hue and saturation leave the ratio as it is and only lightness moves it. Drag a slider below to find the lightness that passes.`,xt=["background","text"],Mr={background:"Background",text:"Text"},kr=[["AA",4.5],["AAA",7]],il=(t,e,o)=>Math.min(o,Math.max(e,t)),me=t=>t==="text"?"background":"text";function Cr({onContrast:t,onOptions:e,onEditing:o}){let n=document.createElement("div");n.className="box contrast-panel",n.innerHTML=`
    ${at("lightnessOnly","Show lightness only")}
    <div class="contrast-samples">
      ${xt.map(w=>`
        <div class="contrast-sample" data-role="${w}" tabindex="0" role="button" aria-haspopup="dialog"
          aria-label="${Mr[w]} color. Press Enter to edit it.">
          <span class="contrast-hex"><span class="contrast-hex-text"></span>
            <button type="button" class="contrast-copy" aria-label="Copy hex code">${ll}</button></span>
          <div class="contrast-texts">
            <p class="contrast-large"><span class="on-desktop">${Er[24]}</span><span class="on-mobile">${Er[17]}</span></p>
            <p class="contrast-normal"><span class="on-desktop">${Ar(17)}</span><span class="on-mobile">${Ar(13)}</span></p>
          </div>
        </div>`).join("")}
    </div>
    <div class="contrast-controls">
      ${xt.map(w=>`
        <div class="contrast-column" data-role="${w}">
          <div class="contrast-lightness">
            <div class="slider" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="100"
              aria-label="Lightness of the ${w} color"><span class="marker" aria-hidden="true"></span></div>
            <div class="contrast-zones" aria-hidden="true"></div>
            <div class="contrast-scale" aria-hidden="true"><span><span class="tight">L</span>* 0</span><span>50</span><span>100</span></div>
          </div>
          <div class="contrast-fixes">
            ${kr.map(([C,b])=>`<button type="button" class="contrast-fix" data-fix="${b}">Fix ${C}</button>`).join("")}
          </div>
        </div>`).join("")}
    </div>
    <ul class="contrast-legend" aria-hidden="true">
      <li><span class="zone-aaa"></span>passes AAA</li>
      <li><span class="zone-aa"></span>passes AA</li>
      <li><span class="zone-fail"></span>fails</li>
    </ul>
    <ul class="contrast-levels"></ul>
    <p class="contrast-ratio" aria-live="polite"></p>
    <p class="contrast-status visually-hidden" aria-live="polite"></p>`;let a=null,r="oklab",s=!1,l=w=>Pt(a[w]),i=w=>D(l(w),{hue:r}),u=w=>s?Array(3).fill(et(J(w.map(V)))):w,d=(w,C)=>t({[w]:pe(C)});function c(w,C){let b=F({...i(w),l:il(Math.round(C*10)/10,0,100)},{hue:r});d(w,b)}let h=n.querySelector('[data-option="lightnessOnly"]');h.addEventListener("change",()=>e({lightnessOnly:h.checked}));let f=Re({label:"Edit contrast color",onEditing:o,keepOpen:".contrast-sample"}),m=Object.fromEntries(xt.map(w=>[w,n.querySelector(`.contrast-sample[data-role="${w}"]`)]));for(let[w,C]of Object.entries(m)){let b=()=>{f.open(C.getBoundingClientRect(),l(w)??[.5,.5,.5],{onPick:E=>d(w,E),onClose:({replaced:E})=>{C.classList.remove("is-editing"),E||C.focus()}}),C.classList.add("is-editing")};C.addEventListener("click",E=>{E.target.closest(".contrast-copy")||b()}),C.addEventListener("keydown",E=>{E.target!==C||E.key!=="Enter"&&E.key!==" "||(E.preventDefault(),b())});let M=C.querySelector(".contrast-copy"),v=C.querySelector(".contrast-hex-text"),y=0;M.addEventListener("click",async()=>{let E=await rt(_(l(w)));v.textContent=E?"Copied":"Copy failed",clearTimeout(y),y=setTimeout(A,1500)})}let p=Object.fromEntries(xt.map(w=>[w,n.querySelector(`.contrast-column[data-role="${w}"]`)])),S=n.querySelector(".contrast-status"),x=0;for(let[w,C]of Object.entries(p)){Ft(C.querySelector(".slider"),Lr,{valueOf:()=>i(w).l,set:({l:b})=>c(w,b)});for(let b of C.querySelectorAll("[data-fix]"))b.addEventListener("click",()=>{let M=So(i(w),l(me(w)),Number(b.dataset.fix),{hue:r});M!==null&&(c(w,M),S.textContent=`${Mr[w]} color moved to L* ${M.toFixed(1)}.`,clearTimeout(x),x=setTimeout(()=>S.textContent="",2500))})}function T(w){let C=Object.fromEntries(kr.map(([E,g])=>[E,bo(w,g)])),b=(E,{darker:g,lighter:L})=>g!==null&&E<=g||L!==null&&E>=L,M=E=>b(E,C.AAA)?"var(--zone-aaa)":b(E,C.AA)?"var(--zone-aa)":"var(--zone-fail)",v=[],y=null;for(let E=0;E<=100;E+=.25){let g=M(E);g!==y&&(y&&v.push(`${y} ${E}%`),v.push(`${g} ${E}%`),y=g)}return v.push(`${y} 100%`),`linear-gradient(90deg, ${v.join(", ")})`}function A(){if(!a)return;h.checked=s;let w=Object.fromEntries(xt.map(v=>[v,l(v)])),C=xt.every(v=>w[v]);for(let v of n.querySelectorAll("[data-fix]"))v.disabled=!C;if(!C)return;for(let v of xt){let y=m[v];y.style.background=_(u(w[v])),y.style.color=_(u(w[me(v)])),y.querySelector(".contrast-hex-text").textContent=_(w[v]).toUpperCase()}let b=go(w.text,w.background),M=(Math.floor(b*100)/100).toFixed(2);n.querySelector(".contrast-ratio").innerHTML=`${M}<span class="contrast-ratio-to">:1</span>`,n.querySelector(".contrast-ratio").setAttribute("aria-label",`Contrast ratio ${M} to 1`),n.querySelector(".contrast-levels").replaceChildren(...wr.map(v=>{let y=document.createElement("li"),E=b>=v.ratio;return y.className=E?"is-pass":"",y.textContent=`${v.label.replace("large","Large")} ${E?"\u2713":"\u2717"}`,y.title=`${v.title}. ${E?"Passes":"Fails"}.`,y}));for(let v of xt){let y=p[v],E=i(v);Bt(y.querySelector(".slider"),Lr,s?{...E,s:0}:E,r,24),y.querySelector(".contrast-zones").style.background=T(w[me(v)]);for(let g of y.querySelectorAll("[data-fix]")){let L=Number(g.dataset.fix),H=So(E,w[me(v)],L,{hue:r});g.disabled=H===null||b>=L,g.title=H===null?`No lightness reaches ${L} : 1 against the ${me(v)}.`:b>=L?`Already reaches ${L} : 1.`:`Move the ${v} color to L* ${H.toFixed(1)}, keeping hue and saturation.`}}}return{element:n,update(w){a=w.contrast,r=w.mode,s=w.options.lightnessOnly,f.setMode(r),A()}}}var cl={js:["import","from","export","default","let","const","var","new","return","function","if","else"],glsl:["vec2","vec3","vec4","float","int","bool","void","uniform","in","out","const","return","precision","highp"]},ul=/(\/\/.*)|('[^']*'|"[^"]*")|(\b\d+(?:\.\d*)?\b)|([A-Za-z_$][\w$]*)|(=)|([\s\S])/g,yo=t=>t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),vt=(t,e)=>`<span class="hl-${t}">${yo(e)}</span>`;function Tr(t,e){let o=new Set(cl[e]);return t.replace(ul,(n,a,r,s,l,i,u,d)=>{if(a)return vt("comment",a);if(r)return vt("string",r);if(s)return vt("number",s);if(i)return vt("operator",i);if(u)return yo(u);if(o.has(l))return vt("keyword",l);let c=t.slice(d+l.length).match(/^\s*(.)/)?.[1];return c==="("?vt("function",l):t[d-1]==="."?vt("property",l):c===":"?vt("key",l):yo(l)})}var xo='<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 9H18V18H9V9Z"/><path d="M6 16V6H16"/></svg>',dl='<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5L10 17.5L19 7.5"/></svg>',_t="https://github.com/domizai/hsl-star",$t=(t,e)=>`<a href="${e}">${t}</a>`,hl=`import hslStar from './hsl-star.js';

let col = hslStar({ h: 18, s: 0.9, l: 62 });
col.value;  // { h: 18, s: 0.9, l: 62 }
col.hex;    // '#ee7231'
col.rgb;    // { r: 238, g: 114, b: 49 }
col.srgb;   // { r: 0.935, g: 0.446, b: 0.191 }
col.linear; // { r: 0.858, g: 0.167, b: 0.03 }

// change lightness
col = col.with({ l: 30 });

// Supported input formats
col = hslStar('#0000ff');
col = hslStar('rgb(0, 0, 255)');
col = hslStar({ r: 0, g: 0, b: 255 });
col = hslStar([0, 0, 255]);

// fromSrgb is the only way in for 0\u20131 values.
col = hslStar.fromSrgb([1, 0, 1]);`,pl="import hslStar from 'https://cdn.jsdelivr.net/gh/domizai/hsl-star@latest/js/hsl-star.min.js';",ml=`vec3 hslStar = vec3(uv.x * 360.0, uv.y * 100.0, 0.9);
vec3 srgb = hslStarToSrgb(hslStar);

// back to HSL*, on the HSV hue axis
vec3 hls = hslStarFromSrgb(srgb, HSL_STAR_HSV);

// linear-light sRGB, for blending and lighting
vec3 linear = hslStarToLinear(hslStar);`,Hr=[{name:"JS",language:"js",parts:[{html:"<strong>HSL* JavaScript module</strong>"},{html:`The HSL* color space as a single ES module, ${$t("hsl-star.js",`${_t}/blob/main/js/hsl-star.js`)}, with no dependencies. Read more about the HSL* color space ${$t("here",`${_t}#readme`)}.`},{html:"Some examples:"},{code:hl},{html:"Or load it from jsDelivr without copying anything:"},{code:pl},{html:`For TypeScript and editor hints, copy ${$t("hsl-star.d.ts",`${_t}/blob/main/js/hsl-star.d.ts`)} next to it.`}],docs:`${_t}/blob/main/js/README.md`},{name:"GLSL",language:"glsl",parts:[{html:"<strong>HSL* in GLSL</strong>"},{html:`The HSL* color space for shaders, ${$t("hsl-star.glsl",`${_t}/blob/main/glsl/hsl-star.glsl`)}, written for GLSL ES 3.00 (WebGL2) and desktop GLSL 1.30 and later. The precision must be highp, or dark tones band on some phones. Read more about the HSL* color space ${$t("here",`${_t}#readme`)}.`},{html:"Some examples:"},{code:ml},{html:`Try it on ${$t("Shadertoy","https://www.shadertoy.com/view/NXKXzz")}.`}],docs:`${_t}/blob/main/glsl/README.md`}],Rr=t=>t.parts.slice(0,t.parts.findIndex(e=>e.code)),Pr=t=>`<p>${t.html}</p>`,fl=(t,e)=>`<div class="code-block${t.includes(`
`)?"":" is-line"}"><pre><code>${Tr(t,e)}</code></pre>
  <button type="button" class="code-copy" aria-label="Copy the code">${xo}</button></div>`;function _r(){let t=document.createElement("div");t.className="code-tabs",t.innerHTML=`
    <div class="code-tab-list" role="tablist" aria-label="Implementation">
      ${Hr.map((a,r)=>`<button type="button" class="toggle-big code-tab" role="tab" id="code-tab-${r}" aria-controls="code-panel-${r}">${a.name}</button>`).join("")}
    </div>
    ${Hr.map((a,r)=>`
      <div class="box code-panel" role="tabpanel" id="code-panel-${r}" aria-labelledby="code-tab-${r}">
        <div class="code-intro">${Rr(a).map(Pr).join("")}</div>
        ${a.parts.slice(Rr(a).length).map(s=>s.code?fl(s.code,a.language):Pr(s)).join("")}
        <hr class="code-rule">
        <p>${$t("Full documentation",a.docs)} \u2197</p>
      </div>`).join("")}`;let e=[...t.querySelectorAll(".code-tab")],o=[...t.querySelectorAll(".code-panel")];function n(a){e.forEach((r,s)=>{r.setAttribute("aria-selected",String(s===a)),r.tabIndex=s===a?0:-1,o[s].hidden=s!==a})}e.forEach((a,r)=>{a.addEventListener("click",()=>n(r)),a.addEventListener("keydown",s=>{let l={ArrowLeft:-1,ArrowRight:1}[s.key];if(!l)return;let i=(r+l+e.length)%e.length;n(i),e[i].focus()})}),n(0);for(let a of t.querySelectorAll(".code-copy")){let r=0;a.addEventListener("click",async()=>{let s=await rt(a.parentElement.querySelector("code").textContent);a.innerHTML=s?dl:xo,a.setAttribute("aria-label",s?"Copied":"Copy failed"),clearTimeout(r),r=setTimeout(()=>{a.innerHTML=xo,a.setAttribute("aria-label","Copy the code")},1500)})}return{element:t}}var $r=(t,e)=>`<a href="${e}" target="_blank" rel="noopener">${t}</a>`;function Ir(){let t=document.createElement("div");return t.className="footer",t.innerHTML=`
    <p>By ${$r("domizai","https://domizai.ch/")}</p>
    
    <p class="footer-licence">${$r("MIT licence","https://github.com/domizai/hsl-star/blob/main/LICENSE.txt")}</p>`,{element:t}}function gl(t,{hue:e="oklab",longHue:o=!1}={}){if(t.length<2)throw new Error("A palette needs at least two colors.");let n=t.map(r=>D(r,{hue:e}));n.forEach((r,s)=>{if(r.s>1e-6)return;let l=n.slice(s+1).find(i=>i.s>1e-6)??n.slice(0,s).reverse().find(i=>i.s>1e-6);l&&(r.h=l.h)});let a=t.length-1;return r=>{let s=Math.min(Math.max(r,0),1)*a,l=Math.min(Math.floor(s),a-1),i=s-l,u=n[l],d=n[l+1],c=d.h-u.h;return c>180&&(c-=360),c<-180&&(c+=360),o&&c!==0&&(c-=Math.sign(c)*360),F({h:u.h+i*c,l:u.l+i*(d.l-u.l),s:u.s+i*(d.s-u.s)},{hue:e})}}function bl(t,e,o){if(e<t.length)throw new Error("Use at least as many steps as colors.");let n=gl(t,o),a=Array.from({length:e},(s,l)=>n(l/(e-1))),r=t.length-1;for(let s=0;s<=r;s++){let l=s/r*(e-1);Number.isInteger(l)&&(a[l]=t[s])}return a}function Sl(t,e,{hue:o="oklab"}={}){let{h:n,s:a,l:r}=D(t,{hue:o}),s=100/(e+1),l=d=>F({h:n,s:a,l:r+d*s},{hue:o}),i=Math.max(0,Math.ceil(r/s-.5)-1),u=Math.max(0,Math.ceil((100-r)/s-.5)-1);return{shades:Array.from({length:i},(d,c)=>l(c-i)),tints:Array.from({length:u},(d,c)=>l(c+1))}}function Or({stops:t,steps:e,tones:o,longHue:n},a){let r=t.map(Pt);if(r.some(l=>!l)||e<Math.max(2,r.length))return null;let s=bl(r,e,{hue:a,longHue:n});return{colors:s,rows:s.map(l=>({base:l,...Sl(l,o,{hue:a})}))}}function Xt(t){let e=document.createElement("div");e.className="fold";let o=document.createElement("div");return o.className="fold-inner",o.append(t),e.append(o),{element:e,set(n){e.classList.toggle("is-closed",!n),o.inert=!n}}}var yl=t=>Z(getComputedStyle(document.documentElement).getPropertyValue(t)),I=_o({color:ft(yl("--primary")),mode:"oklab",picker:{space:"hsl-star",pureHues:!1,hueSpacing:!1,lightnessOnly:!1},solid:{optimal:!0,cut:!1},cylinder:{atSaturation:!0,cut:!1},palette:{stops:["#1d3557","#f7694f","#f4e9b0"].map(t=>st(t)),steps:21,tones:9,longHue:!1},contrast:{background:st("#f4e9b0"),text:st("#1d3557")},contrastOptions:{lightnessOnly:!1},mini:!1,open:{"color-space":!0,palette:!0,contrast:!0,code:!0},drift:!matchMedia("(prefers-reduced-motion: reduce)").matches,theme:"color"});Fo(I);var Fr=t=>I.update(e=>({...e,theme:t,drift:t==="color"})),Br=Uo({onTheme:Fr,onSection:t=>Ne.goTo(t)});I.watch(t=>t.theme,t=>Br.update({theme:t}));document.getElementById("top").append(Br.element);document.getElementById("intro").append(jo().element,te(["A simple color space built on sRGB with perceptual lightness and perceptually spaced hue. Every combination of hue, saturation and L* is a valid sRGB color, nothing gets clipped or falls out of gamut. Read more about it ",ze("here","https://github.com/domizai/hsl-star"),"."],{half:!0}).element);var vo=t=>I.update(e=>({...e,color:t(e),theme:"color",drift:!1})),fe=t=>vo(e=>Oo(e,t)),$e=t=>vo(()=>ft(t)),Nr=[Go({onChange:fe}),Xo({onChange:fe})];I.watch(t=>({color:t.color,mode:t.mode,theme:t.theme}),(t,e)=>{let o={coords:Ot(e),rgb:ut(e),...Et(e),mode:e.mode};for(let n of Nr)n.update(o)},j);document.getElementById("picker").append(...Nr.map(t=>t.element));document.getElementById("picker").append(te("In an HSL picker, hues at the same height don't look equally light, and hue steps are also not perceptually uniform. The HSL* color space improves upon HSL by addressing perceptual inconsistencies in lightness and hue.",{half:!0}).element);var Dr=Zo({onCoords:fe,onRgb:$e,onMode:t=>I.update(e=>({...e,mode:t})),onOptions:t=>I.update(e=>({...e,picker:{...e.picker,...t}}))});I.watch(t=>({color:t.color,mode:t.mode,picker:t.picker}),(t,e)=>Dr.update({coords:Ot(e),rgb:ut(e),mode:e.mode,options:e.picker}),j);document.getElementById("picker").append(Dr.element);var Ie=cn({onOptions:t=>I.update(e=>({...e,solid:{...e.solid,...t}}))});I.watch(t=>({color:t.color,solid:t.solid}),(t,e)=>Ie.update({color:e.color,options:e.solid}),j);var Oe=document.createElement("div");Oe.id="color-space-body";Ie.element.id="color-space-solid";var wo=Xt(Ie.element);wo.element.classList.add("solid-fold");var qr=Xt(Oe),Vr=le("Color space",{onToggle:()=>I.update(t=>({...t,open:{...t.open,"color-space":!t.open["color-space"]}}))});I.watch(t=>t.open["color-space"],t=>{Vr.update({open:t,controls:`${Ie.element.id} ${Oe.id}`}),wo.set(t),qr.set(t)});document.getElementById("color-space").append(Vr.element,wo.element,qr.element);var Lo=document.createElement("div");Lo.className="diagrams";var[Eo,Ur]=[0,1].map(()=>{let t=document.createElement("div");return t.className="diagrams-column",t});Lo.append(Eo,Ur);Oe.append(Lo);var jr=yn({onOptions:t=>I.update(e=>({...e,cylinder:{...e.cylinder,...t}}))});I.watch(t=>({color:t.color,mode:t.mode,cylinder:t.cylinder}),(t,e)=>jr.update({color:e.color,mode:e.mode,options:e.cylinder}),j);Eo.append(jr.element);var Gr=Rn();I.watch(t=>({color:t.color,mode:t.mode,theme:t.theme}),(t,e)=>Gr.update({color:e.color,background:Et(e).background,mode:e.mode}),j);Eo.append(Gr.element);var zr=qn({onCoords:fe,onRgb:$e,onColor:t=>vo(()=>t)});I.watch(t=>({color:t.color,mode:t.mode,theme:t.theme}),(t,e)=>zr.update({coords:Ot(e),rgb:ut(e),...Et(e)}),j);Ur.append(zr.element);var Fe=Te({onCoords:fe,onRgb:$e,onToggle:()=>I.update(t=>({...t,mini:!t.mini})),onTheme:Fr});I.watch(t=>({color:t.color,mode:t.mode,mini:t.mini,theme:t.theme,drift:t.drift}),(t,e)=>{let o=ut(e);Fe.update({coords:Ot(e),rgb:o,hex:_(o),...Et(e),mode:e.mode,open:e.mini,theme:e.theme,drift:e.drift})},j);document.body.append(Fe.element);var xl=Gn(I),Kt=document.createElement("div");Kt.id="palette-body";Kt.append(te("Blend two or more colors in even steps of hue, saturation and lightness, the short way round the hue circle or the long one. Each color gets its tints and shades in even steps of L*.",{half:!0}).element);var Yr=lr({onPalette:t=>I.update(e=>({...e,palette:{...e.palette,...t}})),onEditing:t=>{Fe.element.hidden=t},current:()=>ut(I.get())});I.watch(t=>({palette:t.palette,mode:t.mode}),(t,e)=>Yr.update({palette:e.palette,mode:e.mode}),j);Kt.append(Yr.element);var Ao=ir({onSelect:$e}),Mo=fr(),Wr=mo({label:"Share palette",shareLink:()=>Ne.shareLink("palette"),exports:!0});I.watch(t=>({palette:t.palette,mode:t.mode}),(t,e)=>{let o=Or(e.palette,e.mode);Ao.update(o),Mo.update(o,e.palette.tones),Wr.update(o,e.mode)},j);I.watch(t=>t.color,()=>{Mo.redraw(),Ao.restyle()});var ko=document.createElement("div");ko.className="palette-views";ko.append(Ao.element,Mo.element);Kt.append(ko,Wr.element);var Xr=Xt(Kt),Kr=le("Palette",{onToggle:()=>I.update(t=>({...t,open:{...t.open,palette:!t.open.palette}}))});I.watch(t=>t.open.palette,t=>{Kr.update({open:t,controls:Kt.id}),Xr.set(t)});document.getElementById("palette").append(Kr.element,Xr.element);var ge=document.createElement("div");ge.id="contrast-body";ge.append(te([ze("WCAG 2","https://www.w3.org/TR/WCAG22/")," measures contrast from luminance, the same Y that HSL* turns into L*. So contrast depends on lightness alone, whatever the hue or saturation."],{half:!0}).element);var Zr=Cr({onContrast:t=>I.update(e=>({...e,contrast:{...e.contrast,...t}})),onOptions:t=>I.update(e=>({...e,contrastOptions:{...e.contrastOptions,...t}})),onEditing:t=>{Fe.element.hidden=t}});I.watch(t=>({contrast:t.contrast,mode:t.mode,options:t.contrastOptions}),(t,e)=>Zr.update({contrast:e.contrast,mode:e.mode,options:e.contrastOptions}),j);var vl=mo({label:"Share contrast",shareLink:()=>Ne.shareLink("contrast")});ge.append(Zr.element,vl.element);var Jr=Xt(ge),Qr=le("Contrast",{onToggle:()=>I.update(t=>({...t,open:{...t.open,contrast:!t.open.contrast}}))});I.watch(t=>t.open.contrast,t=>{Qr.update({open:t,controls:ge.id}),Jr.set(t)});document.getElementById("contrast").append(Qr.element,Jr.element);var Be=document.createElement("div");Be.id="code-body";Be.append(_r().element);var ta=Xt(Be),ea=le("Code",{onToggle:()=>I.update(t=>({...t,open:{...t.open,code:!t.open.code}}))});I.watch(t=>t.open.code,t=>{ea.update({open:t,controls:Be.id}),ta.set(t)});document.getElementById("code").append(ea.element,ta.element);document.getElementById("footer").append(Ir().element);var Ne=rr(I,{isDrifting:xl.isDrifting}),wl=performance.getEntriesByType("navigation")[0]?.type==="reload";Ne.color&&!wl&&I.update(t=>({...t,drift:!1}));
