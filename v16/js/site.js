/* COLMO VILLA v16. Plain JS, no libraries. */
(function(){
  var d=document, root=d.documentElement;
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Menu */
  var burger=d.querySelector(".burger"), panel=d.querySelector(".panel");
  if(burger&&panel){burger.addEventListener("click",function(){
    var o=panel.classList.toggle("open");burger.setAttribute("aria-expanded",o?"true":"false");
  });}

  /* Home entrance, as in v10: the big logo flies left into the header slot on scroll.
     On entry only the photo and the logo show; the rest arrives once you scroll. */
  root.classList.add("js");
  var head=d.querySelector(".head"), body=d.body, fly=d.querySelector(".fly-logo"),
      brand=d.querySelector(".brand img"), entrance=d.getElementById("arrive"), tick=false;
  function lerp(a,b,t){return a+(b-a)*t;}
  function ease(t){return t*t*(3-2*t);}
  function syncHead(){
    tick=false;
    if(!fly||!entrance||!head||!brand)return;
    var navH=head.offsetHeight||64, thr=Math.max(entrance.offsetHeight-navH,80);
    var t=Math.min(1,Math.max(0,scrollY/thr));
    if(reduce)t=scrollY>24?1:0;
    var e=ease(t), vw=root.clientWidth;
    var slot=brand.getBoundingClientRect();
    var ratio=brand.naturalWidth?brand.naturalWidth/brand.naturalHeight:1.87;
    /* t433u/t435u: the big logo sits in the centre of the opener, the title centred just below it */
    var eh=entrance.offsetHeight, startW=Math.min(520,vw*(vw<700?0.78:0.4)), startH=startW/ratio,
        startTop=Math.max(24,eh*0.44-startH/2);
    entrance.style.setProperty("--logo-bottom",(startTop+startH)+"px");
    var endW=slot.width||(slot.height*ratio)||90, endH=endW/ratio;
    /* the centred title fades out as the logo flies, so the two never cross */
    var ov=entrance.querySelector(".ov"); if(ov){var gap=parseFloat(getComputedStyle(ov).paddingTop)||30;
      /* t455u: gone before the title can reach the logo */
      ov.style.opacity=Math.max(0,1-scrollY/(gap*0.85)).toFixed(3);}
    fly.style.transform="none";
    fly.style.width=lerp(startW,endW,e)+"px";
    fly.style.left=lerp((vw-startW)/2,slot.left,e)+"px";
    fly.style.top=lerp(startTop,Math.max(0,(navH-endH)/2),e)+"px";
    var open=panel&&panel.classList.contains("open"), docked=t>=0.78||open;
    head.classList.toggle("docked",docked); body.classList.toggle("docked",docked);
    body.classList.toggle("live",scrollY>24||open);
    fly.classList.toggle("on-light",docked);
  }
  function reqHead(){if(!tick){tick=true;requestAnimationFrame(syncHead);}}
  if(fly){addEventListener("scroll",reqHead,{passive:true});addEventListener("resize",reqHead);
    if(d.fonts&&d.fonts.ready)d.fonts.ready.then(reqHead);addEventListener("load",reqHead);syncHead();}

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
    d.querySelectorAll("main .btn, .site-foot").forEach(function(b){bio.observe(b);});
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

  /* Request dates: two months side by side on desktop, one on mobile; fills Arrival and Departure (availability not connected yet) */
  var cals=d.querySelectorAll(".cal-m");
  if(cals.length){
    var M=["January","February","March","April","May","June","July","August","September","October","November","December"];
    var today=new Date();today.setHours(0,0,0,0);
    var view=new Date(today.getFullYear(),today.getMonth(),1), A=null, B=null;
    var inA=d.querySelector("[name=arrival]"), inB=d.querySelector("[name=departure]");
    function iso(x){return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0");}
    function month(box,v){
      box.querySelector(".cal-title").textContent=M[v.getMonth()]+" "+v.getFullYear();
      var h="";["Mo","Tu","We","Th","Fr","Sa","Su"].forEach(function(w){h+='<span class="dow">'+w+"</span>";});
      var first=(v.getDay()+6)%7, days=new Date(v.getFullYear(),v.getMonth()+1,0).getDate();
      for(var i=0;i<first;i++)h+="<span></span>";
      for(var n=1;n<=days;n++){var x=new Date(v.getFullYear(),v.getMonth(),n), c="";
        if(A&&+x===+A||B&&+x===+B)c="sel";else if(A&&B&&x>A&&x<B)c="mid";
        h+='<button type="button" class="'+c+'" data-d="'+iso(x)+'"'+(x<today?" disabled":"")+' aria-label="'+n+" "+M[v.getMonth()]+'">'+n+"</button>";}
      box.querySelector(".cal").innerHTML=h;
    }
    function draw(){[].forEach.call(cals,function(box,i){month(box,new Date(view.getFullYear(),view.getMonth()+i,1));});
      d.querySelector(".cal-prev").disabled=(+view<=+new Date(today.getFullYear(),today.getMonth(),1));}
    d.querySelector(".cal-months").addEventListener("click",function(e){var b=e.target.closest("button");if(!b||b.disabled)return;
      var p=b.getAttribute("data-d").split("-"), x=new Date(+p[0],+p[1]-1,+p[2]);
      if(!A||B||x<=A){A=x;B=null;}else B=x;
      inA.value=A?iso(A):"";inB.value=B?iso(B):"";draw();});
    d.querySelector(".cal-prev").addEventListener("click",function(){var p=new Date(view.getFullYear(),view.getMonth()-1,1);if(p>=new Date(today.getFullYear(),today.getMonth(),1)){view=p;draw();}});
    d.querySelector(".cal-next").addEventListener("click",function(){view=new Date(view.getFullYear(),view.getMonth()+1,1);draw();});
    window.calReset=function(){A=B=null;draw();};
    draw();
  }
})();

/* Days at Colmo, option B: vertical scroll drives the day left to right; each photo slides over the previous one */
(function(){
  var hz=document.querySelector(".hz"); if(!hz)return;
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduce)return;
  var root=document.documentElement; root.classList.add("hz-on");
  var slides=[].slice.call(hz.querySelectorAll(".hz-slide")), N=slides.length,
      lis=[].slice.call(hz.querySelectorAll(".hz-time li")), time=hz.querySelector(".hz-time"),
      hint=hz.querySelector(".hz-hint"), q=false;
  function size(){hz.style.height=(N*innerHeight)+"px";upd();}
  var pin=hz.querySelector(".hz-pin");
  function navH(){return parseFloat(getComputedStyle(pin).top)||0;}
  function span(){return Math.max(1,hz.offsetHeight-pin.offsetHeight);}
  function prog(){var r=hz.getBoundingClientRect();
    return Math.min(N-1,Math.max(0,(navH()-r.top)/span()*(N-1)));}
  function ease(t){return t*t*(3-2*t);}
  function upd(){q=false;var p=prog();
    slides.forEach(function(s,i){
      if(i===0){var l0=Math.min(1,Math.max(0,p));s.style.transform="translateX("+(-12*ease(l0))+"%)";return;}
      var l=Math.min(1,Math.max(0,p-(i-1))), nx=Math.min(1,Math.max(0,p-i));
      s.style.transform="translateX("+((1-ease(l))*100-12*ease(nx))+"%)";
      s.style.boxShadow=(l>0&&l<1)?"":"none";
    });
    var cur=Math.round(p);
    lis.forEach(function(li,j){var k=j+1;li.classList.toggle("past",k<cur);li.classList.toggle("now",k===cur);});
    if(time)time.style.setProperty("--p",Math.max(0,(p-1)/(N-2)).toFixed(3));
    if(hint)hint.classList.toggle("gone",p>0.3);
  }
  function req(){if(!q){q=true;requestAnimationFrame(upd);}}
  function go(i){i=Math.max(0,Math.min(N-1,i));
    scrollTo({top:hz.getBoundingClientRect().top+scrollY-navH()+span()*i/(N-1),behavior:"smooth"});}
  addEventListener("scroll",req,{passive:true});addEventListener("resize",size);
  /* sideways trackpad scroll and horizontal swipes also move through the day */
  hz.addEventListener("wheel",function(e){if(Math.abs(e.deltaX)>Math.abs(e.deltaY)){e.preventDefault();scrollBy(0,e.deltaX);}},{passive:false});
  var sx=0,sy=0;
  hz.addEventListener("touchstart",function(e){sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
  hz.addEventListener("touchend",function(e){var t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;
    if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.2){go(Math.round(prog())+(dx<0?1:-1));}},{passive:true});
  addEventListener("keydown",function(e){var r=hz.getBoundingClientRect();if(r.top>innerHeight/2||r.bottom<innerHeight/2)return;
    if(e.key==="ArrowRight"){e.preventDefault();go(Math.round(prog())+1);}if(e.key==="ArrowLeft"){e.preventDefault();go(Math.round(prog())-1);}});
  size();
})();

/* Find us map: MapLibre GL 4.7.1 with the OpenFreeMap Positron style, repainted in the COLMO palette.
   One approximate pin and a capped zoom, so the exact house is not shown. Loaded only near the screen. */
(function(){
  var el=document.getElementById("colmo-map"); if(!el)return;
  var LNG=-8.77, LAT=38.31; /* approximate: Carvalhal, not the house */
  function init(){
    if(!window.maplibregl)return;
    var touch=("ontouchstart" in window)||navigator.maxTouchPoints>0;
    var map=new maplibregl.Map({container:el,style:"https://tiles.openfreemap.org/styles/positron",
      center:[LNG,LAT],zoom:innerWidth<720?9.6:10.3,minZoom:8,maxZoom:12.5,
      scrollZoom:false,dragPan:!touch,dragRotate:false,pitchWithRotate:false,touchPitch:false,attributionControl:false});
    map.touchZoomRotate.disableRotation();map.keyboard.disableRotation();
    map.addControl(new maplibregl.NavigationControl({showCompass:false}),"top-right");
    var a=document.createElement("a");a.className="cv-attr";a.href="https://www.openstreetmap.org/copyright";a.target="_blank";a.rel="noopener";
    a.textContent="\u00a9 OpenMapTiles \u00a9 OpenStreetMap";el.appendChild(a);
    var LAND="#F1EBDD",WATER="#C9C8B3",MOTOR="#B7A58A",MAJOR="#CDBFA5",INK="#5E5D48";
    var KEEP=["highway_motorway_inner","highway_motorway_subtle","highway_motorway_bridge_inner","tunnel_motorway_inner","highway_major_inner","highway_major_subtle"];
    var MAJOR_FILTER=["all",["match",["geometry-type"],["LineString","MultiLineString"],true,false],["match",["get","class"],["trunk","primary","secondary"],true,false]];
    function paint(){
      function p(id,k,v){try{map.setPaintProperty(id,k,v);}catch(e){}}
      function off(id){try{map.setLayoutProperty(id,"visibility","none");}catch(e){}}
      (map.getStyle().layers||[]).forEach(function(ly){
        var id=ly.id,t=ly.type;
        if(t==="background")p(id,"background-color",LAND);
        else if(t==="fill"){if(/water/.test(id))p(id,"fill-color",WATER);else if(/building|aeroway|pier/.test(id))off(id);else{p(id,"fill-color",LAND);p(id,"fill-opacity",1);}}
        else if(t==="line"){
          if(/waterway/.test(id))p(id,"line-color",WATER);
          else if(KEEP.indexOf(id)===-1)off(id);
          else if(/motorway/.test(id)){p(id,"line-color",MOTOR);p(id,"line-opacity",1);p(id,"line-width",["interpolate",["exponential",1.4],["zoom"],7,0.8,12,2.2]);}
          else{try{map.setFilter(id,MAJOR_FILTER);}catch(e){}p(id,"line-color",MAJOR);p(id,"line-opacity",1);p(id,"line-width",["interpolate",["exponential",1.4],["zoom"],7,0.5,12,1.4]);}
        }
        else if(t==="symbol"){
          if(/^label_(town|city|village)/.test(id)){p(id,"text-color",INK);p(id,"text-halo-color",LAND);p(id,"text-halo-width",1.2);p(id,"text-halo-blur",0);}
          else off(id);
        }
        else if(t==="fill-extrusion")off(id);
      });
    }
    map.on("style.load",paint);map.on("load",paint);
    var pin=document.createElement("span");pin.className="cv-pin";pin.setAttribute("role","img");pin.setAttribute("aria-label","COLMO VILLA, approximate location");
    pin.innerHTML='<svg width="30" height="40" viewBox="0 0 32 42" aria-hidden="true"><path d="M16 1C7.7 1 1 7.6 1 15.8c0 10.6 13.2 24.3 14.4 25.6.3.3.9.3 1.2 0C17.8 40.1 31 26.4 31 15.8 31 7.6 24.3 1 16 1z" fill="#8F4530" stroke="#F1EBDD" stroke-width="1.4"/><circle cx="16" cy="15.5" r="5" fill="#F1EBDD"/></svg>';
    new maplibregl.Marker({element:pin,anchor:"bottom"}).setLngLat([LNG,LAT]).addTo(map);
  }
  var started=false;
  function load(){if(started)return;started=true;
    var l=document.createElement("link");l.rel="stylesheet";l.href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css";document.head.appendChild(l);
    var s=document.createElement("script");s.src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js";s.onload=init;document.head.appendChild(s);}
  if("IntersectionObserver" in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.disconnect();load();}});},{rootMargin:"600px 0px"});io.observe(el);}else load();
})();



