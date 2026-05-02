let displayImg = null;
let lastImageB64 = null;
let displayText = '';
let analyser = null;
let audioCtx = null;
let audioFile;
let fft;
let isLoaded = false;
let textSearch = '';

let allText = [];
let dataText = [];
let wordPositions = []; 

let wordIndex = 0;
let frameCounter = 0;
const WORD_INTERVAL = 8; 

let counter = 0;

function setup() {
  createCanvas(600, 350).parent(document.getElementById('sketch-canvas'));
  textWrap(WORD);
  textSize(14);
}

function buildWordPositions() {
  wordPositions = dataText.map(word => ({
    word,
    x: random(10, width - 60),
    y: random(20, height - 50)
  }));
  wordIndex = 0;      // reset typewriter
  frameCounter = 0;
}

function draw() {
  // background(220);
  // if (displayImg) image(displayImg, 0, 0, 600, 300);

  // if(isLoaded && fft){
  //   background(0);
  //   let spectrum = fft.analyze();

  //   noStroke();
  //   fill(0, 255, 0);
  //   for (let i = 0; i < spectrum.length; i++) {
  //     let x = map(i, 0, spectrum.length, 0, width);
  //     let h = map(spectrum[i], 0, 255, 0, height);
  //     rect(x, height - h, width / spectrum.length, h);
  //   }
  // }


  // fill(0);
  // text(displayText, 10, 310, 580, 40);


background(220);
  if (displayImg) image(displayImg, 0, 0, 600, 300);

  if (isLoaded && analyser) {
    const spectrum = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(spectrum);

    // Semi-transparent dark overlay
    noStroke();
    fill(0, 0, 0, 120);
    rect(0, 0, width, height);

    // FFT bars on top

    if(allText.length > 0){
      for(let a = 0; a < allText.length; a++){
        text(allText[a], a * width, a * height);
      }
    }
    
    for (let i = 0; i < spectrum.length; i++) {
      fill(0, 255, 0, 200);
      let x = map(i, 0, spectrum.length, 0, width);
      let h = map(spectrum[i], 0, 255, 0, height);
      rect(x, height - h, width / spectrum.length, h);

      fill(255);
      textSize(12);
      // if(i % 24 === 0){
      //   allText.push(dataText[counter]);
      //   counter++; 
      //     // text(textSearch, random(0, width), random(0, height));

      // }
    }

      // Advance typewriter
        frameCounter++;
        if (frameCounter % WORD_INTERVAL === 0 && wordIndex < wordPositions.length) {
          wordIndex++;
        }
        console.log("frame counter: ", frameCounter);

        // Draw only revealed words
        textSize(12);
        for (let i = 0; i < wordIndex; i++) {
          let w = wordPositions[i];
          fill(255, 255, 255, 200);
          text(w.word, w.x, w.y);
        }

  }

  fill(255);
  text(dataText.join(" "), 10, 310, 580, 40);

}

async function runSfx() {
  displayText = 'generating sfx...';
  displayImg = null;

  const q = document.getElementById('sfx-q').value;

  textSearch = q;
  const data = await fetch(`/api/pixabay?q=${encodeURIComponent(q)}`).then(r => r.json());
  if(data.error) { displayText = data.error; return;}

  displayImg = await loadImage(data.url);
  displayText = q;

  const r = await fetch('/api/sfx', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: document.getElementById('sfx-q').value })
  });
  if (!r.ok) { displayText = await r.text(); return; }
  const blob = await r.blob();

  const blobURL = URL.createObjectURL(blob);
  const arrayBuffer = await blob.arrayBuffer(); 

  if (audioCtx) audioCtx.close();
  audioCtx = new AudioContext();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;

  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(analyser);
  analyser.connect(audioCtx.destination);



  isLoaded = true;
  source.start();
  displayText = 'playing sfx...';

  source.onended = () => {
    isLoaded = false;
    displayText = q;
  };

  // new Audio(URL.createObjectURL(blob)).play();
  // displayText = 'playing sfx...';

}

async function runPixabay() {
  // displayText = 'searching...';
  // displayImg = null;
  // const q = document.getElementById('pix-q').value;
  counter = 0;
  const q = document.getElementById('sfx-q').value;
  textSearch = q;
  const data = await fetch(`/api/pixabay?q=${encodeURIComponent(q)}`).then(r => r.json());
  if (data.error) { displayText = data.error; return; }
  displayImg = await loadImage(data.url);
  displayText = q;
}

async function runGemini() {
  // displayText = 'thinking...';
  // displayImg = null;
  // const data = await postJson('/api/gemini-chat', { message: document.getElementById('gem-q').value });
  const data = await postJson('/api/gemini-chat', { message: document.getElementById('sfx-q').value });

  displayText = data.error ?? data.text;
  // dataText = data.text.split(" ");
   dataText = data.text.split(' ').filter(w => w.length > 0);
  buildWordPositions();  // assign positions once here, not in draw()
}

// async function runCloudflareChat() {
//   displayText = 'thinking...';
//   displayImg = null;
//   const data = await postJson('/api/cloudflare-chat', { message: document.getElementById('cf-q').value });
//   displayText = data.error ?? data.text;
// }

// async function runCloudflareImage() {
//   displayText = 'generating image...';
//   displayImg = null;
//   const r = await fetch('/api/cloudflare-image', {
//     method: 'POST', headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ prompt: document.getElementById('cfimg-q').value })
//   });
//   if (!r.ok) { displayText = await r.text(); return; }
//   const blob = await r.blob();
//   lastImageB64 = await blobToBase64(blob);
//   displayImg = await loadImage(URL.createObjectURL(blob));
//   displayText = '';
// }

// async function runCloudflareImg2Img() {
//   if (!lastImageB64) { displayText = 'generate an image first'; return; }
//   displayText = 'transforming...';
//   const r = await fetch('/api/cloudflare-img2img', {
//     method: 'POST', headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ prompt: document.getElementById('cfedit-q').value, image_b64: lastImageB64 })
//   });
//   if (!r.ok) { displayText = await r.text(); return; }
//   const blob = await r.blob();
//   lastImageB64 = await blobToBase64(blob);
//   displayImg = await loadImage(URL.createObjectURL(blob));
//   displayText = '';
// }

// async function runTts() {
//   displayText = 'generating speech...';
//   const r = await fetch('/api/tts', {
//     method: 'POST', headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ text: document.getElementById('tts-q').value })
//   });
//   if (!r.ok) { displayText = await r.text(); return; }
//   const blob = await r.blob();
//   new Audio(URL.createObjectURL(blob)).play();
//   displayText = 'speaking...';
// }



// async function runMusicStem() {
//   displayText = 'Splitting music tracks...';
//   const r = await fetch('/api/music/stem-separation', {
//     method: 'POST', headers: {'Content-Type': 'application/json' },
//     body: JSON.stringify({ prompt: document.getElementById("music-q").value})
//   });
//   if(!r.ok) { displayText = await r.text(); return;}
//   const blob = await r.blob();
//   new Audio(URL.createObjectURL(blob)).play();
//   displayText = 'playing music...';
// }

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
