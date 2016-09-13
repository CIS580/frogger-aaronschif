(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _game = require("./game.js");

var _player = require("./player.js");

var canvas = document.getElementById('screen');
var game = new _game.Game(canvas, update, render);
var player = new _player.Player({ x: 0, y: 240 });

var masterLoop = function masterLoop(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
};
masterLoop(performance.now());

function update(elapsedTime) {
  player.update(elapsedTime);
  // TODO: Update the game objects
}

function render(elapsedTime, ctx) {
  ctx.fillStyle = "lightblue";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.render(elapsedTime, ctx);
}

},{"./game.js":2,"./player.js":3}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Game = Game;
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

Game.prototype.pause = function (flag) {
  this.paused = flag == true;
};

Game.prototype.loop = function (newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if (!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
};

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Player = Player;
var MS_PER_FRAME = 1000 / 8;

var STATES = {
  idle: Symbol(),
  walking: Symbol(),
  blinking: Symbol(),
  jumping: Symbol()
};

function Player(position) {
  this.state = STATES.jumping;
  this.x = position.x;
  this.y = position.y;
  this.width = 64;
  this.height = 64;
  this.spritesheet = new Image();
  this.spritesheet.src = encodeURI('assets/PlayerSprite2.png');
  this.timer = 0;
  this.frame = 0;
  this.sittingSprites = [{ x: 64 * 3, y: 64 }, { x: 64 * 0, y: 64 }, { x: 64 * 1, y: 64 }, { x: 64 * 2, y: 64 }, { x: 64 * 1, y: 64 }, { x: 64 * 0, y: 64 }];
  this.jumpingSprites = [{ x: 64 * 3, y: 0 }, { x: 64 * 2, y: 0 }, { x: 64 * 1, y: 0 }, { x: 64 * 0, y: 0 }, { x: 64 * 1, y: 0 }, { x: 64 * 2, y: 0 }, { x: 64 * 3, y: 0 }];
}

Player.prototype.update = function (time) {
  this.timer += time;
  var newFrame = false;
  if (this.timer > MS_PER_FRAME) {
    this.timer = 0;
    this.frame++;
    newFrame = true;
  }
  switch (this.state) {
    case STATES.idle:
      break;
    case STATES.jumping:
      {
        if (newFrame) this.x += this.width / this.jumpingSprites.length;
      }
    // TODO: Implement your player's update by state
  }
};

Player.prototype.render = function (time, ctx) {
  switch (this.state) {
    case STATES.jumping:
      {
        var _frame = this.frame % this.jumpingSprites.length;
        var _jumpingSprites$_fram = this.jumpingSprites[_frame];
        var _x = _jumpingSprites$_fram.x;
        var _y = _jumpingSprites$_fram.y;

        ctx.drawImage(this.spritesheet, _x, _y, this.width, this.height, this.x, this.y, this.width, this.height);
        if (this.frame === this.jumpingSprites.length) {
          this.frame = 0;
          this.state = STATES.idle;
        }
        break;
      }

    case STATES.idle:
      // handle blinking
      var frame = Math.min(this.frame % (this.sittingSprites.length + 20), this.sittingSprites.length);
      frame = frame % this.sittingSprites.length;
      var _sittingSprites$frame = this.sittingSprites[frame];
      var x = _sittingSprites$frame.x;
      var y = _sittingSprites$frame.y;

      ctx.drawImage(
      // image
      this.spritesheet,
      // source rectangle
      x, y, this.width, this.height,
      // destination rectangle
      this.x, this.y, this.width, this.height);
      break;
    // TODO: Implement your player's redering according to state
  }
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2dhbWUuanMiLCJzcmMvcGxheWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O0FBRUE7O0FBQ0E7O0FBRUEsSUFBSSxTQUFTLFNBQVMsY0FBVCxDQUF3QixRQUF4QixDQUFiO0FBQ0EsSUFBSSxPQUFPLGVBQVMsTUFBVCxFQUFpQixNQUFqQixFQUF5QixNQUF6QixDQUFYO0FBQ0EsSUFBSSxTQUFTLG1CQUFXLEVBQUMsR0FBRyxDQUFKLEVBQU8sR0FBRyxHQUFWLEVBQVgsQ0FBYjs7QUFFQSxJQUFJLGFBQWEsU0FBYixVQUFhLENBQVMsU0FBVCxFQUFvQjtBQUNuQyxPQUFLLElBQUwsQ0FBVSxTQUFWO0FBQ0EsU0FBTyxxQkFBUCxDQUE2QixVQUE3QjtBQUNELENBSEQ7QUFJQSxXQUFXLFlBQVksR0FBWixFQUFYOztBQUVBLFNBQVMsTUFBVCxDQUFnQixXQUFoQixFQUE2QjtBQUMzQixTQUFPLE1BQVAsQ0FBYyxXQUFkO0FBQ0E7QUFDRDs7QUFFRCxTQUFTLE1BQVQsQ0FBZ0IsV0FBaEIsRUFBNkIsR0FBN0IsRUFBa0M7QUFDaEMsTUFBSSxTQUFKLEdBQWdCLFdBQWhCO0FBQ0EsTUFBSSxRQUFKLENBQWEsQ0FBYixFQUFnQixDQUFoQixFQUFtQixPQUFPLEtBQTFCLEVBQWlDLE9BQU8sTUFBeEM7QUFDQSxTQUFPLE1BQVAsQ0FBYyxXQUFkLEVBQTJCLEdBQTNCO0FBQ0Q7OztBQ3hCRDs7Ozs7UUFHZ0IsSSxHQUFBLEk7QUFBVCxTQUFTLElBQVQsQ0FBYyxNQUFkLEVBQXNCLGNBQXRCLEVBQXNDLGNBQXRDLEVBQXNEO0FBQzNELE9BQUssTUFBTCxHQUFjLGNBQWQ7QUFDQSxPQUFLLE1BQUwsR0FBYyxjQUFkOztBQUVBO0FBQ0EsT0FBSyxXQUFMLEdBQW1CLE1BQW5CO0FBQ0EsT0FBSyxRQUFMLEdBQWdCLE9BQU8sVUFBUCxDQUFr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RTtBQUNBLFVBQUksUUFBUSxLQUFLLEdBQUwsQ0FBUyxLQUFLLEtBQUwsSUFBYyxLQUFLLGNBQUwsQ0FBb0IsTUFBcEIsR0FBNkIsRUFBM0MsQ0FBVCxFQUF5RCxLQUFLLGNBQUwsQ0FBb0IsTUFBN0UsQ0FBWjtBQUNBLGNBQVEsUUFBUSxLQUFLLGNBQUwsQ0FBb0IsTUFBcEM7QUFIRixrQ0FJZSxLQUFLLGNBQUwsQ0FBb0IsS0FBcEIsQ0FKZjtBQUFBLFVBSU8sQ0FKUCx5QkFJTyxDQUpQO0FBQUEsVUFJVSxDQUpWLHlCQUlVLENBSlY7O0FBS0UsVUFBSSxTQUFKO0FBQ0U7QUFDQSxXQUFLLFdBRlA7QUFHRTtBQUNBLE9BSkYsRUFJSyxDQUpMLEVBSVEsS0FBSyxLQUpiLEVBSW9CLEtBQUssTUFKekI7QUFLRTtBQUNBLFdBQUssQ0FOUCxFQU1VLEtBQUssQ0FOZixFQU1rQixLQUFLLEtBTnZCLEVBTThCLEtBQUssTUFObkM7QUFRQTtBQUNGO0FBOUJGO0FBZ0NELENBakNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQge0dhbWV9IGZyb20gXCIuL2dhbWUuanNcIjtcbmltcG9ydCB7UGxheWVyfSBmcm9tIFwiLi9wbGF5ZXIuanNcIjtcblxudmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY3JlZW4nKTtcbnZhciBnYW1lID0gbmV3IEdhbWUoY2FudmFzLCB1cGRhdGUsIHJlbmRlcik7XG52YXIgcGxheWVyID0gbmV3IFBsYXllcih7eDogMCwgeTogMjQwfSlcblxudmFyIG1hc3Rlckxvb3AgPSBmdW5jdGlvbih0aW1lc3RhbXApIHtcbiAgZ2FtZS5sb29wKHRpbWVzdGFtcCk7XG4gIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobWFzdGVyTG9vcCk7XG59XG5tYXN0ZXJMb29wKHBlcmZvcm1hbmNlLm5vdygpKTtcblxuZnVuY3Rpb24gdXBkYXRlKGVsYXBzZWRUaW1lKSB7XG4gIHBsYXllci51cGRhdGUoZWxhcHNlZFRpbWUpO1xuICAvLyBUT0RPOiBVcGRhdGUgdGhlIGdhbWUgb2JqZWN0c1xufVxuXG5mdW5jdGlvbiByZW5kZXIoZWxhcHNlZFRpbWUsIGN0eCkge1xuICBjdHguZmlsbFN0eWxlID0gXCJsaWdodGJsdWVcIjtcbiAgY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gIHBsYXllci5yZW5kZXIoZWxhcHNlZFRpbWUsIGN0eCk7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuXG5leHBvcnQgZnVuY3Rpb24gR2FtZShzY3JlZW4sIHVwZGF0ZUZ1bmN0aW9uLCByZW5kZXJGdW5jdGlvbikge1xuICB0aGlzLnVwZGF0ZSA9IHVwZGF0ZUZ1bmN0aW9uO1xuICB0aGlzLnJlbmRlciA9IHJlbmRlckZ1bmN0aW9uO1xuXG4gIC8vIFNldCB1cCBidWZmZXJzXG4gIHRoaXMuZnJvbnRCdWZmZXIgPSBzY3JlZW47XG4gIHRoaXMuZnJvbnRDdHggPSBzY3JlZW4uZ2V0Q29udGV4dCgnMmQnKTtcbiAgdGhpcy5iYWNrQnVmZmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIHRoaXMuYmFja0J1ZmZlci53aWR0aCA9IHNjcmVlbi53aWR0aDtcbiAgdGhpcy5iYWNrQnVmZmVyLmhlaWdodCA9IHNjcmVlbi5oZWlnaHQ7XG4gIHRoaXMuYmFja0N0eCA9IHRoaXMuYmFja0J1ZmZlci5nZXRDb250ZXh0KCcyZCcpO1xuXG4gIC8vIFN0YXJ0IHRoZSBnYW1lIGxvb3BcbiAgdGhpcy5vbGRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gIHRoaXMucGF1c2VkID0gZmFsc2U7XG59XG5cbkdhbWUucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24oZmxhZykge1xuICB0aGlzLnBhdXNlZCA9IChmbGFnID09IHRydWUpO1xufVxuXG5HYW1lLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24obmV3VGltZSkge1xuICB2YXIgZ2FtZSA9IHRoaXM7XG4gIHZhciBlbGFwc2VkVGltZSA9IG5ld1RpbWUgLSB0aGlzLm9sZFRpbWU7XG4gIHRoaXMub2xkVGltZSA9IG5ld1RpbWU7XG5cbiAgaWYoIXRoaXMucGF1c2VkKSB0aGlzLnVwZGF0ZShlbGFwc2VkVGltZSk7XG4gIHRoaXMucmVuZGVyKGVsYXBzZWRUaW1lLCB0aGlzLmZyb250Q3R4KTtcblxuICAvLyBGbGlwIHRoZSBiYWNrIGJ1ZmZlclxuICB0aGlzLmZyb250Q3R4LmRyYXdJbWFnZSh0aGlzLmJhY2tCdWZmZXIsIDAsIDApO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IE1TX1BFUl9GUkFNRSA9IDEwMDAvODtcblxuY29uc3QgU1RBVEVTID0ge1xuICAgIGlkbGU6IFN5bWJvbCgpLFxuICAgIHdhbGtpbmc6IFN5bWJvbCgpLFxuICAgIGJsaW5raW5nOiBTeW1ib2woKSxcbiAgICBqdW1waW5nOiBTeW1ib2woKSxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFBsYXllcihwb3NpdGlvbikge1xuICB0aGlzLnN0YXRlID0gU1RBVEVTLmp1bXBpbmc7XG4gIHRoaXMueCA9IHBvc2l0aW9uLng7XG4gIHRoaXMueSA9IHBvc2l0aW9uLnk7XG4gIHRoaXMud2lkdGggID0gNjQ7XG4gIHRoaXMuaGVpZ2h0ID0gNjQ7XG4gIHRoaXMuc3ByaXRlc2hlZXQgID0gbmV3IEltYWdlKCk7XG4gIHRoaXMuc3ByaXRlc2hlZXQuc3JjID0gZW5jb2RlVVJJKCdhc3NldHMvUGxheWVyU3ByaXRlMi5wbmcnKTtcbiAgdGhpcy50aW1lciA9IDA7XG4gIHRoaXMuZnJhbWUgPSAwO1xuICB0aGlzLnNpdHRpbmdTcHJpdGVzID0gW3t4OiA2NCozLCB5OiA2NH0sIHt4OiA2NCowLCB5OiA2NH0sIHt4OiA2NCoxLCB5OiA2NH0sIHt4OiA2NCoyLCB5OiA2NH0sIHt4OiA2NCoxLCB5OiA2NH0sIHt4OiA2NCowLCB5OiA2NH1dO1xuICB0aGlzLmp1bXBpbmdTcHJpdGVzID0gW3t4OiA2NCozLCB5OiAwfSwge3g6IDY0KjIsIHk6IDB9LCB7eDogNjQqMSwgeTogMH0sIHt4OiA2NCowLCB5OiAwfSwge3g6IDY0KjEsIHk6IDB9LCB7eDogNjQqMiwgeTogMH0sIHt4OiA2NCozLCB5OiAwfV07XG59XG5cblBsYXllci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24odGltZSkge1xuICB0aGlzLnRpbWVyICs9IHRpbWU7XG4gIGxldCBuZXdGcmFtZSA9IGZhbHNlO1xuICBpZih0aGlzLnRpbWVyID4gTVNfUEVSX0ZSQU1FKSB7XG4gICAgdGhpcy50aW1lciA9IDA7XG4gICAgdGhpcy5mcmFtZSsrO1xuICAgIG5ld0ZyYW1lID0gdHJ1ZTtcbiAgfVxuICBzd2l0Y2godGhpcy5zdGF0ZSkge1xuICAgIGNhc2UgU1RBVEVTLmlkbGU6XG4gICAgICBicmVhaztcbiAgICBjYXNlIFNUQVRFUy5qdW1waW5nOiB7XG4gICAgICAgIGlmIChuZXdGcmFtZSlcbiAgICAgICAgICB0aGlzLnggKz0gdGhpcy53aWR0aCAvIHRoaXMuanVtcGluZ1Nwcml0ZXMubGVuZ3RoO1xuICAgIH1cbiAgICAvLyBUT0RPOiBJbXBsZW1lbnQgeW91ciBwbGF5ZXIncyB1cGRhdGUgYnkgc3RhdGVcbiAgfVxufVxuXG5QbGF5ZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHRpbWUsIGN0eCkge1xuICBzd2l0Y2godGhpcy5zdGF0ZSkge1xuICAgIGNhc2UgU1RBVEVTLmp1bXBpbmc6IHtcbiAgICAgIGxldCBmcmFtZSA9IHRoaXMuZnJhbWUgJSAodGhpcy5qdW1waW5nU3ByaXRlcy5sZW5ndGgpO1xuICAgICAgbGV0IHt4LCB5fSA9IHRoaXMuanVtcGluZ1Nwcml0ZXNbZnJhbWVdO1xuICAgICAgY3R4LmRyYXdJbWFnZShcbiAgICAgICAgdGhpcy5zcHJpdGVzaGVldCxcbiAgICAgICAgeCwgeSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsXG4gICAgICAgIHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodFxuICAgICAgKTtcbiAgICAgIGlmICh0aGlzLmZyYW1lID09PSB0aGlzLmp1bXBpbmdTcHJpdGVzLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuZnJhbWUgPSAwO1xuICAgICAgICAgIHRoaXMuc3RhdGUgPSBTVEFURVMuaWRsZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNhc2UgU1RBVEVTLmlkbGU6XG4gICAgICAvLyBoYW5kbGUgYmxpbmtpbmdcbiAgICAgIGxldCBmcmFtZSA9IE1hdGgubWluKHRoaXMuZnJhbWUgJSAodGhpcy5zaXR0aW5nU3ByaXRlcy5sZW5ndGggKyAyMCksIHRoaXMuc2l0dGluZ1Nwcml0ZXMubGVuZ3RoKTtcbiAgICAgIGZyYW1lID0gZnJhbWUgJSB0aGlzLnNpdHRpbmdTcHJpdGVzLmxlbmd0aDtcbiAgICAgIGxldCB7eCwgeX0gPSB0aGlzLnNpdHRpbmdTcHJpdGVzW2ZyYW1lXTtcbiAgICAgIGN0eC5kcmF3SW1hZ2UoXG4gICAgICAgIC8vIGltYWdlXG4gICAgICAgIHRoaXMuc3ByaXRlc2hlZXQsXG4gICAgICAgIC8vIHNvdXJjZSByZWN0YW5nbGVcbiAgICAgICAgeCwgeSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsXG4gICAgICAgIC8vIGRlc3RpbmF0aW9uIHJlY3RhbmdsZVxuICAgICAgICB0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHRcbiAgICAgICk7XG4gICAgICBicmVhaztcbiAgICAvLyBUT0RPOiBJbXBsZW1lbnQgeW91ciBwbGF5ZXIncyByZWRlcmluZyBhY2NvcmRpbmcgdG8gc3RhdGVcbiAgfVxufVxuIl19
