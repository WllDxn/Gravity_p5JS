let planetoids = [];
let correctDrift = true;
let temp = 0
function setup() {
  
  createCanvas(600, 600);
  
  planetoids.push(new Planetoid(6000,0,0,0,0,50,'yellow'));
  // planetoids[0].addSatelite(500,0,25,'green')
  planetoids[0].addSatelite(500,250,25,'green',rev=true,x=-200,y=-150);
  // planetoids[0].addSatelite(400,50,15,'blue',rev=true);
}


function draw() {
  background(220);
translate(300,300);
  
  for (let j = 0; j < planetoids.length; j++){
        if (j!==0){
    planetoids[j].drawOrbit();
    }
      planetoids[j].applyGravity();
  }
    for (let j = 0; j < planetoids.length; j++){
      planetoids[j].update();
  }
  for (let j = 0; j < planetoids.length; j++){
    if (correctDrift){
    let drift = p5.Vector.sub(planetoids[0].position,     createVector(0,0))
    planetoids[j].position.sub(drift);
    }
      planetoids[j].display();

  }
  temp+=1
  if (temp==2){
    // pause
  }
  
  
  
}
function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function mousePressed() {
   let colour = color(getRandomInt(0,255), getRandomInt(0,255), getRandomInt(0,255)); planetoids[0].addSatelite(getRandomInt(25,500),null,getRandomInt(10,30),colour,rev=true, x=mouseX-300, y=mouseY-300);
  
}
function Planetoid(m, x, y, vx, vy, s, c) {
  this.mass = m;
  this.position = createVector(x, y);
  this.velocity = createVector(vx, vy);
  this.acceleration = createVector(0, 0);
  this.size = s;
  this.colour = c;
}

Planetoid.prototype.drawOrbit = function(){
  stroke(0);
  strokeWeight(2);
  fill(color(0,0,0,0));
  let v = this.velocity
  let r = this.position
  let u = 0.1*planetoids[0].mass
  let h = p5.Vector.cross(r,v)
  let vh = p5.Vector.cross(v,h)
  let magr = p5.Vector.mag(r)
  let magv = p5.Vector.mag(v)
  let e = p5.Vector.div(vh,u).sub(p5.Vector.div(r,magr))
  let mage = p5.Vector.mag(e)
  let a = -(u*magr)/(magr*Math.pow(magv,2)-2*u)
  let b = a*(Math.sqrt(1-Math.pow(mage,2)))

  push()

  let vec = createVector(planetoids[0].position.x,planetoids[0].position.y)
  vec.add(e).normalize().mult(mage*a).rotate(PI)
  translate(vec.x,vec.y)
rotate(e.heading())
  
  ellipse(0,0,a*2,b*2)
  pop()
};

Planetoid.prototype.addSatelite = function(m, d, s,c,rev=false, x=null, y=null){  
  let newx = (x==null) ? this.position.x : x;
  let newy = (y==null) ? this.position.y-d : y;
  let satelite = new Planetoid(m, newx, newy, 0, 0, s,c)
  let velocity = 0.66*Math.sqrt(this.mass/p5.Vector.dist(satelite.position, this.position)/10);
  velocity = (Math.random()<0.5)?velocity:-velocity;  
  vect = createVector(-(newy),newx);
  vect.normalize();
  vect.mult(velocity)
  satelite.acceleration = vect;    
  
  planetoids.push(satelite)
}

Planetoid.prototype.applyGravity = function () {
    for (let i = 0; i < planetoids.length; i++){
      if (i!==planetoids.indexOf(this)){
      let distance = p5.Vector.sub(this.position,planetoids[i].position)
      let unitVector = -0.1*((this.mass * planetoids[i].mass)/(Math.pow(distance.mag(),3)));
        let g = p5.Vector.mult(distance, unitVector/this.mass);        
        this.acceleration.add(g);
      }
    }
}
Planetoid.prototype.display = function() {
  stroke(0);
  strokeWeight(2);
  fill(this.colour);
  ellipse(this.position.x, this.position.y, this.size, this.size);
};
Planetoid.prototype.update = function() {
  this.velocity.add(this.acceleration);
  this.position.add(this.velocity);
  this.acceleration.mult(0);
};