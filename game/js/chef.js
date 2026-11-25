/* chef.js — the chef: movement, carrying, and what the hands hold.
   One job: the chef's body and hands, nothing about tickets or scoring. */

var CHEF_SPEED = 265;
var CHEF_RADIUS = 20;

var chef = null;

function resetChef() {
  chef = {
    x: 640, y: 430, tx: 640, ty: 430,
    dir: 1, moving: false, walkPhase: 0,
    carrying: null,           /* { ing, state } or { dish: recipeId } or null */
    pendingStation: null,     /* station to interact with on arrival (click-to-play) */
    chopping: false
  };
  return chef;
}

function chefCarryingLabel() {
  if (!chef.carrying) return "";
  if (chef.carrying.dish) { var r = recipeById(chef.carrying.dish); return r ? r.name : "Dish"; }
  var ing = INGREDIENTS[chef.carrying.ing];
  var label = ing ? ing.name : chef.carrying.ing;
  if (chef.carrying.state === "chopped") label += " (chopped)";
  if (chef.carrying.state === "grilled") label += " (grilled)";
  if (chef.carrying.state === "soup") label = "Tomato Soup";
  if (chef.carrying.state === "burnt") label += " (burnt!)";
  return label;
}

/* Keyboard movement; click-to-move target overrides keys while it is active. */
function moveChef(dt, keys) {
  var vx = 0, vy = 0;
  if (keys.left) vx -= 1;
  if (keys.right) vx += 1;
  if (keys.up) vy -= 1;
  if (keys.down) vy += 1;
  if (vx !== 0 || vy !== 0) {
    chef.tx = chef.x; chef.ty = chef.y;
    chef.pendingStation = null;
    var len = Math.hypot(vx, vy);
    chef.x += (vx / len) * CHEF_SPEED * dt;
    chef.y += (vy / len) * CHEF_SPEED * dt;
    chef.dir = vx !== 0 ? (vx > 0 ? 1 : -1) : chef.dir;
    chef.moving = true;
  } else if (Math.hypot(chef.tx - chef.x, chef.ty - chef.y) > 4) {
    var dx = chef.tx - chef.x, dy = chef.ty - chef.y;
    var d = Math.hypot(dx, dy);
    var step = CHEF_SPEED * dt;
    if (step >= d) { chef.x = chef.tx; chef.y = chef.ty; }
    else { chef.x += (dx / d) * step; chef.y += (dy / d) * step; }
    chef.dir = dx !== 0 ? (dx > 0 ? 1 : -1) : chef.dir;
    chef.moving = true;
  } else {
    chef.moving = false;
  }
  if (chef.moving) chef.walkPhase += dt * 10;
  clampChefToFloor();
}

function clampChefToFloor() {
  chef.x = Math.max(48, Math.min(KITCHEN.w - 48, chef.x));
  chef.y = Math.max(KITCHEN.floorTop + 38, Math.min(KITCHEN.floorBottom - 14, chef.y));
  /* Keep the chef out of the top counter row and the bottom counters. */
  if (chef.y < 292 && chef.x < 1252) chef.y = 292;
  if (chef.y > 596 && chef.x > 480 && chef.x < 800) chef.y = 596;
  if (chef.y > 596 && chef.x < 130) chef.y = 596;
  if (chef.x > 1152 && chef.y > 300 && chef.y < 550) chef.x = 1152;
}

/* Walk toward a station's interact point; true once close enough to use it. */
function chefWalkToStation(station, dt) {
  chef.tx = station.ix; chef.ty = station.iy;
  moveChef(dt, { left: false, right: false, up: false, down: false });
  return Math.hypot(station.ix - chef.x, station.iy - chef.y) < 26;
}

function chefSetClickTarget(px, py) {
  chef.tx = Math.max(48, Math.min(KITCHEN.w - 48, px));
  chef.ty = Math.max(KITCHEN.floorTop + 38, Math.min(KITCHEN.floorBottom - 14, py));
  chef.pendingStation = null;
}

function chefSetStationTarget(station) {
  chef.pendingStation = station;
  chef.tx = station.ix; chef.ty = station.iy;
}
