/* game.js — the main loop, input, and the rules that tie the kitchen together.
   One job: run the service day — state machine, interaction, cooking timers, particles. */

var canvas = null;
var ctx = null;
var gameState = { state: "menu", nearStation: null, now: 0, chopSoundIn: 0, sizzleIn: 0 };
var keys = { left: false, right: false, up: false, down: false, interact: false };
var particles = [];
var popups = [];

function resetGame() {
  resetKitchen();
  resetChef();
  resetOrders();
  particles = [];
  popups = [];
  gameState.state = "menu";
  gameState.nearStation = null;
  gameState.now = 0;
}

function startShift() {
  resetKitchen();
  resetChef();
  resetOrders();
  particles = [];
  popups = [];
  gameState.state = "playing";
  gameState.now = 0;
  spawnTicket();
  /* debug hook for play-testing: ?ticket=salad forces the first ticket's dish */
  var forced = new URLSearchParams(window.location.search).get("ticket");
  if (forced && recipeById(forced) && orders.tickets.length > 0) {
    var r = recipeById(forced);
    var first = orders.tickets[0];
    first.recipe = r.id; first.name = r.name; first.short = r.short;
    first.color = r.color; first.price = r.price; first.needs = r.needs;
  }
  playStartJingle();
  addPopup(640, 330, "Service starts — first ticket is in!", "#f6c945", 26);
}

function endShift() {
  gameState.state = "over";
  playGameOver();
}

function addPopup(x, y, text, color, size) {
  popups.push({ x: x, y: y, text: text, color: color || "#f6c945", size: size || 22, life: 1.6, maxLife: 1.6 });
}

function addSteam(x, y) {
  particles.push({
    x: x + (Math.random() * 20 - 10), y: y, size: 4 + Math.random() * 5,
    vx: (Math.random() - 0.5) * 8, vy: -22 - Math.random() * 14,
    color: "rgba(230,230,230,0.7)", life: 1.1, maxLife: 1.1
  });
}

function addChopBits(x, y, color) {
  for (var i = 0; i < 8; i++) {
    particles.push({
      x: x, y: y, size: 2 + Math.random() * 3,
      vx: (Math.random() - 0.5) * 90, vy: -20 - Math.random() * 50,
      color: color, life: 0.5, maxLife: 0.5
    });
  }
}

