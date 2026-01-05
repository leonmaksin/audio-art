const setupFreqs = (buf) => {}

const drawFreqs = (buf, data) => {
  if (data) {
    let { spectrum } = data;
    buf.background(200);
    buf.beginShape();
    buf.vertex(0, buf.height);
    for (let i = 0; i < spectrum.length; i++) {
      buf.vertex(
        map(i, 0, spectrum.length, 0, buf.width), 
        buf.height - map(spectrum[i], 0, 255, 0, buf.height)
      );
    }
    buf.vertex(buf.width, buf.height);
    buf.endShape();
  }
}