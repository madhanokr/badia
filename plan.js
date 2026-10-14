(function(){
  var d=document, w=window, html=d.documentElement;
  var reduce=w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G=w.gsap, ST=w.ScrollTrigger, motion=html.classList.contains('motion')&&!!G;
  function $(s,c){return (c||d).querySelector(s);} function $$(s,c){return [].slice.call((c||d).querySelectorAll(s));}
  var SEARCH='<svg aria-hidden="true" class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

  /* 1. Live autocomplete in the hero */
  var td=$('#type-data'), typed=$('.pl-search .typed'), sugs=$('.pl-search .sugs');
  if(td&&typed&&sugs){
    var seq=JSON.parse(td.textContent), si=0;
    function render(item,n){
      sugs.innerHTML=item.s.map(function(s){
        var rest=s.indexOf(item.t)===0?s.slice(item.t.length):s, head=s.indexOf(item.t)===0?item.t:'';
        return '<li>'+SEARCH+'<span>'+esc(head)+'<b>'+esc(rest)+'</b></span></li>';
      }).join('');
      $$('li',sugs).forEach(function(li,k){ if(n===undefined||k<n) setTimeout(function(){li.classList.add('in');},k*70); });
    }
    if(reduce){ typed.textContent=seq[0].t; render(seq[0]); }
    else{
      var run=function(){
        var item=seq[si%seq.length], i=0; sugs.innerHTML='';
        var tick=setInterval(function(){
          i++; typed.textContent=item.t.slice(0,i);
          if(i===Math.min(4,item.t.length)) render(item,2);
          if(i>=item.t.length){ clearInterval(tick); render(item);
            setTimeout(function(){
              $$('li',sugs).forEach(function(li){li.classList.remove('in');});
              var del=setInterval(function(){ i--; typed.textContent=item.t.slice(0,i); if(i<=0){ clearInterval(del); si++; setTimeout(run,260);} },22);
            },2600);
          }
        },62);
      };
      setTimeout(run,900);
    }
  }

  /* 2. News rail: pinned horizontal on desktop */
  var rail=$('[data-rail]'), track=rail&&$('.news-track',rail);
  if(rail&&track&&motion&&ST&&w.matchMedia('(min-width: 1024px)').matches){
    var dist=function(){return Math.max(0,track.scrollWidth-w.innerWidth);};
    var sec=rail.closest('section');
    G.to(track,{x:function(){return -dist();},ease:'none',scrollTrigger:{trigger:sec,start:'top top',end:function(){return '+='+dist();},pin:true,scrub:.6,invalidateOnRefresh:true,anticipatePin:1}});
    G.from($$('.news',track),{y:40,opacity:0,duration:1,stagger:.06,ease:'power3.out',scrollTrigger:{trigger:sec,start:'top 70%',once:true}});
  }

  /* 3. Horizontal bars */
  $$('[data-bars]').forEach(function(ul){
    $$('.bar i',ul).forEach(function(i,k){ i.style.transitionDelay=(k*70)+'ms'; });
    if('IntersectionObserver' in w){ var io=new IntersectionObserver(function(es){ if(es[0].isIntersecting){ ul.classList.add('on'); io.disconnect(); } },{threshold:.3}); io.observe(ul); } else ul.classList.add('on');
  });

  /* 4. Stacked chart */
  var cd=$('#chart-data'), box=$('[data-chart]');
  if(cd&&box){
    var data=JSON.parse(cd.textContent), svg=$('svg',box), tip=$('.tip',box), legend=$('[data-legend]'), view='pages', shown=false;
    var tot=$('[data-total]'), totl=$('[data-total-l]');
    var NS='http://www.w3.org/2000/svg';
    function el(n,a,p){ var e=d.createElementNS(NS,n); for(var k in a) e.setAttribute(k,a[k]); if(p) p.appendChild(e); return e; }
    function nice(v){ var steps=[10,20,25,50,100]; var mag=Math.pow(10,Math.floor(Math.log10(v))-1); for(var i=0;i<steps.length;i++){ var s=steps[i]*mag; if(v/s<=5) return Math.ceil(v/s)*s; } return v; }
    function draw(animate){
      var set=data[view], W=box.clientWidth, H=box.clientHeight, m={l:44,r:8,t:28,b:36};
      svg.setAttribute('viewBox','0 0 '+W+' '+H); svg.innerHTML='';
      var n=data.months.length, totals=data.months.map(function(_,i){ return set.vals.reduce(function(a,v){return a+v[i];},0); });
      var max=nice(Math.max.apply(null,totals)), ih=H-m.t-m.b, iw=W-m.l-m.r, band=iw/n, bw=Math.min(84,band*.56);
      var y=function(v){return m.t+ih-(v/max)*ih;};
      var g=el('g',{'class':'grid'},svg);
      for(var k=0;k<=4;k++){ var v=max/4*k; el('line',{x1:m.l,x2:W-m.r,y1:y(v),y2:y(v)},g); var t=el('text',{x:m.l-10,y:y(v)+4,'text-anchor':'end'},g); t.textContent=Math.round(v); }
      var rects=[];
      data.months.forEach(function(mo,i){
        var col=el('g',{'class':'col'},svg), x=m.l+band*i+(band-bw)/2, acc=0;
        el('rect',{'class':'hit',x:m.l+band*i,y:m.t,width:band,height:ih},col);
        set.vals.forEach(function(vals,ci){
          var v=vals[i]; if(!v) return;
          var r=el('rect',{x:x,width:bw,y:y(acc+v),height:Math.max(0,y(acc)-y(acc+v)-1.5),rx:Math.min(6,bw/8),fill:set.colors[ci]},col);
          rects.push({r:r,y:y(acc+v),h:Math.max(0,y(acc)-y(acc+v)-1.5),base:y(0)}); acc+=v;
        });
        var tt=el('text',{'class':'tot',x:x+bw/2,y:y(totals[i])-10,'text-anchor':'middle'},col); tt.textContent=totals[i];
        var ml=el('text',{'class':'mo',x:x+bw/2,y:H-10,'text-anchor':'middle'},col); ml.textContent=mo;
        col.addEventListener('mousemove',function(e){
          var r=box.getBoundingClientRect(); tip.hidden=false;
          tip.innerHTML='<b>'+mo+' · '+totals[i]+' total</b>'+set.names.map(function(nm,ci){ return set.vals[ci][i]?'<div><i class="cdot" style="--c:'+set.colors[ci]+'"></i>'+esc(nm)+'<span>'+set.vals[ci][i]+'</span></div>':''; }).join('');
          var tx=Math.min(Math.max(e.clientX-r.left,130),r.width-130); tip.style.left=tx+'px'; tip.style.top=(e.clientY-r.top-14)+'px';
        });
        col.addEventListener('mouseleave',function(){ tip.hidden=true; });
        if(animate&&motion){ G.from(tt,{opacity:0,y:'+=10',duration:.6,delay:.5+i*.12}); }
      });
      if(animate&&motion){
        rects.forEach(function(o,k){ o.r.setAttribute('y',o.base); o.r.setAttribute('height',0); });
        G.to(rects.map(function(o){return o.r;}),{attr:{y:function(k){return rects[k].y;},height:function(k){return rects[k].h;}},duration:1.1,ease:'power3.out',stagger:.025});
      }
      legend.innerHTML=set.names.map(function(nm,ci){ return '<li><i class="cdot" style="--c:'+set.colors[ci]+'"></i>'+esc(nm)+'</li>'; }).join('');
      var final=totals[n-1];
      if(tot){ if(motion&&animate){ var o={v:0}; G.to(o,{v:final,duration:1.4,ease:'power3.out',onUpdate:function(){tot.textContent=Math.round(o.v);}}); } else tot.textContent=final; }
      if(totl) totl.textContent=view==='pages'?'pages by April 2027':'pieces by April 2027';
    }
    function show(){ if(shown) return; shown=true; draw(true); }
    if('IntersectionObserver' in w&&motion){ var cio=new IntersectionObserver(function(es){ if(es[0].isIntersecting){ show(); cio.disconnect(); } },{threshold:.35}); cio.observe(box); } else show();
    $$('[data-view]').forEach(function(b){ b.addEventListener('click',function(){ view=b.dataset.view; $$('[data-view]').forEach(function(x){x.setAttribute('aria-selected',x===b);}); shown=true; draw(true); }); });
    var rt; w.addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(function(){ if(shown) draw(false); },150); });
  }

  /* 5. Calendar: months, cluster and language filters */
  var cal=$('[data-cal]');
  if(cal){
    var tabs=$$('.cal-tabs [role="tab"]',cal), cf='all', lf='all';
    function apply(anim){
      $$('.cal-panel',cal).forEach(function(p){
        var vis=0; $$('.rows li',p).forEach(function(li){ var ok=(cf==='all'||li.dataset.c===cf)&&(lf==='all'||li.dataset.lang===lf); li.hidden=!ok; if(ok) vis++; });
        $('.empty-m',p).hidden=vis>0;
        var t=d.getElementById(p.getAttribute('aria-labelledby')); if(t) $('span:last-child',t).textContent=vis+(vis===1?' page':' pages');
      });
      var cur=$('.cal-panel:not([hidden])',cal);
      if(anim&&motion&&cur) G.fromTo($$('.rows li:not([hidden])',cur),{y:18,opacity:0},{y:0,opacity:1,duration:.55,stagger:.035,ease:'power3.out',clearProps:'transform,opacity'});
      if(ST) ST.refresh();
    }
    function sel(t,focus){
      tabs.forEach(function(x){ var on=x===t; x.setAttribute('aria-selected',on); x.tabIndex=on?0:-1; d.getElementById(x.getAttribute('aria-controls')).hidden=!on; });
      if(focus) t.focus();
      var p=d.getElementById(t.getAttribute('aria-controls'));
      if(motion){ G.fromTo($('.cal-head',p),{y:16,opacity:0},{y:0,opacity:1,duration:.6,ease:'power3.out',clearProps:'transform,opacity'}); }
      apply(true);
      if(t.scrollIntoView&&w.matchMedia('(max-width:1080px)').matches){ var bar=t.parentNode; bar.scrollTo({left:t.offsetLeft-bar.clientWidth/2+t.clientWidth/2,behavior:reduce?'auto':'smooth'}); }
    }
    tabs.forEach(function(t,i){
      t.addEventListener('click',function(){ sel(t); });
      t.addEventListener('keydown',function(e){ var n=null; if(e.key==='ArrowRight') n=tabs[(i+1)%tabs.length]; if(e.key==='ArrowLeft') n=tabs[(i-1+tabs.length)%tabs.length]; if(n){ e.preventDefault(); sel(n,true); } });
    });
    $$('[data-cf]',cal).forEach(function(b){ b.addEventListener('click',function(){ cf=b.dataset.cf; $$('[data-cf]',cal).forEach(function(x){x.setAttribute('aria-pressed',x===b);}); apply(true); }); });
    $$('[data-lf]',cal).forEach(function(b){ b.addEventListener('click',function(){ lf=b.dataset.lf; $$('[data-lf]',cal).forEach(function(x){x.setAttribute('aria-pressed',x===b);}); apply(true); }); });
  }

  /* 6. Section highlight in the top bar */
  var links=$$('.pl-links a');
  if(links.length&&'IntersectionObserver' in w){
    var map={}; links.forEach(function(a){ map[a.getAttribute('href').slice(1)]=a; });
    var sio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ links.forEach(function(a){a.classList.remove('on');}); var a=map[e.target.id]; if(a) a.classList.add('on'); } }); },{rootMargin:'-45% 0px -50% 0px'});
    Object.keys(map).forEach(function(id){ var s=d.getElementById(id); if(s) sio.observe(s); });
  }
})();
