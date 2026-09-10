(function(){"use strict";
var U="molot_users_v2",SE="molot_session_v2",BK="molot_bookings_v2";
var L=[],ST={ready:false,mode:"local",user:null},DB=null,AU=null;
function em(){for(var i=0;i<L.length;i++){try{L[i](ST.user)}catch(e){}}}
function ne(e){return String(e||"").trim().toLowerCase()}
function ve(e){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)}
function rd(k,f){try{var v=JSON.parse(localStorage.getItem(k));return v==null?f:v}catch(e){return f}}
function wr(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function lu(e){var u=rd(U,{})[ne(e)];if(!u)return null;return{email:ne(e),name:u.name,phone:u.phone||"",provider:"local"}}
function tu(f,x){if(!f)return null;var m=(f.email||"").toLowerCase();return{email:m,name:(x&&x.name)||f.displayName||m.split("@")[0],phone:(x&&x.phone)||"",provider:"firebase"}}
function hs(s,cb){if(window.crypto&&crypto.subtle&&window.TextEncoder){crypto.subtle.digest("SHA-256",new TextEncoder().encode("molot::"+s)).then(function(b){var r="",a=new Uint8Array(b);for(var i=0;i<a.length;i++){var x=a[i].toString(16);if(x.length<2)x="0"+x;r+=x}cb(r)})}else{var h=7;for(var j=0;j<s.length;j++){h=((h<<5)-h+s.charCodeAt(j))|0}cb("fh"+s.length+"x"+h)}}
var api={state:ST};
api.onAuth=function(fn){L.push(fn);if(ST.ready)fn(ST.user)};
api.RU={T0:"Что-то пошло не так. Попробуйте ещё раз.",T1:"Представьтесь: имя — минимум 2 символа.",T2:"Проверьте e-mail: похоже, в нём опечатка.",T3:"Пароль слишком короткий — минимум 6 символов.",T4:"Подтвердите согласие с условиями.",T5:"Этот e-mail уже зарегистрирован. Войдите или восстановите пароль.",T6:"Сначала войдите в аккаунт.",T7:"Введите пароль.",T8:"Аккаунт с таким e-mail не найден. Зарегистрируйтесь.",T9:"Неверный пароль. Проверьте раскладку или восстановите пароль.",T10:"Слишком много попыток. Подождите минуту и попробуйте снова.",wait:"Подождите…",okReg:"Готово! Аккаунт создан",okLogin:"С возвращением",okReset:"Письмо для восстановления отправлено на",okPass:"Новый пароль сохранён. Войдите с ним.",okProf:"Профиль обновлён ☕",bye:"Вы вышли. Заходите ещё ☕",nobook:"Пока нет броней — забронируйте столик ниже.",needCloud:"Облачный вход заработает после подключения Firebase (см. js/firebase-config.js)."};
api.signUp=function(d){var nm=String(d.name||"").trim(),ml=ne(d.email),pw=String(d.pass||""),ph=String(d.phone||"").trim();
if(nm.length<2)return Promise.reject(new Error("T1"));
if(!ve(ml))return Promise.reject(new Error("T2"));
if(pw.length<6)return Promise.reject(new Error("T3"));
if(!d.agree)return Promise.reject(new Error("T4"));
if(ST.mode==="firebase"){return AU.createUserWithEmailAndPassword(ml,pw).then(function(c){return c.user.updateProfile({displayName:nm}).then(function(){if(DB)return DB.collection("users").doc(c.user.uid).set({name:nm,email:ml,phone:ph})}).then(function(){ST.user=tu(c.user,{name:nm,phone:ph});em();return ST.user})}).catch(function(e){throw new Error(fb1(e))})}
var us=rd(U,{});if(us[ml])return Promise.reject(new Error("T5"));
return new Promise(function(res){hs(pw,function(h){us[ml]={name:nm,pass:h,phone:ph};wr(U,us);try{localStorage.setItem(SE,ml)}catch(e){}ST.user=lu(ml);em();res(ST.user)})})};
function fb1(e){var m={"auth/email-already-in-use":"T5","auth/invalid-email":"T2","auth/weak-password":"T3","auth/too-many-requests":"T10"};var k=m[e.code]||"T0";throw new Error(k)}
api.signIn=function(ml,pw){ml=ne(ml);pw=String(pw||"");
if(!ve(ml))return Promise.reject(new Error("T2"));
if(!pw)return Promise.reject(new Error("T7"));
if(ST.mode==="firebase"){return AU.signInWithEmailAndPassword(ml,pw).then(function(c){if(!DB){ST.user=tu(c.user);em();return ST.user}return DB.collection("users").doc(c.user.uid).get().then(function(d){var dd=d.exists?d.data():{};ST.user=tu(c.user,{name:dd.name||c.user.displayName,phone:dd.phone||""});em();return ST.user})}).catch(function(e){throw new Error(fb2(e))})}
var u=rd(U,{})[ml];if(!u)return Promise.reject(new Error("T8"));
return new Promise(function(res,rej){hs(pw,function(h){if(u.pass!==h&&u.pass!==pw){rej(new Error("T9"));return}if(u.pass===pw){var a=rd(U,{});a[ml].pass=h;wr(U,a)}try{localStorage.setItem(SE,ml)}catch(e){}ST.user=lu(ml);em();res(ST.user)})})};
function fb2(e){var m={"auth/user-not-found":"T8","auth/wrong-password":"T9","auth/invalid-credential":"T9","auth/invalid-email":"T2"};return m[e.code]||"T0"}
api.signOut=function(){if(ST.mode==="firebase"&&AU)return AU.signOut().then(function(){ST.user=null;em()});try{localStorage.removeItem(SE);localStorage.removeItem("molot_user")}catch(e){}ST.user=null;em();return Promise.resolve()};
api.resetPassword=function(ml){ml=ne(ml);if(!ve(ml))return Promise.reject(new Error("T2"));if(ST.mode==="firebase"&&AU)return AU.sendPasswordResetEmail(ml).then(function(){return"email"});if(!rd(U,{})[ml])return Promise.reject(new Error("T8"));return Promise.resolve("local")};
api.setNewPasswordLocal=function(ml,pw){var a=rd(U,{});if(!a[ne(ml)])return Promise.reject(new Error("T8"));if(String(pw||"").length<6)return Promise.reject(new Error("T3"));return new Promise(function(res){hs(pw,function(h){a[ne(ml)].pass=h;wr(U,a);res(true)})})};
api.updateProfile=function(p){if(!ST.user)return Promise.reject(new Error("T6"));if(ST.mode==="firebase"&&AU.currentUser){var me=AU.currentUser,nm=p.name||ST.user.name,ph=(p.phone!==undefined)?p.phone:ST.user.phone;return me.updateProfile({displayName:nm}).then(function(){if(DB)return DB.collection("users").doc(me.uid).set({name:nm,phone:ph},{merge:true})}).then(function(){ST.user={email:ST.user.email,name:nm,phone:ph,provider:"firebase"};em();return ST.user})}var a=rd(U,{}),u=a[ST.user.email];if(!u)return Promise.reject(new Error("T6"));if(p.name)u.name=String(p.name).trim();if(p.phone!==undefined)u.phone=String(p.phone).trim();wr(U,a);ST.user=lu(ST.user.email);em();return Promise.resolve(ST.user)};
api.saveBooking=function(b){b={name:b.name||"",phone:b.phone||"",date:b.date||"",time:b.time||"",guests:b.guests||"",zone:b.zone||"",id:"b"+Date.now().toString(36),createdAt:new Date().toISOString(),email:ST.user?ST.user.email:(b.email||"")};if(ST.mode==="firebase"&&DB&&AU.currentUser){var x={name:b.name,phone:b.phone,date:b.date,time:b.time,guests:b.guests,zone:b.zone,id:b.id,createdAt:b.createdAt,email:b.email,uid:AU.currentUser.uid};return DB.collection("bookings").add(x).then(function(){return b})}var a=rd(BK,[]);a.unshift(b);wr(BK,a.slice(0,200));return Promise.resolve(b)};
api.myBookings=function(){if(ST.mode==="firebase"&&DB&&AU.currentUser){var uid=AU.currentUser.uid;return DB.collection("bookings").where("uid","==",uid).orderBy("createdAt","desc").limit(20).get().then(function(s){var r=[];s.forEach(function(d){var o=d.data();o.id=d.id;r.push(o)});return r}).catch(function(){return[]})}var ml=ST.user?ST.user.email:"";var all=rd(BK,[]);var out=[];for(var i=0;i<all.length&&out.length<20;i++){if(!ml||all[i].email===ml)out.push(all[i])}return Promise.resolve(out)};
function bootL(){var s="";try{s=ne(localStorage.getItem(SE))}catch(e){}ST.mode="local";ST.user=s?lu(s):null;if(s&&!ST.user){try{localStorage.removeItem(SE)}catch(e){}}ST.ready=true;em()}
function bootF(){try{firebase.initializeApp(window.MOLOT_FIREBASE_CONFIG);AU=firebase.auth();DB=firebase.firestore();ST.mode="firebase";AU.onAuthStateChanged(function(f){if(!f){ST.user=null;ST.ready=true;em();return}DB.collection("users").doc(f.uid).get().then(function(d){var dd=d.exists?d.data():{};ST.user=tu(f,{name:dd.name||f.displayName,phone:dd.phone||""});ST.ready=true;em()},function(){ST.user=tu(f);ST.ready=true;em()})})}catch(e){bootL()}}
function bootLx(){var s="";try{s=ne(localStorage.getItem(SE))}catch(e){}ST.mode="local";ST.user=s?lu(s):null;if(s&&!ST.user){try{localStorage.removeItem(SE)}catch(e){}}ST.ready=true;em()}
api.signInGoogle=function(){if(ST.mode!=="firebase"||!AU)return Promise.reject(new Error("needCloud"));var pr=new firebase.auth.GoogleAuthProvider();return AU.signInWithPopup(pr).then(function(c){if(!DB){ST.user=tu(c.user);em();return ST.user}return DB.collection("users").doc(c.user.uid).get().then(function(d){var dd=d.exists?d.data():{};if(!d.exists)return DB.collection("users").doc(c.user.uid).set({name:c.user.displayName||"",email:c.user.email||""}).then(function(){return dd});return dd}).then(function(dd){ST.user=tu(c.user,{name:dd.name||c.user.displayName,phone:dd.phone||""});em();return ST.user})}).catch(function(e){if(e&&e.code==="auth/popup-closed-by-user")throw new Error("T0");throw new Error(fb2(e))});};
api.t=function(c){return (api.RU&&api.RU[c])||c};
var sU=api.signUp,sI=api.signIn,rP=api.resetPassword,nP=api.setNewPasswordLocal,uP=api.updateProfile,sG=api.signInGoogle;
function tx(p){return p.catch(function(e){throw new Error(api.t(String((e&&e.message)||"T0").replace("ERR:","")))})}
api.signUp=function(d){return tx(sU(d))};
api.signIn=function(a,b){return tx(sI(a,b))};
api.signInGoogle=function(){return tx(sG())};
api.resetPassword=function(a){return tx(rP(a))};
api.setNewPasswordLocal=function(a,b){return tx(nP(a,b))};
api.updateProfile=function(p){return tx(uP(p))};
var hasCfg=!!(window.MOLOT_FIREBASE_CONFIG&&window.MOLOT_FIREBASE_CONFIG.apiKey);
if(hasCfg&&window.firebase&&firebase.auth&&firebase.firestore){bootF()}
else if(hasCfg){var ld=function(s){return new Promise(function(res,rej){var t=document.createElement("script");t.src=s;t.onload=res;t.onerror=rej;document.head.appendChild(t)})};ld("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js").then(function(){return ld("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js")}).then(function(){return ld("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js")}).then(bootF,bootL)}
else{bootL()}
window.MolotAuth=api;})();
