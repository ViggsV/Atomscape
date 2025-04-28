
// Base Entity definition for static data
class Entity {
    constructor(name, color, pull, size, jitter, reactivity, spawnChance) {
      this.name = name;
      this.color = color;
      this.pull = pull;         // 0.0 - 1.0
      this.size = size;         // picometers, will be scaled to pixels (e.g., size / 10)
      this.jitter = jitter;     // 0.0 - 1.0
      this.reactivity = reactivity; // boolean
      this.spawnChance = spawnChance; // 0.0 - 1.0, relative weight
    }
  }
  
  // List of all entity types with their spawn probabilities
  // Make sure the sum of all spawnChance values equals 1.0
  const ENTITY_TYPES = [
    new Entity('Hydrogen',    'grey',   0.3, 120, 0.9, true,  0.40), // common
    new Entity('Oxygen',      'red',    0.7, 152, 0.3, true,  0.30), // reactive
    new Entity('Nitrogen',    'green',  0.1, 155, 0.2, false, 0.20), // inert
    new Entity('Fluorine',    'yellow', 0.9, 147, 0.6, true,  0.05), // rare & deadly
    new Entity('CarbonDioxide','black', 0.1, 444, 0.4, false, 0.05)  // less common
  ];