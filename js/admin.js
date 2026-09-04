Bolao.Admin={
 async render(){
   if(Bolao.Auth.user.role!=='admin')return Bolao.App.navigate('dashboard');
   Bolao.App.content(`<div class="section-title"><h1>Administração</h1><span class="badge">Acesso administrativo</span></div><div class="grid"><div class="card"><h3>Apuração semanal</h3><label>Rodada<select id="score-week">${Array.from({length:18},(_,i)=>`<option>${i+1}</option>`).join('')}</select></label><button id="process-week">Apurar rodada</button><p class="muted">Somente jogos finalizados serão processados. É possível reprocessar.</p></div><div class="card"><h3>Participantes</h3><div class="metric" id="user-count">...</div><p class="muted">Participantes ativos cadastrados</p></div><div class="card"><h3>Status</h3><div id="process-status">Aguardando apuração.</div></div></div><div class="card" style="margin-top:16px" id="users">Carregando participantes...</div>`);
   document.querySelector('#process-week').onclick=()=>this.processWeek(+document.querySelector('#score-week').value);
   await this.loadUsers();
 },
 async activeUsers(){
   const s=await Bolao.db.collection('users').get();
   return s.docs.map(d=>({uid:d.id,...d.data()})).filter(u=>u.active!==false);
 },
 async loadUsers(){
   try{const users=await this.activeUsers();document.querySelector('#user-count').textContent=users.length;document.querySelector('#users').innerHTML=`<h2>Participantes</h2><div class="table-wrap"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Função</th><th>Pago</th></tr></thead><tbody>${users.map(x=>`<tr><td>${x.name||''}</td><td>${x.email||''}</td><td>${x.role||'player'}</td><td>${x.paid?'Sim':'Não'}</td></tr>`).join('')}</tbody></table></div>`}catch(e){document.querySelector('#users').textContent='Erro: '+e.message}
 },
 async processWeek(week){
   const btn=document.querySelector('#process-week'),status=document.querySelector('#process-status');btn.disabled=true;status.textContent='Consultando resultados e palpites...';
   try{
     const games=(await Bolao.ESPN.games(week,2)).filter(g=>g.completed&&g.home.score!==g.away.score);
     if(!games.length)throw Error('Nenhum jogo finalizado foi encontrado nesta rodada.');
     const users=await this.activeUsers();if(!users.length)throw Error('Nenhum participante ativo encontrado.');
     const userPicks={};
     for(const user of users){
       userPicks[user.uid]={};
       for(const game of games){
         const id=`${BOLAO_CONFIG.season}_${week}_${game.id}`;
         const d=await Bolao.db.collection('userPredictions').doc(user.uid).collection('games').doc(id).get();
         if(d.exists)userPicks[user.uid][game.id]=d.data();
       }
     }
     const gameStats={};
     for(const game of games){
       const result=Bolao.Scoring.result(game),submitted=users.map(u=>userPicks[u.uid][game.id]).filter(Boolean);
       const winnerHits=submitted.filter(p=>p.winner===result.winner).length;
       const difficultyHits=submitted.filter(p=>p.winner===result.winner&&p.difficulty===result.difficulty).length;
       const denominator=users.length;
       gameStats[game.id]={result,submitted:submitted.length,winnerHits,difficultyHits,winnerPct:denominator?winnerHits*100/denominator:0,difficultyPct:denominator?difficultyHits*100/denominator:0};
     }
     const scores=users.map(user=>{
       const details=games.map(game=>{const st=gameStats[game.id],pick=userPicks[user.uid][game.id]||null,sc=Bolao.Scoring.scoreGame(pick,game,st.winnerPct,st.difficultyPct);return {gameId:game.id,away:game.away.abbr,home:game.home.abbr,result:st.result,pick:pick?{winner:pick.winner,difficulty:pick.difficulty}:null,winnerPct:+st.winnerPct.toFixed(2),difficultyPct:+st.difficultyPct.toFixed(2),...sc}});
       return {uid:user.uid,name:user.name||user.email,weekPoints:+details.reduce((s,x)=>s+x.total,0).toFixed(2),winnerHits:details.filter(x=>x.winnerCorrect).length,difficultyHits:details.filter(x=>x.difficultyCorrect).length,details};
     });
     const batch=Bolao.db.batch(),roundId=`${BOLAO_CONFIG.season}_${week}`;
     batch.set(Bolao.db.collection('roundResults').doc(roundId),{season:BOLAO_CONFIG.season,week,seasonType:2,gamesProcessed:games.length,gameStats,scores,processedBy:Bolao.Auth.user.uid,processedAt:firebase.firestore.FieldValue.serverTimestamp()});
     for(const s of scores)batch.set(Bolao.db.collection('roundScores').doc(`${roundId}_${s.uid}`),{season:BOLAO_CONFIG.season,week,userId:s.uid,userName:s.name,points:s.weekPoints,winnerHits:s.winnerHits,difficultyHits:s.difficultyHits,processedAt:firebase.firestore.FieldValue.serverTimestamp()});
     await batch.commit();
     status.innerHTML=`<b>Rodada ${week} apurada.</b><br>${games.length} jogos finalizados e ${users.length} participantes.`;Bolao.App.toast('Apuração concluída');
   }catch(e){status.textContent='Erro: '+e.message;Bolao.App.toast('Falha na apuração')}
   finally{btn.disabled=false}
 }
};