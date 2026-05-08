// ─────────────────────────────────────────────
//  EmailJS CONFIG
// ─────────────────────────────────────────────
var EMAILJS_PUBLIC_KEY  = "VM2CNcwmTqCTZ6cOU";
var EMAILJS_SERVICE_ID  = "service_jfqh5yc";
var EMAILJS_TEMPLATE_ID = "template_eo2ebou";

var current          = 1;
var audioCtx         = null;
var selectedFeeling  = null;
var selectedLocation = null;
var sessionStart     = Date.now();
var emailjsReady     = false;

(function initEmailJS() {
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  s.onload = function() {
    try { emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); emailjsReady = true; } catch(e) {}
  };
  document.head.appendChild(s);
})();

function sendSurveyEvent(eventName, extraData) {
  var payload = Object.assign({
    event       : eventName,
    timestamp   : new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
    elapsed_sec : Math.round((Date.now() - sessionStart) / 1000),
    location    : selectedLocation || '-',
    feeling     : selectedFeeling  || '-',
    user_agent  : navigator.userAgent
  }, extraData || {});
  if (!emailjsReady) { setTimeout(function(){ sendSurveyEvent(eventName, extraData); }, 800); return; }
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload).catch(function(){});
}

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playYesSound() {
  try {
    var ctx = getAudioCtx();
    [523.25, 659.25, 783.99].forEach(function(freq, i) {
      var osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = freq;
      var t = ctx.currentTime + i * 0.07;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      osc.start(t); osc.stop(t + 0.5);
    });
  } catch(e) {}
}
function playNoSound() {
  try {
    var ctx = getAudioCtx(), osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
  } catch(e) {}
}

function pressYes() { playYesSound(); sendSurveyEvent('answered_yes_to_survey'); goTo(2); }
function pressNo() {
  playNoSound(); sendSurveyEvent('pressed_no');
  if (navigator.vibrate) navigator.vibrate([60,40,60,40,80]);
  var btn = document.getElementById('btnNo');
  btn.classList.remove('shaking'); void btn.offsetWidth; btn.classList.add('shaking');
  btn.addEventListener('animationend', function(){ btn.classList.remove('shaking'); }, { once: true });
}

function selectOption(el, groupId, feeling) {
  document.querySelectorAll('#' + groupId + ' .option').forEach(function(o){ o.classList.remove('selected'); });
  el.classList.add('selected');
  var label = el.querySelector('.option-text').textContent.trim();
  if (feeling) { selectedFeeling = feeling; sendSurveyEvent('selected_feeling', { feeling: feeling, feeling_label: label }); }
  else { selectedLocation = label; sendSurveyEvent('selected_location', { location_choice: label }); }
}

function goTo(n) {
  if (current === 2 && n === 3 && !selectedLocation) {
    var opts = document.getElementById('opts2');
    if (opts) { opts.style.animation = 'none'; void opts.offsetHeight; opts.style.animation = 'shake-hint 0.4s ease both'; }
    return;
  }
  document.getElementById('q' + current).style.display = 'none';
  current = n;
  var next = document.getElementById('q' + n);
  next.style.display = 'block'; next.style.animation = 'none'; void next.offsetHeight;
  next.style.animation = 'rise 0.4s cubic-bezier(0.22,1,0.36,1) both';
  updateDots(n);
}

function updateDots(n) {
  for (var i = 1; i <= 3; i++)
    document.getElementById('d' + i).classList.toggle('active', i === n);
}

// ═══════════════════════════════════════════
//  SONG + KARAOKE SYSTEM
// ═══════════════════════════════════════════

