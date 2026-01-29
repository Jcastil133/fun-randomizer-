/* script.js - Tabs + Fun Randomizer + Match Game (big celebration) */
(function(){
  // short selectors
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const id = s => document.getElementById(s);

  // tabs
  const tabBtns = $$('.tab-btn');
  tabBtns.forEach(b=>{
    b.addEventListener('click', ()=>{
      tabBtns.forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      const target = b.dataset.target;
      $$('.pane').forEach(p=>p.classList.remove('active'));
      const pane = id(target);
      if(pane) pane.classList.add('active');
    });
  });

  // confetti canvas
  const confettiCanvas = id('confetti');
  const ctx = confettiCanvas.getContext && confettiCanvas.getContext('2d');

  function resizeCanvas(){ confettiCanvas.width = window.innerWidth; confettiCanvas.height = window.innerHeight; }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // --------- Randomizer (left pane) ----------
  const namesEl = id('names');
  const teamsCountEl = id('teamsCount');
  const teamSizeEl = id('teamSize');
  const shuffleBtn = id('shuffleBtn');
  const clearBtn = id('clearBtn');
  const randomNameBtn = id('randomNameBtn');
  const allowUneven = id('allowUneven');
  const results = id('results');

  // manual team elements
  const manualTeamName = id('manualTeamName');
  const addManualTeam = id('addManualTeam');
  const manualTeamsList = id('manualTeamsList');

  // demo names
  const demo = ['Ava','Ben','Carmen','Derek','Ethan','Faye','Gabe','Hannah','Ivy','Jason','Kira','Liam'];
  randomNameBtn.addEventListener('click', ()=> namesEl.value = demo.join('\n'));

  // team data (shared with match game)
  let teams = [];
  function cryptoId(){ return Math.random().toString(36).slice(2,9); }

  function resetTeamsLocal(){
    teams = [];
    renderTeamsCards();
    renderTeamSelect();
    manualTeamsList.innerHTML = '';
  }
  resetTeamsLocal();

  addManualTeam.addEventListener('click', ()=>{
    const name = manualTeamName.value.trim();
    if(!name) return alert('Enter a team name');
    teams.push({id:cryptoId(), name, members:[], sales:[], requiredSims:10, abilityCount:0, lastRemoved:false, isCaptain:false});
    manualTeamName.value='';
    renderManualList();
    renderTeamsCards();
    renderTeamSelect();
  });

  function renderManualList(){
    manualTeamsList.innerHTML = '';
    teams.forEach(t=>{
      const d = document.createElement('div');
      d.style.marginBottom='6px';
      d.innerHTML = `<strong>${t.name}</strong> — required:${t.requiredSims} • sales:${t.sales.length}`;
      manualTeamsList.appendChild(d);
    });
  }

  function shuffleArr(a){
    for(let i=a.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  function createTeams(){
    const raw = namesEl.value.split('\n').map(s=>s.trim()).filter(Boolean);
    if(raw.length===0){ alert('Add at least one name.'); return; }
    const teamsCount = parseInt(teamsCountEl.value,10) || 4;
    const names = shuffleArr(raw.slice());

    teams = Array.from({length:teamsCount}, (_,i)=>({id:cryptoId(), name:`Team ${i+1}`, members:[], sales:[], requiredSims:10, abilityCount:0, lastRemoved:false, isCaptain:false}));

    if(!allowUneven.checked){
      let idx = 0;
      for(let i=0;i<names.length;i++){
        teams[idx].members.push(names[i]);
        idx = (idx+1) % teamsCount;
      }
    } else {
      for(let i=0;i<names.length;i++){
        teams[i % teamsCount].members.push(names[i]);
      }
    }

    renderTeamsCards();
    renderTeamSelect();
    renderManualList();
    bigCelebrateSmall();
  }
  shuffleBtn.addEventListener('click', createTeams);
  clearBtn.addEventListener('click', ()=>{ namesEl.value=''; results.innerHTML=''; teams=[]; renderTeamSelect(); manualTeamsList.innerHTML=''; });

  function renderTeamsCards(){
    results.innerHTML = '';
    teams.forEach((t,i)=>{
      const el = document.createElement('div');
      el.className = 'team';
      el.innerHTML = `<div class="badge">T${i+1}</div>
        <div>
          <div style="font-weight:800;margin-bottom:8px">${t.name} ${t.isCaptain? '• Captain' : ''}</div>
          <div class="members">${t.members.map(m=>`<div class="member">${m}</div>`).join('')}</div>
          <div style="margin-top:8px;font-size:13px;color:var(--muted)">Req: ${t.requiredSims} • Abilities: ${t.abilityCount} • Sales: ${t.sales.length}</div>
        </div>`;
      results.appendChild(el);
    });
  }

  function renderTeamSelect(){ 
    const sel = id('teamSelect');
    if(!sel) return;
    sel.innerHTML = '';
    if(teams.length===0){ const o = document.createElement('option'); o.value=''; o.innerText='— no teams —'; sel.appendChild(o); return; }
    teams.forEach((t,i)=>{
      const o = document.createElement('option'); o.value=t.id; o.innerText = `${t.name} (Req:${t.requiredSims} Ab:${t.abilityCount})`; sel.appendChild(o);
    });
  }

  // --------- Match Game logic ----------
  const tilesContainer = id('tiles');
  const revealRandom = id('revealRandom');
  const resetTiles = id('resetTiles');
  const teamSelect = id('teamSelect');
  const saleSize = id('saleSize');
  const recordSale = id('recordSale');
  const removeTileBtn = id('removeTileBtn');
  const puzzleAnswerEl = id('puzzleAnswer');
  const guessInput = id('guessInput');
  const submitGuess = id('submitGuess');
  const gameLog = id('gameLog');
  const matchInfo = id('matchInfo');

  const TILE_COUNT = 9;
  let tileState = [];
  function buildTiles(){
    tilesContainer.innerHTML = '';
    tileState = Array.from({length:TILE_COUNT}, (_,i)=>({revealed:false, content:`PUZZLE PART ${i+1}`}));
    tileState.forEach((t,i)=>{
      const el = document.createElement('div');
      el.className = 'tile';
      el.dataset.index = i;
      el.innerHTML = `<div>Tile ${i+1}</div>`;
      el.addEventListener('click', ()=> tileClick(i));
      tilesContainer.appendChild(el);
    });
    log('Tiles reset.');
    updateMatchInfo();
  }

  function tileClick(i){
    if(tileState[i].revealed) return;
    alert('Tiles reveal via Remove Tile (consume ability) or Reveal Random Tile.');
  }

  // helper: get selected team object
  function getSelectedTeam(){ const idv = teamSelect.value; return teams.find(t=>t.id===idv); }

  // record sale
  recordSale.addEventListener('click', ()=>{
    const t = getSelectedTeam();
    if(!t) return alert('Select a team first');
    const s = parseInt(saleSize.value,10);
    if(isNaN(s) || s<=0) return alert('Enter a sale size (number)');
    t.sales.push({size:s, time:Date.now()});
    if(s >= t.requiredSims){
      t.abilityCount += 1;
      log(`${t.name} recorded a qualifying sale of ${s} sims → +1 tile removal ability`);
    } else {
      log(`${t.name} recorded a sale of ${s} sims (needs single-sale ≥ ${t.requiredSims})`);
    }
    saleSize.value='';
    renderTeamsCards();
    renderTeamSelect();
    updateMatchInfo();
  });

  // remove tile (consumes ability)
  removeTileBtn.addEventListener('click', ()=>{
    const t = getSelectedTeam();
    if(!t) return alert('Select a team first');
    if(t.abilityCount <= 0){
      alert(`${t.name} has no removal abilities. Need a qualifying single sale ≥ ${t.requiredSims}.`);
      return;
    }
    const unrevealed = tileState.map((s,i)=>s.revealed?null:i).filter(x=>x!==null);
    if(unrevealed.length===0){ alert('All tiles revealed.'); return; }
    const sel = unrevealed[Math.floor(Math.random()*unrevealed.length)];
    revealTile(sel, t, true);
  });

  function revealTile(i, teamObj, consumedByTeam){
    tileState[i].revealed = true;
    const el = tilesContainer.querySelector(`.tile[data-index="${i}"]`);
    if(!el) return;
    el.classList.add('revealed');
    el.innerHTML = `<div style="text-align:center"><div style="font-size:12px;color:#6b6b6b">Revealed</div><div style="font-weight:800;margin-top:8px">${tileState[i].content}</div></div>`;
    if(consumedByTeam){
      teamObj.abilityCount = Math.max(0, teamObj.abilityCount - 1);
      teamObj.lastRemoved = true;
      log(`${teamObj.name} removed a tile (consumed ability). They may guess now.`);
      renderTeamsCards();
      renderTeamSelect();
      updateMatchInfo();
      // small confetti for removal
      shootConfetti(26);
    } else {
      log('A tile was revealed (random).');
      shootConfetti(12);
    }
  }

  // reveal random tile (no ability consumption)
  revealRandom.addEventListener('click', ()=>{
    const unrevealed = tileState.map((s,i)=>s.revealed?null:i).filter(x=>x!==null);
    if(unrevealed.length===0) return;
    const sel = unrevealed[Math.floor(Math.random()*unrevealed.length)];
    revealTile(sel, null, false);
  });

  // reset
  resetTiles.addEventListener('click', ()=>{
    buildTiles();
    teams.forEach(t=>t.lastRemoved=false);
    renderTeamsCards();
    renderTeamSelect();
  });

  // guess handling
  submitGuess.addEventListener('click', ()=>{
    const t = getSelectedTeam();
    if(!t) return alert('Select a team first');
    if(!t.lastRemoved) return alert('A team must remove a tile this round before they are allowed to guess.');
    const guess = guessInput.value.trim();
    if(!guess) return alert('Enter a guess.');
    let puzzleAnswer = (puzzleAnswerEl.value || '').trim();
    if(!puzzleAnswer) puzzleAnswer = 'MAGENTA'; // fallback demo
    if(guess.toLowerCase() === puzzleAnswer.toLowerCase()){
      log(`${t.name} guessed correctly! Winner: ${t.name}`);
      t.isCaptain = true;
      renderTeamsCards();
      renderTeamSelect();
      // big celebration
      bigCelebrate();
      // reveal remaining tiles
      tileState.forEach((tile,i)=>{ if(!tile.revealed) revealTile(i, null, false); });
      alert(`${t.name} guessed correctly — they win and will be captains for the next game!`);
    } else {
      t.requiredSims = t.requiredSims * 2;
      t.lastRemoved = false;
      log(`${t.name} guessed incorrectly. Required sims doubled to ${t.requiredSims}.`);
      renderTeamsCards();
      renderTeamSelect();
      updateMatchInfo();
      alert(`Incorrect guess. ${t.name}'s required sims doubled to ${t.requiredSims}.`);
    }
    guessInput.value='';
  });

  // logging helper
  function log(msg){
    const ts = new Date().toLocaleTimeString();
    if(gameLog) gameLog.innerHTML = `<div>[${ts}] ${escapeHtml(msg)}</div>` + gameLog.innerHTML;
  }
  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

  function updateMatchInfo(){
    if(!matchInfo) return;
    const total = teams.length;
    const unrevealed = tileState.filter(t=>!t.revealed).length;
    matchInfo.innerText = `Teams: ${total} • Tiles remaining: ${unrevealed}`;
  }

  // -------- confetti (small and large bursts) --------
  function shootConfetti(particles=40){
    if(!ctx) return;
    const W = confettiCanvas.width;
    const H = confettiCanvas.height;
    const pieces = [];
    const colors = ['#E20074','#FF7AB6','#FFD9EE','#6b6b6b','#FFFFFF'];

    for(let i=0;i<particles;i++){
      pieces.push({
        x: Math.random()*W,
        y: Math.random()*H*0.15,
        vx: (Math.random()-0.5)*8,
        vy: 2+Math.random()*8,
        size: 6+Math.random()*12,
        color: colors[Math.floor(Math.random()*colors.length)],
        rot: Math.random()*360,
        drot: (Math.random()-0.5)*12,
        life: 1 + Math.random()*1.5
      });
    }

    let t0 = performance.now();
    function frame(now){
      const dt = (now - t0)/1000;
      t0 = now;
      ctx.clearRect(0,0,W,H);
      for(let p of pieces){
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.rot += p.drot;
        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate(p.rot * Math.PI/180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
        ctx.restore();
      }
      // remove ones that are past bottom
      const alive = pieces.filter(p=>p.y < H + 40);
      if(alive.length>0) requestAnimationFrame(frame);
      else ctx.clearRect(0,0,W,H);
    }
    requestAnimationFrame(frame);
  }

  // BIG celebration (longer, many particles and horizontal spread)
  function bigCelebrate(){
    if(!ctx) return;
    const W = confettiCanvas.width;
    const H = confettiCanvas.height;
    const pieces = [];
    const colors = ['#E20074','#FF7AB6','#FFD9EE','#6b6b6b','#FFFFFF','#FFC0E6','#FF5BA1'];

    const particles = 300; // big burst
    for(let i=0;i<particles;i++){
      const angle = Math.random()*Math.PI - Math.PI/2; // upward spread
      const speed = 6 + Math.random()*18;
      pieces.push({
        x: W/2 + (Math.random()-0.5)*200,
        y: H*0.6 + (Math.random()-0.5)*120,
        vx: Math.cos(angle)*speed + (Math.random()-0.5)*6,
        vy: Math.sin(angle)*speed - (4 + Math.random()*6),
        size: 6+Math.random()*12,
        color: colors[Math.floor(Math.random()*colors.length)],
        rot: Math.random()*360,
        drot: (Math.random()-0.5)*14
      });
    }

    let t0 = performance.now();
    function frame(now){
      const dt = (now - t0)/1000;
      t0 = now;
      ctx.clearRect(0,0,W,H);
      for(let p of pieces){
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rot += p.drot;
        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate(p.rot * Math.PI/180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
        ctx.restore();
      }
      const alive = pieces.filter(p=>p.y < H + 60);
      if(alive.length>0) requestAnimationFrame(frame);
      else ctx.clearRect(0,0,W,H);
    }
    requestAnimationFrame(frame);
    // also a second smaller burst for oomph
    setTimeout(()=> shootConfetti(80), 220);
  }

  // smaller celebratory pop used for team creation
  function bigCelebrateSmall(){ bigCelebrate(); }

  // --------- init ---------
  function init(){
    if(!namesEl.value.trim()) namesEl.value = 'Alex\nBailey\nCam\nDiego\nEvelyn\nFrank';
    buildTiles();
    renderTeamsCards();
    renderTeamSelect();
    renderManualList();
    updateMatchInfo();
  }
  init();

})();
