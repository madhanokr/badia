(function(){
  var d=document, html=d.documentElement, w=window;
  var reduce=w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G=w.gsap, ST=w.ScrollTrigger;
  var motion=!reduce && !!G && !!ST;
  if(motion){ html.classList.add('motion'); G.registerPlugin(ST); } else { html.classList.remove('motion'); }
  var desktop=w.matchMedia('(min-width: 1024px)');
  function $(s,c){return (c||d).querySelector(s);} function $$(s,c){return [].slice.call((c||d).querySelectorAll(s));}

  /* Smooth scroll */
  var lenis=null;
  if(motion && w.Lenis){
    lenis=new w.Lenis({duration:1.1,smoothWheel:true,wheelMultiplier:1});
    lenis.on('scroll',ST.update);
    G.ticker.add(function(t){lenis.raf(t*1000);}); G.ticker.lagSmoothing(0);
  }
  function scrollToY(y){ if(lenis) lenis.scrollTo(y,{duration:1.2}); else w.scrollTo({top:y,behavior:reduce?'auto':'smooth'}); }
  $$('a[href^="#"]').forEach(function(a){ a.addEventListener('click',function(e){ var id=a.getAttribute('href').slice(1); var t=id&&d.getElementById(id); if(t){ e.preventDefault(); scrollToY(t.getBoundingClientRect().top+w.scrollY-100); } }); });

  /* Nav: hide on scroll down, progress bar */
  var shell=$('.nav-shell'), prog=$('.progress'), mbar=$('.mbar'), lastY=w.scrollY;
  function onScroll(){
    var y=w.scrollY, h=d.documentElement.scrollHeight-w.innerHeight;
    if(prog) prog.style.transform='scaleX('+(h>0?Math.min(1,y/h):0)+')';
    if(shell){
      shell.classList.toggle('scrolled',y>10);
      var megaOpen=$('.mega.open');
      if(!megaOpen) shell.classList.toggle('hide', y>lastY && y>240);
    }
    if(mbar) mbar.classList.toggle('away', y<480);
    lastY=y;
  }
  w.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  /* Mega menu */
  var careBtn=$('#care-btn'), mega=$('#mega');
  if(careBtn&&mega){
    var tmr;
    function open(v){ mega.classList.toggle('open',v); careBtn.setAttribute('aria-expanded',v); }
    careBtn.addEventListener('click',function(){ open(!mega.classList.contains('open')); });
    [careBtn,mega].forEach(function(el){
      el.addEventListener('mouseenter',function(){ clearTimeout(tmr); if(w.matchMedia('(hover:hover)').matches) open(true); });
      el.addEventListener('mouseleave',function(){ tmr=setTimeout(function(){open(false);},220); });
    });
    d.addEventListener('keydown',function(e){ if(e.key==='Escape'){ open(false); } });
    d.addEventListener('click',function(e){ if(!mega.contains(e.target)&&e.target!==careBtn&&!careBtn.contains(e.target)) open(false); });
  }

  /* Mobile sheet */
  var sheet=$('#sheet');
  $$('[data-sheet]').forEach(function(b){ b.addEventListener('click',function(){
    var o=b.dataset.sheet==='open'; sheet.classList.toggle('open',o); d.body.style.overflow=o?'hidden':'';
    if(lenis){ o?lenis.stop():lenis.start(); }
    $$('nav a',sheet).forEach(function(a,i){ a.style.transitionDelay=o?(80+i*45)+'ms':'0ms'; });
    if(o){ var c=$('.top button',sheet); if(c) c.focus(); }
  });});

  /* Split headings into words */
  $$('[data-split]').forEach(function(el){
    var walk=function(node){
      [].slice.call(node.childNodes).forEach(function(n){
        if(n.nodeType===3){
          var parts=n.textContent.split(/(\s+)/), frag=d.createDocumentFragment();
          parts.forEach(function(p){ if(!p) return; if(/^\s+$/.test(p)){ frag.appendChild(d.createTextNode(p)); return; }
            var o=d.createElement('span'); o.className='w'; var i=d.createElement('span'); i.className='wi'; i.textContent=p; o.appendChild(i); frag.appendChild(o); });
          n.parentNode.replaceChild(frag,n);
        } else if(n.nodeType===1 && !n.classList.contains('w')) walk(n);
      });
    };
    walk(el);
  });

  if(motion){
    /* Hero intro */
    var hero=$('.hero, .phero');
    var tl=G.timeline({defaults:{ease:'power4.out'}});
    var heroH=hero&&$('[data-split]',hero);
    if(heroH){ tl.to($$('.wi',heroH),{y:0,duration:1.15,stagger:.055},.1); heroH.dataset.done='1'; }
    if(hero){
      tl.from($$('.lede, .actions, .proof, .crumbs, .lang',hero),{y:24,opacity:0,duration:1,stagger:.08},.45);
      var cut=$('.cut',hero); if(cut) tl.from(cut,{y:80,opacity:0,scale:.96,duration:1.4,ease:'expo.out'},.2);
      var ring=$('.ring',hero); if(ring) tl.from(ring,{scale:.7,opacity:0,duration:1.6,ease:'expo.out'},.15);
      tl.from($$('.glass',hero),{y:24,opacity:0,scale:.92,duration:.9,stagger:.12,ease:'back.out(1.6)'},.9);
      var pm=$('.phero .media',hero); if(pm) tl.from(pm,{clipPath:'inset(12% 10% 12% 10% round 36px)',scale:1.04,duration:1.5,ease:'expo.out'},.2);
      var wm=$('.wordmark',hero); if(wm){ tl.from(wm,{y:60,opacity:0,duration:1.6,ease:'expo.out'},.1);
        G.to(wm,{yPercent:18,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}}); }
      if(cut) G.to(cut,{yPercent:8,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});
      $$('.glass',hero).forEach(function(g,i){ G.to(g,{yPercent:-(30+i*25),ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}}); });
    }

    /* Heading reveals on scroll */
    $$('[data-split]').forEach(function(el){
      if(el.dataset.done) return;
      G.to($$('.wi',el),{y:0,duration:1.1,stagger:.045,ease:'power4.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});
    });

    /* Image clip reveals + inner parallax */
    $$('.reveal').forEach(function(m){
      G.to(m,{clipPath:'inset(0% 0% 0% 0% round 32px)',duration:1.4,ease:'expo.out',scrollTrigger:{trigger:m,start:'top 85%',once:true}});
      var img=$('img',m); if(img) G.fromTo(img,{yPercent:-4},{yPercent:4,ease:'none',scrollTrigger:{trigger:m,start:'top bottom',end:'bottom top',scrub:true}});
    });
    $$('.portrait img').forEach(function(img){ G.fromTo(img,{yPercent:-4},{yPercent:4,ease:'none',scrollTrigger:{trigger:img.parentNode,start:'top bottom',end:'bottom top',scrub:true}}); });

    /* Staggered groups */
    $$('[data-stagger]').forEach(function(g){
      G.from(g.children,{y:34,opacity:0,duration:1,stagger:.08,ease:'power3.out',scrollTrigger:{trigger:g,start:'top 86%',once:true}});
    });
  }

  /* Counters */
  function countUp(el){
    var end=parseFloat(el.dataset.count), dec=(el.dataset.count.split('.')[1]||'').length, pre=el.dataset.pre||'', suf=el.dataset.suf||'';
    if(!motion){ el.textContent=pre+end.toFixed(dec)+suf; return; }
    var o={v:0}; G.to(o,{v:end,duration:1.8,ease:'power3.out',onUpdate:function(){ el.textContent=pre+o.v.toFixed(dec)+suf; }});
  }
  var cio=('IntersectionObserver' in w)?new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ countUp(e.target); cio.unobserve(e.target);} }); },{threshold:.6}):null;
  $$('[data-count]').forEach(function(el){ if(cio) cio.observe(el); else countUp(el); });

  /* Celebrity wall: pinned horizontal on desktop */
  var cw=$('.celebs'), ct=$('.c-track');
  if(cw&&ct&&motion&&desktop.matches){
    var dist=function(){ return Math.max(0, ct.scrollWidth - w.innerWidth); };
    G.to(ct,{x:function(){return -dist();},ease:'none',scrollTrigger:{trigger:cw,start:'top top',end:function(){return '+='+dist();},pin:true,scrub:.6,invalidateOnRefresh:true,anticipatePin:1}});
  }

  /* Regions (fingertip to shoulder) */
  var regs=$('.regions');
  if(regs){
    var tabs=$$('.rail [role="tab"]',regs), photos=$$('.reg-photo img',regs), num=$('.reg-photo .big-n',regs), fill=$('.rail .fill',regs), cur=-1, st=null;
    function setReg(i,focus){
      if(i===cur) return; cur=i;
      tabs.forEach(function(t,k){ var on=k===i; t.setAttribute('aria-selected',on); t.tabIndex=on?0:-1; var p=d.getElementById(t.getAttribute('aria-controls')); if(p) p.hidden=!on; });
      photos.forEach(function(p,k){ p.classList.toggle('on',k===i); });
      if(num) num.textContent='0'+(i+1);
      if(fill) fill.style.width=((i+1)/tabs.length*100)+'%';
      if(focus) tabs[i].focus();
    }
    var start=tabs.findIndex(function(t){return t.dataset.key===location.hash.slice(1);});
    setReg(start>-1?start:0);
    if(motion&&desktop.matches){
      st=ST.create({trigger:regs,start:'top top',end:'+='+(tabs.length*70)+'%',pin:true,anticipatePin:1,
        onUpdate:function(s){ setReg(Math.min(tabs.length-1,Math.floor(s.progress*tabs.length*0.999))); }});
    }
    tabs.forEach(function(t,i){
      t.addEventListener('click',function(){
        if(st){ var y=st.start+(st.end-st.start)*((i+.5)/tabs.length); scrollToY(y); } else setReg(i);
      });
      t.addEventListener('keydown',function(e){ var n=null; if(e.key==='ArrowRight') n=(i+1)%tabs.length; if(e.key==='ArrowLeft') n=(i-1+tabs.length)%tabs.length; if(n!==null){ e.preventDefault(); if(st){ tabs[n].click(); tabs[n].focus(); } else setReg(n,true); } });
    });
  }

  /* Generic tabs (stages) */
  $$('[data-tabs]').forEach(function(set){
    var tb=$$('[role="tab"]',set);
    function sel(t,f){ tb.forEach(function(x){ var on=x===t; x.setAttribute('aria-selected',on); x.tabIndex=on?0:-1; var p=d.getElementById(x.getAttribute('aria-controls')); if(p) p.hidden=!on; }); if(f) t.focus(); }
    tb.forEach(function(t,i){ t.addEventListener('click',function(){sel(t);}); t.addEventListener('keydown',function(e){ var k=e.key,n=null; if(k==='ArrowRight'||k==='ArrowDown') n=tb[(i+1)%tb.length]; if(k==='ArrowLeft'||k==='ArrowUp') n=tb[(i-1+tb.length)%tb.length]; if(n){e.preventDefault(); sel(n,true);} }); });
  });

  /* Visit steps */
  var steps=$$('.steps li[data-img]'), vimgs=$$('.v-photo img'), bar=$('.steps .bar');
  if(steps.length&&'IntersectionObserver' in w){
    var vio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){
      var i=steps.indexOf(e.target); steps.forEach(function(s,k){ s.classList.toggle('on',k<=i); });
      vimgs.forEach(function(im,k){ im.classList.toggle('on',k===i); });
    }}); },{rootMargin:'-45% 0px -50% 0px'});
    steps.forEach(function(s){vio.observe(s);});
    if(bar&&motion){ var ol=bar.parentNode; G.to(bar,{height:function(){return ol.offsetHeight-24;},ease:'none',scrollTrigger:{trigger:ol,start:'top 55%',end:'bottom 55%',scrub:true}}); }
  }

  /* Story scroller arrows */
  $$('[data-scroller]').forEach(function(c){
    var sc=d.getElementById(c.dataset.scroller);
    $$('button',c).forEach(function(b){ b.addEventListener('click',function(){ sc.scrollBy({left:(b.dataset.dir==='next'?1:-1)*Math.min(sc.clientWidth*.8,760),behavior:reduce?'auto':'smooth'}); }); });
  });

  /* Reviews rotator */
  var rev=$('.rev');
  if(rev){
    var qs=$$('.qt',rev), ds=$$('.dots button',rev), qi=0, timer=null;
    function showQ(i){ qi=i; qs.forEach(function(q,k){ q.classList.toggle('on',k===i); q.setAttribute('aria-hidden',k!==i); }); ds.forEach(function(b,k){ b.classList.remove('on'); b.setAttribute('aria-current',k===i); void b.offsetWidth; if(k===i) b.classList.add('on'); }); }
    function next(){ showQ((qi+1)%qs.length); }
    function play(){ clearInterval(timer); if(!reduce) timer=setInterval(next,7000); }
    ds.forEach(function(b,k){ b.addEventListener('click',function(){ showQ(k); play(); }); });
    rev.addEventListener('mouseenter',function(){ clearInterval(timer); rev.classList.add('paused'); });
    rev.addEventListener('mouseleave',function(){ rev.classList.remove('paused'); play(); });
    showQ(0); play();
  }

  /* Lightbox video */
  var lb=$('#lb'), lbFrame=lb&&$('.frame',lb), lbCap=lb&&$('.cap',lb), lastFocus=null;
  function openLB(id,title){
    if(!lb) return; lastFocus=d.activeElement;
    lbFrame.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&modestbranding=1" title="'+(title||'Video').replace(/"/g,'&quot;')+'" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    lbCap.textContent=title||''; lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); if(lenis) lenis.stop(); $('.close',lb).focus();
  }
  function closeLB(){ if(!lb) return; lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); setTimeout(function(){lbFrame.innerHTML='';},400); if(lenis) lenis.start(); if(lastFocus) lastFocus.focus(); }
  d.addEventListener('click',function(e){ var b=e.target.closest('[data-yt]'); if(b){ e.preventDefault(); openLB(b.dataset.yt,b.dataset.title||b.getAttribute('aria-label')); } });
  if(lb){ $('.close',lb).addEventListener('click',closeLB); lb.addEventListener('click',function(e){ if(e.target===lb) closeLB(); }); d.addEventListener('keydown',function(e){ if(e.key==='Escape'&&lb.classList.contains('open')) closeLB(); if(e.key==='Tab'&&lb.classList.contains('open')){ e.preventDefault(); $('.close',lb).focus(); } }); }

  /* Cursor follower over videos */
  var fol=$('.follow');
  if(fol&&w.matchMedia('(hover:hover) and (pointer:fine)').matches){
    var fx=0,fy=0,tx=0,ty=0,raf=null;
    function loop(){ fx+=(tx-fx)*.18; fy+=(ty-fy)*.18; fol.style.transform='translate('+fx+'px,'+fy+'px)'; raf=requestAnimationFrame(loop); }
    d.addEventListener('mousemove',function(e){ tx=e.clientX; ty=e.clientY; if(!raf) loop(); var v=e.target.closest('.vid, .celeb[data-yt]'); fol.classList.toggle('on',!!v); },{passive:true});
  }

  /* Maps */
  if(w.L){
    var tiles='https://tile.openstreetmap.org/{z}/{x}/{y}.png', attr='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    function icon(c){ return L.divIcon({className:'',html:'<div class="pin '+(c||'')+'"></div>',iconSize:[24,24],iconAnchor:[12,12]}); }
    var lm=d.getElementById('map-local');
    if(lm){
      var m=L.map(lm,{scrollWheelZoom:false}).setView([25.8045,-80.312],13);
      L.tileLayer(tiles,{attribution:attr,maxZoom:19}).addTo(m);
      var pts=[[25.808423,-80.329762,'home','<b>Badia Hand to Shoulder Center</b><br>3650 NW 82nd Ave, Suite 103, Doral<br>The Surgery Center at Doral is in the same building.'],[25.808484,-80.327789,'','<b>Hyatt Place Miami Airport West</b><br>3655 NW 82nd Ave, across the street'],[25.810424,-80.328075,'','<b>AC Hotel by Marriott Miami Airport West/Doral</b><br>8091 NW 36th St'],[25.797897,-80.335864,'','<b>InterContinental at Doral Miami</b><br>2505 NW 87th Ave'],[25.794979,-80.286723,'air','<b>Miami International Airport (MIA)</b>']];
      var bb=[]; pts.forEach(function(p){ L.marker([p[0],p[1]],{icon:icon(p[2]),title:p[3].replace(/<[^>]+>/g,' ')}).addTo(m).bindPopup(p[3]); bb.push([p[0],p[1]]); });
      m.fitBounds(bb,{padding:[50,50]});
    }
    var wm2=d.getElementById('map-world');
    if(wm2){
      var wmap=L.map(wm2,{scrollWheelZoom:false,minZoom:2,worldCopyJump:true});
      L.tileLayer(tiles,{attribution:attr,maxZoom:8}).addTo(wmap);
      var mia=[25.8084,-80.3298];
      var C=[["Argentina",-34.6,-58.4],["The Bahamas",25.05,-77.35],["Barbados",13.1,-59.6],["Brazil",-15.8,-47.9],["Bolivia",-16.5,-68.15],["Canada",45.4,-75.7],["Cayman Islands",19.3,-81.38],["Chile",-33.45,-70.67],["Colombia",4.71,-74.07],["Curaçao",12.11,-68.93],["Dominican Republic",18.49,-69.93],["Ecuador",-0.18,-78.47],["El Salvador",13.69,-89.22],["France",48.86,2.35],["Ghana",5.6,-0.19],["Guatemala",14.63,-90.51],["Haiti",18.54,-72.34],["Honduras",14.07,-87.19],["India",28.61,77.21],["Jamaica",18.0,-76.79],["Mexico",19.43,-99.13],["Panama",8.98,-79.52],["Paraguay",-25.26,-57.58],["Peru",-12.05,-77.04],["Spain",40.42,-3.7],["Suriname",5.85,-55.2],["Trinidad and Tobago",10.65,-61.5],["United Kingdom",51.5,-0.13],["Venezuela",10.49,-66.88],["Virgin Islands",18.34,-64.93]];
      function arc(a,b){ var pts=[],n=48,mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=b[1]-a[1],dy=b[0]-a[0],len=Math.sqrt(dx*dx+dy*dy),k=.18;
        var cx=mx+dx*k*(len>0?1:0)*.6, cy=my-dy*k*.6;
        for(var i=0;i<=n;i++){ var t=i/n,u=1-t; pts.push([u*u*a[0]+2*u*t*cx+t*t*b[0], u*u*a[1]+2*u*t*cy+t*t*b[1]]); } return pts; }
      var group=[];
      C.forEach(function(c){ L.polyline(arc(mia,[c[1],c[2]]),{color:'#1b939c',weight:1.4,opacity:.55,className:'arc'}).addTo(wmap); L.marker([c[1],c[2]],{icon:icon(''),title:c[0]}).addTo(wmap).bindPopup('<b>'+c[0]+'</b>'); group.push([c[1],c[2]]); });
      L.marker(mia,{icon:icon('home'),title:'Miami/Doral',zIndexOffset:1000}).addTo(wmap).bindPopup('<b>Badia Hand to Shoulder Center</b><br>Miami/Doral, Florida');
      group.push(mia); wmap.fitBounds(group,{padding:[30,30]});
      if('IntersectionObserver' in w){ var aio=new IntersectionObserver(function(es){ if(es[0].isIntersecting){ wm2.classList.add('arcs-on'); aio.disconnect(); } },{threshold:.35}); aio.observe(wm2); } else wm2.classList.add('arcs-on');
    }
  }

  /* X-ray lens */
  $$('.lens').forEach(function(l){
    function at(cx,cy){ var r=l.getBoundingClientRect(); l.style.setProperty('--x',((cx-r.left)/r.width*100)+'%'); l.style.setProperty('--y',((cy-r.top)/r.height*100)+'%'); l.classList.add('used'); }
    l.addEventListener('pointermove',function(e){ at(e.clientX,e.clientY); });
    l.addEventListener('pointerdown',function(e){ at(e.clientX,e.clientY); try{l.setPointerCapture(e.pointerId);}catch(_){} });
    l.addEventListener('keydown',function(e){ var x=parseFloat(getComputedStyle(l).getPropertyValue('--x'))||50,y=parseFloat(getComputedStyle(l).getPropertyValue('--y'))||80,s=4;
      if(e.key==='ArrowLeft')x-=s; else if(e.key==='ArrowRight')x+=s; else if(e.key==='ArrowUp')y-=s; else if(e.key==='ArrowDown')y+=s; else return;
      e.preventDefault(); l.style.setProperty('--x',Math.max(0,Math.min(100,x))+'%'); l.style.setProperty('--y',Math.max(0,Math.min(100,y))+'%'); l.classList.add('used'); });
    if(motion){ G.fromTo(l,{'--y':'20%'},{'--y':'80%',duration:2.2,ease:'power2.inOut',scrollTrigger:{trigger:l,start:'top 70%',once:true}}); }
  });

  /* FAQ smooth open */
  $$('.faq details').forEach(function(dt){
    var s=$('summary',dt), a=$('.ans',dt); if(!a||!motion) return;
    s.addEventListener('click',function(e){ e.preventDefault();
      if(dt.open){ G.to(a,{height:0,duration:.4,ease:'power3.inOut',onComplete:function(){dt.open=false;a.style.height='';}}); }
      else { dt.open=true; var h=a.scrollHeight; G.fromTo(a,{height:0},{height:h,duration:.5,ease:'power3.out',onComplete:function(){a.style.height='';}}); }
    });
  });

  /* Conditions finder */
  var q=d.getElementById('cq');
  if(q){
    var fb=$$('.filters [data-f]'), region='all', blocks=$$('.region-block'), empty=$('.empty');
    function apply(){
      var v=q.value.trim().toLowerCase(), any=false, first=true;
      blocks.forEach(function(b){ var show=0;
        $$('.cond',b).forEach(function(c){ var ok=!v||c.textContent.toLowerCase().indexOf(v)>-1; c.hidden=!ok; if(ok) show++; });
        b.hidden=!(show&&(region==='all'||b.dataset.region===region)); b.classList.toggle('first',!b.hidden&&first); if(!b.hidden){ any=true; first=false; } });
      if(empty) empty.style.display=any?'none':'block';
      if(ST) ST.refresh();
    }
    q.addEventListener('input',apply);
    fb.forEach(function(b){ b.addEventListener('click',function(){ region=b.dataset.f; fb.forEach(function(x){x.setAttribute('aria-pressed',x===b);}); apply(); }); });
    var h=location.hash.slice(1); fb.forEach(function(b){ if(b.dataset.f===h) b.click(); });
  }

  /* Story wall filter */
  var sf=$$('[data-sf]');
  sf.forEach(function(b){ b.addEventListener('click',function(){ var f=b.dataset.sf; sf.forEach(function(x){x.setAttribute('aria-pressed',x===b);});
    $$('.wall .story').forEach(function(s){ s.hidden=!(f==='all'||(' '+s.dataset.tags+' ').indexOf(' '+f+' ')>-1); });
    if(motion){ G.fromTo($$('.wall .story:not([hidden])'),{y:20,opacity:0},{y:0,opacity:1,duration:.6,stagger:.03,ease:'power3.out'}); ST.refresh(); } }); });

  /* Forms */
  if(location.hash==='#video'){ var vr=$('input[name="type"][value="video"]'); if(vr) vr.checked=true; }
  $$('form[data-concept]').forEach(function(f){ f.addEventListener('submit',function(e){ e.preventDefault(); f.classList.add('sent'); var dn=$('.done',f); if(dn){ dn.setAttribute('tabindex','-1'); dn.focus(); } }); });

  /* Language toggle */
  var lbs=$$('.lang button');
  function setLang(l){ html.lang=l; lbs.forEach(function(b){ b.setAttribute('aria-pressed',b.dataset.lang===l); }); if(ST) ST.refresh(); }
  lbs.forEach(function(b){ b.addEventListener('click',function(){ setLang(b.dataset.lang); try{ history.replaceState(null,'',b.dataset.lang==='es'?'?lang=es':location.pathname); }catch(_){} }); });
  if(/[?&]lang=es/.test(location.search)) setLang('es');

  /* Fit footer wordmark to its container */
  function fit(){ $$('[data-fit]').forEach(function(el){
    var par=el.parentNode, cs=getComputedStyle(par), cw=par.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
    el.style.fontSize='100px'; el.style.display='inline-block'; var sw=el.getBoundingClientRect().width; el.style.display='';
    if(sw) el.style.fontSize=Math.floor(100*cw/sw*.99)+'px'; }); }
  fit(); w.addEventListener('resize',fit); if(d.fonts&&d.fonts.ready) d.fonts.ready.then(fit);

  w.addEventListener('load',function(){ fit(); if(ST) ST.refresh(); });
})();
