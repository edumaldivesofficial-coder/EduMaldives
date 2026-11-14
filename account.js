/* EduMaldives: forgot password + set a new password (web only) */
(function () {
  var sb = window.__SB; if (!sb) return;
  var css = document.createElement("style");
  css.textContent = ".em-acc-bd{position:fixed;inset:0;z-index:10000;background:rgba(10,25,45,.45);display:flex;align-items:center;justify-content:center;padding:16px}.em-acc{width:100%;max-width:400px;background:#fff;border-radius:20px;padding:22px;box-shadow:0 24px 60px rgba(10,25,45,.3);font-family:'DM Sans',system-ui,sans-serif;color:#10233a;display:flex;flex-direction:column;gap:12px}.em-acc h3{margin:0;font:800 21px Manrope,'DM Sans',sans-serif}.em-acc p{margin:0;font-size:14.5px;color:#41566d;line-height:1.5}.em-acc label{display:flex;flex-direction:column;gap:6px;font-size:13.5px;font-weight:700;color:#33495f}.em-acc input{height:46px;border:1px solid #d5e0eb;border-radius:12px;padding:0 12px;font:500 16px 'DM Sans',sans-serif;color:#10233a}.em-acc .row{display:flex;gap:8px;margin-top:4px}.em-acc button{flex:1;height:46px;border:0;border-radius:12px;font:700 15px 'DM Sans',sans-serif;cursor:pointer}.em-acc .go{background:#2f7fd1;color:#fff}.em-acc .no{background:#eef3f8;color:#33495f}.em-acc .msg{font-size:14px;font-weight:600;border-radius:10px;padding:10px 12px}.em-acc .msg.e{background:#fdecec;color:#b42318}.em-acc .msg.k{background:#e8f6ee;color:#1d6b40}html[data-theme=dark] .em-acc{background:#152238;color:#e6edf5}html[data-theme=dark] .em-acc p{color:#c9d6e5}html[data-theme=dark] .em-acc input{background:#0f1a2c;border-color:#2a3d56;color:#e6edf5}";
  document.head.appendChild(css);
  function modal(title, text, fields, goLabel, onGo) {
    var bd = document.createElement("div"); bd.className = "em-acc-bd";
    bd.innerHTML = '<form class="em-acc" novalidate><h3></h3><p></p>' + fields.map(function (f) { return '<label>' + f.label + '<input name="' + f.name + '" type="' + f.type + '" autocomplete="' + (f.ac || "off") + '"></label>'; }).join("") + '<div class="msg" hidden></div><div class="row"><button type="button" class="no">Cancel</button><button type="submit" class="go"></button></div></form>';
    bd.querySelector("h3").textContent = title; bd.querySelector("p").textContent = text; bd.querySelector(".go").textContent = goLabel;
    var form = bd.querySelector("form"), msg = bd.querySelector(".msg"), go = bd.querySelector(".go");
    var close = function () { bd.remove(); };
    bd.querySelector(".no").onclick = close;
    bd.onclick = function (e) { if (e.target === bd) close(); };
    var say = function (t, ok) { msg.hidden = false; msg.className = "msg " + (ok ? "k" : "e"); msg.textContent = t; };
    form.onsubmit = function (e) {
      e.preventDefault(); var v = {}; fields.forEach(function (f) { v[f.name] = form.elements[f.name].value.trim(); });
      go.disabled = true; var old = go.textContent; go.textContent = "Please wait…";
      Promise.resolve(onGo(v, say, close)).catch(function (er) { say(er && er.message || "Something went wrong. Please try again."); }).then(function () { go.disabled = false; go.textContent = old; });
    };
    document.body.appendChild(bd);
    return { form: form, close: close };
  }
  window.__forgotPw = function (email) {
    var m = modal("Reset your password", "Enter the email you used to register. We will send you a link to set a new password.", [{ name: "email", label: "Email", type: "email", ac: "email" }], "Send reset link", async function (v, say) {
      if (!/^\S+@\S+\.\S+$/.test(v.email)) return say("Enter a valid email address.");
      var r = await sb.auth.resetPasswordForEmail(v.email.toLowerCase(), { redirectTo: location.origin + "/" });
      if (r.error) return say(/rate limit/i.test(r.error.message) ? "Too many emails sent. Please wait a few minutes and try again." : r.error.message);
      say("Done. Check your email (and the spam folder) for the reset link.", true);
    });
    if (email) m.form.elements.email.value = email;
  };
  var shown = false;
  function newPw() {
    if (shown) return; shown = true;
    modal("Set a new password", "Choose a new password for your EduMaldives account.", [{ name: "p1", label: "New password", type: "password", ac: "new-password" }, { name: "p2", label: "Type it again", type: "password", ac: "new-password" }], "Save password", async function (v, say, close) {
      if (v.p1.length < 6) return say("Use at least 6 characters.");
      if (v.p1 !== v.p2) return say("The two passwords are not the same.");
      var r = await sb.auth.updateUser({ password: v.p1 });
      if (r.error) return say(r.error.message);
      say("Password saved. You are now logged in.", true);
      setTimeout(function () { history.replaceState(null, "", "/"); location.reload(); }, 1200);
    });
  }
  if (/type=recovery/.test(location.hash)) setTimeout(newPw, 600);
  else if (sb.auth.onAuthStateChange) sb.auth.onAuthStateChange(function (ev) { if (ev === "PASSWORD_RECOVERY") newPw(); });
})();
