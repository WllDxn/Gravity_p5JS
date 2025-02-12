/**
 * @typedef {Object} CelestialBody
 * @property {number} mass - Mass of the celestial body
 * @property {p5.Vector} position - Current position vector
 * @property {p5.Vector} velocity - Current velocity vector
 * @property {p5.Vector} acceleration - Current acceleration vector
 * @property {number} size - Visual diameter of the celestial body
 * @property {string|p5.Color} color - Color of the celestial body
 * @property {CelestialBody|null} parent - Parent body (null for primary bodies)
 * @property {number} gravitationalParameter  - Standard gravitational parameter
 * @property {number} timeOut - Counter for escape trajectory tracking
 */

/** @type {CelestialBody[]} */
let bodies = []

/** @constant {number} */
const GRAVITY = 0.1

/**
 * @constant {Object[]} Configuration for initial satellite bodies
 * @property {number} mass - Mass of the satellite
 * @property {number} size - Visual size of the satellite
 * @property {string} color - Color of the satellite
 * @property {Object} distance - Distance constraints from parent
 * @property {number} distance.min - Minimum distance from parent
 * @property {number} distance.max - Maximum distance from parent
 * @property {number} eccentricityModifier - Orbital eccentricity
 * @property {number} [parentIndex] - Index of parent body in bodies array
 */
const SATELLITE_CONFIGS = [
  {
    mass: 500,
    size: 20,
    color: 'green',
    distance: {
      min: 300,
      max: 400
    },
    eccentricityModifier: 1
  },
  {
    mass: 10,
    size: 20,
    color: 'red',
    distance: {
      min: 100,
      max: 100
    },
    eccentricityModifier: 1,
    parentIndex: 1
  },  {
    mass: 100,
    size: 10,
    color: 'blue',
    distance: {
      min: 100,
      max: 200
    },
    eccentricityModifier: 0.6
  },
]

/**
 * @constant {Object} Configuration for the central star
 * @property {number} mass - Mass of the central star
 * @property {number} size - Visual size of the central star
 * @property {string} color - Color of the central star
 * @property {Object} position - Initial position coordinates
 * @property {Object} velocity - Initial velocity components
 */
const CENTRAL_STAR_CONFIG = {
  mass: 5000,
  size: 50,
  color: 'yellow',
  position: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 }
}

/**
 * Returns the horizontal center coordinate of the canvas
 * @function
 * @returns {number} The x-coordinate of the canvas center
 */
const centerX = () => width / 2

/**
 * Returns the vertical center coordinate of the canvas
 * @function
 * @returns {number} The y-coordinate of the canvas center
 */
const centerY = () => height / 2

/**
 * Initializes the simulation environment and creates initial celestial bodies
 * @function
 * @returns {void}
 */
function setup () {
  frameRate(90)
  createCanvas(windowWidth, windowHeight)

  const centralStar = new CelestialBody(
    CENTRAL_STAR_CONFIG.mass,
    CENTRAL_STAR_CONFIG.position.x,
    CENTRAL_STAR_CONFIG.position.y,
    CENTRAL_STAR_CONFIG.velocity.x,
    CENTRAL_STAR_CONFIG.velocity.y,
    CENTRAL_STAR_CONFIG.size,
    CENTRAL_STAR_CONFIG.color
  )
  bodies.push(centralStar)

  SATELLITE_CONFIGS.forEach(config => {
    const parent = config.parentIndex ? bodies[config.parentIndex] : centralStar
    parent.addSatellite(
      config.mass,
      config.size,
      config.color,
      generateRandomCoordinates(
        parent,
        config.distance.min,
        config.distance.max
      ),
      config.eccentricityModifier
    )
  })
}

/**
 * Main animation loop that updates and renders all celestial bodies
 * @function
 * @returns {void}
 */
function draw () {
  background(220)
  translate(centerX(), centerY())

  for (const body of bodies) {
    body.applyGravity()
    body.update()
    if (body === bodies[0]) {
      body.position.set(0, 0)
    }
  }

  for (const body of bodies) {
    body.drawOrbit()
  }
  for (const body of bodies) {
    body.display()
  }
}