var SONGS = {
  happy: {
    file     : 'senang.wav',
    title    : 'Beauty And A Beat',
    artist   : 'Justin Bieber ft. Nicki Minaj 🎀',
    emoji    : '🎉',
    headline : 'Anjay lagi happy nih yee!',
    lyrics   : [
      { time: 12,  text: "Show you off, tonight I wanna show you off",          emoji: '✨' },
      { time: 19,  text: "What you got? A billion couldn't ever buy it",        emoji: '💎' },
      { time: 27,  text: "We gonna party like it's 3012 tonight",               emoji: '🥳' },
      { time: 35,  text: "I wanna show you all the finer things in life",       emoji: '🌟' },
      { time: 42,  text: "Forget about the world, we're young tonight",         emoji: '🌙' },
      { time: 50,  text: "I'm coming for ya, I'm coming for ya",                emoji: '💫' },
      { time: 57,  text: "Cause all I need is a beauty and a beat",             emoji: '🎵' },
      { time: 64,  text: "Who can make my life complete",                       emoji: '💖' },
      { time: 71,  text: "When the music makes you move",                       emoji: '🕺' },
      { time: 78,  text: "Baby, do it like you do",                             emoji: '😍' },
      { time: 88,  text: "Body rock, girl I can feel your body rock",           emoji: '🔥' },
      { time: 95,  text: "You're on the hottest ticket now",                    emoji: '🎟️' },
      { time: 103, text: "We gonna party like it's 3012 tonight",               emoji: '🥳' },
      { time: 118, text: "Cause all I need is a beauty and a beat",             emoji: '🎶' },
      { time: 133, text: "When the music makes you move",                       emoji: '🎊' },
      { time: 148, text: "Baby, do it like you do",                             emoji: '💃' }
    ]
  },

  neutral: {
    file     : 'biasa.wav',
    title    : 'Love song-Grrrl Gang',
    artist   : 'buat Shiraa 🌿',
    emoji    : '🙊',
    headline : 'uhh dingin nyooyyy',
    lyrics   : [
      { time: 12,  text: "Heaven sighs when you look into my eyes",             emoji: '😇' },
      { time: 19,  text: "Oh I can breathe when you smile at me",               emoji: '🥰' },
      { time: 27,  text: "I got this feeling inside and I wanna dance",         emoji: '🕺' },
      { time: 35,  text: "Baby, you're the one for me",                         emoji: '💕' },
      { time: 42,  text: "I find all the answers, baby, when you call my name", emoji: '📞' },
      { time: 50,  text: "I find all the answers, baby, when you hold my hand", emoji: '🤝' },
      { time: 62,  text: "I seem to get brighter and it's all because of you",  emoji: '☀️' },
      { time: 72,  text: "You erased all the traces of my impending doom",      emoji: '🌈' },
      { time: 82,  text: "Got this feeling that for once I feel alright",       emoji: '✨' },
      { time: 92,  text: "Baby, you're the one for me",                         emoji: '💕' },
      { time: 102, text: "I find all the answers, baby, when you call my name", emoji: '🎵' },
      { time: 115, text: "Oh darling don't you break my heart",                 emoji: '🫶' }
    ]
  },

  sad: {
    file     : 'seih.wav',
    title    : "I'll Be There For You",
    artist   : 'buat Shiraa 🫂',
    emoji    : '🫂',
    headline : 'nooo jangan cedihh',
    lyrics   : [
      { time: 12,  text: "I know it hurts sometimes",                           emoji: '💔' },
      { time: 19,  text: "But you'll get over it",                              emoji: '🌱' },
      { time: 26,  text: "You'll find another life to live",                    emoji: '🌿' },
      { time: 34,  text: "I know you're sad and tired",                         emoji: '😔' },
      { time: 41,  text: "You've got nothing left to give",                     emoji: '💧' },
      { time: 52,  text: "So when you're caught in a landslide",                emoji: '🌊' },
      { time: 60,  text: "I'll be there for you, I'll be there for you",        emoji: '🫂' },
      { time: 72,  text: "And in the rain, give you sunshine",                  emoji: '🌤️' },
      { time: 82,  text: "Every time that you're lonely",                       emoji: '🌙' },
      { time: 90,  text: "Every time that you're feeling low, you should know", emoji: '💫' },
      { time: 105, text: "I'll be there for you",                               emoji: '🫶' },
      { time: 135, text: "You fell down by the wayside",                        emoji: '🪨' },
      { time: 155, text: "I'll hide in your heartbeat",                         emoji: '❤️' },
      { time: 170, text: "I'll be there for you, you know",                     emoji: '🌈' }
    ]
  }
};
var _audio      = null;
var _mood       = null;
var _rafId      = null;
var _lyricEls   = [];
var _lastActive = -1;
var _starCleanup = null;

function fmt(sec) {
  sec = Math.floor(sec || 0);
  return Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2);
}

// ═══════════════════════════════════════════
//  FALLING STARS CANVAS
// ═══════════════════════════════════════════

