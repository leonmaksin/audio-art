let D = 0.2;
let dt = 0.5;
let strings = [];

class stringPoint {
  constructor(x, y, flip) {
    this.x = x;
    this.h = y;
    this.v = 0;
    this.yoffset = 5;
    this.flip = flip;
  }

  drawPoint(buf) {
    let a = -this.yoffset;
    this.v += a*dt - D*this.v*dt;
    this.yoffset += this.v*dt;

    let y = this.h + this.yoffset*this.flip;
    buf.curveVertex(this.x, y);
  }

  updatePoint(x, y, buf) {
    let dist = (buf.height - abs(this.h - y)) ** 3 + (buf.width - abs(this.x - x)) ** 3;
    let scalar = dist / (buf.height ** 3 + buf.width ** 3);
    this.v += (6-this.v) * scalar;
  }
}

class string {
  constructor(h, sw, buf) {
    this.h = h;
    this.v = 0;
    this.sw = sw;
    this.yoffset = 5;
    this.stringPoints = [];

    let flip = 1;
    for (let i=0; i<buf.width; i+= 50) {
      flip *= -1;
      this.stringPoints.push(new stringPoint(i, h, flip));
    }
  }

  drawString(buf) {
    buf.strokeWeight(this.sw);
    buf.beginShape();
    buf.curveVertex(0, this.h);
    this.stringPoints.forEach((stringPoint) => stringPoint.drawPoint(buf));
    buf.curveVertex(buf.width, this.h);
    buf.curveVertex(buf.width, this.h);
    buf.endShape();
  }

  updateString(x, y, buf) {
    this.stringPoints.forEach((stringPoint) => stringPoint.updatePoint(x,y,buf));
  }
}

const setupStrings = (buf) => {
  for (let h=10; h<buf.height; h+= 20) {
    let sw = 2 + h / 80;
    strings.push(new string(h, sw, buf));    
  }
}

const drawStrings = (buf, data) => {
  if (data) {
    buf.background(220);

    buf.stroke(0);
    buf.noFill();

    let { loudness, centroid } = data;
    if (loudness > 30) {
      let x = random(0, buf.width);
      let y = map(centroid, 16000, 0, 0, buf.height);


      let sVal = Math.trunc(map(y, 0, buf.height, 0, (buf.height-10)/20));
      if (sVal < 0) sVal = 0;
      if (sVal >= strings.length) sVal = strings.length-1;
      // strings[sVal-1].updateString(x, y, buf);
      strings[sVal].updateString(x, y, buf);
      // strings[sVal+1].updateString(x, y, buf);
      
      // strings.forEach((string) => string.updateString(x, y, buf));
    }

    strings.forEach((string) => string.drawString(buf));
  }
}