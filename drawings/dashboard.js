
const setupDashboard = (buf) => {
  buf.strokeWeight(3);
  buf.textFont(dashFont);
  buf.textSize(25);
}

const drawDashboard = (buf, data) => {
  if (data) {
    let { spectrum, centroid, loudness, noteFreqs, flatness } = data;

    buf.background(100);

    buf.text("Centroid: " + Math.floor(centroid*100)/100, 10, 35);
    buf.text("Loudness: " + Math.floor(loudness*100)/100, 10, 65);
    buf.text("Flatness: " + Math.floor(flatness*100)/100, 10, 95);

    let cx = 200;
    let cy = 250;
    let rad = 120;
    buf.fill(100);
    buf.ellipse(cx, cy, 2*rad, 2*rad);
    buf.fill(200);
    buf.beginShape();
    for (let i = 0; i < 12; i++) {
      let freq = noteFreqs[i];
      if (freq > 120) freq = 120;
      let radius = map(freq, 0, 120, 0, rad);
      let angle = map(i, 0, 12, 0, TWO_PI);
      let x = cx + radius * cos(angle);
      let y = cy + radius * sin(angle);
      let xnote = cx + rad * cos(angle);
      let ynote = cy + rad * sin(angle);

      buf.line(cx, cy, xnote, ynote);
      buf.text(noteLiterals[i], xnote - 10, ynote + 10);
      buf.vertex(x, y);
    }
    buf.endShape(CLOSE);    
  }  
}