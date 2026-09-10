
(function(){
  "use strict";
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

  var nav=$("#nav");
  var onScroll=function(){nav.classList.toggle("scrolled",window.scrollY>30)};
  addEventListener("scroll",onScroll,{passive:true});onScroll();

  var burger=$("#burger"),links=$("#navLinks");
  burger.addEventListener("click",function(){this.classList.toggle("open");links.classList.toggle("open")});
  $$(".nav-links a").forEach(function(a){a.addEventListener("click",function(){burger.classList.remove("open");links.classList.remove("open")})});

  var toast=$("#toast"),toastMsg=$("#toastMsg"),toastTimer;
  function showToast(msg,err){
    toastMsg.textContent=msg;
    toast.classList.toggle("err",!!err);
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer=setTimeout(function(){toast.classList.remove("show")},3800);
  }

  /* Menu filtering */
  var tabs=$$(".mtabs"),items=$$(".mitem");
  function showCat(cat){
    var idx=0;
    items.forEach(function(it){
      var show= it.getAttribute("data-cat")===cat;
      it.style.display= show?"block":"none";
      if(show){it.classList.remove("revealed");setTimeout(function(){it.classList.add("revealed")},idx*70);idx++;}
    });
  }
  tabs.forEach(function(t){t.addEventListener("click",function(){
    tabs.forEach(function(x){x.classList.remove("active")});t.classList.add("active");
    showCat(t.getAttribute("data-cat"));
  })});

  /* Reveal on scroll */
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);} });
  },{threshold:.12});
  document.querySelectorAll(".reveal").forEach(function(el){io.observe(el)});
  setTimeout(function(){showCat("coffee")},120);

  /* Storage делегирован в js/auth.js (window.MolotAuth).
     showToast переиспользуется экранами авторизации. */
  window.MolotToast = showToast;

  /* Modal: 4 экрана — login / register / cabinet / forgot */
  var modal=$("#authModal");
  function openModal(){
    modal.classList.add("open");document.body.style.overflow="hidden";
    var u=window.MolotAuth&&window.MolotAuth.state.user;
    setTab(u?"cabinet":"login");
  }
  function closeModal(){modal.classList.remove("open");document.body.style.overflow=""}
  $$("[data-open-modal]").forEach(function(el){el.addEventListener("click",function(e){e.preventDefault();openModal()})});
  $$("[data-close-modal]").forEach(function(el){el.addEventListener("click",closeModal)});
  document.addEventListener("keydown",function(e){ if(e.key==="Escape")closeModal(); });

  function setTab(name){
    $$(".mtab").forEach(function(m){m.classList.toggle("active",m.getAttribute("data-mtab")===name)});
    ["login","register","cabinet","forgot"].forEach(function(n){
      var p=$("#"+n+"Panel"); if(p) p.classList.toggle("hide",n!==name);
    });
    var bar=$("#authTabs"); if(bar) bar.style.display=(name==="cabinet"||name==="forgot")?"none":"flex";
    if(name==="cabinet") renderCabinet();
  }
  $$(".mtab").forEach(function(m){m.addEventListener("click",function(){setTab(m.getAttribute("data-mtab"))})});
  $$("[data-switch]").forEach(function(b){b.addEventListener("click",function(){setTab(b.getAttribute("data-switch"))})});
  function renderAuth(){
    var el=$("#authInfo"), A=window.MolotAuth, u=A&&A.state.user;
    if(el){ el.style.display=u?"block":"none"; if(u){ el.innerHTML=""; } }
    if(el&&u){ var b=document.createElement("b"); el.appendChild(document.createTextNode("👤 Вы вошли как ")); el.appendChild(b); b.textContent=u.name; el.appendChild(document.createTextNode(" — данные подставим автоматически.")); }
    var btns=$$("[data-open-modal]"); for(var i=0;i<btns.length;i++){ btns[i].textContent=u?("👤 "+u.name):"Войти"; }
    var bn=$("#bName"), bp=$("#bPhone");
    if(u){ if(bn&&!bn.value) bn.value=u.name; if(bp&&!bp.value&&u.phone) bp.value=u.phone; }
  }
  function renderCabinet(){ if(window.MolotRenderCabinet) window.MolotRenderCabinet(); }
  window.MolotTab=setTab; window.MolotRefreshHeader=renderAuth;
  window.MolotCloseModal=closeModal; window.MolotOpenModal=openModal;
  if(window.MolotAuth) window.MolotAuth.onAuth(function(){ renderAuth(); renderCabinet(); });
  renderAuth();

  /* Booking */
  var dateInput=$("#bDate");
  (function(){ var t=new Date(),pad=function(n){return("0"+n).slice(-2)};
    dateInput.min=t.getFullYear()+"-"+pad(t.getMonth()+1)+"-"+pad(t.getDate()); })();

  $("#bookForm").addEventListener("submit",function(e){
    e.preventDefault();
    var name=$("#bName").value.trim(), phone=$("#bPhone").value.trim(),
        date=dateInput.value, time=$("#bTime").value,
        guests=$("#bGuests").value, zone=$("#bZone").value;
    if(!name){showToast("Укажите имя","err");return}
    if(phone.replace(/\D/g,"").length<10){showToast("Укажите корректный телефон","err");return}
    if(!date){showToast("Выберите дату","err");return}
    var chosen=new Date(date+"T00:00:00"), today=new Date();today.setHours(0,0,0,0);
    if(chosen<today){showToast("Дата уже прошла — выберите другую","err");return}
    if(!time){showToast("Укажите время","err");return}
    var form=this;
    window.MolotAuth.saveBooking({name:name,phone:phone,date:date,time:time,guests:guests,zone:zone}).then(function(){
      showToast("Спасибо, "+name+"! Столик «"+zone+"» на "+guests+" гост.: "+date+" в "+time+" — подтвердим по телефону ☕");
      var A=window.MolotAuth, u=A&&A.state.user;
      if(!u){ var info=$("#authInfo"); info.style.display="block"; info.innerHTML="";
        var s=document.createElement("b"); s.textContent=name;
        info.appendChild(document.createTextNode("💡 ")); info.appendChild(s);
        info.appendChild(document.createTextNode(", зарегистрируйтесь в личном кабинете, чтобы управлять бронями.")); }
      form.reset(); if(window.MolotRenderCabinet) window.MolotRenderCabinet();
    });
  });

})();
