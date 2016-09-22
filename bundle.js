(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _game = require("./game.js");

var _player = require("./player.js");

var _car = require("./car.js");

var canvas = document.getElementById('screen');
let backdrop = new Image();
backdrop.src = encodeURI('assets/canvas.png');
var game = new _game.Game(canvas, update, render);
var player = new _player.Player({ x: 0, y: 256 }, game);
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
    let hitBox = player.getHitBoxes()[0];
    for (let car of cars) {
        car.update(elapsedTime);
        if ((hitBox.x >= car.x && hitBox.x <= car.x + car.width - 1 || hitBox.x + hitBox.width - 1 >= car.x && hitBox.x + hitBox.width - 1 <= car.x + car.width - 1) && (hitBox.y >= car.y && hitBox.y <= car.y + car.height - 1 || hitBox.y + hitBox.height - 1 >= car.y && hitBox.y + hitBox.height - 1 <= car.y + car.height - 1)) {
            player.events.emit('collision', car);
        }
    }
}

function render(elapsedTime, ctx) {
    ctx.drawImage(backdrop, 0, 0);
    player.render(elapsedTime, ctx);
    for (let car of cars) {
        car.render(elapsedTime, ctx);
    }
}

},{"./car.js":2,"./game.js":6,"./player.js":7}],2:[function(require,module,exports){
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

    getHitBoxes() {
        return [{ x: this.x, y: this.y, width: this.width, height: this.height, obj: this }];
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
exports.Actor = undefined;

var _events = require("./events.js");

class Actor {
    constructor(world) {
        this.baseControlState = null;
        this.baseRenderState = null;
        this.controlState = null;
        this.renderState = null;
        this.events = new _events.EventListener();

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

},{"./events.js":4}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
class EventListener {
    constructor() {
        this.events = {};
    }

    addEventListener(name, func) {
        let events = this.events[name] || [];
        this.events[name] = events;

        events.push(func);
    }

    emit(name, args) {
        let events = this.events[name] || [];
        for (let ev of events) {
            ev(args);
        }
    }
}
exports.EventListener = EventListener;

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Player = undefined;

var _input = require("./common/input.js");

var _events = require("./common/events.js");

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
    constructor(position, world) {
        this.world = world;
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
        this.events = new _events.EventListener();
        this.sittingSprites = [{ x: 64 * 3, y: 64 }, { x: 64 * 0, y: 64 }, { x: 64 * 1, y: 64 }, { x: 64 * 2, y: 64 }, { x: 64 * 1, y: 64 }, { x: 64 * 0, y: 64 }];
        this.jumpingSprites = [{ x: 64 * 3, y: 0 }, { x: 64 * 2, y: 0 }, { x: 64 * 1, y: 0 }, { x: 64 * 0, y: 0 }, { x: 64 * 1, y: 0 }, { x: 64 * 2, y: 0 }, { x: 64 * 3, y: 0 }];
        this.events.addEventListener('collision', this.collide.bind(this));
    }

    collide(other) {
        console.log(other);
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

    getHitBoxes() {
        return [{ x: this.x, y: this.y, width: this.width, height: this.height, obj: this }];
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

},{"./common/events.js":4,"./common/input.js":5}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2Nhci5qcyIsInNyYy9jb21tb24vYWN0b3IuanMiLCJzcmMvY29tbW9uL2V2ZW50cy5qcyIsInNyYy9jb21tb24vaW5wdXQuanMiLCJzcmMvZ2FtZS5qcyIsInNyYy9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFFQSxJQUFJLFNBQVMsU0FBUyxjQUFULENBQXdCLFFBQXhCLENBQWI7QUFDQSxJQUFJLFdBQVcsSUFBSSxLQUFKLEVBQWY7QUFDQSxTQUFTLEdBQVQsR0FBZSxVQUFVLG1CQUFWLENBQWY7QUFDQSxJQUFJLE9BQU8sZUFBUyxNQUFULEVBQWlCLE1BQWpCLEVBQXlCLE1BQXpCLENBQVg7QUFDQSxJQUFJLFNBQVMsbUJBQVcsRUFBQyxHQUFHLENBQUosRUFBTyxHQUFHLEdBQVYsRUFBWCxFQUEyQixJQUEzQixDQUFiO0FBQ0EsSUFBSSxPQUFPLEVBQVg7QUFDQSxLQUFLLElBQUksSUFBRSxDQUFYLEVBQWMsSUFBRSxFQUFoQixFQUFvQixHQUFwQixFQUF5QjtBQUNyQixTQUFLLElBQUwsQ0FBVSxhQUFRLE1BQVIsRUFBZ0IsRUFBQyxTQUFVLEtBQUssS0FBTCxDQUFXLENBQUMsSUFBRSxDQUFILElBQU0sQ0FBakIsSUFBb0IsQ0FBcEIsS0FBd0IsQ0FBeEIsR0FBMEIsQ0FBQyxDQUEzQixHQUE2QixDQUF4QyxFQUE0QyxHQUFHLEtBQUcsQ0FBbEQsRUFBcUQsR0FBRyxDQUFDLElBQXpELEVBQWhCLENBQVY7QUFDSDs7QUFFRCxJQUFJLGFBQWEsVUFBUyxTQUFULEVBQW9CO0FBQ2pDLFNBQUssSUFBTCxDQUFVLFNBQVY7QUFDQSxXQUFPLHFCQUFQLENBQTZCLFVBQTdCO0FBQ0gsQ0FIRDtBQUlBLFdBQVcsWUFBWSxHQUFaLEVBQVg7O0FBRUEsU0FBUyxNQUFULENBQWdCLFdB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QUFMLEdBQWEsQ0FBYjtBQUNBLDZCQUFLLEtBQUwsR0FBYSxPQUFPLElBQXBCO0FBQ0g7QUFDRDtBQUNIOztBQUVELGlCQUFLLE9BQU8sSUFBWjtBQUFrQjtBQUNkLHdCQUFJLFdBQVcsWUFBWCxFQUFKLEVBQStCO0FBQzNCLDZCQUFLLEtBQUwsR0FBYSxDQUFiO0FBQ0EsNkJBQUssS0FBTCxHQUFhLE9BQU8sT0FBcEI7QUFDSDtBQUNEO0FBQ0Esd0JBQUksUUFBUSxLQUFLLEdBQUwsQ0FBUyxLQUFLLEtBQUwsSUFBYyxLQUFLLGNBQUwsQ0FBb0IsTUFBcEIsR0FBNkIsRUFBM0MsQ0FBVCxFQUF5RCxLQUFLLGNBQUwsQ0FBb0IsTUFBN0UsQ0FBWjtBQUNBLDRCQUFRLFFBQVEsS0FBSyxjQUFMLENBQW9CLE1BQXBDO0FBQ0Esd0JBQUksRUFBQyxDQUFELEVBQUksQ0FBSixLQUFTLEtBQUssY0FBTCxDQUFvQixLQUFwQixDQUFiO0FBQ0Esd0JBQUksU0FBSjtBQUNJO0FBQ0EseUJBQUssV0FGVDtBQUdJO0FBQ0EscUJBSkosRUFJTyxDQUpQLEVBSVUsS0FBSyxLQUpmLEVBSXNCLEtBQUssTUFKM0I7QUFLSTtBQUNBLHlCQUFLLENBTlQsRUFNWSxLQUFLLENBTmpCLEVBTW9CLEtBQUssS0FOekIsRUFNZ0MsS0FBSyxNQU5yQztBQVFBO0FBQ0E7QUFDSDtBQW5DTDtBQXFDSDtBQXpIZTtRQUFQLE0sR0FBQSxNIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQge0dhbWV9IGZyb20gXCIuL2dhbWUuanNcIjtcbmltcG9ydCB7UGxheWVyfSBmcm9tIFwiLi9wbGF5ZXIuanNcIjtcbmltcG9ydCB7Q2FyfSBmcm9tIFwiLi9jYXIuanNcIjtcblxudmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY3JlZW4nKTtcbmxldCBiYWNrZHJvcCA9IG5ldyBJbWFnZSgpO1xuYmFja2Ryb3Auc3JjID0gZW5jb2RlVVJJKCdhc3NldHMvY2FudmFzLnBuZycpO1xudmFyIGdhbWUgPSBuZXcgR2FtZShjYW52YXMsIHVwZGF0ZSwgcmVuZGVyKTtcbnZhciBwbGF5ZXIgPSBuZXcgUGxheWVyKHt4OiAwLCB5OiAyNTZ9LCBnYW1lKTtcbmxldCBjYXJzID0gW107XG5mb3IgKGxldCBpPTE7IGk8MTE7IGkrKykge1xuICAgIGNhcnMucHVzaChuZXcgQ2FyKGNhbnZhcywge2hlYWRpbmc6IChNYXRoLmZsb29yKChpKzEpLzIpJTI9PT0wPy0xOjEpLCB4OiA2NCppLCB5OiAtMTExMn0pKTtcbn1cblxudmFyIG1hc3Rlckxvb3AgPSBmdW5jdGlvbih0aW1lc3RhbXApIHtcbiAgICBnYW1lLmxvb3AodGltZXN0YW1wKTtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1hc3Rlckxvb3ApO1xufVxubWFzdGVyTG9vcChwZXJmb3JtYW5jZS5ub3coKSk7XG5cbmZ1bmN0aW9uIHVwZGF0ZShlbGFwc2VkVGltZSkge1xuICAgIHBsYXllci51cGRhdGUoZWxhcHNlZFRpbWUpO1xuICAgIGxldCBoaXRCb3ggPSBwbGF5ZXIuZ2V0SGl0Qm94ZXMoKVswXTtcbiAgICBmb3IgKGxldCBjYXIgb2YgY2Fycykge1xuICAgICAgICBjYXIudXBkYXRlKGVsYXBzZWRUaW1lKTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgKChoaXRCb3gueCA+PSBjYXIueCAmJiBoaXRCb3gueCA8PSBjYXIueCArIGNhci53aWR0aCAtMSkgfHwgKGhpdEJveC54ICsgaGl0Qm94LndpZHRoIC0xID49IGNhci54ICYmIGhpdEJveC54ICsgaGl0Qm94LndpZHRoIC0xIDw9IGNhci54ICsgY2FyLndpZHRoIC0xKSkgJiZcbiAgICAgICAgICAgICgoaGl0Qm94LnkgPj0gY2FyLnkgJiYgaGl0Qm94LnkgPD0gY2FyLnkgKyBjYXIuaGVpZ2h0IC0xKSB8fCAoaGl0Qm94LnkgKyBoaXRCb3guaGVpZ2h0IC0xID49IGNhci55ICYmIGhpdEJveC55ICsgaGl0Qm94LmhlaWdodCAtMSA8PSBjYXIueSArIGNhci5oZWlnaHQgLTEpKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHBsYXllci5ldmVudHMuZW1pdCgnY29sbGlzaW9uJywgY2FyKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyKGVsYXBzZWRUaW1lLCBjdHgpIHtcbiAgICBjdHguZHJhd0ltYWdlKGJhY2tkcm9wLCAwLCAwKTtcbiAgICBwbGF5ZXIucmVuZGVyKGVsYXBzZWRUaW1lLCBjdHgpO1xuICAgIGZvciAobGV0IGNhciBvZiBjYXJzKSB7XG4gICAgICAgIGNhci5yZW5kZXIoZWxhcHNlZFRpbWUsIGN0eClcbiAgICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHtBY3Rvcn0gZnJvbSBcIi4vY29tbW9uL2FjdG9yLmpzXCI7XG5cblxuZXhwb3J0IGNsYXNzIENhciBleHRlbmRzIEFjdG9yIHtcbiAgICBjb25zdHJ1Y3Rvcih3b3JsZCwgYXJncykge1xuICAgICAgICBsZXQge3gsIHksIGhlYWRpbmd9ID0gYXJncztcbiAgICAgICAgc3VwZXIod29ybGQpXG4gICAgICAgIHRoaXMuY29udHJvbFN0YXRlID0gdGhpcy5jb250cm9sRHJpdmUuYmluZCh0aGlzKSgpO1xuICAgICAgICB0aGlzLnJlbmRlclN0YXRlID0gdGhpcy5yZW5kZXJEcml2ZS5iaW5kKHRoaXMpKCk7XG4gICAgICAgIHRoaXMuc3ByaXRlID0gbmV3IEltYWdlKCk7XG4gICAgICAgIHRoaXMuc3ByaXRlLnNyYyA9IGVuY29kZVVSSSgnLi9hc3NldHMvY2Fyc19taW5pLnN2ZycpO1xuICAgICAgICB0aGlzLndpZHRoID0gNjQ7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gMTEyO1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgICAgICB0aGlzLmhlYWRpbmcgPSBoZWFkaW5nO1xuICAgICAgICB0aGlzLnNwZWVkID0gMTtcbiAgICAgICAgdGhpcy5zcHJpdGVOdW0gPSAwO1xuICAgICAgICB0aGlzLmRlbGF5ID0gMDtcbiAgICAgICAgdGhpcy5yZUluaXQoKTtcbiAgICB9XG5cbiAgICBjb2xsZWN0KCkge1xuICAgICAgICBpZiAodGhpcy55K3RoaXMuaGVpZ2h0IDwgMCB8fCB0aGlzLngrdGhpcy53aWR0aCA8IDAgfHxcbiAgICAgICAgICAgICAgICB0aGlzLnggPiB0aGlzLndvcmxkLndpZHRoIHx8IHRoaXMueSA+IHRoaXMud29ybGQuaGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLnJlSW5pdCgpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRIaXRCb3hlcygpIHtcbiAgICAgICAgcmV0dXJuIFt7eDogdGhpcy54LCB5OiB0aGlzLnksIHdpZHRoOiB0aGlzLndpZHRoLCBoZWlnaHQ6IHRoaXMuaGVpZ2h0LCBvYmo6IHRoaXN9XTtcbiAgICB9XG5cbiAgICAqY29udHJvbERyaXZlKCkge1xuICAgICAgICB0aGlzLnJlSW5pdCgpO1xuICAgICAgICBsZXQgdGltZSA9IDA7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBsZXQge2R0fT0geWllbGQgbnVsbDtcbiAgICAgICAgICAgIHRpbWUgKz0gZHQ7XG4gICAgICAgICAgICBpZiAodGltZSA8IHRoaXMuZGVsYXkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMueSArPSB0aGlzLmhlYWRpbmcgKiB0aGlzLnNwZWVkICogNDAwICogZHQgLyAxMDAwO1xuICAgICAgICAgICAgaWYgKHRoaXMuY29sbGVjdCgpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaGVhZGluZyA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnkgPSAxLXRoaXMuaGVpZ2h0O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMueSA9IHRoaXMud29ybGQuaGVpZ2h0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb250cm9sRHJpdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgICpyZW5kZXJEcml2ZShjdHgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGxldCB7ZHQsIGN0eH0gPSB5aWVsZCBudWxsO1xuICAgICAgICAgICAgY3R4LnNhdmUoKVxuICAgICAgICAgICAgaWYgKHRoaXMuaGVhZGluZyA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGN0eC50cmFuc2xhdGUodGhpcy54K3RoaXMud2lkdGgsIHRoaXMueSt0aGlzLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgY3R4LnJvdGF0ZShNYXRoLlBJKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjdHgudHJhbnNsYXRlKHRoaXMueCwgdGhpcy55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGUsXG4gICAgICAgICAgICAgICAgMjQ3KnRoaXMuc3ByaXRlTnVtLCAwLCAyMDAsIDM1MCxcbiAgICAgICAgICAgICAgICAwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVJbml0KCkge1xuICAgICAgICB0aGlzLmRlbGF5ID0gNCAqIE1hdGgucmFuZG9tKCkgKiAxMDAwO1xuICAgICAgICAvLyB0aGlzLnNwZWVkID0gLjUgKyBNYXRoLnJhbmRvbSgpIC80O1xuICAgICAgICB0aGlzLnNwZWVkID0gLjI1XG4gICAgICAgIHRoaXMuc3ByaXRlTnVtID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNCk7XG4gICAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB7RXZlbnRMaXN0ZW5lcn0gZnJvbSBcIi4vZXZlbnRzLmpzXCI7XG5cblxuZXhwb3J0IGNsYXNzIEFjdG9yIHtcbiAgICBjb25zdHJ1Y3Rvcih3b3JsZCkge1xuICAgICAgICB0aGlzLmJhc2VDb250cm9sU3RhdGUgPSBudWxsO1xuICAgICAgICB0aGlzLmJhc2VSZW5kZXJTdGF0ZSA9IG51bGw7XG4gICAgICAgIHRoaXMuY29udHJvbFN0YXRlID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZW5kZXJTdGF0ZSA9IG51bGw7XG4gICAgICAgIHRoaXMuZXZlbnRzID0gbmV3IEV2ZW50TGlzdGVuZXIoKTtcblxuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XG4gICAgICAgIHRoaXMueCA9IDA7XG4gICAgICAgIHRoaXMueSA9IDA7XG4gICAgICAgIHRoaXMud2lkdGggPSA2NDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSA2NDtcbiAgICB9XG5cbiAgICBnZXRIaXRCb3hlcygpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbGxlY3QoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB1cGRhdGUoZHQpIHtcbiAgICAgICAgbGV0IGN1ciA9IHRoaXMuY29udHJvbFN0YXRlLm5leHQoe2R0OiBkdH0pO1xuICAgICAgICBpZiAoY3VyLnZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xTdGF0ZSA9IGN1ci52YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXIuZG9uZSkge1xuICAgICAgICAgICAgdGhpcy5jb250cm9sU3RhdGUgPSB0aGlzLmJhc2VDb250cm9sU3RhdGUuYmluZCh0aGlzKSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKGR0LCBjdHgpIHtcbiAgICAgICAgbGV0IGN1ciA9IHRoaXMucmVuZGVyU3RhdGUubmV4dCh7ZHQ6IGR0LCBjdHg6IGN0eH0pO1xuICAgICAgICBpZiAoY3VyLnZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlclN0YXRlID0gY3VyLnZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKGN1ci5kb25lKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlclN0YXRlID0gdGhpcy5iYXNlUmVuZGVyU3RhdGUuYmluZCh0aGlzKSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cblxuZXhwb3J0IGNsYXNzIEV2ZW50TGlzdGVuZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmV2ZW50cyA9IHt9O1xuICAgIH1cblxuICAgIGFkZEV2ZW50TGlzdGVuZXIobmFtZSwgZnVuYykge1xuICAgICAgICBsZXQgZXZlbnRzID0gdGhpcy5ldmVudHNbbmFtZV0gfHwgW107XG4gICAgICAgIHRoaXMuZXZlbnRzW25hbWVdID0gZXZlbnRzO1xuXG4gICAgICAgIGV2ZW50cy5wdXNoKGZ1bmMpO1xuICAgIH1cblxuICAgIGVtaXQobmFtZSwgYXJncykge1xuICAgICAgICBsZXQgZXZlbnRzID0gdGhpcy5ldmVudHNbbmFtZV0gfHwgW107XG4gICAgICAgIGZvciAobGV0IGV2IG9mIGV2ZW50cykge1xuICAgICAgICAgICAgZXYoYXJncyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0IGNsYXNzIENvbnRyb2xsZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmlucHV0ID0ge1xuICAgICAgICAgICAgdXA6IGZhbHNlLFxuICAgICAgICAgICAgZG93bjogZmFsc2UsXG4gICAgICAgICAgICByaWdodDogZmFsc2UsXG4gICAgICAgICAgICBsZWZ0OiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgIH1cblxuICAgIGlzQW55UHJlc3NlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQudXAgfFxuICAgICAgICAgICAgdGhpcy5pbnB1dC5kb3duIHxcbiAgICAgICAgICAgIHRoaXMuaW5wdXQucmlnaHQgfFxuICAgICAgICAgICAgdGhpcy5pbnB1dC5sZWZ0O1xuICAgIH1cblxuICAgIGNsZWFyKCkge1xuICAgICAgICB0aGlzLnNhdmVkSW5wdXQgPSB7XG4gICAgICAgICAgICB1cDogZmFsc2UsXG4gICAgICAgICAgICBkb3duOiBmYWxzZSxcbiAgICAgICAgICAgIHJpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgIGxlZnQ6IGZhbHNlXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXR0YWNoKCkge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IHByZXZlbnREZWZhdWx0ID0gZmFsc2VcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMzg6IGNhc2UgODc6IC8vIFVwXG4gICAgICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LnVwID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmVkSW5wdXQudXAgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSAzNzogY2FzZSA2NTogLy9MZWZ0XG4gICAgICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LmxlZnQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZWRJbnB1dC5sZWZ0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgMzk6IGNhc2UgNjg6IC8vIFJpZ2h0XG4gICAgICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LnJpZ2h0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmVkSW5wdXQucmlnaHQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSA0MDogY2FzZSA4MzogLy8gRG93blxuICAgICAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5kb3duID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmVkSW5wdXQuZG93biA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDM4OiBjYXNlIDg3OiAvLyBVcFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LnVwID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlIDM3OiBjYXNlIDY1OiAvL0xlZnRcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5sZWZ0ID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlIDM5OiBjYXNlIDY4OiAvLyBSaWdodFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LnJpZ2h0ID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlIDQwOiBjYXNlIDgzOiAvLyBEb3duXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQuZG93biA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5cbmV4cG9ydCBjbGFzcyBHYW1lIHtcbiAgICBjb25zdHJ1Y3RvcihzY3JlZW4sIHVwZGF0ZUZ1bmN0aW9uLCByZW5kZXJGdW5jdGlvbikge1xuXG4gICAgICAgIHRoaXMudXBkYXRlID0gdXBkYXRlRnVuY3Rpb247XG4gICAgICAgIHRoaXMucmVuZGVyID0gcmVuZGVyRnVuY3Rpb247XG5cbiAgICAgICAgLy8gU2V0IHVwIGJ1ZmZlcnNcbiAgICAgICAgdGhpcy5mcm9udEJ1ZmZlciA9IHNjcmVlbjtcbiAgICAgICAgdGhpcy5mcm9udEN0eCA9IHNjcmVlbi5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICB0aGlzLmJhY2tCdWZmZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgdGhpcy5iYWNrQnVmZmVyLndpZHRoID0gc2NyZWVuLndpZHRoO1xuICAgICAgICB0aGlzLmJhY2tCdWZmZXIuaGVpZ2h0ID0gc2NyZWVuLmhlaWdodDtcbiAgICAgICAgdGhpcy5iYWNrQ3R4ID0gdGhpcy5iYWNrQnVmZmVyLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgLy8gU3RhcnQgdGhlIGdhbWUgbG9vcFxuICAgICAgICB0aGlzLm9sZFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwYXVzZShmbGFnKSB7XG4gICAgICAgIHRoaXMucGF1c2VkID0gKGZsYWcgPT0gdHJ1ZSk7XG4gICAgfVxuXG4gICAgbG9vcChuZXdUaW1lKSB7XG4gICAgICAgIHZhciBnYW1lID0gdGhpcztcbiAgICAgICAgdmFyIGVsYXBzZWRUaW1lID0gbmV3VGltZSAtIHRoaXMub2xkVGltZTtcbiAgICAgICAgdGhpcy5vbGRUaW1lID0gbmV3VGltZTtcblxuICAgICAgICBpZighdGhpcy5wYXVzZWQpIHRoaXMudXBkYXRlKGVsYXBzZWRUaW1lKTtcbiAgICAgICAgdGhpcy5yZW5kZXIoZWxhcHNlZFRpbWUsIHRoaXMuZnJvbnRDdHgpO1xuXG4gICAgICAgIC8vIEZsaXAgdGhlIGJhY2sgYnVmZmVyXG4gICAgICAgIHRoaXMuZnJvbnRDdHguZHJhd0ltYWdlKHRoaXMuYmFja0J1ZmZlciwgMCwgMCk7XG4gICAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB7Q29udHJvbGxlcn0gZnJvbSBcIi4vY29tbW9uL2lucHV0LmpzXCI7XG5pbXBvcnQge0V2ZW50TGlzdGVuZXJ9IGZyb20gXCIuL2NvbW1vbi9ldmVudHMuanNcIjtcblxuY29uc3QgTVNfUEVSX0ZSQU1FID0gMTAwMC8xNjtcblxuY29uc3QgU1RBVEVTID0ge1xuICAgIGlkbGU6IFN5bWJvbCgpLFxuICAgIHdhbGtpbmc6IFN5bWJvbCgpLFxuICAgIGJsaW5raW5nOiBTeW1ib2woKSxcbiAgICBqdW1waW5nOiBTeW1ib2woKSxcbn1cblxubGV0IGF1ZGlvQ29udGV4dCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcblxubGV0IGNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcigpO1xuY29udHJvbGxlci5hdHRhY2goKTtcblxuXG5cbmxldCBib25nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmJvbmcuc3JjID0gZW5jb2RlVVJJKCdhc3NldHMvYm9uZy5vZ2cnKTtcblxubGV0IG11c2ljID0gbmV3IEF1ZGlvKGVuY29kZVVSSSgnYXNzZXRzL2JnbV9hY3Rpb25fMi5tcDMnKSk7XG5tdXNpYy5sb29wID0gdHJ1ZTtcbm11c2ljLnBsYXkoKTtcblxuKCgpPT57XG52YXIgYXVkaW9DdHggPSBuZXcgd2luZG93LkF1ZGlvQ29udGV4dCgpO1xud2luZG93LmF1ZGlvID0gYXVkaW9DdHg7XG52YXIgZ2Fpbk5vZGUgPSBhdWRpb0N0eC5jcmVhdGVHYWluKCk7XG5nYWluTm9kZS5nYWluLnZhbHVlID0gMS4wO1xuZ2Fpbk5vZGUuY29ubmVjdChhdWRpb0N0eC5kZXN0aW5hdGlvbik7XG5cbmxldCBib25nU291cmNlID0gYXVkaW9DdHguY3JlYXRlTWVkaWFFbGVtZW50U291cmNlKGJvbmcpO1xuYm9uZ1NvdXJjZS5jb25uZWN0KGdhaW5Ob2RlKTtcblxubGV0IG11c2ljU291cmNlID0gYXVkaW9DdHguY3JlYXRlTWVkaWFFbGVtZW50U291cmNlKG11c2ljKTtcbm11c2ljU291cmNlLmNvbm5lY3QoZ2Fpbk5vZGUpO1xufSkoKVxuXG5leHBvcnQgY2xhc3MgUGxheWVyIHtcbiAgICBjb25zdHJ1Y3Rvcihwb3NpdGlvbiwgd29ybGQpIHtcbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVTLmlkbGU7XG4gICAgICAgIHRoaXMuc3RhdGVGdW5jID0gdGhpcy5zdGF0ZUlkbGUuYmluZCh0aGlzKSgpO1xuICAgICAgICB0aGlzLnggPSBwb3NpdGlvbi54O1xuICAgICAgICB0aGlzLnkgPSBwb3NpdGlvbi55O1xuICAgICAgICB0aGlzLndpZHRoICA9IDY0O1xuICAgICAgICB0aGlzLmhlaWdodCA9IDY0O1xuICAgICAgICB0aGlzLnNwcml0ZXNoZWV0ICA9IG5ldyBJbWFnZSgpO1xuICAgICAgICB0aGlzLnNwcml0ZXNoZWV0LnNyYyA9IGVuY29kZVVSSSgnYXNzZXRzL1BsYXllclNwcml0ZTIucG5nJyk7XG4gICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICAgICAgdGhpcy5ldmVudHMgPSBuZXcgRXZlbnRMaXN0ZW5lcigpO1xuICAgICAgICB0aGlzLnNpdHRpbmdTcHJpdGVzID0gW3t4OiA2NCozLCB5OiA2NH0sIHt4OiA2NCowLCB5OiA2NH0sIHt4OiA2NCoxLCB5OiA2NH0sIHt4OiA2NCoyLCB5OiA2NH0sIHt4OiA2NCoxLCB5OiA2NH0sIHt4OiA2NCowLCB5OiA2NH1dO1xuICAgICAgICB0aGlzLmp1bXBpbmdTcHJpdGVzID0gW3t4OiA2NCozLCB5OiAwfSwge3g6IDY0KjIsIHk6IDB9LCB7eDogNjQqMSwgeTogMH0sIHt4OiA2NCowLCB5OiAwfSwge3g6IDY0KjEsIHk6IDB9LCB7eDogNjQqMiwgeTogMH0sIHt4OiA2NCozLCB5OiAwfV07XG4gICAgICAgIHRoaXMuZXZlbnRzLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbGxpc2lvbicsIHRoaXMuY29sbGlkZS5iaW5kKHRoaXMpKVxuICAgIH1cblxuICAgIGNvbGxpZGUob3RoZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2cob3RoZXIpO1xuICAgIH1cblxuICAgIHVwZGF0ZSh0aW1lKSB7XG4gICAgICAgIHRoaXMudGltZXIgKz0gdGltZTtcbiAgICAgICAgbGV0IG5ld0ZyYW1lID0gZmFsc2U7XG4gICAgICAgIGlmKHRoaXMudGltZXIgPiBNU19QRVJfRlJBTUUpIHtcbiAgICAgICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGN1ciA9IHRoaXMuc3RhdGVGdW5jLm5leHQoe2R0OiB0aW1lfSk7XG4gICAgICAgIGlmIChjdXIuZG9uZSkge1xuICAgICAgICAgICB0aGlzLnN0YXRlRnVuYyA9IHRoaXMuc3RhdGVJZGxlLmJpbmQodGhpcykoKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXIudmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGVGdW5jID0gY3VyLnZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0SGl0Qm94ZXMoKSB7XG4gICAgICAgIHJldHVybiBbe3g6IHRoaXMueCwgeTogdGhpcy55LCB3aWR0aDogdGhpcy53aWR0aCwgaGVpZ2h0OiB0aGlzLmhlaWdodCwgb2JqOiB0aGlzfV07XG4gICAgfVxuXG4gICAgKnN0YXRlSWRsZSgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGxldCB7ZHR9ID0geWllbGQgbnVsbDtcblxuICAgICAgICAgICAgaWYgKGNvbnRyb2xsZXIuaXNBbnlQcmVzc2VkKCkpIHtcbiAgICAgICAgICAgICAgICBsZXQgaCA9IHt4OiAwLCB5OiAwfTtcbiAgICAgICAgICAgICAgICBpZiAoY29udHJvbGxlci5pbnB1dC5yaWdodCkge1xuICAgICAgICAgICAgICAgICAgICBoLnggPSAxO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29udHJvbGxlci5pbnB1dC5sZWZ0KSB7XG4gICAgICAgICAgICAgICAgICAgIGgueCA9IC0xO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29udHJvbGxlci5pbnB1dC51cCkge1xuICAgICAgICAgICAgICAgICAgICBoLnkgPSAtMTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvbnRyb2xsZXIuaW5wdXQuZG93bikge1xuICAgICAgICAgICAgICAgICAgICBoLnkgPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlRnVuYyA9IHRoaXMuc3RhdGVKdW1waW5nLmJpbmQodGhpcykoaCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAqc3RhdGVKdW1waW5nKGhlYWRpbmcpIHtcbiAgICAgICAgYm9uZy5wbGF5KCk7XG4gICAgICAgIGxldCB7eCwgeX0gPSBoZWFkaW5nO1xuICAgICAgICBsZXQgW2VuZFgsIGVuZFldID0gW3RoaXMueCArIHRoaXMuaGVpZ2h0KngsIHRoaXMueSArIHRoaXMuaGVpZ2h0KnldO1xuICAgICAgICBsZXQgdGltZVRvVGFrZSA9IDEwMDAvIDE4O1xuICAgICAgICBsZXQgdGltZSA9IDA7XG4gICAgICAgIHdoaWxlICh0aW1lIDwgdGltZVRvVGFrZSkge1xuICAgICAgICAgICAgbGV0IHtkdH0gPSB5aWVsZCBudWxsO1xuICAgICAgICAgICAgbGV0IGRkID0gZHQgLyB0aW1lVG9UYWtlO1xuICAgICAgICAgICAgdGltZSArPSBkdDtcbiAgICAgICAgICAgIHRoaXMueCArPSB0aGlzLndpZHRoICogeCAqIGRkO1xuICAgICAgICAgICAgdGhpcy55ICs9IHRoaXMuaGVpZ2h0ICogeSAqIGRkO1xuICAgICAgICB9XG4gICAgICAgIFt0aGlzLngsIHRoaXMueV0gPSBbZW5kWCwgZW5kWV07XG4gICAgICAgIGJvbmcucGF1c2UoKTtcbiAgICAgICAgYm9uZy5mYXN0U2VlaygwKTtcbiAgICB9XG5cbiAgICByZW5kZXIodGltZSwgY3R4KSB7XG4gICAgICAgIHN3aXRjaCh0aGlzLnN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlIFNUQVRFUy5qdW1waW5nOiB7XG4gICAgICAgICAgICAgICAgbGV0IGZyYW1lID0gdGhpcy5mcmFtZSAlICh0aGlzLmp1bXBpbmdTcHJpdGVzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgbGV0IHt4LCB5fSA9IHRoaXMuanVtcGluZ1Nwcml0ZXNbZnJhbWVdO1xuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlc2hlZXQsXG4gICAgICAgICAgICAgICAgICAgIHgsIHksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZyYW1lID09PSB0aGlzLmp1bXBpbmdTcHJpdGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFNUQVRFUy5pZGxlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FzZSBTVEFURVMuaWRsZToge1xuICAgICAgICAgICAgICAgIGlmIChjb250cm9sbGVyLmlzQW55UHJlc3NlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZnJhbWUgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVTLmp1bXBpbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGhhbmRsZSBibGlua2luZ1xuICAgICAgICAgICAgICAgIGxldCBmcmFtZSA9IE1hdGgubWluKHRoaXMuZnJhbWUgJSAodGhpcy5zaXR0aW5nU3ByaXRlcy5sZW5ndGggKyAyMCksIHRoaXMuc2l0dGluZ1Nwcml0ZXMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBmcmFtZSA9IGZyYW1lICUgdGhpcy5zaXR0aW5nU3ByaXRlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgbGV0IHt4LCB5fSA9IHRoaXMuc2l0dGluZ1Nwcml0ZXNbZnJhbWVdO1xuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICAgICAgICAgIC8vIGltYWdlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlc2hlZXQsXG4gICAgICAgICAgICAgICAgICAgIC8vIHNvdXJjZSByZWN0YW5nbGVcbiAgICAgICAgICAgICAgICAgICAgeCwgeSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIC8vIGRlc3RpbmF0aW9uIHJlY3RhbmdsZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IEltcGxlbWVudCB5b3VyIHBsYXllcidzIHJlZGVyaW5nIGFjY29yZGluZyB0byBzdGF0ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl19
