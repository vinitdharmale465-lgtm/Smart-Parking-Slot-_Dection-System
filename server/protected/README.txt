Put your dashboard file here, named dashboard.html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Path Finder · Smart Parking</title>
<style>
  :root{
    --paper:#f2efe6; --panel:#fffdf7; --ink:#1b222b; --muted:#6b7280; --line:#ddd8c9;
    --asphalt:#262d36; --paint:#ecefe9; --sign:#f5b800;
    --free:#1f9d6b; --free-bg:#e0f3e8; --occ:#d1453b; --occ-bg:#fbe5e2; --route:#38bdf8;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--paper);color:var(--ink);
       font-family:Bahnschrift,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-variant-numeric:tabular-nums}
  button,input,select{font:inherit}
  :focus-visible{outline:3px solid #1d4ed8;outline-offset:2px}

  /* ---------- top bar ---------- */
  .topbar{background:var(--asphalt);color:#fff;padding:14px 28px;display:flex;flex-wrap:wrap;gap:14px;
          align-items:center;justify-content:space-between;border-bottom:6px solid var(--sign)}
  .brand{display:flex;align-items:center;gap:14px}
  .brand svg{flex:none}
  .brand h1{margin:0;font-size:24px;font-weight:700;letter-spacing:.01em;line-height:1.1}
  .brand h1 span{color:var(--sign)}
  .brand small{display:block;color:#b4bcc7;font-size:13px;margin-top:3px}
  .tools{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
  .tools input{width:170px;padding:8px 10px;border-radius:6px;border:1px solid #4a5563;background:#1c2229;color:#fff}
  .tools button{padding:8px 14px;border-radius:6px;border:1px solid #4a5563;background:transparent;color:#fff;cursor:pointer}
  .tools button.primary{background:var(--sign);border-color:var(--sign);color:#1b222b;font-weight:700}
  .chip{display:flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;background:#1c2229;font-size:13px}
  .chip i{width:9px;height:9px;border-radius:50%;background:#7b8794}
  .chip.live i{background:#34d399} .chip.err i{background:#f87171}
  #clock{font-size:15px;color:#cfd5dc;min-width:72px;text-align:right}

  /* ---------- layout ---------- */
  .wrap{max-width:1200px;margin:0 auto;padding:24px 28px 36px;display:grid;grid-template-columns:340px 1fr;gap:22px;align-items:start}
  @media (max-width:900px){.wrap{grid-template-columns:1fr;padding:18px}}
  .panel{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:22px}
  .panel h2{margin:0 0 16px;font-size:17px;font-weight:700}
  .stack{display:flex;flex-direction:column;gap:22px}

  /* ---------- availability ---------- */
  .ringbox{display:flex;align-items:center;gap:20px}
  .ring{position:relative;width:120px;height:120px;flex:none}
  .ring svg{transform:rotate(-90deg)}
  .ring .pct{position:absolute;inset:0;display:grid;place-items:center;text-align:center;font-size:26px;font-weight:700}
  .ring .pct small{display:block;font-size:12px;font-weight:400;color:var(--muted)}
  .nums{flex:1}
  .nums div{display:flex;justify-content:space-between;align-items:baseline;padding:6px 0;border-bottom:1px solid var(--line)}
  .nums div:last-child{border-bottom:0}
  .nums b{font-size:26px}
  .nums .f b{color:var(--free)} .nums .o b{color:var(--occ)} .nums .r b{color:#a8740a}
  .banner{margin-top:18px;padding:12px 14px;border-radius:8px;font-weight:600;font-size:15px}
  .banner.ok{background:var(--free-bg);color:#14684a}
  .banner.full{background:var(--occ-bg);color:#9b2a22}
  .banner.hold{background:#fdf0cc;color:#7a5600}
  .banner.idle{background:#efebdd;color:var(--muted);font-weight:400}

  /* ---------- booking form ---------- */
  .hint{margin:-6px 0 14px;font-size:13px;color:var(--muted)}
  .field{margin-bottom:11px}
  .field label{display:block;font-size:13px;font-weight:600;margin-bottom:4px}
  .field input,.field select{width:100%;padding:9px 10px;border:1px solid var(--line);border-radius:6px;background:#fff;color:var(--ink)}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .bookbtn{width:100%;padding:11px;border:0;border-radius:8px;background:var(--sign);color:var(--ink);font-weight:700;font-size:15px;cursor:pointer;margin-top:4px}
  .bookbtn:hover{filter:brightness(.95)}
  .bkmsg{margin-top:12px;font-size:14px;padding:0;border-radius:8px}
  .bkmsg.err{padding:10px 12px;background:var(--occ-bg);color:#9b2a22}
  .bkmsg.ok{padding:10px 12px;background:var(--free-bg);color:#14684a}

  /* ---------- active bookings ---------- */
  .bk{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 0;border-bottom:1px solid var(--line)}
  .bk:last-child{border-bottom:0}
  .bk .id{font-weight:700}
  .bk .sub{font-size:13px;color:var(--muted);margin-top:2px}
  .bk .left{font-weight:700;color:#a8740a}
  .bk .btns{display:flex;gap:8px}
  .bk button{padding:6px 12px;border-radius:6px;border:1px solid var(--line);background:#fff;cursor:pointer;font-size:13px}
  .bk button.on{background:var(--route);border-color:var(--route);color:#06283d}
  .bk button.cancel{color:#9b2a22}
  .empty{color:var(--muted);font-size:14px}

  /* ---------- log ---------- */
  #log{list-style:none;margin:0;padding:0;max-height:200px;overflow:auto;font-size:14px}
  #log li{display:flex;gap:12px;padding:8px 0;border-bottom:1px solid var(--line)}
  #log time{color:var(--muted);flex:none;width:64px}

  /* ---------- guidance bar ---------- */
  .map-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px}
  .map-head h2{margin:0}
  .legend{display:flex;gap:16px;font-size:13px;color:var(--muted);flex-wrap:wrap}
  .legend span{display:flex;align-items:center;gap:6px}
  .legend i{width:12px;height:12px;border-radius:3px;display:inline-block}
  .guide{display:flex;align-items:center;gap:14px;margin-bottom:14px;padding:12px 16px;border-radius:8px;
         background:var(--sign);color:#1b222b;font-weight:700;font-size:18px}
  .guide svg{flex:none}
  .guide small{display:block;font-weight:400;font-size:13px;margin-top:2px}
  .guide.none{background:#e7e3d4;color:var(--muted);font-weight:600}
  .guide.stop{background:var(--occ);color:#fff}

  /* ---------- map ---------- */
  .lot{background:var(--asphalt);border-radius:10px;padding:26px 26px 18px;position:relative}
  #route{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
  .bays{display:grid;grid-template-columns:repeat(4,1fr);border-top:3px solid var(--paint)}
  @media (max-width:640px){.bays{grid-template-columns:repeat(2,1fr)} #route{display:none}}
  .bay{height:225px;border-left:3px solid var(--paint);border-bottom:3px solid var(--paint);
       display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;
       color:var(--paint);position:relative;transition:background .35s}
  .bay:last-child{border-right:3px solid var(--paint)}
  @media (max-width:640px){.bay:nth-child(2){border-right:3px solid var(--paint)}}
  .bay .state{font-size:15px;font-weight:700;padding:3px 10px;border-radius:4px;color:#fff}
  .bay.free{background:rgba(31,157,107,.18)} .bay.free .state{background:var(--free)}
  .bay.occ{background:rgba(209,69,59,.20)}  .bay.occ .state{background:var(--occ)}
  .bay.res{background:rgba(245,184,0,.20)}  .bay.res .state{background:var(--sign);color:#1b222b}
  .bay.target{box-shadow:inset 0 0 0 3px var(--route)}
  .bay .car{width:52px;height:100px;display:none}
  .bay.occ .car{display:block}
  .bay .bigp{font-size:50px;font-weight:800;color:rgba(255,255,255,.26);line-height:1}
  .bay.occ .bigp{display:none}
  .resinfo{font-size:12px;color:#f6dca0;min-height:16px;text-align:center;padding:0 6px}
  .plate{font-size:12px;font-weight:700;letter-spacing:.04em;background:#fff;color:#1b222b;border:2px solid #1b222b;
         border-radius:5px;padding:1px 8px;max-width:90%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .plate b{color:#1d4ed8;margin-right:5px}
  .lane{margin-top:14px;height:74px;position:relative;display:flex;align-items:center;border-top:2px dashed #5a6572}
  .lane .centre{position:absolute;left:92px;right:0;top:50%;border-top:3px dashed #6b7684}
  .lane .lanelabel{position:absolute;right:6px;top:8px;font-size:12px;color:#aab3bf}
  .gate{position:relative;width:88px;height:100%;flex:none}
  .gate .post{position:absolute;left:10px;bottom:10px;width:14px;height:30px;background:#9aa4b1;border-radius:3px}
  .gate .arm{position:absolute;left:17px;bottom:36px;width:66px;height:8px;border-radius:4px;transform-origin:left center;
             background:repeating-linear-gradient(90deg,var(--sign) 0 10px,#fff 10px 20px);transition:transform .6s ease}
  .gate.open .arm{transform:rotate(-80deg)}
  .gate .glabel{position:absolute;left:0;top:2px;font-size:12px;color:#cfd5dc}
  .meta{display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-top:14px;font-size:13px;color:var(--muted)}
  .meta b{color:var(--ink)}
  .dim{opacity:.5}
  .flow{stroke-dasharray:3 14;animation:flow 1s linear infinite}
  @keyframes flow{to{stroke-dashoffset:-34}}

  /* ---------- pages and booking page ---------- */
  .wrap[hidden]{display:none}
  .wrap.book{grid-template-columns:minmax(0,430px) 1fr}
  @media (max-width:900px){.wrap.book{grid-template-columns:1fr}}
  .bkhead{grid-column:1/-1;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
  .bkhead h2{margin:0;font-size:24px}
  .back{padding:9px 14px;border-radius:8px;border:1px solid var(--line);background:#fff;cursor:pointer;font-weight:600}
  .cta{width:100%;margin-top:14px;padding:12px;border:0;border-radius:8px;background:var(--sign);color:var(--ink);font-weight:700;font-size:15px;cursor:pointer}
  .cta:hover{filter:brightness(.95)}
  .tools button.nav{border-color:var(--sign);color:var(--sign);font-weight:700}
  .mini{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
  @media (max-width:520px){.mini{grid-template-columns:repeat(2,1fr)}}
  .tile{border-radius:8px;padding:12px 6px;text-align:center;font-size:12px;border:2px solid var(--line);min-height:76px}
  .tile b{display:block;font-size:15px;margin:2px 0}
  .tile.free{background:var(--free-bg);border-color:var(--free);color:#14684a}
  .tile.occ{background:var(--occ-bg);border-color:var(--occ);color:#9b2a22}
  .tile.res{background:#fdf0cc;border-color:var(--sign);color:#7a5600}

  /* ---------- team ---------- */
  .team{grid-column:1/-1}
  .team h2{margin-bottom:4px}
  .team p{margin:0 0 16px;color:var(--muted);font-size:14px}
  .plates{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  @media (max-width:900px){.plates{grid-template-columns:repeat(2,1fr)}}
  @media (max-width:520px){.plates{grid-template-columns:1fr}}
  .np{background:#fff;border:3px solid var(--ink);border-radius:10px;overflow:hidden;display:flex;flex-direction:column}
  .np .band{background:#1d4ed8;color:#fff;font-size:11px;font-weight:700;letter-spacing:.06em;padding:3px 10px;display:flex;justify-content:space-between}
  .np .body{padding:12px 12px 14px}
  .np .nm{font-size:19px;font-weight:700;margin:2px 0 4px;line-height:1.2}
  .np .prn{font-size:14px;letter-spacing:.08em}
  .np .role{font-size:13px;color:var(--muted);margin-top:4px}
  @media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
</style>
</head>
<body>

<header class="topbar">
  <div class="brand">
    <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true">
      <rect x="2" y="2" width="42" height="42" rx="10" fill="#f5b800"/>
      <circle cx="23" cy="23" r="14" fill="none" stroke="#262d36" stroke-width="2.5"/>
      <path d="M23 9 L28 25 L23 22 L18 25 Z" fill="#262d36"/>
      <path d="M23 37 L18 21 L23 24 L28 21 Z" fill="#262d36" opacity=".35"/>
    </svg>
    <div>
      <h1><span id="grp">Path Finder</span> · Smart Parking</h1>
      <small>Embedded Systems for IoT · ESP32 + 6 IR sensors</small>
    </div>
  </div>
  <div class="tools">
    <span class="chip" id="chip"><i></i><span id="chipText">Not connected</span></span>
    <button class="nav" id="navBtn">Book parking</button>
    <input id="ip" placeholder="ESP32 IP, e.g. 192.168.1.50" aria-label="ESP32 IP address">
    <button class="primary" id="connect">Connect</button>
    <button id="demo">Demo data</button>
    <span id="clock"></span>
  </div>
</header>

<div class="wrap" id="viewDash">
  <div class="stack">
    <section class="panel">
      <h2>Availability</h2>
      <div class="ringbox">
        <div class="ring">
          <svg width="120" height="120" viewBox="0 0 132 132" aria-hidden="true">
            <circle cx="66" cy="66" r="54" fill="none" stroke="#e8e4d6" stroke-width="14"/>
            <circle id="arc" cx="66" cy="66" r="54" fill="none" stroke="#d1453b" stroke-width="14"
                    stroke-dasharray="0 339.3" style="transition:stroke-dasharray .5s"/>
          </svg>
          <div class="pct"><div><span id="pct">–</span><small>taken</small></div></div>
        </div>
        <div class="nums">
          <div class="f"><span>Free</span><b id="free">–</b></div>
          <div class="r"><span>Reserved</span><b id="resv">–</b></div>
          <div class="o"><span>Occupied</span><b id="occ">–</b></div>
        </div>
      </div>
      <div class="banner idle" id="banner">Enter the ESP32 address and select Connect.</div>
      <button class="cta" id="ctaBook">Book a parking space</button>
    </section>



    <section class="panel">
      <h2>Activity</h2>
      <ul id="log"><li class="empty">No events yet.</li></ul>
    </section>
  </div>

  <div class="stack">
    <section class="panel">
      <div class="map-head">
        <h2>Live parking map</h2>
        <div class="legend">
          <span><i style="background:var(--free)"></i>Free</span>
          <span><i style="background:var(--sign)"></i>Reserved</span>
          <span><i style="background:var(--occ)"></i>Occupied</span>
          <span><i style="background:var(--route)"></i>Guided path</span>
        </div>
      </div>

      <div class="guide none" id="guide">
        <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><path d="M15 3 L25 25 L15 20 L5 25 Z" fill="currentColor"/></svg>
        <div><span id="guideMain">Waiting for data</span><small id="guideSub">The guided path appears when the lot is connected.</small></div>
      </div>

      <div class="lot dim" id="lot">
        <div class="bays" id="bays"></div>
        <div class="lane">
          <div class="gate" id="gate"><span class="glabel">Gate</span><div class="post"></div><div class="arm"></div></div>
          <div class="centre"></div>
          <span class="lanelabel">Driving lane</span>
        </div>
        <svg id="route" aria-hidden="true"></svg>
      </div>

      <div class="meta">
        <span>Gate: <b id="gateText">–</b></span>
        <span>Last update: <b id="updated">–</b></span>
      </div>
    </section>


  </div>

  <section class="panel team">
    <h2>Team <span id="grp2">Path Finder</span></h2>
    <p>Four people, four bays. Each bay carries the number plate of one team member.</p>
    <div class="plates" id="plates"></div>
  </section>
</div>

<div class="wrap book" id="viewBook" hidden>
  <div class="bkhead">
    <button class="back" id="backBtn">&larr; Back to dashboard</button>
    <h2>Parking booking</h2>
  </div>
    <section class="panel">
      <h2>Pre-book a parking space</h2>
      <p class="hint" id="bkHint"></p>
      <div class="field"><label for="bkName">Your name</label><input id="bkName" autocomplete="off"></div>
      <div class="field"><label for="bkPhone">Mobile number</label><input id="bkPhone" inputmode="numeric" maxlength="10" placeholder="10 digits" autocomplete="off"></div>
      <div class="two">
        <div class="field"><label for="bkCar">Car number</label><input id="bkCar" placeholder="MH12AB1234" autocomplete="off"></div>
        <div class="field"><label for="bkModel">Car model</label><input id="bkModel" placeholder="Swift" autocomplete="off"></div>
      </div>
      <div class="field"><label for="bkDur">Booking time</label><select id="bkDur"></select></div>
      <button class="bookbtn" id="bkBtn">Book parking</button>
      <div class="bkmsg" id="bkMsg" role="status"></div>
    </section>
  <div class="stack">
    <section class="panel">
      <h2>Live availability</h2>
      <div class="mini" id="miniSlots"></div>
      <p class="hint" id="miniNote" style="margin:12px 0 0"></p>
    </section>
    <section class="panel">
      <h2>Active bookings</h2>
      <div id="bkList"><div class="empty">No active bookings.</div></div>
    </section>
  </div>
</div>

<script>
/* =====================================================
   EDIT HERE: group, team and booking settings
   ===================================================== */
var GROUP = "Path Finder";
var TEAM = [
  { name: "Atharav D. Rachmale", prn: "202401070185" },
  { name: "Aryan Mamdage", prn: "202401070184" },
  { name: "Vinit Dharmale", prn: "202401070200" },
  { name: "Shashank Deshmukh", prn: "202401070036" }
];
var MAX_HOURS = 2;      /* a booking is valid for at most this many hours */
/* ===================================================== */

var $ = function (id) { return document.getElementById(id); };
var CAR = '<svg class="car" viewBox="0 0 58 112" aria-hidden="true">' +
  '<rect x="4" y="2" width="50" height="108" rx="16" fill="#cfd6df"/>' +
  '<rect x="11" y="22" width="36" height="24" rx="6" fill="#2a323c"/>' +
  '<rect x="11" y="62" width="36" height="22" rx="6" fill="#2a323c"/>' +
  '<rect x="9" y="8" width="10" height="6" rx="2" fill="#f5d36b"/><rect x="39" y="8" width="10" height="6" rx="2" fill="#f5d36b"/>' +
  '<rect x="9" y="98" width="10" height="5" rx="2" fill="#d1453b"/><rect x="39" y="98" width="10" height="5" rx="2" fill="#d1453b"/></svg>';

var timer = null, prev = null, last = null, routeKey = "", forced = null, listSig = "";
var demoSlots = [false, false, false, false], demoGate = false;
var bookings = [];

function first(n) { return n.split(" ")[0]; }
function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function hhmm(t) { return new Date(t).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false}); }
function fmtLeft(ms) {
  if (ms < 60000) return Math.max(1, Math.ceil(ms / 1000)) + ' s';
  var m = Math.ceil(ms / 60000);
  return m >= 60 ? Math.floor(m / 60) + 'h ' + ('0' + (m % 60)).slice(-2) + 'm' : m + ' min';
}
function durLabel(h) { var m = h * 60; return m < 60 ? m + ' min' : (m % 60 === 0 ? (m / 60) + (m === 60 ? ' hour' : ' hours') : Math.floor(m / 60) + ' hr ' + (m % 60) + ' min'); }

/* ---------- build bays, team plates, duration list ---------- */
$('grp').textContent = GROUP; $('grp2').textContent = GROUP;
(function () {
  var b = '', p = '', o = '';
  for (var i = 0; i < 4; i++) {
    var m = TEAM[i];
    b += '<div class="bay free" id="bay' + i + '"><span class="plate"><b>' + (i + 1) + '</b>' + esc(first(m.name)) + '</span>' +
         '<span class="bigp">P</span>' + CAR + '<span class="state">Free</span><span class="resinfo"></span></div>';
    p += '<div class="np"><div class="band"><span>' + esc(GROUP.toUpperCase()) + '</span><span>BAY ' + (i + 1) + '</span></div>' +
         '<div class="body"><div class="nm">' + esc(m.name) + '</div><div class="prn">' + esc(m.prn) + '</div>' +
         (m.role ? '<div class="role">' + esc(m.role) + '</div>' : '') + '</div></div>';
  }
  for (var h = 0.5; h <= MAX_HOURS + 0.001; h += 0.5) o += '<option value="' + h + '">' + durLabel(h) + '</option>';
  $('bays').innerHTML = b; $('plates').innerHTML = p; $('bkDur').innerHTML = o;
  var t = ''; for (var q = 0; q < 4; q++) t += '<div class="tile" id="tile' + q + '"></div>';
  $('miniSlots').innerHTML = t;
  $('bkHint').textContent = 'The space is held for the time you choose (maximum ' + durLabel(MAX_HOURS) + '). After that it is released automatically.';
})();

function tickClock() { $('clock').textContent = new Date().toLocaleTimeString([], {hour12:false}); }
setInterval(tickClock, 1000); tickClock();

/* ---------- bookings: storage ---------- */
function saveBookings() { try { localStorage.setItem('pf_bookings', JSON.stringify(bookings)); } catch (e) {} }
function loadBookings() { try { bookings = JSON.parse(localStorage.getItem('pf_bookings') || '[]'); } catch (e) { bookings = []; } }
function nextId() {
  var n;
  try { n = parseInt(localStorage.getItem('pf_seq') || '1000', 10) + 1; localStorage.setItem('pf_seq', n); }
  catch (e) { n = 1000 + Math.floor(Math.random() * 9000); }
  return 'PF-' + n;
}
function bookingFor(slot) { for (var i = 0; i < bookings.length; i++) if (bookings[i].slot === slot) return bookings[i]; return null; }
function bookingById(id) { for (var i = 0; i < bookings.length; i++) if (bookings[i].id === id) return bookings[i]; return null; }

function purgeExpired() {
  var now = Date.now(), changed = false;
  for (var i = bookings.length - 1; i >= 0; i--) {
    if (bookings[i].end <= now) {
      addLog('Booking ' + bookings[i].id + ' expired. Slot ' + (bookings[i].slot + 1) + ' released');
      if (forced === bookings[i].slot) forced = null;
      bookings.splice(i, 1); changed = true;
    }
  }
  if (changed) saveBookings();
  return changed;
}

/* ---------- bookings: form ---------- */
function showMsg(kind, text) { var m = $('bkMsg'); m.className = 'bkmsg ' + kind; m.textContent = text; }

function submitBooking() {
  var name = $('bkName').value.trim();
  var phone = $('bkPhone').value.replace(/\s/g, '');
  var car = $('bkCar').value.toUpperCase().replace(/\s/g, '');
  var model = $('bkModel').value.trim();
  var hrs = parseFloat($('bkDur').value);

  if (name.length < 2) return showMsg('err', 'Enter your name.');
  if (!/^[0-9]{10}$/.test(phone)) return showMsg('err', 'Enter a 10-digit mobile number.');
  if (!/^[A-Z0-9-]{6,12}$/.test(car)) return showMsg('err', 'Enter a valid car number, for example MH12AB1234.');
  if (model.length < 2) return showMsg('err', 'Enter the car model.');
  if (!(hrs > 0 && hrs <= MAX_HOURS)) return showMsg('err', 'Choose a booking time of up to ' + durLabel(MAX_HOURS) + '.');
  if (!last) return showMsg('err', 'Connect to the ESP32 (or use Demo data) first, so the free spaces are known.');
  for (var k = 0; k < bookings.length; k++) {
    if (bookings[k].car === car) return showMsg('err', 'Car ' + car + ' already has an active booking (' + bookings[k].id + ').');
  }

  var slot = -1;
  for (var i = 0; i < 4; i++) { if (!last.slots[i] && !bookingFor(i)) { slot = i; break; } }
  if (slot < 0) return showMsg('err', 'No space is available to book right now.');

  var now = Date.now();
  var b = { id: nextId(), slot: slot, name: name, phone: phone, car: car, model: model, start: now, end: now + hrs * 3600000 };
  bookings.push(b); saveBookings();
  addLog('Booking ' + b.id + ': Slot ' + (slot + 1) + ' reserved for ' + esc(car) + ' (' + durLabel(hrs) + ')');
  showMsg('ok', 'Booked. ID ' + b.id + ', Slot ' + (slot + 1) + ', valid until ' + hhmm(b.end) + ' (' + durLabel(hrs) + '). Please arrive before it expires.');
  $('bkName').value = ''; $('bkPhone').value = ''; $('bkCar').value = ''; $('bkModel').value = '';
  listSig = ''; routeKey = '';
  render(last); renderBookings();
}

function cancelBooking(id) {
  var b = bookingById(id); if (!b) return;
  bookings.splice(bookings.indexOf(b), 1); saveBookings();
  if (forced === b.slot) forced = null;
  addLog('Booking ' + b.id + ' cancelled. Slot ' + (b.slot + 1) + ' released');
  listSig = ''; routeKey = '';
  if (last) render(last);
  renderBookings();
}

function togglePath(id) {
  var b = bookingById(id); if (!b) return;
  var show = (forced !== b.slot);
  forced = show ? b.slot : null;
  listSig = ''; routeKey = '';
  if (last) render(last);
  renderBookings();
  if (show) location.hash = 'dashboard';   /* open the map to see the path */
}

/* ---------- bookings: list and countdowns ---------- */
function renderBookings() {
  var now = Date.now(), sig = forced + '|';
  for (var i = 0; i < bookings.length; i++) sig += bookings[i].id + ',';

  if (sig !== listSig) {                       /* rebuild only when the list changes */
    listSig = sig;
    if (!bookings.length) { $('bkList').innerHTML = '<div class="empty">No active bookings.</div>'; }
    else {
      var h = '';
      for (var j = 0; j < bookings.length; j++) {
        var b = bookings[j];
        h += '<div class="bk"><div><div class="id">' + b.id + ' · Slot ' + (b.slot + 1) + '</div>' +
             '<div class="sub">' + esc(b.name) + ' · ' + esc(b.car) + ' (' + esc(b.model) + ') · ' + esc(b.phone) + '</div>' +
             '<div class="sub">Valid until ' + hhmm(b.end) + ' · <span class="left" data-end="' + b.end + '"></span> left</div></div>' +
             '<div class="btns"><button data-act="path" data-id="' + b.id + '"' + (forced === b.slot ? ' class="on">Hide path' : '>Show path') + '</button>' +
             '<button class="cancel" data-act="cancel" data-id="' + b.id + '">Cancel</button></div></div>';
      }
      $('bkList').innerHTML = h;
    }
  }
  var spans = $('bkList').querySelectorAll('.left');
  for (var s = 0; s < spans.length; s++) spans[s].textContent = fmtLeft(spans[s].getAttribute('data-end') - now);

  for (var k = 0; k < 4; k++) {                /* small line inside each bay */
    var bb = bookingFor(k), el = $('bay' + k).querySelector('.resinfo');
    el.textContent = bb ? bb.car + ' · ' + fmtLeft(bb.end - now) : '';
  }
  renderMini();
}

/* live availability tiles on the booking page */
function renderMini() {
  $('miniNote').textContent = last ? 'A free space is assigned automatically when you book.'
    : 'Not connected. Connect to the ESP32 or use Demo data (top right) to see live spaces.';
  var now = Date.now();
  for (var i = 0; i < 4; i++) {
    var b = bookingFor(i), cls = '', txt = '–';
    if (last) {
      if (last.slots[i]) { cls = 'occ'; txt = 'Occupied'; }
      else if (b) { cls = 'res'; txt = 'Reserved'; }
      else { cls = 'free'; txt = 'Free'; }
    }
    $('tile' + i).className = 'tile ' + cls;
    $('tile' + i).innerHTML = 'Slot ' + (i + 1) + '<b>' + txt + '</b>' + (b && last ? esc(b.car) + '<br>' + fmtLeft(b.end - now) : '');
  }
}
$('bkList').addEventListener('click', function (e) {
  var t = e.target.closest('button'); if (!t) return;
  if (t.getAttribute('data-act') === 'cancel') cancelBooking(t.getAttribute('data-id'));
  else togglePath(t.getAttribute('data-id'));
});
$('bkBtn').onclick = submitBooking;

setInterval(function () {
  if (purgeExpired()) { listSig = ''; routeKey = ''; if (last) render(last); }
  renderBookings();
}, 1000);

/* ---------- guided path ---------- */
function drawRoute(d) {
  if ($('viewDash').hidden) return;          /* map is not on screen */
  var svg = $('route'), guide = $('guide'), target = -1, why = 'walkin';
  if (forced !== null && !d.slots[forced] && bookingFor(forced)) { target = forced; why = 'booked'; }
  else {
    forced = null;
    for (var i = 0; i < 4; i++) { if (!d.slots[i] && !bookingFor(i)) { target = i; break; } }
  }
  for (var k = 0; k < 4; k++) $('bay' + k).classList.toggle('target', k === target);

  if (target < 0) {
    var occN = 0; for (var q = 0; q < 4; q++) if (d.slots[q]) occN++;
    guide.className = 'guide stop';
    if (occN >= 4) { $('guideMain').textContent = 'Parking full'; $('guideSub').textContent = 'No path available. The gate stays closed for entry.'; }
    else { $('guideMain').textContent = 'No walk-in space'; $('guideSub').textContent = 'All free spaces are reserved by bookings.'; }
    svg.innerHTML = ''; routeKey = ''; return;
  }
  guide.className = 'guide';
  if (why === 'booked') {
    var bk = bookingFor(target);
    $('guideMain').textContent = 'Drive to Slot ' + (target + 1) + ' (reserved)';
    $('guideSub').textContent = 'Booking ' + bk.id + ' for ' + bk.car + '.';
  } else {
    $('guideMain').textContent = 'Drive to Slot ' + (target + 1) + ' (' + first(TEAM[target].name) + '\u2019s bay)';
    $('guideSub').textContent = 'Nearest free space: ' + ['1st', '2nd', '3rd', '4th'][target] + ' bay from the gate.';
  }

  var lot = $('lot').getBoundingClientRect();
  var key = target + '|' + why + '|' + Math.round(lot.width) + '|' + Math.round(lot.height);
  if (key === routeKey) return;
  routeKey = key;

  var g = $('gate').getBoundingClientRect(), bay = $('bay' + target).getBoundingClientRect();
  var laneY = g.top + g.height / 2 - lot.top;
  var x0 = g.right - lot.left - 4;
  var x1 = bay.left + bay.width / 2 - lot.left;
  var y1 = bay.top + bay.height * 0.62 - lot.top;
  var path = 'M' + x0 + ' ' + laneY + ' L' + x1 + ' ' + laneY + ' L' + x1 + ' ' + y1;

  svg.innerHTML =
    '<path d="' + path + '" fill="none" stroke="#0b1220" stroke-opacity=".35" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path class="flow" d="' + path + '" fill="none" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<circle r="8" fill="#38bdf8" stroke="#fff" stroke-width="3"><animateMotion dur="3s" repeatCount="indefinite" path="' + path + '"/></circle>';
}

/* ---------- display ---------- */
function setChip(kind, text) {
  $('chip').className = 'chip ' + kind; $('chipText').textContent = text;
  if (kind === 'err') $('lot').classList.add('dim');
}

function addLog(text) {
  var ul = $('log');
  if (ul.querySelector('.empty')) ul.innerHTML = '';
  var li = document.createElement('li');
  li.innerHTML = '<time>' + new Date().toLocaleTimeString([], {hour12:false}) + '</time><span>' + text + '</span>';
  ul.insertBefore(li, ul.firstChild);
  while (ul.children.length > 30) ul.removeChild(ul.lastChild);
}

function render(d) {
  last = d;
  $('lot').classList.remove('dim');

  var occN = 0, resv = 0, avail = 0;
  for (var i = 0; i < 4; i++) {
    var booked = bookingFor(i) !== null, bay = $('bay' + i), st = bay.querySelector('.state');
    if (d.slots[i]) { occN++; bay.className = 'bay occ'; st.textContent = 'Occupied'; }
    else if (booked) { resv++; bay.className = 'bay res'; st.textContent = 'Reserved'; }
    else { avail++; bay.className = 'bay free'; st.textContent = 'Free'; }
  }

  /* section 1: availability */
  $('free').textContent = avail;
  $('resv').textContent = resv;
  $('occ').textContent = occN;
  var pct = Math.round((occN + resv) / 4 * 100);
  $('pct').textContent = pct + '%';
  $('arc').setAttribute('stroke-dasharray', (339.3 * pct / 100) + ' 339.3');
  var b = $('banner');
  if (occN >= 4) { b.className = 'banner full'; b.textContent = 'Parking full. The gate will not open for entry.'; }
  else if (avail === 0) { b.className = 'banner hold'; b.textContent = 'All free spaces are reserved by bookings.'; }
  else { b.className = 'banner ok'; b.textContent = avail + (avail === 1 ? ' space' : ' spaces') + ' available for booking or walk-in.'; }

  /* section 2: map */
  $('gate').className = 'gate' + (d.gate ? ' open' : '');
  $('gateText').textContent = d.gate ? 'Open' : 'Closed';
  $('updated').textContent = new Date().toLocaleTimeString([], {hour12:false});
  drawRoute(d);
  renderBookings();

  /* activity log: compare with the previous reading */
  if (prev) {
    for (var j = 0; j < 4; j++) {
      if (prev.slots[j] !== d.slots[j]) addLog('Slot ' + (j + 1) + (d.slots[j] ? ' occupied' : ' is now free'));
    }
    if (prev.gate !== d.gate) addLog(d.gate ? 'Gate opened' : 'Gate closed');
  }
  prev = d;
}

window.addEventListener('resize', function () { routeKey = ''; if (last) drawRoute(last); });

/* ---------- live data from the ESP32 ---------- */
function poll() {
  var ip = $('ip').value.trim();
  var ctrl = new AbortController();
  var t = setTimeout(function () { ctrl.abort(); }, 2500);
  fetch('http://' + ip + '/status', { signal: ctrl.signal })
    .then(function (r) { clearTimeout(t); return r.json(); })
    .then(function (d) { render(d); setChip('live', 'Live · ' + ip); })
    .catch(function () { setChip('err', 'No response from ' + ip); });
}

/* ---------- demo data (test without hardware) ---------- */
function demoTick() {
  if (Math.random() < 0.45) { var i = Math.floor(Math.random() * 4); demoSlots[i] = !demoSlots[i]; }
  if (Math.random() < 0.3) demoGate = !demoGate;
  var occ = demoSlots.filter(Boolean).length;
  render({ free: 4 - occ, occupied: occ, full: occ >= 4, gate: demoGate, slots: demoSlots.slice() });
  setChip('live', 'Demo data');
}

function start(mode) {
  clearInterval(timer); prev = null; routeKey = '';
  if (mode === 'live') {
    try { localStorage.setItem('esp32ip', $('ip').value.trim()); } catch (e) {}
    poll(); timer = setInterval(poll, 1000);
  } else { demoTick(); timer = setInterval(demoTick, 1800); }
}

$('connect').onclick = function () { if ($('ip').value.trim()) start('live'); else $('ip').focus(); };
$('demo').onclick = function () { start('demo'); };
$('ip').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('connect').click(); });
try { $('ip').value = localStorage.getItem('esp32ip') || ''; } catch (e) {}

/* ---------- pages: dashboard and booking (same file, so data is shared) ---------- */
var view = 'dashboard';
function showView(name) {
  view = name;
  $('viewDash').hidden = (name !== 'dashboard');
  $('viewBook').hidden = (name !== 'booking');
  $('navBtn').textContent = (name === 'booking') ? 'Dashboard' : 'Book parking';
  window.scrollTo(0, 0);
  if (name === 'dashboard') { routeKey = ''; if (last) drawRoute(last); }
  else { listSig = ''; renderBookings(); }
}
function routeFromHash() { showView(location.hash === '#booking' ? 'booking' : 'dashboard'); }
window.addEventListener('hashchange', routeFromHash);
$('navBtn').onclick = function () { location.hash = (view === 'booking') ? 'dashboard' : 'booking'; };
$('ctaBook').onclick = function () { location.hash = 'booking'; };
$('backBtn').onclick = function () { location.hash = 'dashboard'; };

loadBookings(); purgeExpired(); renderBookings(); routeFromHash();
</script>
</body>
</html>