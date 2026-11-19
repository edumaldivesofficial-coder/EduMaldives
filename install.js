/* EduMaldives: "Install the app" prompt with simple steps for Android, iPhone/iPad and computers */
(function () {
  var KEY = "em-install-later";
  var ua = navigator.userAgent || "";
  var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/i.test(ua);
  var isMac = /Macintosh/.test(ua) && !isIOS;
  var isEdge = /Edg\//.test(ua);
  var isFirefox = /Firefox|FxiOS/.test(ua);
  var isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS|Edg\//.test(ua);
  var standalone = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true;
  window.emIsApp = standalone;

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("/sw.js").catch(function () {}); });
  }

  var deferred = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; });
  window.addEventListener("appinstalled", function () { window.emIsApp = true; hideBar(); closeGuide(); try { localStorage.setItem(KEY, "installed"); } catch (e) {} });

  var css = "" +
    ".emi-bar{position:fixed;z-index:9000;left:12px;right:12px;bottom:calc(84px + env(safe-area-inset-bottom));display:flex;align-items:center;gap:12px;padding:12px 12px 12px 14px;background:#102b4e;color:#fff;border-radius:18px;box-shadow:0 12px 32px rgba(10,30,60,.35);font-family:'DM Sans',system-ui,sans-serif;animation:emiUp .35s ease}" +
    "@media(min-width:900px){.emi-bar{left:auto;right:24px;bottom:24px;width:400px}}" +
    "@keyframes emiUp{from{transform:translateY(20px);opacity:0}to{transform:none;opacity:1}}" +
    ".emi-bar img{width:44px;height:44px;border-radius:12px;flex:0 0 44px}" +
    ".emi-bar .t{flex:1;min-width:0}.emi-bar b{display:block;font-size:15.5px}.emi-bar small{display:block;font-size:13px;color:#bcd6ef;line-height:1.3;margin-top:2px}" +
    ".emi-go{border:0;border-radius:999px;background:#278ed0;color:#fff;font:700 14.5px 'DM Sans',system-ui,sans-serif;padding:10px 16px;cursor:pointer;white-space:nowrap}" +
    ".emi-x{border:0;background:transparent;color:#9fbad6;font-size:22px;line-height:1;padding:4px 6px;cursor:pointer}" +
    ".emi-bg{position:fixed;inset:0;z-index:9100;background:rgba(8,20,40,.55);display:flex;align-items:flex-end;justify-content:center;font-family:'DM Sans',system-ui,sans-serif}" +
    "@media(min-width:700px){.emi-bg{align-items:center}}" +
    ".emi-box{background:#fff;color:#1d3047;width:100%;max-width:460px;border-radius:22px 22px 0 0;padding:22px 20px calc(22px + env(safe-area-inset-bottom));box-shadow:0 -10px 40px rgba(0,0,0,.2);animation:emiUp .3s ease}" +
    "@media(min-width:700px){.emi-box{border-radius:22px}}" +
    ".emi-head{display:flex;align-items:center;gap:12px;margin-bottom:6px}.emi-head img{width:48px;height:48px;border-radius:13px}" +
    ".emi-head h3{margin:0;font-size:19px}.emi-head p{margin:2px 0 0;font-size:14px;color:#5d7389}" +
    ".emi-tabs{display:flex;gap:6px;margin:14px 0 12px;background:#eef3f8;border-radius:12px;padding:4px}" +
    ".emi-tabs button{flex:1;border:0;background:transparent;border-radius:9px;padding:8px 4px;font:700 13.5px 'DM Sans',system-ui,sans-serif;color:#5d7389;cursor:pointer}" +
    ".emi-tabs button.on{background:#fff;color:#13497a;box-shadow:0 1px 4px rgba(0,0,0,.08)}" +
    ".emi-steps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}" +
    ".emi-steps li{display:flex;gap:12px;align-items:flex-start;font-size:15.5px;line-height:1.45}" +
    ".emi-steps li i{font-style:normal;flex:0 0 28px;height:28px;border-radius:50%;background:#e6f1fb;color:#13497a;font-weight:800;display:grid;place-items:center;font-size:14px}" +
    ".emi-ic{display:inline-flex;vertical-align:-5px;align-items:center;justify-content:center;width:24px;height:24px;border-radius:6px;background:#eef3f8;margin:0 2px}" +
    ".emi-note{font-size:13.5px;color:#6b7f95;margin:12px 0 0}" +
    ".emi-done{width:100%;margin-top:16px;border:0;border-radius:14px;background:#13497a;color:#fff;font:700 16px 'DM Sans',system-ui,sans-serif;padding:13px;cursor:pointer}" +
    "html[data-theme=dark] .emi-box{background:#152238;color:#e6edf5}html[data-theme=dark] .emi-tabs{background:#1b2a40}html[data-theme=dark] .emi-tabs button.on{background:#24364f;color:#9cc8f0}html[data-theme=dark] .emi-steps li i,html[data-theme=dark] .emi-ic{background:#24364f;color:#9cc8f0}";
  function addCss() { if (document.getElementById("emi-css")) return; var st = document.createElement("style"); st.id = "emi-css"; st.textContent = css; document.head.appendChild(st); }

  var SHARE = '<span class="emi-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#278ed0" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg></span>';
  var DOTS = '<span class="emi-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="#278ed0"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg></span>';
  var PLUS = '<span class="emi-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#278ed0" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/></svg></span>';
  var INST = '<span class="emi-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#278ed0" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M12 7v6M9 10l3 3 3-3M8 21h8"/></svg></span>';

  var STEPS = {
    iphone: [
      (isSafari ? "Tap the <b>Share</b> button " + SHARE + " at the bottom of Safari." : "Tap the <b>Share</b> button " + SHARE + " (at the top or bottom of your browser)."),
      "Scroll down and tap <b>Add to Home Screen</b> " + PLUS + ".",
      "Tap <b>Add</b>. EduMaldives is now on your home screen."
    ],
    android: [
      "Tap the menu " + DOTS + " at the top right of Chrome.",
      "Tap <b>Install app</b> (or <b>Add to Home screen</b>).",
      "Tap <b>Install</b>. EduMaldives is now on your home screen."
    ],
    pc: isMac && isSafari ? [
      "In Safari, click <b>File</b> in the top menu bar.",
      "Click <b>Add to Dock</b>.",
      "Click <b>Add</b>. Open EduMaldives from your Dock."
    ] : isEdge ? [
      "Click the menu <b>…</b> at the top right of Edge.",
      "Click <b>Apps</b>, then <b>Install this site as an app</b>.",
      "Click <b>Install</b>. EduMaldives opens in its own window."
    ] : [
      "Click the install icon " + INST + " at the right end of the address bar.<br><small>No icon? Click the menu " + DOTS + " and choose <b>Install EduMaldives</b> (or <b>Cast, save and share → Install page as app</b>).</small>",
      "Click <b>Install</b>.",
      "EduMaldives opens in its own window and gets a desktop icon."
    ]
  };
  var NOTES = {
    iphone: "Can't see Share? Tap the <b>•••</b> button first, then <b>Share</b>. If Add to Home Screen is missing, open this page in Safari.",
    android: "If you don't see Install app, open this page in Google Chrome.",
    pc: isFirefox ? "Firefox can't install apps. Open this page in Google Chrome or Microsoft Edge." : ""
  };
  var device = isIOS ? "iphone" : isAndroid ? "android" : "pc";

  var guide = null;
  function closeGuide() { if (guide) { guide.remove(); guide = null; } }
  function openGuide(which) {
    addCss(); closeGuide();
    which = which || device;
    guide = document.createElement("div");
    guide.className = "emi-bg";
    guide.innerHTML = '<div class="emi-box" role="dialog" aria-modal="true" aria-label="Install EduMaldives">' +
      '<div class="emi-head"><img src="/icon-192.png" alt=""><div><h3>Install EduMaldives</h3><p>Free · takes 10 seconds · no app store</p></div></div>' +
      '<div class="emi-tabs">' + [["iphone", "iPhone / iPad"], ["android", "Android"], ["pc", "Computer"]].map(function (t) { return '<button type="button" data-t="' + t[0] + '" class="' + (t[0] === which ? "on" : "") + '">' + t[1] + "</button>"; }).join("") + "</div>" +
      '<ol class="emi-steps">' + STEPS[which].map(function (s, i) { return "<li><i>" + (i + 1) + "</i><span>" + s + "</span></li>"; }).join("") + "</ol>" +
      (NOTES[which] ? '<p class="emi-note">' + NOTES[which] + "</p>" : "") +
      '<button type="button" class="emi-done">Got it</button></div>';
    guide.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-t]") : null;
      if (t) { openGuide(t.getAttribute("data-t")); return; }
      if (e.target === guide || (e.target.closest && e.target.closest(".emi-done"))) closeGuide();
    });
    document.body.appendChild(guide);
  }

  function install() {
    hideBar();
    if (deferred) {
      var p = deferred; deferred = null;
      p.prompt();
      (p.userChoice || Promise.resolve({})).then(function (r) { if (!r || r.outcome !== "accepted") later(); });
      return;
    }
    openGuide();
  }
  window.emInstall = install;

  var bar = null;
  function hideBar() { if (bar) { bar.remove(); bar = null; } }
  function later() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} }
  function showBar() {
    if (window.emIsApp || bar) return;
    // wait until the splash / welcome screens are gone
    if (document.querySelector(".ob-wrap, .sp-wrap, .modal-backdrop")) { setTimeout(showBar, 5000); return; }
    addCss();
    bar = document.createElement("div");
    bar.className = "emi-bar";
    bar.setAttribute("role", "dialog");
    bar.innerHTML = '<img src="/icon-192.png" alt=""><div class="t"><b>Get the EduMaldives app</b><small>Open it from your home screen, like any app.</small></div>' +
      '<button type="button" class="emi-go">Install</button><button type="button" class="emi-x" aria-label="Not now">×</button>';
    bar.querySelector(".emi-go").onclick = install;
    bar.querySelector(".emi-x").onclick = function () { hideBar(); later(); };
    document.body.appendChild(bar);
  }

  if (!standalone) {
    var last = null;
    try { last = localStorage.getItem(KEY); } catch (e) {}
    var wait = 3 * 24 * 3600 * 1000;
    if (last !== "installed" && (!last || Date.now() - Number(last) > wait)) setTimeout(showBar, 6000);
  }
})();
