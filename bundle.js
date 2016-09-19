(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _game = require("./game.js");

var _player = require("./player.js");

var _car = require("./car.js");

var canvas = document.getElementById('screen');
let backdrop = new Image();
backdrop.src = encodeURI('assets/canvas.png');
var game = new _game.Game(canvas, update, render);
var player = new _player.Player({ x: 0, y: 256 });
let cars = [];
for (let i = 1; i < 11; i++) {
    cars.push(new _car.Car(canvas, { heading: Math.floor((i + 1) / 2) % 2 === 0 ? -1 : 1, x: 64 * i, y: -1112 }));
}

var masterLoop = function (timestamp) {
    game.loop(timestamp);
    window.requestAnimationFrame(masterLoop);
};
masterLoop(performance.now());

function update(elapsedTime) {
    player.update(elapsedTime);
    for (let car of cars) {
        car.update(elapsedTime);
    }
    // TODO: Update the game objects
}

function render(elapsedTime, ctx) {
    ctx.drawImage(backdrop, 0, 0);
    player.render(elapsedTime, ctx);
    for (let car of cars) {
        car.render(elapsedTime, ctx);
    }
}

},{"./car.js":2,"./game.js":5,"./player.js":6}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Car = undefined;

var _actor = require("./common/actor.js");

class Car extends _actor.Actor {
    constructor(world, args) {
        let { x, y, heading } = args;
        super(world);
        this.controlState = this.controlDrive.bind(this)();
        this.renderState = this.renderDrive.bind(this)();
        this.sprite = new Image();
        this.sprite.src = encodeURI('./assets/cars_mini.svg');
        this.width = 64;
        this.height = 112;
        this.x = x;
        this.y = y;
        this.heading = heading;
        this.speed = 1;
        this.spriteNum = 0;
        this.delay = 0;
        this.reInit();
    }

    collect() {
        if (this.y + this.height < 0 || this.x + this.width < 0 || this.x > this.world.width || this.y > this.world.height) {
            this.reInit();
            return true;
        }
    }

    *controlDrive() {
        this.reInit();
        let time = 0;
        while (true) {
            let { dt } = yield null;
            time += dt;
            if (time < this.delay) {
                continue;
            }
            this.y += this.heading * this.speed * 400 * dt / 1000;
            if (this.collect()) {
                if (this.heading === 1) {
                    this.y = 1 - this.height;
                } else {
                    this.y = this.world.height;
                }
                return this.controlDrive();
            }
        }
    }

    *renderDrive(ctx) {
        while (true) {
            let { dt, ctx } = yield null;
            ctx.save();
            if (this.heading === 1) {
                ctx.translate(this.x + this.width, this.y + this.height);
                ctx.rotate(Math.PI);
            } else {
                ctx.translate(this.x, this.y);
            }
            ctx.drawImage(this.sprite, 247 * this.spriteNum, 0, 200, 350, 0, 0, this.width, this.height);
            ctx.restore();
        }
    }

    reInit() {
        this.delay = 4 * Math.random() * 1000;
        // this.speed = .5 + Math.random() /4;
        this.speed = .25;
        this.spriteNum = Math.floor(Math.random() * 4);
    }
}
exports.Car = Car;

},{"./common/actor.js":3}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
class Actor {
    constructor(world) {
        this.baseControlState = null;
        this.baseRenderState = null;
        this.controlState = null;
        this.renderState = null;

        this.world = world;
        this.x = 0;
        this.y = 0;
        this.width = 64;
        this.height = 64;
    }

    getHitBoxes() {
        return [];
    }

    collect() {
        return false;
    }

    update(dt) {
        let cur = this.controlState.next({ dt: dt });
        if (cur.value !== null) {
            this.controlState = cur.value;
        } else if (cur.done) {
            this.controlState = this.baseControlState.bind(this)();
        }
    }

