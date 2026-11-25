// V5.1: recupero password prima dell'apertura della community.
const incomingHash = new URLSearchParams(location.hash.slice(1));
const incomingQuery = new URLSearchParams(location.search);
const recoveryKey = 'urban-freeride-password-recovery';
function readRecovery(){try{return sessionStorage.getItem(recoveryKey)}catch{return null}}
function rememberRecovery(id){try{if(id)sessionStorage.setItem(recoveryKey,id);else sessionStorage.removeItem(recoveryKey)}catch{}}
const recoveryLink = incomingHash.get('type')==='recovery' || incomingQuery.get('type')==='recovery' || incomingQuery.has('code');
const linkError = incomingHash.has('error') || incomingQuery.has('error');
let recoveryMode = recoveryLink || linkError || !!readRecovery();
let recoveryUser = recoveryLink || linkError ? null : readRecovery();
if(recoveryLink || linkError)rememberRecovery(null);
const db=supabase.createClient('https://mkfkhlwnuoacriytuill.supabase.co','sb_publishable_HTMWG2SoCELXh0Xt0nn2hA_kef37OnU');
const $=id=>document.getElementById(id), E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let me,spots=[],media=[],map,markers;const admin=document.body.dataset.admin==='yes';
async function q(p){const r=await p;if(r.error)throw Error(r.error.message);return r.data}function msg(t){$('message').textContent=t}function run(fn){return async e=>{e?.preventDefault();try{await fn(e)}catch(x){msg(x.message)}}}function go(id){document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id===id));if(id==='screen-map')setTimeout(drawMap,100);if(id==='screen-activity')run(rank)();}async function boot(){const {data:{session},error}=await db.auth.getSession();if(recoveryMode){showRecovery();if(error||linkError||(!session&&!recoveryUser)){recoveryUnavailable()}else if(recoveryUser&&session?.user.id!==recoveryUser){recoveryUser=null;rememberRecovery(null);recoveryUnavailable()}else if(recoveryUser){showRecovery()}return;}if(error)throw Error(error.message);if(!session)return;me=await q(db.from('riders').select('*').eq('id',session.user.id).maybeSingle());if(recoveryMode){showRecovery();return;}if(!me?.active||admin&&me.role!=='admin'){await db.auth.signOut();throw Error('Account non autorizzato')} $('login').hidden=true;$('phone').hidden=false;$('who').textContent=me.nickname;await refresh()}
async function refresh(){spots=await q(db.from('spots').select('*').order('created_at',{ascending:false}));media=await q(db.from('media').select('*').order('created_at',{ascending:false}));if(admin)return review();$('spot-choice').innerHTML='<option value="">Nessuno spot</option>'+spots.filter(s=>s.status==='approved').map(s=>`<option value="${s.id}">${E(s.name)}</option>`).join('');$('post-list').innerHTML='';for(const m of media.filter(x=>x.status==='approved'||x.author_id===me.id)){const a=document.createElement('article');a.className='post';a.innerHTML=`<div class="post-header"><b>${E(m.caption||'Foto rider')}</b><small>${E(m.status)}</small></div>`;if(m.media_type==='photo'){const {data,error}=await db.storage.from('rider-photos').createSignedUrl(m.media_url,60);if(!error){const im=document.createElement('img');im.src=data.signedUrl;im.style.width='100%';a.append(im)}}else{a.append(document.createTextNode('Video esterni non abilitati nella beta'))}const comments=await q(db.from('comments').select('content,status').eq('media_id',m.id));for(const c of comments){const p=document.createElement('p');p.textContent=c.content+' · '+c.status;a.append(p)}if(m.status==='approved'){const f=document.createElement('form');f.innerHTML='<input required maxlength="2000" placeholder="Commento da moderare"><button>Invia</button><button type="button">Mi piace</button>';f.onsubmit=run(async()=>{await q(db.from('comments').insert({author_id:me.id,media_id:m.id,content:f.elements[0].value}));await refresh()});f.elements[2].onclick=run(async()=>{await q(db.from('likes').upsert({rider_id:me.id,media_id:m.id},{ignoreDuplicates:true}));msg('Mi piace registrato')});a.append(f)}$('post-list').append(a)}if(!$('post-list').children.length)$('post-list').textContent='Nessuna foto ancora. Pubblica il primo contenuto!';$('own').textContent=spots.filter(s=>s.author_id===me.id).length;const flags=await q(db.from('conquests').select('id').eq('rider_id',me.id));$('flags').textContent=flags.length;$('admin-link').hidden=me.role!=='admin';}
function drawMap(){if(!window.L)return msg('Mappa non disponibile');if(!map){map=L.map('leaflet-map').setView([42.417,12.105],14);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);markers=L.layerGroup().addTo(map)}map.invalidateSize();markers.clearLayers();for(const s of spots.filter(x=>x.status==='approved')){const p=document.createElement('div');p.innerHTML=`<b>${E(s.name)}</b><p>${E(s.description)}</p><a target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}&travelmode=walking">Indicazioni</a><br><button>Richiedi bandiera</button>`;p.querySelector('button').onclick=run(async()=>{await q(db.rpc('request_flag',{target:s.id}));msg('Richiesta inviata al moderatore')});L.marker([s.latitude,s.longitude]).addTo(markers).bindPopup(p)}}
async function rank(){const rows=await q(db.rpc('beta_ranking',{scope:$('scope').value,territory:$('territory').value,monthly:$('monthly').checked}));$('ranking-rows').innerHTML=rows.map((r,i)=>`<div class="ranking-row"><b>${i+1}</b><span>${E(r.nickname)}</span><strong>🚩 ${r.flags}</strong></div>`).join('')||'Nessuna conquista approvata'}
async function review(){const requests=await q(db.from('flag_requests').select('*'));const comments=await q(db.from('comments').select('*'));$('queue').replaceChildren();for(const [table,rows] of [['spots',spots],['media',media],['comments',comments],['flag_requests',requests]])for(const x of rows.filter(x=>x.status==='pending')){const a=document.createElement('article');a.className='post';a.innerHTML=`<h3>${E(table)}</h3><p>${E(x.name||x.caption||x.content||spots.find(s=>s.id===x.spot_id)?.name||x.id)}</p>`;if(table==='media'&&x.media_type==='photo'){const u=await q(db.storage.from('rider-photos').createSignedUrl(x.media_url,60));const im=document.createElement('img');im.src=u.signedUrl;im.style.maxWidth='100%';a.append(im)}const reason=document.createElement('input');reason.placeholder='Motivazione';a.append(reason);for(const status of ['approved','rejected']){const b=document.createElement('button');b.textContent=status==='approved'?'Approva':'Respingi';b.onclick=run(async()=>{if(!reason.value.trim())throw Error('Motivazione obbligatoria');await q(db.rpc('beta_moderate',{kind:table,target:x.id,decision:status,why:reason.value}));await refresh()});a.append(b)}$('queue').append(a)}const log=await q(db.from('moderation_log').select('*').order('created_at',{ascending:false}).limit(100));$('log').innerHTML=log.map(x=>`<p>${E(x.content_type)} · ${E(x.decision)} · ${E(x.reason)}</p>`).join('');}
function showRecovery(){
  $('login').hidden=true;$('phone').hidden=true;$('recovery').hidden=false;
  $('recovery-form').hidden=!recoveryUser;
  $('recovery-info').textContent=recoveryUser?'Scegli e conferma la nuova password.':'Verifica del link di recupero in corso…';
}
function recoveryUnavailable(){
  $('recovery-form').hidden=true;
  $('recovery-info').textContent='Link non valido o scaduto. Torna al login e richiedine uno nuovo.';
}
function cleanAuthUrl(){history.replaceState(null,'',location.pathname)}
function returnToLogin(){recoveryMode=false;recoveryUser=null;rememberRecovery(null);cleanAuthUrl();$('recovery-form').reset();$('recovery').hidden=true;$('phone').hidden=true;$('login').hidden=false;}
if(recoveryMode){showRecovery();if(linkError)recoveryUnavailable();setTimeout(()=>{if(recoveryMode&&!recoveryUser)recoveryUnavailable()},5000)}
// Non chiamare altre API Supabase dentro il callback di autenticazione.
db.auth.onAuthStateChange((event,session)=>{
  if(event==='PASSWORD_RECOVERY'&&session?.user){
    recoveryMode=true;recoveryUser=session.user.id;rememberRecovery(recoveryUser);showRecovery();cleanAuthUrl();msg('');
  }
});
$('forgot-password').onclick=run(async()=>{
  const email=$('email');if(!email.reportValidity())return;
  const button=$('forgot-password');button.disabled=true;
  try{await q(db.auth.resetPasswordForEmail(email.value.trim(),{redirectTo:new URL('./',location.href).href}));msg('Se l’account è abilitato, riceverai un link di recupero via email.')}finally{button.disabled=false}
});
$('cancel-recovery').onclick=run(async()=>{const {session}=await q(db.auth.getSession());if(session)await q(db.auth.signOut({scope:'local'}));returnToLogin();msg('Puoi richiedere un nuovo link di recupero.');});
$('recovery-form').onsubmit=run(async()=>{
  if(!recoveryMode||!recoveryUser)throw Error('Richiedi un nuovo link di recupero.');
  const password=$('new-password').value;
  if(password.length<12)throw Error('Usa almeno 12 caratteri.');
  if(password!==$('confirm-password').value)throw Error('Le password non coincidono.');
  const button=$('save-password');button.disabled=true;
  try{
    const {session}=await q(db.auth.getSession());
    if(session?.user.id!==recoveryUser)throw Error('Sessione di recupero scaduta. Richiedi un nuovo link.');
    await q(db.auth.updateUser({password}));
    $('recovery-form').reset();
    const {error}=await db.auth.signOut({scope:'local'});
    if(error){msg('Password modificata. Non è stato possibile chiudere la sessione: riprova con Torna al login.');return;}
    returnToLogin();msg('Password modificata. Accedi con la nuova password.');
  }finally{button.disabled=false}
});
$('login-form').onsubmit=run(async()=>{await q(db.auth.signInWithPassword({email:$('email').value,password:$('password').value}));$('password').value='';await boot()});$('logout').onclick=run(async()=>{await db.auth.signOut();location.reload()});$('refresh').onclick=run(refresh);if(!admin){document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go('screen-'+b.dataset.go));$('rank-go').onclick=run(rank);$('spot-form').onsubmit=run(async()=>{const f=$('spot-form');await q(db.from('spots').insert({author_id:me.id,name:f.n.value,description:f.d.value,category:f.c.value,city:f.city.value,province:f.province.value,region:'Lazio',latitude:Number(f.lat.value),longitude:Number(f.lng.value)}));f.reset();msg('Spot inviato in moderazione');await refresh()});$('gps').onclick=()=>navigator.geolocation.getCurrentPosition(p=>{$('spot-form').lat.value=p.coords.latitude;$('spot-form').lng.value=p.coords.longitude},e=>msg(e.message));$('photo-form').onsubmit=run(async()=>{const file=$('photo').files[0];if(!file)throw Error('Scegli una foto');const bitmap=await createImageBitmap(file);const c=document.createElement('canvas'),scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));c.width=Math.round(bitmap.width*scale);c.height=Math.round(bitmap.height*scale);c.getContext('2d').drawImage(bitmap,0,0,c.width,c.height);bitmap.close();const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.82));if(!blob||blob.size>5000000)throw Error('Foto troppo grande');const path=me.id+'/'+crypto.randomUUID()+'.jpg';await q(db.storage.from('rider-photos').upload(path,blob,{contentType:'image/jpeg'}));await q(db.from('media').insert({author_id:me.id,spot_id:$('spot-choice').value||null,media_type:'photo',media_url:path,caption:$('caption').value}));msg('Foto in moderazione');await refresh()})}run(boot)();