function updateParticles(dt) {
  for (var i = particles.length - 1; i >= 0; i--) {
    var p = particles[i];
    p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 6 * dt; p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
  for (var j = popups.length - 1; j >= 0; j--) {
    var q = popups[j];
    q.y -= 34 * dt; q.life -= dt;
    if (q.life <= 0) popups.splice(j, 1);
  }
}

/* ---- interaction: what E / a click does at each station ---- */

function interactAt(station) {
  if (!station) return;
  var kind = station.kind;
  if (kind === "crate") {
    if (chef.carrying) { playError(); addPopup(chef.x, chef.y - 70, "Hands full!", "#ff8a7a", 18); return; }
    chef.carrying = { ing: station.ing, state: "raw" };
    playPickup();
    addPopup(station.ix, station.iy - 40, INGREDIENTS[station.ing].name + " grabbed", "#f3e5c8", 16);
    return;
  }
  if (kind === "board") {
    if (station.item) {
      if (station.item.state === "chopped") {
        if (chef.carrying) { playError(); return; }
        chef.carrying = station.item; station.item = null; station.progress = 0;
        playPickup();
      }
      return; /* still chopping — hold E instead */
    }
    if (chef.carrying && !chef.carrying.dish && INGREDIENTS[chef.carrying.ing].chop && chef.carrying.state === "raw") {
      station.item = chef.carrying; station.progress = 0; chef.carrying = null;
      playPlace();
    } else if (chef.carrying) {
      playError(); addPopup(chef.x, chef.y - 70, "That doesn't need chopping", "#ff8a7a", 16);
    }
    return;
  }
  if (kind === "grill") {
    if (chef.carrying && chef.carrying.ing === "patty" && chef.carrying.state === "raw") {
      for (var i = 0; i < 2; i++) {
        if (!station.slots[i]) { station.slots[i] = { ing: "patty", t: 0 }; chef.carrying = null; playPlace(); return; }
      }
      playError(); addPopup(chef.x, chef.y - 70, "Grill is full!", "#ff8a7a", 16);
      return;
    }
    if (!chef.carrying) {
      for (var j = 0; j < 2; j++) {
        var slot = station.slots[j];
        if (slot && grillSlotState(slot) !== "cooking") {
          var st = grillSlotState(slot);
          chef.carrying = { ing: "patty", state: st === "grilled" ? "grilled" : "burnt" };
          station.slots[j] = null;
          playPickup();
          return;
        }
      }
    }
    return;
  }
  if (kind === "pot") {
    if (station.ready) {
      if (chef.carrying) { playError(); return; }
      chef.carrying = { ing: "tomato", state: "soup" };
      station.ready = false; station.tomatoes = 0; station.cook = 0;
      playPickup(); playDing();
      return;
    }
    if (chef.carrying && chef.carrying.ing === "tomato" && chef.carrying.state === "raw" && station.tomatoes < 2) {
      station.tomatoes++; chef.carrying = null; playPlace();
      if (station.tomatoes === 2) addPopup(station.ix, station.iy - 40, "Soup simmering…", "#f3e5c8", 16);
      return;
    }
    if (chef.carrying) { playError(); addPopup(chef.x, chef.y - 70, "The pot only takes tomatoes", "#ff8a7a", 16); }
    return;
  }
  if (kind === "assembly") {
    if (station.dish && !chef.carrying) {
      chef.carrying = { dish: station.dish };
      station.dish = null; station.items = [];
      playPickup();
      addPopup(chef.x, chef.y - 70, "Dish ready — to the pass!", "#7bc043", 16);
      return;
    }
    if (chef.carrying && !chef.carrying.dish) {
      if (station.dish) { playError(); return; }
      if (!itemFitsSomeRecipe(station.items, chef.carrying)) {
        playError();
        addPopup(chef.x, chef.y - 70, "No recipe wants that here", "#ff8a7a", 16);
        return;
      }
      station.items.push(chef.carrying);
      chef.carrying = null;
      playPlace();
      var match = recipeMatchingPlate(station.items);
      if (match) {
        station.dish = match.id;
        playDing();
        addPopup(station.ix, station.iy - 50, match.name + " complete! 🎉", "#7bc043", 20);
      }
      return;
    }
    if (!chef.carrying && station.items.length > 0 && !station.dish) {
      chef.carrying = station.items.pop();
      playPickup();
      return;
    }
    return;
  }
  if (kind === "serve") {
    if (chef.carrying && chef.carrying.dish) {
      var result = serveDish(chef.carrying.dish);
      if (result) {
        chef.carrying = null;
        playServe();
        addPopup(station.ix - 40, station.iy - 60, "+" + result.earned + "  (tip " + result.tip + (result.comboBonus ? ", combo +" + result.comboBonus : "") + ")", "#f6c945", 24);
        addPopup(station.ix - 40, station.iy - 30, result.ticket.name + " served! Combo ×" + result.combo, "#7bc043", 16);
      } else {
        playError();
        addPopup(chef.x, chef.y - 70, "No ticket wants that dish!", "#ff8a7a", 16);
      }
    }
    return;
  }
  if (kind === "trash") {
    if (chef.carrying) {
      chef.carrying = null;
      playPlace();
      addPopup(station.ix, station.iy - 40, "Composted", "#d9b98a", 16);
    }
    return;
  }
}

/* ---- per-frame cooking work ---- */

function updateCooking(dt) {
  var grill = stationById("grill");
  for (var i = 0; i < 2; i++) {
    var slot = grill.slots[i];
    if (slot) {
      slot.t += dt;
      if (Math.random() < dt * 3) addSteam(grill.x + 34 + i * 62, grill.y + 14);
    }
  }
  var pot = stationById("pot");
  if (pot.tomatoes === 2 && !pot.ready) {
    pot.cook += dt;
    if (Math.random() < dt * 4) addSteam(pot.x + pot.w / 2, pot.y + 10);
    if (pot.cook >= POT_COOK) { pot.ready = true; pot.cook = 0; playDing(); addPopup(pot.ix, pot.iy - 40, "Soup's ready!", "#7bc043", 16); }
  }
  /* hold-to-chop */
  var board = stationById("board");
  chef.chopping = false;
  if (keys.interact && board.item && board.item.state !== "chopped" && gameState.nearStation === board) {
    chef.chopping = true;
    board.progress += dt / CHOP_TIME;
    gameState.chopSoundIn -= dt;
    if (gameState.chopSoundIn <= 0) {
      playChop();
      addChopBits(board.x + board.w / 2, board.y + board.h / 2, INGREDIENTS[board.item.ing].color);
      gameState.chopSoundIn = 0.32;
    }
    if (board.progress >= 1) {
      board.item.state = "chopped";
      board.progress = 0;
      playChopDone();
      addPopup(board.ix, board.iy - 40, INGREDIENTS[board.item.ing].name + " chopped!", "#7bc043", 16);
    }
  }
  gameState.sizzleIn -= dt;
  var anyCooking = grill.slots[0] || grill.slots[1] || (pot.tomatoes === 2 && !pot.ready);
  if (anyCooking && gameState.sizzleIn <= 0) { playSizzleTick(); gameState.sizzleIn = 0.5; }
}

function updatePlaying(dt) {
  var expired = updateOrders(dt);
  for (var i = 0; i < expired.length; i++) {
    playExpire();
    addPopup(640, 200, "Ticket #" + expired[i].id + " walked out! Combo lost.", "#ff8a7a", 20);
  }
  /* click-to-station: walk there, then use it */
  if (chef.pendingStation) {
    var arrived = chefWalkToStation(chef.pendingStation, dt);
    if (arrived) {
      var target = chef.pendingStation;
      chef.pendingStation = null;
      interactAt(target);
    }
  } else {
    moveChef(dt, keys);
  }
  gameState.nearStation = nearestStationTo(chef.x, chef.y, 95);
  updateCooking(dt);
  updateParticles(dt);
  if (orders.timeLeft <= 0) endShift();
}

/* ---- input ---- */

function canvasPoint(evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: (evt.clientX - rect.left) * (KITCHEN.w / rect.width),
    y: (evt.clientY - rect.top) * (KITCHEN.h / rect.height)
  };
}

