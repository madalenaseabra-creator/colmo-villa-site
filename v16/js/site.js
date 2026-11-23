/* COLMO VILLA v16. Plain JS, no libraries. */
(function(){
  var d=document, root=d.documentElement;
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Menu */
  var burger=d.querySelector(".burger"), panel=d.querySelector(".panel");
  if(burger&&panel){burger.addEventListener("click",function(){
    var o=panel.classList.toggle("open");burger.setAttribute("aria-expanded",o?"true":"false");
  });}

  /* Home: show the header logo once the opener logo has scrolled away */
  var head=d.querySelector(".head");
  function onScrollHead(){if(head)head.classList.toggle("scrolled",scrollY>innerHeight*0.45);}
  addEventListener("scroll",onScrollHead,{passive:true});onScrollHead();

  /* Parallax, like rodrigomoran.com: the photo moves at half the scroll speed (0.75 of it on small screens) */
  if(!reduce && "IntersectionObserver" in window){
    root.classList.add("px-on","js-fade");
    var vis=new Set(), queued=false;
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting){vis.add(e.target);e.target.classList.add("in");}else vis.delete(e.target);
    });req();},{rootMargin:"80px 0px"});
    d.querySelectorAll(".px").forEach(function(s){io.observe(s);});
    function req(){if(!queued){queued=true;requestAnimationFrame(run);}}
    function run(){
      queued=false;var f=innerWidth<720?0.25:0.5;
      vis.forEach(function(s){
        var r=s.getBoundingClientRect(), m=s.querySelector(":scope>.bg");
        if(m)m.style.transform="translate3d(0,"+(-r.top*f).toFixed(1)+"px,0)";
      });
    }
    addEventListener("scroll",req,{passive:true});addEventListener("resize",req);
  }

  /* Side dots (desktop only by CSS) */
  var dots=d.querySelectorAll(".dots a");
  if(dots.length&&"IntersectionObserver" in window){
    var dio=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting){dots.forEach(function(a){a.classList.toggle("on",a.getAttribute("href")==="#"+e.target.id);});}
    });},{threshold:0.55});
    dots.forEach(function(a){var t=d.querySelector(a.getAttribute("href"));if(t)dio.observe(t);});
  }

  /* Mobile bar: hide it while another Request dates button is on screen (one button per screen) */
  var bar=d.querySelector(".mbar");
  if(bar&&"IntersectionObserver" in window){
    var seen=new Set();
    var bio=new IntersectionObserver(function(es){es.forEach(function(e){e.isIntersecting?seen.add(e.target):seen.delete(e.target);});
      bar.classList.toggle("away",seen.size>0);});
    d.querySelectorAll("main .btn, .foot").forEach(function(b){bio.observe(b);});
  }

  /* Lightbox */
  var lb=d.querySelector(".lb"), last=null;
  function openLb(src,cap,alt){if(!lb)return;last=d.activeElement;var im=lb.querySelector("img");im.src=src;im.alt=alt||"";
    lb.querySelector("p").textContent=cap||"";lb.hidden=false;lb.querySelector("button").focus();}
  function closeLb(){if(!lb||lb.hidden)return;lb.hidden=true;lb.querySelector("img").src="";if(last)last.focus();}
  if(lb){lb.addEventListener("click",function(e){if(e.target===lb||e.target.tagName==="BUTTON")closeLb();});
    d.addEventListener("keydown",function(e){if(e.key==="Escape")closeLb();});}
  d.querySelectorAll("[data-big]").forEach(function(b){b.addEventListener("click",function(){
    var im=b.querySelector("img");openLb(b.getAttribute("data-big"),b.getAttribute("data-cap"),im?im.alt:"");});});

  /* The House: sticky sketch, each house opens in place */
  var houses=d.querySelectorAll(".house");
  if(houses.length){
    var ctrls=d.querySelectorAll("[data-house]");
    function show(id,scroll){
      houses.forEach(function(h){h.hidden=(h.id!==id);});
      ctrls.forEach(function(c){var on=c.getAttribute("data-house")===id;
        if(c.tagName==="BUTTON")c.setAttribute("aria-expanded",on?"true":"false");
        c.classList.toggle("on",on);});
      d.querySelectorAll("[data-wash]").forEach(function(w){w.classList.toggle("on",w.getAttribute("data-wash")===id);});
      if(scroll&&id){var h=d.getElementById(id);if(h)h.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});}
      if(scroll&&!id){var s=d.getElementById("houses");if(s)s.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});}
      if(window.dispatchEvent)dispatchEvent(new Event("scroll"));
    }
    function toggle(id){
      var cur=d.querySelector(".house:not([hidden])");
      var next=(cur&&cur.id===id)?"":id;
      history.pushState(null,"",next?"#"+next:location.pathname+location.search+"#houses");
      show(next,true);
    }
    ctrls.forEach(function(c){
      var w=d.querySelector('[data-wash="'+c.getAttribute("data-house")+'"]');
      if(w){c.addEventListener("mouseenter",function(){w.classList.add("hover");});c.addEventListener("mouseleave",function(){w.classList.remove("hover");});}
      c.addEventListener("click",function(e){e.preventDefault();toggle(c.getAttribute("data-house"));});
      if(c.tagName!=="BUTTON")c.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle(c.getAttribute("data-house"));}});
    });
    d.querySelectorAll("[data-all]").forEach(function(a){a.addEventListener("click",function(e){e.preventDefault();
      d.getElementById("houses").scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});});});
    function fromHash(scroll){var h=location.hash.slice(1);
      if(["living","rest","annex"].indexOf(h)>=0)show(h,scroll);else if(h==="houses")show("",false);else show("living",false);}
    addEventListener("popstate",function(){fromHash(true);});
    fromHash(!!location.hash&&location.hash!=="#houses");
  }

  /* Forms: Formspree xjywaajv, with an email fallback */
  d.querySelectorAll("form[data-fs]").forEach(function(f){
    f.addEventListener("submit",function(e){
      e.preventDefault();
      var ok=f.querySelector(".ok"), bad=f.querySelector(".bad"), btn=f.querySelector("[type=submit]");
      ok.hidden=true;bad.hidden=true;
      var a=f.querySelector("[name=arrival]"), dep=f.querySelector("[name=departure]");
      if(a&&dep&&a.value&&dep.value&&dep.value<=a.value){bad.hidden=false;bad.textContent="Please check the dates: departure comes after arrival.";return;}
      btn.disabled=true;
      fetch("https://formspree.io/f/xjywaajv",{method:"POST",body:new FormData(f),headers:{Accept:"application/json"}})
        .then(function(r){if(!r.ok)throw new Error("send");ok.hidden=false;f.reset();if(window.calReset)calReset();})
        .catch(function(){bad.hidden=false;bad.innerHTML='The request could not be sent. Please write to <a href="mailto:colmovilla@gmail.com">colmovilla@gmail.com</a>.';})
        .then(function(){btn.disabled=false;});
    });
  });

  /* Request dates: a month calendar that fills Arrival and Departure (availability not connected yet) */
  var cal=d.querySelector(".cal");
  if(cal){
    var M=["January","February","March","April","May","June","July","August","September","October","November","December"];
    var today=new Date();today.setHours(0,0,0,0);
    var view=new Date(today.getFullYear(),today.getMonth(),1), A=null, B=null;
    var inA=d.querySelector("[name=arrival]"), inB=d.querySelector("[name=departure]"), title=d.querySelector(".cal-title");
    function iso(x){return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0");}
    function draw(){
      title.textContent=M[view.getMonth()]+" "+view.getFullYear();
      var h="";["Mo","Tu","We","Th","Fr","Sa","Su"].forEach(function(w){h+='<span class="dow">'+w+"</span>";});
      var first=(view.getDay()+6)%7, days=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
      for(var i=0;i<first;i++)h+="<span></span>";
      for(var n=1;n<=days;n++){var x=new Date(view.getFullYear(),view.getMonth(),n), c="";
        if(A&&+x===+A||B&&+x===+B)c="sel";else if(A&&B&&x>A&&x<B)c="mid";
        h+='<button type="button" class="'+c+'" data-d="'+iso(x)+'"'+(x<today?" disabled":"")+' aria-label="'+n+" "+M[view.getMonth()]+'">'+n+"</button>";}
      cal.innerHTML=h;
    }
    cal.addEventListener("click",function(e){var b=e.target.closest("button");if(!b||b.disabled)return;
      var p=b.getAttribute("data-d").split("-"), x=new Date(+p[0],+p[1]-1,+p[2]);
      if(!A||B||x<=A){A=x;B=null;}else B=x;
      inA.value=A?iso(A):"";inB.value=B?iso(B):"";draw();});
    d.querySelector(".cal-prev").addEventListener("click",function(){var p=new Date(view.getFullYear(),view.getMonth()-1,1);if(p>=new Date(today.getFullYear(),today.getMonth(),1)){view=p;draw();}});
    d.querySelector(".cal-next").addEventListener("click",function(){view=new Date(view.getFullYear(),view.getMonth()+1,1);draw();});
    window.calReset=function(){A=B=null;draw();};
    draw();
  }
})();
