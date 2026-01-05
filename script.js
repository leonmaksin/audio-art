let mic, fft, nyquist;
let currentSong;
let noteLiterals = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];;
const nbins = 8192;
let dashFont;
let libFont;
let asteroidimg;
let asteroidbg;

function updateGestureBannerSelection() {
  const banner = document.getElementById('gesture-banner');
  if (!banner) {
    return;
  }

  const shouldShow = !currentSong;
  banner.classList.toggle('is-hidden', !shouldShow);
  document.body.classList.toggle('gesture-banner-visible', shouldShow);
  if (typeof requestRelayout === 'function') {
    requestRelayout();
  }
}

function getGestureBannerOffset() {
  const banner = document.getElementById('gesture-banner');
  if (!banner || banner.classList.contains('is-hidden')) {
    return 0;
  }
  return Math.ceil(banner.getBoundingClientRect().height);
}

updateGestureBannerSelection();

function preload() {
  dashFont = loadFont('assets/SourceCodePro-SemiBold.ttf');
  libFont = loadFont('assets/Platypi-Regular.ttf');
  asteroidimg = loadImage('assets/asteroid.png');
  asteroidbg = loadImage('assets/asteroidbg.jpeg');
}

class graphicBuffer {
  constructor(setupfn, drawfn, x, y, w, h) {
    this.setupfn = setupfn;
    this.drawfn = drawfn;
    this.buffer = createGraphics(w, h);
    this.x = x;
    this.y = y;
  }

  setup() {
    this.setupfn(this.buffer);
  }

  draw(data) {
    this.drawfn(this.buffer, data);
    image(this.buffer, this.x, this.y);
  }
}

let buffers = [];

function setup() {
  createCanvas(1200, 1250);
  noFill();

  nyquist = sampleRate() / 2;

  mic = new p5.AudioIn();
  fft = new p5.FFT(0.5);

  buffers.push(new graphicBuffer(
    setupButtons, drawButtons, 0, 0, 800, 50
  ));

  buffers.push(new graphicBuffer(
    setupDashboard, drawDashboard, 0, 50, 400, 400
  ));

  buffers.push(new graphicBuffer(
    setupFreqs, drawFreqs, 400, 50, 400, 400
  ));

  buffers.push(new graphicBuffer(
    setupStrings, drawStrings, 0, 450, 400, 400
  ));

  buffers.push(new graphicBuffer(
    setupAsteroids, drawAsteroids, 400, 450, 400, 400
  ));

  buffers.push(new graphicBuffer(
    setupVoronoi, drawVoronoi, 800, 50, 400, 400
  ));

  buffers.push(new graphicBuffer(
    setupLibrary, drawLibrary, 800, 450, 400, 400
  ));

  // buffers.push(new graphicBuffer(
  //   setupFractalbm, drawFractalbm, 0, 850, 400, 400
  // ));

  buffers.forEach((buffer) => buffer.setup());
}

function draw() {
  let data = null;
  if (currentSong) {
    let spectrum = fft.analyze(nbins); // 1024 frequency bins
    let centroid = fft.getCentroid(); // average frequency, sound brigtness
    let loudness = fft.getEnergy(20, 20000); // loudness [not working]

    // C, C#, D, D#, E, F, F#, G, G#, A, A#, B
    let noteFreqs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // notes by magnitude
    let noteCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // note counts

    spectrum.forEach((magnitude, idx) => {
      let freq = (idx - 0.5) * (nyquist / nbins);
      let note = freqToMidi(freq) % 12;
      noteFreqs[note] += magnitude;
      noteCounts[note]++;
    });
    noteFreqs = noteFreqs.map((freq, idx) => freq / noteCounts[idx]);

    const arithmeticMean = spectrum.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0) / spectrum.length;
    const geometricMean = Math.exp(spectrum.reduce((accumulator, currentValue) => {
      if (currentValue > 0) {
        return accumulator + Math.log(currentValue);
      } else {
        return accumulator;
      }
    }, 0) / spectrum.length);
    let flatness = geometricMean / arithmeticMean;

    data = {
      spectrum,
      centroid,
      loudness,
      noteFreqs,
      flatness
    }
  }
  
  buffers.forEach((buffer) => buffer.draw(data));
}