/**
 * Generates random coordinates within valid bounds for new celestial bodies
 * @function
 * @param {CelestialBody} parent - The parent celestial body
 * @param {number} [minDistance=0] - Minimum distance from the center point
 * @param {number} [maxDistance=null] - Maximum distance from the center point
 * @returns {p5.Vector} A vector containing valid random coordinates
 */
function generateRandomCoordinates (
  parent,
  minDistance = 0,
  maxDistance = null
) {
  minDistance =
    minDistance > min(centerX(), centerY())
      ? Math.min(centerX(), centerY()) / 2
      : minDistance

  const closestEdge = Math.min(
    centerX() - Math.abs(parent.position.x),
    centerY() - Math.abs(parent.position.y)
  )
  maxDistance = maxDistance ? Math.min(maxDistance, closestEdge) : closestEdge

  const angle = random(0, TWO_PI)
  const distance = random(minDistance, maxDistance)

  return createVector(distance * Math.cos(angle), distance * Math.sin(angle))
}

/**
 * Generates a random integer within a specified range
 * @function
 * @param {number} min - The inclusive lower bound
 * @param {number} max - The exclusive upper bound
 * @returns {number} A random integer between min (inclusive) and max (exclusive)
 */
function getRandomInt (min, max) {
  if (min > max) {
    return min
  }
  return Math.floor(random() * (max - min) + min)
}

/**
 * Event handler for mouse clicks that creates new satellites
 * @function
 * @returns {void}
 */
function mousePressed () {
  const mouseVector = createVector(mouseX - centerX(), mouseY - centerY())
  const newSatellite = {
    mass: getRandomInt(25, 500),
    size: 0,
    color: color(random(255), random(255), random(255)),
    position: mouseVector
  }

  newSatellite.size = map(newSatellite.mass, 25, 500, 10, 40)
  bodies[0].addSatellite(
    newSatellite.mass,
    newSatellite.size,
    newSatellite.color,
    newSatellite.position
  )
}

/**
 * Class representing a celestial body in the gravitational simulation
 * @class
 */
class CelestialBody {
  /**
   * Creates a new CelestialBody instance
   * @constructor
   * @param {number} mass - Mass of the celestial body
   * @param {number} x - Initial x-coordinate
   * @param {number} y - Initial y-coordinate
   * @param {number} vx - Initial x-velocity
   * @param {number} vy - Initial y-velocity
   * @param {number} size - Diameter of the celestial body
   * @param {string|p5.Color} color - Color of the celestial body
   * @param {CelestialBody} [parent=null] - Parent body (null for primary bodies)
   * @throws {Error} If mass is negative or zero
   */
  constructor (mass, x, y, vx, vy, size, color, parent = null) {
    if (mass <= 0) {
      throw new Error('Mass must be positive')
    }
    this.mass = mass
    this.position = createVector(x, y)
    this.velocity = createVector(vx, vy)
    this.acceleration = createVector(0, 0)
    this.size = size
    this.color = color
    this.parent = parent
    this.gravitationalParameter = this.parent
      ? GRAVITY * (this.parent.mass + this.mass)
      : GRAVITY * this.mass
    this.calculateOrbitalParameters()
    this.timeOut = 100
  }

  /**
   * Draws the orbital path of the celestial body
   * @method
   * @returns {void}
   */
  drawOrbit () {
    if (!this.parent) {
      return
    }

    const centerToFocus = p5.Vector.mult(
      this.eccentricityVector,
      this.semimajorAxis
    )

    push()
    translate(this.parent.position.x, this.parent.position.y)
    rotate(Math.PI)
    translate(centerToFocus.x, centerToFocus.y)
    rotate(this.eccentricityVector.heading())

    strokeWeight(2)
    noFill()
    stroke(this.color)
    ellipse(0, 0, this.semimajorAxis * 2, this.semiminorAxis * 2)
    pop()
  }

  /**
   * Calculates the orbital parameters of the celestial body
   * @method
   * @returns {number} The orbital eccentricity
   */
  calculateOrbitalParameters () {
    if (!this.parent) {
      return 0
    }
    const relativePosition = p5.Vector.sub(this.position, this.parent.position)
    const specificAngularMomentum = p5.Vector.cross(
      this.velocity,
      p5.Vector.cross(relativePosition, this.velocity)
    )
    this.eccentricityVector = p5.Vector.div(
      specificAngularMomentum,
      this.gravitationalParameter
    ).sub(p5.Vector.normalize(relativePosition))
    const eccentricity = p5.Vector.mag(this.eccentricityVector)
    this.semimajorAxis =
      -(this.gravitationalParameter * relativePosition.mag()) /
      (relativePosition.mag() *
        (p5.Vector.mag(this.velocity) * p5.Vector.mag(this.velocity)) -
        2 * this.gravitationalParameter)
    this.semiminorAxis =
      this.semimajorAxis * Math.sqrt(1 - eccentricity * eccentricity)
    return eccentricity
  }

