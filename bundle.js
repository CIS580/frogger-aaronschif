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

},{"./game.js":3,"./player.js":4}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Controller = exports.Controller = function () {
    function Controller() {
        _classCallCheck(this, Controller);

        this.input = {
            up: false,
            down: false,
            right: false,
            left: false
        };
    }

    _createClass(Controller, [{
        key: 'isAnyPressed',
        value: function isAnyPressed() {
            return this.input.up | this.input.down | this.input.right | this.input.left;
        }
    }, {
        key: 'attach',
        value: function attach() {
            var _this = this;

            window.addEventListener('keydown', function (event) {
                var preventDefault = false;
                switch (event.keyCode) {
                    case 38:case 87:
                        // Up
                        preventDefault = true;
                        _this.input.up = true;
                        break;
                    case 37:case 65:
                        //Left
                        preventDefault = true;
                        _this.input.left = true;
                        break;
                    case 39:case 68:
                        // Right
                        preventDefault = true;
                        _this.input.right = true;
                        break;
                    case 40:case 83:
                        // Down
                        preventDefault = true;
                        _this.input.down = true;
                        break;
                }
                if (preventDefault) {
                    event.preventDefault();
                }
            });

            window.addEventListener('keyup', function (event) {
                switch (event.keyCode) {
                    case 38:case 87:
                        // Up
                        _this.input.up = false;
                        break;
                    case 37:case 65:
                        //Left
                        _this.input.left = false;
                        break;
                    case 39:case 68:
                        // Right
                        _this.input.right = false;
                        break;
                    case 40:case 83:
                        // Down
                        _this.input.down = false;
                        break;
                }
            });
        }
    }]);

    return Controller;
}();

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Game = exports.Game = function () {
    function Game(screen, updateFunction, renderFunction) {
        _classCallCheck(this, Game);

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

    _createClass(Game, [{
        key: 'pause',
        value: function pause(flag) {
            this.paused = flag == true;
        }
    }, {
        key: 'loop',
        value: function loop(newTime) {
            var game = this;
            var elapsedTime = newTime - this.oldTime;
            this.oldTime = newTime;

            if (!this.paused) this.update(elapsedTime);
            this.render(elapsedTime, this.frontCtx);

            // Flip the back buffer
            this.frontCtx.drawImage(this.backBuffer, 0, 0);
        }
    }]);

    return Game;
}();

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Player = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _common = require("./common.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MS_PER_FRAME = 1000 / 16;

var STATES = {
    idle: Symbol(),
    walking: Symbol(),
    blinking: Symbol(),
    jumping: Symbol()
};

var controller = new _common.Controller();
controller.attach();

var Player = exports.Player = function () {
    function Player(position) {
        _classCallCheck(this, Player);

        this.state = STATES.idle;
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

    _createClass(Player, [{
        key: "update",
        value: function update(time) {
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
        }
    }, {
        key: "render",
        value: function render(time, ctx) {
            switch (this.state) {
                case STATES.jumping:
                    {
                        var frame = this.frame % this.jumpingSprites.length;
                        var _jumpingSprites$frame = this.jumpingSprites[frame];
                        var x = _jumpingSprites$frame.x;
                        var y = _jumpingSprites$frame.y;

                        ctx.drawImage(this.spritesheet, x, y, this.width, this.height, this.x, this.y, this.width, this.height);
                        if (this.frame === this.jumpingSprites.length) {
                            this.frame = 0;
                            this.state = STATES.idle;
                        }
                        break;
                    }

                case STATES.idle:
                    {
                        if (controller.isAnyPressed()) {
                            this.frame = 0;
                            this.state = STATES.jumping;
                        }
                        // handle blinking
                        var _frame = Math.min(this.frame % (this.sittingSprites.length + 20), this.sittingSprites.length);
                        _frame = _frame % this.sittingSprites.length;
                        var _sittingSprites$_fram = this.sittingSprites[_frame];
                        var _x = _sittingSprites$_fram.x;
                        var _y = _sittingSprites$_fram.y;

                        ctx.drawImage(
                        // image
                        this.spritesheet,
                        // source rectangle
                        _x, _y, this.width, this.height,
                        // destination rectangle
                        this.x, this.y, this.width, this.height);
                        break;
                        // TODO: Implement your player's redering according to state
                    }
            }
        }
    }]);

    return Player;
}();

},{"./common.js":2}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2NvbW1vbi5qcyIsInNyYy9nYW1lLmpzIiwic3JjL3BsYXllci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBOztBQUNBOztBQUVBLElBQUksU0FBUyxTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsQ0FBYjtBQUNBLElBQUksT0FBTyxlQUFTLE1BQVQsRUFBaUIsTUFBakIsRUFBeUIsTUFBekIsQ0FBWDtBQUNBLElBQUksU0FBUyxtQkFBVyxFQUFDLEdBQUcsQ0FBSixFQUFPLEdBQUcsR0FBVixFQUFYLENBQWI7O0FBRUEsSUFBSSxhQUFhLFNBQWIsVUFBYSxDQUFTLFNBQVQsRUFBb0I7QUFDakMsU0FBSyxJQUFMLENBQVUsU0FBVjtBQUNBLFdBQU8scUJBQVAsQ0FBNkIsVUFBN0I7QUFDSCxDQUhEO0FBSUEsV0FBVyxZQUFZLEdBQVosRUFBWDs7QUFFQSxTQUFTLE1BQVQsQ0FBZ0IsV0FBaEIsRUFBNkI7QUFDekIsV0FBTyxNQUFQLENBQWMsV0FBZDtBQUNBO0FBQ0g7O0FBRUQsU0FBUyxNQUFULENBQWdCLFdBQWhCLEVBQTZCLEdBQTdCLEVBQWtDO0FBQzlCLFFBQUksU0FBSixHQUFnQixXQUFoQjtBQUNBLFFBQUksUUFBSixDQUFhLENBQWIsRUFBZ0IsQ0FBaEIsRUFBbUIsT0FBTyxLQUExQixFQUFpQyxPQUFPLE1BQXhDO0FBQ0EsV0FBTyxNQUFQLENBQWMsV0FBZCxFQUEyQixHQUEzQjtBQUNIOzs7QUN4QkQ7Ozs7Ozs7Ozs7SUFFYSxVLFdBQUEsVTtBQUNULDBCQUFjO0FBQUE7O0FBQ1YsYUFBSyxLQUFMLEdBQWE7QUFDVCxnQkFBSSxLQURLO0FBRVQsa0JBQU0sS0FGRztBQUdULG1CQUFPLEtBSEU7QUFJVCxrQkFBTTtBQUpHLFNBQWI7QUFNSDs7Ozt1Q0FFYztBQUNYLG1CQUFPLEtBQUssS0FBTCxDQUFXLEVBQVgsR0FD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RFQsRUFFSSxDQUZKLEVBRU8sQ0FGUCxFQUVVLEtBQUssS0FGZixFQUVzQixLQUFLLE1BRjNCLEVBR0ksS0FBSyxDQUhULEVBR1ksS0FBSyxDQUhqQixFQUdvQixLQUFLLEtBSHpCLEVBR2dDLEtBQUssTUFIckM7QUFLQSw0QkFBSSxLQUFLLEtBQUwsS0FBZSxLQUFLLGNBQUwsQ0FBb0IsTUFBdkMsRUFBK0M7QUFDM0MsaUNBQUssS0FBTCxHQUFhLENBQWI7QUFDQSxpQ0FBSyxLQUFMLEdBQWEsT0FBTyxJQUFwQjtBQUNIO0FBQ0Q7QUFDSDs7QUFFRCxxQkFBSyxPQUFPLElBQVo7QUFBa0I7QUFDZCw0QkFBSSxXQUFXLFlBQVgsRUFBSixFQUErQjtBQUMzQixpQ0FBSyxLQUFMLEdBQWEsQ0FBYjtBQUNBLGlDQUFLLEtBQUwsR0FBYSxPQUFPLE9BQXBCO0FBQ0g7QUFDRDtBQUNBLDRCQUFJLFNBQVEsS0FBSyxHQUFMLENBQVMsS0FBSyxLQUFMLElBQWMsS0FBSyxjQUFMLENBQW9CLE1BQXBCLEdBQTZCLEVBQTNDLENBQVQsRUFBeUQsS0FBSyxjQUFMLENBQW9CLE1BQTdFLENBQVo7QUFDQSxpQ0FBUSxTQUFRLEtBQUssY0FBTCxDQUFvQixNQUFwQztBQVBjLG9EQVFELEtBQUssY0FBTCxDQUFvQixNQUFwQixDQVJDO0FBQUEsNEJBUVQsRUFSUyx5QkFRVCxDQVJTO0FBQUEsNEJBUU4sRUFSTSx5QkFRTixDQVJNOztBQVNkLDRCQUFJLFNBQUo7QUFDSTtBQUNBLDZCQUFLLFdBRlQ7QUFHSTtBQUNBLDBCQUpKLEVBSU8sRUFKUCxFQUlVLEtBQUssS0FKZixFQUlzQixLQUFLLE1BSjNCO0FBS0k7QUFDQSw2QkFBSyxDQU5ULEVBTVksS0FBSyxDQU5qQixFQU1vQixLQUFLLEtBTnpCLEVBTWdDLEtBQUssTUFOckM7QUFRQTtBQUNBO0FBQ0g7QUFuQ0w7QUFxQ0giLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB7R2FtZX0gZnJvbSBcIi4vZ2FtZS5qc1wiO1xuaW1wb3J0IHtQbGF5ZXJ9IGZyb20gXCIuL3BsYXllci5qc1wiO1xuXG52YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjcmVlbicpO1xudmFyIGdhbWUgPSBuZXcgR2FtZShjYW52YXMsIHVwZGF0ZSwgcmVuZGVyKTtcbnZhciBwbGF5ZXIgPSBuZXcgUGxheWVyKHt4OiAwLCB5OiAyNDB9KVxuXG52YXIgbWFzdGVyTG9vcCA9IGZ1bmN0aW9uKHRpbWVzdGFtcCkge1xuICAgIGdhbWUubG9vcCh0aW1lc3RhbXApO1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobWFzdGVyTG9vcCk7XG59XG5tYXN0ZXJMb29wKHBlcmZvcm1hbmNlLm5vdygpKTtcblxuZnVuY3Rpb24gdXBkYXRlKGVsYXBzZWRUaW1lKSB7XG4gICAgcGxheWVyLnVwZGF0ZShlbGFwc2VkVGltZSk7XG4gICAgLy8gVE9ETzogVXBkYXRlIHRoZSBnYW1lIG9iamVjdHNcbn1cblxuZnVuY3Rpb24gcmVuZGVyKGVsYXBzZWRUaW1lLCBjdHgpIHtcbiAgICBjdHguZmlsbFN0eWxlID0gXCJsaWdodGJsdWVcIjtcbiAgICBjdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICBwbGF5ZXIucmVuZGVyKGVsYXBzZWRUaW1lLCBjdHgpO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydCBjbGFzcyBDb250cm9sbGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5pbnB1dCA9IHtcbiAgICAgICAgICAgIHVwOiBmYWxzZSxcbiAgICAgICAgICAgIGRvd246IGZhbHNlLFxuICAgICAgICAgICAgcmlnaHQ6IGZhbHNlLFxuICAgICAgICAgICAgbGVmdDogZmFsc2UsXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpc0FueVByZXNzZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlucHV0LnVwIHxcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuZG93biB8XG4gICAgICAgICAgICB0aGlzLmlucHV0LnJpZ2h0IHxcbiAgICAgICAgICAgIHRoaXMuaW5wdXQubGVmdDtcbiAgICB9XG5cbiAgICBhdHRhY2goKSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgcHJldmVudERlZmF1bHQgPSBmYWxzZVxuICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAzODogY2FzZSA4NzogLy8gVXBcbiAgICAgICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQudXAgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSAzNzogY2FzZSA2NTogLy9MZWZ0XG4gICAgICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LmxlZnQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSAzOTogY2FzZSA2ODogLy8gUmlnaHRcbiAgICAgICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQucmlnaHQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSA0MDogY2FzZSA4MzogLy8gRG93blxuICAgICAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5kb3duID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMzg6IGNhc2UgODc6IC8vIFVwXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQudXAgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgMzc6IGNhc2UgNjU6IC8vTGVmdFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LmxlZnQgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgMzk6IGNhc2UgNjg6IC8vIFJpZ2h0XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQucmlnaHQgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgNDA6IGNhc2UgODM6IC8vIERvd25cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5kb3duID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cblxuZXhwb3J0IGNsYXNzIEdhbWUge1xuICAgIGNvbnN0cnVjdG9yKHNjcmVlbiwgdXBkYXRlRnVuY3Rpb24sIHJlbmRlckZ1bmN0aW9uKSB7XG5cbiAgICAgICAgdGhpcy51cGRhdGUgPSB1cGRhdGVGdW5jdGlvbjtcbiAgICAgICAgdGhpcy5yZW5kZXIgPSByZW5kZXJGdW5jdGlvbjtcblxuICAgICAgICAvLyBTZXQgdXAgYnVmZmVyc1xuICAgICAgICB0aGlzLmZyb250QnVmZmVyID0gc2NyZWVuO1xuICAgICAgICB0aGlzLmZyb250Q3R4ID0gc2NyZWVuLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIHRoaXMuYmFja0J1ZmZlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICB0aGlzLmJhY2tCdWZmZXIud2lkdGggPSBzY3JlZW4ud2lkdGg7XG4gICAgICAgIHRoaXMuYmFja0J1ZmZlci5oZWlnaHQgPSBzY3JlZW4uaGVpZ2h0O1xuICAgICAgICB0aGlzLmJhY2tDdHggPSB0aGlzLmJhY2tCdWZmZXIuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICAvLyBTdGFydCB0aGUgZ2FtZSBsb29wXG4gICAgICAgIHRoaXMub2xkVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHBhdXNlKGZsYWcpIHtcbiAgICAgICAgdGhpcy5wYXVzZWQgPSAoZmxhZyA9PSB0cnVlKTtcbiAgICB9XG5cbiAgICBsb29wKG5ld1RpbWUpIHtcbiAgICAgICAgdmFyIGdhbWUgPSB0aGlzO1xuICAgICAgICB2YXIgZWxhcHNlZFRpbWUgPSBuZXdUaW1lIC0gdGhpcy5vbGRUaW1lO1xuICAgICAgICB0aGlzLm9sZFRpbWUgPSBuZXdUaW1lO1xuXG4gICAgICAgIGlmKCF0aGlzLnBhdXNlZCkgdGhpcy51cGRhdGUoZWxhcHNlZFRpbWUpO1xuICAgICAgICB0aGlzLnJlbmRlcihlbGFwc2VkVGltZSwgdGhpcy5mcm9udEN0eCk7XG5cbiAgICAgICAgLy8gRmxpcCB0aGUgYmFjayBidWZmZXJcbiAgICAgICAgdGhpcy5mcm9udEN0eC5kcmF3SW1hZ2UodGhpcy5iYWNrQnVmZmVyLCAwLCAwKTtcbiAgICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHtDb250cm9sbGVyfSBmcm9tIFwiLi9jb21tb24uanNcIjtcblxuY29uc3QgTVNfUEVSX0ZSQU1FID0gMTAwMC8xNjtcblxuY29uc3QgU1RBVEVTID0ge1xuICAgIGlkbGU6IFN5bWJvbCgpLFxuICAgIHdhbGtpbmc6IFN5bWJvbCgpLFxuICAgIGJsaW5raW5nOiBTeW1ib2woKSxcbiAgICBqdW1waW5nOiBTeW1ib2woKSxcbn1cblxubGV0IGNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcigpO1xuY29udHJvbGxlci5hdHRhY2goKTtcblxuZXhwb3J0IGNsYXNzIFBsYXllciB7XG4gICAgY29uc3RydWN0b3IocG9zaXRpb24pIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFNUQVRFUy5pZGxlO1xuICAgICAgICB0aGlzLnggPSBwb3NpdGlvbi54O1xuICAgICAgICB0aGlzLnkgPSBwb3NpdGlvbi55O1xuICAgICAgICB0aGlzLndpZHRoICA9IDY0O1xuICAgICAgICB0aGlzLmhlaWdodCA9IDY0O1xuICAgICAgICB0aGlzLnNwcml0ZXNoZWV0ICA9IG5ldyBJbWFnZSgpO1xuICAgICAgICB0aGlzLnNwcml0ZXNoZWV0LnNyYyA9IGVuY29kZVVSSSgnYXNzZXRzL1BsYXllclNwcml0ZTIucG5nJyk7XG4gICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICAgICAgdGhpcy5zaXR0aW5nU3ByaXRlcyA9IFt7eDogNjQqMywgeTogNjR9LCB7eDogNjQqMCwgeTogNjR9LCB7eDogNjQqMSwgeTogNjR9LCB7eDogNjQqMiwgeTogNjR9LCB7eDogNjQqMSwgeTogNjR9LCB7eDogNjQqMCwgeTogNjR9XTtcbiAgICAgICAgdGhpcy5qdW1waW5nU3ByaXRlcyA9IFt7eDogNjQqMywgeTogMH0sIHt4OiA2NCoyLCB5OiAwfSwge3g6IDY0KjEsIHk6IDB9LCB7eDogNjQqMCwgeTogMH0sIHt4OiA2NCoxLCB5OiAwfSwge3g6IDY0KjIsIHk6IDB9LCB7eDogNjQqMywgeTogMH1dO1xuICAgIH1cblxuICAgIHVwZGF0ZSh0aW1lKSB7XG4gICAgICAgIHRoaXMudGltZXIgKz0gdGltZTtcbiAgICAgICAgbGV0IG5ld0ZyYW1lID0gZmFsc2U7XG4gICAgICAgIGlmKHRoaXMudGltZXIgPiBNU19QRVJfRlJBTUUpIHtcbiAgICAgICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSsrO1xuICAgICAgICAgICAgbmV3RnJhbWUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCh0aGlzLnN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlIFNUQVRFUy5pZGxlOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBTVEFURVMuanVtcGluZzoge1xuICAgICAgICAgICAgICAgIGlmIChuZXdGcmFtZSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy54ICs9IHRoaXMud2lkdGggLyB0aGlzLmp1bXBpbmdTcHJpdGVzLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRPRE86IEltcGxlbWVudCB5b3VyIHBsYXllcidzIHVwZGF0ZSBieSBzdGF0ZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKHRpbWUsIGN0eCkge1xuICAgICAgICBzd2l0Y2godGhpcy5zdGF0ZSkge1xuICAgICAgICAgICAgY2FzZSBTVEFURVMuanVtcGluZzoge1xuICAgICAgICAgICAgICAgIGxldCBmcmFtZSA9IHRoaXMuZnJhbWUgJSAodGhpcy5qdW1waW5nU3ByaXRlcy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGxldCB7eCwgeX0gPSB0aGlzLmp1bXBpbmdTcHJpdGVzW2ZyYW1lXTtcbiAgICAgICAgICAgICAgICBjdHguZHJhd0ltYWdlKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZXNoZWV0LFxuICAgICAgICAgICAgICAgICAgICB4LCB5LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5mcmFtZSA9PT0gdGhpcy5qdW1waW5nU3ByaXRlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mcmFtZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBTVEFURVMuaWRsZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhc2UgU1RBVEVTLmlkbGU6IHtcbiAgICAgICAgICAgICAgICBpZiAoY29udHJvbGxlci5pc0FueVByZXNzZWQoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFNUQVRFUy5qdW1waW5nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBoYW5kbGUgYmxpbmtpbmdcbiAgICAgICAgICAgICAgICBsZXQgZnJhbWUgPSBNYXRoLm1pbih0aGlzLmZyYW1lICUgKHRoaXMuc2l0dGluZ1Nwcml0ZXMubGVuZ3RoICsgMjApLCB0aGlzLnNpdHRpbmdTcHJpdGVzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgZnJhbWUgPSBmcmFtZSAlIHRoaXMuc2l0dGluZ1Nwcml0ZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGxldCB7eCwgeX0gPSB0aGlzLnNpdHRpbmdTcHJpdGVzW2ZyYW1lXTtcbiAgICAgICAgICAgICAgICBjdHguZHJhd0ltYWdlKFxuICAgICAgICAgICAgICAgICAgICAvLyBpbWFnZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZXNoZWV0LFxuICAgICAgICAgICAgICAgICAgICAvLyBzb3VyY2UgcmVjdGFuZ2xlXG4gICAgICAgICAgICAgICAgICAgIHgsIHksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAvLyBkZXN0aW5hdGlvbiByZWN0YW5nbGVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBJbXBsZW1lbnQgeW91ciBwbGF5ZXIncyByZWRlcmluZyBhY2NvcmRpbmcgdG8gc3RhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==
