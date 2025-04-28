// --- Entity Config --- 
// 'Pull' has no functionality yet, but could be used for a electromagnetic-like forces
// 'Reactivity' is whether the atom can bond with others
// 'Size' is in the atoms relative 'Van der Waals radius' which later is divided by 10 to get the actual radius in pixels
class Entity {
  constructor(name, symbol, color, pull, size, jitter, reactivity, spawnChance) {
    this.name = name;
    this.symbol = symbol;
    this.color = color;
    this.pull = pull;
    this.size = size;
    this.jitter = jitter;
    this.reactivity = reactivity;
    this.spawnChance = spawnChance;
  }
}

const ENTITY_TYPES = [
  new Entity('Energy', '⚡', 'pink', 0, 100, 0, false, 0), // 
  new Entity('Hydrogen',     'H',  'grey',   0.3, 120, 0.9, true,  0.40),
  new Entity('Oxygen',       'O',  'red',    0.7, 152, 0.3, true,  0.30),
  new Entity('Nitrogen',     'N',  'green',  0.1, 155, 0.2, true,  0.20),
  new Entity('Fluorine',     'F',  'yellow', 0.9, 147, 0.6, true,  0.05),
  new Entity('CarbonDioxide','CO₂','black',  0.1, 444, 0.4, true,  0.05)
];

  
  // --- Globals & UI ---
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const startButton = document.getElementById("startButton");
  const timerDisplay = document.getElementById("timerDisplay");
  const targetDisplay = document.getElementById("targetDisplay");
  const bondedDisplay = document.getElementById("bondedDisplay");
  
  let gameRunning = false;
  let startTime = 0;
  let elapsedSeconds = 0;
  let atoms = [];
  let player;
  
  // --- Target Compound Setup ---
  // e.g. H2O = [ 'Hydrogen', 'Hydrogen', 'Oxygen' ]
  let targetCompound = [];
  let bonded = [];
  function chooseTarget() {
    // For demo, always water H2O
    targetCompound = ['Hydrogen','Hydrogen','Oxygen'];
    bonded = [];
    renderTarget();
    renderBonded();
  }
  function renderTarget() {
    targetDisplay.textContent = 'Target: ' + targetCompound.join('-');
  }
  function renderBonded() {
    bondedDisplay.textContent = 'Bonded: ' + (bonded.length ? bonded.join('-') : 'None');
  }
  
  // --- Weighted Picker ---
  function pickRandomEntityType() {
    const r = Math.random(); let sum = 0;
    for (let t of ENTITY_TYPES) {
      sum += t.spawnChance;
      if (r <= sum) return t;
    }
    return ENTITY_TYPES[ENTITY_TYPES.length-1];
  }
  
  // --- AtomInstance & Player ---
  class AtomInstance {
    constructor(entity, x) {
      this.entity = entity;
      this.x = x;
      this.baseX = x; // Store the original x position
      this.y = -entity.size / 10;
      this.vy = (Math.random() * 0.5 + 0.5);
      this.jitterOffset = 0;
    }
  
    update() {
      this.y += this.vy;
  
      // Jitter logic
      if (this.entity.jitter > 0) {
        this.jitterOffset = (Math.random() - 0.5) * this.entity.jitter * 5;
        this.x = this.baseX + this.jitterOffset;
      }
    }
  
    draw() {
      const r = this.entity.size / 10;
  
      // Draw the circle
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = this.entity.color;
      ctx.fill();
      ctx.closePath();
  
      // Draw the symbol
      ctx.fillStyle = "#fff";
      ctx.font = `${r}px Share Tech Mono`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.entity.symbol, this.x, this.y);
    }
  }
  class PlayerAtomInstance extends AtomInstance {
    constructor(entity) {
      super(entity, canvas.width/2);
      this.y = canvas.height*0.8;
      this.speed = 2;
    }
    update() {
      let dx=0, dy=0;
      if (keys.w) dy=-1; if (keys.s) dy=1;
      if (keys.a) dx=-1; if (keys.d) dx=1;
      if (dx&&dy) { dx*=Math.SQRT1_2; dy*=Math.SQRT1_2; }
      this.x = Math.min(Math.max(this.x+dx*this.speed, this.entity.size/10), canvas.width - this.entity.size/10);
      this.y = Math.min(Math.max(this.y+dy*this.speed, this.entity.size/10), canvas.height - this.entity.size/10);
    }
    draw() { super.draw(); }
  }
  
  // --- Input ---
  const keys = {w:false,a:false,s:false,d:false};
  window.addEventListener('keydown', e=>{ if(e.key in keys) keys[e.key]=true; });
  window.addEventListener('keyup',   e=>{ if(e.key in keys) keys[e.key]=false; });
  
  // --- Spawning ---
  function spawnAtoms() {
    if (Math.random()<0.02) {
      const type = pickRandomEntityType();
      const x = Math.random()*(canvas.width - type.size/10*2) + type.size/10;
      atoms.push(new AtomInstance(type,x));
    }
  }
  
  // --- Timer ---
  function updateTimer() {
    elapsedSeconds = Math.floor((Date.now()-startTime)/1000);
    timerDisplay.textContent = `Time: ${elapsedSeconds}s`;
  }
  
  // --- Bonding & Collision ---
  function checkCollisions() {
    for (let i=atoms.length-1; i>=0; i--) {
      const atom = atoms[i];
      const dx = atom.x - player.x;
      const dy = atom.y - player.y;
      const dist = Math.hypot(dx,dy);
      const rSum = atom.entity.size/10 + player.entity.size/10;
      if (dist < rSum) {
        atoms.splice(i,1);
        if (!atom.entity.reactivity) {
          // inert, just ignore
        } else {
          // reactive: attempt to bond
          if (bonded.length < targetCompound.length && atom.entity.name === targetCompound[bonded.length]) {
            bonded.push(atom.entity.name);
            renderBonded();
            if (bonded.length === targetCompound.length) winGame();
          } else {
            loseGame();
          }
        }
      }
    }
  }
  
  // --- Win/Lose ---
  function winGame() {
    gameRunning=false;
    alert('You formed ' + targetCompound.join('-') + '! You win!');
  }
  function loseGame() {
    gameRunning=false;
    alert('Wrong bond! Game over.');
  }
  
  // --- Main Loop ---
  function gameLoop() {
    if (!gameRunning) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    updateTimer(); spawnAtoms();
    player.update(); player.draw();
    for (let atom of atoms) { atom.update(); atom.draw(); }
    checkCollisions();
    atoms = atoms.filter(a=>a.y < canvas.height + a.entity.size/10);
    if (gameRunning) requestAnimationFrame(gameLoop);
  }
  
  // --- Start ---
  startButton.addEventListener('click', () => {
    if (gameRunning) return;
    chooseTarget();
    atoms = [];
    const energyType = ENTITY_TYPES.find(e => e.name === 'Energy');
    player = new PlayerAtomInstance(energyType);
    startTime = Date.now();
    gameRunning = true;
    requestAnimationFrame(gameLoop);
  });