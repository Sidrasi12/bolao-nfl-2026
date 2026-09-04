Bolao.Ranking={
 async render(){
   Bolao.App.content(`<div class="section-title"><h1>Ranking</h1><select id="rank-mode" style="width:190px"><option value="general">Classificação geral</option>${Array.from({length:18},(_,i)=>`<option value="${i+1}">Rodada ${i+1}</option>`).join('')}</select></div><div class="card" id="ranking">Carregando...</div>`);
   document.querySelector('#rank-mode').onchange=e=>this.load(e.target.value);await this.load('general');
 },
 async load(mode){
   const box=document.querySelector('#ranking');box.textContent='Carregando...';
   try{
     const usersSnap=await Bolao.db.collection('users').get(),users=usersSnap.docs.map(d=>({uid:d.id,...d.data()})).filter(u=>u.active!==false),scoresSnap=await Bolao.db.collection('roundScores').where('season','==',BOLAO_CONFIG.season).get();
     const all=scoresSnap.docs.map(d=>d.data());let rows;
     if(mode==='general')rows=users.map(u=>{const ss=all.filter(x=>x.userId===u.uid);return{uid:u.uid,name:u.name||u.email,points:+ss.reduce((a,x)=>a+(x.points||0),0).toFixed(2),winnerHits:ss.reduce((a,x)=>a+(x.winnerHits||0),0),difficultyHits:ss.reduce((a,x)=>a+(x.difficultyHits||0),0)}});
     else rows=users.map(u=>{const x=all.find(s=>s.userId===u.uid&&s.week===+mode);return{uid:u.uid,name:u.name||u.email,points:x?.points||0,winnerHits:x?.winnerHits||0,difficultyHits:x?.difficultyHits||0}});
     rows.sort((a,b)=>b.points-a.points||b.winnerHits-a.winnerHits||b.difficultyHits-a.difficultyHits||a.name.localeCompare(b.name,'pt-BR'));
     box.innerHTML=`<div class="table-wrap"><table><thead><tr><th>#</th><th>Participante</th><th>Pontos</th><th>Vencedores</th><th>VD/VF</th></tr></thead><tbody>${rows.map((r,i)=>`<tr class="${r.uid===Bolao.Auth.user.uid?'me':''}"><td class="rank">${i+1}</td><td>${r.name}</td><td><b>${r.points.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</b></td><td>${r.winnerHits}</td><td>${r.difficultyHits}</td></tr>`).join('')}</tbody></table></div>${all.length?'':'<p class="muted">Nenhuma rodada foi apurada até o momento.</p>'}`;
   }catch(e){box.textContent='Erro ao carregar o ranking: '+e.message}
 }
};