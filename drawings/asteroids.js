let cx;
let cy;

let asteroids = {}
let nasteroids = 0;
let adt = 1;
let asteroidCooldown = 0;
let cbool = true;

let deletedAsteroids = [];

class asteroid {
  constructor(buf, k, size, speed) {
    if (random(1) < 0.5) {
      if (random(1) < 0.5) { this.x = 0 } else { this.x = buf.width }
      this.y = random(0, buf.height);
    } else {
      this.x = random(0, buf.width);
      if (random(1) < 0.5) { this.y = 0 } else { this.y = buf.height }
    }

    this.dx = (cx - this.x) / cx;
    this.dy = (cy - this.y) / cy;

    this.k = k;
    this.size = size;
    this.speed = speed;
    this.angle = random(0, TWO_PI);
    this.dir = random([-1, 1]);
  }

  checkCollisions(buf) {
    if (cbool) {
      for (const [k, asteroid] of Object.entries(asteroids)) {
        if (k != this.k && !(k in deletedAsteroids)) {
          let dx = this.x - asteroid.x;
          let dy = this.y - asteroid.y;
          let dist = sqrt(dx ** 2 + dy ** 2);
          if (dist < (this.size + asteroid.size) / 2) {
            if (cbool) {
              let bigger = this.size > asteroid.size;
              this.size += asteroid.size;
              if (this.size > 150) {
                this.explode(buf, asteroid);
              } else {
                this.x = bigger ? this.x : asteroid.x;
                this.y = bigger ? this.y : asteroid.y;
                this.dx = (this.dx * this.size + asteroid.dx * asteroid.size) / (this.size + asteroid.size);
                this.dy = (this.dy * this.size + asteroid.dy * asteroid.size) / (this.size + asteroid.size);
                this.speed = min(this.speed, asteroid.speed);
                asteroid.deleteAsteroid();
                cbool = false;
              }
            }
          }
        }
      }
    }
  }

  explode(buf, asteroid) {
    this.deleteAsteroid();
    asteroid.deleteAsteroid();

    // buf.fill('orange');
    // buf.stroke('orange');
    // buf.ellipse(
    //   (this.size * this.x + asteroid.size * asteroid.x) / (this.size + asteroid.size), 
    //   (this.size * this.y + asteroid.size * asteroid.y) / (this.size + asteroid.size), 
    //   (asteroid.size + this.size) / 4, 
    //   (asteroid.size + this.size) / 4
    // );
  }

  drawAsteroid(buf) {
    if (self.k in deletedAsteroids) return;

    this.x += this.dx * this.speed * adt;
    this.y += this.dy * this.speed * adt;

    this.angle += this.speed / 90 * this.dir * adt;

    buf.push();
    buf.translate(this.x + this.size / 2, this.y + this.size / 2);
    buf.rotate(this.angle);
    buf.image(asteroidimg, -this.size / 2, -this.size / 2, this.size, this.size);
    buf.pop();

    if (random(1) < 0.01) this.checkCollisions(buf);

    if (this.dx > 0 && this.x > buf.width + this.size) this.deleteAsteroid();
    if (this.dx < 0 && this.x < -this.size) this.deleteAsteroid();
    if (this.dy > 0 && this.y > buf.height + this.size) this.deleteAsteroid();
    if (this.dy < 0 && this.y < -this.size) this.deleteAsteroid();
  }

  deleteAsteroid() {
    delete asteroids[this.k];
  }
}

const setupAsteroids = (buf) => {
  cx = buf.width / 2;
  cy = buf.height / 2;
}

const drawAsteroids = (buf, data) => {
  if (data) {
    buf.background(asteroidbg);
    asteroidCooldown--;

    let { centroid, loudness, flatness } = data;

    let speed = map(flatness, 0, 1, 1, 3);
    let quantity = (2 ** map(flatness, 0, 1, 0, 5)) / 2;
    let size = map(centroid, 0, 16000, 10, 100);
    if (loudness > 40 && asteroidCooldown <= 0) {
      for (let i = 0; i < quantity; i++) {
        asteroids[nasteroids] = new asteroid(
          buf, nasteroids, size + random(-5, 5), speed + random(-0.5, 0.5)
        );
        ++nasteroids;
      }
      asteroidCooldown = 20;
    }

    for (const [k, asteroid] of Object.entries(asteroids)) {
      asteroid.drawAsteroid(buf);
    }

    deletedAsteroids.forEach(k => {
      delete asteroids[k];
    })

    cbool = true;
  }
}