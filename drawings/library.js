let libraryWords;
let libRemove = 0;

class libLetter {
  constructor(note, size) {
    this.note = note;
    this.size = min(size, 50);
  }
}

const setupLibrary = (buf) => {
  libraryWords = [];
  buf.colorMode(RGB, 255);
  buf.textSize(20);
  buf.textWrap(CHAR);
  buf.textFont(libFont);
}

const drawLibrary = (buf, data) => {
  if (data) {
    let { noteFreqs, loudness } = data;

    if (loudness > 25) {
      let i = 0;
      noteFreqs.forEach((freq, idx) => {
        if (freq > noteFreqs[i]) i = idx;
      })
      note = noteLiterals[i];

      libraryWords.push(new libLetter(note, loudness / 2));
      if (libRemove) {
        for (let i = 0; i < libRemove; i++) libraryWords.shift();
        libRemove = 0;
      }
    }

    drawWords(buf);
  }
}

function drawWords(buf) {
  buf.background(246, 231, 210);
  buf.push();
  let y = 0; // Initial y
  let nextLine = [];
  let lineHeight = 0;
  let lineWidth = 0;
  for (let lett of libraryWords.slice().reverse()) {
    buf.textSize(lett.size);
    let textWidth = buf.textWidth(lett.note);

    if (10 + lineWidth > buf.width - 20) {
      y += lineHeight;
      drawLine(buf, nextLine, lineHeight, y);
      lineHeight = 0;
      lineWidth = 0;
      nextLine = [];
    } else {
      nextLine.push(lett);
      lineHeight = Math.max(lineHeight, lett.size);
      lineWidth += textWidth;
    }
  }
  y += lineHeight;
  drawLine(buf, nextLine, lineHeight, y);
  buf.pop();

}

function drawLine(buf, nextLine, lineHeight, y) {
  if (y > buf.height + lineHeight) {
    libRemove = nextLine.length;
  } else {
    let x = 10;
    nextLine.forEach((lett) => {
      buf.textSize(lett.size);
      let textWidth = buf.textWidth(lett.note);
      buf.text(lett.note, x, y);
      x += textWidth;
    })
  }
}