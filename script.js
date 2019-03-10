(() => {

let canvas, ctx, keyboardController;
let ships = [], particles = [], asteroids = [], bullets = [];

function main() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  keyboardController = new KeyboardController();

  const playerShip = new Ship(new Vector2(256, 256));
  ships.push(playerShip);

  // Create random particles
  for (let i = 0; i < 100; i++)
    particles.push(
      new Particle(
        new Vector2(Math.random() * canvas.width, Math.random() * canvas.height))
    );

  updateWorld();
}

class Particle {
  constructor(position, velocity) {
    this.position = position;
    const distance = Math.random() + .25;

    this.speed = distance * 7.5;
    this.radius = distance * 2;
  }

  update() {
    this.position.y += this.speed;

    if (this.position.y > canvas.height + this.radius)
      this.position.y = -this.radius;
  }

  draw() {
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0,2*Math.PI);
    ctx.fill();
  }
}

class Asteroid {
  constructor(position, velocity) {
    this.position = position;

    this.speed = Math.random() * 2 + 3;
    this.radius = Math.random() * 50 + 10;
  }

  update() {
    this.position.y += this.speed;
  }

  draw() {
    ctx.fillStyle = '#860';
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}

class KeyboardController {
  constructor() {
    this.pressedKeys = [];

    document.addEventListener('keydown', (e) => {
      if (this.pressedKeys.indexOf(e.key) === -1)
        this.pressedKeys.push(e.key);
    });

    document.addEventListener('keyup', (e) => {
      const index = this.pressedKeys.indexOf(e.key);
      if (index > -1)
        this.pressedKeys.splice(index, 1);
    });
  }

  isDown(key) {
    return this.pressedKeys.indexOf(key) > -1;
  }
}

class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Bullet {
  constructor(position, angle) {
    this.position = position;
    this.angle = angle;

    const speed = 15;
    this.velocity = new Vector2(Math.cos(this.angle) * speed, Math.sin(this.angle) * speed);
  }

  draw() {
    ctx.save();
    ctx.fillStyle = '#ff5';
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.angle);
    ctx.fillRect(-8, -1, 24, 2);
    ctx.restore();
  }

  update() {
    this.translate();
  }

  translate() {
    const worldSpeed = 3;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.y += .05;
  }
}

class Ship {
  constructor(position) {
    this.position = position;
    this.velocity = new Vector2(0, 0);
    this.angle = -.5 * Math.PI;
    this.cooldownAt = 0;
  }

  draw() {
    ctx.save();
    ctx.fillStyle = '#2af';
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.angle);
    ctx.fillRect(-8, -2, 24, 4);
    ctx.fillRect(-4, -8, 8, 16);
    ctx.restore();
  }

  update() {
    this.translate();
    this.applyFriction();

    // Ship control
    if (keyboardController.isDown('ArrowUp') || keyboardController.isDown('w')) {
      const thrust = .15;
      this.velocity.x += Math.cos(this.angle) * thrust;
      this.velocity.y += Math.sin(this.angle) * thrust;
    }

    if (keyboardController.isDown('ArrowDown') || keyboardController.isDown('s')) {
      const thrust = -.1;
      this.velocity.x += Math.cos(this.angle) * thrust;
      this.velocity.y += Math.sin(this.angle) * thrust;
    }

    const rotationSpeed = .06;
    if (keyboardController.isDown('ArrowLeft') || keyboardController.isDown('a'))
      this.angle -= rotationSpeed;

    if (keyboardController.isDown('ArrowRight') || keyboardController.isDown('d'))
      this.angle += rotationSpeed;

    if (keyboardController.isDown(' ') && this.cooldownAt < new Date().getTime())
      this.shoot();
  }

  shoot() {
    this.cooldownAt = new Date().getTime() + 125;
    const angle = this.angle + (Math.random() - .5) * .1;
    bullets.push(new Bullet(new Vector2(this.position.x, this.position.y), angle));
  }

  translate() {
    const worldSpeed = 3;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // "Gravity"
    this.velocity.y += .05;
  }

  applyFriction() {
    // Ship friction
    this.velocity.x *= .985;
    this.velocity.y *= .985;
  }
}

function drawWorld() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#150505';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let obj of ships)
    obj.draw();

  for (let obj of particles)
    obj.draw();

  for (let obj of bullets)
    obj.draw();

  for (let obj of asteroids)
    obj.draw();
}

function updateWorld() {
  requestAnimationFrame(updateWorld);

  for (let obj of ships)
    obj.update();

  for (let obj of particles)
    obj.update();

  for (let obj of asteroids)
    obj.update();

  for (let obj of bullets)
    obj.update();

  // Spawn asteroids
  if (Math.random() > .95)
    asteroids.push(new Asteroid(new Vector2(Math.random() * canvas.width, -50)));

  // Remove asteroids
  for (let i = asteroids.length - 1; i >= 0; i--)
    if (asteroids[i].position.y > canvas.height + asteroids[i].radius)
      asteroids.splice(i, 1);

  // Remove bullets
  for (let i = bullets.length - 1; i >= 0; i--)
    if (bullets[i].position.y > canvas.height
     || bullets[i].position.y < 0
     || bullets[i].position.x > canvas.width
     || bullets[i].position.x < 0)
      bullets.splice(i, 1);

  drawWorld();
}

  main();
})();
