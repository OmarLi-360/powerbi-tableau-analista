/* ======================================================================
   Mini biblioteca de gráficos SVG para la sección «Gráficos para informes».
   Cada función devuelve el SVG como texto. Los colores salen de los tokens
   del tema (--s1, --s2, --s3...), así funcionan en modo claro y oscuro.
   ====================================================================== */
const G = (()=>{
  const W = 480, SER = ["var(--s1)","var(--s2)","var(--s3)"];
  const t = (x,y,txt,o={})=>`<text x="${x}" y="${y}" ${o.anchor?`text-anchor="${o.anchor}"`:""} class="${o.cls||""}" style="font-size:${o.size||11}px;${o.bold?"font-weight:600;":""}${o.fill?`fill:${o.fill};`:""}">${esc(txt)}</text>`;
  const svg = (h, body, label)=>`<svg viewBox="0 0 ${W} ${h}" role="img" aria-label="${esc(label||"Gráfico")}">${body}</svg>`;
  const tip = s => `<title>${esc(s)}</title>`;
  const nice = v => { if(v<=0) return 1; const p=Math.pow(10,Math.floor(Math.log10(v))); const n=v/p; return (n<=1?1:n<=2?2:n<=2.5?2.5:n<=5?5:10)*p };
  const grid = (x0,x1,y0,y1,max,n,fmt,horizontal)=>{
    let s=""; for(let i=0;i<=n;i++){ const v=max*i/n;
      if(horizontal){ const x=x0+(x1-x0)*i/n; s+=`<line x1="${x}" x2="${x}" y1="${y0}" y2="${y1}" stroke="var(--grid)"/>`+t(x,y1+14,fmt(v),{anchor:"middle",cls:"axis",size:10}) }
      else { const y=y1-(y1-y0)*i/n; s+=`<line x1="${x0}" x2="${x1}" y1="${y}" y2="${y}" stroke="var(--grid)"/>`+t(x0-6,y+3,fmt(v),{anchor:"end",cls:"axis",size:10}) } }
    return s;
  };
  const legend = (names, colors, y=12, x0=0)=>{ let x=x0, s=""; names.forEach((n,i)=>{ s+=`<rect x="${x}" y="${y-9}" width="10" height="10" rx="2" fill="${colors[i]}"/>`+t(x+14,y,n,{size:11}); x+=24+n.length*6.2 }); return s };

  return {
    /* Barras horizontales ordenadas; resalta la primera */
    barrasH(items, o={}){
      const fmt=o.fmt||nf.format, lw=o.lw||110, rw=78, rh=24, top=6, h=top+items.length*rh+22;
      const max=nice(Math.max(...items.map(d=>d.v))), sx=v=>v/max*(W-lw-rw);
      let s=grid(lw, lw+(W-lw-rw), top, top+items.length*rh, max, 4, o.ejeFmt||(v=>fmt(v)), true);
      items.forEach((d,i)=>{ const y=top+i*rh, w=Math.max(2,sx(d.v));
        s+=`<g>${tip(`${d.k}: ${fmt(d.v)}`)}<rect x="${lw}" y="${y+5}" width="${w}" height="${rh-10}" rx="3" fill="${i===(o.resaltar??0)?"var(--s1)":"var(--s0)"}"/>`
          +t(lw-6,y+rh/2+4,d.k,{anchor:"end"})+t(lw+w+5,y+rh/2+4,fmt(d.v),{cls:"axis"})+`</g>` });
      return svg(h,s,o.label);
    },
    /* Columnas agrupadas: categorías × series */
    columnasAgrupadas(cats, series, o={}){
      const fmt=o.fmt||nf.format, l=46, r=8, top=26, b=24, h=230, ch=h-top-b;
      const max=nice(Math.max(...series.flatMap(s=>s.v))), gw=(W-l-r)/cats.length, bw=Math.min(22,(gw-10)/series.length);
      let s=legend(series.map(x=>x.n), series.map((x,i)=>x.c||SER[i]), 12, l)+grid(l,W-r,top,top+ch,max,4,o.ejeFmt||fmt,false);
      cats.forEach((c,ci)=>{ const x0=l+ci*gw+(gw-bw*series.length-2*(series.length-1))/2;
        series.forEach((se,si)=>{ const v=se.v[ci], hh=v/max*ch, x=x0+si*(bw+2);
          s+=`<rect x="${x}" y="${top+ch-hh}" width="${bw}" height="${hh}" rx="2" fill="${se.c||SER[si]}">${tip(`${c} · ${se.n}: ${fmt(v)}`)}</rect>` });
        s+=t(l+ci*gw+gw/2, h-8, c.length>11?c.slice(0,10)+"…":c, {anchor:"middle",size:10}) });
      return svg(h,s,o.label);
    },
    /* Líneas: eje X ordenado (tiempo) */
    lineas(xl, series, o={}){
      const fmt=o.fmt||nf.format, l=46, r=40, top=26, b=22, h=220, ch=h-top-b;
      const all=series.flatMap(s=>s.v), mn=o.desdeCero?0:Math.min(...all)*0.9, max=nice(Math.max(...all));
      const sx=i=>l+i*(W-l-r)/(xl.length-1), sy=v=>top+ch-(v-mn)/(max-mn)*ch;
      let s=legend(series.map(x=>x.n), series.map((x,i)=>x.c||SER[i]), 12, l);
      for(let i=0;i<=4;i++){ const v=mn+(max-mn)*i/4, y=sy(v); s+=`<line x1="${l}" x2="${W-r}" y1="${y}" y2="${y}" stroke="var(--grid)"/>`+t(l-6,y+3,(o.ejeFmt||fmt)(v),{anchor:"end",cls:"axis",size:10}) }
      xl.forEach((x,i)=>{ s+=t(sx(i),h-6,x,{anchor:"middle",cls:"axis",size:10}) });
      series.forEach((se,si)=>{ const c=se.c||SER[si];
        s+=`<polyline fill="none" stroke="${c}" stroke-width="2" points="${se.v.map((v,i)=>`${sx(i)},${sy(v)}`).join(" ")}"/>`;
        se.v.forEach((v,i)=>{ s+=`<circle cx="${sx(i)}" cy="${sy(v)}" r="3" fill="${c}" stroke="var(--surface)" stroke-width="1.5">${tip(`${se.n} · ${xl[i]}: ${fmt(v)}`)}</circle>` });
        const last=se.v.length-1; s+=t(sx(last)+6, sy(se.v[last])+4, se.n, {size:10, bold:true}) });
      return svg(h,s,o.label);
    },
    /* Barras apiladas al 100 % */
    apiladas100(rows, partes, o={}){
      const l=48, r=8, top=26, rh=34, h=top+rows.length*rh+18;
      let s=legend(partes, partes.map((_,i)=>SER[i]), 12, l);
      rows.forEach((row,ri)=>{ const tot=row.v.reduce((a,b)=>a+b,0); let x=l; const y=top+ri*rh;
        s+=t(l-6,y+rh/2+3,row.k,{anchor:"end",size:11});
        row.v.forEach((v,pi)=>{ const w=v/tot*(W-l-r);
          s+=`<rect x="${x}" y="${y+4}" width="${Math.max(0,w-2)}" height="${rh-10}" fill="${SER[pi]}">${tip(`${row.k} · ${partes[pi]}: ${pf.format(v/tot)}`)}</rect>`;
          if(w>34) s+=t(x+w/2-1,y+rh/2+3,Math.round(v/tot*100)+" %",{anchor:"middle",size:10.5,bold:true,fill:"var(--on-strong)"});
          x+=w });
      });
      return svg(h,s,o.label);
    },
    /* Anillo: solo para pocas partes */
    dona(items, o={}){
      const h=200, cx=100, cy=100, R=78, r0=48, tot=items.reduce((a,b)=>a+b.v,0); let a0=-Math.PI/2, s="";
      items.forEach((d,i)=>{ const a1=a0+d.v/tot*Math.PI*2, gap=0.012;
        const p=(a,rr)=>`${cx+rr*Math.cos(a)},${cy+rr*Math.sin(a)}`, big=(a1-a0)>Math.PI?1:0;
        s+=`<path d="M${p(a0+gap,R)} A${R},${R} 0 ${big} 1 ${p(a1-gap,R)} L${p(a1-gap,r0)} A${r0},${r0} 0 ${big} 0 ${p(a0+gap,r0)} Z" fill="${SER[i]||"var(--s0)"}">${tip(`${d.k}: ${pf.format(d.v/tot)}`)}</path>`;
        a0=a1 });
      s+=t(cx,cy-2,o.centro||"",{anchor:"middle",size:15,bold:true})+t(cx,cy+15,o.centroSub||"",{anchor:"middle",cls:"axis",size:10});
      items.forEach((d,i)=>{ const y=60+i*26; s+=`<rect x="230" y="${y-10}" width="12" height="12" rx="2" fill="${SER[i]||"var(--s0)"}"/>`+t(250,y,`${d.k} · ${pf.format(d.v/tot)}`,{size:12}) });
      return svg(h,s,o.label);
    },
    /* Histograma */
    histograma(vals, o={}){
      const bins=o.bins||12, l=40, r=8, top=10, b=34, h=210, ch=h-top-b;
      const mx=o.max||Math.max(...vals), bw=mx/bins, cnt=new Array(bins).fill(0);
      vals.forEach(v=>{ cnt[Math.min(bins-1,Math.floor(v/bw))]++ });
      const ymax=nice(Math.max(...cnt)), cw=(W-l-r)/bins;
      let s=grid(l,W-r,top,top+ch,ymax,4,nf.format,false);
      cnt.forEach((c,i)=>{ const hh=c/ymax*ch; s+=`<rect x="${l+i*cw+1}" y="${top+ch-hh}" width="${cw-2}" height="${hh}" fill="var(--s2)">${tip(`${o.fmt(i*bw)} – ${o.fmt((i+1)*bw)}: ${nf.format(c)} facturas`)}</rect>` });
      for(let i=0;i<=bins;i+=Math.ceil(bins/6)) s+=t(l+i*cw,top+ch+14,o.fmt(i*bw),{anchor:"middle",cls:"axis",size:10});
      s+=t((W+l)/2,h-4,o.xlab||"",{anchor:"middle",cls:"axis",size:10.5});
      return svg(h,s,o.label);
    },
    /* Dispersión */
    dispersion(pts, o={}){
      const l=46, r=12, top=10, b=34, h=230, ch=h-top-b;
      const xmax=nice(Math.max(...pts.map(p=>p.x))), ymin=Math.floor(Math.min(...pts.map(p=>p.y))*20)/20, ymax=Math.ceil(Math.max(...pts.map(p=>p.y))*20)/20;
      const sx=v=>l+v/xmax*(W-l-r), sy=v=>top+ch-(v-ymin)/(ymax-ymin)*ch;
      let s=""; for(let i=0;i<=4;i++){ const v=ymin+(ymax-ymin)*i/4, y=sy(v); s+=`<line x1="${l}" x2="${W-r}" y1="${y}" y2="${y}" stroke="var(--grid)"/>`+t(l-6,y+3,o.fy(v),{anchor:"end",cls:"axis",size:10}) }
      for(let i=0;i<=4;i++){ const v=xmax*i/4; s+=t(sx(v),top+ch+14,o.fx(v),{anchor:"middle",cls:"axis",size:10}) }
      pts.forEach(p=>{ s+=`<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="5.5" fill="var(--s1)" fill-opacity=".8" stroke="var(--surface)" stroke-width="1.5">${tip(`${p.k}: ${o.fx(p.x)} · ${o.fy(p.y)}`)}</circle>` });
      s+=t((W+l)/2,h-4,o.xlab,{anchor:"middle",cls:"axis",size:10.5})+t(l,top-1,"",{});
      return svg(h,s,o.label);
    },
    /* Mapa de calor: opacidad del color principal según el valor */
    calor(filas, cols, M, o={}){
      const l=86, top=18, cw=(W-l-4)/cols.length, rh=22, h=top+filas.length*rh+4;
      const max=Math.max(...M.flat()), min=Math.min(...M.flat());
      let s=""; cols.forEach((c,j)=>{ s+=t(l+j*cw+cw/2,12,c,{anchor:"middle",cls:"axis",size:9.5}) });
      filas.forEach((f,i)=>{ s+=t(l-6,top+i*rh+rh/2+4,f,{anchor:"end",size:10.5});
        cols.forEach((c,j)=>{ const v=M[i][j], a=.12+.88*(v-min)/(max-min);
          s+=`<rect x="${l+j*cw+1}" y="${top+i*rh+1}" width="${cw-2}" height="${rh-2}" rx="2" fill="var(--s1)" fill-opacity="${a.toFixed(2)}">${tip(`${f} · ${c}: ${o.fmt(v)}`)}</rect>`;
          if(cw>30) s+=t(l+j*cw+cw/2,top+i*rh+rh/2+4,o.corto(v),{anchor:"middle",size:9,fill:a>.55?"var(--on-strong)":"var(--ink)"}) }) });
      return svg(h,s,o.label);
    },
    /* Pareto en un solo eje de porcentaje: barra = aporte del grupo, línea = acumulado */
    pareto(grupos, o={}){
      const l=40, r=10, top=14, b=40, h=230, ch=h-top-b, n=grupos.length, cw=(W-l-r)/n;
      const sy=v=>top+ch-v*ch; let acc=0, pts=[], s="";
      for(let i=0;i<=4;i++){ const v=i/4, y=sy(v); s+=`<line x1="${l}" x2="${W-r}" y1="${y}" y2="${y}" stroke="var(--grid)"/>`+t(l-6,y+3,Math.round(v*100)+" %",{anchor:"end",cls:"axis",size:10}) }
      s+=`<line x1="${l}" x2="${W-r}" y1="${sy(.8)}" y2="${sy(.8)}" stroke="var(--s3)" stroke-dasharray="4 3"/>`+t(W-r,sy(.8)-4,"80 %",{anchor:"end",size:10,fill:"var(--s3)"});
      grupos.forEach((g,i)=>{ acc+=g.v; const x=l+i*cw;
        s+=`<rect x="${x+2}" y="${sy(g.v)}" width="${cw-4}" height="${g.v*ch}" fill="var(--s1)">${tip(`${g.k}: aporta ${pf.format(g.v)}`)}</rect>`;
        pts.push(`${x+cw/2},${sy(acc)}`); s+=t(x+cw/2,top+ch+14,g.k,{anchor:"middle",cls:"axis",size:9.5}) });
      s+=`<polyline fill="none" stroke="var(--s3)" stroke-width="2" points="${pts.join(" ")}"/>`;
      pts.forEach((p,i)=>{ const [x,y]=p.split(","); s+=`<circle cx="${x}" cy="${y}" r="3" fill="var(--s3)"/>` });
      s+=t((W+l)/2,h-6,o.xlab||"",{anchor:"middle",cls:"axis",size:10.5});
      return svg(h,s,o.label);
    },
    /* Tarjeta KPI */
    kpi(items){
      const h=110, cw=W/items.length; let s="";
      items.forEach((k,i)=>{ const x=i*cw+6;
        s+=`<rect x="${x}" y="6" width="${cw-12}" height="${h-12}" rx="8" fill="var(--surface-2)" stroke="var(--line)"/>`
          +t(x+12,28,k.et,{cls:"axis",size:10.5})+t(x+12,62,k.v,{size:22,bold:true})
          +t(x+12,86,k.d,{size:11,bold:true,fill:k.bien===undefined?"var(--muted)":k.bien?"var(--good)":"var(--bad)"}) });
      return svg(h,s,"Indicadores");
    },
    /* Real contra meta: barra real + marcador de meta + % de cumplimiento */
    realMeta(items, o={}){
      const lw=96, rw=70, rh=26, top=18, h=top+items.length*rh+22;
      const max=nice(Math.max(...items.flatMap(d=>[d.real,d.meta]))*1.05), sx=v=>v/max*(W-lw-rw);
      let s=legend(["Real","Meta"],["var(--s1)","var(--ink)"],10,lw);
      items.forEach((d,i)=>{ const y=top+i*rh, c=d.real/d.meta, ok=c>=1;
        s+=t(lw-6,y+rh/2+4,d.k,{anchor:"end"})
          +`<rect x="${lw}" y="${y+6}" width="${sx(d.real)}" height="${rh-12}" rx="3" fill="var(--s1)">${tip(`${d.k}: real ${mill(d.real)} · meta ${mill(d.meta)}`)}</rect>`
          +`<line x1="${lw+sx(d.meta)}" x2="${lw+sx(d.meta)}" y1="${y+2}" y2="${y+rh-2}" stroke="var(--ink)" stroke-width="2.5"/>`
          +t(W-rw+8,y+rh/2+4,(ok?"✓ ":"✗ ")+pf.format(c),{bold:true,fill:ok?"var(--good)":"var(--bad)"}) });
      return svg(h,s,o.label);
    },
    /* Cascada: de un total a otro explicando las variaciones */
    cascada(pasos, o={}){
      const l=50, r=8, top=12, b=40, h=240, ch=h-top-b, n=pasos.length, cw=(W-l-r)/n;
      let run=0, lo=Infinity, hi=0; pasos.forEach(p=>{ run = p.total ? p.v : run+p.v; lo=Math.min(lo,run); hi=Math.max(hi,run) });
      const mn=Math.floor(lo*0.8/1e9)*1e9, mx=nice(hi*1.04), sy=v=>top+ch-(v-mn)/(mx-mn)*ch;
      let s=""; for(let i=0;i<=4;i++){ const v=mn+(mx-mn)*i/4, y=sy(v); s+=`<line x1="${l}" x2="${W-r}" y1="${y}" y2="${y}" stroke="var(--grid)"/>`+t(l-6,y+3,o.ejeFmt(v),{anchor:"end",cls:"axis",size:10}) }
      run=0; pasos.forEach((p,i)=>{ const x=l+i*cw+3, w=cw-6; let y0,y1,c;
        if(p.total){ y0=sy(p.v); y1=sy(mn); c="var(--s0)"; run=p.v } else { const a=run, b2=run+p.v; y0=sy(Math.max(a,b2)); y1=sy(Math.min(a,b2)); c=p.v>=0?"var(--good)":"var(--bad)"; run=b2 }
        s+=`<rect x="${x}" y="${y0}" width="${w}" height="${Math.max(1,y1-y0)}" rx="2" fill="${c}">${tip(`${p.k}: ${p.total?o.fmt(p.v):(p.v>=0?"+":"")+o.fmt(p.v)}`)}</rect>`;
        s+=t(x+w/2,y0-4,p.total?o.corto(p.v):(p.v>=0?"+":"")+o.corto(p.v),{anchor:"middle",size:9.5,bold:p.total});
        s+=t(x+w/2,top+ch+14,p.k.length>10?p.k.slice(0,9)+"…":p.k,{anchor:"middle",cls:"axis",size:9.5}) });
      return svg(h,s,o.label);
    },
  };
})();

