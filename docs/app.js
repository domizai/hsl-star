var Be=[.2126,.7152,.0722],Ur=216/24389,Ao=24389/27;var rt=(t,e,o)=>Math.min(o,Math.max(e,t)),ct=t=>t>=0&&t<360?t:(t%360+360)%360;function q(t){return t<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}function tt(t){return t=rt(t,0,1),t<=.0031308?12.92*t:1.055*Math.pow(t,1/2.4)-.055}function X([t,e,o]){return Be[0]*t+Be[1]*e+Be[2]*o}function $t(t){return t>Ur?116*Math.cbrt(t)-16:Ao*t}function Kt(t){return t>8?((t+16)/116)**3:t/Ao}function Zt(t){let e=ct(t)/60,o=Math.floor(e)%6,n=e-Math.floor(e),s=1-n;return[[1,n,0],[s,1,0],[0,1,n],[0,s,1],[n,0,1],[1,0,s]][o]}function Gr([t,e,o]){let n=Math.max(t,e,o),s=n-Math.min(t,e,o);if(s===0)return 0;let a;return n===t?a=(e-o)/s:n===e?a=(o-t)/s+2:a=(t-e)/s+4,ct(a*60)}function jr([t,e,o]){let n=Math.cbrt(.4122214708*t+.5363325363*e+.0514459929*o),s=Math.cbrt(.2119034982*t+.6806995451*e+.1073969566*o),a=Math.cbrt(.0883024619*t+.2817188376*e+.6299787005*o),r=1.9779984951*n-2.428592205*s+.4505937099*a,l=.0259040371*n+.7827717662*s-.808675766*a;return ct(Math.atan2(l,r)*180/Math.PI)}var nt=3600,zr=.25,Ne=null;function Eo(){if(Ne)return Ne;let t=new Float64Array(nt+1),e=zr*360/nt,o=0,n=0,s=0;for(let r=0;r<=nt;r++){let l=jr(Zt(r*360/nt).map(q));if(r===0){o=n=l;continue}for(;l-n>180;)l-=360;for(;l-n<-180;)l+=360;s+=Math.max(0,e-(l-n)),t[r]=l-o+s,n=l}let a=360/t[nt];for(let r=0;r<=nt;r++)t[r]*=a;return Ne=t,t}function ut(t,{hue:e="oklab"}={}){if(t=ct(t),e==="hsv")return t;let o=Eo(),n=0,s=nt;for(;s-n>1;){let r=n+s>>1;o[r]<=t?n=r:s=r}let a=(t-o[n])/(o[s]-o[n]);return ct((n+a)*360/nt)}function U(t,{hue:e="oklab"}={}){if(t=ct(t),e==="hsv")return t;let o=Eo(),n=t/360*nt,s=Math.min(Math.floor(n),nt-1);return ct(o[s]+(n-s)*(o[s+1]-o[s]))}function De(t,{hue:e="oklab"}={}){let o=Zt(ut(t,{hue:e})).map(q);return{pure:o,y:X(o)}}function Yr({pure:t,y:e},o,n){let s=Kt(rt(o,0,100));n=rt(n,0,1);let a=s<=e?s/e:(1-s)/(1-e),r=s<=e?0:1-a,l=n*a,i=n*r+(1-n)*s;return t.map(u=>rt(l*u+i,0,1))}function At({h:t,l:e,s:o},n){return Yr(De(t,n),e,o)}function Ve(t,{hue:e="oklab"}={}){let o=X(t),n=rt($t(o),0,100),s=Math.max(...t),a=Math.min(...t),r=s-a;if(r<1e-9)return{h:0,l:n,s:0};let l=Gr(t.map(h=>tt((h-a)/r))),i=Zt(l).map(q),u=X(i),d=o<=u?o/u:(1-o)/(1-u),c=d>0?rt(r/d,0,1):0;return{h:U(l,{hue:e}),l:n,s:c}}function F(t,e){return At(t,e).map(tt)}function N(t,e){return Ve(t.map(q),e)}function G(t){return t.map(e=>Math.round(rt(e,0,1)*255))}function P(t){return"#"+G(t).map(e=>e.toString(16).padStart(2,"0")).join("")}function Wr(t,e,o){let n=a=>(a+ct(t)/30)%12,s=e*Math.min(o,1-o);return[0,8,4].map(a=>o-s*Math.max(-1,Math.min(n(a)-3,9-n(a),1)))}function Y(t){let e=String(t).trim().toLowerCase(),o=e.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/);if(o){let n=o[1];return n.length===3&&(n=[...n].map(s=>s+s).join("")),[0,2,4].map(s=>parseInt(n.slice(s,s+2),16)/255)}if(o=e.match(/^(?:rgba?\()?\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*\)?$/),o){let n=o.slice(1,4).map(Number);if(n.every(s=>s<=255))return n.map(s=>s/255)}if(o=e.match(/^hsla?\(\s*(-?[\d.]+)(deg|turn)?\s*[,\s]\s*(-?[\d.]+)%?\s*[,\s]\s*(-?[\d.]+)%?\s*\)$/),o){let n=Number(o[1])*(o[2]==="turn"?360:1),[s,a]=[o[3],o[4]].map(r=>rt(Number(r)/100,0,1));if([n,s,a].every(Number.isFinite))return Wr(n,s,a)}return null}function Jt({srgb:t=null,coords:e=null},o){let n={},s=(l,i)=>n[l]??(n[l]=i()),a=()=>s("srgb",()=>t??F(e,{hue:o})),r=([l,i,u])=>({r:l,g:i,b:u});return Object.freeze({get value(){return{...s("value",()=>e??N(t,{hue:o}))}},get rgb(){return r(G(a()))},get srgb(){return r(a())},get linear(){return r(a().map(q))},get hex(){return P(a())},with(l){return it({...this.value,...l},{hue:o})},toString(){return this.hex}})}var Xr=t=>t&&["h","l","s"].every(e=>Number.isFinite(t[e])),Mo=t=>t&&["r","g","b"].every(e=>Number.isFinite(t[e]));function ko(t,e,o){let n=Mo(t)?[t.r,t.g,t.b]:t?.length===3?[...t]:null;if(!n?.every(s=>Number.isFinite(s)&&s>=0&&s<=e))throw new RangeError(`${o} takes { r, g, b } or [r, g, b] with channels from 0 to ${e}.`);return n}function it(t,e={}){if(typeof t=="string"){if(/^\s*(rgb|hsl)a?\(/i.test(t))return it.fromCss(t,e);if(/^\s*#?[0-9a-f]+\s*$/i.test(t))return it.fromHex(t,e);throw new Error(`Can't read "${t}" as a color. Use a hex code like '#ee7231', rgb() or hsl().`)}if(Xr(t)){let o={h:ct(t.h),l:rt(t.l,0,100),s:rt(t.s,0,1)};return Jt({coords:o},e.hue??"oklab")}if(Mo(t)||t?.length===3)return it.fromRgb(t,e);throw new TypeError("Make a color from { h, l, s }, { r, g, b }, [r, g, b], a hex code, rgb() or hsl().")}it.fromRgb=(t,{hue:e="oklab"}={})=>Jt({srgb:ko(t,255,"fromRgb").map(o=>o/255)},e);it.fromSrgb=(t,{hue:e="oklab"}={})=>Jt({srgb:ko(t,1,"fromSrgb")},e);it.fromHex=(t,{hue:e="oklab"}={})=>{let o=/^\s*#?([0-9a-f]{3}|[0-9a-f]{6})\s*$/i.test(t)?Y(t):null;if(!o)throw new Error(`Can't read "${t}" as a hex code. Use six or three hex digits, like '#ee7231' or '#e73'.`);return Jt({srgb:o},e)};it.fromCss=(t,{hue:e="oklab"}={})=>{let o=/^\s*(rgb|hsl)a?\(/i.test(t)?Y(t):null;if(!o)throw new Error(`Can't read "${t}" as CSS. Use rgb() with channels from 0 to 255 or hsl() with percentages, like 'rgb(238, 114, 49)' or 'hsl(20.6, 84.8%, 56.3%)'.`);return Jt({srgb:o},e)};function j(t,e){if(Object.is(t,e))return!0;if(!t||!e||typeof t!="object"||typeof e!="object")return!1;let o=Object.keys(t);return o.length===Object.keys(e).length&&o.every(n=>Object.is(t[n],e[n]))}function Co(t){let e=t,o=new Set;function n(){for(let s of[...o])o.has(s)&&s()}return{get:()=>e,set(s){let a={...e,...s};j(e,a)||(e=a,n())},update(s){let a=s(e);a!==e&&(e=a,n())},watch(s,a,r=Object.is){let l=s(e),i=()=>{let u=s(e);r(u,l)||(l=u,a(u,e))};return o.add(i),a(l,e),()=>o.delete(i)}}}function et(t){let{h:e,l:o,s:n}=N(t,{hue:"hsv"});return{hsv:e,l:o,s:n,exact:t}}function gt({color:t}){return t.exact??F({h:t.hsv,l:t.l,s:t.s},{hue:"hsv"})}function It({color:t,mode:e}){return{h:U(t.hsv,{hue:e}),l:t.l,s:t.s}}function To(t,e){let{h:o,l:n,s}={...It(t),...e};return{hsv:ut(o,{hue:t.mode}),l:n,s,exact:null}}function dt({color:t}){let e=t.l>50?5:95;return F({h:t.hsv,l:e,s:t.s},{hue:"hsv"})}function Ho(t,e=document.documentElement){t.watch(o=>o.color,(o,n)=>{e.style.setProperty("--primary",P(gt(n))),e.style.setProperty("--background",P(dt(n)))})}var Kr=[["Color space","#color-space"],["Palette","#palette"],["Contrast","#contrast"],["Code","#code"]],Zr={pause:'<path d="M6.75 3L6.75 21"/><path d="M16.75 3L16.75 21"/>',play:'<path d="M20 12L4.25 4.20577L4.25 19.7942L20 12Z"/>',github:'<path d="M12 0C5.37 0 0 5.37 0 12C0 17.31 3.435 21.795 8.205 23.385C8.805 23.49 9.03 23.13 9.03 22.815C9.03 22.53 9.015 21.585 9.015 20.58C6 21.135 5.22 19.845 4.98 19.17C4.845 18.825 4.26 17.76 3.75 17.475C3.33 17.25 2.73 16.695 3.735 16.68C4.68 16.665 5.355 17.55 5.58 17.91C6.66 19.725 8.385 19.215 9.075 18.9C9.18 18.12 9.495 17.595 9.84 17.31C7.17 17.01 4.38 15.975 4.38 11.385C4.38 10.08 4.845 9 5.61 8.16C5.49 7.86 5.07 6.63 5.73 4.98C5.73 4.98 6.735 4.665 9.03 6.21C9.99 5.94 11.01 5.805 12.03 5.805C13.05 5.805 14.07 5.94 15.03 6.21C17.325 4.65 18.33 4.98 18.33 4.98C18.99 6.63 18.57 7.86 18.45 8.16C19.215 9 19.68 10.065 19.68 11.385C19.68 15.99 16.875 17.01 14.205 17.31C14.64 17.685 15.015 18.405 15.015 19.53C15.015 21.135 15 22.425 15 22.83C15 23.145 15.225 23.52 15.825 23.4C18.2096 22.595 20.2814 21.0617 21.7481 19.0163C23.2148 16.971 24.0025 14.5169 24 12C24 5.37 18.63 0 12 0Z"/>'},qe=t=>`<svg class="icon icon-${t}" viewBox="0 0 24 24" aria-hidden="true">${Zr[t]}</svg>`;function Ro({onToggleDrift:t,onSection:e}){let o=document.createElement("nav");o.className="navigation",o.setAttribute("aria-label","Main"),o.innerHTML=`
    <ul class="navigation-links">
      ${Kr.map(([s,a])=>`<li><a href="${a}">${s}</a></li>`).join("")}
    </ul>
    <div class="navigation-tools">
      <button type="button" class="drift-toggle" aria-label="Color drift">${qe("pause")}${qe("play")}</button>
      <a href="https://github.com/domizai/hsl-star" aria-label="HSL* on GitHub">${qe("github")}</a>
    </div>`;for(let s of o.querySelectorAll(".navigation-links a"))s.addEventListener("click",a=>{a.preventDefault(),e(s.getAttribute("href").slice(1))});let n=o.querySelector(".drift-toggle");return n.addEventListener("click",t),{element:o,update({drifting:s}){n.setAttribute("aria-pressed",String(s))}}}var Jr=`
  <svg viewBox="0 0 1288 525.286" aria-hidden="true">
    <path d="M827.469 8.51823H933.236V425.908H1160.39V516.768H827.469V8.51823Z"/>
    <path d="M579.485 525.286C465.909 525.286 402.023 470.865 387.826 362.022L487.914 352.084C492.173 380.478 501.875 401.773 517.018 415.97C532.161 430.167 553.457 437.265 580.904 437.265C605.512 437.265 623.968 431.35 636.272 419.519C649.049 407.215 655.438 392.072 655.438 374.089C655.438 357.999 650.469 344.512 640.531 333.628C630.593 322.744 614.267 313.989 591.552 307.363L527.666 288.908C489.334 277.55 459.284 259.567 437.515 234.959C416.22 209.878 405.572 179.355 405.572 143.389C405.572 118.781 411.488 95.5927 423.318 73.824C435.622 52.0554 454.315 34.3092 479.396 20.5855C504.477 6.86184 535.474 0 572.386 0C629.174 0 670.818 13.9603 697.319 41.8809C724.293 69.8016 739.437 104.111 742.749 144.809L641.241 152.617C635.562 108.607 611.428 86.6013 568.837 86.6013C548.488 86.6013 532.871 91.5702 521.987 101.508C511.576 110.973 506.37 122.803 506.37 137C506.37 151.671 511.813 163.738 522.697 173.203C533.581 182.194 550.381 189.766 573.096 195.918L627.754 211.534C672.238 223.838 705.127 243.477 726.423 270.452C747.718 297.426 758.366 328.896 758.366 364.861C758.366 393.728 751.504 420.466 737.78 445.074C724.53 469.208 704.418 488.611 677.443 503.281C650.942 517.951 618.289 525.286 579.485 525.286Z"/>
    <path d="M247.736 296.006H105.767V516.768H0V8.51823H105.767V205.146H247.736V8.51823H353.504V516.768H247.736V296.006Z"/>
    <path d="M1060.14 214.373C1077.18 193.078 1098.71 169.416 1124.74 143.389C1085.46 138.183 1054.93 132.031 1033.17 124.933L1053.04 64.5959C1076.7 72.6408 1105.33 84.7082 1138.93 100.798C1133.25 64.8325 1129.94 34.0725 1129 8.51805L1193.59 8.51805C1193.59 25.0811 1190.28 55.8411 1183.65 100.798C1209.68 88.0208 1238.55 75.9534 1270.25 64.5959L1288 124.933C1261.97 132.504 1231.69 138.893 1197.14 144.099C1225.06 171.546 1246.83 194.971 1262.45 214.373L1211.34 252.705C1196.19 232.356 1179.39 205.382 1160.94 171.783C1140.12 208.695 1123.55 235.669 1111.25 252.705L1060.14 214.373Z"/>
  </svg>`;function Po(){let t=document.createElement("h1");return t.className="box wordmark",t.innerHTML=`<span class="visually-hidden">HSL*</span>${Jr}`,{element:t}}function Qt(t,{half:e=!1}={}){let o=document.createElement("div");o.className=e?"box basic-text half":"box basic-text";let n=document.createElement("p");return n.append(...[t].flat()),o.append(n),{element:o}}function Ue(t,e){let o=document.createElement("a");return o.href=e,o.textContent=t,o}function ht({label:t,valueOf:e,set:o,wrap:n=0}){let s=document.createElement("input");s.inputMode="decimal",s.spellcheck=!1,s.autocomplete="off",s.setAttribute("aria-label",t);let a=c=>{let h=Math.round(c);return n?(h%n+n)%n:h},r=()=>{s.style.width=`${Math.max(1,s.value.length)}ch`},l=()=>{s.value=String(a(e())),r()},i=()=>{let c=Number(s.value.replace(",","."));return s.value.trim()!==""&&Number.isFinite(c)?c:null},u=c=>{o(a(a(e())+c)),l()},d=null;return s.addEventListener("focus",()=>{d=e()}),s.addEventListener("input",()=>{r();let c=i();c!==null&&o(c)}),s.addEventListener("change",l),s.addEventListener("keydown",c=>{c.key==="Enter"&&s.blur(),c.key==="Escape"&&(d!==null&&o(d),l(),s.blur()),(c.key==="ArrowUp"||c.key==="ArrowDown")&&(c.preventDefault(),u((c.shiftKey?10:1)*(c.key==="ArrowUp"?1:-1)))}),{input:s,step:u,update(){document.activeElement!==s&&l()}}}var pt=[{key:"h",name:"H",label:"Hue",max:360,unit:"\xB0",toValue:t=>t,fromValue:t=>t},{key:"s",name:"S",label:"Saturation",max:100,unit:"%",toValue:t=>t*100,fromValue:t=>t/100},{key:"l",name:"L*",label:"Lightness",max:100,unit:"",toValue:t=>t,fromValue:t=>t}],Qr=(t,e,o)=>Math.min(o,Math.max(e,t)),ta=(t,e)=>String(Math.round(e)%(t.key==="h"?360:1/0));function Ot(t,e,{valueOf:o,set:n}){let s=l=>n({[e.key]:e.fromValue(Qr(l,0,e.max))}),a=l=>e.key==="h"&&Number.isFinite(l)?s(((o()+l)%360+360)%360):s(o()+l),r=l=>{let i=t.getBoundingClientRect();s((l.clientX-i.left)/i.width*e.max)};t.addEventListener("pointerdown",l=>{t.setPointerCapture(l.pointerId),t.focus(),r(l)}),t.addEventListener("pointermove",l=>{t.hasPointerCapture(l.pointerId)&&r(l)}),t.addEventListener("keydown",l=>{let i=l.shiftKey?10:1,u={ArrowRight:i,ArrowUp:i,ArrowLeft:-i,ArrowDown:-i,PageUp:10,PageDown:-10,Home:-1/0,End:1/0};l.key in u&&(l.preventDefault(),a(u[l.key]))})}function Ft(t,e,o,n,s){let a=Array.from({length:s},(l,i)=>F({...o,[e.key]:e.fromValue(i/(s-1)*e.max)},{hue:n}));t.style.background=`linear-gradient(90deg, ${a.map(P).join(", ")})`;let r=e.toValue(o[e.key]);return t.style.setProperty("--x",r/e.max),t.setAttribute("aria-valuenow",r.toFixed(1)),t.setAttribute("aria-valuetext",`${ta(e,r)}${e.unit}`),a}var ea=64,oa=(t,e,o)=>Math.min(o,Math.max(e,t));function _o({onChange:t}){let e=document.createElement("div");e.className="box hsl-sliders",e.innerHTML=`
    <div class="sliders">
      ${pt.map(r=>`
        <div class="slider" data-axis="${r.key}" tabindex="0" role="slider" aria-label="${r.label}"
          aria-valuemin="0" aria-valuemax="${r.max}">
          <span class="slider-name" aria-hidden="true">${r.name}</span>
          <span class="marker" aria-hidden="true"></span>
        </div>`).join("")}
    </div>
    <div class="values">
      ${pt.map(r=>`
        <label class="value" data-axis="${r.key}">
          <span class="value-name">${r.key==="l"?'<span class="tight">L</span>*':r.name}</span>
          <span class="value-number">${r.unit}</span>
        </label>`).join("")}
    </div>`;let o={h:0,s:0,l:0},n=(r,l)=>t({[r.key]:r.fromValue(oa(l,0,r.max))}),s=r=>r.toValue(o[r.key]),a=pt.map(r=>({axis:r,slider:e.querySelector(`.slider[data-axis="${r.key}"]`),field:ht({label:r.label,valueOf:()=>s(r),set:l=>n(r,l),wrap:r.key==="h"?360:0})}));for(let{axis:r,field:l}of a)e.querySelector(`.value[data-axis="${r.key}"] .value-number`).prepend(l.input);for(let{axis:r,slider:l}of a)Ot(l,r,{valueOf:()=>s(r),set:t});return{element:e,update({coords:r,rgb:l,background:i,mode:u}){o=r;let d=h=>N(h).l,c={background:d(i),primary:d(l)};for(let{axis:h,slider:m,field:b}of a){let p=Ft(m,h,o,u,ea),y=d(p[0]);m.dataset.name=Math.abs(y-c.background)>Math.abs(y-c.primary)?"background":"primary",b.update()}}}}var Bt=Promise.resolve(`// HSL* 0.2.1
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
`);function te({h:t,s:e,l:o}){let n=a=>(a+(t%360+360)%360/30)%12,s=e*Math.min(o,1-o);return[0,8,4].map(a=>o-s*Math.max(-1,Math.min(n(a)-3,9-n(a),1)))}function $o([t,e,o]){let n=Math.max(t,e,o),s=Math.min(t,e,o),a=(n+s)/2,r=n-s;if(r===0)return{h:0,s:0,l:a};let l=r/(1-Math.abs(2*a-1)),i;return n===t?i=(e-o)/r%6:n===e?i=(o-t)/r+2:i=(t-e)/r+4,{h:(i*60+360)%360,s:Math.min(1,l),l:a}}var ee={disc:0,square:1,field:2,hsl:3},na=`#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`,ra=t=>`#version 300 es
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
}`;function aa(t,e,o,{l:n,h:s,s:a,mode:r,grey:l}){let i;if(t===ee.disc){let[u,d]=[e*2-1,o*2-1],c=Math.hypot(u,d);if(c>1)return[0,0,0,0];let h=(Math.atan2(d,u)*180/Math.PI+360)%360;i=F({h,l:n,s:c},{hue:r})}else t===ee.square?i=F({h:s,l:100*o,s:e},{hue:r}):t===ee.field?i=F({h:e*360,l:100*o,s:a},{hue:r}):i=te({h:e*360,s:a,l:o});return l&&(i=Array(3).fill(tt(X(i.map(q))))),[...G(i),255]}var Io=null;function Nt(){return Io??(Io=sa()),Io}function sa(){let t=null,e=null,o=Bt.then(a=>{({gl:t,draw:e}=la(a))}).catch(a=>console.warn("Painting the color fields in JS:",a.message));function n(a,r,l){let i=Math.max(1,Math.round(a.width/4)),u=Math.max(1,Math.round(a.height/4)),d=new ImageData(i,u);for(let m=0;m<u;m++)for(let b=0;b<i;b++)d.data.set(aa(r,(b+.5)/i,1-(m+.5)/u,l),(m*i+b)*4);let c=new OffscreenCanvas(i,u);c.getContext("2d").putImageData(d,0,0);let h=a.getContext("2d");h.clearRect(0,0,a.width,a.height),h.drawImage(c,0,0,a.width,a.height)}function s(a,r,l){if(!e||t.isContextLost())return n(a,ee[r],l);e(a,ee[r],l)}return{ready:o,paint:s}}function la(t){let e=document.createElement("canvas"),o=e.getContext("webgl2",{antialias:!1,depth:!1,preserveDrawingBuffer:!0});if(!o)throw new Error("no WebGL2");let n=(i,u)=>{let d=o.createShader(i);if(o.shaderSource(d,u),o.compileShader(d),!o.getShaderParameter(d,o.COMPILE_STATUS))throw new Error(o.getShaderInfoLog(d));return d},s=o.createProgram();if(o.attachShader(s,n(o.VERTEX_SHADER,na)),o.attachShader(s,n(o.FRAGMENT_SHADER,ra(t))),o.linkProgram(s),!o.getProgramParameter(s,o.LINK_STATUS))throw new Error(o.getProgramInfoLog(s));o.useProgram(s);let a=Object.fromEntries(["uSize","uKind","uAxis","uL","uH","uS","uGrey"].map(i=>[i,o.getUniformLocation(s,i)]));o.bindBuffer(o.ARRAY_BUFFER,o.createBuffer()),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),o.STATIC_DRAW);let r=o.getAttribLocation(s,"aPos");o.enableVertexAttribArray(r),o.vertexAttribPointer(r,2,o.FLOAT,!1,0,0);function l(i,u,{l:d=0,h:c=0,s:h=0,mode:m,grey:b=!1}){let{width:p,height:y}=i;(e.width!==p||e.height!==y)&&(e.width=p,e.height=y),o.viewport(0,0,p,y),o.uniform2f(a.uSize,p,y),o.uniform1i(a.uKind,u),o.uniform1i(a.uAxis,m==="hsv"?1:0),o.uniform1f(a.uL,d),o.uniform1f(a.uH,c),o.uniform1f(a.uS,h),o.uniform1i(a.uGrey,b?1:0),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),o.drawArrays(o.TRIANGLES,0,3);let x=i.getContext("2d");x.clearRect(0,0,p,y),x.drawImage(e,0,0)}return{gl:o,draw:l}}async function at(t){try{return await navigator.clipboard.writeText(t),!0}catch{let e=document.createElement("textarea");e.value=t,e.readOnly=!0,e.style.position="fixed",e.style.top="0",e.style.left="0",e.style.fontSize="16px",e.style.opacity="0",document.body.appendChild(e),e.select(),e.setSelectionRange(0,t.length);let o=!1;try{o=document.execCommand("copy")}catch{o=!1}return e.remove(),o}}var ia='<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 9H18V18H9V9Z"/><path d="M6 16V6H16"/></svg>',oe=(t,e,o)=>Math.min(o,Math.max(e,t)),Oo=t=>(t%360+360)%360;function Fo({onChange:t}){let e=document.createElement("div");e.className="box color-fields",e.innerHTML=`
    <div class="field-swatch">
      <button type="button" class="copy" aria-label="Copy hex code">
        <span class="copy-text"></span>${ia}
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
    </div>`;let[o,n]=e.querySelectorAll(".field"),s=e.querySelector(".copy"),a=e.querySelector(".copy-text"),r=Nt(),l={coords:{h:0,s:0,l:0},hex:"#000000",mode:"oklab"},i={disc:"",square:""},u=0,d=()=>{a.textContent=l.hex.toUpperCase()},c=x=>{a.textContent=x,clearTimeout(u),u=setTimeout(()=>{u=0,d()},1200)};s.addEventListener("click",async()=>{c(await at(l.hex.toUpperCase())?"Copied":"Copy failed")});let h=(x,T)=>{let E=x.getBoundingClientRect();return[(T.clientX-E.left)/E.width,1-(T.clientY-E.top)/E.height]},m={disc([x,T]){let[E,v]=[x*2-1,T*2-1],M=Math.min(1,Math.hypot(E,v));return M>.001?{h:Oo(Math.atan2(v,E)*180/Math.PI),s:M}:{s:M}},square:([x,T])=>({s:oe(x,0,1),l:oe(T*100,0,100)})},b={disc:(x,T,{h:E,s:v})=>({h:Oo(E+x),s:oe(v+T/100,0,1)}),square:(x,T,{s:E,l:v})=>({s:oe(E+x/100,0,1),l:oe(v+T,0,100)})};for(let[x,T]of[[o,"disc"],[n,"square"]])x.addEventListener("pointerdown",E=>{x.setPointerCapture(E.pointerId),x.focus(),t(m[T](h(x,E)))}),x.addEventListener("pointermove",E=>{x.hasPointerCapture(E.pointerId)&&t(m[T](h(x,E)))}),x.addEventListener("keydown",E=>{let v=E.shiftKey?10:1,M={ArrowRight:[v,0],ArrowLeft:[-v,0],ArrowUp:[0,v],ArrowDown:[0,-v]};E.key in M&&(E.preventDefault(),t(b[T](...M[E.key],l.coords)))});function p(x){let T=Math.min(window.devicePixelRatio||1,2),E=Math.round(x.clientWidth*T),v=Math.round(x.clientHeight*T);return x.width===E&&x.height===v?!1:(x.width=E,x.height=v,!0)}function y(x=!1){let{coords:T,mode:E}=l;for(let[v,M,g,A]of[[o,"disc",`${T.l}|${E}`,{l:T.l,mode:E}],[n,"square",`${T.h}|${E}`,{h:T.h,mode:E}]]){let w=v.querySelector("canvas"),f=p(w);!w.width||!x&&!f&&i[M]===g||(r.paint(w,M,A),i[M]=g)}}return r.ready.then(()=>y(!0)),new ResizeObserver(()=>y()).observe(o),{element:e,update({coords:x,rgb:T,background:E,mode:v}){l={coords:x,hex:P(T),mode:v},u||d(),y();let{h:M,s:g,l:A}=x,w=M*Math.PI/180;o.style.setProperty("--x",.5+g/2*Math.cos(w)),o.style.setProperty("--y",.5-g/2*Math.sin(w)),n.style.setProperty("--x",g),n.style.setProperty("--y",1-A/100),o.querySelector(".field-name").textContent=`L*${Math.round(A)}`,n.querySelector(".field-name").textContent=`H${Math.round(M)%360}\xB0`,o.setAttribute("aria-valuetext",`Hue ${Math.round(M)%360}\xB0, saturation ${Math.round(g*100)}%`),n.setAttribute("aria-valuetext",`Saturation ${Math.round(g*100)}%, lightness ${Math.round(A)}`);let f=L=>N(L).l,S=f(F({h:M,l:95,s:.05},{hue:v}));n.dataset.name=Math.abs(S-f(E))>Math.abs(S-f(T))?"background":"primary"}}}var ca=`<svg class="checkbox-box" viewBox="0 0 16.5 16.5" aria-hidden="true">
  <path class="checkbox-frame" d="M0.75 0.75H15.75V15.75H0.75V0.75Z"/>
  <path class="checkbox-tick" d="M3.75 8.75L6.75 11.75L13.25 5.25"/></svg>`,st=(t,e)=>`<label class="checkbox"><input type="checkbox" data-option="${t}">${ca}<span>${e}</span></label>`;var ua=[["pureHues","Show pure hues"],["hueSpacing","Show hue spacing"],["lightnessOnly","Show lightness only"]],da=[60,120,180,240,300],mt=(t,e,o)=>Math.min(o,Math.max(e,t)),be=t=>(t%360+360)%360,Bo={"hsl-star":[{key:"h",name:"H",label:"Hue",unit:"\xB0",wrap:360,get:({coords:t})=>t.h,put:t=>({h:be(t)})},{key:"s",name:"S",label:"Saturation",unit:"%",get:({coords:t})=>t.s*100,put:t=>({s:mt(t,0,100)/100})},{key:"l",name:"L*",label:"Lightness",unit:"",get:({coords:t})=>t.l,put:t=>({l:mt(t,0,100)})}],hsl:[{key:"h",name:"H",label:"HSL hue",unit:"\xB0",wrap:360,get:({hsl:t})=>t.h,put:t=>({h:be(t)})},{key:"s",name:"S",label:"HSL saturation",unit:"%",get:({hsl:t})=>t.s*100,put:t=>({s:mt(t,0,100)/100})},{key:"l",name:"L",label:"HSL lightness",unit:"%",get:({hsl:t})=>t.l*100,put:t=>({l:mt(t,0,100)/100})}]};function No({onCoords:t,onRgb:e,onMode:o,onOptions:n}){let s=document.createElement("div");s.className="large-picker",s.innerHTML=`
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
        ${Object.entries(Bo).map(([p,y])=>`
          <div class="small-values" data-space="${p}">
            ${y.map(x=>`
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
          ${ua.map(([p,y])=>st(p,y)).join("")}
        </div>
      </div>
    </div>`;let a=s.querySelector(".picker-field"),r=a.querySelector("canvas"),l=Nt(),i=null,u="";for(let p of s.querySelectorAll("button[data-space]"))p.addEventListener("click",()=>n({space:p.dataset.space}));for(let p of s.querySelectorAll("[data-mode]"))p.addEventListener("click",()=>o(p.dataset.mode));for(let p of s.querySelectorAll("[data-option]"))p.addEventListener("change",()=>n({[p.dataset.option]:p.checked}));let d=(p,y)=>p==="hsl"?e(te({...i.hsl,...y})):t(y),c=Object.entries(Bo).flatMap(([p,y])=>y.map(x=>{let T=ht({label:x.label,valueOf:()=>x.get(i),set:E=>d(p,x.put(E)),wrap:x.wrap??0});return s.querySelector(`.small-values[data-space="${p}"] [data-key="${x.key}"] .small-value-number`).prepend(T.input),T}));function h([p,y]){let x=mt(p,0,1)*359.99;i.options.space==="hsl"?e(te({h:x,s:i.hsl.s,l:mt(y,0,1)})):t({h:x,l:mt(y,0,1)*100})}let m=p=>{let y=a.getBoundingClientRect();return[(p.clientX-y.left)/y.width,1-(p.clientY-y.top)/y.height]};a.addEventListener("pointerdown",p=>{a.setPointerCapture(p.pointerId),a.focus(),h(m(p))}),a.addEventListener("pointermove",p=>{a.hasPointerCapture(p.pointerId)&&h(m(p))}),a.addEventListener("keydown",p=>{let y=p.shiftKey?10:1,x={ArrowRight:[y,0],ArrowLeft:[-y,0],ArrowUp:[0,y],ArrowDown:[0,-y]};if(!(p.key in x))return;p.preventDefault();let[T,E]=x[p.key];if(i.options.space==="hsl"){let{h:v,l:M}=i.hsl;d("hsl",{h:be(v+T),l:mt(M+E/100,0,1)})}else{let{h:v,l:M}=i.coords;t({h:be(v+T),l:mt(M+E,0,100)})}});function b(){if(!i)return;let p=Math.min(window.devicePixelRatio||1,2),y=Math.round(r.clientWidth*p),x=Math.round(r.clientHeight*p);if(!y||!x)return;let{coords:T,hsl:E,mode:v,options:M}=i,g=M.space==="hsl",A=g?E.s:T.s,w=[y,x,A,v,M.space,M.pureHues,M.hueSpacing,M.lightnessOnly].join();if(w===u)return;r.width=y,r.height=x,l.paint(r,g?"hsl":"field",{s:A,mode:v,grey:M.lightnessOnly}),u=w;let f=r.getContext("2d"),S=k=>(g?k:U(k,{hue:v}))/360*y,L=k=>(1-k)*(x-1);if(M.hueSpacing){f.save(),f.strokeStyle="rgba(0, 0, 0, 0.35)",f.lineWidth=p,f.beginPath();for(let k of da){let R=Math.round(S(k))+.5;f.moveTo(R,0),f.lineTo(R,x)}f.stroke(),f.restore()}if(M.pureHues){f.save(),f.strokeStyle="rgba(0, 0, 0, 0.75)",f.lineWidth=1.25*p,f.lineJoin="round",f.setLineDash([5*p,4*p]),f.beginPath();for(let k=0;k<=y;k++){let R=k/y*360,C=g?.5:$t(De(R,{hue:v}).y)/100;k?f.lineTo(k,L(C)):f.moveTo(k,L(C))}f.stroke(),f.restore()}}return l.ready.then(()=>{u="",b()}),new ResizeObserver(()=>b()).observe(a),{element:s,update({coords:p,rgb:y,mode:x,options:T}){i={coords:p,rgb:y,mode:x,options:T,hsl:$o(y)};let E=T.space==="hsl";for(let g of s.querySelectorAll("button[data-space]"))g.setAttribute("aria-pressed",String(g.dataset.space===T.space));for(let g of s.querySelectorAll("button[data-mode]"))g.setAttribute("aria-pressed",String(g.dataset.mode===x));s.querySelector(".hue-toggle").hidden=E;for(let g of s.querySelectorAll(".small-values"))g.hidden=g.dataset.space!==T.space;for(let g of s.querySelectorAll("[data-option]"))g.checked=T[g.dataset.option];for(let g of c)g.update();let[v,M]=E?[i.hsl.h/360,i.hsl.l]:[p.h/360,p.l/100];a.style.setProperty("--x",v),a.style.setProperty("--y",1-M),a.setAttribute("aria-valuetext",E?`HSL hue ${Math.round(i.hsl.h)%360}\xB0, lightness ${Math.round(i.hsl.l*100)}%`:`Hue ${Math.round(p.h)%360}\xB0, lightness ${Math.round(p.l)}`),b()}}}var ha=.008856451679035631,pa=24389/27,ma=[[.4124564,.3575761,.1804375],[.2126729,.7151522,.072175],[.0193339,.119192,.9503041]],fa=[.95047,1,1.08883];function re(t){return ma.map(([e,o,n])=>e*t[0]+o*t[1]+n*t[2])}var Ge=t=>t>ha?Math.cbrt(t):(pa*t+16)/116;function Do([t,e,o],n=fa){let s=Ge(t/n[0]),a=Ge(e/n[1]),r=Ge(o/n[2]);return[116*a-16,500*(s-a),200*(a-r)]}function Mt(t){return Do(re(t))}var Et=(t,e,o,n)=>{let s=(t-e)/(t<e?o:n);return Math.exp(-.5*s*s)},ga=t=>1.056*Et(t,599.8,37.9,31)+.362*Et(t,442,16,26.7)-.065*Et(t,501.1,20.4,26.2),ba=t=>.821*Et(t,568.8,46.9,40.5)+.286*Et(t,530.9,16.3,31.1),Sa=t=>1.217*Et(t,437,11.8,36)+.681*Et(t,459,26,13.8),Se=[49.9755,54.6482,82.7549,91.486,93.4318,86.6823,104.865,117.008,117.812,114.861,115.923,108.811,109.354,107.802,104.79,107.689,104.405,104.046,100,96.3342,95.788,88.6856,90.0062,89.5991,87.6987,83.2886,83.6992,80.0268,80.2146,82.2778,78.2842,69.7213,71.6091,74.349,61.604,69.8856,75.087,63.5927,46.4182,66.8054,63.3828],Vo=5,je=380,ne=(780-je)/Vo+1;function ya(t){let e=(t-je)/10,o=Math.min(Math.floor(e),Se.length-2);return Se[o]+(e-o)*(Se[o+1]-Se[o])}function xa(){let t=[];for(let o=0;o<ne;o++){let n=je+o*Vo,s=ya(n);t.push([s*ga(n),s*ba(n),s*Sa(n)])}let e=t.reduce((o,n)=>o+n[1],0);return t.map(o=>o.map(n=>n/e))}var ye=null;function ze(){if(ye)return ye;let t=xa(),e=[0,1,2].map(l=>t.reduce((i,u)=>i+u[l],0)),o=[[0,0,0]];for(let l=0;l<2*ne;l++){let i=o[l],u=t[l%ne];o.push([i[0]+u[0],i[1]+u[1],i[2]+u[2]])}let n=ne,s=ne+1,a=new Float32Array(n*s*3);for(let l=0;l<s;l++)for(let i=0;i<n;i++){let u=o[i],d=o[i+l],c=Do([d[0]-u[0],d[1]-u[1],d[2]-u[2]],e);a.set(c,(l*n+i)*3)}let r=[];for(let l=0;l<s-1;l++)for(let i=0;i<n;i++){let u=(i+1)%n,d=l*n+i,c=l*n+u,h=(l+1)*n+i,m=(l+1)*n+u;r.push(d,c,m,d,m,h)}return ye={positions:a,indices:new Uint32Array(r),white:e},ye}function xe(t){let{positions:e,indices:o}=ze(),n=[];for(let s of t)for(let a=0;a<o.length;a+=3){let r=[o[a],o[a+1],o[a+2]],l=[];for(let i=0;i<3;i++){let u=r[i]*3,d=r[(i+1)%3]*3,c=e[u],h=e[d];if(c<s!=h<s){let m=(s-c)/(h-c);l.push(s,e[u+1]+m*(e[d+1]-e[u+1]),e[u+2]+m*(e[d+2]-e[u+2]))}}l.length===6&&n.push(...l)}return new Float32Array(n)}function K(t,e){let o=new Float32Array(16);for(let n=0;n<4;n++)for(let s=0;s<4;s++){let a=0;for(let r=0;r<4;r++)a+=t[r*4+s]*e[n*4+r];o[n*4+s]=a}return o}function qo(t,e,o,n){let s=1/Math.tan(t/2),a=1/(o-n);return new Float32Array([s/e,0,0,0,0,s,0,0,0,0,(n+o)*a,-1,0,0,2*n*o*a,0])}function we(t,e,o){let n=1/(e-o);return new Float32Array([1/t,0,0,0,0,1,0,0,0,0,2*n,0,0,0,(o+e)*n,1])}function kt(t,e,o){let n=Math.cos(t),s=Math.sin(t),a=Math.cos(e),r=Math.sin(e),l=new Float32Array([n,0,-s,0,0,1,0,0,s,0,n,0,0,0,0,1]),i=new Float32Array([1,0,0,0,0,a,r,0,0,-r,a,0,0,0,0,1]),u=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,-o,1]);return K(u,K(i,l))}var ve=1.45;function Dt(t,e,o,n=.92){let s=0;for(let r=-ve;r<=ve+1e-9;r+=.05){let l=K(t,kt(0,r,e));for(let[i,u,d]of o){let c=l[3]*i+l[7]*u+l[11]*d+l[15],h=(l[0]*i+l[4]*u+l[8]*d+l[12])/c,m=(l[1]*i+l[5]*u+l[9]*d+l[13])/c;s=Math.max(s,Math.abs(h),Math.abs(m))}}let a=n/s;return new Float32Array([a,0,0,0,0,a,0,0,0,0,1,0,0,0,0,1])}function Vt(t,e,o=72){return Array.from({length:o},(n,s)=>s/o*2*Math.PI).flatMap(n=>e.map(s=>[t*Math.cos(n),s,-t*Math.sin(n)]))}function bt(t,e,o,n,s){let a=(i,u)=>{let d=t.createShader(i);if(t.shaderSource(d,u),t.compileShader(d),!t.getShaderParameter(d,t.COMPILE_STATUS))throw new Error(t.getShaderInfoLog(d));return d},r=t.createProgram();if(t.attachShader(r,a(t.VERTEX_SHADER,e)),t.attachShader(r,a(t.FRAGMENT_SHADER,o)),t.linkProgram(r),!t.getProgramParameter(r,t.LINK_STATUS))throw new Error(t.getProgramInfoLog(r));let l={p:r};for(let i of n)l[i]=t.getAttribLocation(r,i);for(let i of s)l[i]=t.getUniformLocation(r,i);return l}function Z(t,e){let o=getComputedStyle(t).color.match(/[\d.]+/g)||["128","128","128"];return[o[0]/255,o[1]/255,o[2]/255,e]}var va=4e3;function qt(t,e,o,n,{spin:s=0}={}){let a=-1/0,r=()=>a=performance.now(),l=(p,y)=>{r(),e.yaw+=p,e.pitch=Math.max(-ve,Math.min(ve,e.pitch+y)),n()},i=null;if(t.addEventListener("pointerdown",p=>{t.setPointerCapture(p.pointerId),i={x:p.clientX,y:p.clientY},r()}),t.addEventListener("pointermove",p=>{!i||!t.hasPointerCapture(p.pointerId)||(l((p.clientX-i.x)*.008,(p.clientY-i.y)*.008),i={x:p.clientX,y:p.clientY})}),t.addEventListener("pointerup",()=>{i=null,r()}),t.addEventListener("dblclick",()=>{Object.assign(e,o),r(),n()}),t.addEventListener("keydown",p=>{let y=p.shiftKey?.3:.08,x={ArrowLeft:[-y,0],ArrowRight:[y,0],ArrowUp:[0,-y],ArrowDown:[0,y]};x[p.key]&&(p.preventDefault(),l(...x[p.key]))}),!s)return;let u=matchMedia("(prefers-reduced-motion: reduce)"),d=!1,c=0,h=0,m=p=>{if(c=0,!d||u.matches||!t.clientWidth)return;!i&&p-a>va&&h&&(e.yaw+=s*Math.min(p-h,100)/1e3,n()),h=p,c=requestAnimationFrame(m)},b=()=>{c||(h=0,c=requestAnimationFrame(m))};new IntersectionObserver(([p])=>{d=p.isIntersecting,d&&b()}).observe(t),new ResizeObserver(()=>d&&b()).observe(t),u.addEventListener("change",b)}var ae={hue:"hsv"},St=180,Uo=100,Go=16,wa=[10,20,30,40,50,60,70,80,90],La=35*Math.PI/180,Aa=2*Math.PI/60,jo={yaw:-1.1,pitch:.5},zo=4.5,Ea=Vt(2,[-.5,.5]),Ma=1.4,ka=`
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
}`,Ca=`
precision mediump float;
varying vec3 vColor;
varying float vL;
uniform float uCut;
void main() {
  if (vL > uCut) discard;
  gl_FragColor = vec4(vColor, 1.0);
}`,Ta=`
precision mediump float;
varying float vL;
uniform vec4 uColor;
uniform float uCut;
void main() {
  if (vL > uCut) discard;
  gl_FragColor = uColor;
}`,Yo=t=>tt(Kt(t));function Ha(){let t=St+1,e=Uo+1,o=new Float32Array(t*e*3),n=new Float32Array(t*e*3),s=new Float32Array(t*e*3);for(let a=0;a<e;a++){let r=a/Uo*100;for(let l=0;l<t;l++){let i=l/St*360,u=(a*t+l)*3;o.set(Mt(At({h:i,l:r,s:1},ae)),u),n.set(F({h:i,l:r,s:1},ae),u),s.fill(Yo(r),u,u+3)}}return{lab:o,color:n,grey:s,indices:Wo(t,e)}}function Ra(t){let e=St+1,o=Go+1,n=new Float32Array(e*o*3),s=new Float32Array(e*o*3),a=new Float32Array(e*o*3);for(let r=0;r<o;r++){let l=r/Go;for(let i=0;i<e;i++){let u=i/St*360,d=(r*e+i)*3,c=Mt(At({h:u,l:t,s:l},ae));c[0]=t,n.set(c,d),s.set(F({h:u,l:t,s:l},ae),d),a.fill(Yo(t),d,d+3)}}return{lab:n,color:s,grey:a,indices:Wo(e,o)}}function Wo(t,e){let o=new Uint16Array((t-1)*(e-1)*6),n=0;for(let s=0;s<e-1;s++)for(let a=0;a<t-1;a++){let r=s*t+a;o.set([r,r+1,r+t+1,r,r+t+1,r+t],n),n+=6}return o}function Pa(){let t=new Float32Array((St+1)*3);for(let e=0;e<=St;e++)t.set(Mt(Zt(e/St*360).map(q)),e*3);return t}function Xo(t,{handle:e=t,zoom:o=Ma,maxPixels:n=1/0,marker:s}={}){let a=t.getContext("webgl",{antialias:!0,premultipliedAlpha:!1});if(!a)return null;let r=L=>bt(a,ka,L,["aLab","aColor"],["uMvp","uCut","uColor","uFill","uPointSize","uOffset"]),l=r(Ca),i=r(Ta),u=(L,k=a.ARRAY_BUFFER)=>{let R=a.createBuffer();return a.bindBuffer(k,R),a.bufferData(k,L,a.STATIC_DRAW),R};function d(L){return{lab:u(L.lab),color:u(L.color),grey:u(L.grey),indices:u(L.indices,a.ELEMENT_ARRAY_BUFFER),count:L.indices.length}}let c=d(Ha()),h=xe(wa),m=u(h),b=u(Pa()),p=null,y=null,x={...jo},T={key:"",adjust:null},E={h:0,l:50,s:1,optimal:!0,cut:!1,pureLine:!1,preview:!1,zoom:o},v=0,M=()=>{v||(v=requestAnimationFrame(S))};function g(L,k){a.bindBuffer(a.ARRAY_BUFFER,k),a.enableVertexAttribArray(L),a.vertexAttribPointer(L,3,a.FLOAT,!1,0,0)}function A(L,k,R){let C=l;a.useProgram(C.p),a.uniformMatrix4fv(C.uMvp,!1,k),a.uniform1f(C.uCut,R),a.uniform1f(C.uPointSize,1),g(C.aLab,L.lab),g(C.aColor,E.preview?L.grey:L.color),a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,L.indices),a.drawElements(a.TRIANGLES,L.count,a.UNSIGNED_SHORT,0),a.disableVertexAttribArray(C.aColor)}function w(L,k,R,C,H,_=1e3){let $=i;a.useProgram($.p),a.uniformMatrix4fv($.uMvp,!1,C),a.uniform1f($.uCut,_),a.uniform4fv($.uColor,H),a.uniform1f($.uPointSize,1),g($.aLab,L);let O=f();for(let V=0;V<O;V++)for(let D=0;D<O;D++)a.uniform2f($.uOffset,2*V/t.width,2*D/t.height),a.drawArrays(R,0,k)}let f=()=>(window.devicePixelRatio||1)>=1.5?2:1;function S(){v=0;let L=Math.max(t.clientWidth,t.clientHeight),k=Math.min(window.devicePixelRatio||1,2,n/L),R=Math.round(t.clientWidth*k),C=Math.round(t.clientHeight*k);if(!R||!C)return;(t.width!==R||t.height!==C)&&(t.width=R,t.height=C),a.viewport(0,0,R,C),a.clearColor(0,0,0,0),a.clear(a.COLOR_BUFFER_BIT|a.DEPTH_BUFFER_BIT);let H=R/C,_=qo(La,H,.1,100),$=`${R}\xD7${C}\xD7${E.zoom}`;T.key!==$&&(T={key:$,adjust:Dt(_,zo,Ea,.92*E.zoom)});let O=K(T.adjust,K(_,kt(x.yaw,x.pitch,zo))),V=E.cut?E.l:1e3;a.enable(a.DEPTH_TEST),a.depthMask(!0),a.disable(a.BLEND),a.enable(a.POLYGON_OFFSET_FILL),a.polygonOffset(1,1),A(c,O,V),E.cut&&(y!==E.l&&(p=d(Ra(E.l)),y=E.l),A(p,O,1e3)),a.disable(a.POLYGON_OFFSET_FILL),a.enable(a.BLEND),a.blendFunc(a.SRC_ALPHA,a.ONE_MINUS_SRC_ALPHA),a.depthMask(!1),E.pureLine&&w(b,St+1,a.LINE_STRIP,O,[0,0,0,.8],V),E.optimal&&w(m,h.length/3,a.LINES,O,Z(t,.7));let[D,J,Q]=Mt(At(E,ae)),W=[J*.01,(D-50)*.01,-Q*.01,1],ot=[0,1,3].map(Lt=>O[Lt]*W[0]+O[4+Lt]*W[1]+O[8+Lt]*W[2]+O[12+Lt]*W[3]);s.style.setProperty("--x",(ot[0]/ot[2]+1)/2),s.style.setProperty("--y",(1-ot[1]/ot[2])/2)}return qt(e,x,jo,M,{spin:Aa}),new ResizeObserver(M).observe(t),{update(L){E={...E,...L},M()}}}var _a=/\S+/g;function $a(t,e){let o=document.createTreeWalker(t,NodeFilter.SHOW_TEXT),n=0;for(let s=o.nextNode();s;s=o.nextNode())for(let a of s.data.matchAll(_a)){if(++n<e)continue;let r=a.index+a[0].length;return!s.data.slice(r).trim()&&!Ia(s,t)?!1:(s.data=s.data.slice(0,r).replace(/[\s,.;:–-]+$/,""),Oa(s,t),!0)}return!1}function Ia(t,e){for(let o=t;o!==e;o=o.parentNode)for(let n=o.nextSibling;n;n=n.nextSibling)if(n.textContent.trim())return!0;return!1}function Oa(t,e){for(let o=t;o!==e;o=o.parentNode)for(;o.nextSibling;)o.nextSibling.remove()}function yt(t,{words:e=70}={}){let o=t.innerHTML,n=t.cloneNode(!0);if(!$a(n,e))return;let s=(r,l)=>`<button type="button" class="read-more" aria-expanded="${l}">${r}</button>`;function a(r,l){t.innerHTML=r?`${o} ${s("Show less",!0)}`:`${n.innerHTML}\u2026 ${s("Read more",!1)}`;let i=t.querySelector(".read-more");i.addEventListener("click",()=>a(!r,!0)),l&&i.focus()}a(!1,!1)}var Le={desktop:1.4*(763/1400),mobile:1.4*1.11*(763/1400)},Ye=matchMedia("(max-width: 699.98px)"),Fa=[["optimal","Show optimal color solid"],["cut","Cut at current lightness"]];function Ko({onOptions:t}){let e=document.createElement("div");e.className="box cielab-solid",e.innerHTML=`
    <p class="lead"><strong>CIELAB solid</strong> \u2013 The colored body is every color HSL* can produce, which is the sRGB gamut. Height is L*, the floor is a* and b*. The outline is the optimal color solid: all surface colors that are physically possible under D65. Drag to rotate, double-click to reset.</p>
    <div class="cielab-options">${Fa.map(([n,s])=>st(n,s)).join("")}</div>
    <div class="solid-stage">
      <div class="solid-frame" aria-hidden="true">
        <canvas class="solid-canvas"></canvas>
        <span class="marker"></span>
      </div>
      <div class="solid-handle" tabindex="0" role="img"
        aria-label="The HSL* solid in CIELAB. Drag or use the arrow keys to turn it, double-click to reset."></div>
    </div>`,yt(e.querySelector(".lead"));for(let n of e.querySelectorAll("[data-option]"))n.addEventListener("change",()=>t({[n.dataset.option]:n.checked}));let o=Xo(e.querySelector(".solid-canvas"),{handle:e.querySelector(".solid-handle"),zoom:Ye.matches?Le.mobile:Le.desktop,maxPixels:1800,marker:e.querySelector(".marker")});return Ye.addEventListener("change",()=>o?.update({zoom:Ye.matches?Le.mobile:Le.desktop})),{element:e,update({color:n,options:s}){for(let a of e.querySelectorAll("[data-option]"))a.checked=s[a.dataset.option];o?.update({h:n.hsv,l:n.l,s:n.s,optimal:s.optimal,cut:s.cut})}}}var Zo={open:'<path d="M5 12H19"/>',closed:'<path d="M5 12H19"/><path d="M12 5V19"/>'};function se(t,{onToggle:e}){let o=document.createElement("h2");o.className="box section-title",o.innerHTML=`
    <button type="button" class="section-toggle">
      <span class="section-title-text"></span>
      <svg class="icon section-title-icon" viewBox="0 0 24 24" aria-hidden="true"></svg>
    </button>`;let n=o.querySelector("button");return o.querySelector(".section-title-text").textContent=t,n.addEventListener("click",e),{element:o,update({open:s,controls:a}){n.setAttribute("aria-expanded",String(s)),n.setAttribute("aria-controls",a),o.querySelector("svg").innerHTML=s?Zo.open:Zo.closed}}}var Ut=.75,Ae=2*Ut,xt=360,Jo=[0,25,50,75,100],Qo=[0,60,120,180,240,300],Ba=[.25,.5,.75,1],Ct=1.22,le=.06,We=.14,Na=2*Math.PI/60,tn={yaw:-.6,pitch:.35},en=5,Da=`#version 300 es
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
  gl_Position = uMvp * vec4(s * ${Ut.toFixed(6)} * cos(a), (l / 100.0 - 0.5) * ${Ae.toFixed(6)}, -s * ${Ut.toFixed(6)} * sin(a), 1.0);
}`,Va=t=>`#version 300 es
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
}`,qa=`
attribute vec3 aPos;
uniform mat4 uMvp;
uniform float uPointSize;
uniform vec2 uOffset;
void main() {
  gl_Position = uMvp * vec4(aPos, 1.0);
  gl_Position.xy += uOffset * gl_Position.w;
  gl_PointSize = uPointSize;
}`,Ua=`
precision mediump float;
uniform vec4 uColor;
void main() {
  gl_FragColor = uColor;
}`;function z(t,e,o){let n=t*Math.PI/180;return[o*Ut*Math.cos(n),(e/100-.5)*Ae,-o*Ut*Math.sin(n)]}function Ga(){let t=[];for(let e=0;e<=xt;e++){let o=e/xt*360;t.push(o,0,1,o,100,1)}return new Float32Array(t)}function ja(){let t=[];for(let e=0;e<xt;e++){let[o,n]=[e/xt,(e+1)/xt].map(s=>s*360);t.push((o+n)/2,0,0,o,0,1,n,0,1)}return new Float32Array(t)}function on(t,e,o,{handle:n=t,zoom:s=1,marker:a}={}){let r=t.getContext("webgl2",{antialias:!0,premultipliedAlpha:!1});if(!r)return null;let l=bt(r,Da,Va(o),["aHls"],["uMvp","uSpread","uLift","uCut","uAxis","uPreview"]),u=(C=>bt(r,qa,C,["aPos"],["uMvp","uColor","uFill","uPointSize","uOffset"]))(Ua),d=(C,H=r.ARRAY_BUFFER,_=r.STATIC_DRAW)=>{let $=r.createBuffer();return r.bindBuffer(H,$),r.bufferData(H,C,_),$},c=d(Ga()),h=d(ja()),m=d(new Float32Array(3),r.ARRAY_BUFFER,r.DYNAMIC_DRAW),b={...tn},p={hsv:0,l:50,s:1,mode:"oklab",preview:!1,atSaturation:!1,cut:!1,zoom:s},y=0,x=()=>{y||(y=requestAnimationFrame(w))};function T(C,H){r.bindBuffer(r.ARRAY_BUFFER,H),r.enableVertexAttribArray(C),r.vertexAttribPointer(C,3,r.FLOAT,!1,0,0)}function E(C,H,_,$,O){r.uniform1f(l.uLift,$),r.uniform1f(l.uCut,O),T(l.aHls,C),r.drawArrays(H,0,_)}function v(C,H,_,$){r.bindBuffer(r.ARRAY_BUFFER,m),r.bufferData(r.ARRAY_BUFFER,new Float32Array(C),r.DYNAMIC_DRAW);let O=C.length/3;r.useProgram(u.p),r.uniformMatrix4fv(u.uMvp,!1,_),r.uniform4fv(u.uColor,$),r.uniform1f(u.uPointSize,1),T(u.aPos,m);let V=t.width/t.clientWidth>=1.5?2:1;for(let D=0;D<V;D++)for(let J=0;J<V;J++)r.uniform2f(u.uOffset,2*D/t.width,2*J/t.height),r.drawArrays(H,0,O)}let M=Vt((Ct+le+We)*Ut,[-.5*Ae,.58*Ae]),g={key:"",adjust:null};function A(C,H,_){return g.key!==_&&(g={key:_,adjust:Dt(C,H,M,.92*p.zoom)}),g.adjust}function w(){y=0;let C=Math.min(window.devicePixelRatio||1,2),H=Math.round(t.clientWidth*C),_=Math.round(t.clientHeight*C);if(!H||!_)return;(t.width!==H||t.height!==_)&&(t.width=H,t.height=_),r.viewport(0,0,H,_),r.clearColor(0,0,0,0),r.clear(r.COLOR_BUFFER_BIT|r.DEPTH_BUFFER_BIT);let $=H/_,O=we($,.1,100),V=A(O,en,`${H}\xD7${_}\xD7${p.zoom}`),D=K(V,K(O,kt(b.yaw,b.pitch,en)));r.enable(r.DEPTH_TEST),r.depthMask(!0),r.disable(r.BLEND),r.useProgram(l.p),r.uniformMatrix4fv(l.uMvp,!1,D),r.uniform1f(l.uSpread,p.atSaturation?p.s:1),r.uniform1i(l.uAxis,p.mode==="hsv"?1:0),r.uniform1i(l.uPreview,p.preview?1:0);let J=p.cut?p.l:1e3;E(c,r.TRIANGLE_STRIP,(xt+1)*2,0,J),E(h,r.TRIANGLES,xt*3,0,J),E(h,r.TRIANGLES,xt*3,p.cut?p.l:100,1e3),r.enable(r.BLEND),r.blendFunc(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA),r.depthMask(!1);let Q=S(D),W=[...z(Q,0,Ct),...z(Q,100,Ct)];for(let ft of Jo)W.push(...z(Q,ft,Ct),...z(Q,ft,Ct+le));for(let ft of Qo)W.push(...z(ft,0,1),...z(ft,0,1+le));v(W,r.LINES,D,Z(t,.55)),r.disable(r.DEPTH_TEST);let ot=[];for(let ft of Ba)for(let ge=0;ge<72;ge++)ot.push(...z(ge/72*360,0,ft),...z((ge+1)/72*360,0,ft));v(ot,r.LINES,D,Z(t,.3));let Lt=U(p.hsv,{hue:p.mode}),Lo=z(Lt,p.l,p.s);v([...z(0,0,0),...z(Lt,0,p.s),...Lo],r.LINE_STRIP,D,Z(t,.9));let[Vr,qr]=f(D,Lo);a.style.setProperty("--x",Vr),a.style.setProperty("--y",qr),R(D,H,_,Q)}function f(C,[H,_,$]){let O=C[3]*H+C[7]*_+C[11]*$+C[15];return[((C[0]*H+C[4]*_+C[8]*$+C[12])/O+1)/2,(1-(C[1]*H+C[5]*_+C[9]*$+C[13])/O)/2]}function S(C){return(Math.atan2(C[8],-C[0])*180/Math.PI+360)%360}let L=[...Jo.map(C=>({text:String(C),at:H=>z(H,C,Ct+le+We)})),{text:"L*",at:C=>z(C,108,Ct)},...Qo.map(C=>({text:`${C}\xB0`,at:()=>z(C,0,1+le+We)}))].map(C=>{let H=document.createElement("span");return H.textContent=C.text,e.appendChild(H),{...C,el:H}}),k=new Uint8Array(4);function R(C,H,_,$){for(let{at:O,el:V}of L){let[D,J]=f(C,O($));V.style.left=`${D*100}%`,V.style.top=`${J*100}%`;let Q=Math.round(D*H),W=Math.round((1-J)*_),ot=!1;Q>=0&&Q<H&&W>=0&&W<_&&(r.readPixels(Q,W,1,1,r.RGBA,r.UNSIGNED_BYTE,k),ot=k[3]>240),V.style.visibility=ot?"hidden":""}}return qt(n,b,tn,x,{spin:Na}),new ResizeObserver(x).observe(t),{update(C){p={...p,...C},x()}}}var nn={desktop:1.39,mobile:1.2},an=matchMedia("(max-width: 699.98px)"),rn=()=>an.matches?nn.mobile:nn.desktop,za=[["atSaturation","Show current saturation"],["cut","Cut at current lightness"]];function sn({onOptions:t}){let e=document.createElement("div");e.className="box cylinder",e.innerHTML=`
    <div class="cylinder-options">${za.map(([s,a])=>st(s,a)).join("")}</div>
    <div class="cylinder-stage">
      <canvas class="cylinder-canvas" tabindex="0" role="img"
        aria-label="The HSL* coordinates as a cylinder. Drag or use the arrow keys to turn it, double-click to reset."></canvas>
      <div class="diagram-labels" aria-hidden="true"></div>
      <span class="marker" aria-hidden="true"></span>
    </div>
    <p class="lead"><strong>HSL* cylinder</strong> \u2013 The HSL* coordinates as a cylinder. Unlike HSL's, each level is one lightness, so a cut across it holds colors that look equally light. Hue goes round, saturation out from the grey axis, L* up from black to white. Lines lead to the selected color, along the floor for hue and saturation, then up for lightness. Drag to rotate, double-click to reset. The side is the color field at full saturation, or at the current saturation with the cylinder shrunk to it. A cut at the current lightness shows every hue and saturation there.</p>`,yt(e.querySelector(".lead"));for(let s of e.querySelectorAll("[data-option]"))s.addEventListener("change",()=>t({[s.dataset.option]:s.checked}));let o=null,n=null;return Bt.then(s=>{o=on(e.querySelector(".cylinder-canvas"),e.querySelector(".diagram-labels"),s,{zoom:rn(),marker:e.querySelector(".marker")}),n&&o?.update(n),an.addEventListener("change",()=>o?.update({zoom:rn()}))}).catch(s=>console.error(s)),{element:e,update({color:s,mode:a,options:r}){for(let l of e.querySelectorAll("[data-option]"))l.checked=r[l.dataset.option];n={hsv:s.hsv,l:s.l,s:s.s,mode:a,...r},o?.update(n)}}}var Tt=Math.PI/180,ln=25**7;var cn=(t,e)=>t===0&&e===0?0:(Math.atan2(e,t)/Tt+360)%360;function un([t,e,o],[n,s,a]){let r=(Math.hypot(e,o)+Math.hypot(s,a))/2,l=.5*(1-Math.sqrt(r**7/(r**7+ln))),[i,u]=[e*(1+l),s*(1+l)],[d,c]=[Math.hypot(i,o),Math.hypot(u,a)],[h,m]=[cn(i,o),cn(u,a)],b=n-t,p=c-d,y=0;d*c!==0&&(y=m-h,y>180?y-=360:y<-180&&(y+=360));let x=2*Math.sqrt(d*c)*Math.sin(y/2*Tt),T=(t+n)/2,E=(d+c)/2,v=h+m;d*c!==0&&(Math.abs(h-m)<=180?v/=2:v=h+m<360?(v+360)/2:(v-360)/2);let M=1-.17*Math.cos((v-30)*Tt)+.24*Math.cos(2*v*Tt)+.32*Math.cos((3*v+6)*Tt)-.2*Math.cos((4*v-63)*Tt),g=1+.015*(T-50)**2/Math.sqrt(20+(T-50)**2),A=1+.045*E,w=1+.015*E*M,f=30*Math.exp(-(((v-275)/25)**2)),S=-2*Math.sqrt(E**7/(E**7+ln))*Math.sin(2*f*Tt),[L,k,R]=[b/g,p/A,x/w];return Math.sqrt(L*L+k*k+R*R+S*k*R)}var Xe=.001,dn=.01,Ya=24,Ke=Math.PI/180;function hn([t,e],o,n){let s=Math.min(1,Math.hypot(t,e)),a=s>0?(Math.atan2(e,t)/Ke+360)%360:0;return Mt(At({h:a,l:o,s},{hue:n}))}var ie=(t,e)=>[e*Math.cos(t*Ke),e*Math.sin(t*Ke)];function pn(t,e,o){let[n,s]=[0,-1],a=Math.min(e,o),r=t(a);if(Math.abs(r)<dn)return a;if(r<0)for(;r<0;){if(a>=o)return null;[n,s]=[a,r],a=Math.min(a*2,o),r=t(a)}let l=0;for(let i=0;i<Ya;i++){let u=a-r*(a-n)/(r-s),d=t(u);if(Math.abs(d)<dn)return u;d>0?([a,r]=[u,d],l===1&&(s/=2),l=1):([n,s]=[u,d],l===-1&&(r/=2),l=-1)}return(n+a)/2}function mn(t,e,{hue:o="oklab",difference:n=un,steps:s=72}={}){let a=hn(t,e,o),r=[];for(let l=0;l<s;l++){let i=2*Math.PI*l/s,[u,d]=[Math.cos(i),Math.sin(i)],c=y=>{let x=y*(t[0]*u+t[1]*d);return-x+Math.sqrt(x*x+1-(t[0]**2+t[1]**2))},h=y=>x=>n(a,hn([t[0]+y*x*u,t[1]+y*x*d],e,o))-1,m=h(c(1)>Xe?1:-1)(Xe)+1;if(!(m>1e-9))return null;let b=Xe/m,p=pn(h(1),b,c(1))??pn(h(-1),b,c(-1))??b;r.push([t[0]+p*u,t[1]+p*d])}return r}var fn=2,Wa=[.25,.5,.75,1],Xa=[.25,.5,.75],Gt=12,gn=3,Ka=t=>`#version 300 es
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
}`;function Za(t){let e=document.createElement("canvas"),o=e.getContext("webgl2",{antialias:!1,depth:!1,premultipliedAlpha:!1,preserveDrawingBuffer:!0});if(!o)return null;let n=(l,i)=>{let u=o.createShader(l);if(o.shaderSource(u,i),o.compileShader(u),!o.getShaderParameter(u,o.COMPILE_STATUS))throw new Error(o.getShaderInfoLog(u));return u},s=o.createProgram();if(o.attachShader(s,n(o.VERTEX_SHADER,`#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`)),o.attachShader(s,n(o.FRAGMENT_SHADER,Ka(t))),o.linkProgram(s),!o.getProgramParameter(s,o.LINK_STATUS))throw new Error(o.getProgramInfoLog(s));o.useProgram(s);let a=l=>o.getUniformLocation(s,l);o.bindBuffer(o.ARRAY_BUFFER,o.createBuffer()),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),o.STATIC_DRAW);let r=o.getAttribLocation(s,"aPos");return o.enableVertexAttribArray(r),o.vertexAttribPointer(r,2,o.FLOAT,!1,0,0),(l,{cx:i,cy:u,radius:d},{l:c,mode:h,preview:m})=>{let{width:b,height:p}=l.canvas;(e.width!==b||e.height!==p)&&(e.width=b,e.height=p),o.viewport(0,0,b,p),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),o.uniform3f(a("uDisc"),i,p-u,d),o.uniform1f(a("uL"),c),o.uniform1i(a("uAxis"),h==="hsv"?1:0),o.uniform1i(a("uPreview"),m?1:0),o.drawArrays(o.TRIANGLES,0,3),l.drawImage(e,0,0)}}function bn(t,{cx:e,cy:o,radius:n},{l:s,mode:a,preview:r}){let l=Math.ceil(n*2),[i,u]=[Math.floor(e-n),Math.floor(o-n)],d=t.getImageData(i,u,l,l);for(let c=0;c<l;c++)for(let h=0;h<l;h++){let m=(i+h+.5-e)/n,b=(o-(u+c+.5))/n,p=Math.hypot(m,b);if(p>1)continue;let y=(Math.atan2(b,m)*180/Math.PI+360)%360,x=G(F({h:y,l:s,s:r?0:p},{hue:a}));d.data.set([...x,255],(c*l+h)*4)}t.putImageData(d,i,u)}function Sn(t,e,{marker:o}={}){let n=bn;try{n=Za(e)??bn}catch(d){console.warn("Painting the \u0394E disc in JS:",d.message)}let s={hsv:0,l:50,s:1,mode:"oklab",preview:!1,line:"#ffffff"},a={key:"",shapes:[]};function r(d,c){let h=`${d} ${c}`;if(a.key===h)return a.shapes;let m=[[0,0]];for(let p of Xa)for(let y=0;y<Gt;y++)m.push(ie(360*y/Gt,p));let b=m.map(p=>({centre:p,points:mn(p,d,{hue:c})})).filter(p=>p.points);return a={key:h,shapes:b},b}let l=0,i=()=>{l||(l=requestAnimationFrame(u))};function u(){l=0;let d=Math.min(window.devicePixelRatio||1,2),c=Math.round(t.clientWidth*d),h=Math.round(t.clientHeight*d);if(!c||!h)return;(t.width!==c||t.height!==h)&&(t.width=c,t.height=h);let m=t.getContext("2d");m.clearRect(0,0,c,h);let b=parseFloat(getComputedStyle(t).fontSize)*d,p=Math.min(c,h)/2-gn*b,y={cx:c/2,cy:h/2,radius:p},x=([S,L])=>[y.cx+S*p,y.cy-L*p],T=S=>`rgba(${Z(t,1).slice(0,3).map(L=>Math.round(L*255)).join(", ")}, ${S})`,{l:E,mode:v,preview:M}=s;n(m,y,{l:E,mode:v,preview:M}),m.lineWidth=d,m.strokeStyle="rgba(0, 0, 0, 0.18)",m.beginPath();for(let S of Wa)m.moveTo(y.cx+S*p,y.cy),m.arc(y.cx,y.cy,S*p,0,2*Math.PI);for(let S=0;S<Gt;S++)m.moveTo(y.cx,y.cy),m.lineTo(...x(ie(360*S/Gt,1)));m.stroke(),m.font=`${b}px ${getComputedStyle(t).fontFamily}`,m.fillStyle=T(.6),m.textAlign="center",m.textBaseline="middle";for(let S=0;S<Gt;S+=2){let L=360*S/Gt;m.fillText(`${L}\xB0`,...x(ie(L,1+gn*.5*b/p)))}let g=r(E,v);(()=>{m.beginPath();for(let{centre:S,points:L}of g)L.forEach(([k,R],C)=>{let H=x([S[0]+(k-S[0])*fn,S[1]+(R-S[1])*fn]);C?m.lineTo(...H):m.moveTo(...H)}),m.closePath()})(),m.strokeStyle=s.line,m.lineWidth=d,m.stroke();let[w,f]=x(ie(U(s.hsv,{hue:v}),s.s));o.style.setProperty("--x",w/c),o.style.setProperty("--y",f/h)}return new ResizeObserver(i).observe(t),{update(d){s={...s,...d},i()}}}var Ja=50;function yn(){let t=document.createElement("div");t.className="box delta-e",t.innerHTML=`
    <div class="delta-e-stage">
      <canvas class="delta-e-canvas" role="img" aria-label="HSL* disc at L* 50 with \u0394E 2000 ellipses"></canvas>
      <span class="marker" aria-hidden="true"></span>
    </div>
    <p class="delta-e-text"><strong>\u0394E 2000</strong> \u2013 How evenly HSL* is spaced to the eye. The disc is the HSL* field at L* 50, hue round, saturation out from the grey centre. Each ring marks the colors one \u0394E 2000 away from its centre, drawn twice as large. Large rings mean HSL* changes little to the eye there. Long ones mean a step one way shows less than a step the other way.</p>`,yt(t.querySelector(".delta-e-text"));let e=null,o=null;return Bt.then(n=>{e=Sn(t.querySelector(".delta-e-canvas"),n,{marker:t.querySelector(".delta-e-stage .marker")}),o&&e.update(o)}).catch(n=>console.error(n)),{element:t,update({color:n,background:s,mode:a}){o={hsv:n.hsv,l:Ja,s:n.s,mode:a,line:P(s)},e?.update(o)}}}var Ze=[[380,.17411,.00496],[385,.17401,.00498],[390,.1738,.00492],[395,.17356,.00492],[400,.17334,.0048],[405,.17302,.00478],[410,.17258,.0048],[415,.17209,.00483],[420,.17141,.0051],[425,.1703,.00579],[430,.16888,.0069],[435,.1669,.00855],[440,.16441,.01086],[445,.16111,.01379],[450,.15664,.01771],[455,.15099,.02274],[460,.14396,.0297],[465,.1355,.03988],[470,.12412,.0578],[475,.1096,.08684],[480,.09129,.1327],[485,.06871,.20072],[490,.04539,.29498],[495,.02346,.4127],[500,.00817,.53842],[505,.00386,.65482],[510,.01387,.75019],[515,.03885,.81202],[520,.0743,.8338],[525,.11416,.82621],[530,.15472,.80586],[535,.19288,.78163],[540,.22962,.75433],[545,.26578,.72432],[550,.3016,.69231],[555,.33736,.65885],[560,.3731,.62445],[565,.40873,.58961],[570,.44406,.55472],[575,.47878,.5202],[580,.51249,.48659],[585,.54479,.45443],[590,.57515,.42423],[595,.60293,.3965],[600,.62704,.37249],[605,.64823,.3514],[610,.66576,.33401],[615,.68008,.31975],[620,.69151,.30834],[625,.70061,.2993],[630,.70792,.29203],[635,.71403,.28593],[640,.71903,.28094],[645,.72303,.27695],[650,.72599,.27401],[655,.72827,.27173],[660,.72997,.27003],[665,.73109,.26891],[670,.73199,.26801],[675,.73272,.26728],[680,.73342,.26658],[685,.73405,.26595],[690,.73439,.26561],[695,.73459,.26541],[700,.73469,.26531]];var xn=([t,e,o])=>t+e+o>0?[t/(t+e+o),e/(t+e+o)]:null,ce=t=>xn(re(t)),Ee=[[1,0,0],[0,1,0],[0,0,1]].map(ce),Me=ce([1,1,1]);function Je(){let[t,e,o]=[[1,0,0],[0,1,0],[0,0,1]].map(re),n=t[0]*(e[1]*o[2]-o[1]*e[2])-e[0]*(t[1]*o[2]-o[1]*t[2])+o[0]*(t[1]*e[2]-e[1]*t[2]),s=[[e[1]*o[2]-o[1]*e[2],o[0]*e[2]-e[0]*o[2],e[0]*o[1]-o[0]*e[1]],[o[1]*t[2]-t[1]*o[2],t[0]*o[2]-o[0]*t[2],o[0]*t[1]-t[0]*o[1]],[t[1]*e[2]-e[1]*t[2],e[0]*t[2]-t[0]*e[2],t[0]*e[1]-e[0]*t[1]]].map(a=>a.map(r=>r/n));return[0,1,2].flatMap(a=>s.map(r=>r[a]))}function vn(t){let e=r=>re(r)[1],o=[0,1,2,3,4,5,6,7].map(r=>[r&1,r>>1&1,r>>2&1]),n=[];for(let r of o)for(let l of o){if(r.reduce((h,m,b)=>h+(l[b]-m),0)!==1||r.some((h,m)=>h>l[m]))continue;let[i,u]=[e(r),e(l)];if((i-t)*(u-t)>0||i===u)continue;let d=(t-i)/(u-i),c=ce(r.map((h,m)=>h+d*(l[m]-h)));c&&n.push(c)}if(n.length<3)return[];let[s,a]=n.reduce(([r,l],[i,u])=>[r+i/n.length,l+u/n.length],[0,0]);return n.sort((r,l)=>Math.atan2(r[1]-a,r[0]-s)-Math.atan2(l[1]-a,l[0]-s))}function wn(t){let{white:e}=ze(),o=xe([t]),n=a=>a>6/29?a**3:3*(6/29)**2*(a-4/29),s=[];for(let a=0;a<o.length;a+=3){let[r,l,i]=o.subarray(a,a+3),u=(r+16)/116,d=xn([e[0]*n(u+l/500),e[1]*n(u),e[2]*n(u-i/200)]);s.push(...d)}return s}var ue=.8,de=.9,jt={left:36,right:12,top:12,bottom:30},Qa=[0,.1,.2,.3,.4,.5,.6,.7,.8,.9],ts=[460,480,490,500,510,520,540,560,580,600,620],es=`#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`,os=`#version 300 es
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
}`;function ns(){let t=document.createElement("canvas"),e=t.getContext("webgl2",{antialias:!1,depth:!1,premultipliedAlpha:!1,preserveDrawingBuffer:!0});if(!e)return null;let o=(r,l)=>{let i=e.createShader(r);if(e.shaderSource(i,l),e.compileShader(i),!e.getShaderParameter(i,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(i));return i},n=e.createProgram();if(e.attachShader(n,o(e.VERTEX_SHADER,es)),e.attachShader(n,o(e.FRAGMENT_SHADER,os)),e.linkProgram(n),!e.getProgramParameter(n,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(n));e.useProgram(n);let s=r=>e.getUniformLocation(n,r);e.uniformMatrix3fv(s("uXyzToRgb"),!1,Je()),e.bindBuffer(e.ARRAY_BUFFER,e.createBuffer()),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);let a=e.getAttribLocation(n,"aPos");return e.enableVertexAttribArray(a),e.vertexAttribPointer(a,2,e.FLOAT,!1,0,0),(r,{origin:l,scale:i},u,d)=>{let{width:c,height:h}=r.canvas;(t.width!==c||t.height!==h)&&(t.width=c,t.height=h),e.viewport(0,0,c,h),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.uniform3f(s("uMap"),l[0],h-l[1],i),e.uniform1f(s("uY"),u),e.uniform1i(s("uPreview"),d?1:0),e.drawArrays(e.TRIANGLES,0,3),r.drawImage(t,0,0)}}function Ln(t,{origin:e,scale:o},n,s){let a=Je(),r=Ee.map(([b])=>e[0]+b*o),l=Ee.map(([,b])=>e[1]-b*o),[i,u]=[Math.floor(Math.min(...r)),Math.ceil(Math.max(...r))],[d,c]=[Math.floor(Math.min(...l)),Math.ceil(Math.max(...l))],h=t.getImageData(i,d,u-i,c-d),m=G([tt(n)])[0];for(let b=d;b<c;b++)for(let p=i;p<u;p++){let y=(p+.5-e[0])/o,x=(e[1]-b-.5)/o;if(x<=0)continue;let T=[y/x*n,n,(1-y-x)/x*n],E=[0,1,2].map(M=>a[M]*T[0]+a[3+M]*T[1]+a[6+M]*T[2]);if(E.some(M=>M<-1e-4||M>1+1e-4))continue;let v=s?[m,m,m]:G(E.map(tt));h.data.set([...v,255],((b-d)*(u-i)+(p-i))*4)}t.putImageData(h,i,d)}function An(t,{marker:e}={}){let o=Ln;try{o=ns()??Ln}catch(l){console.warn("Filling the chromaticity chart in JS:",l.message)}let n={rgb:[.5,.5,.5],l:50,preview:!1},s=0,a=()=>{s||(s=requestAnimationFrame(r))};function r(){s=0;let l=Math.min(window.devicePixelRatio||1,2),i=Math.round(t.clientWidth*l),u=Math.round(t.clientHeight*l),d=l*parseFloat(getComputedStyle(t).fontSize)/11;if(!i||!u)return;(t.width!==i||t.height!==u)&&(t.width=i,t.height=u);let c=t.getContext("2d");c.clearRect(0,0,i,u);let h=Math.min((i-(jt.left+jt.right)*d)/ue,(u-(jt.top+jt.bottom)*d)/de),m=[jt.left*d,jt.top*d+de*h],b=([f,S])=>[m[0]+f*h,m[1]-S*h],p=f=>`rgba(${Z(t,1).slice(0,3).map(S=>Math.round(S*255)).join(", ")}, ${f})`,y=`${11*d}px ${getComputedStyle(t).fontFamily}`,x=(f,{alpha:S,width:L=1,dash:k=[],close:R=!1})=>{c.beginPath(),f.forEach((C,H)=>H?c.lineTo(...b(C)):c.moveTo(...b(C))),R&&c.closePath(),c.strokeStyle=p(S),c.lineWidth=L*d,c.setLineDash(k.map(C=>C*d)),c.stroke(),c.setLineDash([])},T=Kt(n.l);o(c,{origin:m,scale:h},T,n.preview),c.font=y,c.fillStyle=p(.6);for(let f of Qa)f<=ue&&(x([[f,0],[f,de]],{alpha:.07}),c.textAlign="center",c.textBaseline="top",c.fillText(f.toFixed(1),...b([f,0]).map((S,L)=>S+(L?6*d:0)))),x([[0,f],[ue,f]],{alpha:.07}),c.textAlign="right",c.textBaseline="middle",c.fillText(f.toFixed(1),...b([0,f]).map((S,L)=>S-(L?0:6*d)));c.textAlign="right",c.textBaseline="bottom",c.fillText("x",b([ue,0])[0],b([ue,0])[1]-4*d),c.textAlign="left",c.textBaseline="top",c.fillText("y",b([0,de])[0]+4*d,b([0,de])[1]);let E=Ze.map(([,f,S])=>[f,S]);x(E,{alpha:.75,width:1.25,close:!0}),c.fillStyle=p(.6);for(let[f,S,L]of Ze){if(!ts.includes(f))continue;let[k,R]=[S-Me[0],L-Me[1]],C=Math.hypot(k,R),[H,_]=[k/C,R/C];x([[S,L],[S+H*.012,L+_*.012]],{alpha:.75});let[$,O]=b([S+H*.02,L+_*.02]);c.textAlign=H>.3?"left":H<-.3?"right":"center",c.textBaseline=_>.3?"bottom":_<-.3?"top":"middle",c.fillText(String(f),$,O)}x(Ee,{alpha:.5,dash:[4,3],close:!0});let v=vn(T);v.length&&x(v,{alpha:.45,close:!0});let M=wn(n.l);c.beginPath();for(let f=0;f<M.length;f+=4)c.moveTo(...b([M[f],M[f+1]])),c.lineTo(...b([M[f+2],M[f+3]]));c.strokeStyle=p(.85),c.lineWidth=1.25*d,c.stroke();let[g,A]=b(Me);c.beginPath(),c.moveTo(g-4*d,A),c.lineTo(g+4*d,A),c.moveTo(g,A-4*d),c.lineTo(g,A+4*d),c.strokeStyle=p(.7),c.lineWidth=d,c.stroke();let w=ce(n.rgb.map(q));if(e.hidden=!w,w){let[f,S]=b(w);e.style.setProperty("--x",f/i),e.style.setProperty("--y",S/u)}}return new ResizeObserver(a).observe(t),{update(l){n={...n,...l},a()}}}var Qe=[{name:"BR",label:"Blue to red",from:2,to:0},{name:"RG",label:"Red to green",from:0,to:1},{name:"GB",label:"Green to blue",from:1,to:2}],En=1e-9;function to(t,e){let o=e[t.from]+e[t.to];return o>En?e[t.to]/o:.5}function eo(t,e,o){let n=e[t.from]+e[t.to],s=X(e);if(n<=En||s<=0)return null;let a=[...e];a[t.from]=(1-o)*n,a[t.to]=o*n;let r=s/X(a);return Ve(a.map(l=>l*r),{hue:"hsv"})}var rs='<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 9H18V18H9V9Z"/><path d="M6 16V6H16"/></svg>',oo=(t,e,o)=>Math.min(o,Math.max(e,t)),as=t=>(t%360+360)%360,Mn=[{key:"h",name:"H",label:"Hue",unit:"\xB0",wrap:360,get:t=>t.h,put:t=>({h:as(t)})},{key:"s",name:"S",label:"Saturation",unit:"%",get:t=>t.s*100,put:t=>({s:oo(t,0,100)/100})},{key:"l",name:"L*",label:"Lightness",unit:"",get:t=>t.l,put:t=>({l:oo(t,0,100)})}],kn=["R","G","B"].map((t,e)=>({key:t.toLowerCase(),name:t,label:`${t}, 0 to 255`,channel:e}));function ke({onCoords:t,onRgb:e}){let o=document.createElement("div");o.className="color-values",o.innerHTML=`
    <div class="small-values" data-group="hsl">
      ${Mn.map(h=>`
        <label class="small-value" data-key="${h.key}">
          <span class="small-value-name">${h.name==="L*"?'<span class="tight">L</span>*':h.name}</span>
          <span class="small-value-number">${h.unit}</span>
        </label>`).join("")}
    </div>
    <div class="small-values" data-group="rgb">
      ${kn.map(h=>`
        <label class="small-value" data-key="${h.key}">
          <span class="small-value-name">${h.name}</span>
          <span class="small-value-number"></span>
        </label>`).join("")}
    </div>
    <div class="hex-value">
      <span class="small-value-number"><input class="hex-input" spellcheck="false" autocomplete="off" aria-label="Hex code"></span>
      <button type="button" class="hex-copy" aria-label="Copy hex code">${rs}</button>
      <span class="hex-note" role="status"></span>
    </div>`;let n={coords:{h:0,s:0,l:0},rgb:[0,0,0]},s=(h,m,b)=>o.querySelector(`.small-values[data-group="${h}"] [data-key="${m}"] .small-value-number`).prepend(b),a=[...Mn.map(h=>{let m=ht({label:h.label,valueOf:()=>h.get(n.coords),set:b=>t(h.put(b)),wrap:h.wrap??0});return s("hsl",h.key,m.input),m}),...kn.map(h=>{let m=ht({label:h.label,valueOf:()=>n.rgb[h.channel]*255,set:b=>e(n.rgb.map((p,y)=>y===h.channel?oo(Math.round(b),0,255)/255:p))});return s("rgb",h.key,m.input),m})],r=o.querySelector(".hex-input"),l=()=>{r.value=P(n.rgb)},i=h=>new RegExp(`^\\s*#?([0-9a-f]{${h}})\\s*$`,"i").test(r.value)?Y(r.value):null,u=null;r.addEventListener("focus",()=>{u=n.rgb}),r.addEventListener("input",()=>{let h=i(6);h&&e(h)}),r.addEventListener("change",()=>{let h=i(3);h&&e(h),l()}),r.addEventListener("keydown",h=>{h.key==="Enter"&&r.blur(),h.key==="Escape"&&(u&&e(u),l(),r.blur())});let d=o.querySelector(".hex-note"),c=0;return o.querySelector(".hex-copy").addEventListener("click",async()=>{d.textContent=await at(P(n.rgb))?"Copied":"Copy failed",clearTimeout(c),c=setTimeout(()=>{d.textContent=""},1200)}),{element:o,update({coords:h,rgb:m}){n={coords:h,rgb:m};for(let b of a)b.update();document.activeElement!==r&&l()}}}var Cn=32,ss=(t,e,o)=>Math.min(o,Math.max(e,t));function Tn({onCoords:t,onRgb:e,onColor:o}){let n=document.createElement("div");n.className="box xy",n.innerHTML=`
    <p class="lead xy-text"><strong><span class="keep-case">xy</span> chromaticity diagram</strong> \u2013 The colored area holds every sRGB color with the lightness of the selected color. It is one row of the HSL* field, with saturation 1 on its edge. The line around it is the edge of all physically possible surface colors of that lightness. Both shrink towards the white point as L* rises. In the CIE 1931 xy diagram behind them, the horseshoe is the spectral locus, every pure wavelength, and the dashed triangle is sRGB.</p>
    <div class="xy-stage">
      <canvas class="xy-canvas" role="img" aria-label="CIE 1931 xy chromaticity diagram with the sRGB colors at the selected lightness"></canvas>
      <span class="marker" aria-hidden="true"></span>
    </div>
    <div class="xy-controls">
      <div class="sliders xy-sliders">
        ${Qe.map(u=>`
          <div class="slider" data-axis="${u.name}" tabindex="0" role="slider" aria-label="${u.label}"
            aria-valuemin="0" aria-valuemax="100">
            <span class="slider-name" aria-hidden="true">${u.name}</span>
            <span class="marker" aria-hidden="true"></span>
          </div>`).join("")}
      </div>
    </div>
    <p class="credit">Spectral locus from <a href="https://doi.org/10.25039/CIE.DS.mifmy4x4">CIE 2019</a>, licensed <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</p>`,yt(n.querySelector(".xy-text"));let s=An(n.querySelector(".xy-canvas"),{marker:n.querySelector(".xy-stage .marker")}),a=[0,0,0],r=(u,d)=>{let c=eo(u,a,ss(d,0,1));c&&o({hsv:c.h,l:c.l,s:c.s,exact:null})},l=Qe.map(u=>({axis:u,slider:n.querySelector(`.slider[data-axis="${u.name}"]`)}));for(let{axis:u,slider:d}of l){let c=h=>{let m=d.getBoundingClientRect();r(u,(h.clientX-m.left)/m.width)};d.addEventListener("pointerdown",h=>{d.setPointerCapture(h.pointerId),d.focus(),c(h)}),d.addEventListener("pointermove",h=>{d.hasPointerCapture(h.pointerId)&&c(h)}),d.addEventListener("keydown",h=>{let m=h.shiftKey?.1:.01,b={ArrowRight:m,ArrowUp:m,ArrowLeft:-m,ArrowDown:-m,Home:-1,End:1};h.key in b&&(h.preventDefault(),r(u,to(u,a)+b[h.key]))})}let i=ke({onCoords:t,onRgb:e});return i.element.classList.add("xy-values"),n.querySelector(".xy-controls").append(i.element),{element:n,update({coords:u,rgb:d,background:c}){a=d.map(q),s.update({rgb:d,l:u.l});let h=b=>N(b).l,m={background:h(c),primary:h(d)};for(let{axis:b,slider:p}of l){let y=Array.from({length:Cn},(E,v)=>{let M=eo(b,a,v/(Cn-1));return M?F(M,{hue:"hsv"}):d});p.style.background=`linear-gradient(90deg, ${y.map(P).join(", ")})`;let x=h(y[0]);p.dataset.name=Math.abs(x-m.background)>Math.abs(x-m.primary)?"background":"primary";let T=to(b,a);p.style.setProperty("--x",T),p.setAttribute("aria-valuenow",(T*100).toFixed(1)),p.setAttribute("aria-valuetext",`${Math.round(T*100)}%`)}i.update({coords:u,rgb:d})}}}var ls=32,is=`<svg class="icon mini-drag" viewBox="0 0 24 24" aria-hidden="true">${[5,9,13,17].flatMap(t=>[5,9,13,17].map(e=>`<rect x="${t}" y="${e}" width="2" height="2"/>`)).join("")}</svg>`,Hn={closed:'<path d="M13 7H17V11"/><path d="M11 17L7 17L7 13"/>',open:'<path d="M18 10L14 10L14 6"/><path d="M6 14H10V18"/>'},Ht=(t,e,o)=>Math.min(o,Math.max(e,t)),cs=t=>(t%360+360)%360,us=0;function Ce({onCoords:t,onRgb:e,onToggle:o,label:n="Mini picker",ownColors:s=!1}){let a=`mini-picker-${++us}`,r=document.createElement("div");r.className="mini-picker",r.setAttribute("role","dialog"),r.setAttribute("aria-label",n),r.innerHTML=`
    <div class="mini-bar">
      ${is}
      <span class="mini-title"></span>
      <button type="button" class="mini-toggle"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"></svg></button>
    </div>
    <div class="mini-body" id="${a}-body">
      <div class="mini-field" tabindex="0" role="slider"
        aria-label="Hue and lightness. Left and right change the hue, up and down the lightness.">
        <canvas aria-hidden="true"></canvas>
        <span class="marker" aria-hidden="true"></span>
      </div>
      <div class="sliders mini-sliders">
        ${pt.map(f=>`
          <div class="slider" data-axis="${f.key}" tabindex="0" role="slider" aria-label="${f.label}"
            aria-valuemin="0" aria-valuemax="${f.max}">
            <span class="slider-name" aria-hidden="true">${f.name}</span>
            <span class="marker" aria-hidden="true"></span>
          </div>`).join("")}
      </div>
    </div>`;let l=r.querySelector(".mini-body"),i=r.querySelector(".mini-field"),u=i.querySelector("canvas"),d=r.querySelector(".mini-toggle"),c=pt.map(f=>({axis:f,slider:r.querySelector(`.mini-sliders [data-axis="${f.key}"]`)}));for(let{axis:f,slider:S}of c)Ot(S,f,{valueOf:()=>f.toValue(m.coords[f.key]),set:t});let h=ke({onCoords:t,onRgb:e});l.append(h.element),d.addEventListener("click",o);let m=null,b=!1,p={x:Math.random(),y:Math.random()},y=()=>[Math.max(0,document.documentElement.clientWidth-r.offsetWidth),Math.max(0,window.innerHeight-r.offsetHeight)];function x(){let[f,S]=y();r.style.left=`${p.x*f}px`,r.style.top=`${p.y*S}px`}new ResizeObserver(x).observe(r),window.addEventListener("resize",x);function T(f){let[S,L]=y(),k=10,R=r.offsetWidth,C=document.documentElement.clientWidth,H=f.right+k;H+R>C&&(H=f.left-k-R),H<0&&(H=f.left),p.x=S?Ht(H/S,0,1):0,p.y=L?Ht(f.top/L,0,1):0,x()}let E=null;r.addEventListener("pointerdown",f=>{if(f.target.closest('button, input, label, [role="slider"]'))return;f.preventDefault(),r.setPointerCapture(f.pointerId);let S=r.getBoundingClientRect();E={dx:f.clientX-S.left,dy:f.clientY-S.top},r.classList.add("is-dragging")}),r.addEventListener("pointermove",f=>{if(!E||!r.hasPointerCapture(f.pointerId))return;let[S,L]=y();p.x=S?Ht((f.clientX-E.dx)/S,0,1):0,p.y=L?Ht((f.clientY-E.dy)/L,0,1):0,x()});let v=()=>{E=null,r.classList.remove("is-dragging")};r.addEventListener("pointerup",v),r.addEventListener("pointercancel",v);function M(f){let S=i.getBoundingClientRect();t({h:Ht((f.clientX-S.left)/S.width,0,1)*359.99,l:Ht(1-(f.clientY-S.top)/S.height,0,1)*100})}i.addEventListener("pointerdown",f=>{i.setPointerCapture(f.pointerId),i.focus(),M(f)}),i.addEventListener("pointermove",f=>{i.hasPointerCapture(f.pointerId)&&M(f)}),i.addEventListener("keydown",f=>{let S=f.shiftKey?10:1,L={ArrowRight:[S,0],ArrowLeft:[-S,0],ArrowUp:[0,S],ArrowDown:[0,-S]};if(!(f.key in L)||!m)return;f.preventDefault();let[k,R]=L[f.key];t({h:cs(m.coords.h+k),l:Ht(m.coords.l+R,0,100)})});let g=Nt(),A="";function w(){if(!m||!b)return;let f=Math.min(window.devicePixelRatio||1,2),S=Math.round(u.clientWidth*f),L=Math.round(u.clientHeight*f);if(!S||!L)return;let{coords:k,mode:R}=m,C=[S,L,k.s,R].join();C!==A&&(u.width=S,u.height=L,g.paint(u,"field",{s:k.s,mode:R}),A=C)}return g.ready.then(()=>{A="",w()}),new ResizeObserver(()=>w()).observe(i),{element:r,moveNear:T,update({coords:f,rgb:S,hex:L,background:k,mode:R,open:C}){if(m={coords:f,mode:R},b=C,s&&(r.style.setProperty("--primary",L),r.style.setProperty("--background",P(k))),r.classList.toggle("is-open",b),l.hidden=!b,r.querySelector(".mini-title").textContent=b?"Select":L.toUpperCase(),d.setAttribute("aria-expanded",String(b)),d.setAttribute("aria-controls",l.id),d.setAttribute("aria-label",b?"Close the mini picker":"Open the mini picker"),d.querySelector("svg").innerHTML=b?Hn.open:Hn.closed,h.update({coords:f,rgb:S}),b){let H=$=>N($).l,_={background:H(k),primary:H(S)};for(let{axis:$,slider:O}of c){let V=H(Ft(O,$,f,R,ls)[0]);O.dataset.name=Math.abs(V-_.background)>Math.abs(V-_.primary)?"background":"primary"}}i.style.setProperty("--x",f.h/360),i.style.setProperty("--y",1-f.l/100),i.setAttribute("aria-valuetext",`Hue ${Math.round(f.h)%360}\xB0, lightness ${Math.round(f.l)}`),w()}}}var Rn={l:[20,80],s:[.5,1]},ds=4,hs=90/((1+Math.sqrt(5))/2),ps=90/Math.SQRT2,ms=4e3,fs=2e3,gs=(t,e,o)=>Math.min(o,Math.max(e,t)),bs=t=>t*t*(3-2*t);function Pn([t,e],o,n){let s=(t+e)/2,a=(e-t)/2,r=Math.asin(gs((n-s)/a,-1,1));return l=>s+a*Math.sin(r+2*Math.PI*l/o)}function _n(t){let e=!1,o=-1/0,n=null,s=0;function a(i){let{color:u,mode:d}=t.get(),c={h:U(u.hsv,{hue:d}),l:u.l,s:u.s},h=Pn(Rn.l,hs,c.l),m=Pn(Rn.s,ps,c.s);n={since:i,mode:d,at:p=>{let y=bs(Math.min(1,p*1e3/fs));return{h:c.h+ds*p,l:c.l+(h(p)-c.l)*y,s:c.s+(m(p)-c.s)*y}}}}function r(i){if(s=0,!!t.get().drift){if(i-o<ms)n=null;else{(!n||n.mode!==t.get().mode)&&a(i);let{h:u,l:d,s:c}=n.at((i-n.since)/1e3);e=!0,t.update(h=>({...h,color:{hsv:ut(u,{hue:n.mode}),l:d,s:c,exact:null}})),e=!1}s=requestAnimationFrame(r)}}let l=!1;return t.watch(i=>i.color,()=>{l&&!e&&(o=performance.now())}),l=!0,t.watch(i=>i.drift,i=>{n=null,o=-1/0,i&&!s&&(s=requestAnimationFrame(r))}),{isDrifting:()=>e}}var Te={palette:2,contrast:8,solid:10};function Ss({h:t,l:e,s:o}){let n=Math.round(t*10)%3600,s=Math.min(Math.max(Math.round(e*10),0),1e3),a=Math.min(Math.max(Math.round(o*1e3),0),1e3),r=(n<<20|s<<10|a)>>>0;return[r>>>24,r>>>16&255,r>>>8&255,r&255]}function On(t,e){let o=(t[e]<<24|t[e+1]<<16|t[e+2]<<8|t[e+3])>>>0,n=o>>>20,s=o>>>10&1023,a=o&1023;return n>=3600||s>1e3||a>1e3?null:{h:n/10,l:s/10,s:a/1e3}}var ys=t=>btoa(String.fromCharCode(...t)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");function xs(t){if(!/^[A-Za-z0-9_-]+$/.test(t))return null;try{return Uint8Array.from(atob(t.replace(/-/g,"+").replace(/_/g,"/")),e=>e.charCodeAt(0))}catch{return null}}var Fn=(t,e)=>t.push(...e.hex?[1,3,5].map(o=>parseInt(e.hex.slice(o,o+2),16)):Ss(e)),Bn=(t,e)=>"#"+[...t.slice(e,e+3)].map(o=>o.toString(16).padStart(2,"0")).join("");function $n(t,e){t.push(e.length);let o=new Array(Math.ceil(e.length/8)).fill(0);e.forEach((n,s)=>{n.hex||(o[s>>3]|=128>>(s&7))}),t.push(...o);for(let n of e)Fn(t,n)}function In(t,e){if(t.length<=e)return null;let o=t[e],n=e+1;e=n+Math.ceil(o/8);let s=[];for(let a=0;a<o;a++){let r=t[n+(a>>3)]&128>>(a&7),l=r?4:3;if(t.length<e+l)return null;if(r){let i=On(t,e);if(!i)return null;s.push(i)}else s.push({hex:Bn(t,e)});e+=l}return{colors:s,o:e}}function Nn({color:t,stops:e,contrast:o=[],steps:n,tones:s,longHue:a=!1,oklab:r=!1,scrollTo:l=null}){let u=[48|((a?1:0)|(r?4:0)|(Te[l]??0)),(t.hex?1:0)|(l==="code"?2:0)];return Fn(u,t),u.push(Math.min(Math.max(n,1),256)-1,Math.min(Math.max(s,0),255)),$n(u,e),$n(u,o),ys(u)}function Dn(t){let e=xs(t),o=e&&e[0]>>4;if(!e||e.length<8||o<1||o>3)return null;let n=e[0]&15,s,a;if(o===3&&e[1]&1)s={hex:Bn(e,2)},a=5;else{let d=o===3?2:1;s=On(e,d),a=d+4}if(!s||e.length<a+2)return null;let r=e[a]+1,l=e[a+1],i=In(e,a+2);if(!i)return null;let u={colors:[],o:i.o};return o>=2&&(u=In(e,i.o),!u)||u.o!==e.length?null:{color:s,stops:i.colors,contrast:u.colors,steps:r,tones:l,longHue:!!(n&1),oklab:!!(n&4),scrollTo:o===3&&e[1]&2?"code":Object.keys(Te).find(d=>Te[d]===(n&Te.solid))??null}}var lt=(t,e=null)=>({text:t,exact:e}),Rt=({text:t,exact:e})=>e??Y(t),he=t=>lt(P(t),t);var no={solid:"color-space",palette:"palette",contrast:"contrast",code:"code"},vs=t=>Object.keys(no).find(e=>no[e]===t);function Vn({text:t,exact:e},o){if(e){let{h:s,l:a,s:r}=N(e,{hue:o});return{h:s,l:a,s:r}}let n=Y(t);return n?{hex:P(n)}:null}function qn({color:t,mode:e,palette:o,contrast:n},s){let a=[n.background,n.text].map(r=>Vn(r,e));return`#${Nn({color:t.exact?{hex:P(t.exact)}:{h:U(t.hsv,{hue:e}),l:t.l,s:t.s},stops:o.stops.map(r=>Vn(r,e)).filter(Boolean),contrast:a.every(Boolean)?a:[],steps:o.steps,tones:o.tones,longHue:o.longHue,oklab:e==="oklab",scrollTo:s})}`}function Un(t){let e=t.split(",").map(a=>a.trim());if(e.length!==3||e.some(a=>a===""))return null;let[o,n,s]=e.map(Number);return![o,n,s].every(Number.isFinite)||o<0||o>360||n<0||n>100||s<0||s>100?null:{hsv:o%360,l:n,s:s/100,exact:null}}function ws(t){let e=Un(t);if(!e){let n=decodeURIComponent(t);return lt(/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(n)?`#${n}`:n)}let o=F({h:e.hsv,l:e.l,s:e.s},{hue:"hsv"});return lt(P(o),o)}function Ls(t){let[e,...o]=t.split("&"),n=Un(decodeURIComponent(e)),s=Object.fromEntries(o.map(r=>[r.split("=")[0],r.slice(r.indexOf("=")+1)])),a=null;if(s.palette){let r=s.palette.split(";").filter(Boolean).map(ws);if(r.length>=2){a={stops:r,longHue:s.long==="1"};let l=Number(s.steps),i=Number(s.tones);Number.isInteger(l)&&(a.steps=l),Number.isInteger(i)&&(a.tones=i)}}return{color:n,palette:a,contrast:null,scrollTo:s.l==="palette"?"palette":null}}function As(t){let e=t.replace(/^#/,""),o=Dn(e);if(!o)return Ls(e);let n=o.oklab?"oklab":"hsv",s=i=>{if(i.hex)return lt(i.hex);let u=F(i,{hue:n});return lt(P(u),u)},a=o.stops.map(s),r=o.contrast.map(s),{color:l}=o;return{color:l.hex?et(Y(l.hex)):{hsv:ut(l.h,{hue:n}),l:l.l,s:l.s,exact:null},palette:a.length>=2?{stops:a,steps:o.steps,tones:o.tones,longHue:o.longHue}:null,contrast:r.length===2?{background:r[0],text:r[1]}:null,scrollTo:o.scrollTo}}function Gn(t,{isDrifting:e}){let o=null;function n(){let h=As(location.hash);return o=h.scrollTo,t.update(m=>({...m,color:h.color??m.color,palette:h.palette?{...m.palette,...h.palette}:m.palette,contrast:h.contrast??m.contrast})),{color:!!h.color,scrollTo:o}}let s=(h,m="auto")=>document.getElementById(no[h])?.scrollIntoView({behavior:m}),a=!1,r=0;function l(){clearTimeout(r),r=0;let h=qn(t.get(),o);location.hash!==h&&history.replaceState(null,"",h)}function i(){a||(clearTimeout(r),r=setTimeout(l,250))}addEventListener("pointerdown",()=>a=!0,{capture:!0});for(let h of["pointerup","pointercancel"])addEventListener(h,()=>{a&&(a=!1,i())});addEventListener("hashchange",()=>{let h=n();h.scrollTo&&s(h.scrollTo)});let u=n();t.watch(h=>({color:h.color,mode:h.mode,palette:h.palette,contrast:h.contrast}),()=>{e()||i()},j),u.scrollTo&&(history.scrollRestoration="manual",requestAnimationFrame(()=>s(u.scrollTo)));let d=h=>location.href.split("#")[0]+qn(t.get(),h);function c(h){let m=vs(h);m&&(o=m,l(),s(m,matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"))}return{...u,shareLink:d,goTo:c}}function He({label:t,onEditing:e,keepOpen:o}){let n=null,s="oklab",a=Ce({label:t,ownColors:!0,onCoords:h=>{if(!n)return;let m={...r(),...h};n.color={hsv:ut(m.h,{hue:s}),l:m.l,s:m.s,exact:null},i()},onRgb:h=>{n&&(n.color=et(h),i())},onToggle:()=>c()});a.element.hidden=!0,document.body.append(a.element);let r=()=>({h:U(n.color.hsv,{hue:s}),l:n.color.l,s:n.color.s}),l=({hsv:h,l:m,s:b,exact:p})=>p??F({h,l:m,s:b},{hue:"hsv"});function i(){n.onPick(l(n.color)),u()}function u(){let h=l(n.color);a.update({coords:r(),rgb:h,hex:P(h),background:dt({color:n.color}),mode:s,open:!0})}function d(h,m,{onPick:b,onClose:p=()=>{}}){n&&c({replaced:!0}),n={color:et(m),onPick:b,onClose:p},a.element.hidden=!1,u(),a.moveNear(h),e(!0)}function c({replaced:h=!1}={}){if(!n)return;let{onClose:m}=n;n=null,a.element.hidden=!0,m({replaced:h}),h||e(!1)}return document.addEventListener("keydown",h=>{h.key==="Escape"&&n&&c()}),document.addEventListener("pointerdown",h=>{n&&!a.element.contains(h.target)&&!h.target.closest?.(o)&&c()}),{open:d,close:c,isOpen:()=>!!n,setMode(h){s=h,n&&u()}}}var Es=256,Ms=50,ks=4,Cs=`<svg class="icon swatch-drag" viewBox="0 0 24 24" aria-hidden="true">${[5,9,13,17].flatMap(t=>[5,9,13,17].map(e=>`<rect x="${t}" y="${e}" width="2" height="2"/>`)).join("")}</svg>`,Ts='<svg class="icon swatch-bin" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 19.1998C7.56 19.1998 7.18333 19.0432 6.87 18.7298C6.55667 18.4165 6.4 18.0398 6.4 17.5998V7.19985H5.6V5.59985H9.6V4.79985H14.4V5.59985H18.4V7.19985H17.6V17.5998C17.6 18.0398 17.4433 18.4165 17.13 18.7298C16.8167 19.0432 16.44 19.1998 16 19.1998H8ZM16 7.19985H8V17.5998H16V7.19985ZM9.6 15.9998H11.2V8.79985H9.6V15.9998ZM12.8 15.9998H14.4V8.79985H12.8V15.9998Z"/></svg>',jn=t=>`<svg viewBox="0 0 8 5" aria-hidden="true"><polyline points="${t}" fill="none" stroke="currentColor"/></svg>`,zn=(t,e,o)=>Math.min(o,Math.max(e,t));function Yn({onPalette:t,onEditing:e,current:o}){let n=document.createElement("div");n.className="box palette-stops",n.innerHTML=`
    <div class="swatch-list" role="list" aria-label="Palette colors"></div>
    <div class="palette-settings">
      <label class="setting" data-key="steps"><span>Steps</span></label>
      <label class="setting" data-key="tones"><span>Tints and shades</span></label>
      ${st("longHue","Long way round the hue circle")}
    </div>`;let s=n.querySelector(".swatch-list"),a={stops:[],steps:2,tones:0,longHue:!1},r="oklab",l=g=>t({stops:g}),i=[["steps","Steps",g=>zn(Math.round(g),Math.max(2,a.stops.length),Es)],["tones","Tints and shades",g=>zn(Math.round(g),0,Ms)]].map(([g,A,w])=>{let f=ht({label:A,valueOf:()=>a[g],set:k=>t({[g]:w(k)})}),S=document.createElement("span");S.className="setting-number";let L=document.createElement("span");L.className="setting-steppers",L.innerHTML=`
      <button type="button" tabindex="-1" data-by="1" aria-label="More ${A.toLowerCase()}">${jn("0.5,4.5 4,1 7.5,4.5")}</button>
      <button type="button" tabindex="-1" data-by="-1" aria-label="Fewer ${A.toLowerCase()}">${jn("0.5,0.5 4,4 7.5,0.5")}</button>`;for(let k of L.querySelectorAll("button"))k.addEventListener("click",R=>{R.preventDefault(),f.step(Number(k.dataset.by))});return S.append(f.input,L),n.querySelector(`.setting[data-key="${g}"]`).append(S),f}),u=n.querySelector('[data-option="longHue"]');u.addEventListener("change",()=>t({longHue:u.checked}));let d=null,c=He({label:"Edit palette color",onEditing:e,keepOpen:".swatch"});function h(g){c.open(b[g].element.getBoundingClientRect(),Rt(a.stops[g])??[.5,.5,.5],{onPick:A=>l(a.stops.map((w,f)=>f===g?he(A):w)),onClose:({replaced:A})=>{d=null,M(),A||b[g]?.element.focus()}}),d=g,M()}let m=()=>c.close(),b=[],p=document.createElement("button");p.type="button",p.className="swatch-add",p.setAttribute("aria-label","Add the page color to the palette"),p.innerHTML='<span aria-hidden="true"></span>',p.addEventListener("click",()=>{l([...a.stops,he(o())]),h(a.stops.length-1)});function y(g){let A=document.createElement("div");return A.className="swatch",A.setAttribute("role","listitem"),A.tabIndex=0,A.innerHTML=`${Cs}<span class="swatch-hex"></span>
      <button type="button" class="swatch-remove" aria-label="Remove color ${g+1}">${Ts}</button>`,A.querySelector(".swatch-remove").addEventListener("click",()=>{a.stops.length<=2||(m(),l(a.stops.filter((w,f)=>f!==g)))}),A.addEventListener("keydown",w=>{if(w.target===A&&((w.key==="Enter"||w.key===" ")&&(w.preventDefault(),h(g)),w.altKey&&(w.key==="ArrowLeft"||w.key==="ArrowRight"))){w.preventDefault();let f=g+(w.key==="ArrowLeft"?-1:1);if(f<0||f>=a.stops.length)return;x(g,f),b[f].element.focus()}}),v(A,g),{element:A}}function x(g,A){let w=[...a.stops],[f]=w.splice(g,1);w.splice(A,0,f),m(),l(w)}let T=document.createElement("div");T.className="swatch-drop";function E(g,A,w){let f=g.findIndex(S=>{let L=S.getBoundingClientRect();return w<L.top||w<=L.bottom&&A<L.left+L.width/2});return f===-1?g.length:f}function v(g,A){let w=null,f=!1,S=A;g.addEventListener("pointerdown",k=>{k.button!==0||k.target.closest(".swatch-remove")||(w={x:k.clientX,y:k.clientY,id:k.pointerId},g.setPointerCapture(k.pointerId))}),g.addEventListener("pointermove",k=>{if(!w||k.pointerId!==w.id)return;let R=k.clientX-w.x,C=k.clientY-w.y;if(!f){if(Math.hypot(R,C)<ks)return;f=!0,m(),g.classList.add("is-dragging"),s.append(T)}g.style.transform=`translate(${R}px, ${C}px)`;let H=b.map(D=>D.element).filter(D=>D!==g);S=E(H,k.clientX,k.clientY);let _=s.getBoundingClientRect(),$=H[Math.min(S,H.length-1)].getBoundingClientRect(),O=parseFloat(getComputedStyle(s).columnGap)||0,V=S<H.length?$.left-O/2:$.right+O/2;T.style.left=`${V-_.left}px`,T.style.top=`${$.top-_.top}px`,T.style.height=`${$.height}px`});let L=(k,R)=>{if(!(!w||k.pointerId!==w.id)){if(w=null,!f){R||h(A);return}f=!1,g.classList.remove("is-dragging"),g.style.transform="",T.remove(),!R&&S!==A&&x(A,S)}};g.addEventListener("pointerup",k=>L(k,!1)),g.addEventListener("pointercancel",k=>L(k,!0))}function M(){let{stops:g}=a;g.length!==b.length&&(b=g.map((A,w)=>y(w)),s.replaceChildren(...b.map(A=>A.element),p)),g.forEach((A,w)=>{let{element:f}=b[w],S=Rt(A)??[.5,.5,.5],L=P(S);f.style.background=L,f.dataset.ink=N(S).l>55?"dark":"light",f.querySelector(".swatch-hex").textContent=L.toUpperCase(),f.setAttribute("aria-label",`Color ${w+1}, ${L}. Press Enter to edit it, Alt and an arrow key to move it.`),f.classList.toggle("is-editing",d===w),f.querySelector(".swatch-remove").disabled=g.length<=2})}return{element:n,update({palette:g,mode:A}){a=g,r=A,M();for(let w of i)w.update();u.checked=a.longHue,c.setMode(r)}}}function Wn({onSelect:t}){let e=document.createElement("div");e.className="box palette-matrix",e.innerHTML=`
    <div class="matrix-area">
      <div class="matrix" role="group" aria-label="Palette colors with their tints and shades"></div>
    </div>
    <span class="matrix-hover" aria-hidden="true" hidden></span>`;let o=e.querySelector(".matrix"),n=e.querySelector(".matrix-hover");function s(d,c){let h=P(d),m=document.createElement("button");m.type="button",m.className="matrix-cell",m.style.background=h,m.setAttribute("aria-label",`${c?"Palette color":"Tone"} ${h}. Press Enter to pick it.`),m.addEventListener("click",()=>t(d));let b=()=>i(m,d);return m.addEventListener("pointerenter",b),m.addEventListener("focus",b),m.addEventListener("pointerleave",u),m.addEventListener("blur",u),m}let a=d=>N(Y(document.documentElement.style.getPropertyValue(d))??[0,0,0]).l,r=null;function l(){if(!r)return;let d=N(r.rgb).l<50,c=a("--primary")>a("--background");n.style.color=d===c?"var(--primary)":"var(--background)"}function i(d,c){let h=P(c);r={rgb:c},n.hidden=!1,n.textContent=h.toUpperCase(),n.style.background=h,l();let m=e.getBoundingClientRect(),b=d.getBoundingClientRect();n.style.left=`${b.left+b.width/2-m.left-e.clientLeft}px`,n.style.top=`${b.top+b.height/2-m.top-e.clientTop}px`}function u(){r=null,n.hidden=!0}return{element:e,restyle:l,update(d){if(u(),!d){o.replaceChildren();return}let{rows:c}=d,h=Math.max(...c.map(y=>y.tints.length)),m=Math.max(...c.map(y=>y.shades.length)),b=h+m+1,p=b>c.length;o.style.setProperty("--columns",p?b:c.length),o.style.setProperty("--rows",p?c.length:b),o.replaceChildren(...c.flatMap(({base:y,shades:x,tints:T},E)=>[...T.slice().reverse(),y,...x.slice().reverse()].map((v,M)=>{let g=s(v,v===y),A=h-T.length+M+1;return g.style.gridColumn=p?b+1-A:E+1,g.style.gridRow=p?E+1:A,g})))}}}function Xn(t,e){if(t.length>e**3)throw new RangeError(`${t.length} colors don't fit into ${e}\xB3 voxels.`);let o=new Set,n=([a,r,l])=>(a*e+r)*e+l,s=a=>Math.min(e-1,Math.max(0,Math.floor(a*e)));return t.map(a=>{let r=a.map(s);if(!o.has(n(r)))return o.add(n(r)),r;let l=a.map(i=>i*e-.5);for(let i=1;i<e;i++){let u=null,d=1/0;for(let c=-i;c<=i;c++)for(let h=-i;h<=i;h++)for(let m=-i;m<=i;m++){if(Math.max(Math.abs(c),Math.abs(h),Math.abs(m))!==i)continue;let b=[r[0]+c,r[1]+h,r[2]+m];if(b.some(y=>y<0||y>=e)||o.has(n(b)))continue;let p=b.reduce((y,x,T)=>y+(x-l[T])**2,0);p<d&&([u,d]=[b,p])}if(u)return o.add(n(u)),u}throw new Error("No free voxel left.")})}var Hs=2*Math.PI/60,Kn={yaw:-.5,pitch:.3},Zn=5,Rs=.8,zt=1.14,Yt={x:[Math.SQRT1_2,-Math.SQRT1_2,0],y:[1,1,1].map(t=>t/Math.sqrt(3)),z:[-1,-1,2].map(t=>t/Math.sqrt(6))},ro=t=>`vec3(${t.map(e=>e.toFixed(8)).join(", ")})`,Ps=`
