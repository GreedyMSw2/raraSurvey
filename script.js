// ─────────────────────────────────────────────
//  EmailJS CONFIG  ← fill these in!
// ─────────────────────────────────────────────
var EMAILJS_PUBLIC_KEY  = "VM2CNcwmTqCTZ6cOU";   // from EmailJS → Account → API Keys
var EMAILJS_SERVICE_ID  = "service_jfqh5yc";   // from EmailJS → Email Services
var EMAILJS_TEMPLATE_ID = "template_eo2ebou";  // from EmailJS → Email Templates
// ─────────────────────────────────────────────

var current       = 1;
var audioCtx      = null;
var selectedFeeling   = null;
var selectedLocation  = null;
var sessionStart  = Date.now();

// ── EmailJS init ──────────────────────────────
(function initEmailJS() {
  var script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  script.onload = function () {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  };
  document.head.appendChild(script);
})();

// ── Send helper ───────────────────────────────
function sendSurveyEvent(eventName, extraData) {
  var payload = Object.assign({
    event       : eventName,
    timestamp   : new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
    elapsed_sec : Math.round((Date.now() - sessionStart) / 1000),
    location    : selectedLocation || '-',
    feeling     : selectedFeeling  || '-',
    user_agent  : navigator.userAgent
  }, extraData || {});

  if (typeof emailjs === 'undefined') {
    console.warn('EmailJS not loaded yet, retrying...');
    setTimeout(function () { sendSurveyEvent(eventName, extraData); }, 800);
    return;
  }

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload)
    .then(function ()    { console.log('[Survey] Event sent:', eventName); })
    .catch(function (err){ console.error('[Survey] EmailJS error:', err);  });
}

// ── Audio helpers ─────────────────────────────
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playYesSound() {
  try {
    var ctx = getAudioCtx();
    [523.25, 659.25, 783.99].forEach(function (freq, i) {
      var osc  = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = freq;
      var t = ctx.currentTime + i * 0.07;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      osc.start(t); osc.stop(t + 0.5);
    });
  } catch (e) {}
}

function playNoSound() {
  try {
    var ctx = getAudioCtx();
    var osc  = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

// ── Survey actions ────────────────────────────
function pressYes() {
  playYesSound();
  sendSurveyEvent('answered_yes_to_survey');
  goTo(2);
}

function pressNo() {
  playNoSound();
  sendSurveyEvent('pressed_no');
  if (navigator.vibrate) navigator.vibrate([60, 40, 60, 40, 80]);
  var btn = document.getElementById('btnNo');
  btn.classList.remove('shaking');
  void btn.offsetWidth;
  btn.classList.add('shaking');
  btn.addEventListener('animationend', function () { btn.classList.remove('shaking'); }, { once: true });
}

function selectOption(el, groupId, feeling) {
  document.querySelectorAll('#' + groupId + ' .option').forEach(function (o) {
    o.classList.remove('selected');
  });
  el.classList.add('selected');

  var label = el.querySelector('.option-text') ? el.querySelector('.option-text').textContent.trim() : '';

  if (feeling) {
    selectedFeeling = feeling;
    sendSurveyEvent('selected_feeling', { feeling: feeling, feeling_label: label });
  } else {
    selectedLocation = label;
    sendSurveyEvent('selected_location', { location_choice: label });
  }
}

function goTo(n) {
  document.getElementById('q' + current).style.display = 'none';
  current = n;
  var next = document.getElementById('q' + n);
  next.style.display = 'block';
  next.style.animation = 'none';
  void next.offsetHeight;
  next.style.animation = 'rise 0.4s cubic-bezier(0.22,1,0.36,1) both';
  updateDots(n);
}

function showVideoPage() {
  var feeling = selectedFeeling || 'happy';

  sendSurveyEvent('survey_completed', {
    feeling        : feeling,
    location       : selectedLocation || '-',
    total_time_sec : Math.round((Date.now() - sessionStart) / 1000)
  });

  document.getElementById('surveyWrap').style.display = 'none';
  document.getElementById('videoPage').style.display  = 'block';
  document.getElementById('vp-' + feeling).style.display = 'flex';

  var vid  = document.getElementById('vid-' + feeling);
  var hint = document.getElementById('hint-' + feeling);
  if (vid) {
    vid.currentTime = 0;
    vid.muted = false;
    var playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise.catch(function () {
        vid.muted = true;
        vid.play().catch(function () {});
        if (hint) hint.style.display = 'block';
      });
      playPromise.then(function () {
        if (hint) hint.classList.add('hidden');
      });
    }
  }
}

function unmuteVideo(vidId, hintId) {
  var vid  = document.getElementById(vidId);
  var hint = document.getElementById(hintId);
  if (vid)  { vid.muted = false; vid.play().catch(function () {}); }
  if (hint) { hint.classList.add('hidden'); }
}

function updateDots(n) {
  for (var i = 1; i <= 3; i++) {
    document.getElementById('d' + i).classList.toggle('active', i === n);
  }
}
