/* render.js — every pixel of Hearth & Ember, drawn on canvas.
   One job: draw the kitchen, the chef, the tickets, the HUD and the screens. */

var PALETTE = {
  wall: "#7a4a26", wallDark: "#5d3519", floor: "#c89b6a", floorDark: "#b3854f",
  counter: "#8a5a30", counterTop: "#a9713f", cream: "#f3e5c8", ink: "#2e1d10",
  ticket: "#fff8e6", gold: "#f6c945", red: "#e2483a", green: "#7bc043"
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawIngredientIcon(ctx, ingId, state, x, y, size) {
  var ing = INGREDIENTS[ingId];
  if (!ing) return;
  var r = size / 2;
  ctx.save();
  ctx.translate(x, y);
  if (ingId === "tomato") {
    ctx.fillStyle = state === "soup" ? "#c93a2c" : ing.color;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#4d8a26";
    ctx.beginPath();
    for (var i = 0; i < 5; i++) {
      var a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      ctx.moveTo(0, -r * 0.5);
      ctx.lineTo(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55);
      ctx.lineTo(Math.cos(a + 0.5) * r * 0.3, Math.sin(a + 0.5) * r * 0.3);
    }
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.35, r * 0.22, 0, Math.PI * 2); ctx.fill();
  } else if (ingId === "lettuce") {
    ctx.fillStyle = ing.dark;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = ing.color;
    ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.2, r * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.35, r * 0.25, r * 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = ing.dark; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-r * 0.6, 0); ctx.quadraticCurveTo(0, r * 0.4, r * 0.6, -r * 0.1); ctx.stroke();
  } else if (ingId === "patty") {
    ctx.fillStyle = state === "burnt" ? "#241a12" : (state === "grilled" ? "#6b4226" : ing.color);
    roundRect(ctx, -r, -r * 0.55, r * 2, r * 1.1, r * 0.4); ctx.fill();
    ctx.strokeStyle = "#e8c39a"; ctx.lineWidth = 2;
    roundRect(ctx, -r, -r * 0.55, r * 2, r * 1.1, r * 0.4); ctx.stroke();
    ctx.fillStyle = "rgba(255,220,170,0.35)";
    roundRect(ctx, -r * 0.8, -r * 0.45, r * 1.6, r * 0.3, r * 0.15); ctx.fill();
    if (state === "grilled") {
      ctx.strokeStyle = "#3d2412"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-r * 0.5, -r * 0.4); ctx.lineTo(-r * 0.5, r * 0.4);
      ctx.moveTo(r * 0.1, -r * 0.4); ctx.lineTo(r * 0.1, r * 0.4); ctx.stroke();
    }
    if (state === "burnt") {
      ctx.strokeStyle = "#555"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-r * 0.6, -r * 0.3); ctx.lineTo(r * 0.6, r * 0.3); ctx.stroke();
    }
  } else if (ingId === "bun") {
    ctx.fillStyle = ing.dark;
    roundRect(ctx, -r, -r * 0.15, r * 2, r * 0.6, r * 0.25); ctx.fill();
    ctx.fillStyle = ing.color;
    ctx.beginPath(); ctx.arc(0, -r * 0.1, r * 0.95, Math.PI, 0); ctx.fill();
    ctx.fillStyle = "#fff3d0";
    ctx.beginPath(); ctx.arc(-r * 0.4, -r * 0.55, r * 0.12, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.3, -r * 0.7, r * 0.12, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -r * 0.85, r * 0.1, 0, Math.PI * 2); ctx.fill();
  } else if (ingId === "cheese") {
    ctx.fillStyle = ing.color;
    ctx.beginPath(); ctx.moveTo(-r * 0.9, r * 0.6); ctx.lineTo(r * 0.9, r * 0.6); ctx.lineTo(0, -r * 0.8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = ing.dark;
    ctx.beginPath(); ctx.arc(-r * 0.2, r * 0.2, r * 0.14, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.35, -r * 0.1, r * 0.11, 0, Math.PI * 2); ctx.fill();
  } else if (ingId === "onion") {
    ctx.fillStyle = ing.light;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#c9a8d8"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#7bc043";
    ctx.beginPath(); ctx.moveTo(0, -r * 0.9); ctx.lineTo(-r * 0.25, -r * 1.25); ctx.lineTo(r * 0.2, -r * 1.1); ctx.closePath(); ctx.fill();
  }
  if (state === "chopped") {
    ctx.strokeStyle = "rgba(46,29,16,0.55)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-r * 0.7, -r * 0.2); ctx.lineTo(r * 0.7, -r * 0.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r * 0.2, -r * 0.7); ctx.lineTo(-r * 0.2, r * 0.7); ctx.stroke();
  }
  if (state === "soup") {
    ctx.fillStyle = "#f3e5c8";
    ctx.beginPath(); ctx.arc(0, r * 0.35, r * 0.95, 0, Math.PI); ctx.fill();
    ctx.fillStyle = "#c93a2c";
    ctx.beginPath(); ctx.ellipse(0, r * 0.3, r * 0.85, r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawPlateIcon(ctx, x, y, size) {
  ctx.fillStyle = "#fdf6e3";
  ctx.beginPath(); ctx.ellipse(x, y, size / 2, size / 2.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#d9c49a"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(x, y, size / 2.8, size / 4, 0, 0, Math.PI * 2); ctx.stroke();
}

function drawKitchenFloor(ctx) {
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 64, 1280, 104);
  ctx.fillStyle = PALETTE.wallDark;
  ctx.fillRect(0, 160, 1280, 8);
  /* brick hint on the wall */
  ctx.strokeStyle = "rgba(0,0,0,0.18)"; ctx.lineWidth = 2;
  for (var bx = 0; bx < 1280; bx += 64) {
    ctx.beginPath(); ctx.moveTo(bx, 96); ctx.lineTo(bx, 160); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(0, 128); ctx.lineTo(1280, 128); ctx.stroke();
  /* wood-fired oven glow, left of the wall */
  var glow = ctx.createRadialGradient(40, 116, 4, 40, 116, 90);
  glow.addColorStop(0, "rgba(255,150,50,0.85)");
  glow.addColorStop(1, "rgba(255,150,50,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 64, 180, 104);
  ctx.fillStyle = PALETTE.floor;
  ctx.fillRect(0, 168, 1280, 532);
  ctx.fillStyle = PALETTE.floorDark;
  for (var fy = 200; fy < 700; fy += 64) ctx.fillRect(0, fy, 1280, 3);
  /* rug in the middle of the room */
  ctx.fillStyle = "#a34d1d";
  roundRect(ctx, 420, 380, 440, 150, 18); ctx.fill();
  ctx.fillStyle = "#c96a2e";
  roundRect(ctx, 436, 396, 408, 118, 12); ctx.fill();
}

function drawStation(ctx, s, now) {
  var hover = gameState.nearStation === s;
  ctx.save();
  /* counter body */
  ctx.fillStyle = PALETTE.counter;
  roundRect(ctx, s.x, s.y, s.w, s.h, 8); ctx.fill();
  ctx.fillStyle = PALETTE.counterTop;
  roundRect(ctx, s.x - 3, s.y - 6, s.w + 6, 16, 6); ctx.fill();
  if (hover) {
    ctx.strokeStyle = PALETTE.gold; ctx.lineWidth = 3;
    roundRect(ctx, s.x - 5, s.y - 10, s.w + 10, s.h + 14, 10); ctx.stroke();
  }
  ctx.fillStyle = PALETTE.cream;
  ctx.font = "bold 12px Georgia, serif";
  ctx.textAlign = "center";
  /* bottom-row counters label above the counter so the text never clips the canvas edge */
  var labelY = (s.kind === "assembly" || s.kind === "trash") ? s.y - 10 : s.y + s.h + 15;
  ctx.fillText(s.label, s.x + s.w / 2, labelY);

  if (s.kind === "crate") {
    drawIngredientIcon(ctx, s.ing, "raw", s.x + s.w / 2, s.y + s.h / 2 - 2, 44);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath(); ctx.arc(s.x + s.w - 16, s.y + 14, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px Georgia, serif";
    ctx.fillText("×∞", s.x + s.w - 16, s.y + 18);
  } else if (s.kind === "board") {
    ctx.fillStyle = "#e8dcc8";
    roundRect(ctx, s.x + 14, s.y + 12, s.w - 28, s.h - 24, 6); ctx.fill();
    ctx.strokeStyle = "#b3a586"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(s.x + 14, s.y + s.h / 2); ctx.lineTo(s.x + s.w - 14, s.y + s.h / 2); ctx.stroke();
    if (s.item) {
      drawIngredientIcon(ctx, s.item.ing, s.item.state, s.x + s.w / 2, s.y + s.h / 2, 40);
      if (s.progress > 0 && s.progress < 1) drawProgressRing(ctx, s.x + s.w / 2, s.y + s.h / 2, 30, s.progress);
      if (s.item.state === "chopped") {
        ctx.fillStyle = "#2e7d32"; ctx.font = "bold 11px Georgia, serif";
        ctx.fillText("CHOPPED ✓", s.x + s.w / 2, s.y + s.h - 6);
      }
    } else {
      ctx.fillStyle = "#8a7a5c"; ctx.font = "11px Georgia, serif";
      ctx.fillText("hold E to chop", s.x + s.w / 2, s.y + s.h / 2 + 4);
    }
  } else if (s.kind === "grill") {
    ctx.fillStyle = "#3a2a1a";
    roundRect(ctx, s.x + 10, s.y + 10, s.w - 20, s.h - 20, 6); ctx.fill();
    var flicker = 0.5 + 0.5 * Math.sin(now * 6 + s.x);
    ctx.fillStyle = "rgba(255," + Math.floor(110 + 60 * flicker) + ",40," + (0.35 + 0.3 * flicker) + ")";
    roundRect(ctx, s.x + 14, s.y + 14, s.w - 28, s.h - 28, 5); ctx.fill();
    for (var gi = 0; gi < 2; gi++) {
      var slot = s.slots[gi];
      var gx = s.x + 34 + gi * 62, gy = s.y + s.h / 2;
      ctx.strokeStyle = "#888"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(gx, gy, 24, 0, Math.PI * 2); ctx.stroke();
      if (slot) {
        drawIngredientIcon(ctx, slot.ing, grillSlotState(slot) === "grilled" ? "grilled" : (grillSlotState(slot) === "burnt" ? "burnt" : "raw"), gx, gy, 38);
        var frac = Math.min(1, slot.t / GRILL_DONE);
        drawProgressRing(ctx, gx, gy, 28, frac, grillSlotState(slot) === "burnt" ? "#e2483a" : "#f6c945");
        if (grillSlotState(slot) === "grilled") {
          ctx.fillStyle = "#7bc043"; ctx.font = "bold 11px Georgia, serif";
          ctx.fillText("READY", gx, gy + 34);
        } else if (grillSlotState(slot) === "burnt") {
          ctx.fillStyle = "#ff8a7a"; ctx.font = "bold 11px Georgia, serif";
          ctx.fillText("BURNT!", gx, gy + 34);
        }
      }
    }
  } else if (s.kind === "pot") {
    ctx.fillStyle = "#4a4a55";
    ctx.beginPath(); ctx.arc(s.x + s.w / 2, s.y + s.h / 2 + 6, 34, 0, Math.PI); ctx.fill();
    ctx.fillStyle = "#33333d";
    roundRect(ctx, s.x + 12, s.y + 8, s.w - 24, 22, 8); ctx.fill();
    if (s.tomatoes > 0 || s.ready) {
      ctx.fillStyle = "#c93a2c";
      ctx.beginPath(); ctx.ellipse(s.x + s.w / 2, s.y + 16, 34, 8, 0, 0, Math.PI * 2); ctx.fill();
      if (s.ready) {
        ctx.fillStyle = "#7bc043"; ctx.font = "bold 11px Georgia, serif";
        ctx.fillText("SOUP READY", s.x + s.w / 2, s.y + s.h - 4);
      } else {
        ctx.fillStyle = "#fff"; ctx.font = "bold 12px Georgia, serif";
        ctx.fillText(s.tomatoes + " / 2 tomatoes", s.x + s.w / 2, s.y + s.h - 4);
        drawProgressRing(ctx, s.x + s.w / 2, s.y + 18, 40, s.cook / POT_COOK, "#f6c945");
      }
    } else {
      ctx.fillStyle = "#cfc4ae"; ctx.font = "11px Georgia, serif";
      ctx.fillText("add 2 tomatoes", s.x + s.w / 2, s.y + s.h - 4);
    }
  } else if (s.kind === "assembly") {
    drawPlateIcon(ctx, s.x + s.w / 2, s.y + s.h / 2 + 2, 120);
    if (s.items.length > 0) {
      var startX = s.x + s.w / 2 - (s.items.length - 1) * 22;
      for (var ai = 0; ai < s.items.length; ai++) {
        drawIngredientIcon(ctx, s.items[ai].ing, s.items[ai].state, startX + ai * 44, s.y + s.h / 2 + 2, 34);
      }
    }
    if (s.dish) {
      var dr = recipeById(s.dish);
      ctx.fillStyle = "#2e7d32"; ctx.font = "bold 13px Georgia, serif";
      ctx.fillText(dr.name.toUpperCase() + " — READY TO SERVE!", s.x + s.w / 2, s.y - 26);
    } else if (s.items.length > 0) {
      ctx.fillStyle = "#8a7a5c"; ctx.font = "11px Georgia, serif";
      ctx.fillText("building… " + s.items.length + " ingredient(s) on the plate", s.x + s.w / 2, s.y - 26);
    } else {
      ctx.fillStyle = "#8a7a5c"; ctx.font = "11px Georgia, serif";
      ctx.fillText("plate — add ingredients to build a dish", s.x + s.w / 2, s.y - 26);
    }
  } else if (s.kind === "serve") {
    ctx.fillStyle = "#5d3519";
    roundRect(ctx, s.x, s.y, s.w, s.h, 8); ctx.fill();
    ctx.fillStyle = "#f3e5c8";
    ctx.font = "bold 13px Georgia, serif";
    ctx.fillText("SERVE", s.x + s.w / 2, s.y + 22);
    ctx.fillStyle = "#d9b98a";
    ctx.font = "11px Georgia, serif";
    ctx.fillText("pass dishes", s.x + s.w / 2, s.y + 38);
    ctx.fillText("here →", s.x + s.w / 2, s.y + 54);
    /* a little bell on the pass */
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath(); ctx.arc(s.x + s.w / 2, s.y + 96, 16, Math.PI, 0); ctx.fill();
    ctx.fillRect(s.x + s.w / 2 - 18, s.y + 96, 36, 4);
    ctx.beginPath(); ctx.arc(s.x + s.w / 2, s.y + 108, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#d9b98a"; ctx.font = "11px Georgia, serif";
    ctx.fillText("ring the bell!", s.x + s.w / 2, s.y + 140);
  } else if (s.kind === "trash") {
    ctx.fillStyle = "#5f7d4f";
    roundRect(ctx, s.x + 14, s.y + 10, s.w - 28, s.h - 20, 6); ctx.fill();
    ctx.fillStyle = "#3d5a33";
    ctx.beginPath(); ctx.moveTo(s.x + 10, s.y + 10); ctx.lineTo(s.x + s.w - 10, s.y + 10);
    ctx.lineTo(s.x + s.w - 18, s.y + 2); ctx.lineTo(s.x + 18, s.y + 2); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawProgressRing(ctx, x, y, r, frac, color) {
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = color || "#fff"; ctx.lineWidth = 5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); ctx.stroke();
  ctx.restore();
}

function drawChefFigure(ctx, now) {
  if (!chef) return;
  var bob = chef.moving ? Math.sin(chef.walkPhase) * 2 : 0;
  ctx.save();
  ctx.translate(chef.x, chef.y + bob);
  /* shadow */
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath(); ctx.ellipse(0, 22 - bob, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
  /* body: apron + shirt */
  ctx.fillStyle = "#e8e0d0";
  roundRect(ctx, -16, -6, 32, 28, 10); ctx.fill();
  ctx.fillStyle = "#7a4a26";
  ctx.fillRect(-16, 12, 32, 6);
  /* head */
  ctx.fillStyle = "#f2c89b";
  ctx.beginPath(); ctx.arc(0, -18, 13, 0, Math.PI * 2); ctx.fill();
  /* chef hat */
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(-7, -28, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -32, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(7, -28, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-11, -30, 22, 6);
  /* eyes look where the chef faces */
  ctx.fillStyle = "#2e1d10";
  ctx.beginPath(); ctx.arc(chef.dir * 3 - 4, -18, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(chef.dir * 3 + 4, -18, 2, 0, Math.PI * 2); ctx.fill();
  /* arms */
  ctx.strokeStyle = "#e8e0d0"; ctx.lineWidth = 6; ctx.lineCap = "round";
  var swing = chef.moving ? Math.sin(chef.walkPhase) * 5 : 0;
  ctx.beginPath(); ctx.moveTo(-14, 2); ctx.lineTo(-20, 12 + swing); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(14, 2); ctx.lineTo(20, 12 - swing); ctx.stroke();
  /* carried item held high */
  if (chef.carrying) {
    var cy = -52;
    if (chef.carrying.dish) {
      drawPlateIcon(ctx, 0, cy, 44);
      var dr = recipeById(chef.carrying.dish);
      ctx.fillStyle = "#2e1d10"; ctx.font = "bold 10px Georgia, serif"; ctx.textAlign = "center";
      ctx.fillText(dr ? dr.short : "Dish", 0, cy - 26);
    } else {
      drawIngredientIcon(ctx, chef.carrying.ing, chef.carrying.state, 0, cy, 36);
    }
    ctx.fillStyle = "rgba(46,29,16,0.85)";
    roundRect(ctx, -52, -78, 104, 16, 8); ctx.fill();
    ctx.fillStyle = "#f3e5c8"; ctx.font = "10px Georgia, serif"; ctx.textAlign = "center";
    ctx.fillText(chefCarryingLabel(), 0, -67);
  }
  ctx.restore();
}

function drawTicket(ctx, t, x, y, w, h, now) {
  var frac = Math.max(0, t.patience / t.maxPatience);
  var urgent = t.patience <= 10;
  ctx.save();
  ctx.fillStyle = urgent && Math.floor(now * 4) % 2 === 0 ? "#ffe3de" : PALETTE.ticket;
  roundRect(ctx, x, y, w, h, 10); ctx.fill();
  ctx.strokeStyle = t.color; ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 10); ctx.stroke();
  ctx.fillStyle = PALETTE.ink;
  ctx.font = "bold 15px Georgia, serif"; ctx.textAlign = "left";
  ctx.fillText("#" + t.id + "  " + t.name, x + 10, y + 22);
  ctx.fillStyle = "#8a7a5c"; ctx.font = "12px Georgia, serif";
  ctx.fillText("$" + t.price, x + w - 52, y + 22);
  /* ingredient icons the ticket needs */
  var ix = x + 12;
  for (var i = 0; i < t.needs.length; i++) {
    drawIngredientIcon(ctx, t.needs[i].ing, t.needs[i].state, ix + 14, y + 44, 26);
    ix += 30;
  }
  /* patience bar */
  ctx.fillStyle = "#e0d3b8";
  roundRect(ctx, x + 10, y + h - 16, w - 20, 9, 4); ctx.fill();
  ctx.fillStyle = frac > 0.5 ? "#7bc043" : (frac > 0.25 ? "#f6c945" : "#e2483a");
  if (frac > 0) { roundRect(ctx, x + 10, y + h - 16, (w - 20) * frac, 9, 4); ctx.fill(); }
  if (urgent) {
    ctx.fillStyle = "#e2483a"; ctx.font = "bold 12px Georgia, serif"; ctx.textAlign = "right";
    ctx.fillText("HURRY! " + Math.ceil(t.patience) + "s", x + w - 10, y + h - 24);
    ctx.textAlign = "left";
  }
  ctx.restore();
}

function drawOrderBoard(ctx, now) {
  ctx.fillStyle = "rgba(46,29,16,0.55)";
  roundRect(ctx, 12, 70, 1256, 92, 10); ctx.fill();
  ctx.fillStyle = PALETTE.cream;
  ctx.font = "bold 13px Georgia, serif"; ctx.textAlign = "left";
  ctx.fillText("ORDER BOARD", 24, 90);
  ctx.fillStyle = "#d9b98a"; ctx.font = "12px Georgia, serif";
  ctx.fillText(orders.tickets.length === 0 ? "no orders yet — the lunch crowd is coming…" : "serve the oldest ticket first for the best tip", 24, 150);
  var x = 170;
  for (var i = 0; i < orders.tickets.length; i++) {
    drawTicket(ctx, orders.tickets[i], x, 76, 258, 80, now);
    x += 268;
  }
  if (orders.tickets.length === 0) {
    ctx.fillStyle = "rgba(243,229,200,0.5)"; ctx.font = "italic 14px Georgia, serif";
    ctx.fillText("Tickets will appear here — each one shows its dish, its ingredients and its patience.", 170, 118);
  }
}

function drawHud(ctx, now) {
  ctx.fillStyle = "#2e1d10";
  ctx.fillRect(0, 0, 1280, 64);
  ctx.fillStyle = "#6b4423";
  ctx.fillRect(0, 60, 1280, 4);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = "bold 22px Georgia, serif"; ctx.textAlign = "left";
  ctx.fillText("🔥 Hearth & Ember", 18, 40);
  ctx.fillStyle = "#d9b98a"; ctx.font = "13px Georgia, serif";
  ctx.fillText("Woodfired Kitchen", 18, 56);
  /* day timer — big, central, felt */
  var t = Math.max(0, Math.ceil(orders.timeLeft));
  var mm = Math.floor(t / 60), ss = t % 60;
  var timerText = mm + ":" + (ss < 10 ? "0" : "") + ss;
  var rush = rushIsOn();
  ctx.textAlign = "center";
  if (rush) {
    ctx.fillStyle = Math.floor(now * 3) % 2 === 0 ? "#ff6a55" : "#f6c945";
    ctx.font = "bold 34px Georgia, serif";
    ctx.fillText("⏱ " + timerText + "  RUSH!", 640, 42);
  } else {
    ctx.fillStyle = "#f3e5c8";
    ctx.font = "bold 30px Georgia, serif";
    ctx.fillText("⏱ " + timerText, 640, 42);
  }
  /* day progress bar under the timer */
  ctx.fillStyle = "#4a2f1d";
  roundRect(ctx, 520, 50, 240, 7, 3); ctx.fill();
  ctx.fillStyle = rush ? "#ff6a55" : "#7bc043";
  roundRect(ctx, 520, 50, 240 * (orders.timeLeft / DAY_LENGTH), 7, 3); ctx.fill();
  /* score block */
  ctx.textAlign = "right";
  ctx.fillStyle = PALETTE.cream; ctx.font = "bold 20px Georgia, serif";
  ctx.fillText("Score " + orders.score, 1262, 30);
  ctx.fillStyle = PALETTE.gold; ctx.font = "bold 15px Georgia, serif";
  ctx.fillText("🪙 " + orders.coins + " coins   •   🍽 " + orders.served + " served", 1262, 52);
  if (orders.combo >= 2) {
    ctx.fillStyle = "#ff9a3d"; ctx.font = "bold 16px Georgia, serif"; ctx.textAlign = "center";
    ctx.fillText("COMBO ×" + orders.combo, 1060, 30);
  }
}

function drawParticles(ctx, dt) {
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife) + 1, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawPopups(ctx) {
  ctx.textAlign = "center";
  for (var i = 0; i < popups.length; i++) {
    var p = popups[i];
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.font = "bold " + p.size + "px Georgia, serif";
    ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.lineWidth = 3;
    ctx.strokeText(p.text, p.x, p.y);
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.globalAlpha = 1;
}

function drawContextHint(ctx) {
  if (gameState.state !== "playing" || !gameState.nearStation) return;
  var s = gameState.nearStation;
  var hint = stationHint(s);
  if (!hint) return;
  ctx.save();
  ctx.font = "bold 14px Georgia, serif";
  var w = ctx.measureText(hint).width + 24;
  var x = Math.max(10, Math.min(1280 - w - 10, s.ix - w / 2));
  var y = s.iy + 34;
  ctx.fillStyle = "rgba(46,29,16,0.9)";
  roundRect(ctx, x, y, w, 26, 8); ctx.fill();
  ctx.fillStyle = "#f3e5c8"; ctx.textAlign = "center";
  ctx.fillText(hint, x + w / 2, y + 18);
  ctx.restore();
}

/* The one-line prompt for the station the chef stands at. */
function stationHint(s) {
  if (s.kind === "crate") return chef.carrying ? "Hands full — serve or bin it first" : "E / click: grab a " + INGREDIENTS[s.ing].name;
  if (s.kind === "board") {
    if (s.item && s.item.state !== "chopped") return "HOLD E to chop the " + INGREDIENTS[s.item.ing].name;
    if (s.item) return "E: pick up chopped " + INGREDIENTS[s.item.ing].name;
    if (chef.carrying && INGREDIENTS[chef.carrying.ing] && INGREDIENTS[chef.carrying.ing].chop && chef.carrying.state === "raw") return "E: put it on the board to chop";
    return "Bring something choppable here";
  }
  if (s.kind === "grill") {
    if (chef.carrying && chef.carrying.ing === "patty" && chef.carrying.state === "raw") return "E: grill the patty (6s — don't burn it!)";
    for (var i = 0; i < 2; i++) if (s.slots[i] && grillSlotState(s.slots[i]) !== "cooking") return "E: take the patty off the grill";
    return "Grill — patties take 6s";
  }
  if (s.kind === "pot") {
    if (s.ready) return "E: ladle the Tomato Soup";
    if (chef.carrying && chef.carrying.ing === "tomato") return "E: add tomato to the pot (" + s.tomatoes + "/2)";
    return "Soup Pot — needs 2 tomatoes";
  }
  if (s.kind === "assembly") {
    if (s.dish && !chef.carrying) return "E: pick up the " + recipeById(s.dish).name + "!";
    if (chef.carrying && !chef.carrying.dish) return "E: add it to the plate";
    if (s.items.length > 0 && !chef.carrying) return "E: take the last ingredient back";
    return "Assembly Counter — build dishes on the plate";
  }
  if (s.kind === "serve") return chef.carrying && chef.carrying.dish ? "E: SERVE the " + recipeById(chef.carrying.dish).name + "!" : "Bring a finished dish here";
  if (s.kind === "trash") return chef.carrying ? "E: throw it in the compost" : "Compost Bin";
  return "";
}

function drawStartScreen(ctx) {
  ctx.fillStyle = "rgba(36,26,18,0.82)";
  ctx.fillRect(0, 0, 1280, 720);
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.gold;
  ctx.font = "bold 58px Georgia, serif";
  ctx.fillText("🔥 Hearth & Ember 🔥", 640, 150);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = "italic 26px Georgia, serif";
  ctx.fillText("A wood-fired kitchen. One chef. A very hungry lunch crowd.", 640, 195);
  ctx.fillStyle = "#d9b98a";
  ctx.font = "18px Georgia, serif";
  var lines = [
    "1.  Grab ingredients from the crates along the top wall.",
    "2.  Chop on the board (hold E), grill patties on the ember grill, simmer soup in the pot.",
    "3.  Build each dish on the plate at the Assembly Counter — match the ticket exactly.",
    "4.  Carry the finished dish to the Serving Pass before the ticket's patience runs out.",
    "Fast service earns tips. Streaks build combos. The last minute is a RUSH."
  ];
  for (var i = 0; i < lines.length; i++) ctx.fillText(lines[i], 640, 250 + i * 32);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = "bold 17px Georgia, serif";
  ctx.fillText("WASD / arrows to move  •  E or Space to use a station  •  click a station to walk there  •  P pause  •  M mute", 640, 450);
  ctx.fillStyle = "#7bc043";
  ctx.font = "bold 15px Georgia, serif";
  var menu = "MENU — Garden Salad $90 · Tomato Soup $120 · Flame Skewer $140 · Cheese Melt $110 · Ember Burger $160 · Ember Stack $190";
  ctx.fillText(menu, 640, 486);
  var pulse = 0.6 + 0.4 * Math.sin(Date.now() / 350);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = PALETTE.gold;
  ctx.font = "bold 30px Georgia, serif";
  ctx.fillText("— PRESS ENTER OR CLICK TO START YOUR SHIFT —", 640, 560);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#d9b98a"; ctx.font = "14px Georgia, serif";
  ctx.fillText("3-minute service day  •  keyboard and mouse  •  sounds are synthesized, no downloads", 640, 600);
}

function drawPauseScreen(ctx) {
  ctx.fillStyle = "rgba(36,26,18,0.7)";
  ctx.fillRect(0, 0, 1280, 720);
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.cream;
  ctx.font = "bold 48px Georgia, serif";
  ctx.fillText("PAUSED", 640, 340);
  ctx.font = "20px Georgia, serif";
  ctx.fillText("Press P or click to get back to the pass.", 640, 385);
}

function drawGameOverScreen(ctx) {
  ctx.fillStyle = "rgba(36,26,18,0.88)";
  ctx.fillRect(0, 0, 1280, 720);
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.gold;
  ctx.font = "bold 52px Georgia, serif";
  ctx.fillText("Service Over!", 640, 170);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = "bold 34px Georgia, serif";
  ctx.fillText("Final Score: " + orders.score + "    •    Coins earned: " + orders.coins, 640, 240);
  ctx.font = "22px Georgia, serif";
  ctx.fillText("Dishes served: " + orders.served + "    •    Tickets lost: " + orders.lost + "    •    Best combo: ×" + orders.bestCombo, 640, 290);
  var verdict = orders.served >= 12 ? "The crowd chants your name. You are the Ember Master! 👑"
    : orders.served >= 7 ? "A fine shift — the regulars will be back tomorrow."
    : orders.served >= 3 ? "A shaky first service. The grill forgives; the tickets don't."
    : "The lunch crowd left hungry… tomorrow, sharpen the knives.";
  ctx.fillStyle = "#d9b98a";
  ctx.font = "italic 22px Georgia, serif";
  ctx.fillText(verdict, 640, 340);
  var pulse = 0.6 + 0.4 * Math.sin(Date.now() / 350);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = PALETTE.gold;
  ctx.font = "bold 26px Georgia, serif";
  ctx.fillText("— PRESS R OR CLICK TO COOK AGAIN —", 640, 430);
  ctx.globalAlpha = 1;
}

/* The whole scene, in draw order. */
function drawScene(ctx, now, dt) {
  drawKitchenFloor(ctx);
  for (var i = 0; i < STATIONS.length; i++) drawStation(ctx, STATIONS[i], now);
  drawChefFigure(ctx, now);
  drawParticles(ctx, dt);
  drawOrderBoard(ctx, now);
  drawHud(ctx, now);
  drawPopups(ctx);
  drawContextHint(ctx);
  if (gameState.state === "menu") drawStartScreen(ctx);
  else if (gameState.state === "paused") drawPauseScreen(ctx);
  else if (gameState.state === "over") drawGameOverScreen(ctx);
}
