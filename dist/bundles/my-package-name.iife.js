var myPackageName=function(e,t){"use strict";function r(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var a=r(t);var n=function(){if("undefined"!=typeof globalThis)return globalThis;if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;throw new Error("unable to locate global object")}(),i=n.crypto;class o extends Error{constructor(e){super(e),this.code=o.code,this.name=this.constructor.name,Error.captureStackTrace&&Error.captureStackTrace(this,this.constructor)}}o.code="ERR_JOSE_GENERIC";class s extends o{constructor(){super(...arguments),this.code=s.code}}s.code="ERR_JOSE_ALG_NOT_ALLOWED";class c extends o{constructor(){super(...arguments),this.code=c.code}}c.code="ERR_JOSE_NOT_SUPPORTED";class d extends o{constructor(){super(...arguments),this.code=d.code,this.message="decryption operation failed"}}d.code="ERR_JWE_DECRYPTION_FAILED";class p extends o{constructor(){super(...arguments),this.code=p.code}}p.code="ERR_JWE_INVALID";class h extends o{constructor(){super(...arguments),this.code=h.code}}h.code="ERR_JWS_INVALID";class u extends o{constructor(){super(...arguments),this.code=u.code}}u.code="ERR_JWK_INVALID";class y extends o{constructor(){super(...arguments),this.code=y.code,this.message="signature verification failed"}}y.code="ERR_JWS_SIGNATURE_VERIFICATION_FAILED";const l=i.getRandomValues.bind(i);async function w(e){return async function(e){let t,r,a;switch(e){case"HS256":case"HS384":case"HS512":t=parseInt(e.substr(-3),10),r={name:"HMAC",hash:{name:`SHA-${e.substr(-3)}`},length:t},a=["sign","verify"];break;case"A128CBC-HS256":case"A192CBC-HS384":case"A256CBC-HS512":return t=parseInt(e.substr(-3),10),l(new Uint8Array(t>>3));case"A128KW":case"A192KW":case"A256KW":t=parseInt(e.substring(1,4),10),r={name:"AES-KW",length:t},a=["wrapKey","unwrapKey"];break;case"A128GCMKW":case"A192GCMKW":case"A256GCMKW":case"A128GCM":case"A192GCM":case"A256GCM":t=parseInt(e.substring(1,4),10),r={name:"AES-GCM",length:t},a=["encrypt","decrypt"];break;default:throw new c('unsupported or invalid JWK "alg" (Algorithm) Parameter value')}return i.subtle.generateKey(r,!1,a)}(e)}const f=new TextEncoder,m=new TextDecoder,g=2**32;function A(...e){const t=e.reduce(((e,{length:t})=>e+t),0),r=new Uint8Array(t);let a=0;return e.forEach((e=>{r.set(e,a),a+=e.length})),r}function S(e,t){return A(f.encode(e),new Uint8Array([0]),t)}function E(e,t,r){if(t<0||t>=g)throw new RangeError(`value must be >= 0 and <= 4294967295. Received ${t}`);e.set([t>>>24,t>>>16,t>>>8,255&t],r)}function b(e){const t=Math.floor(e/g),r=e%g,a=new Uint8Array(8);return E(a,t,0),E(a,r,4),a}function H(e){const t=new Uint8Array(4);return E(t,e),t}function v(e){return A(H(e.length),e)}const C=e=>{let t=e;"string"==typeof t&&(t=f.encode(t));const r=[];for(let e=0;e<t.length;e+=32768)r.push(String.fromCharCode.apply(null,t.subarray(e,e+32768)));return n.btoa(r.join("")).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")},K=e=>{let t=e;t instanceof Uint8Array&&(t=m.decode(t)),t=t.replace(/-/g,"+").replace(/_/g,"/").replace(/\s/g,"");try{return new Uint8Array(n.atob(t).split("").map((e=>e.charCodeAt(0))))}catch(e){throw new TypeError("The input to be decoded is not correctly encoded.")}};async function P(e){return e instanceof Uint8Array?{kty:"oct",k:C(e)}:(async e=>{if(!e.extractable)throw new TypeError("non-extractable key cannot be extracted as a JWK");const{ext:t,key_ops:r,alg:a,use:n,...o}=await i.subtle.exportKey("jwk",e);return o})(e)}const _=new Map([["A128CBC-HS256",128],["A128GCM",96],["A128GCMKW",96],["A192CBC-HS384",128],["A192GCM",96],["A192GCMKW",96],["A256CBC-HS512",128],["A256GCM",96],["A256GCMKW",96]]),k=e=>t=>{const r=_.get(t);if(!r)throw new c(`Unsupported JWE Algorithm: ${t}`);return e(new Uint8Array(r>>3))},W=(e,t)=>{if(t.length<<3!==_.get(e))throw new p("Invalid Initialization Vector length")},U=(e,t)=>{let r;switch(e){case"A128CBC-HS256":case"A192CBC-HS384":case"A256CBC-HS512":if(r=parseInt(e.substr(-3),10),!(t instanceof Uint8Array))throw new TypeError(`${e} content encryption requires Uint8Array as key input`);break;case"A128GCM":case"A192GCM":case"A256GCM":r=parseInt(e.substr(1,3),10);break;default:throw new c(`Content Encryption Algorithm ${e} is unsupported either by JOSE or your javascript runtime`)}if(t instanceof Uint8Array){if(t.length<<3!==r)throw new p("Invalid Content Encryption Key length")}else{if(void 0===t.algorithm)throw new TypeError("Invalid Content Encryption Key type");{const{length:e}=t.algorithm;if(e!==r)throw new p("Invalid Content Encryption Key length")}}};const J=async(e,t,r,a,n)=>(U(e,r),W(e,a),"CBC"===e.substr(4,3)?async function(e,t,r,a,n){const o=parseInt(e.substr(1,3),10),s=await i.subtle.importKey("raw",r.subarray(o>>3),"AES-CBC",!1,["encrypt"]),c=await i.subtle.importKey("raw",r.subarray(0,o>>3),{hash:{name:"SHA-"+(o<<1)},name:"HMAC"},!1,["sign"]),d=new Uint8Array(await i.subtle.encrypt({iv:a,name:"AES-CBC"},s,t)),p=A(n,a,d,b(n.length<<3));return{ciphertext:d,tag:new Uint8Array((await i.subtle.sign("HMAC",c,p)).slice(0,o>>3))}}(e,t,r,a,n):async function(e,t,r,a){const n=t instanceof Uint8Array?await i.subtle.importKey("raw",t,"AES-GCM",!1,["encrypt"]):t,o=new Uint8Array(await i.subtle.encrypt({additionalData:a,iv:r,name:"AES-GCM",tagLength:128},n,e)),s=o.slice(-16);return{ciphertext:o.slice(0,-16),tag:s}}(t,r,a,n)),M=async()=>{throw new c('JWE "zip" (Compression Algorithm) Header Parameter is not supported by your javascript runtime. You need to use the `inflateRaw` decrypt option to provide Inflate Raw implementation, e.g. using the "pako" module.')},x=async()=>{throw new c('JWE "zip" (Compression Algorithm) Header Parameter is not supported by your javascript runtime.')},R=new Map([["A128CBC-HS256",256],["A128GCM",128],["A192CBC-HS384",384],["A192GCM",192],["A256CBC-HS512",512],["A256GCM",256]]),T=e=>t=>{const r=R.get(t);if(!r)throw new c(`Unsupported JWE Algorithm: ${t}`);return e(new Uint8Array(r>>3))},D=[{hash:{name:"SHA-256"},name:"HMAC"},!0,["sign"]];function O(e,t){if(e.algorithm.length!==parseInt(t.substr(1,3),10))throw new TypeError(`invalid key size for alg: ${t}`)}const B=async(e,t,r)=>{let a;a=t instanceof Uint8Array?await i.subtle.importKey("raw",t,"AES-KW",!0,["wrapKey"]):t,O(a,e);const n=await i.subtle.importKey("raw",r,...D);return new Uint8Array(await i.subtle.wrapKey("raw",n,a,"AES-KW"))},I=async(e,t,r)=>{let a;a=t instanceof Uint8Array?await i.subtle.importKey("raw",t,"AES-KW",!0,["unwrapKey"]):t,O(a,e);const n=await i.subtle.unwrapKey("raw",r,a,"AES-KW",...D);return new Uint8Array(await i.subtle.exportKey("raw",n))},G=async(e,t)=>{const r=`SHA-${e.substr(-3)}`;return new Uint8Array(await i.subtle.digest(r,t))},$=async function(e,t,r,a){const n=Math.ceil((r>>3)/32);let i;for(let r=1;r<=n;r++){const n=new Uint8Array(4+t.length+a.length);n.set(H(r)),n.set(t,4),n.set(a,4+t.length),i=i?A(i,await e(n)):await e(n)}return i=i.slice(0,r>>3),i}.bind(void 0,G.bind(void 0,"sha256")),j=async(e,t,r,a,n=new Uint8Array(0),o=new Uint8Array(0))=>{const s=A(v(f.encode(r)),v(n),v(o),H(a));if(!t.usages.includes("deriveBits"))throw new TypeError('ECDH-ES private key "usages" must include "deriveBits"');const c=new Uint8Array(await i.subtle.deriveBits({name:"ECDH",public:e},t,Math.ceil(parseInt(t.algorithm.namedCurve.substr(-3),10)/8)<<3));return $(c,a,s)},z=["P-256","P-384","P-521"],N=e=>z.includes(e.algorithm.namedCurve);function F(e){if(!(e instanceof Uint8Array)||e.length<8)throw new p("PBES2 Salt Input must be 8 or more octets")}const L=async(e,t,r,a=Math.floor(2049*Math.random())+2048,n=l(new Uint8Array(16)))=>{F(n);const o=S(e,n),s=parseInt(e.substr(13,3),10),c={hash:{name:`SHA-${e.substr(8,3)}`},iterations:a,name:"PBKDF2",salt:o},d={length:s,name:"AES-KW"};let p,h;if(p=t instanceof Uint8Array?await i.subtle.importKey("raw",t,"PBKDF2",!1,["deriveBits"]):t,p.usages.includes("deriveBits"))h=new Uint8Array(await i.subtle.deriveBits(c,p,s));else{if(!p.usages.includes("deriveKey"))throw new TypeError('PBKDF2 key "usages" must include "deriveBits" or "deriveKey"');h=await i.subtle.deriveKey(c,p,d,!1,["wrapKey"])}return{encryptedKey:await B(e.substr(-6),h,r),p2c:a,p2s:C(n)}},V=async(e,t,r,a,n)=>{F(n);const o=S(e,n),s=parseInt(e.substr(13,3),10),c={hash:{name:`SHA-${e.substr(8,3)}`},iterations:a,name:"PBKDF2",salt:o},d={length:s,name:"AES-KW"};let p,h;if(p=t instanceof Uint8Array?await i.subtle.importKey("raw",t,"PBKDF2",!1,["deriveBits"]):t,p.usages.includes("deriveBits"))h=new Uint8Array(await i.subtle.deriveBits(c,p,s));else{if(!p.usages.includes("deriveKey"))throw new TypeError('PBKDF2 key "usages" must include "deriveBits" or "deriveKey"');h=await i.subtle.deriveKey(c,p,d,!1,["unwrapKey"])}return I(e.substr(-6),h,r)};function q(e){switch(e){case"RSA-OAEP":case"RSA-OAEP-256":case"RSA-OAEP-384":case"RSA-OAEP-512":return"RSA-OAEP";default:throw new c(`alg ${e} is unsupported either by JOSE or your javascript runtime`)}}var Y=(e,t)=>{if(e.startsWith("HS")){const r=parseInt(e.substr(-3),10),{length:a}=t.algorithm;if("number"!=typeof a||a<r)throw new TypeError(`${e} requires symmetric keys to be ${r} bits or larger`)}if(e.startsWith("RS")||e.startsWith("PS")){const{modulusLength:r}=t.algorithm;if("number"!=typeof r||r<2048)throw new TypeError(`${e} requires key modulusLength to be 2048 bits or larger`)}};async function X(e,t,r,a,n,o){const s=parseInt(e.substr(1,3),10),c=await i.subtle.importKey("raw",t.subarray(s>>3),"AES-CBC",!1,["decrypt"]),p=await i.subtle.importKey("raw",t.subarray(0,s>>3),{hash:{name:"SHA-"+(s<<1)},name:"HMAC"},!1,["sign"]);let h;try{h=new Uint8Array(await i.subtle.decrypt({iv:a,name:"AES-CBC"},c,r))}catch(e){}const u=A(o,a,r,b(o.length<<3)),y=new Uint8Array((await i.subtle.sign("HMAC",p,u)).slice(0,s>>3));let l;try{l=((e,t)=>{if(!(e instanceof Uint8Array))throw new TypeError("First argument must be a buffer");if(!(t instanceof Uint8Array))throw new TypeError("Second argument must be a buffer");if(e.length!==t.length)throw new TypeError("Input buffers must have the same length");const r=e.length;let a=0,n=-1;for(;++n<r;)a|=e[n]^t[n];return 0===a})(n,y)}catch(e){}if(!h||!l)throw new d;return h}const Q=async(e,t,r,a,n,o)=>(U(e,t),W(e,a),"CBC"===e.substr(4,3)?X(e,t,r,a,n,o):async function(e,t,r,a,n){const o=e instanceof Uint8Array?await i.subtle.importKey("raw",e,"AES-GCM",!1,["decrypt"]):e;try{return new Uint8Array(await i.subtle.decrypt({additionalData:n,iv:r,name:"AES-GCM",tagLength:128},o,A(t,a)))}catch(e){throw new d}}(t,r,a,n,o)),Z=k(l),ee=T(l);async function te(e,t,r,a,n={}){let o,s,d;switch(e){case"dir":d=r;break;case"ECDH-ES":case"ECDH-ES+A128KW":case"ECDH-ES+A192KW":case"ECDH-ES+A256KW":{if(!N(r))throw new c("ECDH-ES with the provided key is not allowed or not supported by your javascript runtime");const{apu:p,apv:h}=n;let{epk:u}=n;u||(u=await(async e=>(await i.subtle.generateKey({name:"ECDH",namedCurve:e.algorithm.namedCurve},!0,["deriveBits"])).privateKey)(r));const y=await async function(e){const{crv:t,kty:r,x:a,y:n}=await i.subtle.exportKey("jwk",e);return{crv:t,kty:r,x:a,y:n}}(u),l=await j(r,u,"ECDH-ES"===e?t:e,parseInt(e.substr(-5,3),10)||R.get(t),p,h);if(s={epk:y},p&&(s.apu=C(p)),h&&(s.apv=C(h)),"ECDH-ES"===e){d=l;break}d=a||ee(t);const w=e.substr(-6);o=await B(w,l,d);break}case"RSA1_5":case"RSA-OAEP":case"RSA-OAEP-256":case"RSA-OAEP-384":case"RSA-OAEP-512":d=a||ee(t),o=await(async(e,t,r)=>{if(Y(e,t),t.usages.includes("encrypt"))return new Uint8Array(await i.subtle.encrypt(q(e),t,r));if(t.usages.includes("wrapKey")){const a=await i.subtle.importKey("raw",r,...D);return new Uint8Array(await i.subtle.wrapKey("raw",a,t,q(e)))}throw new TypeError('RSA-OAEP key "usages" must include "encrypt" or "wrapKey" for this operation')})(e,r,d);break;case"PBES2-HS256+A128KW":case"PBES2-HS384+A192KW":case"PBES2-HS512+A256KW":{d=a||ee(t);const{p2c:i,p2s:c}=n;({encryptedKey:o,...s}=await L(e,r,d,i,c));break}case"A128KW":case"A192KW":case"A256KW":d=a||ee(t),o=await B(e,r,d);break;case"A128GCMKW":case"A192GCMKW":case"A256GCMKW":{d=a||ee(t);const{iv:i}=n;({encryptedKey:o,...s}=await(async(e,t,r,a)=>{const n=e.substr(0,7);a||(a=Z(n));const{ciphertext:i,tag:o}=await J(n,r,t,a,new Uint8Array(0));return{encryptedKey:i,iv:C(a),tag:C(o)}})(e,r,d,i));break}default:throw new c('unsupported or invalid "alg" (JWE Algorithm) header value')}return{cek:d,encryptedKey:o,parameters:s}}const re=(...e)=>{const t=e.filter(Boolean);if(0===t.length||1===t.length)return!0;let r;for(const e of t){const t=Object.keys(e);if(r&&0!==r.size)for(const e of t){if(r.has(e))return!1;r.add(e)}else r=new Set(t)}return!0};function ae(e,t,r,a,n){if(void 0!==n.crit&&void 0===a.crit)throw new e('"crit" (Critical) Header Parameter MUST be integrity protected');if(!a||void 0===a.crit)return new Set;if(!Array.isArray(a.crit)||0===a.crit.length||a.crit.some((e=>"string"!=typeof e||0===e.length)))throw new e('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');let i;i=void 0!==r?new Map([...Object.entries(r),...t.entries()]):t;for(const t of a.crit){if(!i.has(t))throw new c(`Extension Header Parameter "${t}" is not recognized`);if(void 0===n[t])throw new e(`Extension Header Parameter "${t}" is missing`);if(i.get(t)&&void 0===a[t])throw new e(`Extension Header Parameter "${t}" MUST be integrity protected`)}return new Set(a.crit)}const ne=k(l),ie=ae.bind(void 0,p,new Map);class oe{constructor(e){this._plaintext=e}setKeyManagementParameters(e){if(this._keyManagementParameters)throw new TypeError("setKeyManagementParameters can only be called once");return this._keyManagementParameters=e,this}setProtectedHeader(e){if(this._protectedHeader)throw new TypeError("setProtectedHeader can only be called once");return this._protectedHeader=e,this}setSharedUnprotectedHeader(e){if(this._sharedUnprotectedHeader)throw new TypeError("setSharedUnprotectedHeader can only be called once");return this._sharedUnprotectedHeader=e,this}setUnprotectedHeader(e){if(this._unprotectedHeader)throw new TypeError("setUnprotectedHeader can only be called once");return this._unprotectedHeader=e,this}setAdditionalAuthenticatedData(e){return this._aad=e,this}setContentEncryptionKey(e){if(this._cek)throw new TypeError("setContentEncryptionKey can only be called once");return this._cek=e,this}setInitializationVector(e){if(this._iv)throw new TypeError("setInitializationVector can only be called once");return this._iv=e,this}async encrypt(e,t){if(!this._protectedHeader&&!this._unprotectedHeader&&!this._sharedUnprotectedHeader)throw new p("either setProtectedHeader, setUnprotectedHeader, or sharedUnprotectedHeader must be called before #encrypt()");if(!re(this._protectedHeader,this._unprotectedHeader,this._sharedUnprotectedHeader))throw new p("JWE Shared Protected, JWE Shared Unprotected and JWE Per-Recipient Header Parameter names must be disjoint");const r={...this._protectedHeader,...this._unprotectedHeader,...this._sharedUnprotectedHeader};if(ie(null==t?void 0:t.crit,this._protectedHeader,r),void 0!==r.zip){if(!this._protectedHeader||!this._protectedHeader.zip)throw new p('JWE "zip" (Compression Algorithm) Header MUST be integrity protected');if("DEF"!==r.zip)throw new c('unsupported JWE "zip" (Compression Algorithm) Header Parameter value')}const{alg:a,enc:n}=r;if("string"!=typeof a||!a)throw new p('JWE "alg" (Algorithm) Header Parameter missing or invalid');if("string"!=typeof n||!n)throw new p('JWE "enc" (Encryption Algorithm) Header Parameter missing or invalid');let i,o,s,d,h,u,y;if("dir"===a){if(this._cek)throw new TypeError("setContentEncryptionKey cannot be called when using Direct Encryption")}else if("ECDH-ES"===a&&this._cek)throw new TypeError("setContentEncryptionKey cannot be called when using Direct Key Agreement");{let t;({cek:o,encryptedKey:i,parameters:t}=await te(a,n,e,this._cek,this._keyManagementParameters)),t&&(this._protectedHeader?this._protectedHeader={...this._protectedHeader,...t}:this.setProtectedHeader(t))}if(this._iv||(this._iv=ne(n)),d=this._protectedHeader?f.encode(C(JSON.stringify(this._protectedHeader))):f.encode(""),this._aad?(h=C(this._aad),s=A(d,f.encode("."),f.encode(h))):s=d,"DEF"===r.zip){const e=await((null==t?void 0:t.deflateRaw)||x)(this._plaintext);({ciphertext:u,tag:y}=await J(n,e,o,this._iv,s))}else({ciphertext:u,tag:y}=await J(n,this._plaintext,o,this._iv,s));const l={ciphertext:C(u),iv:C(this._iv),tag:C(y)};return i&&(l.encrypted_key=C(i)),h&&(l.aad=h),this._protectedHeader&&(l.protected=m.decode(d)),this._sharedUnprotectedHeader&&(l.unprotected=this._sharedUnprotectedHeader),this._unprotectedHeader&&(l.header=this._unprotectedHeader),l}}class se{constructor(e){this._flattened=new oe(e)}setContentEncryptionKey(e){return this._flattened.setContentEncryptionKey(e),this}setInitializationVector(e){return this._flattened.setInitializationVector(e),this}setProtectedHeader(e){return this._flattened.setProtectedHeader(e),this}setKeyManagementParameters(e){return this._flattened.setKeyManagementParameters(e),this}async encrypt(e,t){const r=await this._flattened.encrypt(e,t);return[r.protected,r.encrypted_key,r.iv,r.ciphertext,r.tag].join(".")}}function ce(e){return!!e&&e.constructor===Object}const de=(e,t)=>{if("string"!=typeof e||!e)throw new u(`${t} missing or invalid`)};const pe=async e=>{var t,r;const{algorithm:a,keyUsages:n}=function(e){let t,r;switch(e.kty){case"oct":switch(e.alg){case"HS256":case"HS384":case"HS512":t={name:"HMAC",hash:{name:`SHA-${e.alg.substr(-3)}`}},r=["sign","verify"];break;case"A128CBC-HS256":case"A192CBC-HS384":case"A256CBC-HS512":throw new c(`${e.alg} keys cannot be imported as CryptoKey instances`);case"A128GCM":case"A192GCM":case"A256GCM":case"A128GCMKW":case"A192GCMKW":case"A256GCMKW":t={name:"AES-GCM"},r=["encrypt","decrypt"];break;case"A128KW":case"A192KW":case"A256KW":t={name:"AES-KW"},r=["wrapKey","unwrapKey"];break;case"PBES2-HS256+A128KW":case"PBES2-HS384+A192KW":case"PBES2-HS512+A256KW":t={name:"PBKDF2"},r=["deriveBits"];break;default:throw new c('unsupported or invalid JWK "alg" (Algorithm) Parameter value')}break;case"RSA":switch(e.alg){case"PS256":case"PS384":case"PS512":t={name:"RSA-PSS",hash:{name:`SHA-${e.alg.substr(-3)}`}},r=e.d?["sign"]:["verify"];break;case"RS256":case"RS384":case"RS512":t={name:"RSASSA-PKCS1-v1_5",hash:{name:`SHA-${e.alg.substr(-3)}`}},r=e.d?["sign"]:["verify"];break;case"RSA-OAEP":case"RSA-OAEP-256":case"RSA-OAEP-384":case"RSA-OAEP-512":t={name:"RSA-OAEP",hash:{name:`SHA-${parseInt(e.alg.substr(-3),10)||1}`}},r=e.d?["decrypt","unwrapKey"]:["encrypt","wrapKey"];break;default:throw new c('unsupported or invalid JWK "alg" (Algorithm) Parameter value')}break;case"EC":switch(e.alg){case"ES256":case"ES384":case"ES512":t={name:"ECDSA",namedCurve:e.crv},r=e.d?["sign"]:["verify"];break;case"ECDH-ES":case"ECDH-ES+A128KW":case"ECDH-ES+A192KW":case"ECDH-ES+A256KW":t={name:"ECDH",namedCurve:e.crv},r=e.d?["deriveBits"]:[];break;default:throw new c('unsupported or invalid JWK "alg" (Algorithm) Parameter value')}break;default:throw new c('unsupported or invalid JWK "kty" (Key Type) Parameter value')}return{algorithm:t,keyUsages:r}}(e);let o="jwk",s={...e};return delete s.alg,"PBKDF2"===a.name&&(o="raw",s=K(e.k)),i.subtle.importKey(o,s,a,null!==(t=e.ext)&&void 0!==t&&t,null!==(r=e.key_ops)&&void 0!==r?r:n)};async function he(e,t,r){if(!ce(e))throw new TypeError("JWK must be an object");if(t||(t=e.alg),"string"!=typeof t||!t)throw new TypeError('"alg" argument is required when "jwk.alg" is not present');switch(e.kty){case"oct":if("string"!=typeof e.k||!e.k)throw new TypeError('missing "k" (Key Value) Parameter value');return null!=r||(r=!0!==e.ext),r?pe({...e,alg:t,ext:!1}):K(e.k);case"RSA":if(void 0!==e.oth)throw new c('RSA JWK "oth" (Other Primes Info) Parameter value is unsupported');case"EC":case"OKP":return pe({...e,alg:t});default:throw new c('unsupported "kty" (Key Type) Parameter value')}}function ue(e){switch(e){case"HS256":return{hash:{name:"SHA-256"},name:"HMAC"};case"HS384":return{hash:{name:"SHA-384"},name:"HMAC"};case"HS512":return{hash:{name:"SHA-512"},name:"HMAC"};case"PS256":return{hash:{name:"SHA-256"},name:"RSA-PSS",saltLength:32};case"PS384":return{hash:{name:"SHA-384"},name:"RSA-PSS",saltLength:48};case"PS512":return{hash:{name:"SHA-512"},name:"RSA-PSS",saltLength:64};case"RS256":return{hash:{name:"SHA-256"},name:"RSASSA-PKCS1-v1_5"};case"RS384":return{hash:{name:"SHA-384"},name:"RSASSA-PKCS1-v1_5"};case"RS512":return{hash:{name:"SHA-512"},name:"RSASSA-PKCS1-v1_5"};case"ES256":return{hash:{name:"SHA-256"},name:"ECDSA",namedCurve:"P-256"};case"ES384":return{hash:{name:"SHA-384"},name:"ECDSA",namedCurve:"P-384"};case"ES512":return{hash:{name:"SHA-512"},name:"ECDSA",namedCurve:"P-521"};default:throw new c(`alg ${e} is unsupported either by JOSE or your javascript runtime`)}}const ye=(e,t)=>{if(e.startsWith("HS")||"dir"===e||e.startsWith("PBES2")||e.match(/^A\d{3}(?:GCM)KW$/)){if(t instanceof Uint8Array||"secret"===t.type)return;throw new TypeError('CryptoKey or KeyObject instances for symmetric algorithms must be of type "secret"')}if(t instanceof Uint8Array)throw new TypeError("CryptoKey or KeyObject instances must be used for asymmetric algorithms");if("secret"===t.type)throw new TypeError('CryptoKey or KeyObject instances for asymmetric algorithms must not be of type "secret"')},le=ae.bind(void 0,h,new Map([["b64",!0]]));class we{constructor(e){this._payload=e}setProtectedHeader(e){if(this._protectedHeader)throw new TypeError("setProtectedHeader can only be called once");return this._protectedHeader=e,this}setUnprotectedHeader(e){if(this._unprotectedHeader)throw new TypeError("setUnprotectedHeader can only be called once");return this._unprotectedHeader=e,this}async sign(e,t){if(!this._protectedHeader&&!this._unprotectedHeader)throw new h("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");if(!re(this._protectedHeader,this._unprotectedHeader))throw new h("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");const r={...this._protectedHeader,...this._unprotectedHeader};let a=!0;if(le(null==t?void 0:t.crit,this._protectedHeader,r).has("b64")&&(a=this._protectedHeader.b64,"boolean"!=typeof a))throw new h('The "b64" (base64url-encode payload) Header Parameter must be a boolean');const{alg:n}=r;if("string"!=typeof n||!n)throw new h('JWS "alg" (Algorithm) Header Parameter missing or invalid');ye(n,e);let o,s=this._payload;a&&(s=f.encode(C(s))),o=this._protectedHeader?f.encode(C(JSON.stringify(this._protectedHeader))):f.encode("");const c=A(o,f.encode("."),s),d=await(async(e,t,r)=>{let a;if(t instanceof Uint8Array){if(!e.startsWith("HS"))throw new TypeError("symmetric keys are only applicable for HMAC-based algorithms");a=await i.subtle.importKey("raw",t,{hash:{name:`SHA-${e.substr(-3)}`},name:"HMAC"},!1,["sign"])}else a=t;Y(e,a);const n=await i.subtle.sign(ue(e),a,r);return new Uint8Array(n)})(n,e,c),p={signature:C(d)};return a&&(p.payload=m.decode(s)),this._unprotectedHeader&&(p.header=this._unprotectedHeader),this._protectedHeader&&(p.protected=m.decode(o)),p}}class fe{constructor(e){this._flattened=new we(e)}setProtectedHeader(e){return this._flattened.setProtectedHeader(e),this}async sign(e,t){const r=await this._flattened.sign(e,t);if(void 0===r.payload)throw new TypeError("use the flattened module for creating JWS with b64: false");return`${r.protected}.${r.payload}.${r.signature}`}}function me(e){if(!e)throw new p("JWE Encrypted Key missing")}function ge(e,t,r){if(void 0===e[t])throw new p(`JOSE Header ${r} (${t}) missing`)}async function Ae(e,t,r,a){switch(e){case"dir":if(void 0!==r)throw new p("Encountered unexpected JWE Encrypted Key");return t;case"ECDH-ES":if(void 0!==r)throw new p("Encountered unexpected JWE Encrypted Key");case"ECDH-ES+A128KW":case"ECDH-ES+A192KW":case"ECDH-ES+A256KW":{if(ge(a,"epk","Ephemeral Public Key"),!N(t))throw new c("ECDH-ES with the provided key is not allowed or not supported by your javascript runtime");const o=await(n=a.epk,i.subtle.importKey("jwk",n,{name:"ECDH",namedCurve:n.crv},!0,[]));let s,d;void 0!==a.apu&&(s=K(a.apu)),void 0!==a.apv&&(d=K(a.apv));const p=await j(o,t,"ECDH-ES"===e?a.enc:e,parseInt(e.substr(-5,3),10)||R.get(a.enc),s,d);if("ECDH-ES"===e)return p;me(r);const h=e.substr(-6);return I(h,p,r)}case"RSA1_5":case"RSA-OAEP":case"RSA-OAEP-256":case"RSA-OAEP-384":case"RSA-OAEP-512":return me(r),(async(e,t,r)=>{if(Y(e,t),t.usages.includes("decrypt"))return new Uint8Array(await i.subtle.decrypt(q(e),t,r));if(t.usages.includes("unwrapKey")){const a=await i.subtle.unwrapKey("raw",r,t,q(e),...D);return new Uint8Array(await i.subtle.exportKey("raw",a))}throw new TypeError('RSA-OAEP key "usages" must include "decrypt" or "unwrapKey" for this operation')})(e,t,r);case"PBES2-HS256+A128KW":case"PBES2-HS384+A192KW":case"PBES2-HS512+A256KW":{me(r),ge(a,"p2c","PBES2 Count"),ge(a,"p2s","PBES2 Salt");const{p2c:n}=a,i=K(a.p2s);return V(e,t,r,n,i)}case"A128KW":case"A192KW":case"A256KW":return me(r),I(e,t,r);case"A128GCMKW":case"A192GCMKW":case"A256GCMKW":me(r),ge(a,"iv","Initialization Vector"),ge(a,"tag","Authentication Tag");return(async(e,t,r,a,n)=>{const i=e.substr(0,7);return Q(i,t,r,a,n,new Uint8Array(0))})(e,t,r,K(a.iv),K(a.tag));default:throw new c('unsupported or invalid "alg" (JWE Algorithm) header value')}var n}const Se=(e,t)=>{if(void 0!==t&&(!Array.isArray(t)||t.some((e=>"string"!=typeof e))))throw new TypeError(`"${e}" option must be an array of strings`);if(t)return new Set(t)},Ee=T(l),be=ae.bind(void 0,p,new Map),He=Se.bind(void 0,"keyManagementAlgorithms"),ve=Se.bind(void 0,"contentEncryptionAlgorithms");async function Ce(e,t,r){var a;if(!ce(e))throw new p("Flattened JWE must be an object");if(void 0===e.protected&&void 0===e.header&&void 0===e.unprotected)throw new p("JOSE Header missing");if("string"!=typeof e.iv)throw new p("JWE Initialization Vector missing or incorrect type");if("string"!=typeof e.ciphertext)throw new p("JWE Ciphertext missing or incorrect type");if("string"!=typeof e.tag)throw new p("JWE Authentication Tag missing or incorrect type");if(void 0!==e.protected&&"string"!=typeof e.protected)throw new p("JWE Protected Header incorrect type");if(void 0!==e.encrypted_key&&"string"!=typeof e.encrypted_key)throw new p("JWE Encrypted Key incorrect type");if(void 0!==e.aad&&"string"!=typeof e.aad)throw new p("JWE AAD incorrect type");if(void 0!==e.header&&!ce(e.header))throw new p("JWE Shared Unprotected Header incorrect type");if(void 0!==e.unprotected&&!ce(e.unprotected))throw new p("JWE Per-Recipient Unprotected Header incorrect type");let n;if(e.protected){const t=K(e.protected);n=JSON.parse(m.decode(t))}if(!re(n,e.header,e.unprotected))throw new p("JWE Protected, JWE Unprotected Header, and JWE Per-Recipient Unprotected Header Parameter names must be disjoint");const i={...n,...e.header,...e.unprotected};if(be(null==r?void 0:r.crit,n,i),void 0!==i.zip){if(!n||!n.zip)throw new p('JWE "zip" (Compression Algorithm) Header MUST be integrity protected');if("DEF"!==i.zip)throw new c('unsupported JWE "zip" (Compression Algorithm) Header Parameter value')}const{alg:o,enc:d}=i;if("string"!=typeof o||!o)throw new p("missing JWE Algorithm (alg) in JWE Header");if("string"!=typeof d||!d)throw new p("missing JWE Encryption Algorithm (enc) in JWE Header");const h=r&&He(r.keyManagementAlgorithms),u=r&&ve(r.contentEncryptionAlgorithms);if(h&&!h.has(o))throw new s('"alg" (Algorithm) Header Parameter not allowed');if(u&&!u.has(d))throw new s('"enc" (Encryption Algorithm) Header Parameter not allowed');let y,l;void 0!==e.encrypted_key&&(y=K(e.encrypted_key)),"function"==typeof t&&(t=await t(n,e));try{l=await Ae(o,t,y,i)}catch(e){if(e instanceof TypeError)throw e;l=Ee(d)}const w=K(e.iv),g=K(e.tag),S=f.encode(null!==(a=e.protected)&&void 0!==a?a:"");let E;E=void 0!==e.aad?A(S,f.encode("."),f.encode(e.aad)):S;let b=await Q(d,l,K(e.ciphertext),w,g,E);"DEF"===i.zip&&(b=await((null==r?void 0:r.inflateRaw)||M)(b));const H={plaintext:b};return void 0!==e.protected&&(H.protectedHeader=n),void 0!==e.aad&&(H.additionalAuthenticatedData=K(e.aad)),void 0!==e.unprotected&&(H.sharedUnprotectedHeader=e.unprotected),void 0!==e.header&&(H.unprotectedHeader=e.header),H}async function Ke(e,t,r){if(e instanceof Uint8Array&&(e=m.decode(e)),"string"!=typeof e)throw new p("Compact JWE must be a string or Uint8Array");const{0:a,1:n,2:i,3:o,4:s,length:c}=e.split(".");if(5!==c)throw new p("Invalid Compact JWE");const d=await Ce({ciphertext:o||void 0,iv:i||void 0,protected:a||void 0,tag:s||void 0,encrypted_key:n||void 0},t,r);return{plaintext:d.plaintext,protectedHeader:d.protectedHeader}}const Pe=ae.bind(void 0,h,new Map([["b64",!0]])),_e=Se.bind(void 0,"algorithms");async function ke(e,t,r){var a;if(!ce(e))throw new h("Flattened JWS must be an object");if(void 0===e.protected&&void 0===e.header)throw new h('Flattened JWS must have either of the "protected" or "header" members');if(void 0!==e.protected&&"string"!=typeof e.protected)throw new h("JWS Protected Header incorrect type");if(void 0===e.payload)throw new h("JWS Payload missing");if("string"!=typeof e.signature)throw new h("JWS Signature missing or incorrect type");if(void 0!==e.header&&!ce(e.header))throw new h("JWS Unprotected Header incorrect type");let n={};if(e.protected){const t=K(e.protected);n=JSON.parse(m.decode(t))}if(!re(n,e.header))throw new h("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");const o={...n,...e.header};let c=!0;if(Pe(null==r?void 0:r.crit,n,o).has("b64")&&(c=n.b64,"boolean"!=typeof c))throw new h('The "b64" (base64url-encode payload) Header Parameter must be a boolean');const{alg:d}=o;if("string"!=typeof d||!d)throw new h('JWS "alg" (Algorithm) Header Parameter missing or invalid');const p=r&&_e(r.algorithms);if(p&&!p.has(d))throw new s('"alg" (Algorithm) Header Parameter not allowed');if(c){if("string"!=typeof e.payload)throw new h("JWS Payload must be a string")}else if("string"!=typeof e.payload&&!(e.payload instanceof Uint8Array))throw new h("JWS Payload must be a string or an Uint8Array instance");"function"==typeof t&&(t=await t(n,e)),ye(d,t);const u=A(f.encode(null!==(a=e.protected)&&void 0!==a?a:""),f.encode("."),"string"==typeof e.payload?f.encode(e.payload):e.payload),l=K(e.signature);if(!await(async(e,t,r,a)=>{let n;if(t instanceof Uint8Array){if(!e.startsWith("HS"))throw new TypeError("symmetric keys are only applicable for HMAC-based algorithms");n=await i.subtle.importKey("raw",t,{hash:{name:`SHA-${e.substr(-3)}`},name:"HMAC"},!1,["verify"])}else n=t;Y(e,n);const o=ue(e);try{return await i.subtle.verify(o,n,r,a)}catch(e){return!1}})(d,t,l,u))throw new y;let w;w=c?K(e.payload):"string"==typeof e.payload?f.encode(e.payload):e.payload;const g={payload:w};return void 0!==e.protected&&(g.protectedHeader=n),void 0!==e.header&&(g.unprotectedHeader=e.header),g}async function We(e,t,r){if(e instanceof Uint8Array&&(e=m.decode(e)),"string"!=typeof e)throw new h("Compact JWS must be a string or Uint8Array");const{0:a,1:n,2:i,length:o}=e.split(".");if(3!==o)throw new h("Invalid Compact JWS");const s=await ke({payload:n||void 0,protected:a||void 0,signature:i||void 0},t,r);return{payload:s.payload,protectedHeader:s.protectedHeader}}const Ue=async(e,t)=>{const{payload:r}=await We(t,e).catch((e=>{throw new Error(`PoR: ${String(e)}`)}));return JSON.parse((new TextDecoder).decode(r).toString())},Je=async(e,t)=>{const{payload:r}=await We(t,e).catch((e=>{throw new Error("PoO "+String(e))}));return JSON.parse((new TextDecoder).decode(r).toString())},Me=async(e,t)=>{const r=new TextDecoder,a=await he(t,"HS256"),{plaintext:n}=await Ke(e,a);return r.decode(n)},xe=async(e,t)=>{const r=(new TextEncoder).encode(JSON.stringify(t));return await new fe(r).setProtectedHeader({alg:"EdDSA"}).sign(e)};return e.createBlockchainProof=async(e,t,r,a)=>{const n=await Je(e,t);return{privateStorage:{availability:"privateStorage",permissions:{view:[n.exchange.orig,n.exchange.dest]},type:"dict",id:n.exchange.id,content:{[n.exchange.block_id]:{poO:t,poR:r}}},blockchain:{availability:"blockchain",type:"jwk",content:{[a.kid]:a}}}},e.createJwk=async()=>{const e=await w("HS256"),t=await P(e),r=await async function(e,t="sha256"){if(!ce(e))throw new TypeError("JWK must be an object");let r;switch(e.kty){case"EC":de(e.crv,'"crv" (Curve) Parameter'),de(e.x,'"x" (X Coordinate) Parameter'),de(e.y,'"y" (Y Coordinate) Parameter'),r={crv:e.crv,kty:e.kty,x:e.x,y:e.y};break;case"OKP":de(e.crv,'"crv" (Subtype of Key Pair) Parameter'),de(e.x,'"x" (Public Key) Parameter'),r={crv:e.crv,kty:e.kty,x:e.x};break;case"RSA":de(e.e,'"e" (Exponent) Parameter'),de(e.n,'"n" (Modulus) Parameter'),r={e:e.e,kty:e.kty,n:e.n};break;case"oct":de(e.k,'"k" (Key Value) Parameter'),r={k:e.k,kty:e.kty};break;default:throw new c('"kty" (Key Type) Parameter missing or unsupported')}const a=f.encode(JSON.stringify(r));return C(await G(t,a))}(t);return t.kid=r,t.alg="HS256",t},e.createPoO=async(e,t,r,n,i,o,s)=>{const c="string"==typeof t?(new TextEncoder).encode(t):new Uint8Array(t),d=await he(s),p=await new se(c).setProtectedHeader({alg:"dir",enc:"A256GCM"}).encrypt(d),h=a.default.createHash("sha256").update(p).digest("hex"),u=a.default.createHash("sha256").update(c).digest("hex"),y=a.default.createHash("sha256").update(JSON.stringify(s),"utf8").digest("hex"),l={iss:r,sub:n,iat:Date.now(),exchange:{id:i,orig:r,dest:n,block_id:o,block_desc:"description",hash_alg:"sha256",cipherblock_dgst:h,block_commitment:u,key_commitment:y}};return{cipherblock:p,poO:await xe(e,l)}},e.createPoR=async(e,t,r,n,i)=>{const o=a.default.createHash("sha256").update(t).digest("hex"),s={iss:r,sub:n,iat:Date.now(),exchange:{poo_dgst:o,hash_alg:"sha256",exchangeId:i}};return await xe(e,s)},e.decodePoo=Je,e.decodePor=Ue,e.decryptCipherblock=Me,e.signProof=xe,e.validateCipherblock=async(e,t,r,n)=>{const i=await Me(t,r);if(a.default.createHash("sha256").update(i).digest("hex")===n.exchange.block_commitment)return!0;throw new Error("hashed CipherBlock not correspond to block_commitment parameter included in the proof of origin")},e.validatePoO=async(e,t,r)=>{const n=await Je(e,t),i=a.default.createHash("sha256").update(r).digest("hex");if(n.exchange.cipherblock_dgst!==i)throw new Error("the cipherblock_dgst parameter in the proof of origin does not correspond to hash of the cipherblock received by the provider");if(Date.now()-n.iat>5e3)throw new Error("timestamp error");return!0},e.validatePoP=async(e,t,r,n,i)=>{await We(r,e).catch((e=>{throw new Error("PoP "+String(e))}));const o=await Je(t,i),s=a.default.createHash("sha256").update(JSON.stringify(n)).digest("hex");if(o.exchange.key_commitment===s)return!0;throw new Error("hashed key not correspond to poO key_commitment parameter")},e.validatePoR=async(e,t,r)=>{const n=await Ue(e,t);if(a.default.createHash("sha256").update(r).digest("hex")!==n.exchange.poo_dgst)throw new Error("the hashed proof of origin received does not correspond to the poo_dgst parameter in the proof of origin");if(Date.now()-n.iat>5e3)throw new Error("timestamp error");return!0},Object.defineProperty(e,"__esModule",{value:!0}),e}({},crypto$1);