  /**
   * Adds a satellite orbiting this celestial body
   * @method
   * @param {number} mass - Mass of the satellite
   * @param {number} size - Visual size of the satellite
   * @param {string|p5.Color} color - Color of the satellite
   * @param {p5.Vector} satellitePos - Initial position vector relative to parent
   * @param {number} [eccentricityModifier=1] - Orbital eccentricity modifier
   * @returns {void}
   */
  addSatellite (mass, size, color, satellitePos, eccentricityModifier = 1) {
    const distanceToParent = p5.Vector.dist(satellitePos, this.position)
    const velocityMagnitude =
      eccentricityModifier * Math.sqrt((this.mass * GRAVITY) / distanceToParent)
    const velocitySign = 1
    const velocityVector = p5.Vector.sub(satellitePos, this.position)
      .rotate(HALF_PI * velocitySign)
      .setMag(velocityMagnitude)

    const satellite = new CelestialBody(
      mass,
      this.position.x + satellitePos.x,
      this.position.y + satellitePos.y,
      velocityVector.x,
      velocityVector.y,
      size,
      color,
      this
    )
    bodies.push(satellite)
  }

  /**
   * Calculates and applies gravitational forces
   * @method
   * @returns {void}
   */
  applyGravity () {
    this.acceleration.set(0, 0)
    for (const other of bodies) {
      if (other === this) {
        continue
      }
      const distance = p5.Vector.sub(other.position, this.position)
      const rSquared = p5.Vector.magSq(distance)
      const force = (GRAVITY * this.mass * other.mass) / rSquared
      distance.setMag(force / this.mass)
      this.acceleration.add(distance)
    }
  }

  /**
   * Draws the celestial body
   * @method
   * @returns {void}
   */
  display () {
    stroke(0)
    strokeWeight(2)
    fill(this.color)
    ellipse(this.position.x, this.position.y, this.size, this.size)
  }

  /**
   * Updates position and velocity based on acceleration
   * @method
   * @returns {void}
   */
  update () {
    this.velocity.add(this.acceleration)
    this.position.add(this.velocity)
    const e = this.calculateOrbitalParameters()
    if (e > 1 && this.parent) {
      this.checkOtherBodies(e)
      this.checkOrbitAndRemove()
    }
  }

  /**
   * Checks if body should be removed from simulation
   * @method
   * @returns {void}
   */
  checkOrbitAndRemove () {
    if (this.calculateOrbitalParameters() > 1) {
      this.timeOut--
      if (
        this.timeOut <= 0 &&
        Math.abs(this.position.x) > centerX() &&
        Math.abs(this.position.y) > centerY()
      ) {
        bodies.splice(bodies.indexOf(this), 1)
      }
    } else {
      this.timeOut = 100
    }
  }

  /**
   * Checks for better orbital configurations with other bodies
   * @method
   * @param {number} eccentricity - Current orbital eccentricity
   * @returns {number} The lowest achievable eccentricity
   */
  checkOtherBodies (eccentricity) {
    const originalParent = bodies.indexOf(this.parent)
    if (originalParent === -1) {
      console.warn('Original parent body not found in bodies array')
      return eccentricity
    }
    let lowestEccentricity = eccentricity
    let bestParent = this.parent
    for (const potentialParent of bodies) {
      if (
        potentialParent === this ||
        potentialParent === bodies[originalParent]
      ) {
        continue
      }
      this.parent = potentialParent
      const newEccentricity = this.calculateOrbitalParameters()
      if (newEccentricity < lowestEccentricity) {
        lowestEccentricity = newEccentricity
        bestParent = potentialParent
        if (newEccentricity < 0.1) {
          break
        }
      }
    }
    this.parent = lowestEccentricity < 1 ? bestParent : bodies[originalParent]
    return lowestEccentricity
  }
}
