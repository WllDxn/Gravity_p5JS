# [Orbital simulator built in p5.js](https://wlldxn.github.io/Gravity_p5JS/)

## Overview
An interactive orbital physics simulator that models gravitational forces between celestial bodies.

Click anywhere on canvas to add a body orbiting the primary body.


## Simulating Gravity
<p>

The gravitational force between two bodies is calculated using Newton's law of universal gravitation:

$F = G\frac{m_1m_2}{r^2}$

Where:
- $F$ = Gravitational force
- $G$ = Gravitational constant (0.1 in this simulation)
- $m_1$ = Mass of body 1
- $m_2$ = Mass of body 2
- $r$ = Distance between center of masses

</p>


## Drawing Orbits
<p>

Elliptical orbits are defined by four key parameters:
- $C$ - Orbital center
- $a$ - Length of semimajor axis
- $b$ - Length of semiminor axis
- $e$ - Eccentricity vector

### Orbital Parameters
The following equations determine the orbital characteristics:

$a  = -\frac{\mu \left|r\right|}{\left|r\right|\left|v\right|^2-2\mu}$

$b = a\sqrt{1-\left|e\right|^2}$

$e=\frac{r\times v}{\mu}-\frac{r}{\left|r\right|}$

$\mu = G(m_1+m_2)$

Where:
- $r$ = position vector
- $v$ = velocity vector
- $\mu$ = Standard gravitational parameter
- $G$ = Gravitational constant (0.1 in this simulation)
- $m_1$ = Mass of body 1
- $m_2$ = Mass of body 2

### Orbital Center Calculation
The orbital center $C$ is determined by:
- Distance from primary body = semimajor axis $a$ × eccentricity $\left|e\right|$
- Direction = eccentricity vector $e$ (points from apoapsis to periapsis)

$(C_x,C_y) = ea + (P_x,P_y)$

Where $(P_x,P_y)$ are the primary body coordinates

The orbital ellipse is drawn around point $(C_x,C_y)$ with length $a$ and width $b$, rotated according to the direction of $e$.

</p>



## Initial Velocity Calculation
<p>

For new satellites, initial orbital velocity assumes circular orbits (eccentricity = 0):

$v = \sqrt{\frac{\mu}{a}}$

Where:
- $v$ = Orbital velocity
- $\mu$ = Standard gravitation parameter
- $a$ = Length of semimajor axis (distance between primary body and satellite)

The velocity vector is applied by:
1. Finding the normalized vector between primary body & satellite
2. Rotating it by $\frac{\pi}{2}$
3. Multiplying by orbital velocity $v$

Note: Default satellites have modified eccentricities, while new satellites start with circular orbits.

</p>



## Notes
<p>

- Orbital paths continuously update due to differences between gravitational force simulation and Kepler orbit calculations
- The primary body experiences gravitational forces but is repositioned to the canvas center for visibility
- All bodies in the system affect each other through gravitational interactions

</p>

