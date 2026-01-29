/* script.js - Fun Randomizer
   Drop into fun-randomizer/script.js
*/
(function(){
  // ---- utilities ----
  const q = sel => document.querySelector(sel);
  const id = sel => document.getElementById(sel);

  function shuffleArray(a){
    for(let i=a.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  // ---- elements ----
  const namesEl = id('names');
  const teamsCountEl = id('teamsCount');
  const teamSizeEl = id('teamSize');
  const shuffleBtn = id('shuffleBtn');
  const clearBtn = id('clearBtn');
  const randomNameBtn = id('randomNameBtn');
  const allowUneven = id('allowUneven');
  const results = id('results');

  // tiles
  const tilesContainer = id('tiles');
  const revealRandom = id('revealRandom');
  const resetTiles = id('resetTiles');

  // confetti canvas
  const confettiCanvas = id('confetti');
  const ctx = confettiCanvas.getContext && confettiCanvas.getContext('2d');

  // Resize confetti canvas
  function resizeCanvas(){
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // ---- demo random names ----
  const demo = ['Ava','Ben','Carmen','Derek','Ethan','Faye','Gabe','Hannah','Ivy','Jason','Kira','Liam'];
  randomNameBtn.addEventListener('click',()=>{
    namesEl.value = demo.join('\n');
  });

  // ---- team generation ----
  function createTeams(){
    const raw = namesEl.value.split('\n').map(s => s.trim()).filter(Boolean);
    if(raw.length === 0){
      alert('Add at least one name.');
      return;
    }

    const teamsCount = parseInt(teamsCountEl.value,10) || 4;
    const teamSize = parseInt(teamSizeEl.value,10) || 2;
    const names = shuffleArray(raw.slice());

    // compute team distribution
    let teams = Array.from({length:teamsCount},()=>[]);
    let idx = 0;

    if(!allowUneven.checked){
      // try to enforce teamSize
      for(let i=0;i<names.length;i++){
        if(teams[idx].length < teamSize){
          teams[idx].push(names[i]);
        } else {
          idx = (idx+1) % teamsCount;
          teams[idx].push(names[i]);
        }
        idx = (idx+1) % teamsCount;
      }
    } else {
      // distribute evenly across teams
      for(let i=0;i<names.length;i++){
        teams[i % teamsCount].push(names[i]);
      }
    }

    // remove empty teams
    teams = teams.filter(t => t.length > 0);

    renderTeamsWithAnimation(teams);
  }

  function renderTeamsWithAnimation(teams){
    results.innerHTML = '';
    teams.forEach((members,i) => {
      const row = document.createElement('div');
      row.className = 'team';
      row.style.opacity = 0;
      row.style.transform = 'translateY(14px) scale(.98)';
      // badge
      const badge = document.createElement('div');
      badge.className = 'badge';
      badge.innerText = `T${i+1}`;

      const meta = document.createElement('div');
      const title = document.createElement('div');
      title.style.fontWeight = 800;
      title.style.marginBottom = '8px';
      title.innerText = `Team ${i+1} • ${members.length}`;

      const membersWrap = document.createElement('div');
      membersWrap.className = 'members';

      members.forEach(m=>{
        const mm = document.createElement('div');
        mm.className = 'member';
        mm.innerText = m;
        membersWrap.appendChild(mm);
      });

      meta.appendChild(title);
      meta.appendChild(membersWrap);

      row.appendChild(badge);
      row.appendChild(meta);

      results.appendChild(row);

      // simple stagger animation
      setTimeout(()=>{
        row.style.transition = 'all 560ms cubic-bezier(.2,.9,.3,1)';
        row.style.opacity = 1;
        row.style.transform = 'translateY(0) scale(1)';
      }, 120 * i);
    });

    // confetti celebration when done
    setTimeout(()=>shootConfetti(80), 600 + teams.length * 120);
  }

  shuffleBtn.addEventListener('click', createTeams);

  clearBtn.addEventListener('click', ()=>{
    namesEl.value = '';
    results.innerHTML = '';
  });

  // ---- simple tile "match game" ----
  const TILE_COUNT = 8;
  let tileState = [];

  function buildTiles(){
    tilesContainer.innerHTML = '';
    tileState = Array.from({length:TILE_COUNT}, (_,i)=>({revealed:false, text:`PRIZE ${i+1}`}));
    tileState.forEach((t,i)=>{
      const el = document.createElement('div');
      el.className = 'tile';
      el.dataset.index = i;
      el.innerHTML = `<div class="tile-inner">Tile ${i+1}</div>`;
      el.addEventListener('click', ()=>toggleTile(i, el));
      tilesContainer.appendChild(el);
    });
  }

  function toggleTile(i, el){
    if(tileState[i].revealed) return;
    tileState[i].revealed = true;
    el.classList.add('revealed');
    el.innerHTML = `<div style="text-align:center"><div style="font-size:13px;color:#6b6b6b">Revealed:</div><div style="font-weight:800;margin-top:6px">${tileState[i].text}</div></div>`;
    // small celebration
    shootConfetti(18);
  }

  revealRandom.addEventListener('click', ()=>{
    const unrevealed = tileState.map((t,i)=>t.revealed?null:i).filter(n => n !== null);
    if(unrevealed.length === 0) return;
    const sel = unrevealed[Math.floor(Math.random()*unrevealed.length)];
    const el = tilesContainer.querySelector(`.tile[data-index="${sel}"]`);
    toggleTile(sel, el);
  });

  resetTiles.addEventListener('click', buildTiles);

  // initialize tiles
  buildTiles();

  // ---- simple confetti impl ----
  // small, dependency-free confetti
  function shootConfetti(particles=40){
    if(!ctx) return;
    const W = confettiCanvas.width;
    const H = confettiCanvas.height;
    const pieces = [];
    const colors = ['#E20074','#FF7AB6','#FFD9EE','#6b6b6b','#FFFFFF'];

    for(let i=0;i<particles;i++){
      pieces.push({
        x: Math.random()*W,
        y: Math.random()*H*0.2,
        vx: (Math.random()-0.5)*6,
        vy: 2+Math.random()*6,
        size: 6+Math.random()*8,
        color: colors[Math.floor(Math.random()*colors.length)],
        rot: Math.random()*360,
        drot: (Math.random()-0.5)*8
      });
    }

    let t0 = performance.now();
    let alive = true;
    function frame(now){
      const dt = (now - t0)/1000;
      t0 = now;
      ctx.clearRect(0,0,W,H);
      pieces.forEach(p=>{
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // gravity
        p.rot += p.drot;
        // draw
        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate(p.rot * Math.PI/180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
        ctx.restore();
      });
      // remove pieces that fell beyond bottom
      const remaining = pieces.filter(p=>p.y < H + 30);
      if(remaining.length === 0) alive = false;
      if(alive) requestAnimationFrame(frame);
      else ctx.clearRect(0,0,W,H);
    }
    requestAnimationFrame(frame);
  }

  // init: try to prefill small demo
  if(!namesEl.value.trim()){
    namesEl.value = 'Alex\nBailey\nCam\nDiego\nEvelyn\nFrank';
  }

})();