function createStarCanvas(mood) {
  // Clean up previous instance if any
  if (_starCleanup) { _starCleanup(); _starCleanup = null; }

  // Dark body background per mood
  var bgs = {
    happy  : 'linear-gradient(160deg, #1a0800 0%, #2e1500 45%, #0d0a1e 100%)',
    neutral: 'linear-gradient(160deg, #080618 0%, #140b2e 45%, #0a1628 100%)',
    sad    : 'linear-gradient(160deg, #040a18 0%, #0b1530 45%, #080c28 100%)'
  };
  document.body.style.transition = 'background 1s ease';
  document.body.style.background = bgs[mood] || bgs.sad;

  var canvas = document.createElement('canvas');
  canvas.id  = 'starCanvas';
  canvas.style.cssText = [
    'position:fixed',
    'top:0', 'left:0',
    'width:100%', 'height:100%',
    'pointer-events:none',
    'z-index:0'
  ].join(';');
  document.body.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  var W = 0, H = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Colour palettes per mood
  var palettes = {
    happy  : ['255,210,100', '255,230,140', '255,255,200', '255,180,80'],
    neutral: ['170,140,255', '140,180,255', '200,180,255', '180,220,255'],
    sad    : ['120,170,255', '160,210,255', '200,230,255', '255,255,255']
  };
  var pal = palettes[mood] || palettes.sad;

  // Build star pool
  var N = 130;
  var stars = [];
  for (var i = 0; i < N; i++) {
    stars.push(makeStar(true));
  }

  function makeStar(scatter) {
    var r = Math.random() * 1.6 + 0.3;
    return {
      x    : Math.random(),
      // Scatter initial y across whole screen; new spawns start at top
      y    : scatter ? Math.random() * 1.1 - 0.05 : -0.02 - Math.random() * 0.06,
      r    : r,
      speed: (Math.random() * 40 + 18) * (1 / (r * 0.6 + 0.6)), // smaller = faster drift
      alpha: Math.random() * 0.55 + 0.15,
      phase: Math.random() * Math.PI * 2,
      rate : Math.random() * 1.2 + 0.4,
      color: pal[Math.floor(Math.random() * pal.length)]
    };
  }

  var lastTs = null;
  var animId;

  function draw(ts) {
    if (!lastTs) lastTs = ts;
    var dt = Math.min((ts - lastTs) * 0.001, 0.05); // cap to avoid jump on tab-switch
    lastTs = ts;

    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.y += (s.speed * dt) / H;

      // Recycle when off-screen bottom
      if (s.y > 1.06) {
        stars[i] = makeStar(false);
        continue;
      }

      var twinkle = 0.55 + 0.45 * Math.sin(ts * 0.001 * s.rate + s.phase);
      var a = s.alpha * twinkle;
      var px = s.x * W;
      var py = s.y * H;

      // Core dot
      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + s.color + ',' + a.toFixed(3) + ')';
      ctx.fill();

      // Soft glow halo on larger stars
      if (s.r > 1.1) {
        var grad = ctx.createRadialGradient(px, py, 0, px, py, s.r * 4);
        grad.addColorStop(0, 'rgba(' + s.color + ',' + (a * 0.35).toFixed(3) + ')');
        grad.addColorStop(1, 'rgba(' + s.color + ',0)');
        ctx.beginPath();
        ctx.arc(px, py, s.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }

    animId = requestAnimationFrame(draw);
  }

  animId = requestAnimationFrame(draw);

  _starCleanup = function() {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
  };
}

// ═══════════════════════════════════════════
//  SURVEY → SONG PAGE
// ═══════════════════════════════════════════

function goToSong() {
  var feeling = selectedFeeling || 'happy';
  sendSurveyEvent('survey_completed', {
    feeling        : feeling,
    location       : selectedLocation || '-',
    total_time_sec : Math.round((Date.now() - sessionStart) / 1000)
  });
  document.getElementById('surveyWrap').style.display = 'none';
  buildSongPage(feeling);
}

function buildSongPage(mood) {
  _mood = mood;
  var song = SONGS[mood];
  var page = document.getElementById('songPage');
  page.style.display = 'block';

  // Tear down any previous audio + RAF
  if (_audio) { _audio.pause(); _audio.src = ''; _audio = null; }
  cancelAnimationFrame(_rafId); _rafId = null;
  _lastActive = -1;

  // Launch star background
  createStarCanvas(mood);

  page.innerHTML = [
    '<div class="song-page mood-' + mood + '">',

    // ── Header: just the emoji ──
    '<div class="song-header">',
      '<div class="song-big-emoji">' + song.emoji + '</div>',
    '</div>',

    // ── Player bar only (no lyric card) ──
    '<div class="player-bar">',
      '<div class="player-top">',
        '<button class="play-btn" id="playBtn" onclick="togglePlay()">▶</button>',
        '<div class="player-info">',
          '<div class="player-song-name">' + song.title + '</div>',
          '<div class="player-artist">' + song.artist + '</div>',
        '</div>',
        '<div class="wave-bars" id="waveBars">',
          '<div class="wb"></div><div class="wb"></div><div class="wb"></div>',
          '<div class="wb"></div><div class="wb"></div><div class="wb"></div>',
        '</div>',
      '</div>',
      '<div class="prog-wrap" id="progWrap" onclick="seekAudio(event)">',
        '<div class="prog-fill" id="progFill"></div>',
      '</div>',
      '<div class="prog-times">',
        '<span id="timeCur">0:00</span>',
        '<span id="timeTot">0:00</span>',
      '</div>',
    '</div>',

    '</div>'
  ].join('');

  // No lyric elements to cache — ignore lyrics completely
  _lyricEls = [];

  // Set up audio
  _audio = new Audio(song.file);
  _audio.volume = 0.32;
  _audio.loop = false;

  _audio.addEventListener('loadedmetadata', function() {
    var el = document.getElementById('timeTot');
    if (el) el.textContent = fmt(_audio.duration);
  });

  _audio.addEventListener('ended', function() { onAudioEnd(); });

  // Auto-play
  _audio.play().then(function() { setPlaying(true); }).catch(function() {});
}

// ═══════════════════════════════════════════
//  PLAYBACK CONTROLS
// ═══════════════════════════════════════════

function setPlaying(playing) {
  var btn   = document.getElementById('playBtn');
  var waves = document.getElementById('waveBars');
  var card  = document.getElementById('lyricCard');
  if (!btn) return;

  if (playing) {
    btn.textContent = '⏸';
    if (waves) waves.classList.add('playing');
    if (card)  card.classList.add('playing');
    startRaf();
  } else {
    btn.textContent = '▶';
    if (waves) waves.classList.remove('playing');
    if (card)  card.classList.remove('playing');
    cancelAnimationFrame(_rafId);
  }
}

function togglePlay() {
  if (!_audio) return;
  if (_audio.paused) {
    _audio.play().then(function() { setPlaying(true); }).catch(function() {});
  } else {
    _audio.pause();
    setPlaying(false);
  }
}

function seekAudio(e) {
  if (!_audio || !_audio.duration) return;
  var rect = document.getElementById('progWrap').getBoundingClientRect();
  var pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  _audio.currentTime = pct * _audio.duration;
  _lastActive = -1; // force lyric refresh
}

function onAudioEnd() {
  setPlaying(false);
  // Reset progress to end position, leave last lyric highlighted
  var fill = document.getElementById('progFill');
  if (fill) fill.style.width = '100%';
}

// ═══════════════════════════════════════════
//  RAF LOOP
// ═══════════════════════════════════════════

function startRaf() {
  cancelAnimationFrame(_rafId);
  function tick() {
    if (!_audio) return;
    updateProgress();
    updateLyrics();
    _rafId = requestAnimationFrame(tick);
  }
  tick();
}

function updateProgress() {
  var cur  = _audio.currentTime || 0;
  var dur  = _audio.duration    || 1;
  var fill = document.getElementById('progFill');
  var tc   = document.getElementById('timeCur');
  if (fill) fill.style.width = (cur / dur * 100).toFixed(2) + '%';
  if (tc)   tc.textContent   = fmt(cur);
}

function updateLyrics() {
  var t    = _audio.currentTime || 0;
  var lyrs = SONGS[_mood].lyrics;

  // Find the active line: last line whose time <= current time
  var active = -1;
  for (var i = lyrs.length - 1; i >= 0; i--) {
    if (t >= lyrs[i].time) { active = i; break; }
  }

  if (active === _lastActive) return;
  _lastActive = active;

  // Update classes
  _lyricEls.forEach(function(el, i) {
    el.classList.remove('active', 'past');
    if (i < active)  el.classList.add('past');
    if (i === active) el.classList.add('active');
  });

  // Smooth-scroll active line to the vertical centre of the card
  if (active >= 0 && _lyricEls[active]) {
    var card = document.getElementById('lyricCard');
    var el   = _lyricEls[active];
    if (card && el) {
      var target = el.offsetTop - (card.clientHeight / 2) + (el.clientHeight / 2);
      card.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
    }
  }
}