function onCanvasClick(evt) {
  ensureAudio();
  if (gameState.state === "menu") { startShift(); return; }
  if (gameState.state === "over") { startShift(); return; }
  if (gameState.state === "paused") { gameState.state = "playing"; return; }
  var p = canvasPoint(evt);
  var station = stationAtPoint(p.x, p.y);
  if (station) { chefSetStationTarget(station); return; }
  chefSetClickTarget(p.x, p.y);
}

function onKeyDown(evt) {
  var k = evt.key.toLowerCase();
  if (k === "arrowup" || k === "arrowdown" || k === "arrowleft" || k === "arrowright" || k === " ") evt.preventDefault();
  ensureAudio();
  if (k === "arrowleft" || k === "a") keys.left = true;
  else if (k === "arrowright" || k === "d") keys.right = true;
  else if (k === "arrowup" || k === "w") keys.up = true;
  else if (k === "arrowdown" || k === "s") keys.down = true;
  else if (k === "e" || k === " ") {
    if (!keys.interact) {
      keys.interact = true;
      if (gameState.state === "playing" && gameState.nearStation) interactAt(gameState.nearStation);
    }
  } else if (k === "enter") {
    if (gameState.state === "menu" || gameState.state === "over") startShift();
  } else if (k === "p") {
    if (gameState.state === "playing") gameState.state = "paused";
    else if (gameState.state === "paused") gameState.state = "playing";
  } else if (k === "m") {
    audioToggleMute();
  } else if (k === "r") {
    if (gameState.state === "over") startShift();
  }
}

function onKeyUp(evt) {
  var k = evt.key.toLowerCase();
  if (k === "arrowleft" || k === "a") keys.left = false;
  else if (k === "arrowright" || k === "d") keys.right = false;
  else if (k === "arrowup" || k === "w") keys.up = false;
  else if (k === "arrowdown" || k === "s") keys.down = false;
  else if (k === "e" || k === " ") keys.interact = false;
}

/* ---- staged scenes for screenshots: real renders of the running game ---- */

