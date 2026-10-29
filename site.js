const esc = value => String(value ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const date = value => value ? value.slice(0,10).split('-').reverse().join('/') : '';
const meta = item => '<div class="meta"><span class="category">'+esc(item.category)+'</span>'+(item.date?'<time datetime="'+esc(item.date)+'">'+date(item.date)+'</time>':'')+'</div>';
const tags = item => item.tags.length?'<div class="tags" aria-label="Tags">'+item.tags.map(t=>'<span class="tag">'+esc(t)+'</span>').join('')+'</div>':'';
const picture = item => '<img class="thumb" src="'+esc(item.image)+'" alt="'+esc(item.title)+'" width="640" height="360" loading="lazy" decoding="async">';
const card = item => '<article class="card"><a class="card-link" href="publicacao.html?id='+encodeURIComponent(item.slug)+'">'+picture(item)+'<div>'+meta(item)+'<h2 class="card-title">'+esc(item.title)+'</h2>'+tags(item)+'</div></a></article>';
const heading = '<h1>Achismos</h1><p>Sites, páginas e links “achados” por aí com o objetivo de estudo, análise ou curiosidade mesmo!</p><p class="byline">Curadoria por @cristianoweb da <a href="https://kamus.com.br/">Kamus</a></p>';
function youtube(url) {
 try {const u=new URL(url); let id=u.hostname==='youtu.be'?u.pathname.slice(1):/(^|\.)youtube\.com$/.test(u.hostname)?(u.searchParams.get('v')||u.pathname.match(/\/(?:shorts|embed)\/([^/]+)/)?.[1]):null; return /^[\w-]{11}$/.test(id||'')?id:null;}catch{return null;}
}
function player(item) {
 const id=youtube(item.video||item.source);
 if(!id)return '<img class="media" src="'+esc(item.image)+'" alt="'+esc(item.title)+'" width="1200" height="675">';
 return '<button class="media video-poster" data-video="'+id+'" aria-label="Reproduzir vídeo: '+esc(item.title)+'">'+picture(item)+'<span class="play" aria-hidden="true"><span>▶</span></span></button>';
}
async function render() {
 const main=document.getElementById('conteudo'),hero=document.getElementById('hero-inner');
 try{
 const response=await fetch('data.json');
 if(!response.ok)throw new Error('Dados indisponíveis');
 const items=await response.json(),params=new URLSearchParams(location.search);
 if(document.body.dataset.view==='publication'){
  const item=items.find(x=>x.slug===params.get('id')||x.id===params.get('id'));
  if(!item){hero.innerHTML='<h1>Publicação não encontrada</h1>';main.innerHTML='<p>Esta referência não está disponível.</p><a class="source" href="./">Voltar às referências</a>';return;}
  const page=Math.floor(items.indexOf(item)/10)+1,back='./?pagina='+page+'#conteudo';
  hero.innerHTML='<a class="back" href="'+back+'">Achismos</a><h1>'+esc(item.title)+'</h1>'+meta(item)+tags(item);
  main.innerHTML=player(item)+'<div class="description">'+item.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')+'</div>'+(/^https?:\/\//.test(item.source)?'<a class="source" href="'+esc(item.source)+'" target="_blank" rel="noopener noreferrer">Acessar fonte original ↗</a>':'')+'<div class="detail-bottom"><a class="back" href="'+back+'">← Voltar às referências</a></div>';
  document.title=item.title+' — Achismos';
  document.querySelector('meta[name="description"]').content=item.paragraphs.join(' ').slice(0,300);
  document.querySelector('meta[property="og:title"]').content=document.title;
  document.querySelector('meta[property="og:image"]').content=new URL(item.image,location.href).href;
  document.querySelector('link[rel="canonical"]').href=location.origin+'/publicacao.html?id='+encodeURIComponent(item.slug);
 }else{
  const total=Math.ceil(items.length/10),requested=Number(params.get('pagina')||1),page=Number.isFinite(requested)?Math.min(total,Math.max(1,Math.floor(requested))):1;
  hero.innerHTML=heading;
  let nav='<nav class="pagination" aria-label="Paginação">';
  const link=(p,label,current=false)=>'<a href="?pagina='+p+'#conteudo"'+(current?' aria-current="page"':'')+' aria-label="Página '+p+'">'+label+'</a>';
  if(page>1)nav+=link(page-1,'Anterior');
  const numbers=new Set([1,total,...Array.from({length:5},(_,i)=>page+i-2).filter(p=>p>=1&&p<=total)]);
  let last=0;
  for(const n of [...numbers].sort((a,b)=>a-b)){if(last&&n>last+1)nav+='<span class="ellipsis" aria-hidden="true">…</span>';nav+=link(n,n,n===page);last=n;}
  if(page<total)nav+=link(page+1,'Próxima');
  nav+='</nav><p class="page-status">Página '+page+' de '+total+'</p>';
  main.innerHTML='<div class="feed-head"><h2>Referências</h2></div>'+items.slice((page-1)*10,page*10).map(card).join('')+nav;
  document.title='Achismos'+(page>1?' — Página '+page:'');
 }
 document.querySelectorAll('[data-video]').forEach(button=>button.addEventListener('click',()=>{
  const frame=document.createElement('iframe');frame.src='https://www.youtube-nocookie.com/embed/'+button.dataset.video+'?autoplay=1';frame.title=button.getAttribute('aria-label');frame.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';frame.allowFullscreen=true;const wrapper=document.createElement('div');wrapper.className='media';wrapper.append(frame);button.replaceWith(wrapper);
 }));
 }catch(error){
  if(!main.querySelector('.card'))main.innerHTML='<p>Não foi possível carregar as referências.</p><a href="'+esc(location.href)+'">Tentar novamente</a>';
 }
}
const menuButton=document.querySelector('.menu-toggle'),nav=document.querySelector('.site-nav');
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
const subButton=document.querySelector('.submenu-toggle'),submenu=document.getElementById('other-blogs');
subButton.addEventListener('click',()=>{const open=subButton.getAttribute('aria-expanded')!=='true';subButton.setAttribute('aria-expanded',String(open));submenu.classList.toggle('open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){menuButton.setAttribute('aria-expanded','false');nav.classList.remove('open');subButton.setAttribute('aria-expanded','false');submenu.classList.remove('open');}});
document.addEventListener('click',event=>{if(!event.target.closest('.has-submenu')){subButton.setAttribute('aria-expanded','false');submenu.classList.remove('open');}});
render();
