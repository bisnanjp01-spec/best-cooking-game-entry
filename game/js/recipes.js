/* recipes.js — every ingredient and every dish of Hearth & Ember.
   One job: the data that defines what can be cooked and what each dish is worth. */

var INGREDIENTS = {
  tomato:  { id: "tomato",  name: "Tomato",  color: "#e2483a", dark: "#a92c22", light: "#ff7a5c", chop: true,  grill: false, price: 0 },
  lettuce: { id: "lettuce", name: "Lettuce", color: "#7bc043", dark: "#4d8a26", light: "#b5e388", chop: true,  grill: false, price: 0 },
  patty:   { id: "patty",   name: "Patty",   color: "#8a5a3b", dark: "#5f3a22", light: "#b07a52", chop: false, grill: true,  price: 0 },
  bun:     { id: "bun",     name: "Bun",     color: "#e8a94f", dark: "#b57a28", light: "#ffd08a", chop: false, grill: false, price: 0 },
  cheese:  { id: "cheese",  name: "Cheese",  color: "#f6c945", dark: "#d19a1d", light: "#ffe27a", chop: false, grill: false, price: 0 },
  onion:   { id: "onion",   name: "Onion",   color: "#e8dcc8", dark: "#b3a586", light: "#fff6e0", chop: true,  grill: false, price: 0 }
};

var INGREDIENT_ORDER = ["tomato", "lettuce", "patty", "bun", "cheese", "onion"];

/* A dish need: { ing, state } where state is raw | chopped | grilled | soup.
   A plate matches a recipe when its items are exactly the recipe's needs. */
var RECIPES = [
  {
    id: "salad", name: "Garden Salad", short: "Salad",
    needs: [{ ing: "lettuce", state: "chopped" }, { ing: "tomato", state: "chopped" }],
    price: 90, color: "#7bc043", blurb: "Crisp, chopped, straight from the garden bed."
  },
  {
    id: "soup", name: "Tomato Soup", short: "Soup",
    needs: [{ ing: "tomato", state: "soup" }],
    price: 120, color: "#e2483a", blurb: "Two tomatoes simmered in the ember pot."
  },
  {
    id: "skewer", name: "Flame Skewer", short: "Skewer",
    needs: [{ ing: "patty", state: "grilled" }, { ing: "onion", state: "chopped" }],
    price: 140, color: "#c96a2e", blurb: "Char-grilled patty with sweet chopped onion."
  },
  {
    id: "melt", name: "Cheese Melt", short: "Melt",
    needs: [{ ing: "bun", state: "raw" }, { ing: "cheese", state: "raw" }, { ing: "tomato", state: "chopped" }],
    price: 110, color: "#f6c945", blurb: "Warm bun, melted cheese, fresh tomato."
  },
  {
    id: "burger", name: "Ember Burger", short: "Burger",
    needs: [
      { ing: "bun", state: "raw" }, { ing: "patty", state: "grilled" },
      { ing: "cheese", state: "raw" }, { ing: "lettuce", state: "chopped" }
    ],
    price: 160, color: "#e8a94f", blurb: "The house signature, straight off the grill."
  },
  {
    id: "stack", name: "Ember Stack", short: "Stack",
    needs: [
      { ing: "bun", state: "raw" }, { ing: "patty", state: "grilled" },
      { ing: "patty", state: "grilled" }, { ing: "cheese", state: "raw" },
      { ing: "tomato", state: "chopped" }
    ],
    price: 190, color: "#a34d1d", blurb: "Double patty, double trouble, double tip."
  }
];

function recipeById(id) {
  for (var i = 0; i < RECIPES.length; i++) if (RECIPES[i].id === id) return RECIPES[i];
  return null;
}

/* The recipe a plate of items completes, or null. Exact multiset match. */
function recipeMatchingPlate(items) {
  for (var r = 0; r < RECIPES.length; r++) {
    var needs = RECIPES[r].needs;
    if (needs.length !== items.length) continue;
    var used = [];
    var ok = true;
    for (var i = 0; i < needs.length; i++) {
      var found = -1;
      for (var j = 0; j < items.length; j++) {
        if (used.indexOf(j) < 0 && items[j].ing === needs[i].ing && items[j].state === needs[i].state) { found = j; break; }
      }
      if (found < 0) { ok = false; break; }
      used.push(found);
    }
    if (ok) return RECIPES[r];
  }
  return null;
}

/* True when an item could still belong to some recipe that also needs the plate's items. */
function itemFitsSomeRecipe(plateItems, item) {
  var trial = plateItems.concat([item]);
  for (var r = 0; r < RECIPES.length; r++) {
    var needs = RECIPES[r].needs.slice();
    var ok = true;
    for (var i = 0; i < trial.length; i++) {
      var idx = -1;
      for (var j = 0; j < needs.length; j++) {
        if (needs[j].ing === trial[i].ing && needs[j].state === trial[i].state) { idx = j; break; }
      }
      if (idx < 0) { ok = false; break; }
      needs.splice(idx, 1);
    }
    if (ok) return true;
  }
  return false;
}

/* Recipes unlocked as the day goes on: early tickets are simple, later ones stack up. */
function recipesAvailableAt(elapsedSeconds) {
  if (elapsedSeconds < 45) return RECIPES.slice(0, 3);
  if (elapsedSeconds < 100) return RECIPES.slice(0, 5);
  return RECIPES;
}