/* v1607 (t405u): galleries run edge to edge with wide arrows.
   The About gallery and the day strip drift on their own (left to right, and right to left as in v10),
   dragging, swiping or the arrows move them, then the drift resumes. Nothing drifts with reduced motion. */
(function(){
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  function drift(m,track,dir,hoverPause){
    var half=0,pos=0,last=0,idle=0,user=false,hover=false;
    function measure(){half=track.scrollWidth/2;}
    /* t411u: endless in both directions; the upper edge also respects the real scroll end, so it never sticks */
    function wrap(){if(!half)return;var max=m.scrollWidth-m.clientWidth-2,hi=Math.min(half*1.5,max-1);
      if(pos<=Math.min(half*0.25,8))pos+=half;else if(pos>=hi)pos-=half;}
    function frame(t){var dt=last?Math.min(64,t-last):16;last=t;
      if(!reduce&&!user&&!hover&&t>idle&&half){pos+=dir*0.045*dt;wrap();m.scrollLeft=pos;}
      requestAnimationFrame(frame);}
    function hold(ms){idle=performance.now()+(ms||1600);}
    m._hold=hold;
    /* before an arrow step, jump by one set if the step would cross an end, so the smooth step is never cut short */
    m._pre=function(d){measure();if(!half)return;var max=m.scrollWidth-m.clientWidth-2,hi=Math.min(half*1.5,max-1),t=m.scrollLeft+d;
      if(t>=hi){pos=m.scrollLeft-half;m.scrollLeft=pos;}else if(t<=Math.min(half*0.25,8)){pos=m.scrollLeft+half;m.scrollLeft=pos;}};
    m.addEventListener("scroll",function(){if(user||hover||reduce||performance.now()<idle){pos=m.scrollLeft;var p0=pos;wrap();if(pos!==p0)m.scrollLeft=pos;}},{passive:true});
    m.addEventListener("wheel",function(){hold();},{passive:true});
    m.addEventListener("touchstart",function(){user=true;hold();},{passive:true});
    m.addEventListener("touchend",function(){user=false;hold();},{passive:true});
    if(hoverPause){m.addEventListener("mouseenter",function(){hover=true;});m.addEventListener("mouseleave",function(){hover=false;hold(600);});}
    var sx=0,sl=0;
    m.addEventListener("pointerdown",function(e){if(e.pointerType!=="mouse")return;user=true;sx=e.clientX;sl=m.scrollLeft;m.classList.add("drag");m.setPointerCapture(e.pointerId);});
    m.addEventListener("pointermove",function(e){if(!m.classList.contains("drag"))return;pos=sl-(e.clientX-sx);var p0=pos;wrap();sl+=pos-p0;m.scrollLeft=pos;});
    function up(){if(!m.classList.contains("drag"))return;m.classList.remove("drag");user=false;hold();pos=m.scrollLeft;}
    m.addEventListener("pointerup",up);m.addEventListener("pointercancel",up);
    m.addEventListener("keydown",function(e){if(e.key==="ArrowRight"||e.key==="ArrowLeft")hold(2500);});
    addEventListener("resize",measure);
    function start(){measure();pos=half*0.5;m.scrollLeft=pos;}
    addEventListener("load",start);start();
    requestAnimationFrame(frame);
  }
  var am=document.querySelector(".marquee");
  if(am)drift(am,am.querySelector(".marquee-track"),-1,false);
  var dm=document.querySelector("[data-day-marquee]");
  if(dm){var tr=dm.querySelector(".day-track"),set=dm.querySelector(".day-set");
    if(tr&&set){var c=set.cloneNode(true);c.setAttribute("aria-hidden","true");tr.appendChild(c);drift(dm,tr,1,true);}}

  /* arrows: about one photo per click, smooth */
  document.querySelectorAll("[data-gal]").forEach(function(g){
    var sc=g.querySelector(".marquee,.day-marquee,.cards"); if(!sc)return;
    var prev=g.querySelector(".gal-prev"), next=g.querySelector(".gal-next");
    var loops=!!sc._hold;
    function step(){var it=sc.querySelector("li,figure"); if(!it)return sc.clientWidth*0.8;
      var gap=parseFloat(getComputedStyle(it.parentElement).columnGap||getComputedStyle(it.parentElement).gap)||0;
      return it.getBoundingClientRect().width+gap;}
    function go(d){if(sc._hold)sc._hold(2600);if(sc._pre)sc._pre(d*step());sc.scrollBy({left:d*step(),behavior:reduce?"auto":"smooth"});}
    function ends(){if(loops)return;var max=sc.scrollWidth-sc.clientWidth-2;
      prev.disabled=sc.scrollLeft<=2; next.disabled=sc.scrollLeft>=max;}
    prev.addEventListener("click",function(){go(-1);});
    next.addEventListener("click",function(){go(1);});
    sc.addEventListener("scroll",ends,{passive:true}); addEventListener("resize",ends); ends();
  });
})();

