const OCTAVES = 8;
let cloudTicker = 10;

const setupFractalbm = (buf) => {
    buf.pixelDensity(1);
    buf.background(0);
    generateClouds(buf);
}

const drawFractalbm = (buf, data) => {
  if (cloudTicker <= 0) {
    updateClouds(buf, data, 100, 100, 30);
    cloudTicker = 10;
  }
  cloudTicker--;
}

function generateClouds(buf) {
    buf.loadPixels();
    for (let x = 0; x < buf.width; x++) {
        for (let y = 0; y < buf.height; y++) {
          let total = 0;
          let frequency = 0.02;
          let amplitude = 1;
          let maxAmplitude = 0;

          for (let o = 0; o < OCTAVES; o++) {
            let vnoise = noise(x * frequency, y * frequency)
            let snoise =  abs(vnoise * 2 - 1);
            let nnoise = (1 - snoise) ** 2;
              total += amplitude * nnoise;
              maxAmplitude += amplitude;

              amplitude *= 0.5;
              frequency *= 2;
          }

          let normalizedTotal = total / maxAmplitude;
          let col = normalizedTotal;
          let index = (x + y * buf.width) * 4;

          let r = 255;
          let g = 216;
          let b = 252;

          buf.pixels[index] = col * r;      // RED
          buf.pixels[index + 1] = col * g;  // GREEN
          buf.pixels[index + 2] = col * b;  // BLUE
          buf.pixels[index + 3] = 255;  // ALPHA
        }
    }
    buf.updatePixels();
}

function updateClouds(buf, data, cx, cy, r) {
  if (data) {
    let { loudness } = data;

    // if (loudness > 30 && cloudTicker < )
    // ALPHA = loudness
    let aloudness = loudness;
    if (aloudness > 70) aloudness = 70;
    let alpha = map(aloudness, 0, 70, 0, 255);

    buf.loadPixels();
    for (let x = 0; x < buf.width; x++) {
      for (let y = 0; y < buf.height; y++) {
        // let dx = cx - x;
        // let dy = cy - y;
        // if (dx*dx + dy*dy <= r*r) {
          let index = (x + y * buf.width) * 4;

          buf.pixels[index] = buf.pixels[index] + random(-1,1);
          buf.pixels[index + 1] = buf.pixels[index + 1] + random(-1,1);
          buf.pixels[index + 2] = buf.pixels[index + 2] + random(-1,1);
          buf.pixels[index + 3] = alpha;
        // }
      }
    }
    buf.updatePixels();
    console.log("Done");
  }
}