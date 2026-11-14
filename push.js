/* EduMaldives: turn on push notifications (web only) */
(function () {
  var VAPID = "BIQ__dJ_lOfIPfAJuMhm-uL6XdNs1fDrpB1QdvPv8wdaxO9qnDzDkKUHbCCnTuQQ5tLJ8w-uTr451mkrg81fhuU";
  var sb = window.__SB; if (!sb) return;
  var LSK = "em-push-ask";
  var ok = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  var ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  var standalone = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || navigator.standalone;
  var get = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  var set = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };
  var b64 = function (s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); var p = "=".repeat((4 - s.length % 4) % 4), r = atob(s + p), a = new Uint8Array(r.length); for (var i = 0; i < r.length; i++) a[i] = r.charCodeAt(i); return a; };
  var reg = ok ? navigator.serviceWorker.register("/sw.js").catch(function () { return null; }) : Promise.resolve(null);

  async function save(sub) {
    var s = await sb.auth.getSession(); var u = s.data && s.data.session && s.data.session.user; if (!u) return;
    var j = sub.toJSON();
    await sb.from("push_subs").upsert({ endpoint: j.endpoint, user_id: u.id, sub: j });
  }
  async function enable() {
    var r = await reg; if (!r) throw new Error("Notifications are not supported on this device.");
    var p = await Notification.requestPermission();
    if (p !== "granted") throw new Error("Notifications are blocked. You can allow them in your browser settings.");
    var sub = await r.pushManager.getSubscription();
    if (!sub) sub = await r.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(VAPID) });
    await save(sub);
  }
  window.__enablePush = enable;

  function card(html, onYes) {
    var d = document.createElement("div");
    d.className = "em-push";
    d.innerHTML = '<div class="em-push-ic">🔔</div><div class="em-push-tx">' + html + '</div><div class="em-push-bt">' + (onYes ? '<button class="em-push-yes">Turn on</button>' : '') + '<button class="em-push-no">' + (onYes ? 'Not now' : 'OK') + '</button></div>';
    document.body.appendChild(d);
    d.querySelector(".em-push-no").onclick = function () { set(LSK, String(Date.now())); d.remove(); };
    if (onYes) d.querySelector(".em-push-yes").onclick = function () {
      var b = this; b.disabled = true; b.textContent = "Turning on…";
      onYes().then(function () { d.querySelector(".em-push-tx").innerHTML = "<b>Notifications are on.</b><span>We'll let you know about approvals, new tasks and marks.</span>"; d.querySelector(".em-push-bt").innerHTML = ""; setTimeout(function () { d.remove(); }, 2500); set(LSK, "on"); })
        .catch(function (e) { d.querySelector(".em-push-tx").innerHTML = "<b>Could not turn on notifications</b><span>" + (e && e.message || "Please try again.") + "</span>"; b.remove(); });
    };
  }
  var css = document.createElement("style");
  css.textContent = ".em-push{position:fixed;z-index:9999;left:12px;right:12px;bottom:calc(84px + env(safe-area-inset-bottom));max-width:440px;margin:0 auto;background:#fff;border:1px solid #e3eaf2;border-radius:16px;box-shadow:0 16px 40px rgba(15,35,60,.18);padding:14px;display:flex;gap:12px;align-items:flex-start;font-family:'DM Sans',system-ui,sans-serif;color:#10233a}.em-push-ic{font-size:22px;line-height:1}.em-push-tx{flex:1;display:flex;flex-direction:column;gap:2px;font-size:14px;color:#41566d}.em-push-tx b{font-size:15px;color:#10233a}.em-push-bt{display:flex;flex-direction:column;gap:6px}.em-push-bt button{border:0;border-radius:10px;padding:8px 12px;font:700 13.5px 'DM Sans',system-ui,sans-serif;cursor:pointer;white-space:nowrap}.em-push-yes{background:#2f7fd1;color:#fff}.em-push-no{background:#eef3f8;color:#33495f}@media(min-width:900px){.em-push{left:auto;right:24px;bottom:24px}}html[data-theme=dark] .em-push{background:#152238;border-color:#2a3d56;color:#e6edf5}html[data-theme=dark] .em-push-tx{color:#c9d6e5}html[data-theme=dark] .em-push-tx b{color:#e6edf5}";
  document.head.appendChild(css);

  sb.auth.getSession().then(async function (r) {
    if (!(r.data && r.data.session)) return;
    var asked = get(LSK);
    if (ok && Notification.permission === "granted") { try { var g = await reg; var s = g && await g.pushManager.getSubscription(); if (s) save(s); else if (g) { s = await g.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(VAPID) }); save(s); } } catch (e) {} return; }
    if (asked && (asked === "on" || Date.now() - Number(asked) < 7 * 864e5)) return;
    setTimeout(function () {
      if (ok && Notification.permission === "default") card("<b>Turn on notifications</b><span>Get told when your plan is approved, when you get a new task and when your work is marked.</span>", enable);
      else if (!ok && ios && !standalone) card("<b>Get notifications on iPhone</b><span>Tap the Share button, then “Add to Home Screen”. Open EduMaldives from your Home Screen to turn on notifications.</span>", null);
    }, 4000);
  });
})();
