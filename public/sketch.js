// One p5 sketch demonstrating all 7 APIs.
// Each button triggers a different endpoint. Output appears on the canvas.

let displayImg = null;
let lastImageB64 = null;
let displayText = '';
let promptInput;

function setup() {
  createCanvas(500, 500);
  textWrap(WORD);
  textSize(14);

  promptInput = createInput('a frog wearing a top hat');
  promptInput.size(300);

  // ---- Pixabay ----
  createButton('Pixabay search').mousePressed(async () => {
    displayText = 'searching pixabay...';
    const data = await fetch(`/api/pixabay?q=${encodeURIComponent(promptInput.value())}`).then(r => r.json());
    if (data.error) { displayText = data.error; return; }
    displayImg = await loadImage(data.url);
    displayText = '';
  });

  // ---- Gemini chat ----
  createButton('Gemini chat').mousePressed(async () => {
    displayText = 'thinking...';
    const data = await postJson('/api/gemini-chat', { message: promptInput.value() });
    displayText = data.error ?? data.text;
  });

  // ---- Cloudflare chat ----
  createButton('Cloudflare chat').mousePressed(async () => {
    displayText = 'thinking...';
    const data = await postJson('/api/cloudflare-chat', { message: promptInput.value() });
    displayText = data.error ?? data.text;
  });

  // ---- Cloudflare text-to-image ----
  createButton('Cloudflare generate image').mousePressed(async () => {
    displayText = 'generating image...';
    const r = await fetch('/api/cloudflare-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptInput.value() })
    });
    if (!r.ok) { displayText = await r.text(); return; }
    const blob = await r.blob();
    lastImageB64 = await blobToBase64(blob);
    displayImg = await loadImage(URL.createObjectURL(blob));
    displayText = '';
  });

  // ---- Cloudflare img2img ----
  createButton('Cloudflare transform image').mousePressed(async () => {
    if (!lastImageB64) { displayText = 'generate an image first'; return; }
    displayText = 'transforming...';
    const r = await fetch('/api/cloudflare-img2img', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptInput.value(), image_b64: lastImageB64 })
    });
    if (!r.ok) { displayText = await r.text(); return; }
    const blob = await r.blob();
    lastImageB64 = await blobToBase64(blob);
    displayImg = await loadImage(URL.createObjectURL(blob));
    displayText = '';
  });

  // ---- ElevenLabs TTS ----
  createButton('ElevenLabs speak').mousePressed(async () => {
    displayText = 'generating speech...';
    const r = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: promptInput.value() })
    });
    if (!r.ok) { displayText = await r.text(); return; }
    const blob = await r.blob();
    new Audio(URL.createObjectURL(blob)).play();
    displayText = 'speaking...';
  });

  // ---- ElevenLabs SFX ----
  createButton('ElevenLabs sfx').mousePressed(async () => {
    displayText = 'generating sfx...';
    const r = await fetch('/api/sfx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptInput.value() })
    });
    if (!r.ok) { displayText = await r.text(); return; }
    const blob = await r.blob();
    new Audio(URL.createObjectURL(blob)).play();
    displayText = 'playing sfx...';
  });
}

function draw() {
  background(220);
  if (displayImg) image(displayImg, 0, 0, 500, 350);
  fill(0);
  text(displayText, 10, 360, 480, 130);
}

async function postJson(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return r.json();
}

function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(blob);
  });
}
