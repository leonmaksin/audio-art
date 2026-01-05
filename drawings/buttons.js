let buttonX;
let soundButtons = [];
let relayoutScheduled = false;

class soundToggleButton {
  constructor(buf, text, song) {
    this.button = createButton(text);
    // let buttonY = (buf.height - this.button.height) / 2;
    const yOffset = getGestureBannerOffset();
    this.button.position(buttonX, 20 + yOffset);
    this.button.mousePressed(() => toggleSong(song));
    this.song = song;
    soundButtons.push(this);

    if (song && song.path) {
      song.button = this.button;
    }

    buttonX += this.button.width + 10;
  }
}

function relayoutButtons() {
  let x = 10;
  const yOffset = getGestureBannerOffset();
  soundButtons.forEach((soundButton) => {
    soundButton.button.position(x, 20 + yOffset);
    const width = soundButton.button.elt.getBoundingClientRect().width;
    x += width + 10;
  });
  buttonX = x;
}

function requestRelayout() {
  if (relayoutScheduled) {
    return;
  }
  relayoutScheduled = true;
  requestAnimationFrame(() => {
    relayoutScheduled = false;
    relayoutButtons();
  });
}

function setButtonLabel(song, label) {
  if (song && song.button) {
    song.button.html(label);
  }
}

function setButtonLoading(song, isLoading) {
  if (!song || !song.button) {
    return;
  }
  if (isLoading) {
    song.button.addClass('audio-loading');
  } else {
    song.button.removeClass('audio-loading');
  }
  requestRelayout();
}

function ensureSongLoaded(song) {
  if (song.sound || song.loading) {
    return;
  }
  song.loading = true;
  setButtonLabel(song, song.label);
  setButtonLoading(song, true);
  loadSound(
    song.path,
    (sound) => {
      song.sound = sound;
      song.loading = false;
      setButtonLoading(song, false);
      setButtonLabel(song, song.label);
      if (currentSong === song) {
        sound.play();
      }
    },
    (err) => {
      song.loading = false;
      setButtonLoading(song, false);
      setButtonLabel(song, `${song.label} (load failed)`);
      console.error('Audio load failed:', err);
    }
  );
}

function toggleSong(song) {
  if (currentSong) {
    if (currentSong == mic) {
      mic.stop();
      fft.setInput();
    } else if (currentSong.sound) {
      currentSong.sound.pause();
    } else {
      // Previous song was still loading; nothing to stop.
    }
  }

  currentSong = song;
  if (currentSong == mic) {
    userStartAudio();
    mic.start(() => fft.setInput(mic));
  } else if (currentSong.sound) {
    currentSong.sound.play();
  } else {
    ensureSongLoaded(currentSong);
  }

  soundButtons.forEach((soundButton) => {
    if (soundButton.song === currentSong) {
      soundButton.button.addClass('audio-selected');
    } else {
      soundButton.button.removeClass('audio-selected');
    }
  });

  if (typeof updateGestureBannerSelection === 'function') {
    updateGestureBannerSelection();
  }
}

const setupButtons = (buf) => {
  buttonX = 10;

  console.log("1");
  buf.micbutton = new soundToggleButton(buf, 'mic', mic);
  const song1 = {
    id: 'song1',
    label: 'Clair de lune',
    path: 'music/Clair-de-lune-piano.mp3',
    sound: null,
    loading: false
  };
  const song2 = {
    id: 'song2',
    label: 'Symphony #9',
    path: 'music/symphony9.mp3',
    sound: null,
    loading: false
  };
  buf.song1button = new soundToggleButton(buf, song1.label, song1);
  buf.song2button = new soundToggleButton(buf, song2.label, song2);

  // Start background loading so switching is instant after a short wait.
  ensureSongLoaded(song1);
  ensureSongLoaded(song2);
}

const drawButtons = (buf, data) => {}
