let planetoids = [];
const GRAVITY = 0.1;

function setup() {
  frameRate(90);
  createCanvas(windowWidth, windowHeight);
  planetoids.push(new Planetoid(8000, 0, 0, 0, 0, 50, "yellow"));
  planetoids[0].addSatellite(100, 20, "green", 0, -250, 1);
  planetoids[0].addSatellite(100, 20, "blue", 200, 0, 0.66);
  planetoids[0].addSatellite(100, 20, "red", 0, 100, 1.13);
}

function draw() {
  background(220);
  translate(width / 2, height / 2);
  for (let j = 0; j < planetoids.length; j++) {
    planetoids[j].applyGravity();
    planetoids[j].update();
    planetoids[j].drawOrbit();
    if (j == 0) {
      planetoids[0].position.sub(planetoids[0].position);
    }
  }
  for (let j = 0; j < planetoids.length; j++) {
    planetoids[j].display();
  }
}

/**
 * Generates a random integer between min (inclusive) and max (exclusive).
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} A random integer between min and max.
 */
function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

/**
 * Creates a new satellite around the first planetoid when the mouse is pressed.
 * The satellite's mass, size, and color are randomly generated, and its initial
 * position is based on the mouse coordinates.
 */
function mousePressed() {
  const newSatelliteMass = getRandomInt(25, 500);
  const newSatelliteSize = map(newSatelliteMass, 25, 500, 10, 40);
  const newSatelliteColor = color(random(255), random(255), random(255));
  const newSatelliteX = mouseX - width / 2;
  const newSatelliteY = mouseY - height / 2;
  planetoids[0].addSatellite(
    newSatelliteMass,
    newSatelliteSize,
    newSatelliteColor,
    newSatelliteX,
    newSatelliteY
  );
}

/**
 * Represents a planetoid or satellite in the simulation.
 */
class Planetoid {
  /**
   * Creates a new Planetoid object.
   * @param {number} mass - The mass of the planetoid.
   * @param {number} x - The initial x-coordinate.
   * @param {number} y - The initial y-coordinate.
   * @param {number} vx - The initial x-velocity.
   * @param {number} vy - The initial y-velocity.
   * @param {number} size - The size of the planetoid (diameter).
   * @param {string} color - The color of the planetoid.
   * @param {Planetoid} [parent=null] - The parent planetoid, if this is a satellite.
   */
  constructor(mass, x, y, vx, vy, size, color, parent = null) {
    this.mass = mass;
    this.position = createVector(x, y);
    this.velocity = createVector(vx, vy);
    this.acceleration = createVector(0, 0);
    this.size = size;
    this.colour = color;
    this.parent = parent;
  }

  /**
   * Draws the orbital path of the planetoid if it has a parent.
   */
  drawOrbit() {
    if (!this.parent) {
      return;
    }

    const u = GRAVITY * this.parent.mass;
    const v = this.velocity;
    const r = this.position;
    const h = p5.Vector.cross(r, v);
    const vh = p5.Vector.cross(v, h);
    const rMag = p5.Vector.mag(r);
    const vMag = p5.Vector.mag(v);
    const eccentricityVector = p5.Vector.div(vh, u).sub(p5.Vector.normalize(r));
    const eccentricity = p5.Vector.mag(eccentricityVector);
    const a = -(u * rMag) / (rMag * Math.pow(vMag, 2) - 2 * u);
    const b = a * Math.sqrt(1 - Math.pow(eccentricity, 2));
    push();
    const centerToFocus = p5.Vector.mult(eccentricityVector, a).rotate(PI);
    translate(
      this.parent.position.x + centerToFocus.x,
      this.parent.position.y + centerToFocus.y
    );
    rotate(eccentricityVector.heading());
    stroke(this.colour);
    strokeWeight(2);
    fill(color(0, 0, 0, 0));
    ellipse(0, 0, a * 2, b * 2);
    pop();
  }

  /**
   * Adds a new satellite to this planetoid.
   * @param {number} mass - The mass of the satellite.
   * @param {number} size - The size of the satellite.
   * @param {string} color - The color of the satellite.
   * @param {number} x - The initial x-coordinate of the satellite.
   * @param {number} y - The initial y-coordinate of the satellite.
   * @param {number} [e=1] - Modifies the force applied to the velocity magnitude.
   */
  addSatellite(mass, size, color, x, y, e = 1) {
    const satellitePos = createVector(x, y);
    const distanceToParent = p5.Vector.dist(satellitePos, this.position);
    const velocityMagnitude =
      e * Math.sqrt((this.mass * GRAVITY) / distanceToParent);
    const velocitySign = Math.random() < 0.5 ? 1 : -1;
    const velocityVector = p5.Vector.sub(satellitePos, this.position)
      .rotate(HALF_PI * velocitySign)
      .setMag(velocityMagnitude);
    const satellite = new Planetoid(
      mass,
      x,
      y,
      velocityVector.x,
      velocityVector.y,
      size,
      color,
      this
    );
    planetoids.push(satellite);
  }

  /**
   * Calculates and applies gravitational forces from all other planetoids.
   */
  applyGravity() {
    for (const other of planetoids) {
      if (other !== this) {
        const distance = p5.Vector.sub(other.position, this.position);
        const rSquared = distance.magSq();
        const force = (GRAVITY * this.mass * other.mass) / rSquared;
        distance.setMag(force / this.mass);
        this.acceleration.add(distance);
      }
    }
  }

  /**
   * Draws the planetoid as a circle on the canvas.
   */
  display() {
    stroke(0);
    strokeWeight(2);
    fill(this.colour);
    ellipse(this.position.x, this.position.y, this.size, this.size);
  }

  /**
   * Updates the planetoid's position and velocity based on its acceleration.
   */
  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }
}
