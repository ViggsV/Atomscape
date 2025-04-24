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

function endGame() {
    gameRunning = false;
    clearInterval(timerInterval);
    alert(`Game Over! You survived for ${elapsedTime} seconds.`);
    // reset game state
    elapsedTime = 0;
    timerDisplay.textContent = `Time: 0s`;
}


// global speed which increases over time
let globalSpeed = 1; // 1x speed of all atoms, as the game progresses, this will increase#
let playerSpeed = 1; // player speed, this will increase as the player picks up energy
let playerPosition = 0; // player position, this will increase as the player moves up in the atmosphere
const maxPosition = 4000; // max position to win the game
// as the player moves, other atom velocity increase. If you increase player speed. Rate of velocity increase.
// I need to make elements move faster as player goes up in the atmosphere. So I need to keep track of players position and speed. 
// Players position doesn't have to be an actual co-oordinate. It can just be a mathematical expression.
// Player x = 0. 
// player speed = 1 per second.
// When player x = 4000, win the game
// spawning atoms at semi-random intervals, depending on the player position. If its below 1000, spawn lots of them with slow speed.
// spawning below 2000, spawn less with medium speed
// spawning below 3000, spawn even less with fast speed.
// spawning above 3000, spawn very few with very fast speed.
// on startGame, start spawning atoms.  


// spawnRate decreses as player position increases
function spawnRate(playerPosition) {
    if (playerPosition < 1000) {
        return Math.random() * 0.5 + 2; // very fast speed
    }
    else if (playerPosition < 2000) {
        return Math.random() * 0.5 + 1.5; // fast speed

    } else if (playerPosition < 3000) {
        return Math.random() * 0.5 + 1; // medium speed
    } else {
        return Math.random() * 0.5 + 0.5; // slow speed
        
    }
}

// atomSpeed increases as player position increases
function atomSpeed(playerPosition) {
    if (playerPosition < 1000) {
        return Math.random() * 0.5 + 0.1; // slow speed
    }
    else if (playerPosition < 2000) {
        return Math.random() * 0.5 + 0.2; // medium speed
    } else if (playerPosition < 3000) {
        return Math.random() * 0.5 + 0.5; // fast speed
    } else {
        return Math.random() * 0.5 + 1; // very fast speed
        
    }
}

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
const playerAtom = new Entity("Player", "blue", 0, 120, 0, false);
const nitrogenAtom = new Entity("Nitrogen", "green", 0.1, 155, 0.2, false);
const hydrogenAtom = new Entity("Hydrogen", "grey", 0.3, 120, 0.9, true);
const oxygenAtom = new Entity("Oxygen", "red", 0.7, 152, 0.3, true);
const oxygenPair = new Entity("OxygenPair", "orange", 0.5, 275, 0.3, true);
const fluorineAtom = new Entity("Fluorine", "yellow", 0.9, 147, 0.6, true);
const carbonDioxideCompound = new Entity("Carbon Dioxide", "black", 0.1, 444, 0.4, false);


// class for live atom instances in the game
class AtomInstance {
    constructor(entityType, x) {
        this.entity = entityType;
        this.x = x;
        this.y = -100; // start off screen
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

// player movement controls
let isWPressed = false;
let isAPressed = false;
let isSPressed = false;
let isDPressed = false;

// is key pressed
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w':
            isWPressed = true;
            break;
        case 'a':
            isAPressed = true;
            break;
        case 's':
            isSPressed = true;
            break;
        case 'd':
            isDPressed = true;
            break;
    }
});

// is key released
window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'w':
            isWPressed = false;
            break;
        case 'a':
            isAPressed = false;
            break;
        case 's':
            isSPressed = false;
            break;
        case 'd':
            isDPressed = false;
            break;
    }
});
// player class

class PlayerAtomInstance extends AtomInstance {
    constructor(entityType) {
        super(entityType); // Call the constructor of AtomInstance
        this.x = 400;          // Override the initial x position for the player
        this.y = 550;          // Override the initial y position for the player
        this.isPlayer = true;      // Add a specific property for the player
        this.vx = 0;              // Player starts with no horizontal velocity
        this.vy = 0;              // Player starts with no vertical velocity (initially)
        this.speed = playerSpeed;           // Player's movement speed
        
    }

    // You can override the update method if the player's movement is different
    
    update() {
        this.vx = 0; // Reset horizontal velocity each frame
        this.vy = 0; // Reset vertical velocity each frame
    
        if (isWPressed) {
            this.vy = -1; // Move up
        }
        if (isAPressed) {
            this.vx = -1; // Move left
        }
        if (isSPressed) {
            this.vy = 1;  // Move down
        }
        if (isDPressed) {
            this.vx = 1;  // Move right
        }
    
        // Normalize diagonal movement to prevent faster speed
        if (this.vx !== 0 && this.vy !== 0) {
            this.vx *= Math.SQRT1_2;
            this.vy *= Math.SQRT1_2;
        }
    
        this.x += this.vx * this.speed;
        this.y += this.vy * this.speed;
    
        // Apply jitter
        this.x += (Math.random() - 0.5) * this.entity.jitter * 0.5;
        this.y += (Math.random() - 0.5) * this.entity.jitter * 0.5;
    }

    // The draw method
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.entity.size / 10, 0, Math.PI * 2);
        ctx.fillStyle = this.entity.color; 
        ctx.fill();
    }


}

let atoms = [];
let player = [];

player.push(new PlayerAtomInstance(playerAtom)); // player atom

// spawn a few atoms
atoms.push(new AtomInstance(oxygenAtom, 100));
atoms.push(new AtomInstance(nitrogenAtom, 200));


function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let atom of atoms) {
        atom.update();
        atom.draw(ctx);
    }

    for (let atom of player) {
        atom.update();
        atom.draw(ctx);
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();



