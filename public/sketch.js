let displayImg = null;
let lastImageB64 = null;
let displayText = '';

function setup() {
  createCanvas(600, 350).parent(document.getElementById('sketch-canvas'));
  textWrap(WORD);
  textSize(14);
}

function draw() {
  background(220);
  if (displayImg) image(displayImg, 0, 0, 600, 300);
  fill(0);
  text(displayText, 10, 310, 580, 40);
}

async function runPixabay() {
  displayText = 'searching...';
  displayImg = null;
  const q = document.getElementById('pix-q').value;
  const data = await fetch(`/api/pixabay?q=${encodeURIComponent(q)}`).then(r => r.json());
  if (data.error) { displayText = data.error; return; }
  displayImg = await loadImage(data.url);
  displayText = '';
}

async function runGemini() {
  displayText = 'thinking...';
  displayImg = null;
  const data = await postJson('/api/gemini-chat', { message: document.getElementById('gem-q').value });
  displayText = data.error ?? data.text;
}

async function runCloudflareChat() {
  displayText = 'thinking...';
  displayImg = null;
  const data = await postJson('/api/cloudflare-chat', { message: document.getElementById('cf-q').value });
  displayText = data.error ?? data.text;
}

async function runCloudflareImage() {
  displayText = 'generating image...';
  displayImg = null;
  const r = await fetch('/api/cloudflare-image', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: document.getElementById('cfimg-q').value })
  });
  if (!r.ok) { displayText = await r.text(); return; }
  const blob = await r.blob();
  lastImageB64 = await blobToBase64(blob);
  displayImg = await loadImage(URL.createObjectURL(blob));
  displayText = '';
}

async function runCloudflareImg2Img() {
  if (!lastImageB64) { displayText = 'generate an image first'; return; }
  displayText = 'transforming...';
  const r = await fetch('/api/cloudflare-img2img', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: document.getElementById('cfedit-q').value, image_b64: lastImageB64 })
  });
  if (!r.ok) { displayText = await r.text(); return; }
  const blob = await r.blob();
  lastImageB64 = await blobToBase64(blob);
  displayImg = await loadImage(URL.createObjectURL(blob));
  displayText = '';
}

async function runTts() {
  displayText = 'generating speech...';
  const r = await fetch('/api/tts', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: document.getElementById('tts-q').value })
  });
  if (!r.ok) { displayText = await r.text(); return; }
  const blob = await r.blob();
  new Audio(URL.createObjectURL(blob)).play();
  displayText = 'speaking...';
}

async function runSfx() {
  displayText = 'generating sfx...';
  const r = await fetch('/api/sfx', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: document.getElementById('sfx-q').value })
  });
  if (!r.ok) { displayText = await r.text(); return; }
  const blob = await r.blob();
  new Audio(URL.createObjectURL(blob)).play();
  displayText = 'playing sfx...';
}

async function postJson(url, body) {
  const r = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return r.json();
}

function blobToBase64(blob) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(blob);
  });
}
