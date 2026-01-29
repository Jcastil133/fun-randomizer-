:root{
  --magenta: #E20074;
  --bg:#fbfbfd;
  --card:#ffffff;
  --muted:#6b6b6b;
  --shadow: 0 10px 30px rgba(15,15,15,0.06);
}
*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;
  font-family:Inter, "Segoe UI", Roboto, Arial, sans-serif;
  background: linear-gradient(180deg,#fff,var(--bg));
  color:#111;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  display:flex;
  flex-direction:column;
  min-height:100vh;
  align-items:center;
}

/* top header */
.topbar{
  width:100%;
  max-width:1200px;
  padding:20px 20px 6px;
  margin-top:10px;
}
.brand{display:flex;align-items:center;gap:12px}
.magenta-dot{
  width:36px;height:36px;border-radius:8px;background:var(--magenta);
  box-shadow:0 6px 20px rgba(226,0,116,0.12)
}
.brand h1{margin:0;font-size:20px}
.subtitle{margin:6px 0 0;color:var(--muted);font-size:13px}

/* tabs */
.tabs{
  width:100%;
  max-width:1200px;
  display:flex;
  gap:8px;
  padding:8px 20px;
}
.tab-btn{
  background:transparent;border:1px solid rgba(0,0,0,0.06);padding:10px 14px;border-radius:10px;font-weight:700;cursor:pointer;
}
.tab-btn.active{background:linear-gradient(180deg,var(--magenta),#c20062);color:#fff;border-color:transparent;box-shadow:var(--shadow)}

/* main area */
.main-wrap{width:100%;max-width:1200px;padding:18px;display:block}

.card{
  background:var(--card);
  border-radius:12px;
  padding:16px;
  box-shadow:var(--shadow);
  border:1px solid rgba(15,15,15,0.03);
}

/* large pane gives more vertical space */
.large{min-height:420px}

/* panes */
.pane{display:none}
.pane.active{display:block}

/* two-column layout inside randomizer */
.pane-columns{display:flex;gap:20px}
.left{flex:0 0 420px}
.right{flex:1;min-height:360px;display:flex;align-items:flex-start;justify-content:flex-start}

/* match grid layout */
.match-grid{display:flex;gap:20px;align-items:flex-start}
.match-left{flex:0 0 420px}
.match-right{flex:1}

/* inputs */
label{display:block;margin-bottom:8px;color:#333;font-weight:600}
textarea, input[type=text], input[type=number], select, input{
  width:100%;padding:12px;border-radius:8px;border:1px solid #e6e6e9;font-size:14px;background:#fff;
}
textarea{resize:vertical}

/* rows and buttons */
.row{display:flex;gap:12px;margin-top:12px;align-items:center}
.row > div{flex:1}
.row.buttons{margin-top:16px}
.hint{display:block;margin-top:10px;color:var(--muted);font-size:13px}

.btn{padding:10px 14px;border-radius:8px;border:0;background:#f1f1f4;cursor:pointer;font-weight:700}
.btn.primary{background:linear-gradient(180deg,var(--magenta),#c20062);color:white;box-shadow:0 8px 22px rgba(226,0,116,0.18)}
.btn.alt{background:linear-gradient(180deg,#fff,#f8f8fb);border:1px solid rgba(0,0,0,0.04)}
.btn:active{transform:translateY(1px)}

/* results / team cards */
.results{display:grid;gap:12px}
.team{display:flex;gap:12px;align-items:center;padding:14px;border-radius:10px;background:linear-gradient(180deg,#fff,#fbf8ff);border:1px solid rgba(0,0,0,0.04)}
.badge{width:72px;height:72px;border-radius:12px;background:var(--magenta);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:18px}
.members{display:flex;gap:8px;flex-wrap:wrap}
.member{padding:8px 10px;border-radius:8px;background:#fff;border:1px solid rgba(0,0,0,0.04);font-weight:600}

/* tiles (larger) */
.tiles-large{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px}
.tile{width:140px;height:108px;border-radius:10px;background:linear-gradient(180deg,#fafafa,#fff);display:flex;align-items:center;justify-content:center;font-weight:800;border:1px solid rgba(0,0,0,0.04);cursor:pointer;user-select:none;transition:transform .25s,box-shadow .2s}
.tile.revealed{background:linear-gradient(180deg,#fff7fb,#ffeef8);box-shadow:0 18px 40px rgba(226,0,116,0.08)}
.tile:active{transform:translateY(2px)}

/* small helpers */
.muted{color:var(--muted)}
.small-text{font-size:13px}
.footer{width:100%;max-width:1200px;padding:18px;color:var(--muted);font-size:13px;text-align:center;margin-top:18px}

/* responsive */
@media (max-width:980px){
  .pane-columns, .match-grid{flex-direction:column}
  .left, .match-left{flex:1}
  .right, .match-right{flex:1}
  .tiles-large{justify-content:center}
  .tab-btn{flex:1}
}
