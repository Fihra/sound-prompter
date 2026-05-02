// One p5 sketch demonstrating all 7 APIs.
// Each section mirrors the plain HTML widget: label + input + button.

let displayImg = null;
let lastImageB64 = null;
let displayText = '';

let pixInput, gemInput, cfChatInput, cfImgInput, cfEditInput, ttsInput, sfxInput;

function setup() {
  createCanvas(500, 300).parent(document.querySelector('main'));
  textWrap(WORD);
  textSize(14);

  const section = document.querySelector('.p5-section');

  // ---- Pixabay ----
  createP('Pixabay (image search)').parent(section).style('margin', '4px 0');
  pixInput = createInput('frog').parent(section);
  pixInput.size(200);
  createButton('search').parent(section).mousePressed(async () => {
    displayText = 'searching...';
    const data = await fetch(`/api/pixabay?q=${encodeURIComponent(pixInput.value())}`).then(r => r.json());
    if (data.error) { displayText = data.error; return; }
    displayImg = await loadImage(data.url);
    displayText = '';
  });

  // ---- Gemini chat ----
  createP('Gemini (chat)').parent(section).style('margin', '4px 0');
  gemInput = createInput('say hi').parent(section);
  gemInput.size(200);
  createButton('send').parent(section).mousePressed(async () => {
    displayText = 'thinking...';
    displayImg = null;
    const data = await postJson('/api/gemini-chat', { message: gemInput.value() });
    displayText = data.error ?? data.text;
  });

  // ---- Cloudflare chat ----
  createP('Cloudflare (chat — Llama 4 Scout)').parent(section).style('margin', '4px 0');
  cfChatInput = createInput('say hi').parent(section);
  cfChatInput.size(200);
  createButton('send').parent(section).mousePressed(async () => {
    displayText = 'thinking...';
    displayImg = null;
    const data = await postJson('/api/cloudflare-chat', { message: cfChatInput.value() });
    displayText = data.error ?? data.text;
  });

  // ---- Cloudflare text-to-image ----
  createP('Cloudflare (text-to-image — Flux 1 Schnell)').parent(section).style('margin', '4px 0');
  cfImgInput = createInput('a frog wearing a top hat').parent(section);
  cfImgInput.size(200);
  createButton('generate').parent(section).mousePressed(async () => {
    displayText = 'generating image...';
    displayImg = null;
    const r = await fetch('/api/cloudflare-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: cfImgInput.value() })
    });
    if (!r.ok) { displayText = await r.text(); return; }
    const blob = await r.blob();
    lastImageB64 = await blobToBase64(blob);
    displayImg = await loadImage(URL.createObjectURL(blob));
    displayText = '';
  });

  // ---- Cloudflare img2img ----
  createP('Cloudflare (img2img — Stable Diffusion 1.5)').parent(section).style('margin', '4px 0');
  cfEditInput = createInput('make it watercolor').parent(section);
  cfEditInput.size(200);
  createButton('transform last image').parent(section).mousePressed(async () => {
    if (!lastImageB64) { displayText = 'generate an image first'; return; }
    displayText = 'transforming...';
    const r = await fetch('/api/cloudflare-img2img', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: cfEditInput.value(), image_b64: lastImageB64 })
    });
    if (!r.ok) { displayText = await r.text(); return; }
    const blob = await r.blob();
    lastImageB64 = await blobToBase64(blob);
    displayImg = await loadImage(URL.createObjectURL(blob));
    displayText = '';
  });

  // ---- ElevenLabs TTS ----
  createP('ElevenLabs (text-to-speech)').parent(section).style('margin', '4px 0');
  ttsInput = createInput('Hello there!').parent(section);
  ttsInput.size(200);
  createButton('speak').parent(section).mousePressed(async () => {
    displayText = 'generating speech...';
    const r = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: ttsInput.value() })
    });
    if (!r.ok) { displayText = await r.text(); return; }
    const blob = await r.blob();
    new Audio(URL.createObjectURL(blob)).play();
    displayText = 'speaking...';
  });

  // ---- ElevenLabs SFX ----
  createP('ElevenLabs (sound effects)').parent(section).style('margin', '4px 0');
  sfxInput = createInput('thunder crash').parent(section);
  sfxInput.size(200);
  createButton('generate').parent(section).mousePressed(async () => {
    displayText = 'generating sfx...';
    const r = await fetch('/api/sfx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: sfxInput.value() })
    });
    if (!r.ok) { displayText = await r.text(); return; }
    const blob = await r.blob();
    new Audio(URL.createObjectURL(blob)).play();
    displayText = 'playing sfx...';
  });
}

function draw() {
  background(220);
  if (displayImg) image(displayImg, 0, 0, 500, 250);
  fill(0);
  text(displayText, 10, 260, 480, 40);
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
