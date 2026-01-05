p5.disableFriendlyErrors = true;

const NUM = 40;
const HALFPI = Math.PI*0.5
const LIFETIMEC = 400;
const RAND = (min, max) => Math.random() * (max - min) + min //d3.randomUniform

let vshapes;
let nvshapes = 0;
let cooldownVornoi = 0;
class vshape {
  constructor(x, y, i, lifetime, k, note, flatness, loudness) {
    this.x = x;
    this.y = y;
    this.vx = RAND(-0.1, 0.1);
    this.vy = RAND(-0.1, 0.1);
    // this.color = d3.interpolateGnBu(norm(i, 0, NUM));
    // let f = flatness;
    // if (f > 1) f = 1;
    // let s = map(f, 0, 1, 50, 10);
    let s = map(loudness, 0, 200, 10, 70);
    let c = map(note + Math.random(-0.5,5), 0, 12, 0, 100);
    this.color = [c, s, 100];
    this.k = k;
    this.lifetime = lifetime;
  }
}

let W, H, polygons, voronoi, speed;

const setupVoronoi = (buf) => {
  [W, H] = [windowWidth, windowHeight];
  // createCanvas(W, H);
  //frameRate(1000);
  buf.strokeWeight(4)
  buf.fill('#fff')
  buf.colorMode(HSB, 100)
  //noStroke()

  // vshapes = d3.range(NUM).map(i => new vshape(Math.random() * W, Math.random() * H, i, LIFETIMEC, nvshapes++));
  vshapes = [];
  voronoi = d3.voronoi().extent([[0, 0],[W, H]]);  
  speed = 1;
}


const drawVoronoi = (buf, data) => {
  if (data) {
    let { centroid, loudness, flatness, noteFreqs } = data;

    speed = map(centroid, 0, 16000, 0, 3);

    if (loudness > 30) {
      let i = 0;
      noteFreqs.forEach((freq, idx) => {
        if (freq > noteFreqs[i]) i = idx;
      })
      
      createShape(i, flatness, loudness);
    }
    
    buf.background('#666')

    // vshapes.map((vs) => [vs.x, vs.y]);
    polygons = voronoi(vshapes.map((vs) => [vs.x, vs.y])).polygons()

    for (let i = 0; i < vshapes.length; i++) {    

      // EULER
      vs = vshapes[i];
      vs.vx += RAND(-0.1, 0.1)
      vs.vy += RAND(-0.1, 0.1)
      vs.x += vs.vx * speed
      vs.y += vs.vy * speed
      vs.vx *= 0.99
      vs.vy *= 0.99

      // WALLS
      if (vs.x >= W-4 || vs.x <= 4) vs.vx *= -1 
      if (vs.y >= H-4 || vs.y <= 4) vs.vy *= -1


      // ALGO
      vertices = polygons[i].map(v => createVector(v[0], v[1]));


      // RENDER (cell)
      buf.push()
      buf.fill(vs.color)
      buf.noStroke()
      buf.beginShape();
      vertices.map(v => buf.vertex(v.x, v.y));
      buf.endShape(CLOSE);
      buf.pop()

      // RENDER (site)
      // buf.point(vs.x, vs.y)

      // DEATH
      vs.lifetime--;
    }

    vshapes = vshapes.filter((vs) => vs.lifetime >= 0);    
  }
}

function orthoProjection(dir, ep, op) {

  let dv = p5.Vector.sub(op, ep);
  dir.mult(dv.dot(dir));

  return p5.Vector.add(ep, dir)

}


function intersect(p1, p2, p3, p4) {

  uA = ((p4.x-p3.x)*(p1.y-p3.y) - (p4.y-p3.y)*(p1.x-p3.x)) / ((p4.y-p3.y)*(p2.x-p1.x) - (p4.x-p3.x)*(p2.y-p1.y)) 
  uB = ((p2.x-p1.x)*(p1.y-p3.y) - (p2.y-p1.y)*(p1.x-p3.x)) / ((p4.y-p3.y)*(p2.x-p1.x) - (p4.x-p3.x)*(p2.y-p1.y))

  if (uA >= 0 && uA <= 1 & uB >= 0 & uB <= 1) {

    secX = p1.x + (uA * (p2.x-p1.x))
    secY = p1.y + (uA * (p2.y-p1.y))

    return createVector(secX, secY)
  }
}


function bisector(pv, cv, nv, m) {

  d1 = p5.Vector.sub(cv, pv).normalize()
  d2 = p5.Vector.sub(nv, cv).normalize()

  dsum = p5.Vector.add(d1, d2) //sum of directions

  s = dsum.mag() / d1.dot(dsum) //speed  
  v = dsum.rotate(-HALF_PI) //vector of bisector
  p = v.setMag(s*m).add(cv) //offsetted vertex 

  return [cv, p]
}

function createShape(note, flatness, loudness) {
  vshapes.push(new vshape(Math.random() * W, Math.random() * H, Math.random() * NUM, LIFETIMEC, nvshapes++, note, flatness, loudness))
}