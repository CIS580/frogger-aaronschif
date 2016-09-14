(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

// import "babel-polyfill";

var _game = require("./game.js");

var _player = require("./player.js");

var canvas = document.getElementById('screen');
var game = new _game.Game(canvas, update, render);
var player = new _player.Player({ x: 0, y: 240 });

var masterLoop = function (timestamp) {
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
class Controller {
    constructor() {
        this.input = {
            up: false,
            down: false,
            right: false,
            left: false
        };
    }

    isAnyPressed() {
        return this.input.up | this.input.down | this.input.right | this.input.left;
    }

    attach() {
        window.addEventListener('keydown', event => {
            let preventDefault = false;
            switch (event.keyCode) {
                case 38:case 87:
                    // Up
                    preventDefault = true;
                    this.input.up = true;
                    break;
                case 37:case 65:
                    //Left
                    preventDefault = true;
                    this.input.left = true;
                    break;
                case 39:case 68:
                    // Right
                    preventDefault = true;
                    this.input.right = true;
                    break;
                case 40:case 83:
                    // Down
                    preventDefault = true;
                    this.input.down = true;
                    break;
            }
            if (preventDefault) {
                event.preventDefault();
            }
        });

        window.addEventListener('keyup', event => {
            switch (event.keyCode) {
                case 38:case 87:
                    // Up
                    this.input.up = false;
                    break;
                case 37:case 65:
                    //Left
                    this.input.left = false;
                    break;
                case 39:case 68:
                    // Right
                    this.input.right = false;
                    break;
                case 40:case 83:
                    // Down
                    this.input.down = false;
                    break;
            }
        });
    }
}
exports.Controller = Controller;

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
class Game {
    constructor(screen, updateFunction, renderFunction) {

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

    pause(flag) {
        this.paused = flag == true;
    }

    loop(newTime) {
        var game = this;
        var elapsedTime = newTime - this.oldTime;
        this.oldTime = newTime;

        if (!this.paused) this.update(elapsedTime);
        this.render(elapsedTime, this.frontCtx);

        // Flip the back buffer
        this.frontCtx.drawImage(this.backBuffer, 0, 0);
    }
}
exports.Game = Game;

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Player = undefined;

var _common = require("./common.js");

const MS_PER_FRAME = 1000 / 16;

const STATES = {
    idle: Symbol(),
    walking: Symbol(),
    blinking: Symbol(),
    jumping: Symbol()
};

let controller = new _common.Controller();
controller.attach();

class Player {
    constructor(position) {
        this.state = STATES.idle;
        this.stateFunc = this.stateIdle.bind(this)();
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

    update(time) {
        this.timer += time;
        let newFrame = false;
        if (this.timer > MS_PER_FRAME) {
            this.timer = 0;
            this.frame++;
        } else {
            return;
        }

        let cur = this.stateFunc.next({ dt: time });
        if (cur.done) {
            this.stateFunc = this.stateIdle.bind(this)();
        } else if (cur.value !== null) {
            this.stateFunc = cur.value;
        }
    }

    *stateIdle() {
        while (true) {
            let { dt } = yield null;

            if (controller.isAnyPressed()) {
                let h = { x: 0, y: 0 };
                if (controller.input.right) {
                    h.x = 1;
                } else if (controller.input.left) {
                    h.x = -1;
                } else if (controller.input.up) {
                    h.y = -1;
                } else if (controller.input.down) {
                    h.y = 1;
                }
                this.stateFunc = this.stateJumping.bind(this)(h);
            }
        }
    }

    *stateJumping(heading) {
        let { x, y } = heading;
        let [endX, endY] = [this.x + this.height * x, this.y + this.height * y];
        let timeToTake = 1000 / 18;
        let time = 0;
        while (time < timeToTake) {
            let { dt } = yield null;
            let dd = dt / timeToTake;
            time += dt;
            this.x += this.width * x * dd;
            this.y += this.height * y * dd;
        }
        [this.x, this.y] = [endX, endY];
    }

    render(time, ctx) {
        switch (this.state) {
            case STATES.jumping:
                {
                    let frame = this.frame % this.jumpingSprites.length;
                    let { x, y } = this.jumpingSprites[frame];
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
                    let frame = Math.min(this.frame % (this.sittingSprites.length + 20), this.sittingSprites.length);
                    frame = frame % this.sittingSprites.length;
                    let { x, y } = this.sittingSprites[frame];
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
        }
    }
}
exports.Player = Player;

},{"./common.js":2}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2NvbW1vbi5qcyIsInNyYy9nYW1lLmpzIiwic3JjL3BsYXllci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBOztBQUNBOztBQUNBOztBQUVBLElBQUksU0FBUyxTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsQ0FBYjtBQUNBLElBQUksT0FBTyxlQUFTLE1BQVQsRUFBaUIsTUFBakIsRUFBeUIsTUFBekIsQ0FBWDtBQUNBLElBQUksU0FBUyxtQkFBVyxFQUFDLEdBQUcsQ0FBSixFQUFPLEdBQUcsR0FBVixFQUFYLENBQWI7O0FBRUEsSUFBSSxhQUFhLFVBQVMsU0FBVCxFQUFvQjtBQUNqQyxTQUFLLElBQUwsQ0FBVSxTQUFWO0FBQ0EsV0FBTyxxQkFBUCxDQUE2QixVQUE3QjtBQUNILENBSEQ7QUFJQSxXQUFXLFlBQVksR0FBWixFQUFYOztBQUVBLFNBQVMsTUFBVCxDQUFnQixXQUFoQixFQUE2QjtBQUN6QixXQUFPLE1BQVAsQ0FBYyxXQUFkO0FBQ0E7QUFDSDs7QUFFRCxTQUFTLE1BQVQsQ0FBZ0IsV0FBaEIsRUFBNkIsR0FBN0IsRUFBa0M7QUFDOUIsUUFBSSxTQUFKLEdBQWdCLFdBQWhCO0FBQ0EsUUFBSSxRQUFKLENBQWEsQ0FBYixFQUFnQixDQUFoQixFQUFtQixPQUFPLEtBQTFCLEVBQWlDLE9BQU8sTUFBeEM7QUFDQSxXQUFPLE1BQVAsQ0FBYyxXQUFkLEVBQTJCLEdBQTNCO0FBQ0g7OztBQ3pCRDs7Ozs7QUFFTyxNQUFNLFVBQU4sQ0FBaUI7QUFDcEIsa0JBQWM7QUFDVixhQUFLLEtBQUwsR0FBYTtBQUNULGdCQUFJLEtBREs7QUFFVCxrQkFBTSxLQUZHO0FBR1QsbUJBQU8sS0FIRTtBQUlULGtCQUFNO0FBSkcsU0FBYjtBQU1IOztBQUVELG1CQUFlO0FBQ1gsZUFBTyxLQUFLLEtBQUwsQ0FBVyxFQUFYLEdBQ0gsS0FBSyxLQUFMLENBQVcsSUFEUixHQUVILEtBQUssS0FBTCxDQUFXLEtBRlIsR0FHSCxLQUFLLEtBQUwsQ0FBVyxJQUhmO0FBSUg7O0FBRUQsYUFBUztBQUNMLGVBQU8sZ0JBQVAsQ0FBd0IsU0FBeEIsRUFBb0MsS0FBRCxJQUFXO0FBQzFDLGdCQUFJLGlCQUFpQixLQUFyQjtBQUNBLG9CQUFRLE1BQU0sT0FBZDtBQUNJLHFCQUFLLEVBQUwsQ0FBUyxLQUFLLEVBQUw7QUFBUztBQUNkLHFDQUFpQixJQUFqQjtBQUNBLHlCQUFLLEtBQUwsQ0FBVyxFQUFYLEdBQWdCLElBQWhCO0FBQ0E7QUFDSixxQkFBSyxFQUFMLENBQVMsS0FBSyxFQUFMO0FBQVM7QUFDZCxxQ0FBaUIsSUFBakI7QUFDQSx5QkFBSyxLQUFMLENBQVcsSUFBWCxHQUFrQixJQUFsQjtBQUNBO0FBQ0oscUJBQUssRUFBTCxDQUFTLEtBQUssRUFBTDtBQUFTO0FBQ2QscUNBQWlCLElBQWpCO0FBQ0EseUJBQUssS0FBTCxDQUFXLEtBQVgsR0FBbUIsSUFBbkI7QUFDQTtBQUNKLHFCQUFLLEVBQUwsQ0FBUyxLQUFLLEVBQUw7QUFBUztBQUNkLHFDQUFpQixJQUFqQjtBQUNBLHlCQUFLLEtBQUwsQ0FBVyxJQUFYLEdBQWtCLElBQWxCO0FBQ0E7QUFoQlI7QUFrQkEsZ0JBQUksY0FBSixFQUFvQjtBQUNoQixzQkFBTSxjQUFOO0FBQ0g7QUFDSixTQXZCRDs7QUF5QkEsZUFBTyxnQkFBUCxDQUF3QixPQUF4QixFQUFrQyxLQUFELElBQVc7QUFDeEMsb0JBQVEsTUFBTSxPQUFkO0FBQ0kscUJBQUssRUFBTCxDQUFTLEtBQUssRUFBTDtBQUFTO0FBQ2QseUJBQUssS0FBTCxDQUFXLEVBQVgsR0FBZ0IsS0FBaEI7QUFDQTtBQUNKLHFCQUFLLEVBQUwsQ0FBUyxLQUFLLEVBQUw7QUFBUztBQUNkLHlCQUFLLEtBQUwsQ0FBVyxJQUFYLEdBQWtCLEtBQWxCO0FBQ0E7QUFDSixxQkFBSyxFQUFMLENBQVMsS0FBSyxFQUFMO0FBQVM7QUFDZCx5QkFBSyxLQUFMLENBQVcsS0FBWCxHQUFtQixLQUFuQjtBQUNBO0FBQ0oscUJBQUssRUFBTCxDQUFTLEtBQUssRUFBTDtBQUFTO0FBQ2QseUJBQUssS0FBTCxDQUFXLElBQVgsR0FBa0IsS0FBbEI7QUFDQTtBQVpSO0FBY0gsU0FmRDtBQWdCSDtBQTNEbUI7UUFBWCxVLEdBQUEsVTs7O0FDRmI7Ozs7O0FBR08sTUFBTSxJQUFOLENBQVc7QUFDZCxnQkFBWSxNQUFaLEVBQW9CLGNBQXBCLEVBQW9DLGNBQXBDLEVBQW9EOztBQUVoRCxhQUFLLE1BQUwsR0FBYyxjQUFkO0FBQ0EsYUFBSyxNQUFMLEdBQWMsY0FBZDs7QUFFQTtBQUNBLGFBQUssV0FBTCxHQUFtQixNQUFuQjtBQUNBLGFBQUssUUFBTCxHQUFnQixPQUFPLFVBQVAsQ0FBa0IsSUFBbEIsQ0FBaEI7QUFDQSxhQUFLLFVBQUwsR0FBa0IsU0FBUyxhQUFULENBQXVCLFFBQXZCLENBQWxCO0FBQ0EsYUFBSyxVQUFMLENBQWdCLEtBQWhCLEdBQXdCLE9BQU8sS0FBL0I7QUFDQSxhQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsR0FBeUIsT0FBTyxNQUFoQztBQUNBLGFBQUssT0FBTCxHQUFlLEtBQUssVUFBTCxDQUFnQixVQUFoQixDQUEyQixJQUEzQixDQUFmOztBQUVBO0FBQ0EsYUFBSyxPQUFMLEdBQWUsWUFBWSxHQUFaLEVBQWY7QUFDQSxhQUFLLE1BQUwsR0FBYyxLQUFkO0FBQ0g7O0FBRUQsVUFBTSxJQUFOLEVBQVk7QUFDUixhQUFLLE1BQUwsR0FBZSxRQUFRLElBQXZCO0FBQ0g7O0FBRUQsU0FBSyxPQUFMLEVBQWM7QUFDVixZQUFJLE9BQU8sSUFBWDtBQUNBLFlBQUksY0FBYyxVQUFVLEtBQUssT0FBakM7QUFDQSxhQUFLLE9BQUwsR0FBZSxPQUFmOztBQUVBLFlBQUcsQ0FBQyxLQUFLLE1BQVQsRUFBaUIsS0FBSyxNQUFMLENBQVksV0FBWjtBQUNqQixhQUFLLE1BQUwsQ0FBWSxXQUFaLEVBQXlCLEtBQUssUUFBOUI7O0FBRUE7QUFDQSxhQUFLLFFBQUwsQ0FBYyxTQUFkLENBQXdCLEtBQUssVUFBN0IsRUFBeUMsQ0FBekMsRUFBNEMsQ0FBNUM7QUFDSDtBQWpDYTtRQUFMLEksR0FBQSxJOzs7QUNIYjs7Ozs7OztBQUVBOztBQUVBLE1BQU0sZUFBZSxPQUFLLEVBQTFCOztBQUVBLE1BQU0sU0FBUztBQUNYLFVBQU0sUUFESztBQUVYLGFBQVMsUUFGRTtBQUdYLGNBQVUsUUFIQztBQUlYLGFBQVM7QUFKRSxDQUFmOztBQU9BLElBQUksYUFBYSx3QkFBakI7QUFDQSxXQUFXLE1BQVg7O0FBRU8sTUFBTSxNQUFOLENBQWE7QUFDaEIsZ0JBQVksUUFBWixFQUFzQjtBQUNsQixhQUFLLEtBQUwsR0FBYSxPQUFPLElBQXBCO0FBQ0EsYUFBSyxTQUFMLEdBQWlCLEtBQUssU0FBTCxDQUFlLElBQWYsQ0FBb0IsSUFBcEIsR0FBakI7QUFDQSxhQUFLLENBQUwsR0FBUyxTQUFTLENBQWxCO0FBQ0EsYUFBSyxDQUFMLEdBQVMsU0FBUyxDQUFsQjtBQUNBLGFBQUssS0FBTCxHQUFjLEVBQWQ7QUFDQSxhQUFLLE1BQUwsR0FBYyxFQUFkO0FBQ0EsYUFBSyxXQUFMLEdBQW9CLElBQUksS0FBSixFQUFwQjtBQUNBLGFBQUssV0FBTCxDQUFpQixHQUFqQixHQUF1QixVQUFVLDBCQUFWLENBQXZCO0FBQ0EsYUFBSyxLQUFMLEdBQWEsQ0FBYjtBQUNBLGFBQUssS0FBTCxHQUFhLENBQWI7QUFDQSxhQUFLLGNBQUwsR0FBc0IsQ0FBQyxFQUFDLEdBQUcsS0FBRyxDQUFQLEVBQVUsR0FBRyxFQUFiLEVBQUQsRUFBbUIsRUFBQyxHQUFHLEtBQUcsQ0FBUCxFQUFVLEdBQUcsRUFBYixFQUFuQixFQUFxQyxFQUFDLEdBQUcsS0FBRyxDQUFQLEVBQVUsR0FBRyxFQUFiLEVBQXJDLEVBQXVELEVBQUMsR0FBRyxLQUFHLENBQVAsRUFBVSxHQUFHLEVBQWIsRUFBdkQsRUFBeUUsRUFBQyxHQUFHLEtBQUcsQ0FBUCxFQUFVLEdBQUcsRUFBYixFQUF6RSxFQUEyRixFQUFDLEdBQUcsS0FBRyxDQUFQLEVBQVUsR0FBRyxFQUFiLEVBQTNGLENBQXRCO0FBQ0EsYUFBSyxjQUFMLEdBQXNCLENBQUMsRUFBQyxHQUFHLEtBQUcsQ0FBUCxFQUFVLEdBQUcsQ0FBYixFQUFELEVBQWtCLEVBQUMsR0FBRyxLQUFHLENBQVAsRUFBVSxHQUFHLENBQWIsRUFBbEIsRUFBbUMsRUFBQyxHQUFHLEtBQUcsQ0FBUCxFQUFVLEdBQUcsQ0FBYixFQUFuQyxFQUFvRCxFQUFDLEdBQUcsS0FBRyxDQUFQLEVBQVUsR0FBRyxDQUFiLEVBQXBELEVBQXFFLEVBQUMsR0FBRyxLQUFHLENBQVAsRUFBVSxHQUFHLENBQWIsRUFBckUsRUFBc0YsRUFBQyxHQUFHLEtBQUcsQ0FBUCxFQUFVLEdBQUcsQ0FBYixFQUF0RixFQUF1RyxFQUFDLEdBQUcsS0FBRyxDQUFQLEVBQVUsR0FBRyxDQUFiLEVBQXZHLENBQXRCO0FBQ0g7O0FBRUQsV0FBTyxJQUFQLEVBQWE7QUFDVCxhQUFLLEtBQUwsSUFBYyxJQUFkO0FBQ0EsWUFBSSxXQUFXLEtBQWY7QUFDQSxZQUFHLEtBQUssS0FBTCxHQUFhLFlBQWhCLEVBQThCO0FBQzFCLGlCQUFLLEtBQUwsR0FBYSxDQUFiO0FBQ0EsaUJBQUssS0FBTDtBQUNILFNBSEQsTUFHTztBQUNIO0FBQ0g7O0FBRUQsWUFBSSxNQUFNLEtBQUssU0FBTCxDQUFlLElBQWYsQ0FBb0IsRUFBQyxJQUFJLElBQUwsRUFBcEIsQ0FBVjtBQUNBLFlBQUksSUFBSSxJQUFSLEVBQWM7QUFDWCxpQkFBSyxTQUFMLEdBQWlCLEtBQUssU0FBTCxDQUFlLElBQWYsQ0FBb0IsSUFBcEIsR0FBakI7QUFDRixTQUZELE1BRU8sSUFBSSxJQUFJLEtBQUosS0FBYyxJQUFsQixFQUF3QjtBQUMzQixpQkFBSyxTQUFMLEdBQWlCLElBQUksS0FBckI7QUFDSDtBQUNKOztBQUVELEtBQUMsU0FBRCxHQUFhO0FBQ1QsZUFBTyxJQUFQLEVBQWE7QUFDVCxnQkFBSSxFQUFDLEVBQUQsS0FBTyxNQUFNLElBQWpCOztBQUVBLGdCQUFJLFdBQVcsWUFBWCxFQUFKLEVBQStCO0FBQzNCLG9CQUFJLElBQUksRUFBQyxHQUFHLENBQUosRUFBTyxHQUFHLENBQVYsRUFBUjtBQUNBLG9CQUFJLFdBQVcsS0FBWCxDQUFpQixLQUFyQixFQUE0QjtBQUN4QixzQkFBRSxDQUFGLEdBQU0sQ0FBTjtBQUNILGlCQUZELE1BRU8sSUFBSSxXQUFXLEtBQVgsQ0FBaUIsSUFBckIsRUFBMkI7QUFDOUIsc0JBQUUsQ0FBRixHQUFNLENBQUMsQ0FBUDtBQUNILGlCQUZNLE1BRUEsSUFBSSxXQUFXLEtBQVgsQ0FBaUIsRUFBckIsRUFBeUI7QUFDNUIsc0JBQUUsQ0FBRixHQUFNLENBQUMsQ0FBUDtBQUNILGlCQUZNLE1BRUEsSUFBSSxXQUFXLEtBQVgsQ0FBaUIsSUFBckIsRUFBMkI7QUFDOUIsc0JBQUUsQ0FBRixHQUFNLENBQU47QUFDSDtBQUNELHFCQUFLLFNBQUwsR0FBaUIsS0FBSyxZQUFMLENBQWtCLElBQWxCLENBQXVCLElBQXZCLEVBQTZCLENBQTdCLENBQWpCO0FBQ0g7QUFDSjtBQUNKOztBQUVELEtBQUMsWUFBRCxDQUFjLE9BQWQsRUFBdUI7QUFDbkIsWUFBSSxFQUFDLENBQUQsRUFBSSxDQUFKLEtBQVMsT0FBYjtBQUNBLFlBQUksQ0FBQyxJQUFELEVBQU8sSUFBUCxJQUFlLENBQUMsS0FBSyxDQUFMLEdBQVMsS0FBSyxNQUFMLEdBQVksQ0FBdEIsRUFBeUIsS0FBSyxDQUFMLEdBQVMsS0FBSyxNQUFMLEdBQVksQ0FBOUMsQ0FBbkI7QUFDQSxZQUFJLGFBQWEsT0FBTSxFQUF2QjtBQUNBLFlBQUksT0FBTyxDQUFYO0FBQ0EsZUFBTyxPQUFPLFVBQWQsRUFBMEI7QUFDdEIsZ0JBQUksRUFBQyxFQUFELEtBQU8sTUFBTSxJQUFqQjtBQUNBLGdCQUFJLEtBQUssS0FBSyxVQUFkO0FBQ0Esb0JBQVEsRUFBUjtBQUNBLGlCQUFLLENBQUwsSUFBVSxLQUFLLEtBQUwsR0FBYSxDQUFiLEdBQWlCLEVBQTNCO0FBQ0EsaUJBQUssQ0FBTCxJQUFVLEtBQUssTUFBTCxHQUFjLENBQWQsR0FBa0IsRUFBNUI7QUFDSDtBQUNELFNBQUMsS0FBSyxDQUFOLEVBQVMsS0FBSyxDQUFkLElBQW1CLENBQUMsSUFBRCxFQUFPLElBQVAsQ0FBbkI7QUFDSDs7QUFFRCxXQUFPLElBQVAsRUFBYSxHQUFiLEVBQWtCO0FBQ2QsZ0JBQU8sS0FBSyxLQUFaO0FBQ0ksaUJBQUssT0FBTyxPQUFaO0FBQXFCO0FBQ2pCLHdCQUFJLFFBQVEsS0FBSyxLQUFMLEdBQWMsS0FBSyxjQUFMLENBQW9CLE1BQTlDO0FBQ0Esd0JBQUksRUFBQyxDQUFELEVBQUksQ0FBSixLQUFTLEtBQUssY0FBTCxDQUFvQixLQUFwQixDQUFiO0FBQ0Esd0JBQUksU0FBSixDQUNJLEtBQUssV0FEVCxFQUVJLENBRkosRUFFTyxDQUZQLEVBRVUsS0FBSyxLQUZmLEVBRXNCLEtBQUssTUFGM0IsRUFHSSxLQUFLLENBSFQsRUFHWSxLQUFLLENBSGpCLEVBR29CLEtBQUssS0FIekIsRUFHZ0MsS0FBSyxNQUhyQztBQUtBLHdCQUFJLEtBQUssS0FBTCxLQUFlLEtBQUssY0FBTCxDQUFvQixNQUF2QyxFQUErQztBQUMzQyw2QkFBSyxLQUFMLEdBQWEsQ0FBYjtBQUNBLDZCQUFLLEtBQUwsR0FBYSxPQUFPLElBQXBCO0FBQ0g7QUFDRDtBQUNIOztBQUVELGlCQUFLLE9BQU8sSUFBWjtBQUFrQjtBQUNkLHdCQUFJLFdBQVcsWUFBWCxFQUFKLEVBQStCO0FBQzNCLDZCQUFLLEtBQUwsR0FBYSxDQUFiO0FBQ0EsNkJBQUssS0FBTCxHQUFhLE9BQU8sT0FBcEI7QUFDSDtBQUNEO0FBQ0Esd0JBQUksUUFBUSxLQUFLLEdBQUwsQ0FBUyxLQUFLLEtBQUwsSUFBYyxLQUFLLGNBQUwsQ0FBb0IsTUFBcEIsR0FBNkIsRUFBM0MsQ0FBVCxFQUF5RCxLQUFLLGNBQUwsQ0FBb0IsTUFBN0UsQ0FBWjtBQUNBLDRCQUFRLFFBQVEsS0FBSyxjQUFMLENBQW9CLE1BQXBDO0FBQ0Esd0JBQUksRUFBQyxDQUFELEVBQUksQ0FBSixLQUFTLEtBQUssY0FBTCxDQUFvQixLQUFwQixDQUFiO0FBQ0Esd0JBQUksU0FBSjtBQUNJO0FBQ0EseUJBQUssV0FGVDtBQUdJO0FBQ0EscUJBSkosRUFJTyxDQUpQLEVBSVUsS0FBSyxLQUpmLEVBSXNCLEtBQUssTUFKM0I7QUFLSTtBQUNBLHlCQUFLLENBTlQsRUFNWSxLQUFLLENBTmpCLEVBTW9CLEtBQUssS0FOekIsRUFNZ0MsS0FBSyxNQU5yQztBQVFBO0FBQ0E7QUFDSDtBQW5DTDtBQXFDSDtBQTNHZTtRQUFQLE0sR0FBQSxNIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG4vLyBpbXBvcnQgXCJiYWJlbC1wb2x5ZmlsbFwiO1xuaW1wb3J0IHtHYW1lfSBmcm9tIFwiLi9nYW1lLmpzXCI7XG5pbXBvcnQge1BsYXllcn0gZnJvbSBcIi4vcGxheWVyLmpzXCI7XG5cbnZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NyZWVuJyk7XG52YXIgZ2FtZSA9IG5ldyBHYW1lKGNhbnZhcywgdXBkYXRlLCByZW5kZXIpO1xudmFyIHBsYXllciA9IG5ldyBQbGF5ZXIoe3g6IDAsIHk6IDI0MH0pXG5cbnZhciBtYXN0ZXJMb29wID0gZnVuY3Rpb24odGltZXN0YW1wKSB7XG4gICAgZ2FtZS5sb29wKHRpbWVzdGFtcCk7XG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtYXN0ZXJMb29wKTtcbn1cbm1hc3Rlckxvb3AocGVyZm9ybWFuY2Uubm93KCkpO1xuXG5mdW5jdGlvbiB1cGRhdGUoZWxhcHNlZFRpbWUpIHtcbiAgICBwbGF5ZXIudXBkYXRlKGVsYXBzZWRUaW1lKTtcbiAgICAvLyBUT0RPOiBVcGRhdGUgdGhlIGdhbWUgb2JqZWN0c1xufVxuXG5mdW5jdGlvbiByZW5kZXIoZWxhcHNlZFRpbWUsIGN0eCkge1xuICAgIGN0eC5maWxsU3R5bGUgPSBcImxpZ2h0Ymx1ZVwiO1xuICAgIGN0eC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICAgIHBsYXllci5yZW5kZXIoZWxhcHNlZFRpbWUsIGN0eCk7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0IGNsYXNzIENvbnRyb2xsZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmlucHV0ID0ge1xuICAgICAgICAgICAgdXA6IGZhbHNlLFxuICAgICAgICAgICAgZG93bjogZmFsc2UsXG4gICAgICAgICAgICByaWdodDogZmFsc2UsXG4gICAgICAgICAgICBsZWZ0OiBmYWxzZSxcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlzQW55UHJlc3NlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQudXAgfFxuICAgICAgICAgICAgdGhpcy5pbnB1dC5kb3duIHxcbiAgICAgICAgICAgIHRoaXMuaW5wdXQucmlnaHQgfFxuICAgICAgICAgICAgdGhpcy5pbnB1dC5sZWZ0O1xuICAgIH1cblxuICAgIGF0dGFjaCgpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCBwcmV2ZW50RGVmYXVsdCA9IGZhbHNlXG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDM4OiBjYXNlIDg3OiAvLyBVcFxuICAgICAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC51cCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlIDM3OiBjYXNlIDY1OiAvL0xlZnRcbiAgICAgICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQubGVmdCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlIDM5OiBjYXNlIDY4OiAvLyBSaWdodFxuICAgICAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5yaWdodCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlIDQwOiBjYXNlIDgzOiAvLyBEb3duXG4gICAgICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LmRvd24gPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAzODogY2FzZSA4NzogLy8gVXBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC51cCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSAzNzogY2FzZSA2NTogLy9MZWZ0XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQubGVmdCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSAzOTogY2FzZSA2ODogLy8gUmlnaHRcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5yaWdodCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSA0MDogY2FzZSA4MzogLy8gRG93blxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LmRvd24gPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuXG5leHBvcnQgY2xhc3MgR2FtZSB7XG4gICAgY29uc3RydWN0b3Ioc2NyZWVuLCB1cGRhdGVGdW5jdGlvbiwgcmVuZGVyRnVuY3Rpb24pIHtcblxuICAgICAgICB0aGlzLnVwZGF0ZSA9IHVwZGF0ZUZ1bmN0aW9uO1xuICAgICAgICB0aGlzLnJlbmRlciA9IHJlbmRlckZ1bmN0aW9uO1xuXG4gICAgICAgIC8vIFNldCB1cCBidWZmZXJzXG4gICAgICAgIHRoaXMuZnJvbnRCdWZmZXIgPSBzY3JlZW47XG4gICAgICAgIHRoaXMuZnJvbnRDdHggPSBzY3JlZW4uZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgdGhpcy5iYWNrQnVmZmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIHRoaXMuYmFja0J1ZmZlci53aWR0aCA9IHNjcmVlbi53aWR0aDtcbiAgICAgICAgdGhpcy5iYWNrQnVmZmVyLmhlaWdodCA9IHNjcmVlbi5oZWlnaHQ7XG4gICAgICAgIHRoaXMuYmFja0N0eCA9IHRoaXMuYmFja0J1ZmZlci5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIC8vIFN0YXJ0IHRoZSBnYW1lIGxvb3BcbiAgICAgICAgdGhpcy5vbGRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIHRoaXMucGF1c2VkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcGF1c2UoZmxhZykge1xuICAgICAgICB0aGlzLnBhdXNlZCA9IChmbGFnID09IHRydWUpO1xuICAgIH1cblxuICAgIGxvb3AobmV3VGltZSkge1xuICAgICAgICB2YXIgZ2FtZSA9IHRoaXM7XG4gICAgICAgIHZhciBlbGFwc2VkVGltZSA9IG5ld1RpbWUgLSB0aGlzLm9sZFRpbWU7XG4gICAgICAgIHRoaXMub2xkVGltZSA9IG5ld1RpbWU7XG5cbiAgICAgICAgaWYoIXRoaXMucGF1c2VkKSB0aGlzLnVwZGF0ZShlbGFwc2VkVGltZSk7XG4gICAgICAgIHRoaXMucmVuZGVyKGVsYXBzZWRUaW1lLCB0aGlzLmZyb250Q3R4KTtcblxuICAgICAgICAvLyBGbGlwIHRoZSBiYWNrIGJ1ZmZlclxuICAgICAgICB0aGlzLmZyb250Q3R4LmRyYXdJbWFnZSh0aGlzLmJhY2tCdWZmZXIsIDAsIDApO1xuICAgIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQge0NvbnRyb2xsZXJ9IGZyb20gXCIuL2NvbW1vbi5qc1wiO1xuXG5jb25zdCBNU19QRVJfRlJBTUUgPSAxMDAwLzE2O1xuXG5jb25zdCBTVEFURVMgPSB7XG4gICAgaWRsZTogU3ltYm9sKCksXG4gICAgd2Fsa2luZzogU3ltYm9sKCksXG4gICAgYmxpbmtpbmc6IFN5bWJvbCgpLFxuICAgIGp1bXBpbmc6IFN5bWJvbCgpLFxufVxuXG5sZXQgY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKCk7XG5jb250cm9sbGVyLmF0dGFjaCgpO1xuXG5leHBvcnQgY2xhc3MgUGxheWVyIHtcbiAgICBjb25zdHJ1Y3Rvcihwb3NpdGlvbikge1xuICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVTLmlkbGU7XG4gICAgICAgIHRoaXMuc3RhdGVGdW5jID0gdGhpcy5zdGF0ZUlkbGUuYmluZCh0aGlzKSgpO1xuICAgICAgICB0aGlzLnggPSBwb3NpdGlvbi54O1xuICAgICAgICB0aGlzLnkgPSBwb3NpdGlvbi55O1xuICAgICAgICB0aGlzLndpZHRoICA9IDY0O1xuICAgICAgICB0aGlzLmhlaWdodCA9IDY0O1xuICAgICAgICB0aGlzLnNwcml0ZXNoZWV0ICA9IG5ldyBJbWFnZSgpO1xuICAgICAgICB0aGlzLnNwcml0ZXNoZWV0LnNyYyA9IGVuY29kZVVSSSgnYXNzZXRzL1BsYXllclNwcml0ZTIucG5nJyk7XG4gICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICAgICAgdGhpcy5zaXR0aW5nU3ByaXRlcyA9IFt7eDogNjQqMywgeTogNjR9LCB7eDogNjQqMCwgeTogNjR9LCB7eDogNjQqMSwgeTogNjR9LCB7eDogNjQqMiwgeTogNjR9LCB7eDogNjQqMSwgeTogNjR9LCB7eDogNjQqMCwgeTogNjR9XTtcbiAgICAgICAgdGhpcy5qdW1waW5nU3ByaXRlcyA9IFt7eDogNjQqMywgeTogMH0sIHt4OiA2NCoyLCB5OiAwfSwge3g6IDY0KjEsIHk6IDB9LCB7eDogNjQqMCwgeTogMH0sIHt4OiA2NCoxLCB5OiAwfSwge3g6IDY0KjIsIHk6IDB9LCB7eDogNjQqMywgeTogMH1dO1xuICAgIH1cblxuICAgIHVwZGF0ZSh0aW1lKSB7XG4gICAgICAgIHRoaXMudGltZXIgKz0gdGltZTtcbiAgICAgICAgbGV0IG5ld0ZyYW1lID0gZmFsc2U7XG4gICAgICAgIGlmKHRoaXMudGltZXIgPiBNU19QRVJfRlJBTUUpIHtcbiAgICAgICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGN1ciA9IHRoaXMuc3RhdGVGdW5jLm5leHQoe2R0OiB0aW1lfSk7XG4gICAgICAgIGlmIChjdXIuZG9uZSkge1xuICAgICAgICAgICB0aGlzLnN0YXRlRnVuYyA9IHRoaXMuc3RhdGVJZGxlLmJpbmQodGhpcykoKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXIudmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGVGdW5jID0gY3VyLnZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgKnN0YXRlSWRsZSgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGxldCB7ZHR9ID0geWllbGQgbnVsbDtcblxuICAgICAgICAgICAgaWYgKGNvbnRyb2xsZXIuaXNBbnlQcmVzc2VkKCkpIHtcbiAgICAgICAgICAgICAgICBsZXQgaCA9IHt4OiAwLCB5OiAwfTtcbiAgICAgICAgICAgICAgICBpZiAoY29udHJvbGxlci5pbnB1dC5yaWdodCkge1xuICAgICAgICAgICAgICAgICAgICBoLnggPSAxO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29udHJvbGxlci5pbnB1dC5sZWZ0KSB7XG4gICAgICAgICAgICAgICAgICAgIGgueCA9IC0xO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29udHJvbGxlci5pbnB1dC51cCkge1xuICAgICAgICAgICAgICAgICAgICBoLnkgPSAtMTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvbnRyb2xsZXIuaW5wdXQuZG93bikge1xuICAgICAgICAgICAgICAgICAgICBoLnkgPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlRnVuYyA9IHRoaXMuc3RhdGVKdW1waW5nLmJpbmQodGhpcykoaCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAqc3RhdGVKdW1waW5nKGhlYWRpbmcpIHtcbiAgICAgICAgbGV0IHt4LCB5fSA9IGhlYWRpbmc7XG4gICAgICAgIGxldCBbZW5kWCwgZW5kWV0gPSBbdGhpcy54ICsgdGhpcy5oZWlnaHQqeCwgdGhpcy55ICsgdGhpcy5oZWlnaHQqeV07XG4gICAgICAgIGxldCB0aW1lVG9UYWtlID0gMTAwMC8gMTg7XG4gICAgICAgIGxldCB0aW1lID0gMDtcbiAgICAgICAgd2hpbGUgKHRpbWUgPCB0aW1lVG9UYWtlKSB7XG4gICAgICAgICAgICBsZXQge2R0fSA9IHlpZWxkIG51bGw7XG4gICAgICAgICAgICBsZXQgZGQgPSBkdCAvIHRpbWVUb1Rha2U7XG4gICAgICAgICAgICB0aW1lICs9IGR0O1xuICAgICAgICAgICAgdGhpcy54ICs9IHRoaXMud2lkdGggKiB4ICogZGQ7XG4gICAgICAgICAgICB0aGlzLnkgKz0gdGhpcy5oZWlnaHQgKiB5ICogZGQ7XG4gICAgICAgIH1cbiAgICAgICAgW3RoaXMueCwgdGhpcy55XSA9IFtlbmRYLCBlbmRZXTtcbiAgICB9XG5cbiAgICByZW5kZXIodGltZSwgY3R4KSB7XG4gICAgICAgIHN3aXRjaCh0aGlzLnN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlIFNUQVRFUy5qdW1waW5nOiB7XG4gICAgICAgICAgICAgICAgbGV0IGZyYW1lID0gdGhpcy5mcmFtZSAlICh0aGlzLmp1bXBpbmdTcHJpdGVzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgbGV0IHt4LCB5fSA9IHRoaXMuanVtcGluZ1Nwcml0ZXNbZnJhbWVdO1xuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlc2hlZXQsXG4gICAgICAgICAgICAgICAgICAgIHgsIHksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZyYW1lID09PSB0aGlzLmp1bXBpbmdTcHJpdGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFNUQVRFUy5pZGxlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FzZSBTVEFURVMuaWRsZToge1xuICAgICAgICAgICAgICAgIGlmIChjb250cm9sbGVyLmlzQW55UHJlc3NlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZnJhbWUgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVTLmp1bXBpbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGhhbmRsZSBibGlua2luZ1xuICAgICAgICAgICAgICAgIGxldCBmcmFtZSA9IE1hdGgubWluKHRoaXMuZnJhbWUgJSAodGhpcy5zaXR0aW5nU3ByaXRlcy5sZW5ndGggKyAyMCksIHRoaXMuc2l0dGluZ1Nwcml0ZXMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBmcmFtZSA9IGZyYW1lICUgdGhpcy5zaXR0aW5nU3ByaXRlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgbGV0IHt4LCB5fSA9IHRoaXMuc2l0dGluZ1Nwcml0ZXNbZnJhbWVdO1xuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICAgICAgICAgIC8vIGltYWdlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlc2hlZXQsXG4gICAgICAgICAgICAgICAgICAgIC8vIHNvdXJjZSByZWN0YW5nbGVcbiAgICAgICAgICAgICAgICAgICAgeCwgeSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIC8vIGRlc3RpbmF0aW9uIHJlY3RhbmdsZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IEltcGxlbWVudCB5b3VyIHBsYXllcidzIHJlZGVyaW5nIGFjY29yZGluZyB0byBzdGF0ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl19
