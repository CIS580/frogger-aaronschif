(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _game = require("./game.js");

var _player = require("./player.js");

var _car = require("./car.js");

var canvas = document.getElementById('screen');
var game = new _game.Game(canvas, update, render);
var player = new _player.Player({ x: 0, y: 240 });
let car = new _car.Car();

var masterLoop = function (timestamp) {
    game.loop(timestamp);
    window.requestAnimationFrame(masterLoop);
};
masterLoop(performance.now());

function update(elapsedTime) {
    player.update(elapsedTime);
    car.update(elapsedTime);
    // TODO: Update the game objects
}

function render(elapsedTime, ctx) {
    ctx.fillStyle = "lightblue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.render(elapsedTime, ctx);
    car.render(elapsedTime, ctx);
}

},{"./car.js":2,"./game.js":4,"./player.js":5}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
class Actor {
    constructor() {
        this.baseControlState = null;
        this.baseRenderState = null;
        this.controlState = null;
        this.renderState = null;

        this.x = 0;
        this.y = 0;
        this.width = 64;
        this.height = 64;
    }

    getHitBoxes() {
        return [];
    }

    update(dt) {
        let cur = this.controlState.next({ dt: dt });
        if (cur.done) {
            this.controlState = this.baseControlState.bind(this)();
        } else if (cur.value !== null) {
            this.controlState = cur.value;
        }
    }

    render(dt, ctx) {
        let cur = this.renderState.next({ dt: dt, ctx: ctx });
        if (cur.done) {
            this.renderState = this.baseRenderState.bind(this)();
        } else if (cur.value !== null) {
            this.renderState = cur.value;
        }
    }
}

exports.Actor = Actor;
class Car extends Actor {
    constructor() {
        super();
        this.controlState = this.controlDrive.bind(this)();
        this.renderState = this.renderDrive.bind(this)();
    }

    *controlDrive() {
        while (true) {
            let { dt } = yield null;
            this.y += 1;
        }
    }

