var ae=[.2126,.7152,.0722],Mn=216/24389,Ee=24389/27;var lt=(t,n,e)=>Math.min(e,Math.max(n,t)),ht=t=>t>=0&&t<360?t:(t%360+360)%360;function Y(t){return t<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}function X(t){return t=lt(t,0,1),t<=.0031308?12.92*t:1.055*Math.pow(t,1/2.4)-.055}function ot([t,n,e]){return ae[0]*t+ae[1]*n+ae[2]*e}function vt(t){return t>Mn?116*Math.cbrt(t)-16:Ee*t}function Ct(t){return t>8?((t+16)/116)**3:t/Ee}function ft(t){let n=ht(t)/60,e=Math.floor(n)%6,o=n-Math.floor(n),r=1-o;return[[1,o,0],[r,1,0],[0,1,o],[0,r,1],[o,0,1],[1,0,r]][e]}function Fn([t,n,e]){let o=Math.max(t,n,e),r=o-Math.min(t,n,e);if(r===0)return 0;let a;return o===t?a=(n-e)/r:o===n?a=(e-t)/r+2:a=(t-n)/r+4,ht(a*60)}function Pn([t,n,e]){let o=Math.cbrt(.4122214708*t+.5363325363*n+.0514459929*e),r=Math.cbrt(.2119034982*t+.6806995451*n+.1073969566*e),a=Math.cbrt(.0883024619*t+.2817188376*n+.6299787005*e),i=1.9779984951*o-2.428592205*r+.4505937099*a,l=.0259040371*o+.7827717662*r-.808675766*a;return ht(Math.atan2(l,i)*180/Math.PI)}var it=3600,In=.25,ie=null;function Le(){if(ie)return ie;let t=new Float64Array(it+1),n=In*360/it,e=0,o=0,r=0;for(let i=0;i<=it;i++){let l=Pn(ft(i*360/it).map(Y));if(i===0){e=o=l;continue}for(;l-o>180;)l-=360;for(;l-o<-180;)l+=360;r+=Math.max(0,n-(l-o)),t[i]=l-e+r,o=l}let a=360/t[it];for(let i=0;i<=it;i++)t[i]*=a;return ie=t,t}function J(t,{hue:n="oklab"}={}){if(t=ht(t),n==="hsv")return t;let e=Le(),o=0,r=it;for(;r-o>1;){let i=o+r>>1;e[i]<=t?o=i:r=i}let a=(t-e[o])/(e[r]-e[o]);return ht((o+a)*360/it)}function pt(t,{hue:n="oklab"}={}){if(t=ht(t),n==="hsv")return t;let e=Le(),o=t/360*it,r=Math.min(Math.floor(o),it-1);return ht(e[r]+(o-r)*(e[r+1]-e[r]))}function xt(t,{hue:n="oklab"}={}){let e=ft(J(t,{hue:n})).map(Y);return{pure:e,y:ot(e)}}function Lt({pure:t,y:n},e,o){let r=Ct(lt(e,0,100));o=lt(o,0,1);let a=r<=n?r/n:(1-r)/(1-n),i=r<=n?0:1-a,l=o*a,p=o*i+(1-o)*r;return t.map(u=>lt(l*u+p,0,1))}function Rt({h:t,l:n,s:e},o){return Lt(xt(t,o),n,e)}function On(t,{hue:n="oklab"}={}){let e=ot(t),o=lt(vt(e),0,100),r=Math.max(...t),a=Math.min(...t),i=r-a;if(i<1e-9)return{h:0,l:o,s:0};let l=Fn(t.map(b=>X((b-a)/i))),p=ft(l).map(Y),u=ot(p),h=e<=u?e/u:(1-e)/(1-u),S=h>0?lt(i/h,0,1):0;return{h:pt(l,{hue:n}),l:o,s:S}}function G(t,n){return Rt(t,n).map(X)}function Z(t,n){return On(t.map(Y),n)}function V(t){return t.map(n=>Math.round(lt(n,0,1)*255))}function B(t){return"#"+V(t).map(n=>n.toString(16).padStart(2,"0")).join("")}function Bn(t,n,e){let o=a=>(a+ht(t)/30)%12,r=n*Math.min(e,1-e);return[0,8,4].map(a=>e-r*Math.max(-1,Math.min(o(a)-3,9-o(a),1)))}function rt(t){let n=String(t).trim().toLowerCase(),e=n.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/);if(e){let o=e[1];return o.length===3&&(o=[...o].map(r=>r+r).join("")),[0,2,4].map(r=>parseInt(o.slice(r,r+2),16)/255)}if(e=n.match(/^(?:rgba?\()?\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*\)?$/),e){let o=e.slice(1,4).map(Number);if(o.every(r=>r<=255))return o.map(r=>r/255)}if(e=n.match(/^hsla?\(\s*(-?[\d.]+)(deg|turn)?\s*[,\s]\s*(-?[\d.]+)%?\s*[,\s]\s*(-?[\d.]+)%?\s*\)$/),e){let o=Number(e[1])*(e[2]==="turn"?360:1),[r,a]=[e[3],e[4]].map(i=>lt(Number(i)/100,0,1));if([o,r,a].every(Number.isFinite))return Bn(o,r,a)}return null}function _t({srgb:t=null,coords:n=null},e){let o={},r=(l,p)=>o[l]??(o[l]=p()),a=()=>r("srgb",()=>t??G(n,{hue:e})),i=([l,p,u])=>({r:l,g:p,b:u});return Object.freeze({get value(){return{...r("value",()=>n??Z(t,{hue:e}))}},get rgb(){return i(V(a()))},get srgb(){return i(a())},get linear(){return i(a().map(Y))},get hex(){return B(a())},with(l){return ut({...this.value,...l},{hue:e})},toString(){return this.hex}})}var Nn=t=>t&&["h","l","s"].every(n=>Number.isFinite(t[n])),Te=t=>t&&["r","g","b"].every(n=>Number.isFinite(t[n]));function ke(t,n,e){let o=Te(t)?[t.r,t.g,t.b]:t?.length===3?[...t]:null;if(!o?.every(r=>Number.isFinite(r)&&r>=0&&r<=n))throw new RangeError(`${e} takes { r, g, b } or [r, g, b] with channels from 0 to ${n}.`);return o}function ut(t,n={}){if(typeof t=="string"){if(/^\s*(rgb|hsl)a?\(/i.test(t))return ut.fromCss(t,n);if(/^\s*#?[0-9a-f]+\s*$/i.test(t))return ut.fromHex(t,n);throw new Error(`Can't read "${t}" as a colour. Use a hex code like '#ee7231', rgb() or hsl().`)}if(Nn(t)){let e={h:ht(t.h),l:lt(t.l,0,100),s:lt(t.s,0,1)};return _t({coords:e},n.hue??"oklab")}if(Te(t)||t?.length===3)return ut.fromRgb(t,n);throw new TypeError("Make a colour from { h, l, s }, { r, g, b }, [r, g, b], a hex code, rgb() or hsl().")}ut.fromRgb=(t,{hue:n="oklab"}={})=>_t({srgb:ke(t,255,"fromRgb").map(e=>e/255)},n);ut.fromSrgb=(t,{hue:n="oklab"}={})=>_t({srgb:ke(t,1,"fromSrgb")},n);ut.fromHex=(t,{hue:n="oklab"}={})=>{let e=/^\s*#?([0-9a-f]{3}|[0-9a-f]{6})\s*$/i.test(t)?rt(t):null;if(!e)throw new Error(`Can't read "${t}" as a hex code. Use six or three hex digits, like '#ee7231' or '#e73'.`);return _t({srgb:e},n)};ut.fromCss=(t,{hue:n="oklab"}={})=>{let e=/^\s*(rgb|hsl)a?\(/i.test(t)?rt(t):null;if(!e)throw new Error(`Can't read "${t}" as CSS. Use rgb() with channels from 0 to 255 or hsl() with percentages, like 'rgb(238, 114, 49)' or 'hsl(20.6, 84.8%, 56.3%)'.`);return _t({srgb:e},n)};var Gt={palette:2,contrast:8,solid:10},qt=({h:t,l:n,s:e})=>({h:Math.round(t*10)%3600/10,l:Math.round(n*10)/10,s:Math.round(e*1e3)/1e3});function $n({h:t,l:n,s:e}){let o=Math.round(t*10)%3600,r=Math.min(Math.max(Math.round(n*10),0),1e3),a=Math.min(Math.max(Math.round(e*1e3),0),1e3),i=(o<<20|r<<10|a)>>>0;return[i>>>24,i>>>16&255,i>>>8&255,i&255]}function Re(t,n){let e=(t[n]<<24|t[n+1]<<16|t[n+2]<<8|t[n+3])>>>0,o=e>>>20,r=e>>>10&1023,a=e&1023;return o>=3600||r>1e3||a>1e3?null:{h:o/10,l:r/10,s:a/1e3}}var Dn=t=>btoa(String.fromCharCode(...t)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");function Un(t){if(!/^[A-Za-z0-9_-]+$/.test(t))return null;try{return Uint8Array.from(atob(t.replace(/-/g,"+").replace(/_/g,"/")),n=>n.charCodeAt(0))}catch{return null}}var _e=(t,n)=>t.push(...n.hex?[1,3,5].map(e=>parseInt(n.hex.slice(e,e+2),16)):$n(n)),Me=(t,n)=>"#"+[...t.slice(n,n+3)].map(e=>e.toString(16).padStart(2,"0")).join("");function He(t,n){t.push(n.length);let e=new Array(Math.ceil(n.length/8)).fill(0);n.forEach((o,r)=>{o.hex||(e[r>>3]|=128>>(r&7))}),t.push(...e);for(let o of n)_e(t,o)}function Ce(t,n){if(t.length<=n)return null;let e=t[n],o=n+1;n=o+Math.ceil(e/8);let r=[];for(let a=0;a<e;a++){let i=t[o+(a>>3)]&128>>(a&7),l=i?4:3;if(t.length<n+l)return null;if(i){let p=Re(t,n);if(!p)return null;r.push(p)}else r.push({hex:Me(t,n)});n+=l}return{colours:r,o:n}}function Fe({colour:t,stops:n,contrast:e=[],steps:o,tones:r,longHue:a=!1,oklab:i=!1,scrollTo:l=null}){let u=[48|((a?1:0)|(i?4:0)|(Gt[l]??0)),t.hex?1:0];return _e(u,t),u.push(Math.min(Math.max(o,1),256)-1,Math.min(Math.max(r,0),255)),He(u,n),He(u,e),Dn(u)}function Pe(t){let n=Un(t),e=n&&n[0]>>4;if(!n||n.length<8||e<1||e>3)return null;let o=n[0]&15,r,a;if(e===3&&n[1]&1)r={hex:Me(n,2)},a=5;else{let h=e===3?2:1;r=Re(n,h),a=h+4}if(!r||n.length<a+2)return null;let i=n[a]+1,l=n[a+1],p=Ce(n,a+2);if(!p)return null;let u={colours:[],o:p.o};return e>=2&&(u=Ce(n,p.o),!u)||u.o!==n.length?null:{colour:r,stops:p.colours,contrast:u.colours,steps:i,tones:l,longHue:!!(o&1),oklab:!!(o&4),scrollTo:Object.keys(Gt).find(h=>Gt[h]===(o&Gt.solid))??null}}var Vt=(t,n,e)=>Math.min(e,Math.max(n,t)),jn=t=>Math.round(X(t)*255),Gn=`
  <div class="mini-area">
    <canvas class="mini-tone" tabindex="0" role="slider"
      aria-label="Saturation and lightness. Use the arrow keys to move, hold Shift for larger steps."></canvas>
    <div class="marker" aria-hidden="true"></div>
  </div>
  <div class="mini-area mini-hue-area">
    <canvas class="mini-hue" tabindex="0" role="slider"
      aria-label="Hue. Use the arrow keys to move, hold Shift for larger steps."></canvas>
    <div class="marker" aria-hidden="true"></div>
  </div>
  <div class="mini-swatch"></div>
  <div class="mini-fields">
    <label>Hex <input data-field="hex" spellcheck="false" autocomplete="off"></label>
    <label>RGB <input data-field="rgb" spellcheck="false" autocomplete="off"></label>
    <div class="mini-coords">
      <label>H <input type="number" data-field="h" min="0" max="360" step="0.1"></label>
      <label>S <input type="number" data-field="s" min="0" max="100" step="0.1"></label>
      <label>L* <input type="number" data-field="l" min="0" max="100" step="0.1"></label>
    </div>
  </div>
  <p class="error mini-error" role="alert"></p>
  <div class="mini-actions">
    <button type="button" data-action="load">Load into picker</button>
    <button type="button" data-action="done">Done</button>
  </div>`,qn={hex:"Enter a hex value like #3a7bd5.",rgb:"Enter RGB like rgb(58, 123, 213).",h:"Enter a hue from 0 to 360.",s:"Enter a saturation from 0 to 100.",l:"Enter a lightness from 0 to 100."};function Ie({getHueMode:t,onChange:n,onLoad:e}){let o=document.createElement("div");o.className="mini-picker",o.setAttribute("role","dialog"),o.setAttribute("aria-label","Edit colour"),o.hidden=!0,o.innerHTML=Gn,document.body.appendChild(o);let r=o.querySelector(".mini-tone"),a=o.querySelector(".mini-hue"),[i,l]=o.querySelectorAll(".marker"),p=Object.fromEntries([...o.querySelectorAll("[data-field]")].map(x=>[x.dataset.field,x])),u=o.querySelector(".mini-error"),h={hsv:0,l:50,s:1},S=null,b=()=>G({h:h.hsv,l:h.l,s:h.s},{hue:"hsv"}),L=()=>pt(h.hsv,{hue:t()});function E(x){let f=Math.min(window.devicePixelRatio||1,2);x.width=Math.round(x.clientWidth*f),x.height=Math.round(x.clientHeight*f)}function C(x,f){let{width:v,height:g}=x,d=x.getContext("2d"),s=d.createImageData(v,g);for(let c=0;c<v;c++)for(let m=0;m<g;m++){let[w,y,A]=f(c/Math.max(1,v-1),m/Math.max(1,g-1));s.data.set([w,y,A,255],(m*v+c)*4)}d.putImageData(s,0,0)}function M(){let x=xt(h.hsv,{hue:"hsv"});C(r,(f,v)=>Lt(x,(1-v)*100,f).map(jn))}function P(){let x=t();C(a,f=>V(ft(J(Math.min(f,.9999)*360,{hue:x}))))}function R({tone:x=!1,hue:f=!1,force:v=!1}={}){x&&M(),f&&P();let g=b(),d=B(g);i.style.left=`${h.s*100}%`,i.style.top=`${(1-h.l/100)*100}%`,i.style.background=d,l.style.left=`${L()/360*100}%`,l.style.top="50%",l.style.background=B(ft(h.hsv)),o.querySelector(".mini-swatch").style.background=d;let s={hex:d,rgb:`rgb(${V(g).join(", ")})`,h:L().toFixed(1),s:(h.s*100).toFixed(1),l:h.l.toFixed(1)};for(let[c,m]of Object.entries(p))(v||document.activeElement!==m)&&(m.value=s[c])}function O(x){let f=qt({h:L(),l:h.l,s:h.s});h.hsv=J(f.h,{hue:t()}),h.l=f.l,h.s=f.s,R(x),n?.(b())}function F(x){let f=Z(x,{hue:"hsv"});f.s>1e-6&&(h.hsv=f.h),h.l=f.l,h.s=f.s}function U(x,f){let v=x.parentElement,g=d=>{let s=x.getBoundingClientRect();f(Vt((d.clientX-s.left)/s.width,0,1),Vt((d.clientY-s.top)/s.height,0,1))};v.addEventListener("pointerdown",d=>{v.setPointerCapture(d.pointerId),x.focus({preventScroll:!0}),g(d)}),v.addEventListener("pointermove",d=>{v.hasPointerCapture(d.pointerId)&&g(d)})}U(r,(x,f)=>{h.s=x,h.l=(1-f)*100,O()}),U(a,x=>{h.hsv=J(Math.min(x,.9999)*360,{hue:t()}),O({tone:!0})}),r.addEventListener("keydown",x=>{let f=x.shiftKey?10:1,v={ArrowLeft:[-f,0],ArrowRight:[f,0],ArrowUp:[0,f],ArrowDown:[0,-f]};v[x.key]&&(x.preventDefault(),h.s=Vt(h.s+v[x.key][0]/100,0,1),h.l=Vt(h.l+v[x.key][1],0,100),O())}),a.addEventListener("keydown",x=>{let f=x.shiftKey?10:1,v={ArrowLeft:-f,ArrowDown:-f,ArrowRight:f,ArrowUp:f}[x.key];v&&(x.preventDefault(),h.hsv=J(L()+v,{hue:t()}),O({tone:!0}))});function j(x){let f=p[x],v=!0;if(x==="hex"||x==="rgb"){let g=rt(f.value);v=!!g,v&&F(g)}else{let g=f.value.trim()===""?NaN:Number(f.value),d=x==="h"?360:100;v=Number.isFinite(g)&&g>=0&&g<=d,v&&x==="h"&&(h.hsv=J(g%360,{hue:t()})),v&&x==="s"&&(h.s=g/100),v&&x==="l"&&(h.l=g)}return v?(f.removeAttribute("aria-invalid"),u.textContent="",O({tone:!0,force:!0}),!0):(f.setAttribute("aria-invalid","true"),u.textContent=qn[x],!1)}for(let[x,f]of Object.entries(p))f.addEventListener("change",()=>j(x)),f.addEventListener("keydown",v=>{v.key==="Enter"&&j(x)}),f.addEventListener("input",()=>{f.removeAttribute("aria-invalid"),u.textContent=""});function H(){let x=S.getBoundingClientRect(),f=o.offsetWidth,v=document.documentElement.clientWidth-f-8;o.style.left=`${Math.max(8,Math.min(x.left,v))+window.scrollX}px`,o.style.top=`${x.bottom+8+window.scrollY}px`}function $(x,f){S&&I({restoreFocus:!1}),S=x,S.setAttribute("aria-expanded","true"),F(f),u.textContent="",o.hidden=!1,H(),E(r),E(a),R({tone:!0,hue:!0,force:!0}),r.focus({preventScroll:!0})}function I({restoreFocus:x=!0}={}){if(S){R({force:!0});for(let f of Object.values(p))f.removeAttribute("aria-invalid");o.hidden=!0,S.setAttribute("aria-expanded","false"),x&&S.focus({preventScroll:!0}),S=null}}return o.addEventListener("keydown",x=>{x.key==="Escape"&&(x.preventDefault(),I())}),o.querySelector('[data-action="done"]').addEventListener("click",()=>I()),o.querySelector('[data-action="load"]').addEventListener("click",()=>e?.(b())),document.addEventListener("pointerdown",x=>{S&&!o.contains(x.target)&&!S.contains(x.target)&&I({restoreFocus:!1})}),window.addEventListener("resize",()=>S&&H()),{open:$,close:I,isOpenFor:x=>S===x,refresh:()=>S&&R({hue:!0,force:!0})}}function tt(t,n){if(Object.is(t,n))return!0;if(!t||!n||typeof t!="object"||typeof n!="object")return!1;let e=Object.keys(t);return e.length===Object.keys(n).length&&e.every(o=>Object.is(t[o],n[o]))}function Oe(t){let n=t,e=new Set;function o(){for(let r of[...e])e.has(r)&&r()}return{get:()=>n,set(r){let a={...n,...r};tt(n,a)||(n=a,o())},update(r){let a=r(n);a!==n&&(n=a,o())},watch(r,a,i=Object.is){let l=r(n),p=()=>{let u=r(n);i(u,l)||(l=u,a(u,n))};return e.add(p),a(l,n),()=>e.delete(p)}}}async function wt(t){try{return await navigator.clipboard.writeText(t),!0}catch{let n=document.createElement("textarea");n.value=t,n.style.position="absolute",n.style.opacity="0",document.body.appendChild(n),n.select();let e=document.execCommand("copy");return n.remove(),e}}var zt=Promise.resolve(`// HSL* 0.2.0
// A simple colour space built on sRGB with perceptual lightness and perceptually spaced hue.
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
//      the HSV hue of the pure colour on the edge of the RGB cube.
//   l  perceived lightness as CIE L* [0, 100]. Every colour with the same l
//      has the same luminance, so it converts to the same grey.
//   s  saturation [0, 1]. 1 is the most vivid colour of that hue and
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

// Pure colour of an HSV hue (S = V = 1), gamma-encoded.
vec3 hslStarPureHue(float h) {
  return clamp(abs(mod(h / 60.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
}

// HSV hue of a gamma-encoded colour whose smallest channel is 0 and largest 1.
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
  // Vivid colour = a * pure + b (shade if b = 0, tint otherwise).
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
  // to the pure colour's, so normalising recovers it exactly.
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
`);var Vn=`#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`,zn=t=>`#version 300 es
precision highp float;
precision highp int;
${t}
uniform vec2 uSize;
uniform int uKind;
uniform int uAxis;
uniform float uS;
uniform float uHsv;
uniform bool uPreview;
out vec4 colour;
void main() {
  vec2 p = floor(gl_FragCoord.xy);
  float l = 100.0 * p.y / (uSize.y - 1.0);
  vec3 linear = uKind == 0
    ? hslStarToLinear(vec3((p.x + 0.5) / uSize.x * 360.0, l, uS), uAxis)
    : hslStarToLinear(vec3(uHsv, l, p.x / (uSize.x - 1.0)), HSL_STAR_HSV);
  vec3 srgb = hslStarEncode(linear);
  if (uPreview) {
    vec3 shown = hslStarDecode(round(srgb * 255.0) / 255.0);
    srgb = hslStarEncode(vec3(dot(shown, HSL_STAR_WEIGHTS)));
  }
  colour = vec4(srgb, 1.0);
}`;async function Be(t){try{return Yn(await zt,t)}catch(n){return console.warn("Painting the picker in JS:",n.message),null}}function Yn(t,n){let e=document.createElement("canvas"),o=e.getContext("webgl2",{antialias:!1,depth:!1,preserveDrawingBuffer:!0});if(!o)throw new Error("no WebGL2");e.addEventListener("webglcontextlost",()=>n?.());let r=(u,h)=>{let S=o.createShader(u);if(o.shaderSource(S,h),o.compileShader(S),!o.getShaderParameter(S,o.COMPILE_STATUS))throw new Error(o.getShaderInfoLog(S));return S},a=o.createProgram();if(o.attachShader(a,r(o.VERTEX_SHADER,Vn)),o.attachShader(a,r(o.FRAGMENT_SHADER,zn(t))),o.linkProgram(a),!o.getProgramParameter(a,o.LINK_STATUS))throw new Error(o.getProgramInfoLog(a));o.useProgram(a);let i=Object.fromEntries(["uSize","uKind","uAxis","uS","uHsv","uPreview"].map(u=>[u,o.getUniformLocation(a,u)]));o.bindBuffer(o.ARRAY_BUFFER,o.createBuffer()),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),o.STATIC_DRAW);let l=o.getAttribLocation(a,"aPos");o.enableVertexAttribArray(l),o.vertexAttribPointer(l,2,o.FLOAT,!1,0,0);function p(u,h,{s:S=0,hsv:b=0,mode:L="hsv",preview:E}){let{width:C,height:M}=u;(e.width!==C||e.height!==M)&&(e.width=C,e.height=M),o.viewport(0,0,C,M),o.uniform2f(i.uSize,C,M),o.uniform1i(i.uKind,h),o.uniform1i(i.uAxis,L==="hsv"?1:0),o.uniform1f(i.uS,S),o.uniform1f(i.uHsv,b),o.uniform1i(i.uPreview,E?1:0),o.drawArrays(o.TRIANGLES,0,3);let P=u.getContext("2d");return P.clearRect(0,0,C,M),P.drawImage(e,0,0),P}return{field:(u,{s:h,mode:S,preview:b})=>p(u,0,{s:h,mode:S,preview:b}),tone:(u,{hsv:h,preview:S})=>p(u,1,{hsv:h,preview:S})}}var mt=(t,n,e)=>Math.min(e,Math.max(n,t)),le=Float64Array.from({length:256},(t,n)=>Y(n/255)),Ne=t=>Math.round(X(t)*255),ce=t=>`rgb(${V(t).join(", ")})`,Mt=t=>pt(t.colour.hsv,{hue:t.mode}),Ft=({colour:t})=>t.exact??G({h:t.hsv,l:t.l,s:t.s},{hue:"hsv"});function $e(t,n){let e=qt({h:pt(t.hsv,{hue:n}),l:t.l,s:t.s});return{...t,hsv:J(e.h,{hue:n}),l:e.l,s:e.s}}function at(t,n){t.update(e=>({...e,colour:$e({...e.colour,...n},e.mode)}))}function Pt(t,n){let e=Z(n,{hue:"hsv"}),o=e.s>1e-6?{hsv:e.h}:{};at(t,{...o,l:e.l,s:e.s,exact:[...n]})}function De(t){let n=s=>document.getElementById(s),e=n("field"),o=n("tone"),r=n("sat"),a=n("hex"),i=n("rgb"),l={h:n("in-h"),l:n("in-l"),s:n("in-s")},p=[...document.querySelectorAll('input[name="hue-mode"]')],u=s=>t.update(c=>({...c,view:{...c.view,...s}})),h=0,S={field:"",tone:""},b=null,L=()=>{S.field=S.tone="",E()};Be(()=>{b=null,L()}).then(s=>{b=s,s&&L()});let E=()=>{h||(h=requestAnimationFrame(C))};function C(){h=0;let s=t.get(),c=[e.width,e.height,s.colour.s,s.mode,s.view.preview,s.view.pureLine].join(),m=[o.width,o.height,s.colour.hsv,s.view.preview,s.view.pureLine].join();c!==S.field&&(O(s),S.field=c),m!==S.tone&&(F(s),S.tone=m),H(s)}function M(s,c,m){let w=s.width,y=s.height,A=s.getContext("2d"),_=A.createImageData(w,y),T=_.data;for(let k=0;k<w;k++){let N=m(k);for(let D=0;D<y;D++){let[q,W,ct]=N(D).map(Ne),nt=(D*w+k)*4;if(c){let jt=Ne(ot([le[q],le[W],le[ct]]));T[nt]=T[nt+1]=T[nt+2]=jt}else T[nt]=q,T[nt+1]=W,T[nt+2]=ct;T[nt+3]=255}}return A.putImageData(_,0,0),A}let P=s=>Float64Array.from({length:s},(c,m)=>100*(1-m/(s-1))),R=(s,c)=>(1-s/100)*(c-1);function O({colour:s,mode:c,view:m}){let{width:w,height:y}=e;if(!w||!y)return;let A=k=>(k+.5)/w*360,_=P(y),T=b?b.field(e,{s:s.s,mode:c,preview:m.preview}):M(e,m.preview,k=>{let N=xt(A(k),{hue:c});return D=>Lt(N,_[D],s.s)});if(m.pureLine){let k=N=>R(vt(xt(A(N),{hue:c}).y),y);U(T,Float64Array.from({length:w},(N,D)=>k(D)))}}function F({colour:s,view:c}){let{width:m,height:w}=o;if(!m||!w)return;let y=P(w),A=xt(s.hsv,{hue:"hsv"}),_=b?b.tone(o,{hsv:s.hsv,preview:c.preview}):M(o,c.preview,T=>{let k=T/(m-1);return N=>Lt(A,y[N],k)});c.pureLine&&U(_,new Float64Array(m).fill(R(vt(A.y),w)))}function U(s,c){s.save(),s.beginPath(),c.forEach((m,w)=>w?s.lineTo(w+.5,m):s.moveTo(.5,m)),s.lineJoin="round",s.strokeStyle="rgba(0, 0, 0, 0.75)",s.lineWidth=1.25,s.setLineDash([5,4]),s.stroke(),s.restore()}function j(s,c,m,w){s.style.left=`${c*100}%`,s.style.top=`${m*100}%`,s.style.background=w}function H(s){let{colour:c,mode:m,view:w}=s,y=Ft(s),A=B(y),_=Mt(s);j(n("field-marker"),_/360,1-c.l/100,A),j(n("tone-marker"),c.s,1-c.l/100,A),e.setAttribute("aria-valuetext",`Hue ${_.toFixed(0)} degrees, lightness ${c.l.toFixed(0)}, ${A}`),o.setAttribute("aria-valuetext",`Saturation ${Math.round(c.s*100)} percent, lightness ${c.l.toFixed(0)}, ${A}`);let T=[];for(let N=0;N<=10;N++)T.push(B(G({h:c.hsv,l:c.l,s:N/10},{hue:"hsv"})));r.style.setProperty("--track",`linear-gradient(to right, ${T.join(", ")})`),r.style.setProperty("--thumb",A),r.value=(c.s*100).toFixed(1),n("sat-out").textContent=`${Math.round(c.s*100)}%`,n("swatch").style.background=A,document.activeElement!==a&&(a.value=A),document.activeElement!==i&&(i.value=ce(y));let k={h:_,l:c.l,s:c.s*100};for(let[N,D]of Object.entries(l))document.activeElement!==D&&(D.value=k[N].toFixed(1));n("hue-note").textContent=m==="hsv"?"":`HSV ${c.hsv.toFixed(1)}\xB0`;for(let N of p)N.checked=N.value===m;n("pure-line").checked=w.pureLine,n("preview").checked=w.preview}t.watch(s=>({colour:s.colour,mode:s.mode,view:s.view}),E,tt);let $=new ResizeObserver(()=>{for(let s of[e,o]){let c=Math.round(s.clientWidth),m=Math.round(s.clientHeight);(c!==s.width||m!==s.height)&&(s.width=c,s.height=m,E())}});$.observe(e),$.observe(o);function I(s,c){let m=s.parentElement,w=y=>{let A=s.getBoundingClientRect();c(mt((y.clientX-A.left)/A.width,0,1),mt((y.clientY-A.top)/A.height,0,1)),x()};m.addEventListener("pointerdown",y=>{m.setPointerCapture(y.pointerId),s.focus({preventScroll:!0}),w(y)}),m.addEventListener("pointermove",y=>{m.hasPointerCapture(y.pointerId)&&w(y)})}I(e,(s,c)=>{let m=J(Math.min(s,.9999)*360,{hue:t.get().mode});at(t,{exact:null,hsv:m,l:(1-c)*100})}),I(o,(s,c)=>at(t,{exact:null,s,l:(1-c)*100})),e.addEventListener("keydown",s=>{let c=t.get(),m=s.shiftKey?10:1,w=Mt(c),y=c.colour.l;switch(s.key){case"ArrowLeft":w-=m;break;case"ArrowRight":w+=m;break;case"ArrowUp":y=mt(y+m,0,100);break;case"ArrowDown":y=mt(y-m,0,100);break;default:return}s.preventDefault(),at(t,{exact:null,hsv:J(w,{hue:c.mode}),l:y})}),o.addEventListener("keydown",s=>{let{colour:c}=t.get(),m=s.shiftKey?10:1,{s:w,l:y}=c;switch(s.key){case"ArrowLeft":w=mt(w-m/100,0,1);break;case"ArrowRight":w=mt(w+m/100,0,1);break;case"ArrowUp":y=mt(y+m,0,100);break;case"ArrowDown":y=mt(y-m,0,100);break;default:return}s.preventDefault(),at(t,{exact:null,s:w,l:y})}),r.addEventListener("input",()=>at(t,{exact:null,s:Number(r.value)/100}));for(let s of p)s.addEventListener("change",()=>{let c=s.value;try{localStorage.setItem("hue-mode",c)}catch{}t.update(m=>({...m,mode:c,colour:$e(m.colour,c)}))});n("pure-line").addEventListener("change",s=>u({pureLine:s.target.checked})),n("preview").addEventListener("change",s=>u({preview:s.target.checked}));function x(){n("error").textContent="";for(let s of[a,i,...Object.values(l)])s.removeAttribute("aria-invalid")}function f(s){let c=rt(s.value);if(!c){s.setAttribute("aria-invalid","true"),n("error").textContent=s===a?"Enter a hex value like #3a7bd5.":"Enter RGB like rgb(58, 123, 213).";return}x(),Pt(t,c),s.blur()}for(let s of[a,i])s.addEventListener("keydown",c=>{if(c.key==="Enter"&&f(s),c.key==="Escape"){let m=Ft(t.get());s.value=s===a?B(m):ce(m),x(),s.blur()}}),s.addEventListener("change",()=>f(s)),s.addEventListener("input",x);let v={h:{max:360,message:"Enter a hue from 0 to 360."},l:{max:100,message:"Enter a lightness from 0 to 100."},s:{max:100,message:"Enter a saturation from 0 to 100."}};function g(s){let c=l[s],m=c.value.trim()===""?NaN:Number(c.value);if(!Number.isFinite(m)||m<0||m>v[s].max){c.setAttribute("aria-invalid","true"),n("error").textContent=v[s].message;return}x(),s==="h"&&at(t,{exact:null,hsv:J(m%360,{hue:t.get().mode})}),s==="l"&&at(t,{exact:null,l:m}),s==="s"&&at(t,{exact:null,s:m/100})}for(let[s,c]of Object.entries(l))c.addEventListener("change",()=>g(s)),c.addEventListener("keydown",m=>{if(m.key==="Enter"&&(g(s),c.hasAttribute("aria-invalid")||c.blur()),m.key==="Escape"){let w=t.get(),y={h:Mt(w),l:w.colour.l,s:w.colour.s*100}[s];c.value=y.toFixed(1),x(),c.blur()}}),c.addEventListener("input",()=>{c.removeAttribute("aria-invalid"),n("error").textContent=""});let d=0;for(let s of document.querySelectorAll("[data-copy]"))s.addEventListener("click",async()=>{var y;let c=Ft(t.get()),m=s.dataset.copy==="hex"?B(c):ce(c),w=await wt(m);(y=s.dataset).label??(y.label=s.textContent),s.textContent=w?"Copied":"Failed",n("status").textContent=w?`Copied ${m}`:"Copying isn\u2019t available in this browser.",clearTimeout(d),d=setTimeout(()=>{for(let A of document.querySelectorAll("[data-copy]"))A.dataset.label&&(A.textContent=A.dataset.label);n("status").textContent=""},1500)})}var z=(t,n=null)=>({text:t,exact:n}),et=({text:t,exact:n})=>n??rt(t);function Yt(t){let n=Ft(t);return t.colour.exact?z(B(n)):z(B(n),n)}function ue(t,{hue:n="oklab",longHue:e=!1}={}){if(t.length<2)throw new Error("A palette needs at least two colours.");let o=t.map(a=>Z(a,{hue:n}));o.forEach((a,i)=>{if(a.s>1e-6)return;let l=o.slice(i+1).find(p=>p.s>1e-6)??o.slice(0,i).reverse().find(p=>p.s>1e-6);l&&(a.h=l.h)});let r=t.length-1;return a=>{let i=Math.min(Math.max(a,0),1)*r,l=Math.min(Math.floor(i),r-1),p=i-l,u=o[l],h=o[l+1],S=h.h-u.h;return S>180&&(S-=360),S<-180&&(S+=360),e&&S!==0&&(S-=Math.sign(S)*360),G({h:u.h+p*S,l:u.l+p*(h.l-u.l),s:u.s+p*(h.s-u.s)},{hue:n})}}function Ue(t,n,e){if(n<t.length)throw new Error("Use at least as many steps as colours.");let o=ue(t,e),r=Array.from({length:n},(i,l)=>o(l/(n-1))),a=t.length-1;for(let i=0;i<=a;i++){let l=i/a*(n-1);Number.isInteger(l)&&(r[l]=t[i])}return r}function je(t,n,{hue:e="oklab"}={}){let{h:o,s:r,l:a}=Z(t,{hue:e}),i=100/(n+1),l=h=>G({h:o,s:r,l:a+h*i},{hue:e}),p=Math.max(0,Math.ceil(a/i-.5)-1),u=Math.max(0,Math.ceil((100-a)/i-.5)-1);return{shades:Array.from({length:p},(h,S)=>l(S-p)),tints:Array.from({length:u},(h,S)=>l(S+1))}}function de(t){let n=t.map(a=>Array.isArray(a)?{base:a,shades:[],tints:[]}:a),e=a=>String(a+1).padStart(2,"0"),o=(a,i)=>[...a.shades.map((l,p)=>({rgb:l,index:i,tone:p-a.shades.length})),{rgb:a.base,index:i,tone:0},...a.tints.map((l,p)=>({rgb:l,index:i,tone:p+1}))],r=n.some(a=>a.shades.length||a.tints.length);return r?{grouped:r,groups:n.map((a,i)=>({name:`${e(i)} ${B(a.base)}`,swatches:o(a,i)}))}:{grouped:r,groups:[{swatches:n.flatMap(o)}]}}var Ge=t=>t<0?`dark ${-t}`:t>0?`light ${t}`:"",qe=({rgb:t,index:n,tone:e})=>[String(n+1).padStart(2,"0"),Ge(e),B(t)].filter(Boolean).join(" ");function fe(t,n="palette"){let{groups:e}=de(t);return`:root {
${e.map(({swatches:r})=>r.map(({rgb:a,index:i,tone:l})=>{let p=Ge(l).replace(" ","-");return`  --${n}-${i+1}${p?`-${p}`:""}: ${B(a)};`}).join(`
`)).join(`

`)}
}
`}function Ve(t,{hue:n="oklab"}={}){let{grouped:e,groups:o}=de(t),r=i=>{let{h:l,l:p,s:u}=Z(i.rgb,{hue:n});return{name:qe(i),...e&&{tone:i.tone},hex:B(i.rgb),rgb:V(i.rgb),hslStar:{h:he(l,2),l:he(p,2),s:he(u,4)}}},a=e?{groups:o.map(({name:i,swatches:l})=>({name:i,colours:l.map(r)}))}:{colours:o[0].swatches.map(r)};return JSON.stringify({space:"HSL*",hueAxis:n,...a},null,2)+`
`}var he=(t,n)=>Math.round(t*10**n)/10**n;function ze(t,n="HSL* palette"){let e=[],o=h=>{let S=new Uint8Array((h.length+1)*2);for(let b=0;b<h.length;b++)S[b*2]=h.charCodeAt(b)>>8,S[b*2+1]=h.charCodeAt(b)&255;return S},r=h=>{let S=o(h),b=new Uint8Array(2+S.length);return new DataView(b.buffer).setUint16(0,h.length+1),b.set(S,2),{type:49153,body:b}},a=h=>{let{rgb:S}=h,b=qe(h),L=o(b),E=new Uint8Array(2+L.length+4+12+2),C=new DataView(E.buffer);C.setUint16(0,b.length+1),E.set(L,2);let M=2+L.length;return E.set([82,71,66,32],M),M+=4,V(S).forEach((P,R)=>C.setFloat32(M+R*4,P/255)),C.setUint16(M+12,2),{type:1,body:E}};for(let h of de(t).groups){let S=h.name?`${n} ${h.name}`:n;e.push(r(S),...h.swatches.map(a),{type:49154,body:new Uint8Array(0)})}let i=12+e.reduce((h,S)=>h+6+S.body.length,0),l=new Uint8Array(i),p=new DataView(l.buffer);l.set([65,83,69,70],0),p.setUint16(4,1),p.setUint16(6,0),p.setUint32(8,e.length);let u=12;for(let{type:h,body:S}of e)p.setUint16(u,h),p.setUint32(u+2,S.length),l.set(S,u+6),u+=6+S.length;return l}var Ye=256,Ke=50,Kn=4;function We(t,n){let e=f=>document.getElementById(f),o=e("stops"),r=e("gradient"),a=e("stepped"),i=f=>t.update(v=>({...v,palette:{...v.palette,...f}})),l=()=>t.get().palette.stops,p=f=>i({stops:f}),u={colours:[],rows:[],stops:null},h=[];function S(f){n.close({restoreFocus:!1}),h=Array.from({length:f},(v,g)=>b(g)),o.replaceChildren(...h.map(v=>v.row))}function b(f){let v=document.createElement("div");v.className="stop";let g=document.createElement("button");g.type="button",g.className="stop-swatch",g.setAttribute("aria-label",`Edit colour ${f+1}. Press Alt and an arrow key to move it.`),g.setAttribute("aria-haspopup","dialog"),g.setAttribute("aria-expanded","false"),g.title="Click to edit, drag to reorder";let d=document.createElement("input");d.spellcheck=!1,d.autocomplete="off",d.setAttribute("aria-label",`Colour ${f+1}`);let s=document.createElement("button");return s.type="button",s.className="stop-remove",s.textContent="Remove",s.setAttribute("aria-label",`Remove colour ${f+1}`),g.addEventListener("click",()=>{if(!C.justDropped){if(n.isOpenFor(g)){n.close();return}n.open(g,d,et(l()[f])??[.5,.5,.5],c=>p(l().map((m,w)=>w===f?c:m)))}}),d.addEventListener("change",()=>p(l().map((c,m)=>m===f?z(d.value.trim()):c))),s.addEventListener("click",()=>{if(l().length<=2){e("palette-error").textContent="A palette needs at least two colours.";return}p(l().filter((c,m)=>m!==f))}),R(g,v,f),g.addEventListener("keydown",c=>{if(!c.altKey||c.key!=="ArrowLeft"&&c.key!=="ArrowRight")return;c.preventDefault();let m=f+(c.key==="ArrowLeft"?-1:1);m<0||m>=l().length||(E(f,m),h[m].swatch.focus())}),v.append(g,d,s),{row:v,swatch:g,input:d}}function L(f){f.length!==h.length&&S(f.length),f.forEach((v,g)=>{let{swatch:d,input:s}=h[g],c=et(v);d.style.background=c?B(c):"transparent",document.activeElement!==s&&(s.value=v.text),c?s.removeAttribute("aria-invalid"):s.setAttribute("aria-invalid","true")})}function E(f,v){let g=[...l()],[d]=g.splice(f,1);g.splice(v,0,d),p(g)}let C={justDropped:!1},M=document.createElement("div");M.className="stop-drop-marker";function P(f,v,g){let d=f.findIndex(s=>{let c=s.getBoundingClientRect();return g<c.top||g<=c.bottom&&v<c.left+c.width/2});return d===-1?f.length:d}function R(f,v,g){let d=null,s=!1,c=g;f.addEventListener("pointerdown",w=>{w.button===0&&(d={x:w.clientX,y:w.clientY,id:w.pointerId},f.setPointerCapture(w.pointerId))}),f.addEventListener("pointermove",w=>{if(!d||w.pointerId!==d.id)return;let y=w.clientX-d.x,A=w.clientY-d.y;if(!s){if(Math.hypot(y,A)<Kn)return;s=!0,n.close({restoreFocus:!1}),v.classList.add("dragging"),o.appendChild(M)}v.style.transform=`translate(${y}px, ${A}px)`;let _=h.map(D=>D.row).filter(D=>D!==v);c=P(_,w.clientX,w.clientY);let T=o.getBoundingClientRect(),k=_[Math.min(c,_.length-1)].getBoundingClientRect(),N=c<_.length?k.left-7:k.right+5;M.style.left=`${N-T.left}px`,M.style.top=`${k.top-T.top}px`,M.style.height=`${k.height}px`});let m=(w,y)=>{!d||w.pointerId!==d.id||(d=null,s&&(s=!1,v.classList.remove("dragging"),v.style.transform="",M.remove(),C.justDropped=!0,setTimeout(()=>C.justDropped=!1),!y&&c!==g&&E(g,c)))};f.addEventListener("pointerup",w=>m(w,!1)),f.addEventListener("pointercancel",w=>m(w,!0))}function O({palette:f,mode:v}){let g=e("swatches"),d=f.stops.map(et),{steps:s,tones:c}=f,m="";d.some(k=>!k)?m="Enter every colour as hex or RGB, like #3a7bd5.":!Number.isInteger(s)||s<2||s>Ye?m=`Use between 2 and ${Ye} steps.`:s<d.length&&(m="Use at least as many steps as colours.");let w=Number.isInteger(c)&&c>=0&&c<=Ke;if(!m&&!w&&(m=`Use between 0 and ${Ke} tints and shades.`),e("palette-error").textContent=m,e("steps").toggleAttribute("aria-invalid",m.includes("steps")),e("tones").toggleAttribute("aria-invalid",!w),m){u={colours:[],rows:[],stops:null},g.replaceChildren();return}let y=Ue(d,s,{hue:v,longHue:f.longHue}),A=y.map(k=>({base:k,...je(k,c,{hue:v})}));u={colours:y,rows:A,stops:d};let _=c*2+1,T=_>A.length;g.style.setProperty("--columns",T?_:A.length),g.style.setProperty("--rows",T?A.length:_),g.classList.toggle("dense",Math.max(_,A.length)>12),g.replaceChildren(...A.flatMap(({base:k,shades:N,tints:D},q)=>[...D.slice().reverse(),k,...N.slice().reverse()].map((W,ct)=>{let nt=F(W,W===k),jt=c+1-D.length+ct;return nt.style.gridColumn=T?_+1-jt:q+1,nt.style.gridRow=T?q+1:jt,nt})))}function F(f,v){let g=B(f),d=document.createElement("button");return d.type="button",d.className=v?"swatch-item base":"swatch-item",d.title=`${g}, click to load into the picker`,d.setAttribute("aria-label",`${v?"Palette colour":"Tone"} ${g}`),d.innerHTML=`<span class="chip"></span><span class="hex">${g}</span>`,d.querySelector(".chip").style.background=g,d.addEventListener("click",()=>Pt(t,f)),d}function U(f){let v=Math.min(window.devicePixelRatio||1,2);return f.width=Math.max(1,Math.round(f.clientWidth*v)),f.height=Math.max(1,Math.round(f.clientHeight*v)),f.getContext("2d")}function j({palette:f,mode:v,view:g}){let d=T=>g.preview?Array(3).fill(X(ot(T.map(Y)))):T;for(let T of[r,a])U(T);if(!u.stops)return;let s=r.getContext("2d"),{width:c,height:m}=r,w=ue(u.stops,{hue:v,longHue:f.longHue}),y=s.createImageData(c,m);for(let T=0;T<c;T++){let[k,N,D]=V(d(w(T/Math.max(1,c-1))));for(let q=0;q<m;q++)y.data.set([k,N,D,255],(q*c+T)*4)}s.putImageData(y,0,0);let A=a.getContext("2d"),_=u.colours.length;u.colours.forEach((T,k)=>{let N=Math.round(k/_*a.width),D=Math.round((k+1)/_*a.width);A.fillStyle=B(d(T)),A.fillRect(N,0,D-N,a.height)})}function H({steps:f,tones:v,longHue:g}){document.activeElement!==e("steps")&&(e("steps").value=f),document.activeElement!==e("tones")&&(e("tones").value=v),e("long-hue").checked=g}e("add-stop").addEventListener("click",()=>p([...l(),{...l().at(-1)}])),e("add-current").addEventListener("click",()=>p([...l(),Yt(t.get())])),e("long-hue").addEventListener("change",f=>i({longHue:f.target.checked})),e("tones").addEventListener("input",f=>i({tones:Number(f.target.value)})),e("steps").addEventListener("input",f=>i({steps:Number(f.target.value)}));function $(f,v,g){let d=URL.createObjectURL(new Blob([v],{type:g})),s=document.createElement("a");s.href=d,s.download=f,document.body.appendChild(s),s.click(),s.remove(),setTimeout(()=>URL.revokeObjectURL(d),1e3)}let I=0;function x(f){e("palette-status").textContent=f,clearTimeout(I),I=setTimeout(()=>e("palette-status").textContent="",2e3)}for(let f of document.querySelectorAll("[data-export]"))f.addEventListener("click",async()=>{if(!u.colours.length)return;let v=f.dataset.export,g=u.rows;if(v==="css"&&$("palette.css",fe(g),"text/css"),v==="json"&&$("palette.json",Ve(g,{hue:t.get().mode}),"application/json"),v==="ase"&&$("palette.ase",ze(g),"application/octet-stream"),v==="copy-css"){let d=await wt(fe(g));x(d?"CSS copied":"Copying isn\u2019t available in this browser.");return}x(`Downloaded palette.${v}`)});t.watch(f=>f.palette.stops,L),t.watch(f=>f.palette,H),t.watch(f=>({palette:f.palette,mode:f.mode}),(f,v)=>{O(v),j(v)},tt),t.watch(f=>f.view.preview,(f,v)=>j(v)),new ResizeObserver(()=>j(t.get())).observe(r)}var Xe=[{key:"aa",label:"AA",ratio:4.5,title:"Normal text, level AA: 4.5 : 1"},{key:"aaa",label:"AAA",ratio:7,title:"Normal text, level AAA: 7 : 1"},{key:"aa-large",label:"AA large",ratio:3,title:"Large text (24 px, or 18.7 px bold), level AA: 3 : 1"},{key:"aaa-large",label:"AAA large",ratio:4.5,title:"Large text (24 px, or 18.7 px bold), level AAA: 4.5 : 1"},{key:"ui",label:"UI",ratio:3,title:"Icons, borders and form fields (WCAG 1.4.11): 3 : 1"}],pe=t=>ot(V(t).map(n=>Y(n/255)));function me(t,n){let e=pe(t),o=pe(n);return(Math.max(e,o)+.05)/(Math.min(e,o)+.05)}function ge(t,n){let e=pe(t),o=(e+.05)/n-.05,r=n*(e+.05)-.05;return{darker:o>=0?vt(o):null,lighter:r<=1?vt(r):null}}function Se({h:t,l:n,s:e},o,r,a){let i=S=>me(G({h:t,l:S,s:e},a),o)>=r;if(i(n))return n;let{darker:l,lighter:p}=ge(o,r),u=[],h=(S,b)=>Math.round((S+b)*10)/10;if(l!==null){let S=Math.min(Math.ceil((l+.5)*10)/10,n);for(;S>=0&&!i(S);)S=h(S,-.1);S>=0&&u.push(S)}if(p!==null){let S=Math.max(Math.floor((p-.5)*10)/10,n);for(;S<=100&&!i(S);)S=h(S,.1);S<=100&&u.push(S)}return u.length?u.reduce((S,b)=>Math.abs(b-n)<Math.abs(S-n)?b:S):null}var Je=(t,n,e)=>Math.min(e,Math.max(n,t)),Kt=t=>t==="text"?"background":"text";function Ze(t){let n=Math.min(window.devicePixelRatio||1,2);return t.width=Math.max(1,Math.round(t.clientWidth*n)),t.height=Math.max(1,Math.round(t.clientHeight*n)),t.getContext("2d")}function Qe(t,n){let e=b=>document.getElementById(b),o=Object.fromEntries([...document.querySelectorAll(".contrast-colour")].map(b=>[b.dataset.role,b])),r=Object.fromEntries([...document.querySelectorAll(".lightness")].map(b=>[b.dataset.role,b])),a=b=>t.get().contrast[b],i=(b,L)=>t.update(E=>({...E,contrast:{...E.contrast,[b]:L}})),l=(b,L=t.get())=>Z(et(L.contrast[b]),{hue:L.mode});function p(b,L){let{mode:E}=t.get(),C=G({...l(b),l:Je(Math.round(L*10)/10,0,100)},{hue:E});i(b,z(B(C),C))}for(let[b,L]of Object.entries(o)){let E=L.querySelector(".stop-swatch"),C=L.querySelector("input");E.addEventListener("click",()=>{if(n.isOpenFor(E)){n.close();return}n.open(E,C,et(a(b))??[.5,.5,.5],M=>i(b,M))}),C.addEventListener("change",()=>i(b,z(C.value.trim()))),L.querySelector("[data-use-selected]").addEventListener("click",()=>{i(b,Yt(t.get()))})}e("contrast-swap").addEventListener("click",()=>t.update(b=>({...b,contrast:{background:b.contrast.text,text:b.contrast.background}}))),e("contrast-preview").addEventListener("change",b=>t.update(L=>({...L,view:{...L.view,preview:b.target.checked}})));function u(b){let{contrast:L,mode:E,view:C}=b,M=H=>C.preview?Array(3).fill(X(ot(H.map(Y)))):H;e("contrast-preview").checked=C.preview;let P={background:et(L.background),text:et(L.text)};for(let[H,$]of Object.entries(o)){let I=$.querySelector("input");document.activeElement!==I&&(I.value=L[H].text),P[H]?I.removeAttribute("aria-invalid"):I.setAttribute("aria-invalid","true"),$.querySelector(".stop-swatch").style.background=P[H]?B(P[H]):"transparent"}let R=P.background&&P.text;e("contrast-error").textContent=R?"":"Enter both colours as hex or RGB, like #3a7bd5.";for(let H of document.querySelectorAll("[data-fix]"))H.disabled=!R;if(!R){e("contrast-ratio").textContent="",e("contrast-levels").replaceChildren();for(let H of Object.values(r))H.querySelector(".lightness-zones").replaceChildren(),Ze(H.querySelector(".lightness-bar"));return}let{background:O,text:F}=P,U=(H,$,I)=>{H.style.background=B(M($)),H.style.color=B(M(I))};U(e("sample-normal"),O,F),U(e("sample-swapped"),F,O);let j=me(F,O);e("contrast-ratio").textContent=`${(Math.floor(j*100)/100).toFixed(2)} : 1`,e("contrast-levels").replaceChildren(...Xe.map(H=>{let $=document.createElement("li"),I=j>=H.ratio;return $.className=I?"pass":"",$.textContent=`${H.label} ${I?"\u2713":"\u2717"}`,$.title=`${H.title}. ${I?"Passes":"Fails"}.`,$}));for(let H of Object.keys(r)){h(b,M,H,P[H],P[Kt(H)]);let $=l(H,b);for(let I of r[H].querySelectorAll("[data-fix]")){let x=Number(I.dataset.fix),f=Se($,P[Kt(H)],x,{hue:E});I.disabled=f===null||j>=x,I.title=f===null?`No lightness reaches ${x} : 1 against the ${Kt(H)}.`:j>=x?`Already reaches ${x} : 1.`:`Move the ${H} colour to L* ${f.toFixed(1)}, keeping hue and saturation.`}}}function h(b,L,E,C,M){let P=r[E],R=P.querySelector(".lightness-bar"),O=Ze(R),{width:F,height:U}=R,{h:j,s:H,l:$}=l(E,b),I=O.createImageData(F,U);for(let v=0;v<F;v++){let g=L(G({h:j,s:H,l:v/Math.max(1,F-1)*100},{hue:b.mode})),[d,s,c]=V(g);for(let m=0;m<U;m++)I.data.set([d,s,c,255],(m*F+v)*4)}O.putImageData(I,0,0);let x=[];for(let[v,g]of[["aa",4.5],["aaa",7]]){let{darker:d,lighter:s}=ge(M,g),c=(m,w)=>{let y=document.createElement("span");y.className=v,y.style.left=`${m}%`,y.style.width=`${w-m}%`,x.push(y)};d!==null&&c(0,d),s!==null&&c(s,100)}P.querySelector(".lightness-zones").replaceChildren(...x);let f=P.querySelector(".marker");f.style.left=`${$}%`,f.style.background=B(L(C)),R.setAttribute("aria-valuenow",$.toFixed(1)),R.setAttribute("aria-valuetext",`L* ${$.toFixed(1)}, ${B(C)}`)}let S=0;for(let[b,L]of Object.entries(r)){let E=L.querySelector(".lightness-bar"),C=E.parentElement,M=()=>et(a("text"))&&et(a("background")),P=R=>{let O=E.getBoundingClientRect();p(b,Je((R.clientX-O.left)/O.width,0,1)*100)};C.addEventListener("pointerdown",R=>{M()&&(C.setPointerCapture(R.pointerId),E.focus({preventScroll:!0}),P(R))}),C.addEventListener("pointermove",R=>{C.hasPointerCapture(R.pointerId)&&P(R)}),E.addEventListener("keydown",R=>{let O=R.shiftKey?10:1,F={ArrowLeft:-O,ArrowDown:-O,ArrowRight:O,ArrowUp:O}[R.key];!F||!M()||(R.preventDefault(),p(b,l(b).l+F))});for(let R of L.querySelectorAll("[data-fix]"))R.addEventListener("click",()=>{let O=et(a(Kt(b))),F=Se(l(b),O,Number(R.dataset.fix),{hue:t.get().mode});if(F===null)return;p(b,F);let U=b==="text"?"Text":"Background";e("contrast-status").textContent=`${U} colour moved to L* ${F.toFixed(1)}.`,clearTimeout(S),S=setTimeout(()=>e("contrast-status").textContent="",2500)})}t.watch(b=>({contrast:b.contrast,mode:b.mode,preview:b.view.preview}),(b,L)=>u(L),tt),new ResizeObserver(()=>u(t.get())).observe(r.text.querySelector(".lightness-bar"))}var Wn=.008856451679035631,Xn=24389/27,Jn=[[.4124564,.3575761,.1804375],[.2126729,.7151522,.072175],[.0193339,.119192,.9503041]],Zn=[.95047,1,1.08883];function Qn(t){return Jn.map(([n,e,o])=>n*t[0]+e*t[1]+o*t[2])}var be=t=>t>Wn?Math.cbrt(t):(Xn*t+16)/116;function tn([t,n,e],o=Zn){let r=be(t/o[0]),a=be(n/o[1]),i=be(e/o[2]);return[116*a-16,500*(r-a),200*(a-i)]}function Ot(t){return tn(Qn(t))}var yt=(t,n,e,o)=>{let r=(t-n)/(t<n?e:o);return Math.exp(-.5*r*r)},to=t=>1.056*yt(t,599.8,37.9,31)+.362*yt(t,442,16,26.7)-.065*yt(t,501.1,20.4,26.2),eo=t=>.821*yt(t,568.8,46.9,40.5)+.286*yt(t,530.9,16.3,31.1),no=t=>1.217*yt(t,437,11.8,36)+.681*yt(t,459,26,13.8),Wt=[49.9755,54.6482,82.7549,91.486,93.4318,86.6823,104.865,117.008,117.812,114.861,115.923,108.811,109.354,107.802,104.79,107.689,104.405,104.046,100,96.3342,95.788,88.6856,90.0062,89.5991,87.6987,83.2886,83.6992,80.0268,80.2146,82.2778,78.2842,69.7213,71.6091,74.349,61.604,69.8856,75.087,63.5927,46.4182,66.8054,63.3828],en=5,ve=380,It=(780-ve)/en+1;function oo(t){let n=(t-ve)/10,e=Math.min(Math.floor(n),Wt.length-2);return Wt[e]+(n-e)*(Wt[e+1]-Wt[e])}function ro(){let t=[];for(let e=0;e<It;e++){let o=ve+e*en,r=oo(o);t.push([r*to(o),r*eo(o),r*no(o)])}let n=t.reduce((e,o)=>e+o[1],0);return t.map(e=>e.map(o=>o/n))}var Xt=null;function so(){if(Xt)return Xt;let t=ro(),n=[0,1,2].map(l=>t.reduce((p,u)=>p+u[l],0)),e=[[0,0,0]];for(let l=0;l<2*It;l++){let p=e[l],u=t[l%It];e.push([p[0]+u[0],p[1]+u[1],p[2]+u[2]])}let o=It,r=It+1,a=new Float32Array(o*r*3);for(let l=0;l<r;l++)for(let p=0;p<o;p++){let u=e[p],h=e[p+l],S=tn([h[0]-u[0],h[1]-u[1],h[2]-u[2]],n);a.set(S,(l*o+p)*3)}let i=[];for(let l=0;l<r-1;l++)for(let p=0;p<o;p++){let u=(p+1)%o,h=l*o+p,S=l*o+u,b=(l+1)*o+p,L=(l+1)*o+u;i.push(h,S,L,h,L,b)}return Xt={positions:a,indices:new Uint32Array(i),white:n},Xt}function nn(t){let{positions:n,indices:e}=so(),o=[];for(let r of t)for(let a=0;a<e.length;a+=3){let i=[e[a],e[a+1],e[a+2]],l=[];for(let p=0;p<3;p++){let u=i[p]*3,h=i[(p+1)%3]*3,S=n[u],b=n[h];if(S<r!=b<r){let L=(r-S)/(b-S);l.push(r,n[u+1]+L*(n[h+1]-n[u+1]),n[u+2]+L*(n[h+2]-n[u+2]))}}l.length===6&&o.push(...l)}return new Float32Array(o)}function dt(t,n){let e=new Float32Array(16);for(let o=0;o<4;o++)for(let r=0;r<4;r++){let a=0;for(let i=0;i<4;i++)a+=t[i*4+r]*n[o*4+i];e[o*4+r]=a}return e}function on(t,n,e,o){let r=1/Math.tan(t/2),a=1/(e-o);return new Float32Array([r/n,0,0,0,0,r,0,0,0,0,(o+e)*a,-1,0,0,2*o*e*a,0])}function rn(t,n,e){let o=1/(n-e);return new Float32Array([1/t,0,0,0,0,1,0,0,0,0,2*o,0,0,0,(e+n)*o,1])}function Bt(t,n,e){let o=Math.cos(t),r=Math.sin(t),a=Math.cos(n),i=Math.sin(n),l=new Float32Array([o,0,-r,0,0,1,0,0,r,0,o,0,0,0,0,1]),p=new Float32Array([1,0,0,0,0,a,i,0,0,-i,a,0,0,0,0,1]),u=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,-e,1]);return dt(u,dt(p,l))}var Jt=1.45;function Zt(t,n,e,o=.92){let r=0;for(let i=-Jt;i<=Jt+1e-9;i+=.05){let l=dt(t,Bt(0,i,n));for(let[p,u,h]of e){let S=l[3]*p+l[7]*u+l[11]*h+l[15],b=(l[0]*p+l[4]*u+l[8]*h+l[12])/S,L=(l[1]*p+l[5]*u+l[9]*h+l[13])/S;r=Math.max(r,Math.abs(b),Math.abs(L))}}let a=o/r;return new Float32Array([a,0,0,0,0,a,0,0,0,0,1,0,0,0,0,1])}function Qt(t,n,e=72){return Array.from({length:e},(o,r)=>r/e*2*Math.PI).flatMap(o=>n.map(r=>[t*Math.cos(o),r,-t*Math.sin(o)]))}function Nt(t,n,e,o,r){let a=(p,u)=>{let h=t.createShader(p);if(t.shaderSource(h,u),t.compileShader(h),!t.getShaderParameter(h,t.COMPILE_STATUS))throw new Error(t.getShaderInfoLog(h));return h},i=t.createProgram();if(t.attachShader(i,a(t.VERTEX_SHADER,n)),t.attachShader(i,a(t.FRAGMENT_SHADER,e)),t.linkProgram(i),!t.getProgramParameter(i,t.LINK_STATUS))throw new Error(t.getProgramInfoLog(i));let l={p:i};for(let p of o)l[p]=t.getAttribLocation(i,p);for(let p of r)l[p]=t.getUniformLocation(i,p);return l}function At(t,n){let e=getComputedStyle(t).color.match(/[\d.]+/g)||["128","128","128"];return[e[0]/255,e[1]/255,e[2]/255,n]}function te(t){matchMedia("(prefers-color-scheme: dark)").addEventListener("change",t),new MutationObserver(t).observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme"]})}function ee(t,n,e,o){let r=(i,l)=>{n.yaw+=i,n.pitch=Math.max(-Jt,Math.min(Jt,n.pitch+l)),o()},a=null;t.addEventListener("pointerdown",i=>{t.setPointerCapture(i.pointerId),a={x:i.clientX,y:i.clientY}}),t.addEventListener("pointermove",i=>{!a||!t.hasPointerCapture(i.pointerId)||(r((i.clientX-a.x)*.008,(i.clientY-a.y)*.008),a={x:i.clientX,y:i.clientY})}),t.addEventListener("pointerup",()=>a=null),t.addEventListener("dblclick",()=>{Object.assign(n,e),o()}),t.addEventListener("keydown",i=>{let l=i.shiftKey?.3:.08,p={ArrowLeft:[-l,0],ArrowRight:[l,0],ArrowUp:[0,-l],ArrowDown:[0,l]};p[i.key]&&(i.preventDefault(),r(...p[i.key]))})}var Tt={hue:"hsv"},St=180,sn=100,an=16,ao=[10,20,30,40,50,60,70,80,90],io=35*Math.PI/180,ln={yaw:-1.1,pitch:.12},cn=4.5,lo=Qt(2,[-.5,.5]),co=1.4,uo=`
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
}`,ho=`
precision mediump float;
varying vec3 vColor;
varying float vL;
uniform float uCut;
void main() {
  if (vL > uCut) discard;
  gl_FragColor = vec4(vColor, 1.0);
}`,fo=`
precision mediump float;
varying float vL;
uniform vec4 uColor;
uniform float uCut;
void main() {
  if (vL > uCut) discard;
  gl_FragColor = uColor;
}`,po=`
precision mediump float;
uniform vec3 uFill;
void main() {
  float r = length(gl_PointCoord * 2.0 - 1.0);
  if (r > 1.0) discard;
  if (r > 0.88) gl_FragColor = vec4(0.0, 0.0, 0.0, 0.55);
  else if (r > 0.66) gl_FragColor = vec4(1.0);
  else gl_FragColor = vec4(uFill, 1.0);
}`,xe=t=>X(Ct(t));function mo(){let t=St+1,n=sn+1,e=new Float32Array(t*n*3),o=new Float32Array(t*n*3),r=new Float32Array(t*n*3);for(let a=0;a<n;a++){let i=a/sn*100;for(let l=0;l<t;l++){let p=l/St*360,u=(a*t+l)*3;e.set(Ot(Rt({h:p,l:i,s:1},Tt)),u),o.set(G({h:p,l:i,s:1},Tt),u),r.fill(xe(i),u,u+3)}}return{lab:e,colour:o,grey:r,indices:dn(t,n)}}function go(t){let n=St+1,e=an+1,o=new Float32Array(n*e*3),r=new Float32Array(n*e*3),a=new Float32Array(n*e*3);for(let i=0;i<e;i++){let l=i/an;for(let p=0;p<n;p++){let u=p/St*360,h=(i*n+p)*3,S=Ot(Rt({h:u,l:t,s:l},Tt));S[0]=t,o.set(S,h),r.set(G({h:u,l:t,s:l},Tt),h),a.fill(xe(t),h,h+3)}}return{lab:o,colour:r,grey:a,indices:dn(n,e)}}function dn(t,n){let e=new Uint16Array((t-1)*(n-1)*6),o=0;for(let r=0;r<n-1;r++)for(let a=0;a<t-1;a++){let i=r*t+a;e.set([i,i+1,i+t+1,i,i+t+1,i+t],o),o+=6}return e}function So(){let t=new Float32Array((St+1)*3);for(let n=0;n<=St;n++)t.set(Ot(ft(n/St*360).map(Y)),n*3);return t}var gt=150,un=new Float32Array([0,0,0,100,0,0,0,-gt,0,0,gt,0,0,0,-gt,0,0,gt]),hn=[{text:"+a*",lab:[0,gt+12,0]},{text:"\u2212a*",lab:[0,-gt-12,0]},{text:"+b*",lab:[0,0,gt+12]},{text:"\u2212b*",lab:[0,0,-gt-12]}];function fn(t,n){let e=t.getContext("webgl",{antialias:!0,premultipliedAlpha:!1});if(!e)return null;let o=d=>Nt(e,uo,d,["aLab","aColor"],["uMvp","uCut","uColor","uFill","uPointSize","uOffset"]),r=o(ho),a=o(fo),i=o(po),l=(d,s=e.ARRAY_BUFFER)=>{let c=e.createBuffer();return e.bindBuffer(s,c),e.bufferData(s,d,e.STATIC_DRAW),c};function p(d){return{lab:l(d.lab),colour:l(d.colour),grey:l(d.grey),indices:l(d.indices,e.ELEMENT_ARRAY_BUFFER),count:d.indices.length}}let u=p(mo()),h=nn(ao),S=l(h),b=l(So()),L=l(un),E=l(new Float32Array(3)),C=null,M=null,P=hn.map(({text:d})=>{let s=document.createElement("span");return s.textContent=d,n.appendChild(s),s}),R={...ln},O={key:"",adjust:null},F={h:0,l:50,s:1,optimal:!0,cut:!1,pureLine:!1,preview:!1},U=0,j=()=>{U||(U=requestAnimationFrame(f))};function H(d,s){e.bindBuffer(e.ARRAY_BUFFER,s),e.enableVertexAttribArray(d),e.vertexAttribPointer(d,3,e.FLOAT,!1,0,0)}function $(d,s,c){let m=r;e.useProgram(m.p),e.uniformMatrix4fv(m.uMvp,!1,s),e.uniform1f(m.uCut,c),e.uniform1f(m.uPointSize,1),H(m.aLab,d.lab),H(m.aColor,F.preview?d.grey:d.colour),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,d.indices),e.drawElements(e.TRIANGLES,d.count,e.UNSIGNED_SHORT,0),e.disableVertexAttribArray(m.aColor)}function I(d,s,c,m,w,y=1e3){let A=a;e.useProgram(A.p),e.uniformMatrix4fv(A.uMvp,!1,m),e.uniform1f(A.uCut,y),e.uniform4fv(A.uColor,w),e.uniform1f(A.uPointSize,1),H(A.aLab,d);let _=x();for(let T=0;T<_;T++)for(let k=0;k<_;k++)e.uniform2f(A.uOffset,2*T/t.width,2*k/t.height),e.drawArrays(c,0,s)}let x=()=>t.width/t.clientWidth>=1.5?2:1;function f(){U=0;let d=Math.min(window.devicePixelRatio||1,2),s=Math.round(t.clientWidth*d),c=Math.round(t.clientHeight*d);if(!s||!c)return;(t.width!==s||t.height!==c)&&(t.width=s,t.height=c),e.viewport(0,0,s,c),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT);let m=s/c,w=on(io,m,.1,100);O.key!==`${s}\xD7${c}`&&(O={key:`${s}\xD7${c}`,adjust:Zt(w,cn,lo,.92*co)});let y=dt(O.adjust,dt(w,Bt(R.yaw,R.pitch,cn))),A=F.cut?F.l:1e3;e.enable(e.DEPTH_TEST),e.depthMask(!0),e.disable(e.BLEND),e.enable(e.POLYGON_OFFSET_FILL),e.polygonOffset(1,1),$(u,y,A),F.cut&&(M!==F.l&&(C=p(go(F.l)),M=F.l),$(C,y,1e3)),e.disable(e.POLYGON_OFFSET_FILL),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.depthMask(!1),I(L,un.length/3,e.LINES,y,At(t,.35)),F.pureLine&&I(b,St+1,e.LINE_STRIP,y,[0,0,0,.8],A),F.optimal&&I(S,h.length/3,e.LINES,y,At(t,.7)),e.disable(e.DEPTH_TEST);let _=Ot(Rt(F,Tt));e.bindBuffer(e.ARRAY_BUFFER,E),e.bufferData(e.ARRAY_BUFFER,new Float32Array(_),e.DYNAMIC_DRAW),e.useProgram(i.p),e.uniformMatrix4fv(i.uMvp,!1,y),e.uniform1f(i.uPointSize,18*d);let T=F.preview?Array(3).fill(xe(F.l)):G(F,Tt);e.uniform3fv(i.uFill,T),H(i.aLab,E),e.drawArrays(e.POINTS,0,1),g(y,s,c)}let v=new Uint8Array(4);function g(d,s,c){hn.forEach(({lab:m},w)=>{let y=[m[1]*.01,(m[0]-50)*.01,-m[2]*.01,1],A=[0,1,2,3].map(q=>d[q]*y[0]+d[4+q]*y[1]+d[8+q]*y[2]+d[12+q]*y[3]),_=(A[0]/A[3]+1)/2,T=(1-A[1]/A[3])/2;P[w].style.left=`${_*100}%`,P[w].style.top=`${T*100}%`;let k=Math.round(_*s),N=Math.round((1-T)*c),D=!1;k>=0&&k<s&&N>=0&&N<c&&(e.readPixels(k,N,1,1,e.RGBA,e.UNSIGNED_BYTE,v),D=v[3]>240),P[w].style.visibility=D?"hidden":""})}return ee(t,R,ln,j),new ResizeObserver(j).observe(t),te(j),{update(d){F={...F,...d},j()}}}var kt=.75,ne=2*kt,bt=360,pn=[0,25,50,75,100],mn=[0,60,120,180,240,300],bo=[.25,.5,.75,1],Et=1.22,$t=.06,we=.14,gn={yaw:-.6,pitch:.35},Sn=5,vo=`#version 300 es
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
  gl_Position = uMvp * vec4(s * ${kt.toFixed(6)} * cos(a), (l / 100.0 - 0.5) * ${ne.toFixed(6)}, -s * ${kt.toFixed(6)} * sin(a), 1.0);
}`,xo=t=>`#version 300 es
precision highp float;
precision highp int;
${t}
uniform int uAxis;
uniform bool uPreview;
uniform float uCut;
in vec3 vHls;
out vec4 colour;
void main() {
  if (vHls.y > uCut) discard;
  colour = vec4(hslStarToSrgb(uPreview ? vec3(0.0, vHls.y, 0.0) : vHls, uAxis), 1.0);
}`,wo=`
attribute vec3 aPos;
uniform mat4 uMvp;
uniform float uPointSize;
uniform vec2 uOffset;
void main() {
  gl_Position = uMvp * vec4(aPos, 1.0);
  gl_Position.xy += uOffset * gl_Position.w;
  gl_PointSize = uPointSize;
}`,yo=`
precision mediump float;
uniform vec4 uColor;
void main() {
  gl_FragColor = uColor;
}`,Ao=`
precision mediump float;
uniform vec3 uFill;
void main() {
  float r = length(gl_PointCoord * 2.0 - 1.0);
  if (r > 1.0) discard;
  if (r > 0.88) gl_FragColor = vec4(0.0, 0.0, 0.0, 0.55);
  else if (r > 0.66) gl_FragColor = vec4(1.0);
  else gl_FragColor = vec4(uFill, 1.0);
}`;function K(t,n,e){let o=t*Math.PI/180;return[e*kt*Math.cos(o),(n/100-.5)*ne,-e*kt*Math.sin(o)]}var Eo=t=>X(Ct(t));function Lo(){let t=[];for(let n=0;n<=bt;n++){let e=n/bt*360;t.push(e,0,1,e,100,1)}return new Float32Array(t)}function To(){let t=[];for(let n=0;n<bt;n++){let[e,o]=[n/bt,(n+1)/bt].map(r=>r*360);t.push((e+o)/2,0,0,e,0,1,o,0,1)}return new Float32Array(t)}function bn(t,n,e){let o=t.getContext("webgl2",{antialias:!0,premultipliedAlpha:!1});if(!o)return null;let r=Nt(o,vo,xo(e),["aHls"],["uMvp","uSpread","uLift","uCut","uAxis","uPreview"]),a=g=>Nt(o,wo,g,["aPos"],["uMvp","uColor","uFill","uPointSize","uOffset"]),i=a(yo),l=a(Ao),p=(g,d=o.ARRAY_BUFFER,s=o.STATIC_DRAW)=>{let c=o.createBuffer();return o.bindBuffer(d,c),o.bufferData(d,g,s),c},u=p(Lo()),h=p(To()),S=p(new Float32Array(3),o.ARRAY_BUFFER,o.DYNAMIC_DRAW),b=p(new Float32Array(3),o.ARRAY_BUFFER,o.DYNAMIC_DRAW),L={...gn},E={hsv:0,l:50,s:1,mode:"oklab",preview:!1,atSaturation:!1,cut:!1},C=0,M=()=>{C||(C=requestAnimationFrame(H))};function P(g,d){o.bindBuffer(o.ARRAY_BUFFER,d),o.enableVertexAttribArray(g),o.vertexAttribPointer(g,3,o.FLOAT,!1,0,0)}function R(g,d,s,c,m){o.uniform1f(r.uLift,c),o.uniform1f(r.uCut,m),P(r.aHls,g),o.drawArrays(d,0,s)}function O(g,d,s,c){o.bindBuffer(o.ARRAY_BUFFER,S),o.bufferData(o.ARRAY_BUFFER,new Float32Array(g),o.DYNAMIC_DRAW);let m=g.length/3;o.useProgram(i.p),o.uniformMatrix4fv(i.uMvp,!1,s),o.uniform4fv(i.uColor,c),o.uniform1f(i.uPointSize,1),P(i.aPos,S);let w=t.width/t.clientWidth>=1.5?2:1;for(let y=0;y<w;y++)for(let A=0;A<w;A++)o.uniform2f(i.uOffset,2*y/t.width,2*A/t.height),o.drawArrays(d,0,m)}let F=Qt((Et+$t+we)*kt,[-.5*ne,.58*ne]),U={key:"",adjust:null};function j(g,d,s){return U.key!==s&&(U={key:s,adjust:Zt(g,d,F)}),U.adjust}function H(){C=0;let g=Math.min(window.devicePixelRatio||1,2),d=Math.round(t.clientWidth*g),s=Math.round(t.clientHeight*g);if(!d||!s)return;(t.width!==d||t.height!==s)&&(t.width=d,t.height=s),o.viewport(0,0,d,s),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT|o.DEPTH_BUFFER_BIT);let c=d/s,m=rn(c,.1,100),w=j(m,Sn,`${d}\xD7${s}`),y=dt(w,dt(m,Bt(L.yaw,L.pitch,Sn)));o.enable(o.DEPTH_TEST),o.depthMask(!0),o.disable(o.BLEND),o.useProgram(r.p),o.uniformMatrix4fv(r.uMvp,!1,y),o.uniform1f(r.uSpread,E.atSaturation?E.s:1),o.uniform1i(r.uAxis,E.mode==="hsv"?1:0),o.uniform1i(r.uPreview,E.preview?1:0);let A=E.cut?E.l:1e3;R(u,o.TRIANGLE_STRIP,(bt+1)*2,0,A),R(h,o.TRIANGLES,bt*3,0,A),R(h,o.TRIANGLES,bt*3,E.cut?E.l:100,1e3),o.enable(o.BLEND),o.blendFunc(o.SRC_ALPHA,o.ONE_MINUS_SRC_ALPHA),o.depthMask(!1);let _=I(y),T=[...K(_,0,Et),...K(_,100,Et)];for(let W of pn)T.push(...K(_,W,Et),...K(_,W,Et+$t));for(let W of mn)T.push(...K(W,0,1),...K(W,0,1+$t));O(T,o.LINES,y,At(t,.55)),o.disable(o.DEPTH_TEST);let k=[];for(let W of bo)for(let ct=0;ct<72;ct++)k.push(...K(ct/72*360,0,W),...K((ct+1)/72*360,0,W));O(k,o.LINES,y,At(t,.3));let N=pt(E.hsv,{hue:E.mode}),D=K(N,E.l,E.s);O([...K(0,0,0),...K(N,0,E.s),...D],o.LINE_STRIP,y,At(t,.9)),o.bindBuffer(o.ARRAY_BUFFER,b),o.bufferData(o.ARRAY_BUFFER,new Float32Array(D),o.DYNAMIC_DRAW),o.useProgram(l.p),o.uniformMatrix4fv(l.uMvp,!1,y),o.uniform1f(l.uPointSize,18*g),o.uniform2f(l.uOffset,0,0);let q=G({h:E.hsv,l:E.l,s:E.s},{hue:"hsv"});o.uniform3fv(l.uFill,E.preview?Array(3).fill(Eo(E.l)):q),P(l.aPos,b),o.drawArrays(o.POINTS,0,1),v(y,d,s,_)}function $(g,[d,s,c]){let m=g[3]*d+g[7]*s+g[11]*c+g[15];return[((g[0]*d+g[4]*s+g[8]*c+g[12])/m+1)/2,(1-(g[1]*d+g[5]*s+g[9]*c+g[13])/m)/2]}function I(g){let d=0,s=1/0;for(let c=0;c<360;c+=2){let[m]=$(g,K(c,50,1));m<s&&([d,s]=[c,m])}return d}let x=[...pn.map(g=>({text:String(g),at:d=>K(d,g,Et+$t+we)})),{text:"L*",at:g=>K(g,108,Et)},...mn.map(g=>({text:`${g}\xB0`,at:()=>K(g,0,1+$t+we)}))].map(g=>{let d=document.createElement("span");return d.textContent=g.text,n.appendChild(d),{...g,el:d}}),f=new Uint8Array(4);function v(g,d,s,c){for(let{at:m,el:w}of x){let[y,A]=$(g,m(c));w.style.left=`${y*100}%`,w.style.top=`${A*100}%`;let _=Math.round(y*d),T=Math.round((1-A)*s),k=!1;_>=0&&_<d&&T>=0&&T<s&&(o.readPixels(_,T,1,1,o.RGBA,o.UNSIGNED_BYTE,f),k=f[3]>240),w.style.visibility=k?"hidden":""}}return ee(t,L,gn,M),new ResizeObserver(M).observe(t),te(M),{update(g){E={...E,...g},M()}}}function vn(t){let n=u=>document.getElementById(u),e=u=>t.update(h=>({...h,view:{...h.view,...u}})),o=[...document.querySelectorAll('input[name="solid-view"]')],r=[...document.querySelectorAll(".view-panel")];function a(u,h){let S=null;try{S=u()}catch(b){console.error(b)}return S||(n(h).hidden=!1),S}let i=null,l=null;zt.then(u=>{i=a(()=>bn(n("cylinder"),n("cylinder-labels"),u),"cylinder-fallback"),l&&i?.update(l)}).catch(u=>{console.error(u),n("cylinder-fallback").hidden=!1});let p=a(()=>fn(n("solid"),n("solid-labels")),"solid-fallback");for(let u of o)u.addEventListener("change",()=>e({solid:u.value}));n("optimal").addEventListener("change",u=>e({optimal:u.target.checked}));for(let u of["cut","cylinder-cut"])n(u).addEventListener("change",h=>e({cut:h.target.checked}));n("cylinder-saturation").addEventListener("change",u=>e({atSaturation:u.target.checked})),t.watch(u=>u.view.solid,u=>{for(let h of o)h.checked=h.value===u;for(let h of r)h.hidden=h.dataset.view!==u}),t.watch(u=>({colour:u.colour,mode:u.mode,preview:u.view.preview,atSaturation:u.view.atSaturation,cut:u.view.cut}),({colour:u,mode:h,preview:S,atSaturation:b,cut:L})=>{n("cylinder-saturation").checked=b,n("cylinder-cut").checked=L,l={hsv:u.hsv,l:u.l,s:u.s,mode:h,preview:S,atSaturation:b,cut:L},i?.update(l)},tt),t.watch(u=>({colour:u.colour,view:u.view}),({colour:u,view:h})=>{n("optimal").checked=h.optimal,n("cut").checked=h.cut,p?.update({h:u.hsv,l:u.l,s:u.s,...h})},tt)}var yn=null;try{let t=localStorage.getItem("hue-mode");(t==="hsv"||t==="oklab")&&(yn=t)}catch{}var Q=Oe({colour:{hsv:18,l:62,s:.9,exact:null},mode:yn??"oklab",view:{preview:!1,pureLine:!1,optimal:!0,cut:!1,solid:"cylinder",atSaturation:!1},palette:{stops:["#1d3557","#f7694f","#f4e9b0"].map(t=>z(t)),steps:21,tones:9,longHue:!1},contrast:{background:z("#f4e9b0"),text:z("#1d3557")}}),Ut=t=>document.getElementById(t),ko=()=>Mt(Q.get()),An=t=>Pt(Q,t);De(Q);vn(Q);var En=null;function xn({text:t,exact:n}){if(n){let{h:o,l:r,s:a}=Z(n,{hue:Q.get().mode});return{h:o,l:r,s:a}}let e=rt(t);return e?{hex:B(e)}:null}function Ln(t=En){let{colour:n,contrast:e,palette:o,mode:r}=Q.get(),a=[e.background,e.text].map(xn);return`#${Fe({colour:n.exact?{hex:B(n.exact)}:{h:ko(),l:n.l,s:n.s},stops:o.stops.map(xn).filter(Boolean),contrast:a.every(Boolean)?a:[],steps:o.steps,tones:o.tones,longHue:o.longHue,oklab:r==="oklab",scrollTo:t})}`}function Tn(t){let n=t.split(",").map(a=>a.trim());if(n.length!==3||n.some(a=>a===""))return null;let[e,o,r]=n.map(Number);return![e,o,r].every(Number.isFinite)||e<0||e>360||o<0||o>100||r<0||r>100?null:{hsv:e%360,l:o,s:r/100}}function Ho(t){let n=Tn(t);if(!n){let o=decodeURIComponent(t);return z(/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(o)?`#${o}`:o)}let e=G({h:n.hsv,l:n.l,s:n.s},{hue:"hsv"});return z(B(e),e)}function Co(t){let[n,...e]=t.split("&"),o=Tn(decodeURIComponent(n)),r=Object.fromEntries(e.map(i=>[i.split("=")[0],i.slice(i.indexOf("=")+1)])),a=null;if(r.palette){let i=r.palette.split(";").filter(Boolean).map(Ho);if(i.length>=2){a={stops:i,longHue:r.long==="1"};let l=Number(r.steps),p=Number(r.tones);Number.isInteger(l)&&(a.steps=l),Number.isInteger(p)&&(a.tones=p)}}return{colour:o,palette:a,contrast:null,scrollTo:r.l==="palette"?"palette":null}}function Ro(t){let n=t.replace(/^#/,""),e=Pe(n);if(!e)return Co(n);let o=e.oklab?"oklab":"hsv",r=({h:p,l:u,s:h})=>({hsv:J(p,{hue:o}),l:u,s:h}),a=p=>{if(p.hex)return z(p.hex);let u=G(p,{hue:o});return z(B(u),u)},i=e.stops.map(a),l=e.contrast.map(a);return{colour:e.colour.hex?{rgb:rt(e.colour.hex)}:r(e.colour),palette:i.length>=2?{stops:i,steps:e.steps,tones:e.tones,longHue:e.longHue}:null,contrast:l.length===2?{background:l[0],text:l[1]}:null,scrollTo:e.scrollTo}}function kn(){let t=Ro(location.hash);return t.colour?.rgb?An(t.colour.rgb):t.colour&&at(Q,{...t.colour,exact:null}),En=t.scrollTo,t.palette&&Q.update(n=>({...n,palette:{...n.palette,...t.palette}})),t.contrast&&Q.update(n=>({...n,contrast:t.contrast})),{colour:!!t.colour,palette:!!t.palette,contrast:!!t.contrast,scrollTo:t.scrollTo}}var re=!1,se=0;function Hn(){clearTimeout(se),se=0;let t=Ln();location.hash!==t&&history.replaceState(null,"",t)}function _o(){re||(clearTimeout(se),se=setTimeout(Hn,250))}function ye(t){t.addEventListener("pointerdown",()=>re=!0)}for(let t of["pointerup","pointercancel"])window.addEventListener(t,()=>{re&&(re=!1,Hn())});window.addEventListener("hashchange",()=>{let t=kn();t.scrollTo&&document.querySelector(`.${t.scrollTo}`).scrollIntoView()});var Cn=t=>location.href.split("#")[0]+Ln(t);ye(Ut("field").parentElement);ye(Ut("tone").parentElement);ye(Ut("sat"));Q.watch(t=>({colour:t.colour,mode:t.mode,palette:t.palette,contrast:t.contrast}),()=>_o(),tt);var Ht=null,oe=Ie({getHueMode:()=>Q.get().mode,onChange:t=>{if(!Ht)return;let n=B(t);Ht.input.value=n,Ht.input.removeAttribute("aria-invalid"),Ht.swatch.style.background=n,Ht.set(z(n,t))},onLoad:t=>An(t)}),Rn={open(t,n,e,o){Ht={swatch:t,input:n,set:o},oe.open(t,e)},close:t=>oe.close(t),isOpenFor:t=>oe.isOpenFor(t)};Q.watch(t=>t.mode,()=>oe.refresh());We(Q,Rn);for(let t of document.querySelectorAll("[data-share-title]")){let n=t.nextElementSibling;t.addEventListener("click",async()=>{let e=await wt(Cn(t.dataset.shareTitle));n.textContent=e?"Copied":"Copying isn\u2019t available in this browser.",clearTimeout(t.timer),t.timer=setTimeout(()=>n.textContent="",1500)})}for(let t of document.querySelectorAll("[data-share]"))t.addEventListener("click",async()=>{var o;let n=t.dataset.share,e=await wt(Cn(n));(o=t.dataset).label??(o.label=t.textContent),t.textContent=e?"Copied":"Failed",e||(Ut(`${n}-status`).textContent="Copying isn\u2019t available in this browser."),clearTimeout(t.timer),t.timer=setTimeout(()=>t.textContent=t.dataset.label,1500)});Qe(Q,Rn);var Mo=matchMedia("(prefers-color-scheme: dark)");Ut("theme-toggle").addEventListener("click",()=>{let n=(document.documentElement.dataset.theme??(Mo.matches?"dark":"light"))==="dark"?"light":"dark";document.documentElement.dataset.theme=n;try{localStorage.setItem("theme",n)}catch{}});var Dt=[...document.querySelectorAll(".sections [data-section]")],_n=t=>document.querySelector(`.${t.dataset.section}`);for(let t of Dt)t.addEventListener("click",()=>{let n=matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth";t===Dt[0]?scrollTo({top:0,behavior:n}):_n(t).scrollIntoView({behavior:n})});function Ae(){let t=innerHeight/3,n=Dt.filter(e=>_n(e).getBoundingClientRect().top<=t).at(-1)??Dt[0];for(let e of Dt)e.setAttribute("aria-current",String(e===n))}addEventListener("scroll",Ae,{passive:!0});addEventListener("resize",Ae);var wn=kn();Ae();wn.scrollTo&&(history.scrollRestoration="manual",document.querySelector(`.${wn.scrollTo}`).scrollIntoView());
