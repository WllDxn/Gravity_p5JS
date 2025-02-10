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
 * Returns the horizontal center coordinate of the canvas.
 * @function centerX
 * @returns {number} The x-coordinate of the canvas center (width/2)
 */
const centerX = () => width / 2;

/**
 * Returns the vertical center coordinate of the canvas.
 * @function centerY
 * @returns {number} The y-coordinate of the canvas center (height/2)
 */
const centerY = () => height / 2;

/**
 * Initializes the simulation environment and creates the initial celestial bodies.
 * Sets up the canvas, creates a central star, and adds initial satellites.
 */
function setup() {
  frameRate(90);
  createCanvas(windowWidth, windowHeight);
  const centralStar = new Planetoid(5000, 0, 0, 0, 0, 50, "yellow");
  bodies.push(centralStar);

  // Create initial satellites using configuration object
  const satelliteConfigs = [
    {
      mass: 500,
      size: 20,
      color: "green",
      distance: { min: 300, max: 400 },
      ecc: 1,
    },
    {
      mass: 10,
      size: 20,
      color: "red",
      distance: { min: 100, max: 100 },
      ecc: 1,
      parentIndex: 1,
    }
  ];

  satelliteConfigs.forEach((config) => {
    const parent = config.parentIndex
      ? bodies[config.parentIndex]
      : centralStar;
    parent.addSatellite(
      config.mass,
      config.size,
      config.color,
      generateRandomCoordinates(
        parent,
        config.distance.min,
        config.distance.max
      ),
      config.ecc
    );
  });
}

/**
 * Main animation loop that updates and renders all celestial bodies.
 * Handles gravity calculations, position updates, and drawing of orbits and bodies.
 */
function draw() {
  background(220);
  translate(centerX(), centerY());
  for (const body of bodies) {
    body.applyGravity();
    body.update();
    if (body === bodies[0]) {
      body.position.set(0, 0);
    }
  }

  for (const body of bodies) {
    body.drawOrbit();
  }
  for (const body of bodies) {
    body.display();
  }
  // pause
}

/**
 * Generates random coordinates within valid bounds for new celestial bodies.
 * @param {Planetoid} parent - The parent celestial body
 * @param {number} minDistance - Minimum distance from the center point
 * @param {number} maxDistance - Minimum distance from the center point
 * @returns {p5.Vector} A vector containing valid random coordinates
 *
 */
function generateRandomCoordinates(parent, minDistance, maxDistance = null) {
  minDistance =
    minDistance > min(centerX(), centerY())
      ? Math.min(centerX(), centerY()) / 2
      : minDistance;
  const closestEdge = Math.min(
    centerX() - Math.abs(parent.position.x),
    centerY() - Math.abs(parent.position.y)
  );
  maxDistance = maxDistance ? Math.min(maxDistance, closestEdge) : closestEdge;
  const angle = random(0, TWO_PI);
  const distance = random(minDistance, maxDistance);

  return createVector(distance * Math.cos(angle), distance * Math.sin(angle));
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
    return min;
  }
  return Math.floor(random() * (max - min) + min);
}

/**
 * Event handler for mouse clicks that creates new satellites.
 * Creates a satellite with random properties at the mouse position relative to the central body.
 */