    *renderDrive(ctx) {
        while (true) {
            let { dt, ctx } = yield null;
            ctx.fillStyle = "rgb(200,0,0)";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}
exports.Car = Car;

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{"./common.js":3}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2Nhci5qcyIsInNyYy9jb21tb24uanMiLCJzcmMvZ2FtZS5qcyIsInNyYy9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFFQSxJQUFJLFNBQVMsU0FBUyxjQUFULENBQXdCLFFBQXhCLENBQWI7QUFDQSxJQUFJLE9BQU8sZUFBUyxNQUFULEVBQWlCLE1BQWpCLEVBQXlCLE1BQXpCLENBQVg7QUFDQSxJQUFJLFNBQVMsbUJBQVcsRUFBQyxHQUFHLENBQUosRUFBTyxHQUFHLEdBQVYsRUFBWCxDQUFiO0FBQ0EsSUFBSSxNQUFNLGNBQVY7O0FBRUEsSUFBSSxhQUFhLFVBQVMsU0FBVCxFQUFvQjtBQUNqQyxTQUFLLElBQUwsQ0FBVSxTQUFWO0FBQ0EsV0FBTyxxQkFBUCxDQUE2QixVQUE3QjtBQUNILENBSEQ7QUFJQSxXQUFXLFlBQVksR0FBWixFQUFYOztBQUVBLFNBQVMsTUFBVCxDQUFnQixXQUFoQixFQUE2QjtBQUN6QixXQUFPLE1BQVAsQ0FBYyxXQUFkO0FBQ0EsUUFBSSxNQUFKLENBQVcsV0FBWDtBQUNBO0FBQ0g7O0FBRUQsU0FBUyxNQUFULENBQWdCLFdBQWhCLEVBQTZCLEdBQTdCLEVBQWtDO0FBQzlCLFFBQUksU0FBSixHQUFnQixXQUFoQjtBQUNBLFFBQUksUUFBSixDQUFhLENBQWIsRUFBZ0IsQ0FBaEIsRUFBbUIsT0FBTyxLQUExQixFQUFpQyxPQUFPLE1BQXhDO0FBQ0EsV0FBTyxNQUFQLENBQWMsV0FBZCxFQUEyQixHQUEzQjtBQUNBLFFBQUksTUFBSixDQUFXLFdBQVgsRUFBd0IsR0FBeEI7QUFDSDs7O0FDNUJEOzs7OztBQUVPLE1BQU0sS0FBTixDQUFZO0FBQ2Ysa0JBQWM7QUFDVixhQUFLLGdCQUFMLEdBQXdCLElBQXhCO0FBQ0EsYUFBSyxlQUFMLEdBQXVCLElB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IGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHtHYW1lfSBmcm9tIFwiLi9nYW1lLmpzXCI7XG5pbXBvcnQge1BsYXllcn0gZnJvbSBcIi4vcGxheWVyLmpzXCI7XG5pbXBvcnQge0Nhcn0gZnJvbSBcIi4vY2FyLmpzXCI7XG5cbnZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NyZWVuJyk7XG52YXIgZ2FtZSA9IG5ldyBHYW1lKGNhbnZhcywgdXBkYXRlLCByZW5kZXIpO1xudmFyIHBsYXllciA9IG5ldyBQbGF5ZXIoe3g6IDAsIHk6IDI0MH0pXG5sZXQgY2FyID0gbmV3IENhcigpO1xuXG52YXIgbWFzdGVyTG9vcCA9IGZ1bmN0aW9uKHRpbWVzdGFtcCkge1xuICAgIGdhbWUubG9vcCh0aW1lc3RhbXApO1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobWFzdGVyTG9vcCk7XG59XG5tYXN0ZXJMb29wKHBlcmZvcm1hbmNlLm5vdygpKTtcblxuZnVuY3Rpb24gdXBkYXRlKGVsYXBzZWRUaW1lKSB7XG4gICAgcGxheWVyLnVwZGF0ZShlbGFwc2VkVGltZSk7XG4gICAgY2FyLnVwZGF0ZShlbGFwc2VkVGltZSk7XG4gICAgLy8gVE9ETzogVXBkYXRlIHRoZSBnYW1lIG9iamVjdHNcbn1cblxuZnVuY3Rpb24gcmVuZGVyKGVsYXBzZWRUaW1lLCBjdHgpIHtcbiAgICBjdHguZmlsbFN0eWxlID0gXCJsaWdodGJsdWVcIjtcbiAgICBjdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICBwbGF5ZXIucmVuZGVyKGVsYXBzZWRUaW1lLCBjdHgpO1xuICAgIGNhci5yZW5kZXIoZWxhcHNlZFRpbWUsIGN0eClcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnQgY2xhc3MgQWN0b3Ige1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmJhc2VDb250cm9sU3RhdGUgPSBudWxsO1xuICAgICAgICB0aGlzLmJhc2VSZW5kZXJTdGF0ZSA9IG51bGw7XG4gICAgICAgIHRoaXMuY29udHJvbFN0YXRlID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZW5kZXJTdGF0ZSA9IG51bGw7XG5cbiAgICAgICAgdGhpcy54ID0gMDtcbiAgICAgICAgdGhpcy55ID0gMDtcbiAgICAgICAgdGhpcy53aWR0aCA9IDY0O1xuICAgICAgICB0aGlzLmhlaWdodCA9IDY0O1xuICAgIH1cblxuICAgIGdldEhpdEJveGVzKCkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgdXBkYXRlKGR0KSB7XG4gICAgICAgIGxldCBjdXIgPSB0aGlzLmNvbnRyb2xTdGF0ZS5uZXh0KHtkdDogZHR9KTtcbiAgICAgICAgaWYgKGN1ci5kb25lKSB7XG4gICAgICAgICAgIHRoaXMuY29udHJvbFN0YXRlID0gdGhpcy5iYXNlQ29udHJvbFN0YXRlLmJpbmQodGhpcykoKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXIudmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuY29udHJvbFN0YXRlID0gY3VyLnZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKGR0LCBjdHgpIHtcbiAgICAgICAgbGV0IGN1ciA9IHRoaXMucmVuZGVyU3RhdGUubmV4dCh7ZHQ6IGR0LCBjdHg6IGN0eH0pO1xuICAgICAgICBpZiAoY3VyLmRvbmUpIHtcbiAgICAgICAgICAgdGhpcy5yZW5kZXJTdGF0ZSA9IHRoaXMuYmFzZVJlbmRlclN0YXRlLmJpbmQodGhpcykoKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXIudmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyU3RhdGUgPSBjdXIudmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDYXIgZXh0ZW5kcyBBY3RvciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKClcbiAgICAgICAgdGhpcy5jb250cm9sU3RhdGUgPSB0aGlzLmNvbnRyb2xEcml2ZS5iaW5kKHRoaXMpKCk7XG4gICAgICAgIHRoaXMucmVuZGVyU3RhdGUgPSB0aGlzLnJlbmRlckRyaXZlLmJpbmQodGhpcykoKTtcbiAgICB9XG5cbiAgICAqY29udHJvbERyaXZlKCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgbGV0IHtkdH09IHlpZWxkIG51bGw7XG4gICAgICAgICAgICB0aGlzLnkgKz0gMTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICpyZW5kZXJEcml2ZShjdHgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGxldCB7ZHQsIGN0eH0gPSB5aWVsZCBudWxsO1xuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiKDIwMCwwLDApXCI7XG4gICAgICAgICAgICBjdHguZmlsbFJlY3QodGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnQgY2xhc3MgQ29udHJvbGxlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuaW5wdXQgPSB7XG4gICAgICAgICAgICB1cDogZmFsc2UsXG4gICAgICAgICAgICBkb3duOiBmYWxzZSxcbiAgICAgICAgICAgIHJpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgIGxlZnQ6IGZhbHNlLFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaXNBbnlQcmVzc2VkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC51cCB8XG4gICAgICAgICAgICB0aGlzLmlucHV0LmRvd24gfFxuICAgICAgICAgICAgdGhpcy5pbnB1dC5yaWdodCB8XG4gICAgICAgICAgICB0aGlzLmlucHV0LmxlZnQ7XG4gICAgfVxuXG4gICAgYXR0YWNoKCkge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IHByZXZlbnREZWZhdWx0ID0gZmFsc2VcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMzg6IGNhc2UgODc6IC8vIFVwXG4gICAgICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LnVwID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgMzc6IGNhc2UgNjU6IC8vTGVmdFxuICAgICAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5sZWZ0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgMzk6IGNhc2UgNjg6IC8vIFJpZ2h0XG4gICAgICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LnJpZ2h0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgNDA6IGNhc2UgODM6IC8vIERvd25cbiAgICAgICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQuZG93biA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDM4OiBjYXNlIDg3OiAvLyBVcFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LnVwID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlIDM3OiBjYXNlIDY1OiAvL0xlZnRcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5sZWZ0ID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlIDM5OiBjYXNlIDY4OiAvLyBSaWdodFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LnJpZ2h0ID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlIDQwOiBjYXNlIDgzOiAvLyBEb3duXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQuZG93biA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5cbmV4cG9ydCBjbGFzcyBHYW1lIHtcbiAgICBjb25zdHJ1Y3RvcihzY3JlZW4sIHVwZGF0ZUZ1bmN0aW9uLCByZW5kZXJGdW5jdGlvbikge1xuXG4gICAgICAgIHRoaXMudXBkYXRlID0gdXBkYXRlRnVuY3Rpb247XG4gICAgICAgIHRoaXMucmVuZGVyID0gcmVuZGVyRnVuY3Rpb247XG5cbiAgICAgICAgLy8gU2V0IHVwIGJ1ZmZlcnNcbiAgICAgICAgdGhpcy5mcm9udEJ1ZmZlciA9IHNjcmVlbjtcbiAgICAgICAgdGhpcy5mcm9udEN0eCA9IHNjcmVlbi5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICB0aGlzLmJhY2tCdWZmZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgdGhpcy5iYWNrQnVmZmVyLndpZHRoID0gc2NyZWVuLndpZHRoO1xuICAgICAgICB0aGlzLmJhY2tCdWZmZXIuaGVpZ2h0ID0gc2NyZWVuLmhlaWdodDtcbiAgICAgICAgdGhpcy5iYWNrQ3R4ID0gdGhpcy5iYWNrQnVmZmVyLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgLy8gU3RhcnQgdGhlIGdhbWUgbG9vcFxuICAgICAgICB0aGlzLm9sZFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwYXVzZShmbGFnKSB7XG4gICAgICAgIHRoaXMucGF1c2VkID0gKGZsYWcgPT0gdHJ1ZSk7XG4gICAgfVxuXG4gICAgbG9vcChuZXdUaW1lKSB7XG4gICAgICAgIHZhciBnYW1lID0gdGhpcztcbiAgICAgICAgdmFyIGVsYXBzZWRUaW1lID0gbmV3VGltZSAtIHRoaXMub2xkVGltZTtcbiAgICAgICAgdGhpcy5vbGRUaW1lID0gbmV3VGltZTtcblxuICAgICAgICBpZighdGhpcy5wYXVzZWQpIHRoaXMudXBkYXRlKGVsYXBzZWRUaW1lKTtcbiAgICAgICAgdGhpcy5yZW5kZXIoZWxhcHNlZFRpbWUsIHRoaXMuZnJvbnRDdHgpO1xuXG4gICAgICAgIC8vIEZsaXAgdGhlIGJhY2sgYnVmZmVyXG4gICAgICAgIHRoaXMuZnJvbnRDdHguZHJhd0ltYWdlKHRoaXMuYmFja0J1ZmZlciwgMCwgMCk7XG4gICAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB7Q29udHJvbGxlcn0gZnJvbSBcIi4vY29tbW9uLmpzXCI7XG5cbmNvbnN0IE1TX1BFUl9GUkFNRSA9IDEwMDAvMTY7XG5cbmNvbnN0IFNUQVRFUyA9IHtcbiAgICBpZGxlOiBTeW1ib2woKSxcbiAgICB3YWxraW5nOiBTeW1ib2woKSxcbiAgICBibGlua2luZzogU3ltYm9sKCksXG4gICAganVtcGluZzogU3ltYm9sKCksXG59XG5cbmxldCBjb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIoKTtcbmNvbnRyb2xsZXIuYXR0YWNoKCk7XG5cbmV4cG9ydCBjbGFzcyBQbGF5ZXIge1xuICAgIGNvbnN0cnVjdG9yKHBvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBTVEFURVMuaWRsZTtcbiAgICAgICAgdGhpcy5zdGF0ZUZ1bmMgPSB0aGlzLnN0YXRlSWRsZS5iaW5kKHRoaXMpKCk7XG4gICAgICAgIHRoaXMueCA9IHBvc2l0aW9uLng7XG4gICAgICAgIHRoaXMueSA9IHBvc2l0aW9uLnk7XG4gICAgICAgIHRoaXMud2lkdGggID0gNjQ7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gNjQ7XG4gICAgICAgIHRoaXMuc3ByaXRlc2hlZXQgID0gbmV3IEltYWdlKCk7XG4gICAgICAgIHRoaXMuc3ByaXRlc2hlZXQuc3JjID0gZW5jb2RlVVJJKCdhc3NldHMvUGxheWVyU3ByaXRlMi5wbmcnKTtcbiAgICAgICAgdGhpcy50aW1lciA9IDA7XG4gICAgICAgIHRoaXMuZnJhbWUgPSAwO1xuICAgICAgICB0aGlzLnNpdHRpbmdTcHJpdGVzID0gW3t4OiA2NCozLCB5OiA2NH0sIHt4OiA2NCowLCB5OiA2NH0sIHt4OiA2NCoxLCB5OiA2NH0sIHt4OiA2NCoyLCB5OiA2NH0sIHt4OiA2NCoxLCB5OiA2NH0sIHt4OiA2NCowLCB5OiA2NH1dO1xuICAgICAgICB0aGlzLmp1bXBpbmdTcHJpdGVzID0gW3t4OiA2NCozLCB5OiAwfSwge3g6IDY0KjIsIHk6IDB9LCB7eDogNjQqMSwgeTogMH0sIHt4OiA2NCowLCB5OiAwfSwge3g6IDY0KjEsIHk6IDB9LCB7eDogNjQqMiwgeTogMH0sIHt4OiA2NCozLCB5OiAwfV07XG4gICAgfVxuXG4gICAgdXBkYXRlKHRpbWUpIHtcbiAgICAgICAgdGhpcy50aW1lciArPSB0aW1lO1xuICAgICAgICBsZXQgbmV3RnJhbWUgPSBmYWxzZTtcbiAgICAgICAgaWYodGhpcy50aW1lciA+IE1TX1BFUl9GUkFNRSkge1xuICAgICAgICAgICAgdGhpcy50aW1lciA9IDA7XG4gICAgICAgICAgICB0aGlzLmZyYW1lKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY3VyID0gdGhpcy5zdGF0ZUZ1bmMubmV4dCh7ZHQ6IHRpbWV9KTtcbiAgICAgICAgaWYgKGN1ci5kb25lKSB7XG4gICAgICAgICAgIHRoaXMuc3RhdGVGdW5jID0gdGhpcy5zdGF0ZUlkbGUuYmluZCh0aGlzKSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1ci52YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZUZ1bmMgPSBjdXIudmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAqc3RhdGVJZGxlKCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgbGV0IHtkdH0gPSB5aWVsZCBudWxsO1xuXG4gICAgICAgICAgICBpZiAoY29udHJvbGxlci5pc0FueVByZXNzZWQoKSkge1xuICAgICAgICAgICAgICAgIGxldCBoID0ge3g6IDAsIHk6IDB9O1xuICAgICAgICAgICAgICAgIGlmIChjb250cm9sbGVyLmlucHV0LnJpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIGgueCA9IDE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb250cm9sbGVyLmlucHV0LmxlZnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaC54ID0gLTE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb250cm9sbGVyLmlucHV0LnVwKSB7XG4gICAgICAgICAgICAgICAgICAgIGgueSA9IC0xO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29udHJvbGxlci5pbnB1dC5kb3duKSB7XG4gICAgICAgICAgICAgICAgICAgIGgueSA9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGVGdW5jID0gdGhpcy5zdGF0ZUp1bXBpbmcuYmluZCh0aGlzKShoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgICpzdGF0ZUp1bXBpbmcoaGVhZGluZykge1xuICAgICAgICBsZXQge3gsIHl9ID0gaGVhZGluZztcbiAgICAgICAgbGV0IFtlbmRYLCBlbmRZXSA9IFt0aGlzLnggKyB0aGlzLmhlaWdodCp4LCB0aGlzLnkgKyB0aGlzLmhlaWdodCp5XTtcbiAgICAgICAgbGV0IHRpbWVUb1Rha2UgPSAxMDAwLyAxODtcbiAgICAgICAgbGV0IHRpbWUgPSAwO1xuICAgICAgICB3aGlsZSAodGltZSA8IHRpbWVUb1Rha2UpIHtcbiAgICAgICAgICAgIGxldCB7ZHR9ID0geWllbGQgbnVsbDtcbiAgICAgICAgICAgIGxldCBkZCA9IGR0IC8gdGltZVRvVGFrZTtcbiAgICAgICAgICAgIHRpbWUgKz0gZHQ7XG4gICAgICAgICAgICB0aGlzLnggKz0gdGhpcy53aWR0aCAqIHggKiBkZDtcbiAgICAgICAgICAgIHRoaXMueSArPSB0aGlzLmhlaWdodCAqIHkgKiBkZDtcbiAgICAgICAgfVxuICAgICAgICBbdGhpcy54LCB0aGlzLnldID0gW2VuZFgsIGVuZFldO1xuICAgIH1cblxuICAgIHJlbmRlcih0aW1lLCBjdHgpIHtcbiAgICAgICAgc3dpdGNoKHRoaXMuc3RhdGUpIHtcbiAgICAgICAgICAgIGNhc2UgU1RBVEVTLmp1bXBpbmc6IHtcbiAgICAgICAgICAgICAgICBsZXQgZnJhbWUgPSB0aGlzLmZyYW1lICUgKHRoaXMuanVtcGluZ1Nwcml0ZXMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBsZXQge3gsIHl9ID0gdGhpcy5qdW1waW5nU3ByaXRlc1tmcmFtZV07XG4gICAgICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVzaGVldCxcbiAgICAgICAgICAgICAgICAgICAgeCwgeSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZnJhbWUgPT09IHRoaXMuanVtcGluZ1Nwcml0ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZnJhbWUgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVTLmlkbGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYXNlIFNUQVRFUy5pZGxlOiB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRyb2xsZXIuaXNBbnlQcmVzc2VkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mcmFtZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBTVEFURVMuanVtcGluZztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gaGFuZGxlIGJsaW5raW5nXG4gICAgICAgICAgICAgICAgbGV0IGZyYW1lID0gTWF0aC5taW4odGhpcy5mcmFtZSAlICh0aGlzLnNpdHRpbmdTcHJpdGVzLmxlbmd0aCArIDIwKSwgdGhpcy5zaXR0aW5nU3ByaXRlcy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGZyYW1lID0gZnJhbWUgJSB0aGlzLnNpdHRpbmdTcHJpdGVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBsZXQge3gsIHl9ID0gdGhpcy5zaXR0aW5nU3ByaXRlc1tmcmFtZV07XG4gICAgICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShcbiAgICAgICAgICAgICAgICAgICAgLy8gaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVzaGVldCxcbiAgICAgICAgICAgICAgICAgICAgLy8gc291cmNlIHJlY3RhbmdsZVxuICAgICAgICAgICAgICAgICAgICB4LCB5LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgLy8gZGVzdGluYXRpb24gcmVjdGFuZ2xlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogSW1wbGVtZW50IHlvdXIgcGxheWVyJ3MgcmVkZXJpbmcgYWNjb3JkaW5nIHRvIHN0YXRlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=
