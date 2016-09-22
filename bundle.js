(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _game = require("./game.js");

var _player = require("./player.js");

var _car = require("./car.js");

var _button = require("./button.js");

var _flag = require("./flag.js");

var canvas = document.getElementById('screen');
let backdrop = new Image();
backdrop.src = encodeURI('assets/canvas.png');
var game = new _game.Game(canvas, update, render);
var player = new _player.Player({ x: 0, y: 256 }, game);
game.player = player;
var button = new _button.Button(game);
game.button = button;
var flag = new _flag.Flag(game);
game.flag = flag;
let cars = [button, flag];
for (let i = 1; i < 11; i++) {
    cars.push(new _car.Car(game, { heading: Math.floor((i + 1) / 2) % 2 === 0 ? -1 : 1, x: 64 * i, y: -1112 }));
}

var masterLoop = function (timestamp) {
    game.loop(timestamp);
    window.requestAnimationFrame(masterLoop);
};
masterLoop(performance.now());

function update(elapsedTime) {
    player.update(elapsedTime);
    button.update(elapsedTime);
    flag.update(elapsedTime);
    let hitBox = player.getHitBoxes()[0];
    for (let car of cars) {
        car.update(elapsedTime);
        if ((hitBox.x >= car.x && hitBox.x <= car.x + car.width - 1 || hitBox.x + hitBox.width - 1 >= car.x && hitBox.x + hitBox.width - 1 <= car.x + car.width - 1) && (hitBox.y >= car.y && hitBox.y <= car.y + car.height - 1 || hitBox.y + hitBox.height - 1 >= car.y && hitBox.y + hitBox.height - 1 <= car.y + car.height - 1)) {
            player.events.emit('collision', car);
            car.events.emit('collision', player);
        }
    }
}

function render(elapsedTime, ctx) {
    ctx.drawImage(backdrop, 0, 0);
    button.render(elapsedTime, ctx);
    player.render(elapsedTime, ctx);
    flag.render(elapsedTime, ctx);
    for (let car of cars) {
        car.render(elapsedTime, ctx);
    }
}

},{"./button.js":2,"./car.js":3,"./flag.js":7,"./game.js":8,"./player.js":9}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Button = undefined;

var _actor = require("./common/actor.js");

class Button extends _actor.Actor {
    constructor(world) {
        super(world);
        this.width = 64;
        this.height = 64;
        this.x = this.width * 11;
        this.y = this.height * 1;
        this.renderState = this.renderMain.bind(this)();
        this.controlState = this.controlMain.bind(this)();
        this.sprite = new Image();
        this.sprite.src = "./assets/button.png";
        this.events.addEventListener('collision', this.collide.bind(this));
    }

    collide(other) {
        this.world.flag.isUp = true;
    }

    *renderMain(ctx) {
        while (true) {
            let { dt, ctx } = yield null;
            ctx.drawImage(this.sprite, 0, 0, 124, 124, this.x, this.y, this.width, this.height);
        }
    }

