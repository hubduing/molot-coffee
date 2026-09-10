
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

  /* Storage */
  function users(){ try{return JSON.parse(localStorage.getItem("molot_users"))||{}}catch(e){return{}} }
  function saveUsers(u){ localStorage.setItem("molot_users",JSON.stringify(u)) }
  function current(){ return localStorage.getItem("molot_user") }

  /* Modal */
  var modal=$("#authModal");
  function openModal(){
    if(current()){showToast("Вы уже вошли как "+current()+" ☕");return}
    modal.classList.add("open");document.body.style.overflow="hidden";setTab("login");
  }
  function closeModal(){modal.classList.remove("open");document.body.style.overflow=""}
  $$("[data-open-modal]").forEach(function(el){el.addEventListener("click",function(e){e.preventDefault();openModal()})});
  $$("[data-close-modal]").forEach(function(el){el.addEventListener("click",closeModal)});
  document.addEventListener("keydown",function(e){ if(e.key==="Escape")closeModal(); });

  function setTab(name){
    $$(".mtab").forEach(function(m){m.classList.toggle("active",m.getAttribute("data-mtab")===name)});
    $("#loginPanel").classList.toggle("hide",name!=="login");
    $("#registerPanel").classList.toggle("hide",name!=="register");
  }
  $$(".mtab").forEach(function(m){m.addEventListener("click",function(){setTab(m.getAttribute("data-mtab"))})});
  $$("[data-switch]").forEach(function(b){b.addEventListener("click",function(){setTab(b.getAttribute("data-switch"))})});
/* Register */
  $("#registerPanel").addEventListener("submit",function(e){
    e.preventDefault();
    var name=$("#rName").value.trim(), email=$("#rEmail").value.trim().toLowerCase(),
        pass=$("#rPass").value, phone=$("#rPhone").value.trim();
    if(name.length<2){showToast("Укажите имя","err");return}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){showToast("Неверный e-mail","err");return}
    if(pass.length<6){showToast("Пароль — минимум 6 символов","err");return}
    if(!$("#rAgree").checked){showToast("Примите условия использования","err");return}
    var u=users();
    if(u[email]){showToast("Такой e-mail уже зарегистрирован","err");return}
    u[email]={name:name,pass:pass,phone:phone};
    saveUsers(u);
    localStorage.setItem("molot_user",name);
    closeModal();
    renderAuth();
    showToast("Добро пожаловать, "+name+"! Аккаунт создан ☕");
    this.reset();
  });

  /* Login */
  $("#loginPanel").addEventListener("submit",function(e){
    e.preventDefault();
    var email=$("#lEmail").value.trim().toLowerCase(), passed=$("#lPass").value;
    var u=users()[email];
    if(!u||u.pass!==passed){showToast("Неверный e-mail или пароль","err");return}
    localStorage.setItem("molot_user",u.name);
    closeModal();
    renderAuth();
    showToast("С возвращением, "+u.name+"!");
    this.reset();
  });

  function renderAuth(){
    var el=$("#authInfo"), name=current();
    el.style.display= name?"block":"none";
    if(name) el.innerHTML="👤 Вы вошли как <b>"+name+"</b> — данные подставим автоматически.";
  }
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
    showToast("Спасибо, "+name+"! Столик «"+zone+"» на "+guests+" гост.: "+date+" в "+time+" — подтвердим по телефону ☕");
    if(!current()){
      var info=$("#authInfo");
      info.style.display="block";
      info.innerHTML="💡 <b>"+name+"</b>, зарегистрируйтесь в&nbsp;личном кабинете, чтобы управлять бронями.";
    }
    this.reset();
  });

})();