/* Barras horizontales con tooltip flotante (simulador de tablas dinámicas) */
function drawBars(el, bars, fmt, sorted, title){
  const W=520, lw=118, rw=92, rh=24, top=26, H=top+bars.length*rh+6;
  const max=Math.max(...bars.map(b=>b.v||0))||1, sx=v=>(v/max)*(W-lw-rw);
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(title)}">
    <text x="0" y="14" class="axis" style="font-size:12px">${esc(title)}</text>
    ${bars.map((b,i)=>{ const y=top+i*rh, w=Math.max(2,sx(b.v||0)); return `<g data-i="${i}">
      <rect x="0" y="${y}" width="${W}" height="${rh}" fill="transparent"></rect>
      <text x="${lw-8}" y="${y+rh/2+4}" text-anchor="end" style="font-size:12px">${esc(b.k.length>16?b.k.slice(0,15)+"…":b.k)}</text>
      <rect x="${lw}" y="${y+4}" width="${w}" height="${rh-8}" rx="4" fill="${i===0&&sorted?"var(--s2)":"var(--s1)"}"></rect>
      <text x="${lw+w+6}" y="${y+rh/2+4}" class="axis" style="font-size:11.5px">${fmt(b.v)}</text></g>` }).join("")}
  </svg><div class="tip-pop" hidden></div>`;
  const tipEl=el.querySelector(".tip-pop");
  el.querySelectorAll("g[data-i]").forEach(g=>{
    g.onmousemove=e=>{ const b=bars[+g.dataset.i], r=el.getBoundingClientRect(); tipEl.hidden=false; tipEl.textContent=`${b.k}: ${fmt(b.v)}`; tipEl.style.left=(e.clientX-r.left)+"px"; tipEl.style.top=(e.clientY-r.top)+"px" };
    g.onmouseleave=()=>tipEl.hidden=true;
  });
}
