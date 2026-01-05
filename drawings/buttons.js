let buttonX;

class soundToggleButton {
  constructor(buf, text, song) {
    this.button = createButton(text);
    // let buttonY = (buf.height - this.button.height) / 2;
    this.button.position(buttonX, 20);
    this.button.mousePressed(() => toggleSong(song));

    buttonX += this.button.width + 10;
  }
}

function toggleSong(song) {
  if (currentSong) {
    if (currentSong == mic) {
      mic.stop();
      fft.setInput();
    } else {
      currentSong.pause();
    }
  }

  currentSong = song;
  if (currentSong == mic) {
    mic.start();
    fft.setInput(mic);
  } else {
    song.play();
  }
}

const setupButtons = (buf) => {
  buttonX = 10;

  console.log("1");
  buf.micbutton = new soundToggleButton(buf, 'mic', mic);
  buf.song1button = new soundToggleButton(buf, 'Clair de lune', song1);
  buf.song2button = new soundToggleButton(buf, 'Symphony #9', song2);
}

const drawButtons = (buf, data) => {}