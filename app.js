(function(){
  var d=document;
  // Header border on scroll
  var hdr=d.querySelector('.hdr');
  function onScroll(){ if(hdr) hdr.classList.toggle('scrolled', window.scrollY>8); }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  // Mobile drawer
  var mb=d.querySelector('.menu-btn'), dr=d.querySelector('.drawer');
  if(mb&&dr){ mb.addEventListener('click',function(){ var o=dr.classList.toggle('open'); mb.setAttribute('aria-expanded',o); mb.textContent=o?'Close':'Menu'; }); }

  // Generic tab sets: [data-tabs] with buttons[role=tab][aria-controls]
  d.querySelectorAll('[data-tabs]').forEach(function(set){
    var tabs=[].slice.call(set.querySelectorAll('[role="tab"]'));
    var fill=set.querySelector('.fill');
    function sel(t,focus){
      tabs.forEach(function(x){ var on=x===t; x.setAttribute('aria-selected',on); x.tabIndex=on?0:-1; var p=d.getElementById(x.getAttribute('aria-controls')); if(p) p.hidden=!on; });
      if(fill){ var i=tabs.indexOf(t); fill.style.width=((i+1)/tabs.length*100)+'%'; }
      if(focus) t.focus();
    }
    tabs.forEach(function(t,i){
      t.addEventListener('click',function(){ sel(t); });
      t.addEventListener('keydown',function(e){
        var k=e.key, n=null;
        if(k==='ArrowRight'||k==='ArrowDown') n=tabs[(i+1)%tabs.length];
        if(k==='ArrowLeft'||k==='ArrowUp') n=tabs[(i-1+tabs.length)%tabs.length];
        if(n){ e.preventDefault(); sel(n,true); }
      });
    });
    var start=tabs.filter(function(t){return t.getAttribute('aria-selected')==='true';})[0]||tabs[0];
    var hash=location.hash.slice(1);
    tabs.forEach(function(t){ if(t.dataset.key && t.dataset.key===hash) start=t; });
    if(start) sel(start);
  });

  // Visit sequence: highlight step, swap photo
  var steps=d.querySelectorAll('.steps li[data-img]'), vp=d.querySelector('.visit-photo img'), vc=d.querySelector('.visit-photo .cap');
  if(steps.length&&vp&&'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){
          steps.forEach(function(s){s.classList.remove('on');});
          e.target.classList.add('on');
          var src=e.target.dataset.img;
          if(vp.getAttribute('src')!==src){ vp.style.opacity=0; setTimeout(function(){ vp.src=src; vp.alt=e.target.dataset.alt||''; if(vc) vc.textContent=e.target.dataset.cap||''; vp.style.opacity=1; },180); }
        }
      });
    },{rootMargin:'-45% 0px -45% 0px'});
    steps.forEach(function(s){io.observe(s);});
  }

  // Lite YouTube
  d.querySelectorAll('button.vid[data-yt]').forEach(function(b){
    b.addEventListener('click',function(){
      var f=d.createElement('iframe');
      f.src='https://www.youtube-nocookie.com/embed/'+b.dataset.yt+'?autoplay=1&rel=0';
      f.title=b.getAttribute('aria-label')||'Video';
      f.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen=true;
      b.innerHTML=''; b.appendChild(f); b.style.cursor='default';
    },{once:true});
  });

  // Conditions finder
  var q=d.getElementById('cq');
  if(q){
    var fbtns=[].slice.call(d.querySelectorAll('.filters button')), region='all';
    var blocks=[].slice.call(d.querySelectorAll('.region-block')), empty=d.querySelector('.empty');
    function apply(){
      var v=q.value.trim().toLowerCase(), any=false;
      blocks.forEach(function(b){
        var show=0;
        b.querySelectorAll('.cond').forEach(function(c){
          var ok=(!v||c.textContent.toLowerCase().indexOf(v)>-1);
          c.hidden=!ok; if(ok) show++;
        });
        b.hidden=!(show && (region==='all'||b.dataset.region===region));
        if(!b.hidden) any=true;
      });
      if(empty) empty.style.display=any?'none':'block';
    }
    q.addEventListener('input',apply);
    fbtns.forEach(function(b){ b.addEventListener('click',function(){ region=b.dataset.f; fbtns.forEach(function(x){x.setAttribute('aria-pressed',x===b);}); apply(); }); });
    var h=location.hash.slice(1); fbtns.forEach(function(b){ if(b.dataset.f===h){ b.click(); }});
  }

  // Story wall filter
  var sf=d.querySelectorAll('[data-sf]');
  if(sf.length){
    sf.forEach(function(b){ b.addEventListener('click',function(){
      var f=b.dataset.sf; sf.forEach(function(x){x.setAttribute('aria-pressed',x===b);});
      d.querySelectorAll('.wall .story').forEach(function(s){ s.hidden=!(f==='all'||(' '+s.dataset.tags+' ').indexOf(' '+f+' ')>-1); });
    });});
  }

  // Preselect video visit from #video
  if(location.hash==='#video'){ var vr=d.querySelector('input[name="type"][value="video"]'); if(vr) vr.checked=true; }

  // Concept forms
  d.querySelectorAll('form[data-concept]').forEach(function(f){
    f.addEventListener('submit',function(e){ e.preventDefault(); f.classList.add('sent'); var done=f.querySelector('.done'); if(done){ done.setAttribute('tabindex','-1'); done.focus(); } });
  });

  // Language toggle (international page)
  var lb=d.querySelectorAll('.lang button');
  function setLang(l){ d.documentElement.lang=l; lb.forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.lang===l); }); }
  if(lb.length){
    lb.forEach(function(b){ b.addEventListener('click',function(){ setLang(b.dataset.lang); try{ history.replaceState(null,'',b.dataset.lang==='es'?'?lang=es':location.pathname); }catch(e){} }); });
    if(/[?&]lang=es/.test(location.search)) setLang('es');
  }

  // Maps
  if(window.L){
    var tiles='https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    var attr='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    function icon(c){ return L.divIcon({className:'',html:'<div class="pin '+(c||'')+'"></div>',iconSize:[22,22],iconAnchor:[11,11]}); }

    var lm=d.getElementById('map-local');
    if(lm){
      var m=L.map(lm,{scrollWheelZoom:false,zoomControl:true}).setView([25.8045,-80.312],13);
      L.tileLayer(tiles,{attribution:attr,maxZoom:19}).addTo(m);
      var pts=[
        [25.808423,-80.329762,'home','<b>Badia Hand to Shoulder Center</b><br>3650 NW 82nd Ave, Suite 103, Doral<br>The Surgery Center at Doral is in the same building.'],
        [25.808484,-80.327789,'','<b>Hyatt Place Miami Airport West</b><br>3655 NW 82nd Ave, across the street. Partner rate.'],
        [25.810424,-80.328075,'','<b>AC Hotel by Marriott Miami Airport West/Doral</b><br>8091 NW 36th St. Partner rate.'],
        [25.797897,-80.335864,'','<b>InterContinental at Doral Miami</b><br>2505 NW 87th Ave. Partner rate.'],
        [25.794979,-80.286723,'air','<b>Miami International Airport (MIA)</b>']
      ];
      var b=[];
      pts.forEach(function(p){ L.marker([p[0],p[1]],{icon:icon(p[2]),title:p[3].replace(/<[^>]+>/g,' ')}).addTo(m).bindPopup(p[3]); b.push([p[0],p[1]]); });
      m.fitBounds(b,{padding:[40,40]});
    }

    var wm=d.getElementById('map-world');
    if(wm){
      var w=L.map(wm,{scrollWheelZoom:false,worldCopyJump:true,minZoom:2}).setView([12,-55],2);
      L.tileLayer(tiles,{attribution:attr,maxZoom:8}).addTo(w);
      var miami=[25.8084,-80.3298];
      L.marker(miami,{icon:icon('home'),title:'Miami/Doral'}).addTo(w).bindPopup('<b>Badia Hand to Shoulder Center</b><br>Miami/Doral, Florida');
      var C=[["Argentina",-34.6,-58.4],["The Bahamas",25.05,-77.35],["Barbados",13.1,-59.6],["Brazil",-15.8,-47.9],["Bolivia",-16.5,-68.15],["Canada",45.4,-75.7],["Cayman Islands",19.3,-81.38],["Chile",-33.45,-70.67],["Colombia",4.71,-74.07],["Curaçao",12.11,-68.93],["Dominican Republic",18.49,-69.93],["Ecuador",-0.18,-78.47],["El Salvador",13.69,-89.22],["France",48.86,2.35],["Ghana",5.6,-0.19],["Guatemala",14.63,-90.51],["Haiti",18.54,-72.34],["Honduras",14.07,-87.19],["India",28.61,77.21],["Jamaica",18.0,-76.79],["Mexico",19.43,-99.13],["Panama",8.98,-79.52],["Paraguay",-25.26,-57.58],["Peru",-12.05,-77.04],["Spain",40.42,-3.7],["Suriname",5.85,-55.2],["Trinidad and Tobago",10.65,-61.5],["United Kingdom",51.5,-0.13],["Venezuela",10.49,-66.88],["Virgin Islands",18.34,-64.93]];
      C.forEach(function(c){
        L.polyline([miami,[c[1],c[2]]],{color:'#1b8e96',weight:1.2,opacity:.45}).addTo(w);
        L.marker([c[1],c[2]],{icon:icon(''),title:c[0]}).addTo(w).bindPopup('<b>'+c[0]+'</b>');
      });
      w.fitBounds([[-35,-100],[52,78]],{padding:[10,10]});
    }
  }
})();
