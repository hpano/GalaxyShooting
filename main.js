"use strict";
var stars = [], keymap = [], cracks = [];
var ctx, ship, score = 0, speed = 25, timer = 0, timer_s = NaN;

class Ship {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.hp = 3;

    this.keydown = function (e) {
      keymap[e.keyCode] = true;
    };

    this.keyup = function (e) {
      keymap[e.keyCode] = false;
    };

    this.move = function () {
      if (keymap[37]) {  // left
        this.x -= 30;
      }
      if (keymap[39]) {  // right
        this.x += 30;
      }
      if (keymap[38]) {  // up
        this.y -= 30;
      }
      if (keymap[40]) {  // down
        this.y += 30;
      }

      if (this.x > 800) this.x -= 1600;
      else if (this.x < -800) this.x += 1600;
      // this.x = Math.max(-800, Math.min(800, this.x));
      if (this.y > 800) this.y -= 1600;
      else if (this.y < -800) this.y += 1600;
      // this.y = Math.max(-800, Math.min(800, this.y));
    };
  }
}

function random(v) {
  return Math.floor(Math.random() * v);
}

function init() {
  for (var i = 0; i < 200; ++i) {
    stars.push({
      x: random(800 * 4) - 1600,
      y: random(800 * 4) - 1600,
      z: random(4095),
      r: random(360),
      w: random(10) - 5
    });
  }

  ship = new Ship(200, 200);
  onkeydown = ship.keydown;
  onkeyup = ship.keyup;

  var space = document.getElementById("space");
  ctx = space.getContext("2d");
  ctx.font = "20pt Arial";
  repaint();
  timer_s = setInterval(start, 50);
}

function start() {
  if (keymap[83]) {
    go();
    clearInterval(timer_s);
    timer_s = NaN;
  }
}

function go() {
  var space = document.getElementById("space");
  space.onmousedown = mymousedown;
  space.onmouseup = mymouseup;
  space.oncontextmenu = function (e) { e.preventDefault(); };
  space.addEventListener('touchstart', mymousedown);
  space.addEventListener('touchend', mymouseup);   
              
  document.body.addEventListener('touchmove', function (event) {
    event.preventDefault();
  }, false);
  document.getElementById("START").style.display = "none";
  // document.getElementById("bgm").play();
  timer = setInterval(tick, 50);
}

function mymousedown(e) {                   
  var mouseX = (!isNaN(e.offsetX) ? e.offsetX : e.touches[0].clientX) - 400;
  var mouseY = (!isNaN(e.offsetY) ? e.offsetY : e.touches[0].clientY) - 400;
  if (Math.abs(mouseX) > Math.abs(mouseY)) {
    keymap[mouseX > 0 ? 37 : 39] = true;
  } else {
    keymap[mouseY > 0 ? 38 : 40] = true;
  }        
}

function mymouseup(e) {
  keymap = [];         
}

function tick() {
  for (var i = 0 ; i < 200 ; i++) {
    var star = stars[i];
    star.z -= speed;
    star.r += star.w;
    if (star.z < 64) {
      if (Math.abs(star.x - ship.x) < 50 &&
        Math.abs(star.y - ship.y) < 50) {
        ship.hp -= 1;
        cracks.push({
          x: star.x - ship.x,
          y: star.y - ship.y,
          r: random(360)
        });
        console.log(cracks.length);
        // 衝突→ゲームオーバー
        if (ship.hp == 0) {
          clearInterval(timer);
          timer = NaN;
          // document.getElementById("bgm").pause();
          break;
        }
      }
      // 通過→奥へ再配置
      star.x = random(800 * 4) - 1600;
      star.y = random(800 * 4) - 1600;
      star.z = 4095;
    }
  }
  if (score++ % 10 == 0) {
    speed ++;
  }
  ship.move();
  repaint();
}

function repaint() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 800, 800);
  stars.sort(function (a, b) {
    return b.z - a.z;
  });

  // 隕石の描画
  for (var i = 0 ; i < 200 ; i++) {
    var star = stars[i];
    var z = star.z;
    var x = ((star.x - ship.x) << 9) / z + 400;
    var y = ((star.y - ship.y) << 9) / z + 400;
    var size = (50 << 9) / z;
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = 1- (z / 4096);
    ctx.rotate(star.r * Math.PI / 180);
    ctx.drawImage(rockImg, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  // ヒビ
  for (var i = 0; i < cracks.length; ++i) {
    var crack = cracks[i];
    var size = 300;
    ctx.save();
    ctx.translate(400 + crack.x * 6, 400 + crack.y * 6);
    ctx.rotate(crack.r * Math.PI / 180);
    ctx.drawImage(crackImg, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  // ハート
  ctx.drawImage(scope, 0, 0, 800, 800);
  for (var i = 0; i < 3; ++i) {
    ctx.drawImage(heart2, 10 + (i * 36), 10, 32, 32);
  }
  for (var i = 0; i < ship.hp; ++i) {
    ctx.drawImage(heart1, 10 + (i * 36), 10, 32, 32);
  }
  // スコア
  ctx.fillStyle = "green";
  ctx.fillText(('0000000' + score).slice(-7), 670, 40);
  if (isNaN(timer)) {
    ctx.fillText("GAME OVER", 320, 350);
  }
}