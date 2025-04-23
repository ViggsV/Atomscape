const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");

// if scrolled to the top = win
// if hit a reactive element = lose
// if hit a non-reactive element = slow down
// Energy bar = 100%; dodge left or right = -40%; regeneration = wow druid regen
// Max game length = 5 minutes


class Entity {
    constructor(name, color, pull, size, jitter, reactivity,) {
        this._name = name;
        this._color = color;  
        this._pull = pull; // 0-1
        this._size = size; // 0-200  
        this._jitter = jitter; // 0-1 
        this._reactivity = reactivity; // true/false
    }
}
// size is in picometers, we will divide by 10 to get pixels
const player = new Entity("Player", "blue", 0, 120, 0, false);
const nitrogenAtom = new Entity("Nitrogen", "green", 0.1, 155, 0.2, false);
const hydrogenAtom = new Entity("Hydrogen", "grey", 0.3, 120, 0.9, true);
const oxygenAtom = new Entity("Oxygen", "red", 0.7, 152, 0.3, true);
const oxygenPair = new Entity("OxygenPair", "red", 0.5, 275, 0.3, true);
const fluorineAtom = new Entity("Fluorine", "yellow", 0.9, 147, 0.6, true);
const carbonDioxideCompound = new Entity("Carbon Dioxide", "black", 0.1, 444, 0.4, false);


// initialise gametime
let startTime = null;
const maxTime = 5 * 60 * 1000; // 5 minutes
let gameRunning = false;

