/* kitchen.js — the wood-fired kitchen itself: counters, stations and world layout.
   One job: where everything in the kitchen is, and what each station holds. */

var KITCHEN = { w: 1280, h: 720, floorTop: 168, floorBottom: 700 };

/* Stations sit along the walls so the chef plans a route through the room.
   kind: crate | board | grill | pot | assembly | serve | trash
   Each station has an interact point (ix, iy) the chef walks to. */
var STATIONS = [];

function buildKitchenStations() {
  STATIONS = [];
  var crateX = [70, 200, 330, 460, 590, 720];
  for (var i = 0; i < INGREDIENT_ORDER.length; i++) {
    var ing = INGREDIENT_ORDER[i];
    STATIONS.push({
      id: "crate-" + ing, kind: "crate", ing: ing,
      x: crateX[i] - 55, y: 178, w: 110, h: 74,
      ix: crateX[i], iy: 292, label: INGREDIENTS[ing].name
    });
  }
  STATIONS.push({ id: "board", kind: "board", x: 850, y: 178, w: 120, h: 74, ix: 910, iy: 292, label: "Chopping Board", item: null, progress: 0 });
  STATIONS.push({ id: "grill", kind: "grill", x: 990, y: 178, w: 130, h: 74, ix: 1055, iy: 292, label: "Ember Grill", slots: [null, null] });
  STATIONS.push({ id: "pot", kind: "pot", x: 1140, y: 178, w: 110, h: 74, ix: 1195, iy: 292, label: "Soup Pot", tomatoes: 0, cook: 0, ready: false });
  STATIONS.push({ id: "assembly", kind: "assembly", x: 520, y: 616, w: 240, h: 74, ix: 640, iy: 596, label: "Assembly Counter", items: [], dish: null });
  STATIONS.push({ id: "serve", kind: "serve", x: 1180, y: 330, w: 84, h: 190, ix: 1152, iy: 425, label: "Serving Pass" });
  STATIONS.push({ id: "trash", kind: "trash", x: 16, y: 616, w: 84, h: 74, ix: 108, iy: 596, label: "Compost Bin" });
  return STATIONS;
}

function stationById(id) {
  for (var i = 0; i < STATIONS.length; i++) if (STATIONS[i].id === id) return STATIONS[i];
  return null;
}

function stationAtPoint(px, py) {
  for (var i = STATIONS.length - 1; i >= 0; i--) {
    var s = STATIONS[i];
    if (px >= s.x && px <= s.x + s.w && py >= s.y && py <= s.y + s.h) return s;
  }
  return null;
}

/* Nearest station whose interact point the chef can reach from (x, y). */
function nearestStationTo(x, y, maxDist) {
  var best = null, bestD = maxDist;
  for (var i = 0; i < STATIONS.length; i++) {
    var s = STATIONS[i];
    var d = Math.hypot(s.ix - x, s.iy - y);
    if (d < bestD) { bestD = d; best = s; }
  }
  return best;
}

/* Grill timing: a patty grills in 6s, stays perfect until 10s, then burns. */
var GRILL_DONE = 6, GRILL_BURN = 10, POT_COOK = 5, CHOP_TIME = 1.6;

function grillSlotState(slot) {
  if (!slot) return "empty";
  if (slot.t >= GRILL_BURN) return "burnt";
  if (slot.t >= GRILL_DONE) return "grilled";
  return "cooking";
}

function resetKitchen() {
  buildKitchenStations();
}