function mousePressed() {
  const mouseVector = createVector(mouseX - centerX(), mouseY - centerY());
  const newSatellite = {
    mass: getRandomInt(25, 500),
    size: 0, // Will be calculated based on mass
    color: color(random(255), random(255), random(255)),
    position: mouseVector,
  };

  newSatellite.size = map(newSatellite.mass, 25, 500, 10, 40);
  bodies[0].addSatellite(
    newSatellite.mass,
    newSatellite.size,
    newSatellite.color,
    newSatellite.position
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
      throw new Error("Mass must be positive");
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
    this.timeOut = 100;
  }

  /**
   * Draws the orbital path of the planetoid if it has a parent body.
   * Visualizes the elliptical orbit using the calculated orbital parameters.
   */
  drawOrbit() {
    if (!this.parent) {
      return;
    }

    const centerToFocus = p5.Vector.mult(
      this.eccentricityVector,
      this.semimajorAxis
    );

    push();
    translate(this.parent.position.x, this.parent.position.y);
    rotate(Math.PI);
    translate(centerToFocus.x, centerToFocus.y);
    rotate(this.eccentricityVector.heading());

    strokeWeight(2);
    noFill();
    stroke(this.colour);
    ellipse(0, 0, this.semimajorAxis * 2, this.semiminorAxis * 2);
    pop();
  }

  /**
   * Calculates the orbital parameters of the planetoid.
   * @returns {number} The orbital eccentricity
   */
  calculateOrbitalParameters() {
    if (!this.parent) {
      return 0;
    }
    const relativePosition = p5.Vector.sub(this.position, this.parent.position);
    // const this.velocity = p5.Vector.sub(this.velocity, this.parent.velocity)
    const vh = p5.Vector.cross(
      this.velocity,
      p5.Vector.cross(relativePosition, this.velocity)
    ); //Cross product of (Specific angular momentum vector, velocity vector)
    this.eccentricityVector = p5.Vector.div(vh, this.u).sub(
      p5.Vector.normalize(relativePosition)
    );
    const eccentricity = p5.Vector.mag(this.eccentricityVector);
    this.semimajorAxis =
      -(this.u * relativePosition.mag()) /
      (relativePosition.mag() *
        (p5.Vector.mag(this.velocity) * p5.Vector.mag(this.velocity)) -
        2 * this.u);
    this.semiminorAxis =
      this.semimajorAxis * Math.sqrt(1 - eccentricity * eccentricity);
    return eccentricity;
  }

  /**
   * Adds a satellite orbiting this planetoid.
   * @param {number} mass - Mass of the satellite
   * @param {number} size - Visual size of the satellite
   * @param {string|p5.Color} color - Color of the satellite
   * @param {p5.Vector} satellitePos - Initial position vector relative to parent
   * @param {number} [e=1] - Orbital eccentricity modifier (1 for circular orbit)
   */
  addSatellite(mass, size, color, satellitePos, e = 1) {
    const distanceToParent = p5.Vector.dist(satellitePos, this.position);
    const velocityMagnitude =
      e * Math.sqrt((this.mass * GRAVITY) / distanceToParent);
    const velocitySign = 1;
    const velocityVector = p5.Vector.sub(satellitePos, this.position)
      .rotate(HALF_PI * velocitySign)
      .setMag(velocityMagnitude);
    const satellite = new Planetoid(
      mass,
      this.position.x + satellitePos.x,
      this.position.y + satellitePos.y,
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
   * Updates the acceleration vector based on gravitational interactions.
   */
  applyGravity() {
    this.acceleration.set(0, 0);
    for (const other of bodies) {
      if (other === this) {
        continue;
      }
      const distance = p5.Vector.sub(other.position, this.position);
      const rSquared = p5.Vector.magSq(distance);
      const force = (GRAVITY * this.mass * other.mass) / rSquared;
      distance.setMag(force / this.mass);
      this.acceleration.add(distance);
    }
  }

  /**
   * Draws the planetoid as a circle on the canvas.
   * Uses the planetoid's position, size, and color properties.
   */
  display() {
    stroke(0);
    strokeWeight(2);
    fill(this.colour);
    ellipse(this.position.x, this.position.y, this.size, this.size);
  }

  /**
   * Updates the planetoid's position and velocity based on its acceleration.
   * Checks and adjusts orbital parameters if necessary.
   */
  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    const e = this.calculateOrbitalParameters();
    if (e > 1 && this.parent) {
      this.checkOtherBodies(e);
      if (this.calculateOrbitalParameters() > 1) {
        this.timeOut--;
        if (this.timeOut < 0 && Math.abs(this.position.x)>centerX()&&Math.abs(this.position.y)>centerY()) {
          bodies.splice(bodies.indexOf(this), 1);
        }
      }
      else {
        this.timeOut = 100;
      }
      console.log(this.timeOut)
    }
  }

  /**
   * Checks other celestial bodies to find the most stable orbital parent.
   * @param {number} eccentricity - Current orbital eccentricity
   * @returns {number} The lowest achievable eccentricity
   */
  checkOtherBodies(eccentricity) {
    // Store original parent for potential fallback
    const originalParent = bodies.indexOf(this.parent);

    if (originalParent === -1) {
      console.warn("Original parent body not found in bodies array");
      return eccentricity;
    }

    let lowestEccentricity = eccentricity;
    let bestParent = this.parent;

    // Find the body that results in the most stable orbit (lowest eccentricity)
    for (const potentialParent of bodies) {
      // Skip self and current parent
      if (
        potentialParent === this ||
        potentialParent === bodies[originalParent]
      ) {
        continue;
      }

      this.parent = potentialParent;
      const newEccentricity = this.calculateOrbitalParameters();

      // Update if we find a more stable orbit (lower eccentricity)
      if (newEccentricity < lowestEccentricity) {
        lowestEccentricity = newEccentricity;
        bestParent = potentialParent;

        // Optional optimization: break early if we find a very stable orbit
        if (newEccentricity < 0.1) {
          break;
        }
      }
    }

    // Set the parent to whichever body provides the most stable orbit
    this.parent = lowestEccentricity < 1 ? bestParent : bodies[originalParent];

    return lowestEccentricity;
  }
}
