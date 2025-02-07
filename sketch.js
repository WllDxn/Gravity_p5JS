let bodies = [];
const GRAVITY = 0.1;

function setup() {
  frameRate(90);
  createCanvas(windowWidth, windowHeight);
  bodies.push(
    new Planetoid(getRandomInt(5000, 20000), 0, 0, 0, 0, 50, "yellow")
  );

  bodies[0].addSatellite(100, 20, "green", generateRandomCoordinates(100), 1);
  bodies[0].addSatellite(100, 20, "blue", generateRandomCoordinates(100), 0.66);
  bodies[0].addSatellite(100, 20, "red", generateRandomCoordinates(100), 0.77);
}

function draw() {
  background(220);
  translate(width / 2, height / 2);
  for (const body of bodies) {
    body.applyGravity();
    body.update();
    body.drawOrbit();
    if (body === bodies[0]) {
      body.position.set(0, 0); //Keep the central body fixed in the center
    }
  }
  for (const body of bodies) {
    body.display();
  }
}

/**
 * Generates random coordinates that are at least a minimum distance from the center.
 * Generates random coordinates within the canvas bounds, ensuring they are at least a specified minimum distance from the center.
 * @param {number} minDistance - The minimum distance from the center.
 * @returns {p5.Vector} A vector representing the random coordinates.
 */
function generateRandomCoordinates(minDistance) {
  let x, y, distance;
  do {
    x = getRandomInt(-width / 2, width / 2);
    y = getRandomInt(-height / 2, height / 2);
    distance = Math.sqrt(x * x + y * y);
  } while (distance < minDistance || distance > min(width / 2, height / 2));
  return createVector(x, y);
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
  bodies[0].addSatellite(
    newSatelliteMass,
    newSatelliteSize,
    newSatelliteColor,
    createVector(newSatelliteX, newSatelliteY)
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
    this.calculateOrbitalParameters();
  }

  /**
   * Draws the orbital path of the planetoid if it has a parent.
   */
  drawOrbit() {
    if (this.parent) {
      const centerToFocus = p5.Vector.mult(
        this.eccentricityVector,
        this.semimajorAxis
      );
      push();
      rotate(PI);
      translate(
        this.parent.position.x + centerToFocus.x,
        this.parent.position.y + centerToFocus.y
      );
      rotate(this.eccentricityVector.heading());
      stroke(this.colour);
      strokeWeight(2);
      noFill();
      ellipse(0, 0, this.semimajorAxis * 2, this.semiminorAxis * 2);
      pop();
    }
  }

  /**
   * Calculates the orbital parameters of the planetoid.
   * Calculates the eccentricity vector, semimajor axis, and semiminor axis of the orbit.
   */
  calculateOrbitalParameters() {
    if (this.parent) {
      const u = GRAVITY * (this.parent.mass + this.mass); // Standard Gravitational Parameter
      const vh = p5.Vector.cross(
        this.velocity,
        p5.Vector.cross(this.position, this.velocity)
      ); //Cross product of (Specific angular momentum vector, velocity vector)
      this.eccentricityVector = p5.Vector.div(vh, u).sub(
        p5.Vector.normalize(this.position)
      );
      const eccentricity = p5.Vector.mag(this.eccentricityVector);
      this.semimajorAxis = -(u * this.position.mag()) /
        (this.position.mag() *
          (p5.Vector.mag(this.velocity) * p5.Vector.mag(this.velocity)) -
          2 * u);
      this.semiminorAxis =
        this.semimajorAxis * Math.sqrt(1 - eccentricity * eccentricity);
    }
  }

  /**
   * Adds a new satellite to this planetoid.
   * @param {number} mass - The mass of the satellite.
   * @param {number} size - The size of the satellite.
   * @param {string} color - The color of the satellite.
   * @param {p5.Vector} satellitePos - The initial coordinates of the satellite.
   * @param {number} [e=1] - Modifies the force applied to the velocity magnitude.
   */
  addSatellite(mass, size, color, satellitePos, e = 1) {
    const distanceToParent = p5.Vector.dist(satellitePos, this.position);
    const velocityMagnitude =
      e * Math.sqrt((this.mass * GRAVITY) / distanceToParent);
    const velocitySign = Math.random() < 0.5 ? 1 : -1;
    const velocityVector = p5.Vector.sub(satellitePos, this.position)
      .rotate(HALF_PI * velocitySign)
      .setMag(velocityMagnitude);
    const satellite = new Planetoid(
      mass,
      satellitePos.x,
      satellitePos.y,
      velocityVector.x,
      velocityVector.y,
      size,
      color,
      this
    );
    bodies.push(satellite);
  }

  /**
   * Calculates and applies gravitational forces from all other planetoids.
   */
  applyGravity() {
    for (const other of bodies) {
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
    this.calculateOrbitalParameters();
  }
}