vec3 place(vec3 rgb) {
  vec3 c = rgb - 0.5;
  return vec3(dot(c, ${ro(Yt.x)}), dot(c, ${ro(Yt.y)}), dot(c, ${ro(Yt.z)}));
}`,ao=(t,e)=>t[0]*e[0]+t[1]*e[1]+t[2]*e[2],so=t=>{let e=t.map(o=>o-.5);return[ao(e,Yt.x),ao(e,Yt.y),ao(e,Yt.z)]},_s=`#version 300 es
in vec3 aCorner;
in vec3 aNormal;
in vec3 aVoxel;
in vec3 aColor;
uniform mat4 uMvp;
uniform float uN;
out vec3 vColor;
${Ps}
void main() {
  vec3 normal = place(aNormal + 0.5);
  float light = max(dot(normal, normalize(vec3(0.35, 0.85, 0.4))), 0.0);
  vColor = aColor * (0.7 + 0.3 * light);
  gl_Position = uMvp * vec4(place((aVoxel + 0.5 + aCorner * ${Rs.toFixed(3)}) / uN), 1.0);
}`,$s=`#version 300 es
precision mediump float;
in vec3 vColor;
out vec4 color;
void main() {
  color = vec4(vColor, 1.0);
}`,Is=`#version 300 es
in vec3 aPos;
uniform mat4 uMvp;
uniform vec2 uOffset;
void main() {
  gl_Position = uMvp * vec4(aPos, 1.0);
  gl_Position.xy += uOffset * gl_Position.w;
}`,Os=`#version 300 es
precision mediump float;
uniform vec4 uColor;
out vec4 color;
void main() {
  color = uColor;
}`;function Fs(){let t=[[[1,0,0],[0,1,0],[0,0,1]],[[-1,0,0],[0,0,1],[0,1,0]],[[0,1,0],[0,0,1],[1,0,0]],[[0,-1,0],[1,0,0],[0,0,1]],[[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[0,1,0],[1,0,0]]],e=[],o=[];for(let[n,s,a]of t){let r=(l,i)=>n.map((u,d)=>u*.5+s[d]*l*.5+a[d]*i*.5);for(let[l,i]of[[-1,-1],[1,-1],[1,1],[-1,-1],[1,1],[-1,1]])e.push(...r(l,i)),o.push(...n)}return{corners:new Float32Array(e),normals:new Float32Array(o),count:36}}var lo=[[[0,0,0],"black"],[[1,0,0],"red"],[[0,1,0],"green"],[[0,0,1],"blue"],[[0,1,1],"cyan"],[[1,0,1],"magenta"],[[1,1,0],"yellow"],[[1,1,1],"white"]],Jn=lo.flatMap(([t],e)=>lo.slice(e+1).filter(([o])=>t.reduce((n,s,a)=>n+Math.abs(s-o[a]),0)===1).flatMap(([o])=>[...so(t),...so(o)])),Qn=1/(2*Math.sqrt(3)),Bs=[...Vt(Math.sqrt(2/3)*zt,[-Qn*zt,Qn*zt]),[0,-Math.sqrt(3)/2*zt,0],[0,Math.sqrt(3)/2*zt,0]];function tr(t,e){let o=t.getContext("webgl2",{antialias:!0,premultipliedAlpha:!1});if(!o)return null;let n=bt(o,_s,$s,["aCorner","aNormal","aVoxel","aColor"],["uMvp","uN"]),s=bt(o,Is,Os,["aPos"],["uMvp","uOffset","uColor"]),a=(g,A=o.STATIC_DRAW)=>{let w=o.createBuffer();return o.bindBuffer(o.ARRAY_BUFFER,w),o.bufferData(o.ARRAY_BUFFER,g,A),w},r=(g,A,w=0)=>{o.bindBuffer(o.ARRAY_BUFFER,A),o.enableVertexAttribArray(g),o.vertexAttribPointer(g,3,o.FLOAT,!1,0,0),o.vertexAttribDivisor(g,w)},l=Fs(),i=a(new Float32Array(3),o.DYNAMIC_DRAW),u=a(new Float32Array(3),o.DYNAMIC_DRAW),d=o.createVertexArray();o.bindVertexArray(d),r(n.aCorner,a(l.corners)),r(n.aNormal,a(l.normals)),r(n.aVoxel,i,1),r(n.aColor,u,1);let c=o.createVertexArray();o.bindVertexArray(c),r(s.aPos,a(new Float32Array(Jn))),o.bindVertexArray(null);let h={...Kn},m={colors:[],n:1,count:0},b=0,p=()=>{b||(b=requestAnimationFrame(x))},y={key:"",adjust:null};function x(){b=0;let g=Math.min(window.devicePixelRatio||1,2),A=Math.round(t.clientWidth*g),w=Math.round(t.clientHeight*g);if(!A||!w)return;(t.width!==A||t.height!==w)&&(t.width=A,t.height=w),o.viewport(0,0,A,w),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT|o.DEPTH_BUFFER_BIT);let f=we(A/w,.1,100);y.key!==`${A}\xD7${w}`&&(y={key:`${A}\xD7${w}`,adjust:Dt(f,Zn,Bs)});let S=K(y.adjust,K(f,kt(h.yaw,h.pitch,Zn)));o.enable(o.DEPTH_TEST),o.depthMask(!0),o.disable(o.BLEND),m.count&&(o.useProgram(n.p),o.uniformMatrix4fv(n.uMvp,!1,S),o.uniform1f(n.uN,m.n),o.bindVertexArray(d),o.drawArraysInstanced(o.TRIANGLES,0,l.count,m.count)),o.enable(o.BLEND),o.blendFunc(o.SRC_ALPHA,o.ONE_MINUS_SRC_ALPHA),o.depthMask(!1),o.useProgram(s.p),o.uniformMatrix4fv(s.uMvp,!1,S),o.uniform4fv(s.uColor,Z(t,.45)),o.bindVertexArray(c);let L=t.width/t.clientWidth>=1.5?2:1;for(let k=0;k<L;k++)for(let R=0;R<L;R++)o.uniform2f(s.uOffset,2*k/A,2*R/w),o.drawArrays(o.LINES,0,Jn.length/3);o.bindVertexArray(null),v(S,A,w)}let T=lo.map(([g,A])=>{let w=document.createElement("span");return w.textContent=A,e.appendChild(w),{at:so(g).map(f=>f*zt),el:w}}),E=new Uint8Array(4);function v(g,A,w){for(let{at:[f,S,L],el:k}of T){let R=g[3]*f+g[7]*S+g[11]*L+g[15],C=((g[0]*f+g[4]*S+g[8]*L+g[12])/R+1)/2,H=(1-(g[1]*f+g[5]*S+g[9]*L+g[13])/R)/2;k.style.left=`${C*100}%`,k.style.top=`${H*100}%`;let _=Math.round(C*A),$=Math.round((1-H)*w),O=!1;_>=0&&_<A&&$>=0&&$<w&&(o.readPixels(_,$,1,1,o.RGBA,o.UNSIGNED_BYTE,E),O=E[3]>240),k.style.visibility=O?"hidden":""}}function M(){let{colors:g,n:A}=m;o.bindBuffer(o.ARRAY_BUFFER,i),o.bufferData(o.ARRAY_BUFFER,new Float32Array(Xn(g,A).flat()),o.DYNAMIC_DRAW),o.bindBuffer(o.ARRAY_BUFFER,u),o.bufferData(o.ARRAY_BUFFER,new Float32Array(g.flat()),o.DYNAMIC_DRAW),m.count=g.length}return qt(t,h,Kn,p,{spin:Hs}),new ResizeObserver(p).observe(t),{update(g){m={...m,...g},M(),p()},redraw:p}}function er(){let t=document.createElement("div");t.className="box palette-cube",t.innerHTML=`
    <div class="palette-cube-stage">
      <canvas class="palette-cube-canvas" tabindex="0" role="img"
        aria-label="The palette's swatches in the RGB cube. Drag or use the arrow keys to turn it, double-click to reset."></canvas>
      <div class="diagram-labels" aria-hidden="true"></div>
      <p class="palette-cube-fallback" hidden>This browser can't show the cube (WebGL2 is unavailable).</p>
    </div>`;let e=null;try{e=tr(t.querySelector(".palette-cube-canvas"),t.querySelector(".diagram-labels"))}catch(o){console.error(o)}return e||(t.querySelector(".palette-cube-fallback").hidden=!1),{element:t,update(o,n){if(!e)return;if(!o){e.update({colors:[],n:1});return}let{rows:s,colors:a}=o;e.update({colors:[...a,...s.flatMap(({tints:r,shades:l})=>[...r,...l])],n:Math.max(a.length,n*2+1)})},redraw(){e?.redraw()}}}function Pe(t){let e=t.map(a=>Array.isArray(a)?{base:a,shades:[],tints:[]}:a),o=a=>String(a+1).padStart(2,"0"),n=(a,r)=>[...a.shades.map((l,i)=>({rgb:l,index:r,tone:i-a.shades.length})),{rgb:a.base,index:r,tone:0},...a.tints.map((l,i)=>({rgb:l,index:r,tone:i+1}))],s=e.some(a=>a.shades.length||a.tints.length);return s?{grouped:s,groups:e.map((a,r)=>({name:`${o(r)} ${P(a.base)}`,swatches:n(a,r)}))}:{grouped:s,groups:[{swatches:e.flatMap(n)}]}}var io=t=>t<0?`dark ${-t}`:t>0?`light ${t}`:"",or=({rgb:t,index:e,tone:o})=>[String(e+1).padStart(2,"0"),io(o),P(t)].filter(Boolean).join(" ");function nr(t,e="palette"){let{groups:o}=Pe(t);return`:root {
${o.map(({swatches:s})=>s.map(({rgb:a,index:r,tone:l})=>{let i=io(l).replace(" ","-");return`  --${e}-${r+1}${i?`-${i}`:""}: ${P(a)};`}).join(`
`)).join(`

`)}
}
`}function rr(t,{hue:e="oklab"}={}){let{grouped:o,groups:n}=Pe(t),s=r=>{let{h:l,l:i,s:u}=N(r.rgb,{hue:e});return{name:or(r),...o&&{tone:r.tone},hex:P(r.rgb),rgb:G(r.rgb),hslStar:{h:Re(l,2),l:Re(i,2),s:Re(u,4)}}},a=o?{groups:n.map(({name:r,swatches:l})=>({name:r,colors:l.map(s)}))}:{colors:n[0].swatches.map(s)};return JSON.stringify({space:"HSL*",hueAxis:e,...a},null,2)+`
`}var Re=(t,e)=>Math.round(t*10**e)/10**e;function ar(t,e="HSL* palette"){let o=[],n=d=>{let c=new Uint8Array((d.length+1)*2);for(let h=0;h<d.length;h++)c[h*2]=d.charCodeAt(h)>>8,c[h*2+1]=d.charCodeAt(h)&255;return c},s=d=>{let c=n(d),h=new Uint8Array(2+c.length);return new DataView(h.buffer).setUint16(0,d.length+1),h.set(c,2),{type:49153,body:h}},a=d=>{let{rgb:c}=d,h=or(d),m=n(h),b=new Uint8Array(2+m.length+4+12+2),p=new DataView(b.buffer);p.setUint16(0,h.length+1),b.set(m,2);let y=2+m.length;return b.set([82,71,66,32],y),y+=4,G(c).forEach((x,T)=>p.setFloat32(y+T*4,x/255)),p.setUint16(y+12,2),{type:1,body:b}};for(let d of Pe(t).groups){let c=d.name?`${e} ${d.name}`:e;o.push(s(c),...d.swatches.map(a),{type:49154,body:new Uint8Array(0)})}let r=12+o.reduce((d,c)=>d+6+c.body.length,0),l=new Uint8Array(r),i=new DataView(l.buffer);l.set([65,83,69,70],0),i.setUint16(4,1),i.setUint16(6,0),i.setUint32(8,o.length);let u=12;for(let{type:d,body:c}of o)i.setUint16(u,d),i.setUint32(u+2,c.length),l.set(c,u+6),u+=6+c.length;return l}function sr(t,e="palette"){var a;let{groups:o}=Pe(t),n=r=>({$type:"color",$value:{colorSpace:"srgb",components:r.map(l=>Re(l,6)),alpha:1,hex:P(r).toUpperCase()}}),s={};for(let{swatches:r}of o)for(let{rgb:l,index:i,tone:u}of r){let d=s[a=i+1]??(s[a]={});d[io(u).replace(" ","-")||"base"]=n(l)}return JSON.stringify({[e]:s},null,2)+`
`}var Ns='<svg class="icon share-download" viewBox="0 0 18 18" aria-hidden="true"><path d="M9.06 2v9.52m4.33-4.33-4.33 4.33-4.33-4.33M3 15.85h12.12" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',lr=[["CSS","palette.css","text/css",t=>nr(t)],["JSON","palette.json","application/json",(t,e)=>rr(t,{hue:e})],["Adobe Swatch","palette.ase","application/octet-stream",t=>ar(t)],["Figma","palette.tokens.json","application/json",t=>sr(t)]];function Ds(t,e,o){let n=URL.createObjectURL(new Blob([e],{type:o})),s=document.createElement("a");s.href=n,s.download=t,document.body.append(s),s.click(),s.remove(),setTimeout(()=>URL.revokeObjectURL(n),1e3)}function co({label:t,shareLink:e,exports:o=!1}){let n=document.createElement("div");n.className="box share",n.innerHTML=`
    <button type="button" class="share-button">${t}</button>
    ${o?`<div class="share-exports">
      <span>Export</span>
      ${lr.map(([i,u],d)=>`${d===2?'<span class="share-break"></span>':""}<button type="button" class="share-export" data-export="${d}" aria-label="Download ${i} (${u})">${i}${Ns}</button>`).join("")}
    </div>`:""}`;let s=n.querySelector(".share-button"),a=0;s.addEventListener("click",async()=>{let i=await at(e());s.textContent=i?"URL copied":"Failed",clearTimeout(a),a=setTimeout(()=>s.textContent=t,1500)});let r=null,l="oklab";for(let i of n.querySelectorAll("[data-export]"))i.addEventListener("click",()=>{if(!r)return;let[,u,d,c]=lr[i.dataset.export];Ds(u,c(r.rows,l),d)});return{element:n,update(i,u){r=i,l=u;for(let d of n.querySelectorAll("[data-export]"))d.disabled=!r}}}var ir=[{key:"aa",label:"AA",ratio:4.5,title:"Normal text, level AA: 4.5 : 1"},{key:"aaa",label:"AAA",ratio:7,title:"Normal text, level AAA: 7 : 1"},{key:"aa-large",label:"AA large",ratio:3,title:"Large text (24 px, or 18.7 px bold), level AA: 3 : 1"},{key:"aaa-large",label:"AAA large",ratio:4.5,title:"Large text (24 px, or 18.7 px bold), level AAA: 4.5 : 1"},{key:"ui",label:"UI",ratio:3,title:"Icons, borders and form fields (WCAG 1.4.11): 3 : 1"}],uo=t=>X(G(t).map(e=>q(e/255)));function ho(t,e){let o=uo(t),n=uo(e);return(Math.max(o,n)+.05)/(Math.min(o,n)+.05)}function po(t,e){let o=uo(t),n=(o+.05)/e-.05,s=e*(o+.05)-.05;return{darker:n>=0?$t(n):null,lighter:s<=1?$t(s):null}}function mo({h:t,l:e,s:o},n,s,a){let r=c=>ho(F({h:t,l:c,s:o},a),n)>=s;if(r(e))return e;let{darker:l,lighter:i}=po(n,s),u=[],d=(c,h)=>Math.round((c+h)*10)/10;if(l!==null){let c=Math.min(Math.ceil((l+.5)*10)/10,e);for(;c>=0&&!r(c);)c=d(c,-.1);c>=0&&u.push(c)}if(i!==null){let c=Math.max(Math.floor((i-.5)*10)/10,e);for(;c<=100&&!r(c);)c=d(c,.1);c<=100&&u.push(c)}return u.length?u.reduce((c,h)=>Math.abs(h-e)<Math.abs(c-e)?h:c):null}var Vs='<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 9H18V18H9V9Z"/><path d="M6 16V6H16"/></svg>',cr=pt.find(t=>t.key==="l"),ur={24:"Large text, from 24 px or 18.7 px bold, needs 3:1 for AA and 4.5:1 for AAA.",17:"Text at 17 px isn\u2019t large for WCAG, which starts at 24 px, so it needs 4.5:1 like the rest."},dr=t=>`Normal text, here at ${t} px, needs 4.5:1 for AA and 7:1 for AAA. The ratio compares how much light the two colors give off, their relative luminance, from 1:1 for two equal colors to 21:1 for black on white. In HSL*, every color with the same L* has the same luminance, so hue and saturation leave the ratio as it is and only lightness moves it. Drag a slider below to find the lightness that passes.`,vt=["background","text"],hr={background:"Background",text:"Text"},pr=[["AA",4.5],["AAA",7]],qs=(t,e,o)=>Math.min(o,Math.max(e,t)),pe=t=>t==="text"?"background":"text";function mr({onContrast:t,onOptions:e,onEditing:o}){let n=document.createElement("div");n.className="box contrast-panel",n.innerHTML=`
    ${st("lightnessOnly","Show lightness only")}
    <div class="contrast-samples">
      ${vt.map(v=>`
        <div class="contrast-sample" data-role="${v}" tabindex="0" role="button" aria-haspopup="dialog"
          aria-label="${hr[v]} color. Press Enter to edit it.">
          <span class="contrast-hex"><span class="contrast-hex-text"></span>
            <button type="button" class="contrast-copy" aria-label="Copy hex code">${Vs}</button></span>
          <div class="contrast-texts">
            <p class="contrast-large"><span class="on-desktop">${ur[24]}</span><span class="on-mobile">${ur[17]}</span></p>
            <p class="contrast-normal"><span class="on-desktop">${dr(17)}</span><span class="on-mobile">${dr(13)}</span></p>
          </div>
        </div>`).join("")}
    </div>
    <div class="contrast-controls">
      ${vt.map(v=>`
        <div class="contrast-column" data-role="${v}">
          <div class="contrast-lightness">
            <div class="slider" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="100"
              aria-label="Lightness of the ${v} color"><span class="marker" aria-hidden="true"></span></div>
            <div class="contrast-zones" aria-hidden="true"></div>
            <div class="contrast-scale" aria-hidden="true"><span><span class="tight">L</span>* 0</span><span>50</span><span>100</span></div>
          </div>
          <div class="contrast-fixes">
            ${pr.map(([M,g])=>`<button type="button" class="contrast-fix" data-fix="${g}">Fix ${M}</button>`).join("")}
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
    <p class="contrast-status visually-hidden" aria-live="polite"></p>`;let s=null,a="oklab",r=!1,l=v=>Rt(s[v]),i=v=>N(l(v),{hue:a}),u=v=>r?Array(3).fill(tt(X(v.map(q)))):v,d=(v,M)=>t({[v]:he(M)});function c(v,M){let g=F({...i(v),l:qs(Math.round(M*10)/10,0,100)},{hue:a});d(v,g)}let h=n.querySelector('[data-option="lightnessOnly"]');h.addEventListener("change",()=>e({lightnessOnly:h.checked}));let m=He({label:"Edit contrast color",onEditing:o,keepOpen:".contrast-sample"}),b=Object.fromEntries(vt.map(v=>[v,n.querySelector(`.contrast-sample[data-role="${v}"]`)]));for(let[v,M]of Object.entries(b)){let g=()=>{m.open(M.getBoundingClientRect(),l(v)??[.5,.5,.5],{onPick:S=>d(v,S),onClose:({replaced:S})=>{M.classList.remove("is-editing"),S||M.focus()}}),M.classList.add("is-editing")};M.addEventListener("click",S=>{S.target.closest(".contrast-copy")||g()}),M.addEventListener("keydown",S=>{S.target!==M||S.key!=="Enter"&&S.key!==" "||(S.preventDefault(),g())});let A=M.querySelector(".contrast-copy"),w=M.querySelector(".contrast-hex-text"),f=0;A.addEventListener("click",async()=>{let S=await at(P(l(v)));w.textContent=S?"Copied":"Copy failed",clearTimeout(f),f=setTimeout(E,1500)})}let p=Object.fromEntries(vt.map(v=>[v,n.querySelector(`.contrast-column[data-role="${v}"]`)])),y=n.querySelector(".contrast-status"),x=0;for(let[v,M]of Object.entries(p)){Ot(M.querySelector(".slider"),cr,{valueOf:()=>i(v).l,set:({l:g})=>c(v,g)});for(let g of M.querySelectorAll("[data-fix]"))g.addEventListener("click",()=>{let A=mo(i(v),l(pe(v)),Number(g.dataset.fix),{hue:a});A!==null&&(c(v,A),y.textContent=`${hr[v]} color moved to L* ${A.toFixed(1)}.`,clearTimeout(x),x=setTimeout(()=>y.textContent="",2500))})}function T(v){let M=Object.fromEntries(pr.map(([S,L])=>[S,po(v,L)])),g=(S,{darker:L,lighter:k})=>L!==null&&S<=L||k!==null&&S>=k,A=S=>g(S,M.AAA)?"var(--zone-aaa)":g(S,M.AA)?"var(--zone-aa)":"var(--zone-fail)",w=[],f=null;for(let S=0;S<=100;S+=.25){let L=A(S);L!==f&&(f&&w.push(`${f} ${S}%`),w.push(`${L} ${S}%`),f=L)}return w.push(`${f} 100%`),`linear-gradient(90deg, ${w.join(", ")})`}function E(){if(!s)return;h.checked=r;let v=Object.fromEntries(vt.map(w=>[w,l(w)])),M=vt.every(w=>v[w]);for(let w of n.querySelectorAll("[data-fix]"))w.disabled=!M;if(!M)return;for(let w of vt){let f=b[w];f.style.background=P(u(v[w])),f.style.color=P(u(v[pe(w)])),f.querySelector(".contrast-hex-text").textContent=P(v[w]).toUpperCase()}let g=ho(v.text,v.background),A=(Math.floor(g*100)/100).toFixed(2);n.querySelector(".contrast-ratio").innerHTML=`${A}<span class="contrast-ratio-to">:1</span>`,n.querySelector(".contrast-ratio").setAttribute("aria-label",`Contrast ratio ${A} to 1`),n.querySelector(".contrast-levels").replaceChildren(...ir.map(w=>{let f=document.createElement("li"),S=g>=w.ratio;return f.className=S?"is-pass":"",f.textContent=`${w.label.replace("large","Large")} ${S?"\u2713":"\u2717"}`,f.title=`${w.title}. ${S?"Passes":"Fails"}.`,f}));for(let w of vt){let f=p[w],S=i(w);Ft(f.querySelector(".slider"),cr,r?{...S,s:0}:S,a,24),f.querySelector(".contrast-zones").style.background=T(v[pe(w)]);for(let L of f.querySelectorAll("[data-fix]")){let k=Number(L.dataset.fix),R=mo(S,v[pe(w)],k,{hue:a});L.disabled=R===null||g>=k,L.title=R===null?`No lightness reaches ${k} : 1 against the ${pe(w)}.`:g>=k?`Already reaches ${k} : 1.`:`Move the ${w} color to L* ${R.toFixed(1)}, keeping hue and saturation.`}}}return{element:n,update(v){s=v.contrast,a=v.mode,r=v.options.lightnessOnly,m.setMode(a),E()}}}var Us={js:["import","from","export","default","let","const","var","new","return","function","if","else"],glsl:["vec2","vec3","vec4","float","int","bool","void","uniform","in","out","const","return","precision","highp"]},Gs=/(\/\/.*)|('[^']*'|"[^"]*")|(\b\d+(?:\.\d*)?\b)|([A-Za-z_$][\w$]*)|(=)|([\s\S])/g,fo=t=>t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),wt=(t,e)=>`<span class="hl-${t}">${fo(e)}</span>`;function fr(t,e){let o=new Set(Us[e]);return t.replace(Gs,(n,s,a,r,l,i,u,d)=>{if(s)return wt("comment",s);if(a)return wt("string",a);if(r)return wt("number",r);if(i)return wt("operator",i);if(u)return fo(u);if(o.has(l))return wt("keyword",l);let c=t.slice(d+l.length).match(/^\s*(.)/)?.[1];return c==="("?wt("function",l):t[d-1]==="."?wt("property",l):c===":"?wt("key",l):fo(l)})}var go='<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 9H18V18H9V9Z"/><path d="M6 16V6H16"/></svg>',js='<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5L10 17.5L19 7.5"/></svg>',Pt="https://github.com/domizai/hsl-star",_t=(t,e)=>`<a href="${e}">${t}</a>`,zs=`import hslStar from './hsl-star.js';

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
col = hslStar.fromSrgb([1, 0, 1]);`,Ys="import hslStar from 'https://cdn.jsdelivr.net/gh/domizai/hsl-star@latest/js/hsl-star.min.js';",Ws=`vec3 hslStar = vec3(uv.x * 360.0, uv.y * 100.0, 0.9);
vec3 srgb = hslStarToSrgb(hslStar);

// back to HSL*, on the HSV hue axis
vec3 hls = hslStarFromSrgb(srgb, HSL_STAR_HSV);

// linear-light sRGB, for blending and lighting
vec3 linear = hslStarToLinear(hslStar);`,gr=[{name:"JS",language:"js",parts:[{html:"<strong>HSL* JavaScript module</strong>"},{html:`The HSL* color space as a single ES module, ${_t("hsl-star.js",`${Pt}/blob/main/js/hsl-star.js`)}, with no dependencies. Read more about the HSL* color space ${_t("here",`${Pt}#readme`)}.`},{html:"Some examples:"},{code:zs},{html:"Or load it from jsDelivr without copying anything:"},{code:Ys},{html:`For TypeScript and editor hints, copy ${_t("hsl-star.d.ts",`${Pt}/blob/main/js/hsl-star.d.ts`)} next to it.`}],docs:`${Pt}/blob/main/js/README.md`},{name:"GLSL",language:"glsl",parts:[{html:"<strong>HSL* in GLSL</strong>"},{html:`The HSL* color space for shaders, ${_t("hsl-star.glsl",`${Pt}/blob/main/glsl/hsl-star.glsl`)}, written for GLSL ES 3.00 (WebGL2) and desktop GLSL 1.30 and later. The precision must be highp, or dark tones band on some phones. Read more about the HSL* color space ${_t("here",`${Pt}#readme`)}.`},{html:"Some examples:"},{code:Ws},{html:`Try it on ${_t("Shadertoy","https://www.shadertoy.com/view/NXKXzz")}.`}],docs:`${Pt}/blob/main/glsl/README.md`}],br=t=>t.parts.slice(0,t.parts.findIndex(e=>e.code)),Sr=t=>`<p>${t.html}</p>`,Xs=(t,e)=>`<div class="code-block${t.includes(`
`)?"":" is-line"}"><pre><code>${fr(t,e)}</code></pre>
  <button type="button" class="code-copy" aria-label="Copy the code">${go}</button></div>`;function yr(){let t=document.createElement("div");t.className="code-tabs",t.innerHTML=`
    <div class="code-tab-list" role="tablist" aria-label="Implementation">
      ${gr.map((s,a)=>`<button type="button" class="toggle-big code-tab" role="tab" id="code-tab-${a}" aria-controls="code-panel-${a}">${s.name}</button>`).join("")}
    </div>
    ${gr.map((s,a)=>`
      <div class="box code-panel" role="tabpanel" id="code-panel-${a}" aria-labelledby="code-tab-${a}">
        <div class="code-intro">${br(s).map(Sr).join("")}</div>
        ${s.parts.slice(br(s).length).map(r=>r.code?Xs(r.code,s.language):Sr(r)).join("")}
        <hr class="code-rule">
        <p>${_t("Full documentation",s.docs)} \u2197</p>
      </div>`).join("")}`;let e=[...t.querySelectorAll(".code-tab")],o=[...t.querySelectorAll(".code-panel")];function n(s){e.forEach((a,r)=>{a.setAttribute("aria-selected",String(r===s)),a.tabIndex=r===s?0:-1,o[r].hidden=r!==s})}e.forEach((s,a)=>{s.addEventListener("click",()=>n(a)),s.addEventListener("keydown",r=>{let l={ArrowLeft:-1,ArrowRight:1}[r.key];if(!l)return;let i=(a+l+e.length)%e.length;n(i),e[i].focus()})}),n(0);for(let s of t.querySelectorAll(".code-copy")){let a=0;s.addEventListener("click",async()=>{let r=await at(s.parentElement.querySelector("code").textContent);s.innerHTML=r?js:go,s.setAttribute("aria-label",r?"Copied":"Copy failed"),clearTimeout(a),a=setTimeout(()=>{s.innerHTML=go,s.setAttribute("aria-label","Copy the code")},1500)})}return{element:t}}var xr=(t,e)=>`<a href="${e}" target="_blank" rel="noopener">${t}</a>`;function vr(){let t=document.createElement("div");return t.className="footer",t.innerHTML=`
    <p>By ${xr("domizai","https://domizai.ch/")}</p>
    
    <p class="footer-licence">${xr("MIT licence","https://github.com/domizai/hsl-star/blob/main/LICENSE.txt")}</p>`,{element:t}}function Ks(t,{hue:e="oklab",longHue:o=!1}={}){if(t.length<2)throw new Error("A palette needs at least two colors.");let n=t.map(a=>N(a,{hue:e}));n.forEach((a,r)=>{if(a.s>1e-6)return;let l=n.slice(r+1).find(i=>i.s>1e-6)??n.slice(0,r).reverse().find(i=>i.s>1e-6);l&&(a.h=l.h)});let s=t.length-1;return a=>{let r=Math.min(Math.max(a,0),1)*s,l=Math.min(Math.floor(r),s-1),i=r-l,u=n[l],d=n[l+1],c=d.h-u.h;return c>180&&(c-=360),c<-180&&(c+=360),o&&c!==0&&(c-=Math.sign(c)*360),F({h:u.h+i*c,l:u.l+i*(d.l-u.l),s:u.s+i*(d.s-u.s)},{hue:e})}}function Zs(t,e,o){if(e<t.length)throw new Error("Use at least as many steps as colors.");let n=Ks(t,o),s=Array.from({length:e},(r,l)=>n(l/(e-1))),a=t.length-1;for(let r=0;r<=a;r++){let l=r/a*(e-1);Number.isInteger(l)&&(s[l]=t[r])}return s}function Js(t,e,{hue:o="oklab"}={}){let{h:n,s,l:a}=N(t,{hue:o}),r=100/(e+1),l=d=>F({h:n,s,l:a+d*r},{hue:o}),i=Math.max(0,Math.ceil(a/r-.5)-1),u=Math.max(0,Math.ceil((100-a)/r-.5)-1);return{shades:Array.from({length:i},(d,c)=>l(c-i)),tints:Array.from({length:u},(d,c)=>l(c+1))}}function wr({stops:t,steps:e,tones:o,longHue:n},s){let a=t.map(Rt);if(a.some(l=>!l)||e<Math.max(2,a.length))return null;let r=Zs(a,e,{hue:s,longHue:n});return{colors:r,rows:r.map(l=>({base:l,...Js(l,o,{hue:s})}))}}function Wt(t){let e=document.createElement("div");e.className="fold";let o=document.createElement("div");return o.className="fold-inner",o.append(t),e.append(o),{element:e,set(n){e.classList.toggle("is-closed",!n),o.inert=!n}}}var Qs=t=>Y(getComputedStyle(document.documentElement).getPropertyValue(t)),I=Co({color:et(Qs("--primary")),mode:"oklab",picker:{space:"hsl-star",pureHues:!1,hueSpacing:!1,lightnessOnly:!1},solid:{optimal:!0,cut:!1},cylinder:{atSaturation:!0,cut:!1},palette:{stops:["#1d3557","#f7694f","#f4e9b0"].map(t=>lt(t)),steps:21,tones:9,longHue:!1},contrast:{background:lt("#f4e9b0"),text:lt("#1d3557")},contrastOptions:{lightnessOnly:!1},mini:!1,open:{"color-space":!0,palette:!0,contrast:!0,code:!0},drift:!matchMedia("(prefers-reduced-motion: reduce)").matches});Ho(I);var Lr=Ro({onToggleDrift:()=>I.update(t=>({...t,drift:!t.drift})),onSection:t=>Fe.goTo(t)});I.watch(t=>t.drift,t=>Lr.update({drifting:t}));document.getElementById("top").append(Lr.element);document.getElementById("intro").append(Po().element,Qt(["A simple color space built on sRGB with perceptual lightness and perceptually spaced hue. Every combination of hue, saturation and L* is a valid sRGB color, nothing gets clipped or falls out of gamut. Read more about it ",Ue("here","https://github.com/domizai/hsl-star"),"."],{half:!0}).element);var me=t=>I.update(e=>({...e,color:To(e,t)})),Ar=[_o({onChange:me}),Fo({onChange:me})];I.watch(t=>({color:t.color,mode:t.mode}),(t,e)=>{let o={coords:It(e),rgb:gt(e),background:dt(e),mode:e.mode};for(let n of Ar)n.update(o)},j);document.getElementById("picker").append(...Ar.map(t=>t.element));document.getElementById("picker").append(Qt("In an HSL picker, hues at the same height don't look equally light, and hue steps are also not perceptually uniform. The HSL* color space improves upon HSL by addressing perceptual inconsistencies in lightness and hue.",{half:!0}).element);var Er=No({onCoords:me,onRgb:t=>I.update(e=>({...e,color:et(t)})),onMode:t=>I.update(e=>({...e,mode:t})),onOptions:t=>I.update(e=>({...e,picker:{...e.picker,...t}}))});I.watch(t=>({color:t.color,mode:t.mode,picker:t.picker}),(t,e)=>Er.update({coords:It(e),rgb:gt(e),mode:e.mode,options:e.picker}),j);document.getElementById("picker").append(Er.element);var _e=Ko({onOptions:t=>I.update(e=>({...e,solid:{...e.solid,...t}}))});I.watch(t=>({color:t.color,solid:t.solid}),(t,e)=>_e.update({color:e.color,options:e.solid}),j);var $e=document.createElement("div");$e.id="color-space-body";_e.element.id="color-space-solid";var bo=Wt(_e.element);bo.element.classList.add("solid-fold");var Mr=Wt($e),kr=se("Color space",{onToggle:()=>I.update(t=>({...t,open:{...t.open,"color-space":!t.open["color-space"]}}))});I.watch(t=>t.open["color-space"],t=>{kr.update({open:t,controls:`${_e.element.id} ${$e.id}`}),bo.set(t),Mr.set(t)});document.getElementById("color-space").append(kr.element,bo.element,Mr.element);var So=document.createElement("div");So.className="diagrams";var[yo,Cr]=[0,1].map(()=>{let t=document.createElement("div");return t.className="diagrams-column",t});So.append(yo,Cr);$e.append(So);var Tr=sn({onOptions:t=>I.update(e=>({...e,cylinder:{...e.cylinder,...t}}))});I.watch(t=>({color:t.color,mode:t.mode,cylinder:t.cylinder}),(t,e)=>Tr.update({color:e.color,mode:e.mode,options:e.cylinder}),j);yo.append(Tr.element);var Hr=yn();I.watch(t=>({color:t.color,mode:t.mode}),(t,e)=>Hr.update({color:e.color,background:dt(e),mode:e.mode}),j);yo.append(Hr.element);var Rr=Tn({onCoords:me,onRgb:t=>I.update(e=>({...e,color:et(t)})),onColor:t=>I.update(e=>({...e,color:t}))});I.watch(t=>({color:t.color,mode:t.mode}),(t,e)=>Rr.update({coords:It(e),rgb:gt(e),background:dt(e)}),j);Cr.append(Rr.element);var Ie=Ce({onCoords:me,onRgb:t=>I.update(e=>({...e,color:et(t)})),onToggle:()=>I.update(t=>({...t,mini:!t.mini}))});I.watch(t=>({color:t.color,mode:t.mode,mini:t.mini}),(t,e)=>{let o=gt(e);Ie.update({coords:It(e),rgb:o,hex:P(o),background:dt(e),mode:e.mode,open:e.mini})},j);document.body.append(Ie.element);var tl=_n(I),Xt=document.createElement("div");Xt.id="palette-body";Xt.append(Qt("Blend two or more colors in even steps of hue, saturation and lightness, the short way round the hue circle or the long one. Each color gets its tints and shades in even steps of L*.",{half:!0}).element);var Pr=Yn({onPalette:t=>I.update(e=>({...e,palette:{...e.palette,...t}})),onEditing:t=>{Ie.element.hidden=t},current:()=>gt(I.get())});I.watch(t=>({palette:t.palette,mode:t.mode}),(t,e)=>Pr.update({palette:e.palette,mode:e.mode}),j);Xt.append(Pr.element);var xo=Wn({onSelect:t=>I.update(e=>({...e,color:et(t)}))}),vo=er(),_r=co({label:"Share palette",shareLink:()=>Fe.shareLink("palette"),exports:!0});I.watch(t=>({palette:t.palette,mode:t.mode}),(t,e)=>{let o=wr(e.palette,e.mode);xo.update(o),vo.update(o,e.palette.tones),_r.update(o,e.mode)},j);I.watch(t=>t.color,()=>{vo.redraw(),xo.restyle()});var wo=document.createElement("div");wo.className="palette-views";wo.append(xo.element,vo.element);Xt.append(wo,_r.element);var $r=Wt(Xt),Ir=se("Palette",{onToggle:()=>I.update(t=>({...t,open:{...t.open,palette:!t.open.palette}}))});I.watch(t=>t.open.palette,t=>{Ir.update({open:t,controls:Xt.id}),$r.set(t)});document.getElementById("palette").append(Ir.element,$r.element);var fe=document.createElement("div");fe.id="contrast-body";fe.append(Qt([Ue("WCAG 2","https://www.w3.org/TR/WCAG22/")," measures contrast from luminance, the same Y that HSL* turns into L*. So contrast depends on lightness alone, whatever the hue or saturation."],{half:!0}).element);var Or=mr({onContrast:t=>I.update(e=>({...e,contrast:{...e.contrast,...t}})),onOptions:t=>I.update(e=>({...e,contrastOptions:{...e.contrastOptions,...t}})),onEditing:t=>{Ie.element.hidden=t}});I.watch(t=>({contrast:t.contrast,mode:t.mode,options:t.contrastOptions}),(t,e)=>Or.update({contrast:e.contrast,mode:e.mode,options:e.contrastOptions}),j);var el=co({label:"Share contrast",shareLink:()=>Fe.shareLink("contrast")});fe.append(Or.element,el.element);var Fr=Wt(fe),Br=se("Contrast",{onToggle:()=>I.update(t=>({...t,open:{...t.open,contrast:!t.open.contrast}}))});I.watch(t=>t.open.contrast,t=>{Br.update({open:t,controls:fe.id}),Fr.set(t)});document.getElementById("contrast").append(Br.element,Fr.element);var Oe=document.createElement("div");Oe.id="code-body";Oe.append(yr().element);var Nr=Wt(Oe),Dr=se("Code",{onToggle:()=>I.update(t=>({...t,open:{...t.open,code:!t.open.code}}))});I.watch(t=>t.open.code,t=>{Dr.update({open:t,controls:Oe.id}),Nr.set(t)});document.getElementById("code").append(Dr.element,Nr.element);document.getElementById("footer").append(vr().element);var Fe=Gn(I,{isDrifting:tl.isDrifting}),ol=performance.getEntriesByType("navigation")[0]?.type==="reload";Fe.color&&!ol&&I.update(t=>({...t,drift:!1}));
