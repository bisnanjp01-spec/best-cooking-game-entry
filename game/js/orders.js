/* orders.js — the order board: tickets arrive, patience drains, dishes score.
   One job: the ticket queue, patience, serving and the score. */

var DAY_LENGTH = 180;          /* a 3-minute service day */
var RUSH_AT = 60;              /* last minute is the rush */
var MAX_TICKETS = 4;

var orders = null;

function resetOrders() {
  orders = {
    tickets: [], nextId: 1, spawnIn: 2.5,
    score: 0, coins: 0, served: 0, lost: 0, combo: 0, bestCombo: 0,
    elapsed: 0, timeLeft: DAY_LENGTH
  };
  return orders;
}

function rushIsOn() {
  return orders.timeLeft <= RUSH_AT;
}

function spawnInterval() {
  return rushIsOn() ? 7 : 13;
}

function ticketPatience() {
  return rushIsOn() ? 32 : 46;
}

function spawnTicket() {
  if (orders.tickets.length >= MAX_TICKETS) return null;
  var pool = recipesAvailableAt(orders.elapsed);
  var recipe = pool[Math.floor(Math.random() * pool.length)];
  var patience = ticketPatience();
  var ticket = {
    id: orders.nextId++, recipe: recipe.id, name: recipe.name, short: recipe.short,
    color: recipe.color, patience: patience, maxPatience: patience,
    price: recipe.price, needs: recipe.needs, born: orders.elapsed, alarmed: false
  };
  orders.tickets.push(ticket);
  return ticket;
}

/* Drain patience; expired tickets break the combo. Returns expired tickets. */
function updateOrders(dt) {
  orders.elapsed += dt;
  orders.timeLeft = Math.max(0, DAY_LENGTH - orders.elapsed);
  orders.spawnIn -= dt;
  if (orders.spawnIn <= 0) {
    spawnTicket();
    orders.spawnIn = spawnInterval() * (0.85 + Math.random() * 0.3);
  }
  var expired = [];
  for (var i = orders.tickets.length - 1; i >= 0; i--) {
    var t = orders.tickets[i];
    t.patience -= dt;
    if (!t.alarmed && t.patience <= 10) { t.alarmed = true; playAlarm(); }
    if (t.patience <= 0) {
      expired.push(t);
      orders.tickets.splice(i, 1);
      orders.lost++;
      orders.combo = 0;
    }
  }
  return expired;
}

/* Serve a finished dish: oldest matching ticket pays price + speed tip + combo bonus. */
function serveDish(recipeId) {
  var best = -1, bestBorn = Infinity;
  for (var i = 0; i < orders.tickets.length; i++) {
    var t = orders.tickets[i];
    if (t.recipe === recipeId && t.born < bestBorn) { bestBorn = t.born; best = i; }
  }
  if (best < 0) return null;
  var ticket = orders.tickets[best];
  orders.tickets.splice(best, 1);
  var patienceFrac = Math.max(0, ticket.patience / ticket.maxPatience);
  var tip = Math.round(ticket.price * patienceFrac * 0.5);
  orders.combo++;
  if (orders.combo > orders.bestCombo) orders.bestCombo = orders.combo;
  var comboBonus = (orders.combo - 1) * 10;
  var earned = ticket.price + tip + comboBonus;
  orders.score += earned;
  orders.coins += earned;
  orders.served++;
  return { ticket: ticket, earned: earned, tip: tip, comboBonus: comboBonus, combo: orders.combo, patienceFrac: patienceFrac };
}

function orderSummary() {
  return {
    score: orders.score, coins: orders.coins, served: orders.served,
    lost: orders.lost, combo: orders.combo, bestCombo: orders.bestCombo,
    timeLeft: orders.timeLeft, tickets: orders.tickets.length
  };
}