    *controlMain() {
        while (true) {
            let { dt } = yield null;
        }
    }
}
exports.Button = Button;

},{"./common/actor.js":4}],3:[function(require,module,exports){
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
        this.delay = (4 * Math.random() | 0) * 1000;
        this.speed = .25;
        this.spriteNum = Math.floor(Math.random() * 4);
    }
}
exports.Car = Car;

},{"./common/actor.js":4}],4:[function(require,module,exports){
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

},{"./events.js":5}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Flag = undefined;

var _actor = require("./common/actor.js");

class Flag extends _actor.Actor {
    constructor(world) {
        super(world);
        this.width = 64;
        this.height = 64;
        this.x = this.width * 11;
        this.y = this.height * 5;
        this.renderState = this.renderMain.bind(this)();
        this.controlState = this.controlMain.bind(this)();
        this.sprite = new Image();
        this.sprite.src = "./assets/flag_down.png";
        this.spriteUp = new Image();
        this.spriteUp.src = "./assets/flag.png";
        this.isUp = false;
        this.events.addEventListener('collision', this.collide.bind(this));
    }

    collide(other) {
        if (this.isUp) {
            this.world.nextLevel();
        }
    }

    *renderMain(ctx) {
        while (true) {
            let { dt, ctx } = yield null;
            ctx.drawImage(this.isUp ? this.spriteUp : this.sprite, 0, 0, 124, 124, this.x, this.y, this.width, this.height);
        }
    }

    *controlMain() {
        while (true) {
            let { dt } = yield null;
        }
    }
}
exports.Flag = Flag;

},{"./common/actor.js":4}],8:[function(require,module,exports){
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

        this.width = this.frontBuffer.width;
        this.height = this.frontBuffer.height;

        // Start the game loop
        this.oldTime = performance.now();
        this.paused = false;
        this.level = 1;
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

    lose() {
        console.log('lose');
    }

    nextLevel() {
        console.log('next');
        this.level++;
    }
}
exports.Game = Game;

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Player = undefined;

var _input = require("./common/input.js");

var _events = require("./common/events.js");

var _car = require("./car.js");

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
        if (other.constructor === _car.Car) {
            this.world.lose();
        }
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

},{"./car.js":3,"./common/events.js":5,"./common/input.js":6}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2J1dHRvbi5qcyIsInNyYy9jYXIuanMiLCJzcmMvY29tbW9uL2FjdG9yLmpzIiwic3JjL2NvbW1vbi9ldmVudHMuanMiLCJzcmMvY29tbW9uL2lucHV0LmpzIiwic3JjL2ZsYWcuanMiLCJzcmMvZ2FtZS5qcyIsInNyYy9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQSxJQUFJLFNBQVMsU0FBUyxjQUFULENBQXdCLFFBQXhCLENBQWI7QUFDQSxJQUFJLFdBQVcsSUFBSSxLQUFKLEVBQWY7QUFDQSxTQUFTLEdBQVQsR0FBZSxVQUFVLG1CQUFWLENBQWY7QUFDQSxJQUFJLE9BQU8sZUFBUyxNQUFULEVBQWlCLE1BQWpCLEVBQXlCLE1BQXpCLENBQVg7QUFDQSxJQUFJLFNBQVMsbUJBQVcsRUFBQyxHQUFHLENBQUosRUFBTyxHQUFHLEdBQVYsRUFBWCxFQUEyQixJQUEzQixDQUFiO0FBQ0EsS0FBSyxNQUFMLEdBQWMsTUFBZDtBQUNBLElBQUksU0FBUyxtQkFBVyxJQUFYLENBQWI7QUFDQSxLQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsSUFBSSxPQUFPLGVBQVMsSUFBVCxDQUFYO0FBQ0EsS0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLElBQUksT0FBTyxDQUFDLE1BQUQsRUFBUyxJQUFULENBQVg7QUFDQSxLQUFLLElBQUksSUFBRSxDQUFYLEVBQWMsSUFBRSxFQUFoQixFQUFvQixHQUFwQixFQUF5QjtBQUNyQixTQUFLLElBQUwsQ0FBVSxhQUFRLElBQVIsRUFBYyxFQUFDLFNBQVUsS0FBSyxLQUFMLENBQVcsQ0FBQyxJQUFFLENBQUgsSUFBTSxDQUFqQixJQUFvQixDQUFwQixLQUF3QixDQUF4QixHQUEwQixDQUFDLENBQTNCLEdBQTZCLENBQXhDLEVBQTRDLEdB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QUFaO0FBQWtCO0FBQ2Qsd0JBQUksV0FBVyxZQUFYLEVBQUosRUFBK0I7QUFDM0IsNkJBQUssS0FBTCxHQUFhLENBQWI7QUFDQSw2QkFBSyxLQUFMLEdBQWEsT0FBTyxPQUFwQjtBQUNIO0FBQ0Q7QUFDQSx3QkFBSSxRQUFRLEtBQUssR0FBTCxDQUFTLEtBQUssS0FBTCxJQUFjLEtBQUssY0FBTCxDQUFvQixNQUFwQixHQUE2QixFQUEzQyxDQUFULEVBQXlELEtBQUssY0FBTCxDQUFvQixNQUE3RSxDQUFaO0FBQ0EsNEJBQVEsUUFBUSxLQUFLLGNBQUwsQ0FBb0IsTUFBcEM7QUFDQSx3QkFBSSxFQUFDLENBQUQsRUFBSSxDQUFKLEtBQVMsS0FBSyxjQUFMLENBQW9CLEtBQXBCLENBQWI7QUFDQSx3QkFBSSxTQUFKO0FBQ0k7QUFDQSx5QkFBSyxXQUZUO0FBR0k7QUFDQSxxQkFKSixFQUlPLENBSlAsRUFJVSxLQUFLLEtBSmYsRUFJc0IsS0FBSyxNQUozQjtBQUtJO0FBQ0EseUJBQUssQ0FOVCxFQU1ZLEtBQUssQ0FOakIsRUFNb0IsS0FBSyxLQU56QixFQU1nQyxLQUFLLE1BTnJDO0FBUUE7QUFDQTtBQUNIO0FBbkNMO0FBcUNIO0FBM0hlO1FBQVAsTSxHQUFBLE0iLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB7R2FtZX0gZnJvbSBcIi4vZ2FtZS5qc1wiO1xuaW1wb3J0IHtQbGF5ZXJ9IGZyb20gXCIuL3BsYXllci5qc1wiO1xuaW1wb3J0IHtDYXJ9IGZyb20gXCIuL2Nhci5qc1wiO1xuaW1wb3J0IHtCdXR0b259IGZyb20gXCIuL2J1dHRvbi5qc1wiO1xuaW1wb3J0IHtGbGFnfSBmcm9tIFwiLi9mbGFnLmpzXCI7XG5cbnZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NyZWVuJyk7XG5sZXQgYmFja2Ryb3AgPSBuZXcgSW1hZ2UoKTtcbmJhY2tkcm9wLnNyYyA9IGVuY29kZVVSSSgnYXNzZXRzL2NhbnZhcy5wbmcnKTtcbnZhciBnYW1lID0gbmV3IEdhbWUoY2FudmFzLCB1cGRhdGUsIHJlbmRlcik7XG52YXIgcGxheWVyID0gbmV3IFBsYXllcih7eDogMCwgeTogMjU2fSwgZ2FtZSk7XG5nYW1lLnBsYXllciA9IHBsYXllcjtcbnZhciBidXR0b24gPSBuZXcgQnV0dG9uKGdhbWUpO1xuZ2FtZS5idXR0b24gPSBidXR0b247XG52YXIgZmxhZyA9IG5ldyBGbGFnKGdhbWUpO1xuZ2FtZS5mbGFnID0gZmxhZztcbmxldCBjYXJzID0gW2J1dHRvbiwgZmxhZ107XG5mb3IgKGxldCBpPTE7IGk8MTE7IGkrKykge1xuICAgIGNhcnMucHVzaChuZXcgQ2FyKGdhbWUsIHtoZWFkaW5nOiAoTWF0aC5mbG9vcigoaSsxKS8yKSUyPT09MD8tMToxKSwgeDogNjQqaSwgeTogLTExMTJ9KSk7XG59XG5cbnZhciBtYXN0ZXJMb29wID0gZnVuY3Rpb24odGltZXN0YW1wKSB7XG4gICAgZ2FtZS5sb29wKHRpbWVzdGFtcCk7XG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtYXN0ZXJMb29wKTtcbn1cbm1hc3Rlckxvb3AocGVyZm9ybWFuY2Uubm93KCkpO1xuXG5mdW5jdGlvbiB1cGRhdGUoZWxhcHNlZFRpbWUpIHtcbiAgICBwbGF5ZXIudXBkYXRlKGVsYXBzZWRUaW1lKTtcbiAgICBidXR0b24udXBkYXRlKGVsYXBzZWRUaW1lKTtcbiAgICBmbGFnLnVwZGF0ZShlbGFwc2VkVGltZSk7XG4gICAgbGV0IGhpdEJveCA9IHBsYXllci5nZXRIaXRCb3hlcygpWzBdO1xuICAgIGZvciAobGV0IGNhciBvZiBjYXJzKSB7XG4gICAgICAgIGNhci51cGRhdGUoZWxhcHNlZFRpbWUpO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAoKGhpdEJveC54ID49IGNhci54ICYmIGhpdEJveC54IDw9IGNhci54ICsgY2FyLndpZHRoIC0xKSB8fCAoaGl0Qm94LnggKyBoaXRCb3gud2lkdGggLTEgPj0gY2FyLnggJiYgaGl0Qm94LnggKyBoaXRCb3gud2lkdGggLTEgPD0gY2FyLnggKyBjYXIud2lkdGggLTEpKSAmJlxuICAgICAgICAgICAgKChoaXRCb3gueSA+PSBjYXIueSAmJiBoaXRCb3gueSA8PSBjYXIueSArIGNhci5oZWlnaHQgLTEpIHx8IChoaXRCb3gueSArIGhpdEJveC5oZWlnaHQgLTEgPj0gY2FyLnkgJiYgaGl0Qm94LnkgKyBoaXRCb3guaGVpZ2h0IC0xIDw9IGNhci55ICsgY2FyLmhlaWdodCAtMSkpXG4gICAgICAgICkge1xuICAgICAgICAgICAgcGxheWVyLmV2ZW50cy5lbWl0KCdjb2xsaXNpb24nLCBjYXIpO1xuICAgICAgICAgICAgY2FyLmV2ZW50cy5lbWl0KCdjb2xsaXNpb24nLCBwbGF5ZXIpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXIoZWxhcHNlZFRpbWUsIGN0eCkge1xuICAgIGN0eC5kcmF3SW1hZ2UoYmFja2Ryb3AsIDAsIDApO1xuICAgIGJ1dHRvbi5yZW5kZXIoZWxhcHNlZFRpbWUsIGN0eCk7XG4gICAgcGxheWVyLnJlbmRlcihlbGFwc2VkVGltZSwgY3R4KTtcbiAgICBmbGFnLnJlbmRlcihlbGFwc2VkVGltZSwgY3R4KTtcbiAgICBmb3IgKGxldCBjYXIgb2YgY2Fycykge1xuICAgICAgICBjYXIucmVuZGVyKGVsYXBzZWRUaW1lLCBjdHgpXG4gICAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB7QWN0b3J9IGZyb20gXCIuL2NvbW1vbi9hY3Rvci5qc1wiO1xuXG5leHBvcnQgY2xhc3MgQnV0dG9uIGV4dGVuZHMgQWN0b3Ige1xuICAgIGNvbnN0cnVjdG9yKHdvcmxkKSB7XG4gICAgICAgIHN1cGVyKHdvcmxkKTtcbiAgICAgICAgdGhpcy53aWR0aCA9IDY0O1xuICAgICAgICB0aGlzLmhlaWdodCA9IDY0O1xuICAgICAgICB0aGlzLnggPSB0aGlzLndpZHRoICogMTE7XG4gICAgICAgIHRoaXMueSA9IHRoaXMuaGVpZ2h0ICogMTtcbiAgICAgICAgdGhpcy5yZW5kZXJTdGF0ZSA9IHRoaXMucmVuZGVyTWFpbi5iaW5kKHRoaXMpKCk7XG4gICAgICAgIHRoaXMuY29udHJvbFN0YXRlID0gdGhpcy5jb250cm9sTWFpbi5iaW5kKHRoaXMpKCk7XG4gICAgICAgIHRoaXMuc3ByaXRlID0gbmV3IEltYWdlKCk7XG4gICAgICAgIHRoaXMuc3ByaXRlLnNyYyA9IFwiLi9hc3NldHMvYnV0dG9uLnBuZ1wiO1xuICAgICAgICB0aGlzLmV2ZW50cy5hZGRFdmVudExpc3RlbmVyKCdjb2xsaXNpb24nLCB0aGlzLmNvbGxpZGUuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgY29sbGlkZShvdGhlcikge1xuICAgICAgICB0aGlzLndvcmxkLmZsYWcuaXNVcCA9IHRydWU7XG4gICAgfVxuXG4gICAgKnJlbmRlck1haW4oY3R4KSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBsZXQge2R0LCBjdHh9ID0geWllbGQgbnVsbDtcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGUsXG4gICAgICAgICAgICAgICAgMCwgMCwgMTI0LCAxMjQsXG4gICAgICAgICAgICAgICAgdGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgKmNvbnRyb2xNYWluKCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgbGV0IHtkdH0gPSB5aWVsZCBudWxsO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB7QWN0b3J9IGZyb20gXCIuL2NvbW1vbi9hY3Rvci5qc1wiO1xuXG5cbmV4cG9ydCBjbGFzcyBDYXIgZXh0ZW5kcyBBY3RvciB7XG4gICAgY29uc3RydWN0b3Iod29ybGQsIGFyZ3MpIHtcbiAgICAgICAgbGV0IHt4LCB5LCBoZWFkaW5nfSA9IGFyZ3M7XG4gICAgICAgIHN1cGVyKHdvcmxkKVxuICAgICAgICB0aGlzLmNvbnRyb2xTdGF0ZSA9IHRoaXMuY29udHJvbERyaXZlLmJpbmQodGhpcykoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJTdGF0ZSA9IHRoaXMucmVuZGVyRHJpdmUuYmluZCh0aGlzKSgpO1xuICAgICAgICB0aGlzLnNwcml0ZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICB0aGlzLnNwcml0ZS5zcmMgPSBlbmNvZGVVUkkoJy4vYXNzZXRzL2NhcnNfbWluaS5zdmcnKTtcbiAgICAgICAgdGhpcy53aWR0aCA9IDY0O1xuICAgICAgICB0aGlzLmhlaWdodCA9IDExMjtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgdGhpcy5oZWFkaW5nID0gaGVhZGluZztcbiAgICAgICAgdGhpcy5zcGVlZCA9IDE7XG4gICAgICAgIHRoaXMuc3ByaXRlTnVtID0gMDtcbiAgICAgICAgdGhpcy5kZWxheSA9IDA7XG4gICAgICAgIHRoaXMucmVJbml0KCk7XG4gICAgfVxuXG4gICAgY29sbGVjdCgpIHtcbiAgICAgICAgaWYgKHRoaXMueSt0aGlzLmhlaWdodCA8IDAgfHwgdGhpcy54K3RoaXMud2lkdGggPCAwIHx8XG4gICAgICAgICAgICAgICAgdGhpcy54ID4gdGhpcy53b3JsZC53aWR0aCB8fCB0aGlzLnkgPiB0aGlzLndvcmxkLmhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5yZUluaXQoKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0SGl0Qm94ZXMoKSB7XG4gICAgICAgIHJldHVybiBbe3g6IHRoaXMueCwgeTogdGhpcy55LCB3aWR0aDogdGhpcy53aWR0aCwgaGVpZ2h0OiB0aGlzLmhlaWdodCwgb2JqOiB0aGlzfV07XG4gICAgfVxuXG4gICAgKmNvbnRyb2xEcml2ZSgpIHtcbiAgICAgICAgdGhpcy5yZUluaXQoKTtcbiAgICAgICAgbGV0IHRpbWUgPSAwO1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgbGV0IHtkdH09IHlpZWxkIG51bGw7XG4gICAgICAgICAgICB0aW1lICs9IGR0O1xuICAgICAgICAgICAgaWYgKHRpbWUgPCB0aGlzLmRlbGF5KSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnkgKz0gdGhpcy5oZWFkaW5nICogdGhpcy5zcGVlZCAqIDQwMCAqIGR0IC8gMTAwMDtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbGxlY3QoKSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmhlYWRpbmcgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy55ID0gMS10aGlzLmhlaWdodDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnkgPSB0aGlzLndvcmxkLmhlaWdodDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29udHJvbERyaXZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAqcmVuZGVyRHJpdmUoY3R4KSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBsZXQge2R0LCBjdHh9ID0geWllbGQgbnVsbDtcbiAgICAgICAgICAgIGN0eC5zYXZlKClcbiAgICAgICAgICAgIGlmICh0aGlzLmhlYWRpbmcgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBjdHgudHJhbnNsYXRlKHRoaXMueCt0aGlzLndpZHRoLCB0aGlzLnkrdGhpcy5oZWlnaHQpO1xuICAgICAgICAgICAgICAgIGN0eC5yb3RhdGUoTWF0aC5QSSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSh0aGlzLngsIHRoaXMueSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKFxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlLFxuICAgICAgICAgICAgICAgIDI0Nyp0aGlzLnNwcml0ZU51bSwgMCwgMjAwLCAzNTAsXG4gICAgICAgICAgICAgICAgMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHRcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlSW5pdCgpIHtcbiAgICAgICAgdGhpcy5kZWxheSA9ICgoNCAqIE1hdGgucmFuZG9tKCkpfDApICogMTAwMDtcbiAgICAgICAgdGhpcy5zcGVlZCA9IC4yNTtcbiAgICAgICAgdGhpcy5zcHJpdGVOdW0gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA0KTtcbiAgICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHtFdmVudExpc3RlbmVyfSBmcm9tIFwiLi9ldmVudHMuanNcIjtcblxuXG5leHBvcnQgY2xhc3MgQWN0b3Ige1xuICAgIGNvbnN0cnVjdG9yKHdvcmxkKSB7XG4gICAgICAgIHRoaXMuYmFzZUNvbnRyb2xTdGF0ZSA9IG51bGw7XG4gICAgICAgIHRoaXMuYmFzZVJlbmRlclN0YXRlID0gbnVsbDtcbiAgICAgICAgdGhpcy5jb250cm9sU3RhdGUgPSBudWxsO1xuICAgICAgICB0aGlzLnJlbmRlclN0YXRlID0gbnVsbDtcbiAgICAgICAgdGhpcy5ldmVudHMgPSBuZXcgRXZlbnRMaXN0ZW5lcigpO1xuXG4gICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcbiAgICAgICAgdGhpcy54ID0gMDtcbiAgICAgICAgdGhpcy55ID0gMDtcbiAgICAgICAgdGhpcy53aWR0aCA9IDY0O1xuICAgICAgICB0aGlzLmhlaWdodCA9IDY0O1xuICAgIH1cblxuICAgIGdldEhpdEJveGVzKCkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29sbGVjdCgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHVwZGF0ZShkdCkge1xuICAgICAgICBsZXQgY3VyID0gdGhpcy5jb250cm9sU3RhdGUubmV4dCh7ZHQ6IGR0fSk7XG4gICAgICAgIGlmIChjdXIudmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuY29udHJvbFN0YXRlID0gY3VyLnZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKGN1ci5kb25lKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xTdGF0ZSA9IHRoaXMuYmFzZUNvbnRyb2xTdGF0ZS5iaW5kKHRoaXMpKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoZHQsIGN0eCkge1xuICAgICAgICBsZXQgY3VyID0gdGhpcy5yZW5kZXJTdGF0ZS5uZXh0KHtkdDogZHQsIGN0eDogY3R4fSk7XG4gICAgICAgIGlmIChjdXIudmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyU3RhdGUgPSBjdXIudmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VyLmRvbmUpIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyU3RhdGUgPSB0aGlzLmJhc2VSZW5kZXJTdGF0ZS5iaW5kKHRoaXMpKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuXG5leHBvcnQgY2xhc3MgRXZlbnRMaXN0ZW5lciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZXZlbnRzID0ge307XG4gICAgfVxuXG4gICAgYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBmdW5jKSB7XG4gICAgICAgIGxldCBldmVudHMgPSB0aGlzLmV2ZW50c1tuYW1lXSB8fCBbXTtcbiAgICAgICAgdGhpcy5ldmVudHNbbmFtZV0gPSBldmVudHM7XG5cbiAgICAgICAgZXZlbnRzLnB1c2goZnVuYyk7XG4gICAgfVxuXG4gICAgZW1pdChuYW1lLCBhcmdzKSB7XG4gICAgICAgIGxldCBldmVudHMgPSB0aGlzLmV2ZW50c1tuYW1lXSB8fCBbXTtcbiAgICAgICAgZm9yIChsZXQgZXYgb2YgZXZlbnRzKSB7XG4gICAgICAgICAgICBldihhcmdzKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnQgY2xhc3MgQ29udHJvbGxlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuaW5wdXQgPSB7XG4gICAgICAgICAgICB1cDogZmFsc2UsXG4gICAgICAgICAgICBkb3duOiBmYWxzZSxcbiAgICAgICAgICAgIHJpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgIGxlZnQ6IGZhbHNlLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgaXNBbnlQcmVzc2VkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC51cCB8XG4gICAgICAgICAgICB0aGlzLmlucHV0LmRvd24gfFxuICAgICAgICAgICAgdGhpcy5pbnB1dC5yaWdodCB8XG4gICAgICAgICAgICB0aGlzLmlucHV0LmxlZnQ7XG4gICAgfVxuXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuc2F2ZWRJbnB1dCA9IHtcbiAgICAgICAgICAgIHVwOiBmYWxzZSxcbiAgICAgICAgICAgIGRvd246IGZhbHNlLFxuICAgICAgICAgICAgcmlnaHQ6IGZhbHNlLFxuICAgICAgICAgICAgbGVmdDogZmFsc2VcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhdHRhY2goKSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgcHJldmVudERlZmF1bHQgPSBmYWxzZVxuICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAzODogY2FzZSA4NzogLy8gVXBcbiAgICAgICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQudXAgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZWRJbnB1dC51cCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlIDM3OiBjYXNlIDY1OiAvL0xlZnRcbiAgICAgICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQubGVmdCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlZElucHV0LmxlZnQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSAzOTogY2FzZSA2ODogLy8gUmlnaHRcbiAgICAgICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQucmlnaHQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZWRJbnB1dC5yaWdodCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlIDQwOiBjYXNlIDgzOiAvLyBEb3duXG4gICAgICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LmRvd24gPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZWRJbnB1dC5kb3duID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMzg6IGNhc2UgODc6IC8vIFVwXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQudXAgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgMzc6IGNhc2UgNjU6IC8vTGVmdFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LmxlZnQgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgMzk6IGNhc2UgNjg6IC8vIFJpZ2h0XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQucmlnaHQgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgNDA6IGNhc2UgODM6IC8vIERvd25cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5kb3duID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB7QWN0b3J9IGZyb20gXCIuL2NvbW1vbi9hY3Rvci5qc1wiO1xuXG5leHBvcnQgY2xhc3MgRmxhZyBleHRlbmRzIEFjdG9yIHtcbiAgICBjb25zdHJ1Y3Rvcih3b3JsZCkge1xuICAgICAgICBzdXBlcih3b3JsZCk7XG4gICAgICAgIHRoaXMud2lkdGggPSA2NDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSA2NDtcbiAgICAgICAgdGhpcy54ID0gdGhpcy53aWR0aCAqIDExO1xuICAgICAgICB0aGlzLnkgPSB0aGlzLmhlaWdodCAqIDU7XG4gICAgICAgIHRoaXMucmVuZGVyU3RhdGUgPSB0aGlzLnJlbmRlck1haW4uYmluZCh0aGlzKSgpO1xuICAgICAgICB0aGlzLmNvbnRyb2xTdGF0ZSA9IHRoaXMuY29udHJvbE1haW4uYmluZCh0aGlzKSgpO1xuICAgICAgICB0aGlzLnNwcml0ZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICB0aGlzLnNwcml0ZS5zcmMgPSBcIi4vYXNzZXRzL2ZsYWdfZG93bi5wbmdcIjtcbiAgICAgICAgdGhpcy5zcHJpdGVVcCA9IG5ldyBJbWFnZSgpO1xuICAgICAgICB0aGlzLnNwcml0ZVVwLnNyYyA9IFwiLi9hc3NldHMvZmxhZy5wbmdcIjtcbiAgICAgICAgdGhpcy5pc1VwID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZXZlbnRzLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbGxpc2lvbicsIHRoaXMuY29sbGlkZS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBjb2xsaWRlKG90aGVyKSB7XG4gICAgICAgIGlmICh0aGlzLmlzVXApIHtcbiAgICAgICAgICAgIHRoaXMud29ybGQubmV4dExldmVsKClcbiAgICAgICAgfVxuICAgIH1cblxuICAgICpyZW5kZXJNYWluKGN0eCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgbGV0IHtkdCwgY3R4fSA9IHlpZWxkIG51bGw7XG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKFxuICAgICAgICAgICAgICAgIHRoaXMuaXNVcD8gdGhpcy5zcHJpdGVVcDogdGhpcy5zcHJpdGUsXG4gICAgICAgICAgICAgICAgMCwgMCwgMTI0LCAxMjQsXG4gICAgICAgICAgICAgICAgdGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgKmNvbnRyb2xNYWluKCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgbGV0IHtkdH0gPSB5aWVsZCBudWxsO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cblxuZXhwb3J0IGNsYXNzIEdhbWUge1xuICAgIGNvbnN0cnVjdG9yKHNjcmVlbiwgdXBkYXRlRnVuY3Rpb24sIHJlbmRlckZ1bmN0aW9uKSB7XG5cbiAgICAgICAgdGhpcy51cGRhdGUgPSB1cGRhdGVGdW5jdGlvbjtcbiAgICAgICAgdGhpcy5yZW5kZXIgPSByZW5kZXJGdW5jdGlvbjtcblxuICAgICAgICAvLyBTZXQgdXAgYnVmZmVyc1xuICAgICAgICB0aGlzLmZyb250QnVmZmVyID0gc2NyZWVuO1xuICAgICAgICB0aGlzLmZyb250Q3R4ID0gc2NyZWVuLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIHRoaXMuYmFja0J1ZmZlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICB0aGlzLmJhY2tCdWZmZXIud2lkdGggPSBzY3JlZW4ud2lkdGg7XG4gICAgICAgIHRoaXMuYmFja0J1ZmZlci5oZWlnaHQgPSBzY3JlZW4uaGVpZ2h0O1xuICAgICAgICB0aGlzLmJhY2tDdHggPSB0aGlzLmJhY2tCdWZmZXIuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICB0aGlzLndpZHRoID0gdGhpcy5mcm9udEJ1ZmZlci53aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLmZyb250QnVmZmVyLmhlaWdodDtcblxuICAgICAgICAvLyBTdGFydCB0aGUgZ2FtZSBsb29wXG4gICAgICAgIHRoaXMub2xkVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmxldmVsID0gMTtcbiAgICB9XG5cbiAgICBwYXVzZShmbGFnKSB7XG4gICAgICAgIHRoaXMucGF1c2VkID0gKGZsYWcgPT0gdHJ1ZSk7XG4gICAgfVxuXG4gICAgbG9vcChuZXdUaW1lKSB7XG4gICAgICAgIHZhciBnYW1lID0gdGhpcztcbiAgICAgICAgdmFyIGVsYXBzZWRUaW1lID0gbmV3VGltZSAtIHRoaXMub2xkVGltZTtcbiAgICAgICAgdGhpcy5vbGRUaW1lID0gbmV3VGltZTtcblxuICAgICAgICBpZighdGhpcy5wYXVzZWQpIHRoaXMudXBkYXRlKGVsYXBzZWRUaW1lKTtcbiAgICAgICAgdGhpcy5yZW5kZXIoZWxhcHNlZFRpbWUsIHRoaXMuZnJvbnRDdHgpO1xuXG4gICAgICAgIC8vIEZsaXAgdGhlIGJhY2sgYnVmZmVyXG4gICAgICAgIHRoaXMuZnJvbnRDdHguZHJhd0ltYWdlKHRoaXMuYmFja0J1ZmZlciwgMCwgMCk7XG4gICAgfVxuXG4gICAgbG9zZSgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2xvc2UnKVxuICAgIH1cblxuICAgIG5leHRMZXZlbCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ25leHQnKVxuICAgICAgICB0aGlzLmxldmVsKys7XG4gICAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB7Q29udHJvbGxlcn0gZnJvbSBcIi4vY29tbW9uL2lucHV0LmpzXCI7XG5pbXBvcnQge0V2ZW50TGlzdGVuZXJ9IGZyb20gXCIuL2NvbW1vbi9ldmVudHMuanNcIjtcbmltcG9ydCB7Q2FyfSBmcm9tIFwiLi9jYXIuanNcIjtcblxuY29uc3QgTVNfUEVSX0ZSQU1FID0gMTAwMC8xNjtcblxuY29uc3QgU1RBVEVTID0ge1xuICAgIGlkbGU6IFN5bWJvbCgpLFxuICAgIHdhbGtpbmc6IFN5bWJvbCgpLFxuICAgIGJsaW5raW5nOiBTeW1ib2woKSxcbiAgICBqdW1waW5nOiBTeW1ib2woKSxcbn1cblxubGV0IGF1ZGlvQ29udGV4dCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcblxubGV0IGNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcigpO1xuY29udHJvbGxlci5hdHRhY2goKTtcblxuXG5cbmxldCBib25nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmJvbmcuc3JjID0gZW5jb2RlVVJJKCdhc3NldHMvYm9uZy5vZ2cnKTtcblxubGV0IG11c2ljID0gbmV3IEF1ZGlvKGVuY29kZVVSSSgnYXNzZXRzL2JnbV9hY3Rpb25fMi5tcDMnKSk7XG5tdXNpYy5sb29wID0gdHJ1ZTtcbm11c2ljLnBsYXkoKTtcblxuKCgpPT57XG52YXIgYXVkaW9DdHggPSBuZXcgd2luZG93LkF1ZGlvQ29udGV4dCgpO1xud2luZG93LmF1ZGlvID0gYXVkaW9DdHg7XG52YXIgZ2Fpbk5vZGUgPSBhdWRpb0N0eC5jcmVhdGVHYWluKCk7XG5nYWluTm9kZS5nYWluLnZhbHVlID0gMS4wO1xuZ2Fpbk5vZGUuY29ubmVjdChhdWRpb0N0eC5kZXN0aW5hdGlvbik7XG5cbmxldCBib25nU291cmNlID0gYXVkaW9DdHguY3JlYXRlTWVkaWFFbGVtZW50U291cmNlKGJvbmcpO1xuYm9uZ1NvdXJjZS5jb25uZWN0KGdhaW5Ob2RlKTtcblxubGV0IG11c2ljU291cmNlID0gYXVkaW9DdHguY3JlYXRlTWVkaWFFbGVtZW50U291cmNlKG11c2ljKTtcbm11c2ljU291cmNlLmNvbm5lY3QoZ2Fpbk5vZGUpO1xufSkoKVxuXG5leHBvcnQgY2xhc3MgUGxheWVyIHtcbiAgICBjb25zdHJ1Y3Rvcihwb3NpdGlvbiwgd29ybGQpIHtcbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVTLmlkbGU7XG4gICAgICAgIHRoaXMuc3RhdGVGdW5jID0gdGhpcy5zdGF0ZUlkbGUuYmluZCh0aGlzKSgpO1xuICAgICAgICB0aGlzLnggPSBwb3NpdGlvbi54O1xuICAgICAgICB0aGlzLnkgPSBwb3NpdGlvbi55O1xuICAgICAgICB0aGlzLndpZHRoICA9IDY0O1xuICAgICAgICB0aGlzLmhlaWdodCA9IDY0O1xuICAgICAgICB0aGlzLnNwcml0ZXNoZWV0ICA9IG5ldyBJbWFnZSgpO1xuICAgICAgICB0aGlzLnNwcml0ZXNoZWV0LnNyYyA9IGVuY29kZVVSSSgnYXNzZXRzL1BsYXllclNwcml0ZTIucG5nJyk7XG4gICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICAgICAgdGhpcy5ldmVudHMgPSBuZXcgRXZlbnRMaXN0ZW5lcigpO1xuICAgICAgICB0aGlzLnNpdHRpbmdTcHJpdGVzID0gW3t4OiA2NCozLCB5OiA2NH0sIHt4OiA2NCowLCB5OiA2NH0sIHt4OiA2NCoxLCB5OiA2NH0sIHt4OiA2NCoyLCB5OiA2NH0sIHt4OiA2NCoxLCB5OiA2NH0sIHt4OiA2NCowLCB5OiA2NH1dO1xuICAgICAgICB0aGlzLmp1bXBpbmdTcHJpdGVzID0gW3t4OiA2NCozLCB5OiAwfSwge3g6IDY0KjIsIHk6IDB9LCB7eDogNjQqMSwgeTogMH0sIHt4OiA2NCowLCB5OiAwfSwge3g6IDY0KjEsIHk6IDB9LCB7eDogNjQqMiwgeTogMH0sIHt4OiA2NCozLCB5OiAwfV07XG4gICAgICAgIHRoaXMuZXZlbnRzLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbGxpc2lvbicsIHRoaXMuY29sbGlkZS5iaW5kKHRoaXMpKVxuICAgIH1cblxuICAgIGNvbGxpZGUob3RoZXIpIHtcbiAgICAgICAgaWYgKG90aGVyLmNvbnN0cnVjdG9yID09PSBDYXIpIHtcbiAgICAgICAgICAgIHRoaXMud29ybGQubG9zZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlKHRpbWUpIHtcbiAgICAgICAgdGhpcy50aW1lciArPSB0aW1lO1xuICAgICAgICBsZXQgbmV3RnJhbWUgPSBmYWxzZTtcbiAgICAgICAgaWYodGhpcy50aW1lciA+IE1TX1BFUl9GUkFNRSkge1xuICAgICAgICAgICAgdGhpcy50aW1lciA9IDA7XG4gICAgICAgICAgICB0aGlzLmZyYW1lKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY3VyID0gdGhpcy5zdGF0ZUZ1bmMubmV4dCh7ZHQ6IHRpbWV9KTtcbiAgICAgICAgaWYgKGN1ci5kb25lKSB7XG4gICAgICAgICAgIHRoaXMuc3RhdGVGdW5jID0gdGhpcy5zdGF0ZUlkbGUuYmluZCh0aGlzKSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1ci52YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZUZ1bmMgPSBjdXIudmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRIaXRCb3hlcygpIHtcbiAgICAgICAgcmV0dXJuIFt7eDogdGhpcy54LCB5OiB0aGlzLnksIHdpZHRoOiB0aGlzLndpZHRoLCBoZWlnaHQ6IHRoaXMuaGVpZ2h0LCBvYmo6IHRoaXN9XTtcbiAgICB9XG5cbiAgICAqc3RhdGVJZGxlKCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgbGV0IHtkdH0gPSB5aWVsZCBudWxsO1xuXG4gICAgICAgICAgICBpZiAoY29udHJvbGxlci5pc0FueVByZXNzZWQoKSkge1xuICAgICAgICAgICAgICAgIGxldCBoID0ge3g6IDAsIHk6IDB9O1xuICAgICAgICAgICAgICAgIGlmIChjb250cm9sbGVyLmlucHV0LnJpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIGgueCA9IDE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb250cm9sbGVyLmlucHV0LmxlZnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaC54ID0gLTE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb250cm9sbGVyLmlucHV0LnVwKSB7XG4gICAgICAgICAgICAgICAgICAgIGgueSA9IC0xO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29udHJvbGxlci5pbnB1dC5kb3duKSB7XG4gICAgICAgICAgICAgICAgICAgIGgueSA9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGVGdW5jID0gdGhpcy5zdGF0ZUp1bXBpbmcuYmluZCh0aGlzKShoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgICpzdGF0ZUp1bXBpbmcoaGVhZGluZykge1xuICAgICAgICBib25nLnBsYXkoKTtcbiAgICAgICAgbGV0IHt4LCB5fSA9IGhlYWRpbmc7XG4gICAgICAgIGxldCBbZW5kWCwgZW5kWV0gPSBbdGhpcy54ICsgdGhpcy5oZWlnaHQqeCwgdGhpcy55ICsgdGhpcy5oZWlnaHQqeV07XG4gICAgICAgIGxldCB0aW1lVG9UYWtlID0gMTAwMC8gMTg7XG4gICAgICAgIGxldCB0aW1lID0gMDtcbiAgICAgICAgd2hpbGUgKHRpbWUgPCB0aW1lVG9UYWtlKSB7XG4gICAgICAgICAgICBsZXQge2R0fSA9IHlpZWxkIG51bGw7XG4gICAgICAgICAgICBsZXQgZGQgPSBkdCAvIHRpbWVUb1Rha2U7XG4gICAgICAgICAgICB0aW1lICs9IGR0O1xuICAgICAgICAgICAgdGhpcy54ICs9IHRoaXMud2lkdGggKiB4ICogZGQ7XG4gICAgICAgICAgICB0aGlzLnkgKz0gdGhpcy5oZWlnaHQgKiB5ICogZGQ7XG4gICAgICAgIH1cbiAgICAgICAgW3RoaXMueCwgdGhpcy55XSA9IFtlbmRYLCBlbmRZXTtcbiAgICAgICAgYm9uZy5wYXVzZSgpO1xuICAgICAgICBib25nLmZhc3RTZWVrKDApO1xuICAgIH1cblxuICAgIHJlbmRlcih0aW1lLCBjdHgpIHtcbiAgICAgICAgc3dpdGNoKHRoaXMuc3RhdGUpIHtcbiAgICAgICAgICAgIGNhc2UgU1RBVEVTLmp1bXBpbmc6IHtcbiAgICAgICAgICAgICAgICBsZXQgZnJhbWUgPSB0aGlzLmZyYW1lICUgKHRoaXMuanVtcGluZ1Nwcml0ZXMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBsZXQge3gsIHl9ID0gdGhpcy5qdW1waW5nU3ByaXRlc1tmcmFtZV07XG4gICAgICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVzaGVldCxcbiAgICAgICAgICAgICAgICAgICAgeCwgeSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZnJhbWUgPT09IHRoaXMuanVtcGluZ1Nwcml0ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZnJhbWUgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVTLmlkbGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYXNlIFNUQVRFUy5pZGxlOiB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRyb2xsZXIuaXNBbnlQcmVzc2VkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mcmFtZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBTVEFURVMuanVtcGluZztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gaGFuZGxlIGJsaW5raW5nXG4gICAgICAgICAgICAgICAgbGV0IGZyYW1lID0gTWF0aC5taW4odGhpcy5mcmFtZSAlICh0aGlzLnNpdHRpbmdTcHJpdGVzLmxlbmd0aCArIDIwKSwgdGhpcy5zaXR0aW5nU3ByaXRlcy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGZyYW1lID0gZnJhbWUgJSB0aGlzLnNpdHRpbmdTcHJpdGVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBsZXQge3gsIHl9ID0gdGhpcy5zaXR0aW5nU3ByaXRlc1tmcmFtZV07XG4gICAgICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShcbiAgICAgICAgICAgICAgICAgICAgLy8gaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVzaGVldCxcbiAgICAgICAgICAgICAgICAgICAgLy8gc291cmNlIHJlY3RhbmdsZVxuICAgICAgICAgICAgICAgICAgICB4LCB5LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgLy8gZGVzdGluYXRpb24gcmVjdGFuZ2xlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogSW1wbGVtZW50IHlvdXIgcGxheWVyJ3MgcmVkZXJpbmcgYWNjb3JkaW5nIHRvIHN0YXRlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=
