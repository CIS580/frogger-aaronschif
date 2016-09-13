(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/* Classes */
// const Game = require('./game.js');
// const Player = require('./player.js');

var _game = require("./game.js");

var _player = require("./player.js");

/* Global variables */
var canvas = document.getElementById('screen');
var game = new _game.Game(canvas, update, render);
var player = new _player.Player({ x: 0, y: 240 });

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function masterLoop(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
};
masterLoop(performance.now());

/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
  player.update(elapsedTime);
  // TODO: Update the game objects
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
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

function Player(position) {
  this.state = "idle";
  this.x = position.x;
  this.y = position.y;
  this.width = 64;
  this.height = 64;
  this.spritesheet = new Image();
  this.spritesheet.src = encodeURI('assets/PlayerSprite2.png');
  this.timer = 0;
  this.frame = 0;
}

Player.prototype.update = function (time) {
  switch (this.state) {
    case "idle":
      this.timer += time;
      if (this.timer > MS_PER_FRAME) {
        this.timer = 0;
        this.frame += 1;
        if (this.frame > 3) this.frame = 0;
      }
      break;
    // TODO: Implement your player's update by state
  }
};

Player.prototype.render = function (time, ctx) {
  switch (this.state) {
    case "idle":
      ctx.drawImage(
      // image
      this.spritesheet,
      // source rectangle
      this.frame * 64, 64, this.width, this.height,
      // destination rectangle
      this.x, this.y, this.width, this.height);
      break;
    // TODO: Implement your player's redering according to state
  }
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2dhbWUuanMiLCJzcmMvcGxheWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUNBOztBQUVBO0FBQ0EsSUFBSSxTQUFTLFNBQVMsY0FBVCxDQUF3QixRQUF4QixDQUFiO0FBQ0EsSUFBSSxPQUFPLGVBQVMsTUFBVCxFQUFpQixNQUFqQixFQUF5QixNQUF6QixDQUFYO0FBQ0EsSUFBSSxTQUFTLG1CQUFXLEVBQUMsR0FBRyxDQUFKLEVBQU8sR0FBRyxHQUFWLEVBQVgsQ0FBYjs7QUFFQTs7Ozs7QUFLQSxJQUFJLGFBQWEsU0FBYixVQUFhLENBQVMsU0FBVCxFQUFvQjtBQUNuQyxPQUFLLElBQUwsQ0FBVSxTQUFWO0FBQ0EsU0FBTyxxQkFBUCxDQUE2QixVQUE3QjtBQUNELENBSEQ7QUFJQSxXQUFXLFlBQVksR0FBWixFQUFYOztBQUdBOzs7Ozs7OztBQVFBLFNBQVMsTUFBVCxDQUFnQixXQUFoQixFQUE2QjtBQUMzQixTQUFPLE1BQVAsQ0FBYyxXQUFkO0FBQ0E7QUFDRDs7QUFFRDs7Ozs7OztBQU9BLFNBQVMsTUFBVCxDQUFnQixXQUFoQixFQUE2QixHQUE3QixFQUFrQztBQUNoQyxNQUFJLFNBQUosR0FBZ0IsV0FBaEI7QUFDQSxNQUFJLFFBQUosQ0FBYSxDQUFiLEVBQWdCLENBQWhCLEVBQW1CLE9BQU8sS0FBMUIsRUFBaUMsT0FBTyxNQUF4QztBQUNBLFNBQU8sTUFBUCxDQUFjLFdBQWQsRUFBMkIsR0FBM0I7QUFDRDs7O0FDbEREOzs7OztRQUdnQixJLEdBQUEsSTtBQUFULFNBQVMsSUFBVCxDQUFjLE1BQWQsRUFBc0IsY0FBdEIsRUFBc0MsY0FBdEMsRUFBc0Q7QUFDM0QsT0FBSyxNQUFMLEdBQWMsY0FBZDtBQUNBLE9BQUssTUFBTCxHQUFjLGNBQWQ7O0FBRUE7QUFDQSxPQUFLLFdBQUwsR0FBbUIsTUFBbkI7QUFDQSxPQUFLLFFBQUwsR0FBZ0IsT0FBTyxVQUFQLENBQWtCLElBQWxCLENBQWhCO0FBQ0EsT0FBSyxVQUFMLEdBQWtCLFNBQVMsYUFBVCxDQUF1QixRQUF2QixDQUFsQjtBQUNBLE9BQUssVUFBTCxDQUFnQixLQUFoQixHQUF3QixPQUFPLEtBQS9CO0FBQ0EsT0FBSyxVQUFMLENBQWdCLE1BQWhCLEdBQXlCLE9BQU8sTUFBaEM7QUFDQSxPQUFLLE9BQUwsR0FBZSxLQUFLLFVBQUwsQ0FBZ0IsVUFBaEIsQ0FBMkIsSUFBM0IsQ0FBZjs7QUFFQTtBQUNBLE9BQUssT0FBTCxHQUFlLFlBQVksR0FBWixFQUFmO0FBQ0EsT0FBSyxNQUFMLEdBQWMsS0FBZDtBQUNEOztBQUVELEtBQUssU0FBTCxDQUFlLEtBQWYsR0FBdUIsVUFBUyxJQUFULEVBQWU7QUFDcEMsT0FBSyxNQUFMLEdBQWUsUUFBUSxJQUF2QjtBQUNELENBRkQ7O0FBSUEsS0FBSyxTQUFMLENBQWUsSUFBZixHQUFzQixVQUFTLE9BQVQsRUFBa0I7QUFDdEMsTUFBSSxPQUFPLElBQVg7QUFDQSxNQUFJLGNBQWMsVUFBVSxLQUFLLE9BQWpDO0FBQ0EsT0FBSyxPQUFMLEdBQWUsT0FBZjs7QUFFQSxNQUFHLENBQUMsS0FBSyxNQUFULEVBQWlCLEtBQUssTUFBTCxDQUFZLFdBQVo7QUFDakIsT0FBSyxNQUFMLENBQVksV0FBWixFQUF5QixLQUFLLFFBQTlCOztBQUVBO0FBQ0EsT0FBSyxRQUFMLENBQWMsU0FBZCxDQUF3QixLQUFLLFVBQTdCLEVBQXlDLENBQXpDLEVBQTRDLENBQTVDO0FBQ0QsQ0FWRDs7O0FDeEJBOzs7OztRQUlnQixNLEdBQUEsTTtBQUZoQixJQUFNLGVBQWUsT0FBSyxDQUExQjs7QUFFTyxTQUFTLE1BQVQsQ0FBZ0IsUUFBaEIsRUFBMEI7QUFDL0IsT0FBSyxLQUFMLEdBQWEsTUFBYjtBQUNBLE9BQUssQ0FBTCxHQUFTLFNBQVMsQ0FBbEI7QUFDQSxPQUFLLENBQUwsR0FBUyxTQUFTLENBQWxCO0FBQ0EsT0FBSyxLQUFMLEdBQWMsRUFBZDtBQUNBLE9BQUssTUFBTCxHQUFjLEVBQWQ7QUFDQSxPQUFLLFdBQUwsR0FBb0IsSUFBSSxLQUFKLEVBQXBCO0FBQ0EsT0FBSyxXQUFMLENBQWlCLEdBQWpCLEdBQXVCLFVBQVUsMEJBQVYsQ0FBdkI7QUFDQSxPQUFLLEtBQUwsR0FBYSxDQUFiO0FBQ0EsT0FBSyxLQUFMLEdBQWEsQ0FBYjtBQUNEOztBQUVELE9BQU8sU0FBUCxDQUFpQixNQUFqQixHQUEwQixVQUFTLElBQVQsRUFBZTtBQUN2QyxVQUFPLEtBQUssS0FBWjtBQUNFLFNBQUssTUFBTDtBQUNFLFdBQUssS0FBTCxJQUFjLElBQWQ7QUFDQSxVQUFHLEtBQUssS0FBTCxHQUFhLFlBQWhCLEVBQThCO0FBQzVCLGFBQUssS0FBTCxHQUFhLENBQWI7QUFDQSxhQUFLLEtBQUwsSUFBYyxDQUFkO0FBQ0EsWUFBRyxLQUFLLEtBQUwsR0FBYSxDQUFoQixFQUFtQixLQUFLLEtBQUwsR0FBYSxDQUFiO0FBQ3BCO0FBQ0Q7QUFDRjtBQVRGO0FBV0QsQ0FaRDs7QUFjQSxPQUFPLFNBQVAsQ0FBaUIsTUFBakIsR0FBMEIsVUFBUyxJQUFULEVBQWUsR0FBZixFQUFvQjtBQUM1QyxVQUFPLEtBQUssS0FBWjtBQUNFLFNBQUssTUFBTDtBQUNFLFVBQUksU0FBSjtBQUNFO0FBQ0EsV0FBSyxXQUZQO0FBR0U7QUFDQSxXQUFLLEtBQUwsR0FBYSxFQUpmLEVBSW1CLEVBSm5CLEVBSXVCLEtBQUssS0FKNUIsRUFJbUMsS0FBSyxNQUp4QztBQUtFO0FBQ0EsV0FBSyxDQU5QLEVBTVUsS0FBSyxDQU5mLEVBTWtCLEtBQUssS0FOdkIsRUFNOEIsS0FBSyxNQU5uQztBQVFBO0FBQ0Y7QUFYRjtBQWFELENBZEQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIENsYXNzZXMgKi9cbi8vIGNvbnN0IEdhbWUgPSByZXF1aXJlKCcuL2dhbWUuanMnKTtcbi8vIGNvbnN0IFBsYXllciA9IHJlcXVpcmUoJy4vcGxheWVyLmpzJyk7XG5cbmltcG9ydCB7R2FtZX0gZnJvbSBcIi4vZ2FtZS5qc1wiO1xuaW1wb3J0IHtQbGF5ZXJ9IGZyb20gXCIuL3BsYXllci5qc1wiO1xuXG4vKiBHbG9iYWwgdmFyaWFibGVzICovXG52YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjcmVlbicpO1xudmFyIGdhbWUgPSBuZXcgR2FtZShjYW52YXMsIHVwZGF0ZSwgcmVuZGVyKTtcbnZhciBwbGF5ZXIgPSBuZXcgUGxheWVyKHt4OiAwLCB5OiAyNDB9KVxuXG4vKipcbiAqIEBmdW5jdGlvbiBtYXN0ZXJMb29wXG4gKiBBZHZhbmNlcyB0aGUgZ2FtZSBpbiBzeW5jIHdpdGggdGhlIHJlZnJlc2ggcmF0ZSBvZiB0aGUgc2NyZWVuXG4gKiBAcGFyYW0ge0RPTUhpZ2hSZXNUaW1lU3RhbXB9IHRpbWVzdGFtcCB0aGUgY3VycmVudCB0aW1lXG4gKi9cbnZhciBtYXN0ZXJMb29wID0gZnVuY3Rpb24odGltZXN0YW1wKSB7XG4gIGdhbWUubG9vcCh0aW1lc3RhbXApO1xuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1hc3Rlckxvb3ApO1xufVxubWFzdGVyTG9vcChwZXJmb3JtYW5jZS5ub3coKSk7XG5cblxuLyoqXG4gKiBAZnVuY3Rpb24gdXBkYXRlXG4gKiBVcGRhdGVzIHRoZSBnYW1lIHN0YXRlLCBtb3ZpbmdcbiAqIGdhbWUgb2JqZWN0cyBhbmQgaGFuZGxpbmcgaW50ZXJhY3Rpb25zXG4gKiBiZXR3ZWVuIHRoZW0uXG4gKiBAcGFyYW0ge0RPTUhpZ2hSZXNUaW1lU3RhbXB9IGVsYXBzZWRUaW1lIGluZGljYXRlc1xuICogdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgcGFzc2VkIHNpbmNlIHRoZSBsYXN0IGZyYW1lLlxuICovXG5mdW5jdGlvbiB1cGRhdGUoZWxhcHNlZFRpbWUpIHtcbiAgcGxheWVyLnVwZGF0ZShlbGFwc2VkVGltZSk7XG4gIC8vIFRPRE86IFVwZGF0ZSB0aGUgZ2FtZSBvYmplY3RzXG59XG5cbi8qKlxuICAqIEBmdW5jdGlvbiByZW5kZXJcbiAgKiBSZW5kZXJzIHRoZSBjdXJyZW50IGdhbWUgc3RhdGUgaW50byBhIGJhY2sgYnVmZmVyLlxuICAqIEBwYXJhbSB7RE9NSGlnaFJlc1RpbWVTdGFtcH0gZWxhcHNlZFRpbWUgaW5kaWNhdGVzXG4gICogdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgcGFzc2VkIHNpbmNlIHRoZSBsYXN0IGZyYW1lLlxuICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjdHggdGhlIGNvbnRleHQgdG8gcmVuZGVyIHRvXG4gICovXG5mdW5jdGlvbiByZW5kZXIoZWxhcHNlZFRpbWUsIGN0eCkge1xuICBjdHguZmlsbFN0eWxlID0gXCJsaWdodGJsdWVcIjtcbiAgY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gIHBsYXllci5yZW5kZXIoZWxhcHNlZFRpbWUsIGN0eCk7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuXG5leHBvcnQgZnVuY3Rpb24gR2FtZShzY3JlZW4sIHVwZGF0ZUZ1bmN0aW9uLCByZW5kZXJGdW5jdGlvbikge1xuICB0aGlzLnVwZGF0ZSA9IHVwZGF0ZUZ1bmN0aW9uO1xuICB0aGlzLnJlbmRlciA9IHJlbmRlckZ1bmN0aW9uO1xuXG4gIC8vIFNldCB1cCBidWZmZXJzXG4gIHRoaXMuZnJvbnRCdWZmZXIgPSBzY3JlZW47XG4gIHRoaXMuZnJvbnRDdHggPSBzY3JlZW4uZ2V0Q29udGV4dCgnMmQnKTtcbiAgdGhpcy5iYWNrQnVmZmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIHRoaXMuYmFja0J1ZmZlci53aWR0aCA9IHNjcmVlbi53aWR0aDtcbiAgdGhpcy5iYWNrQnVmZmVyLmhlaWdodCA9IHNjcmVlbi5oZWlnaHQ7XG4gIHRoaXMuYmFja0N0eCA9IHRoaXMuYmFja0J1ZmZlci5nZXRDb250ZXh0KCcyZCcpO1xuXG4gIC8vIFN0YXJ0IHRoZSBnYW1lIGxvb3BcbiAgdGhpcy5vbGRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gIHRoaXMucGF1c2VkID0gZmFsc2U7XG59XG5cbkdhbWUucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24oZmxhZykge1xuICB0aGlzLnBhdXNlZCA9IChmbGFnID09IHRydWUpO1xufVxuXG5HYW1lLnByb3RvdHlwZS5sb29wID0gZnVuY3Rpb24obmV3VGltZSkge1xuICB2YXIgZ2FtZSA9IHRoaXM7XG4gIHZhciBlbGFwc2VkVGltZSA9IG5ld1RpbWUgLSB0aGlzLm9sZFRpbWU7XG4gIHRoaXMub2xkVGltZSA9IG5ld1RpbWU7XG5cbiAgaWYoIXRoaXMucGF1c2VkKSB0aGlzLnVwZGF0ZShlbGFwc2VkVGltZSk7XG4gIHRoaXMucmVuZGVyKGVsYXBzZWRUaW1lLCB0aGlzLmZyb250Q3R4KTtcblxuICAvLyBGbGlwIHRoZSBiYWNrIGJ1ZmZlclxuICB0aGlzLmZyb250Q3R4LmRyYXdJbWFnZSh0aGlzLmJhY2tCdWZmZXIsIDAsIDApO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IE1TX1BFUl9GUkFNRSA9IDEwMDAvODtcblxuZXhwb3J0IGZ1bmN0aW9uIFBsYXllcihwb3NpdGlvbikge1xuICB0aGlzLnN0YXRlID0gXCJpZGxlXCI7XG4gIHRoaXMueCA9IHBvc2l0aW9uLng7XG4gIHRoaXMueSA9IHBvc2l0aW9uLnk7XG4gIHRoaXMud2lkdGggID0gNjQ7XG4gIHRoaXMuaGVpZ2h0ID0gNjQ7XG4gIHRoaXMuc3ByaXRlc2hlZXQgID0gbmV3IEltYWdlKCk7XG4gIHRoaXMuc3ByaXRlc2hlZXQuc3JjID0gZW5jb2RlVVJJKCdhc3NldHMvUGxheWVyU3ByaXRlMi5wbmcnKTtcbiAgdGhpcy50aW1lciA9IDA7XG4gIHRoaXMuZnJhbWUgPSAwO1xufVxuXG5QbGF5ZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKHRpbWUpIHtcbiAgc3dpdGNoKHRoaXMuc3RhdGUpIHtcbiAgICBjYXNlIFwiaWRsZVwiOlxuICAgICAgdGhpcy50aW1lciArPSB0aW1lO1xuICAgICAgaWYodGhpcy50aW1lciA+IE1TX1BFUl9GUkFNRSkge1xuICAgICAgICB0aGlzLnRpbWVyID0gMDtcbiAgICAgICAgdGhpcy5mcmFtZSArPSAxO1xuICAgICAgICBpZih0aGlzLmZyYW1lID4gMykgdGhpcy5mcmFtZSA9IDA7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICAvLyBUT0RPOiBJbXBsZW1lbnQgeW91ciBwbGF5ZXIncyB1cGRhdGUgYnkgc3RhdGVcbiAgfVxufVxuXG5QbGF5ZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHRpbWUsIGN0eCkge1xuICBzd2l0Y2godGhpcy5zdGF0ZSkge1xuICAgIGNhc2UgXCJpZGxlXCI6XG4gICAgICBjdHguZHJhd0ltYWdlKFxuICAgICAgICAvLyBpbWFnZVxuICAgICAgICB0aGlzLnNwcml0ZXNoZWV0LFxuICAgICAgICAvLyBzb3VyY2UgcmVjdGFuZ2xlXG4gICAgICAgIHRoaXMuZnJhbWUgKiA2NCwgNjQsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LFxuICAgICAgICAvLyBkZXN0aW5hdGlvbiByZWN0YW5nbGVcbiAgICAgICAgdGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0XG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gICAgLy8gVE9ETzogSW1wbGVtZW50IHlvdXIgcGxheWVyJ3MgcmVkZXJpbmcgYWNjb3JkaW5nIHRvIHN0YXRlXG4gIH1cbn1cbiJdfQ==
