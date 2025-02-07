/**
 * @typedef {Object} Planetoid
 * @property {number} mass - Mass of the planetoid
 * @property {p5.Vector} position - Current position vector
 * @property {p5.Vector} velocity - Current velocity vector
 * @property {p5.Vector} acceleration - Current acceleration vector
 */

/** @type {Planetoid[]} - Array containing all celestial bodies in the simulation */
let bodies = [];

/** @constant {number} - Gravitational constant for the simulation */
const GRAVITY = 0.1;

/**
 * Initializes the simulation environment and creates the initial celestial bodies.
 * Sets up the canvas, creates a central star, and adds initial satellites.
 */
function setup() {
  frameRate(90);
  createCanvas(windowWidth, windowHeight);
  // Create central star
  bodies.push(
    new Planetoid(getRandomInt(5000, 20000), 0, 0, 0, 0, 50, "yellow")
  );

  // Add initial satellites with different orbital characteristics
  bodies[0].addSatellite(100, 20, "green", generateRandomCoordinates(100), 1);
  bodies[0].addSatellite(100, 20, "blue", generateRandomCoordinates(100), 0.66);
  bodies[0].addSatellite(100, 20, "red", generateRandomCoordinates(100), 0.77);
}

/**
 * Main animation loop that updates and renders all celestial bodies.
 * Handles gravity calculations, position updates, and drawing of orbits and bodies.
 */
function draw() {
  background(220);
  translate(width / 2, height / 2);
  for (const body of bodies) {
    body.applyGravity();
    body.update();
    body.drawOrbit();
    if (body === bodies[0]) {
      body.position.set(0, 0); // Keep the central body fixed in the center
    }
  }
  for (const body of bodies) {
    body.display();
  }
}

/**
 * Generates random coordinates within valid bounds for new celestial bodies.
 * @param {number} minDistance - Minimum distance from the center point
 * @returns {p5.Vector} A vector containing valid random coordinates
 * @throws {Error} If minDistance is greater than the smaller canvas dimension
 */
function generateRandomCoordinates(minDistance) {
  if (minDistance > min(width / 2, height / 2)) {
    throw new Error('Minimum distance cannot be greater than canvas bounds');
  }
  let x, y, distance;
  do {
    x = getRandomInt(-width / 2, width / 2);
    y = getRandomInt(-height / 2, height / 2);
    distance = Math.sqrt(x * x + y * y);
  } while (distance < minDistance || distance > min(width / 2, height / 2));
  return createVector(x, y);
}

/**
 * Generates a random integer within a specified range.
 * @param {number} min - The inclusive lower bound
 * @param {number} max - The exclusive upper bound
 * @returns {number} A random integer between min (inclusive) and max (exclusive)
 * @throws {Error} If min is greater than max
 */
function getRandomInt(min, max) {
  if (min > max) {
    throw new Error('Minimum value cannot be greater than maximum value');
  }
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

/**
 * Event handler for mouse clicks that creates new satellites.
 * Creates a satellite with random properties at the mouse position.
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
 * Class representing a celestial body in the gravitational simulation.
 * Handles physics calculations, orbital mechanics, and rendering.
 */
class Planetoid {
  /**
   * Creates a new Planetoid instance.
   * @param {number} mass - Mass of the planetoid
   * @param {number} x - Initial x-coordinate
   * @param {number} y - Initial y-coordinate
   * @param {number} vx - Initial x-velocity
   * @param {number} vy - Initial y-velocity
   * @param {number} size - Diameter of the planetoid
   * @param {string|p5.Color} color - Color of the planetoid
   * @param {Planetoid} [parent=null] - Parent body (null for primary bodies)
   * @throws {Error} If mass is negative or zero
   */
  constructor(mass, x, y, vx, vy, size, color, parent = null) {
    if (mass <= 0) {
      throw new Error('Mass must be positive');
    }
    this.mass = mass;
    this.position = createVector(x, y);
    this.velocity = createVector(vx, vy);
    this.acceleration = createVector(0, 0);
    this.size = size;
    this.colour = color;
    this.parent = parent;
    this.u = this.parent
      ? GRAVITY * (this.parent.mass + this.mass)
      : GRAVITY * this.mass;
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
      const vh = p5.Vector.cross(
        this.velocity,
        p5.Vector.cross(this.position, this.velocity)
      ); //Cross product of (Specific angular momentum vector, velocity vector)
      this.eccentricityVector = p5.Vector.div(vh, this.u).sub(
        p5.Vector.normalize(this.position)
      );
      const eccentricity = p5.Vector.mag(this.eccentricityVector);
      this.semimajorAxis =
        -(this.u * this.position.mag()) /
        (this.position.mag() *
          (p5.Vector.mag(this.velocity) * p5.Vector.mag(this.velocity)) -
          2 * this.u);
      this.semiminorAxis =
        this.semimajorAxis * Math.sqrt(1 - eccentricity * eccentricity);
    }
  }

  /**
   * Adds a satellite orbiting this planetoid.
   * @param {number} mass - Mass of the satellite
   * @param {number} size - Visual size of the satellite
   * @param {string|p5.Color} color - Color of the satellite
   * @param {p5.Vector} satellitePos - Initial position vector
   * @param {number} [e=1] - Orbital eccentricity modifier (1 for circular orbit)
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
