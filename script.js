// if scrolled to the top = win
// if hit a reactive element = lose
// if hit a non-reactive element = slow down
// Energy bar = 100%; dodge left or right = -40%; regeneration = wow druid regen
// Max game length = 5 minutes

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const timerDisplay = document.getElementById('timerDisplay');


// initialise game time
let gameRunning = false;
let startTime = null;
let timerInterval = null;
let elapsedTime = 0; 

startButton.addEventListener("click", startGame);

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000); // update every second
    }
}

function updateTimer() { 
    if (gameRunning) {
        const currentTime = Date.now();
        elapsedTime = Math.floor((currentTime - startTime) / 1000); // in seconds
        timerDisplay.textContent = `Time: ${elapsedTime}s`;
    }
}


// global speed which increases over time
let globalSpeed = 1; // 1x speed


// class for game entities (atoms, compounds, etc.)
class Entity {
    constructor(name, color, pull, size, jitter, reactivity,) {
        this.name = name;
        this.color = color;  
        this.pull = pull; // 0-1
        this.size = size; // 0-200  
        this.jitter = jitter; // 0-1 
        this.reactivity = reactivity; // true/false
    }
}
// size is in picometers, we will divide by 10 to get pixels
const player = new Entity("Player", "blue", 0, 120, 0, false);
const nitrogenAtom = new Entity("Nitrogen", "green", 0.1, 155, 0.2, false);
const hydrogenAtom = new Entity("Hydrogen", "grey", 0.3, 120, 0.9, true);
const oxygenAtom = new Entity("Oxygen", "red", 0.7, 152, 0.3, true);
const oxygenPair = new Entity("OxygenPair", "orange", 0.5, 275, 0.3, true);
const fluorineAtom = new Entity("Fluorine", "yellow", 0.9, 147, 0.6, true);
const carbonDioxideCompound = new Entity("Carbon Dioxide", "black", 0.1, 444, 0.4, false);

// class for live atom instances in the game
class AtomInstance {
    constructor(entityType, x, y) {
        this.entity = entityType;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = Math.random() * 1 + 1; // moving down
    }

    update() {
        // basic movement
        this.x += this.vx;
        this.y += this.vy;

        // apply jitter
        this.x += (Math.random() - 0.5) * this.entity.jitter * 2;
        this.y += (Math.random() - 0.5) * this.entity.jitter * 2;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.entity.size / 10, 0, Math.PI * 2); // scaled down size
        ctx.fillStyle = this.entity.color;
        ctx.fill();
    }
}

let atoms = [];

// spawn a few atoms
atoms.push(new AtomInstance(oxygenAtom, 100, 100));
atoms.push(new AtomInstance(nitrogenAtom, 200, 150));


function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let atom of atoms) {
        atom.update();
        atom.draw(ctx);
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();










// add global speed, times the speed of atoms, jiggles will determine the effective reactivity.