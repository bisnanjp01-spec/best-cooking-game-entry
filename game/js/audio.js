/* audio.js — every sound in Hearth & Ember, synthesized live with WebAudio.
   One job: small synthesized sounds. No audio files, no network. */

var audioCtx = null;
var audioMuted = false;
var sizzleNodes = null;

function ensureAudio() {
  if (audioCtx) {
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  } catch (e) { audioCtx = null; }
  return audioCtx;
}

function audioToggleMute() {
  audioMuted = !audioMuted;
  return audioMuted;
}

function playTone(freq, dur, type, vol, slideTo) {
  if (audioMuted) return;
  var ctx = ensureAudio();
  if (!ctx) return;
  try {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
    gain.gain.setValueAtTime(vol || 0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
  } catch (e) { /* sound is garnish, never fatal */ }
}

function playNoiseBurst(dur, vol, filterFreq) {
  if (audioMuted) return;
  var ctx = ensureAudio();
  if (!ctx) return;
  try {
    var len = Math.floor(ctx.sampleRate * dur);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = filterFreq || 1200;
    var gain = ctx.createGain();
    gain.gain.value = vol || 0.2;
    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    src.start();
  } catch (e) { /* ignore */ }
}

function playPickup() { playTone(520, 0.08, "triangle", 0.12, 760); }
function playPlace() { playTone(300, 0.08, "triangle", 0.12, 220); }
function playChop() { playNoiseBurst(0.07, 0.25, 900); playTone(140, 0.06, "square", 0.08, 90); }
function playChopDone() { playTone(660, 0.1, "triangle", 0.14); playTone(880, 0.14, "triangle", 0.12); }
function playSizzleTick() { playNoiseBurst(0.12, 0.05, 4000); }
function playDing() {
  playTone(880, 0.18, "sine", 0.16);
  setTimeout(function () { playTone(1318, 0.3, "sine", 0.14); }, 90);
}
function playServe() {
  playTone(523, 0.12, "triangle", 0.15);
  setTimeout(function () { playTone(659, 0.12, "triangle", 0.15); }, 90);
  setTimeout(function () { playTone(784, 0.25, "triangle", 0.16); }, 180);
}
function playAlarm() { playTone(980, 0.16, "square", 0.07, 940); setTimeout(function () { playTone(980, 0.16, "square", 0.07, 940); }, 200); }
function playError() { playTone(180, 0.18, "sawtooth", 0.1, 120); }
function playExpire() { playTone(420, 0.3, "sawtooth", 0.1, 180); }
function playGameOver() {
  var notes = [523, 392, 330, 262];
  for (var i = 0; i < notes.length; i++) {
    (function (n, d) { setTimeout(function () { playTone(n, 0.3, "triangle", 0.15); }, d); })(notes[i], i * 220);
  }
}
function playStartJingle() {
  var notes = [262, 330, 392, 523];
  for (var i = 0; i < notes.length; i++) {
    (function (n, d) { setTimeout(function () { playTone(n, 0.2, "triangle", 0.14); }, d); })(notes[i], i * 130);
  }
}