function stageScene(name) {
  startShift();
  popups = []; /* the start-shift popup would fog the screenshot */
  var board = stationById("board");
  var grill = stationById("grill");
  var pot = stationById("pot");
  var assembly = stationById("assembly");
  if (name === "rush") {
    orders.elapsed = 122; orders.timeLeft = 58; /* inside the last-minute RUSH */
    orders.score = 1240; orders.coins = 1240; orders.served = 9; orders.combo = 3; orders.bestCombo = 5;
    orders.tickets = [
      { id: 11, recipe: "burger", name: "Ember Burger", short: "Burger", color: "#e8a94f", patience: 18, maxPatience: 46, price: 160, needs: recipeById("burger").needs, born: 100, alarmed: false },
      { id: 12, recipe: "salad", name: "Garden Salad", short: "Salad", color: "#7bc043", patience: 12, maxPatience: 46, price: 90, needs: recipeById("salad").needs, born: 104, alarmed: true },
      { id: 13, recipe: "soup", name: "Tomato Soup", short: "Soup", color: "#e2483a", patience: 30, maxPatience: 46, price: 120, needs: recipeById("soup").needs, born: 106, alarmed: false }
    ];
    orders.nextId = 14; orders.spawnIn = 4;
    board.item = { ing: "tomato", state: "raw" }; board.progress = 0.55;
    grill.slots[0] = { ing: "patty", t: 7.2 };
    grill.slots[1] = { ing: "patty", t: 3.1 };
    pot.tomatoes = 1;
    assembly.items = [{ ing: "bun", state: "raw" }, { ing: "patty", state: "grilled" }];
    chef.x = 880; chef.y = 340; chef.tx = 880; chef.ty = 340;
    chef.carrying = { ing: "lettuce", state: "chopped" };
  } else if (name === "board") {
    orders.elapsed = 30; orders.timeLeft = 150;
    orders.score = 420; orders.coins = 420; orders.served = 3; orders.combo = 2;
    orders.tickets = [
      { id: 4, recipe: "burger", name: "Ember Burger", short: "Burger", color: "#e8a94f", patience: 38, maxPatience: 46, price: 160, needs: recipeById("burger").needs, born: 20, alarmed: false },
      { id: 5, recipe: "salad", name: "Garden Salad", short: "Salad", color: "#7bc043", patience: 26, maxPatience: 46, price: 90, needs: recipeById("salad").needs, born: 24, alarmed: false },
      { id: 6, recipe: "soup", name: "Tomato Soup", short: "Soup", color: "#e2483a", patience: 41, maxPatience: 46, price: 120, needs: recipeById("soup").needs, born: 28, alarmed: false },
      { id: 7, recipe: "skewer", name: "Flame Skewer", short: "Skewer", color: "#c96a2e", patience: 33, maxPatience: 46, price: 140, needs: recipeById("skewer").needs, born: 29, alarmed: false }
    ];
    orders.nextId = 8; orders.spawnIn = 6;
    chef.x = 640; chef.y = 430; chef.tx = 640; chef.ty = 430;
  } else if (name === "chop") {
    orders.elapsed = 55; orders.timeLeft = 125;
    orders.score = 210; orders.coins = 210; orders.served = 2; orders.combo = 1;
    orders.tickets = [
      { id: 8, recipe: "salad", name: "Garden Salad", short: "Salad", color: "#7bc043", patience: 34, maxPatience: 46, price: 90, needs: recipeById("salad").needs, born: 50, alarmed: false },
      { id: 9, recipe: "melt", name: "Cheese Melt", short: "Melt", color: "#f6c945", patience: 40, maxPatience: 46, price: 110, needs: recipeById("melt").needs, born: 52, alarmed: false }
    ];
    orders.nextId = 10; orders.spawnIn = 8;
    board.item = { ing: "tomato", state: "raw" }; board.progress = 0.7;
    assembly.items = [{ ing: "lettuce", state: "chopped" }];
    chef.x = 910; chef.y = 330; chef.tx = 910; chef.ty = 330;
    addChopBits(910, 215, "#e2483a");
  } else if (name === "serve") {
    orders.elapsed = 85; orders.timeLeft = 95;
    orders.score = 980; orders.coins = 980; orders.served = 7; orders.combo = 4; orders.bestCombo = 4;
    orders.tickets = [
      { id: 15, recipe: "burger", name: "Ember Burger", short: "Burger", color: "#e8a94f", patience: 8, maxPatience: 46, price: 160, needs: recipeById("burger").needs, born: 78, alarmed: true },
      { id: 16, recipe: "skewer", name: "Flame Skewer", short: "Skewer", color: "#c96a2e", patience: 28, maxPatience: 46, price: 140, needs: recipeById("skewer").needs, born: 82, alarmed: false }
    ];
    orders.nextId = 17; orders.spawnIn = 5;
    chef.x = 1108; chef.y = 425; chef.tx = 1108; chef.ty = 425;
    chef.carrying = { dish: "burger" };
  }
  gameState.nearStation = nearestStationTo(chef.x, chef.y, 95);
}

/* ---- boot and main loop ---- */

// Each frame: advance game time, update the play state, then draw the scene.
function frameLoop(timestamp) {
  var now = timestamp / 1000;
  var dt = Math.min(0.05, now - (gameState.now || now));
  gameState.now = now;
  if (gameState.state === "playing") updatePlaying(dt);
  else updateParticles(dt);
  drawScene(ctx, now, dt);
  requestAnimationFrame(frameLoop);
}

function bootGame() {
  canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");
  resetGame();
  canvas.addEventListener("click", onCanvasClick);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  var params = new URLSearchParams(window.location.search);
  var scene = params.get("scene");
  if (scene) stageScene(scene);
  requestAnimationFrame(frameLoop);
  /* handle for play-testing and debugging */
  window.HearthGame = {
    state: function () { return gameState; },
    orders: function () { return orders; },
    chef: function () { return chef; },
    stations: function () { return STATIONS; },
    start: startShift,
    interact: interactAt
  };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootGame);
} else {
  bootGame();
}