    render(dt, ctx) {
        let cur = this.renderState.next({ dt: dt, ctx: ctx });
        if (cur.value !== null) {
            this.renderState = cur.value;
        } else if (cur.done) {
            this.renderState = this.baseRenderState.bind(this)();
        }
    }
}
exports.Actor = Actor;

},{}],4:[function(require,module,exports){
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
        this.clear();
    }

    isAnyPressed() {
        return this.input.up | this.input.down | this.input.right | this.input.left;
    }

    clear() {
        this.savedInput = {
            up: false,
            down: false,
            right: false,
            left: false
        };
    }

    attach() {
        window.addEventListener('keydown', event => {
            let preventDefault = false;
            switch (event.keyCode) {
                case 38:case 87:
                    // Up
                    preventDefault = true;
                    this.input.up = true;
                    this.savedInput.up = true;
                    break;
                case 37:case 65:
                    //Left
                    preventDefault = true;
                    this.input.left = true;
                    this.savedInput.left = true;
                    break;
                case 39:case 68:
                    // Right
                    preventDefault = true;
                    this.input.right = true;
                    this.savedInput.right = true;
                    break;
                case 40:case 83:
                    // Down
                    preventDefault = true;
                    this.input.down = true;
                    this.savedInput.down = true;
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Player = undefined;

var _input = require("./common/input.js");

const MS_PER_FRAME = 1000 / 16;

const STATES = {
    idle: Symbol(),
    walking: Symbol(),
    blinking: Symbol(),
    jumping: Symbol()
};

let audioContext = new AudioContext();

let controller = new _input.Controller();
controller.attach();

let bong = document.createElement('audio');
bong.src = encodeURI('assets/bong.ogg');

let music = new Audio(encodeURI('assets/bgm_action_2.mp3'));
music.loop = true;
music.play();

(() => {
    var audioCtx = new window.AudioContext();
    window.audio = audioCtx;
    var gainNode = audioCtx.createGain();
    gainNode.gain.value = 1.0;
    gainNode.connect(audioCtx.destination);

    let bongSource = audioCtx.createMediaElementSource(bong);
    bongSource.connect(gainNode);

    let musicSource = audioCtx.createMediaElementSource(music);
    musicSource.connect(gainNode);
})();

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
        bong.play();
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
        bong.pause();
        bong.fastSeek(0);
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

},{"./common/input.js":4}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2Nhci5qcyIsInNyYy9jb21tb24vYWN0b3IuanMiLCJzcmMvY29tbW9uL2lucHV0LmpzIiwic3JjL2dhbWUuanMiLCJzcmMvcGxheWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBRUEsSUFBSSxTQUFTLFNBQVMsY0FBVCxDQUF3QixRQUF4QixDQUFiO0FBQ0EsSUFBSSxXQUFXLElBQUksS0FBSixFQUFmO0FBQ0EsU0FBUyxHQUFULEdBQWUsVUFBVSxtQkFBVixDQUFmO0FBQ0EsSUFBSSxPQUFPLGVBQVMsTUFBVCxFQUFpQixNQUFqQixFQUF5QixNQUF6QixDQUFYO0FBQ0EsSUFBSSxTQUFTLG1CQUFXLEVBQUMsR0FBRyxDQUFKLEVBQU8sR0FBRyxHQUFWLEVBQVgsQ0FBYjtBQUNBLElBQUksT0FBTyxFQUFYO0FBQ0EsS0FBSyxJQUFJLElBQUUsQ0FBWCxFQUFjLElBQUUsRUFBaEIsRUFBb0IsR0FBcEIsRUFBeUI7QUFDckIsU0FBSyxJQUFMLENBQVUsYUFBUSxNQUFSLEVBQWdCLEVBQUMsU0FBVSxLQUFLLEtBQUwsQ0FBVyxDQUFDLElBQUUsQ0FBSCxJQUFNLENBQWpCLElBQW9CLENBQXBCLEtBQXdCLENBQXhCLEdBQTBCLENBQUMsQ0FBM0IsR0FBNkIsQ0FBeEMsRUFBNEMsR0FBRyxLQUFHLENBQWxELEVBQXFELEdBQUcsQ0FBQyxJQUF6RCxFQUFoQixDQUFWO0FBQ0g7O0FBRUQsSUFBSSxhQUFhLFVBQVMsU0FBVCxFQUFvQjtBQUNqQyxTQUFLLElBQUwsQ0FBVSxTQUFWO0FBQ0EsV0FBTyxxQkFBUCxDQUE2QixVQUE3QjtBQUNILENBSEQ7QUFJQSxXQUFXLFlBQVksR0FBWixFQUFYOztBQUVBLFNBQVMsTUFBVCxDQUFnQixXQUFoQixFQUE2QjtBQUN6QixXQUFPLE1BQVAsQ0FBYyxXQUFk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cmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHtHYW1lfSBmcm9tIFwiLi9nYW1lLmpzXCI7XG5pbXBvcnQge1BsYXllcn0gZnJvbSBcIi4vcGxheWVyLmpzXCI7XG5pbXBvcnQge0Nhcn0gZnJvbSBcIi4vY2FyLmpzXCI7XG5cbnZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NyZWVuJyk7XG5sZXQgYmFja2Ryb3AgPSBuZXcgSW1hZ2UoKTtcbmJhY2tkcm9wLnNyYyA9IGVuY29kZVVSSSgnYXNzZXRzL2NhbnZhcy5wbmcnKTtcbnZhciBnYW1lID0gbmV3IEdhbWUoY2FudmFzLCB1cGRhdGUsIHJlbmRlcik7XG52YXIgcGxheWVyID0gbmV3IFBsYXllcih7eDogMCwgeTogMjU2fSlcbmxldCBjYXJzID0gW107XG5mb3IgKGxldCBpPTE7IGk8MTE7IGkrKykge1xuICAgIGNhcnMucHVzaChuZXcgQ2FyKGNhbnZhcywge2hlYWRpbmc6IChNYXRoLmZsb29yKChpKzEpLzIpJTI9PT0wPy0xOjEpLCB4OiA2NCppLCB5OiAtMTExMn0pKTtcbn1cblxudmFyIG1hc3Rlckxvb3AgPSBmdW5jdGlvbih0aW1lc3RhbXApIHtcbiAgICBnYW1lLmxvb3AodGltZXN0YW1wKTtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1hc3Rlckxvb3ApO1xufVxubWFzdGVyTG9vcChwZXJmb3JtYW5jZS5ub3coKSk7XG5cbmZ1bmN0aW9uIHVwZGF0ZShlbGFwc2VkVGltZSkge1xuICAgIHBsYXllci51cGRhdGUoZWxhcHNlZFRpbWUpO1xuICAgIGZvciAobGV0IGNhciBvZiBjYXJzKSB7XG4gICAgICAgIGNhci51cGRhdGUoZWxhcHNlZFRpbWUpO1xuICAgIH1cbiAgICAvLyBUT0RPOiBVcGRhdGUgdGhlIGdhbWUgb2JqZWN0c1xufVxuXG5mdW5jdGlvbiByZW5kZXIoZWxhcHNlZFRpbWUsIGN0eCkge1xuICAgIGN0eC5kcmF3SW1hZ2UoYmFja2Ryb3AsIDAsIDApO1xuICAgIHBsYXllci5yZW5kZXIoZWxhcHNlZFRpbWUsIGN0eCk7XG4gICAgZm9yIChsZXQgY2FyIG9mIGNhcnMpIHtcbiAgICAgICAgY2FyLnJlbmRlcihlbGFwc2VkVGltZSwgY3R4KVxuICAgIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQge0FjdG9yfSBmcm9tIFwiLi9jb21tb24vYWN0b3IuanNcIjtcblxuXG5leHBvcnQgY2xhc3MgQ2FyIGV4dGVuZHMgQWN0b3Ige1xuICAgIGNvbnN0cnVjdG9yKHdvcmxkLCBhcmdzKSB7XG4gICAgICAgIGxldCB7eCwgeSwgaGVhZGluZ30gPSBhcmdzO1xuICAgICAgICBzdXBlcih3b3JsZClcbiAgICAgICAgdGhpcy5jb250cm9sU3RhdGUgPSB0aGlzLmNvbnRyb2xEcml2ZS5iaW5kKHRoaXMpKCk7XG4gICAgICAgIHRoaXMucmVuZGVyU3RhdGUgPSB0aGlzLnJlbmRlckRyaXZlLmJpbmQodGhpcykoKTtcbiAgICAgICAgdGhpcy5zcHJpdGUgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgdGhpcy5zcHJpdGUuc3JjID0gZW5jb2RlVVJJKCcuL2Fzc2V0cy9jYXJzX21pbmkuc3ZnJyk7XG4gICAgICAgIHRoaXMud2lkdGggPSA2NDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSAxMTI7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHRoaXMuaGVhZGluZyA9IGhlYWRpbmc7XG4gICAgICAgIHRoaXMuc3BlZWQgPSAxO1xuICAgICAgICB0aGlzLnNwcml0ZU51bSA9IDA7XG4gICAgICAgIHRoaXMuZGVsYXkgPSAwO1xuICAgICAgICB0aGlzLnJlSW5pdCgpO1xuICAgIH1cblxuICAgIGNvbGxlY3QoKSB7XG4gICAgICAgIGlmICh0aGlzLnkrdGhpcy5oZWlnaHQgPCAwIHx8IHRoaXMueCt0aGlzLndpZHRoIDwgMCB8fFxuICAgICAgICAgICAgICAgIHRoaXMueCA+IHRoaXMud29ybGQud2lkdGggfHwgdGhpcy55ID4gdGhpcy53b3JsZC5oZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMucmVJbml0KCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICpjb250cm9sRHJpdmUoKSB7XG4gICAgICAgIHRoaXMucmVJbml0KCk7XG4gICAgICAgIGxldCB0aW1lID0gMDtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGxldCB7ZHR9PSB5aWVsZCBudWxsO1xuICAgICAgICAgICAgdGltZSArPSBkdDtcbiAgICAgICAgICAgIGlmICh0aW1lIDwgdGhpcy5kZWxheSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy55ICs9IHRoaXMuaGVhZGluZyAqIHRoaXMuc3BlZWQgKiA0MDAgKiBkdCAvIDEwMDA7XG4gICAgICAgICAgICBpZiAodGhpcy5jb2xsZWN0KCkpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5oZWFkaW5nID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMueSA9IDEtdGhpcy5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy55ID0gdGhpcy53b3JsZC5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnRyb2xEcml2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgKnJlbmRlckRyaXZlKGN0eCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgbGV0IHtkdCwgY3R4fSA9IHlpZWxkIG51bGw7XG4gICAgICAgICAgICBjdHguc2F2ZSgpXG4gICAgICAgICAgICBpZiAodGhpcy5oZWFkaW5nID09PSAxKSB7XG4gICAgICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSh0aGlzLngrdGhpcy53aWR0aCwgdGhpcy55K3RoaXMuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBjdHgucm90YXRlKE1hdGguUEkpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGN0eC50cmFuc2xhdGUodGhpcy54LCB0aGlzLnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZSxcbiAgICAgICAgICAgICAgICAyNDcqdGhpcy5zcHJpdGVOdW0sIDAsIDIwMCwgMzUwLFxuICAgICAgICAgICAgICAgIDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0XG4gICAgICAgICAgICApXG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZUluaXQoKSB7XG4gICAgICAgIHRoaXMuZGVsYXkgPSA0ICogTWF0aC5yYW5kb20oKSAqIDEwMDA7XG4gICAgICAgIC8vIHRoaXMuc3BlZWQgPSAuNSArIE1hdGgucmFuZG9tKCkgLzQ7XG4gICAgICAgIHRoaXMuc3BlZWQgPSAuMjVcbiAgICAgICAgdGhpcy5zcHJpdGVOdW0gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA0KTtcbiAgICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuXG5leHBvcnQgY2xhc3MgQWN0b3Ige1xuICAgIGNvbnN0cnVjdG9yKHdvcmxkKSB7XG4gICAgICAgIHRoaXMuYmFzZUNvbnRyb2xTdGF0ZSA9IG51bGw7XG4gICAgICAgIHRoaXMuYmFzZVJlbmRlclN0YXRlID0gbnVsbDtcbiAgICAgICAgdGhpcy5jb250cm9sU3RhdGUgPSBudWxsO1xuICAgICAgICB0aGlzLnJlbmRlclN0YXRlID0gbnVsbDtcblxuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XG4gICAgICAgIHRoaXMueCA9IDA7XG4gICAgICAgIHRoaXMueSA9IDA7XG4gICAgICAgIHRoaXMud2lkdGggPSA2NDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSA2NDtcbiAgICB9XG5cbiAgICBnZXRIaXRCb3hlcygpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbGxlY3QoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB1cGRhdGUoZHQpIHtcbiAgICAgICAgbGV0IGN1ciA9IHRoaXMuY29udHJvbFN0YXRlLm5leHQoe2R0OiBkdH0pO1xuICAgICAgICBpZiAoY3VyLnZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xTdGF0ZSA9IGN1ci52YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXIuZG9uZSkge1xuICAgICAgICAgICAgdGhpcy5jb250cm9sU3RhdGUgPSB0aGlzLmJhc2VDb250cm9sU3RhdGUuYmluZCh0aGlzKSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKGR0LCBjdHgpIHtcbiAgICAgICAgbGV0IGN1ciA9IHRoaXMucmVuZGVyU3RhdGUubmV4dCh7ZHQ6IGR0LCBjdHg6IGN0eH0pO1xuICAgICAgICBpZiAoY3VyLnZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlclN0YXRlID0gY3VyLnZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKGN1ci5kb25lKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlclN0YXRlID0gdGhpcy5iYXNlUmVuZGVyU3RhdGUuYmluZCh0aGlzKSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydCBjbGFzcyBDb250cm9sbGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5pbnB1dCA9IHtcbiAgICAgICAgICAgIHVwOiBmYWxzZSxcbiAgICAgICAgICAgIGRvd246IGZhbHNlLFxuICAgICAgICAgICAgcmlnaHQ6IGZhbHNlLFxuICAgICAgICAgICAgbGVmdDogZmFsc2UsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICB9XG5cbiAgICBpc0FueVByZXNzZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlucHV0LnVwIHxcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuZG93biB8XG4gICAgICAgICAgICB0aGlzLmlucHV0LnJpZ2h0IHxcbiAgICAgICAgICAgIHRoaXMuaW5wdXQubGVmdDtcbiAgICB9XG5cbiAgICBjbGVhcigpIHtcbiAgICAgICAgdGhpcy5zYXZlZElucHV0ID0ge1xuICAgICAgICAgICAgdXA6IGZhbHNlLFxuICAgICAgICAgICAgZG93bjogZmFsc2UsXG4gICAgICAgICAgICByaWdodDogZmFsc2UsXG4gICAgICAgICAgICBsZWZ0OiBmYWxzZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGF0dGFjaCgpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCBwcmV2ZW50RGVmYXVsdCA9IGZhbHNlXG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDM4OiBjYXNlIDg3OiAvLyBVcFxuICAgICAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC51cCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlZElucHV0LnVwID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgMzc6IGNhc2UgNjU6IC8vTGVmdFxuICAgICAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5sZWZ0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmVkSW5wdXQubGVmdCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlIDM5OiBjYXNlIDY4OiAvLyBSaWdodFxuICAgICAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5yaWdodCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlZElucHV0LnJpZ2h0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgNDA6IGNhc2UgODM6IC8vIERvd25cbiAgICAgICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQuZG93biA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlZElucHV0LmRvd24gPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAzODogY2FzZSA4NzogLy8gVXBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC51cCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSAzNzogY2FzZSA2NTogLy9MZWZ0XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQubGVmdCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSAzOTogY2FzZSA2ODogLy8gUmlnaHRcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5yaWdodCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSA0MDogY2FzZSA4MzogLy8gRG93blxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LmRvd24gPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuXG5leHBvcnQgY2xhc3MgR2FtZSB7XG4gICAgY29uc3RydWN0b3Ioc2NyZWVuLCB1cGRhdGVGdW5jdGlvbiwgcmVuZGVyRnVuY3Rpb24pIHtcblxuICAgICAgICB0aGlzLnVwZGF0ZSA9IHVwZGF0ZUZ1bmN0aW9uO1xuICAgICAgICB0aGlzLnJlbmRlciA9IHJlbmRlckZ1bmN0aW9uO1xuXG4gICAgICAgIC8vIFNldCB1cCBidWZmZXJzXG4gICAgICAgIHRoaXMuZnJvbnRCdWZmZXIgPSBzY3JlZW47XG4gICAgICAgIHRoaXMuZnJvbnRDdHggPSBzY3JlZW4uZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgdGhpcy5iYWNrQnVmZmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIHRoaXMuYmFja0J1ZmZlci53aWR0aCA9IHNjcmVlbi53aWR0aDtcbiAgICAgICAgdGhpcy5iYWNrQnVmZmVyLmhlaWdodCA9IHNjcmVlbi5oZWlnaHQ7XG4gICAgICAgIHRoaXMuYmFja0N0eCA9IHRoaXMuYmFja0J1ZmZlci5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIC8vIFN0YXJ0IHRoZSBnYW1lIGxvb3BcbiAgICAgICAgdGhpcy5vbGRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIHRoaXMucGF1c2VkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcGF1c2UoZmxhZykge1xuICAgICAgICB0aGlzLnBhdXNlZCA9IChmbGFnID09IHRydWUpO1xuICAgIH1cblxuICAgIGxvb3AobmV3VGltZSkge1xuICAgICAgICB2YXIgZ2FtZSA9IHRoaXM7XG4gICAgICAgIHZhciBlbGFwc2VkVGltZSA9IG5ld1RpbWUgLSB0aGlzLm9sZFRpbWU7XG4gICAgICAgIHRoaXMub2xkVGltZSA9IG5ld1RpbWU7XG5cbiAgICAgICAgaWYoIXRoaXMucGF1c2VkKSB0aGlzLnVwZGF0ZShlbGFwc2VkVGltZSk7XG4gICAgICAgIHRoaXMucmVuZGVyKGVsYXBzZWRUaW1lLCB0aGlzLmZyb250Q3R4KTtcblxuICAgICAgICAvLyBGbGlwIHRoZSBiYWNrIGJ1ZmZlclxuICAgICAgICB0aGlzLmZyb250Q3R4LmRyYXdJbWFnZSh0aGlzLmJhY2tCdWZmZXIsIDAsIDApO1xuICAgIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQge0NvbnRyb2xsZXJ9IGZyb20gXCIuL2NvbW1vbi9pbnB1dC5qc1wiO1xuXG5jb25zdCBNU19QRVJfRlJBTUUgPSAxMDAwLzE2O1xuXG5jb25zdCBTVEFURVMgPSB7XG4gICAgaWRsZTogU3ltYm9sKCksXG4gICAgd2Fsa2luZzogU3ltYm9sKCksXG4gICAgYmxpbmtpbmc6IFN5bWJvbCgpLFxuICAgIGp1bXBpbmc6IFN5bWJvbCgpLFxufVxuXG5sZXQgYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuXG5sZXQgY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKCk7XG5jb250cm9sbGVyLmF0dGFjaCgpO1xuXG5cblxubGV0IGJvbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xuYm9uZy5zcmMgPSBlbmNvZGVVUkkoJ2Fzc2V0cy9ib25nLm9nZycpO1xuXG5sZXQgbXVzaWMgPSBuZXcgQXVkaW8oZW5jb2RlVVJJKCdhc3NldHMvYmdtX2FjdGlvbl8yLm1wMycpKTtcbm11c2ljLmxvb3AgPSB0cnVlO1xubXVzaWMucGxheSgpO1xuXG4oKCk9PntcbnZhciBhdWRpb0N0eCA9IG5ldyB3aW5kb3cuQXVkaW9Db250ZXh0KCk7XG53aW5kb3cuYXVkaW8gPSBhdWRpb0N0eDtcbnZhciBnYWluTm9kZSA9IGF1ZGlvQ3R4LmNyZWF0ZUdhaW4oKTtcbmdhaW5Ob2RlLmdhaW4udmFsdWUgPSAxLjA7XG5nYWluTm9kZS5jb25uZWN0KGF1ZGlvQ3R4LmRlc3RpbmF0aW9uKTtcblxubGV0IGJvbmdTb3VyY2UgPSBhdWRpb0N0eC5jcmVhdGVNZWRpYUVsZW1lbnRTb3VyY2UoYm9uZyk7XG5ib25nU291cmNlLmNvbm5lY3QoZ2Fpbk5vZGUpO1xuXG5sZXQgbXVzaWNTb3VyY2UgPSBhdWRpb0N0eC5jcmVhdGVNZWRpYUVsZW1lbnRTb3VyY2UobXVzaWMpO1xubXVzaWNTb3VyY2UuY29ubmVjdChnYWluTm9kZSk7XG59KSgpXG5cbmV4cG9ydCBjbGFzcyBQbGF5ZXIge1xuICAgIGNvbnN0cnVjdG9yKHBvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBTVEFURVMuaWRsZTtcbiAgICAgICAgdGhpcy5zdGF0ZUZ1bmMgPSB0aGlzLnN0YXRlSWRsZS5iaW5kKHRoaXMpKCk7XG4gICAgICAgIHRoaXMueCA9IHBvc2l0aW9uLng7XG4gICAgICAgIHRoaXMueSA9IHBvc2l0aW9uLnk7XG4gICAgICAgIHRoaXMud2lkdGggID0gNjQ7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gNjQ7XG4gICAgICAgIHRoaXMuc3ByaXRlc2hlZXQgID0gbmV3IEltYWdlKCk7XG4gICAgICAgIHRoaXMuc3ByaXRlc2hlZXQuc3JjID0gZW5jb2RlVVJJKCdhc3NldHMvUGxheWVyU3ByaXRlMi5wbmcnKTtcbiAgICAgICAgdGhpcy50aW1lciA9IDA7XG4gICAgICAgIHRoaXMuZnJhbWUgPSAwO1xuICAgICAgICB0aGlzLnNpdHRpbmdTcHJpdGVzID0gW3t4OiA2NCozLCB5OiA2NH0sIHt4OiA2NCowLCB5OiA2NH0sIHt4OiA2NCoxLCB5OiA2NH0sIHt4OiA2NCoyLCB5OiA2NH0sIHt4OiA2NCoxLCB5OiA2NH0sIHt4OiA2NCowLCB5OiA2NH1dO1xuICAgICAgICB0aGlzLmp1bXBpbmdTcHJpdGVzID0gW3t4OiA2NCozLCB5OiAwfSwge3g6IDY0KjIsIHk6IDB9LCB7eDogNjQqMSwgeTogMH0sIHt4OiA2NCowLCB5OiAwfSwge3g6IDY0KjEsIHk6IDB9LCB7eDogNjQqMiwgeTogMH0sIHt4OiA2NCozLCB5OiAwfV07XG4gICAgfVxuXG4gICAgdXBkYXRlKHRpbWUpIHtcbiAgICAgICAgdGhpcy50aW1lciArPSB0aW1lO1xuICAgICAgICBsZXQgbmV3RnJhbWUgPSBmYWxzZTtcbiAgICAgICAgaWYodGhpcy50aW1lciA+IE1TX1BFUl9GUkFNRSkge1xuICAgICAgICAgICAgdGhpcy50aW1lciA9IDA7XG4gICAgICAgICAgICB0aGlzLmZyYW1lKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY3VyID0gdGhpcy5zdGF0ZUZ1bmMubmV4dCh7ZHQ6IHRpbWV9KTtcbiAgICAgICAgaWYgKGN1ci5kb25lKSB7XG4gICAgICAgICAgIHRoaXMuc3RhdGVGdW5jID0gdGhpcy5zdGF0ZUlkbGUuYmluZCh0aGlzKSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1ci52YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZUZ1bmMgPSBjdXIudmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAqc3RhdGVJZGxlKCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgbGV0IHtkdH0gPSB5aWVsZCBudWxsO1xuXG4gICAgICAgICAgICBpZiAoY29udHJvbGxlci5pc0FueVByZXNzZWQoKSkge1xuICAgICAgICAgICAgICAgIGxldCBoID0ge3g6IDAsIHk6IDB9O1xuICAgICAgICAgICAgICAgIGlmIChjb250cm9sbGVyLmlucHV0LnJpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIGgueCA9IDE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb250cm9sbGVyLmlucHV0LmxlZnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaC54ID0gLTE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb250cm9sbGVyLmlucHV0LnVwKSB7XG4gICAgICAgICAgICAgICAgICAgIGgueSA9IC0xO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29udHJvbGxlci5pbnB1dC5kb3duKSB7XG4gICAgICAgICAgICAgICAgICAgIGgueSA9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGVGdW5jID0gdGhpcy5zdGF0ZUp1bXBpbmcuYmluZCh0aGlzKShoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgICpzdGF0ZUp1bXBpbmcoaGVhZGluZykge1xuICAgICAgICBib25nLnBsYXkoKTtcbiAgICAgICAgbGV0IHt4LCB5fSA9IGhlYWRpbmc7XG4gICAgICAgIGxldCBbZW5kWCwgZW5kWV0gPSBbdGhpcy54ICsgdGhpcy5oZWlnaHQqeCwgdGhpcy55ICsgdGhpcy5oZWlnaHQqeV07XG4gICAgICAgIGxldCB0aW1lVG9UYWtlID0gMTAwMC8gMTg7XG4gICAgICAgIGxldCB0aW1lID0gMDtcbiAgICAgICAgd2hpbGUgKHRpbWUgPCB0aW1lVG9UYWtlKSB7XG4gICAgICAgICAgICBsZXQge2R0fSA9IHlpZWxkIG51bGw7XG4gICAgICAgICAgICBsZXQgZGQgPSBkdCAvIHRpbWVUb1Rha2U7XG4gICAgICAgICAgICB0aW1lICs9IGR0O1xuICAgICAgICAgICAgdGhpcy54ICs9IHRoaXMud2lkdGggKiB4ICogZGQ7XG4gICAgICAgICAgICB0aGlzLnkgKz0gdGhpcy5oZWlnaHQgKiB5ICogZGQ7XG4gICAgICAgIH1cbiAgICAgICAgW3RoaXMueCwgdGhpcy55XSA9IFtlbmRYLCBlbmRZXTtcbiAgICAgICAgYm9uZy5wYXVzZSgpO1xuICAgICAgICBib25nLmZhc3RTZWVrKDApO1xuICAgIH1cblxuICAgIHJlbmRlcih0aW1lLCBjdHgpIHtcbiAgICAgICAgc3dpdGNoKHRoaXMuc3RhdGUpIHtcbiAgICAgICAgICAgIGNhc2UgU1RBVEVTLmp1bXBpbmc6IHtcbiAgICAgICAgICAgICAgICBsZXQgZnJhbWUgPSB0aGlzLmZyYW1lICUgKHRoaXMuanVtcGluZ1Nwcml0ZXMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBsZXQge3gsIHl9ID0gdGhpcy5qdW1waW5nU3ByaXRlc1tmcmFtZV07XG4gICAgICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVzaGVldCxcbiAgICAgICAgICAgICAgICAgICAgeCwgeSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZnJhbWUgPT09IHRoaXMuanVtcGluZ1Nwcml0ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZnJhbWUgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVTLmlkbGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYXNlIFNUQVRFUy5pZGxlOiB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRyb2xsZXIuaXNBbnlQcmVzc2VkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mcmFtZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBTVEFURVMuanVtcGluZztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gaGFuZGxlIGJsaW5raW5nXG4gICAgICAgICAgICAgICAgbGV0IGZyYW1lID0gTWF0aC5taW4odGhpcy5mcmFtZSAlICh0aGlzLnNpdHRpbmdTcHJpdGVzLmxlbmd0aCArIDIwKSwgdGhpcy5zaXR0aW5nU3ByaXRlcy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGZyYW1lID0gZnJhbWUgJSB0aGlzLnNpdHRpbmdTcHJpdGVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBsZXQge3gsIHl9ID0gdGhpcy5zaXR0aW5nU3ByaXRlc1tmcmFtZV07XG4gICAgICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShcbiAgICAgICAgICAgICAgICAgICAgLy8gaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVzaGVldCxcbiAgICAgICAgICAgICAgICAgICAgLy8gc291cmNlIHJlY3RhbmdsZVxuICAgICAgICAgICAgICAgICAgICB4LCB5LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgLy8gZGVzdGluYXRpb24gcmVjdGFuZ2xlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogSW1wbGVtZW50IHlvdXIgcGxheWVyJ3MgcmVkZXJpbmcgYWNjb3JkaW5nIHRvIHN0YXRlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=