/* t413u: blocks marked .reveal fade in once they scroll into view */
(function(){
  var els=document.querySelectorAll(".reveal"); if(!els.length)return;
  if(!("IntersectionObserver" in window)){els.forEach(function(e){e.classList.add("seen")});return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("seen");io.unobserve(e.target);}});},{threshold:.15});
  els.forEach(function(e){io.observe(e)});
})();
/* t461u: the header slides away on scroll down and comes back on scroll up.
   Always shown near the top and while the menu is open. On Home the docked logo goes with it. */
(function(){
  var d=document, head=d.querySelector(".head"), panel=d.querySelector(".panel"), fly=d.querySelector(".fly-logo");
  if(!head)return;
  var last=scrollY, tick=false;
  function set(h){head.classList.toggle("hide",h); if(fly)fly.classList.toggle("hide",h&&head.classList.contains("docked"));}
  function run(){
    tick=false; var y=scrollY, nav=head.offsetHeight||64, open=panel&&panel.classList.contains("open");
    if(open||y<nav*1.5||head.contains(d.activeElement)){set(false);}
    else if(y>last+6){set(true);}
    else if(y<last-6){set(false);}
    if(Math.abs(y-last)>6||y<nav*1.5)last=y;
  }
  addEventListener("scroll",function(){if(!tick){tick=true;requestAnimationFrame(run);}},{passive:true});
  head.addEventListener("focusin",function(){set(false);});
})();
