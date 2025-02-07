
[Orbital simulator built in p5.js](https://wlldxn.github.io/Gravity_p5JS/)
==============



## Simulating Gravity
$F = G\frac{m_1m_2}{r^2}$
<br><br><br>
$F$ - Gravitational force

$G$ - Gravitational constant (using 0.1 in this simulation)

$m_1$ - Mass of body 1

$m_2$ - Mass of body 2

$r$ - Distance between center of masses

---

## Drawing orbits

Drawing elliptical orbits requires 4 parameters

$C$ - Orbital center

$a$ - Length of semimajor axis

$b$ - Length of semiminor axis

$e$ - Eccentricity vector
<br><br>



$a  = -\frac{\mu \left|r\right|}{\left|r\right|\left|v\right|^2-2\mu} $

$b = a\sqrt{1-\left|e\right|^2}$

$e=\frac{r\times v}{\mu}-\frac{r}{\left|r\right|}$

$\mu = G(m_1+m_2)$
<br><br><br>
$r$ - position vector

$v$ - velocity vector

$\mu$ - Standard gravitational parameter

$G$ - Gravitational constant (using 0.1 in this simulation)

$m_1$ - Mass of body 1

$m_2$ - Mass of body 2

<br><br>
The distance between $C$ and the primary body is equal to the length of the semimajor axis $a$ multiplied by the eccentricity $\left|e\right|$.
<br>The direction of $C$ from the primary body is equal to the direction of the eccentricity vector $e$, which points from the  apoapsis to periapsis.
<br>Therefore, the coordinates of $C$ are identified by multiplying the eccentricity vector $e$ by the length of the semimajor axis $a$ and adding the value of these coordinates to the coordinates of the primary body.

$(C_x,C_y) = ea + (P_x,P_y)$

$(P_x,P_y)$ - Primary body coordinates

<br>

The orbital ellipse can therefore be drawn around point $(C_x,C_y)$ with length $a$ and width $b$. 
<br>The rotation of the ellipse is equal to the direction of the eccentricity vector $e$, both with respect to the horizontal axis.

---

## Calculating initial velocity

Initial orbital velocity is calculated by assuming that the eccentricity of an orbit is 0, i.e. that the orbit is circular.

$v = \sqrt{\frac{\mu}{a}}$

$v$ - Orbital velocity

$\mu$ - Standard  gravitation parameter

$a$ - length of semimajor axis (equal to distance between primary body and satellite)

<br>To apply this velocity to the velocity vector of a satelite, find the vector distance between the primary body & satelite, normalize this, then rotate it by a factor of $\frac{\pi}{2}$ and multiply by the Orbital velocity $v$. This ensures that the satellite will travel at a perpendicular direction to the primary body.

<br>Note: the default satellites in the system have altered eccentricities, but any additional satellites created will begin with circular orbits. 


---
## Additional points
- The orbits drawn by this simulation constanty change, even when being used to show a single body orbiting the primary body. This is because of the discrepancy between the simple simulation of gravitational forces acting on each body by every other body and calculating the orbital ellipse as a keplar orbit.

- Gravitational forces acting on the primary body $\textit{are}$ being calculated, it is just moved back to the center of the canvas so that it remains visible at all times

