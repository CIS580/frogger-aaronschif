(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _game = require("./game.js");

var _player = require("./player.js");

var _car = require("./car.js");

var _button = require("./button.js");

var _flag = require("./flag.js");

var canvas = document.getElementById('screen');
var game = new _game.Game(canvas);

var masterLoop = function (timestamp) {
    game.loop(timestamp);
    window.requestAnimationFrame(masterLoop);
};
masterLoop(performance.now());

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
        this.speed = .25 * this.world.level;
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
exports.Game = undefined;

var _player = require("./player.js");

var _car = require("./car.js");

var _button = require("./button.js");

var _flag = require("./flag.js");

let backdrop = new Image();
backdrop.src = encodeURI('assets/canvas.png');

class Game {
    constructor(screen) {
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
        this.level = 0;
        this.lives = 3;

        this.endTimeout = 0;

        this.nextLevel();
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
        this.endTimeout = 4000;
        this.level = 0;
        this.lives = 3;
        this.nextLevel();
        console.log('lose');
    }

    die() {
        console.log('die');
        this.lives--;
        if (this.lives <= 0) {
            this.lose();
        }
        this.start();
    }

    nextLevel() {
        console.log('next');
        this.level++;
        this.start();
    }

    start() {
        this.player = new _player.Player({ x: 0, y: 256 }, this);
        this.button = new _button.Button(this);
        this.flag = new _flag.Flag(this);
        this.cars = [this.button, this.flag];
        for (let i = 1; i < 11; i++) {
            this.cars.push(new _car.Car(this, { heading: Math.floor((i + 1) / 2) % 2 === 0 ? -1 : 1, x: 64 * i, y: -1112 }));
        }
    }

    update(elapsedTime) {
        if (this.endTimeout > 0) {
            return;
        }
        this.player.update(elapsedTime);
        this.button.update(elapsedTime);
        this.flag.update(elapsedTime);
        let hitBox = this.player.getHitBoxes()[0];
        for (let car of this.cars) {
            car.update(elapsedTime);
            if ((hitBox.x >= car.x && hitBox.x <= car.x + car.width - 1 || hitBox.x + hitBox.width - 1 >= car.x && hitBox.x + hitBox.width - 1 <= car.x + car.width - 1) && (hitBox.y >= car.y && hitBox.y <= car.y + car.height - 1 || hitBox.y + hitBox.height - 1 >= car.y && hitBox.y + hitBox.height - 1 <= car.y + car.height - 1)) {
                this.player.events.emit('collision', car);
                car.events.emit('collision', this.player);
            }
        }
    }

    render(elapsedTime, ctx) {
        if (this.endTimeout > 0) {
            this.endTimeout -= elapsedTime;
            ctx.fillStyle = `rgba(0, 0, 0, 0.1)`;
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.fillStyle = `rgba(255, 0, 0, 0.1)`;
            ctx.fillText("loser", 400, 200);
            return;
        }
        ctx.drawImage(backdrop, 0, 0);
        this.button.render(elapsedTime, ctx);
        this.flag.render(elapsedTime, ctx);
        for (let car of this.cars) {
            car.render(elapsedTime, ctx);
        }
        this.player.render(elapsedTime, ctx);
        ctx.fillStyle = 'black';
        ctx.fillText(this.lives + ' Lives', 710, 40);
        ctx.fillText('Level ' + this.level, 710, 20);
    }
}
exports.Game = Game;

},{"./button.js":2,"./car.js":3,"./flag.js":7,"./player.js":9}],9:[function(require,module,exports){
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
            this.world.die();
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
        // bong.fastSeek(0);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2J1dHRvbi5qcyIsInNyYy9jYXIuanMiLCJzcmMvY29tbW9uL2FjdG9yLmpzIiwic3JjL2NvbW1vbi9ldmVudHMuanMiLCJzcmMvY29tbW9uL2lucHV0LmpzIiwic3JjL2ZsYWcuanMiLCJzcmMvZ2FtZS5qcyIsInNyYy9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQSxJQUFJLFNBQVMsU0FBUyxjQUFULENBQXdCLFFBQXhCLENBQWI7QUFDQSxJQUFJLE9BQU8sZUFBUyxNQUFULENBQVg7O0FBR0EsSUFBSSxhQUFhLFVBQVMsU0FBVCxFQUFvQjtBQUNqQyxTQUFLLElBQUwsQ0FBVSxTQUFWO0FBQ0EsV0FBTyxxQkFBUCxDQUE2QixVQUE3QjtBQUNILENBSEQ7QUFJQSxXQUFXLFlBQVksR0FBWixFQUFYOzs7QUNoQkE7Ozs7Ozs7QUFFQTs7QUFFTyxNQUFNLE1BQU4sc0JBQTJCO0FBQzlCLGdCQUFZLEtBQVosRUFBbUI7QUFDZixjQUFNLEtBQU47QUFDQSxhQUFLLEtBQUwsR0FBYSxFQUFiO0FBQ0EsYUFBSyxNQUFMLEdBQWMsRUFBZDtBQUNBLGFBQUssQ0FBTCxHQUFTLEtBQUssS0FBTCxHQUFhLEVBQXRCO0FBQ0EsYUFBSyxDQUFMLEdBQVMsS0FBSyxNQUFMLEdBQWMsQ0FBdkI7QUFDQSxhQUFLLFdBQUwsR0FBbUIsS0FBSyxVQUFMLENBQWdCLElBQWhCLENBQXFCLElBQXJCLEdBQW5CO0FBQ0EsYUFBSyxZQUFMLEdBQW9CLEtBQUssV0FBTCxDQUFpQixJQUFqQixDQUFzQixJQUF0QixHQUFwQjtBQUNBLGFBQUssTUFBTCxHQUFjLElBQUksS0FBSixFQUFkO0FBQ0EsYUFBSyxNQUFMLENBQVksR0FBWixHQUFrQixxQkFBbEI7QUFDQSxhQUFLLE1BQUwsQ0FB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LENBQVMsS0FBSyxLQUFMLElBQWMsS0FBSyxjQUFMLENBQW9CLE1BQXBCLEdBQTZCLEVBQTNDLENBQVQsRUFBeUQsS0FBSyxjQUFMLENBQW9CLE1BQTdFLENBQVo7QUFDQSw0QkFBUSxRQUFRLEtBQUssY0FBTCxDQUFvQixNQUFwQztBQUNBLHdCQUFJLEVBQUMsQ0FBRCxFQUFJLENBQUosS0FBUyxLQUFLLGNBQUwsQ0FBb0IsS0FBcEIsQ0FBYjtBQUNBLHdCQUFJLFNBQUo7QUFDSTtBQUNBLHlCQUFLLFdBRlQ7QUFHSTtBQUNBLHFCQUpKLEVBSU8sQ0FKUCxFQUlVLEtBQUssS0FKZixFQUlzQixLQUFLLE1BSjNCO0FBS0k7QUFDQSx5QkFBSyxDQU5ULEVBTVksS0FBSyxDQU5qQixFQU1vQixLQUFLLEtBTnpCLEVBTWdDLEtBQUssTUFOckM7QUFRQTtBQUNBO0FBQ0g7QUFuQ0w7QUFxQ0g7QUEzSGU7UUFBUCxNLEdBQUEsTSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHtHYW1lfSBmcm9tIFwiLi9nYW1lLmpzXCI7XG5pbXBvcnQge1BsYXllcn0gZnJvbSBcIi4vcGxheWVyLmpzXCI7XG5pbXBvcnQge0Nhcn0gZnJvbSBcIi4vY2FyLmpzXCI7XG5pbXBvcnQge0J1dHRvbn0gZnJvbSBcIi4vYnV0dG9uLmpzXCI7XG5pbXBvcnQge0ZsYWd9IGZyb20gXCIuL2ZsYWcuanNcIjtcblxudmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY3JlZW4nKTtcbnZhciBnYW1lID0gbmV3IEdhbWUoY2FudmFzKTtcblxuXG52YXIgbWFzdGVyTG9vcCA9IGZ1bmN0aW9uKHRpbWVzdGFtcCkge1xuICAgIGdhbWUubG9vcCh0aW1lc3RhbXApO1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobWFzdGVyTG9vcCk7XG59XG5tYXN0ZXJMb29wKHBlcmZvcm1hbmNlLm5vdygpKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQge0FjdG9yfSBmcm9tIFwiLi9jb21tb24vYWN0b3IuanNcIjtcblxuZXhwb3J0IGNsYXNzIEJ1dHRvbiBleHRlbmRzIEFjdG9yIHtcbiAgICBjb25zdHJ1Y3Rvcih3b3JsZCkge1xuICAgICAgICBzdXBlcih3b3JsZCk7XG4gICAgICAgIHRoaXMud2lkdGggPSA2NDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSA2NDtcbiAgICAgICAgdGhpcy54ID0gdGhpcy53aWR0aCAqIDExO1xuICAgICAgICB0aGlzLnkgPSB0aGlzLmhlaWdodCAqIDE7XG4gICAgICAgIHRoaXMucmVuZGVyU3RhdGUgPSB0aGlzLnJlbmRlck1haW4uYmluZCh0aGlzKSgpO1xuICAgICAgICB0aGlzLmNvbnRyb2xTdGF0ZSA9IHRoaXMuY29udHJvbE1haW4uYmluZCh0aGlzKSgpO1xuICAgICAgICB0aGlzLnNwcml0ZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICB0aGlzLnNwcml0ZS5zcmMgPSBcIi4vYXNzZXRzL2J1dHRvbi5wbmdcIjtcbiAgICAgICAgdGhpcy5ldmVudHMuYWRkRXZlbnRMaXN0ZW5lcignY29sbGlzaW9uJywgdGhpcy5jb2xsaWRlLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGNvbGxpZGUob3RoZXIpIHtcbiAgICAgICAgdGhpcy53b3JsZC5mbGFnLmlzVXAgPSB0cnVlO1xuICAgIH1cblxuICAgICpyZW5kZXJNYWluKGN0eCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgbGV0IHtkdCwgY3R4fSA9IHlpZWxkIG51bGw7XG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKFxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlLFxuICAgICAgICAgICAgICAgIDAsIDAsIDEyNCwgMTI0LFxuICAgICAgICAgICAgICAgIHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgIClcbiAgICAgICAgfVxuICAgIH1cblxuICAgICpjb250cm9sTWFpbigpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGxldCB7ZHR9ID0geWllbGQgbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQge0FjdG9yfSBmcm9tIFwiLi9jb21tb24vYWN0b3IuanNcIjtcblxuXG5leHBvcnQgY2xhc3MgQ2FyIGV4dGVuZHMgQWN0b3Ige1xuICAgIGNvbnN0cnVjdG9yKHdvcmxkLCBhcmdzKSB7XG4gICAgICAgIGxldCB7eCwgeSwgaGVhZGluZ30gPSBhcmdzO1xuICAgICAgICBzdXBlcih3b3JsZClcbiAgICAgICAgdGhpcy5jb250cm9sU3RhdGUgPSB0aGlzLmNvbnRyb2xEcml2ZS5iaW5kKHRoaXMpKCk7XG4gICAgICAgIHRoaXMucmVuZGVyU3RhdGUgPSB0aGlzLnJlbmRlckRyaXZlLmJpbmQodGhpcykoKTtcbiAgICAgICAgdGhpcy5zcHJpdGUgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgdGhpcy5zcHJpdGUuc3JjID0gZW5jb2RlVVJJKCcuL2Fzc2V0cy9jYXJzX21pbmkuc3ZnJyk7XG4gICAgICAgIHRoaXMud2lkdGggPSA2NDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSAxMTI7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHRoaXMuaGVhZGluZyA9IGhlYWRpbmc7XG4gICAgICAgIHRoaXMuc3BlZWQgPSAxO1xuICAgICAgICB0aGlzLnNwcml0ZU51bSA9IDA7XG4gICAgICAgIHRoaXMuZGVsYXkgPSAwO1xuICAgICAgICB0aGlzLnJlSW5pdCgpO1xuICAgIH1cblxuICAgIGNvbGxlY3QoKSB7XG4gICAgICAgIGlmICh0aGlzLnkrdGhpcy5oZWlnaHQgPCAwIHx8IHRoaXMueCt0aGlzLndpZHRoIDwgMCB8fFxuICAgICAgICAgICAgICAgIHRoaXMueCA+IHRoaXMud29ybGQud2lkdGggfHwgdGhpcy55ID4gdGhpcy53b3JsZC5oZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMucmVJbml0KCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldEhpdEJveGVzKCkge1xuICAgICAgICByZXR1cm4gW3t4OiB0aGlzLngsIHk6IHRoaXMueSwgd2lkdGg6IHRoaXMud2lkdGgsIGhlaWdodDogdGhpcy5oZWlnaHQsIG9iajogdGhpc31dO1xuICAgIH1cblxuICAgICpjb250cm9sRHJpdmUoKSB7XG4gICAgICAgIHRoaXMucmVJbml0KCk7XG4gICAgICAgIGxldCB0aW1lID0gMDtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGxldCB7ZHR9PSB5aWVsZCBudWxsO1xuICAgICAgICAgICAgdGltZSArPSBkdDtcbiAgICAgICAgICAgIGlmICh0aW1lIDwgdGhpcy5kZWxheSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy55ICs9IHRoaXMuaGVhZGluZyAqIHRoaXMuc3BlZWQgKiA0MDAgKiBkdCAvIDEwMDA7XG4gICAgICAgICAgICBpZiAodGhpcy5jb2xsZWN0KCkpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5oZWFkaW5nID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMueSA9IDEtdGhpcy5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy55ID0gdGhpcy53b3JsZC5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnRyb2xEcml2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgKnJlbmRlckRyaXZlKGN0eCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgbGV0IHtkdCwgY3R4fSA9IHlpZWxkIG51bGw7XG4gICAgICAgICAgICBjdHguc2F2ZSgpXG4gICAgICAgICAgICBpZiAodGhpcy5oZWFkaW5nID09PSAxKSB7XG4gICAgICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSh0aGlzLngrdGhpcy53aWR0aCwgdGhpcy55K3RoaXMuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBjdHgucm90YXRlKE1hdGguUEkpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGN0eC50cmFuc2xhdGUodGhpcy54LCB0aGlzLnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZSxcbiAgICAgICAgICAgICAgICAyNDcqdGhpcy5zcHJpdGVOdW0sIDAsIDIwMCwgMzUwLFxuICAgICAgICAgICAgICAgIDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0XG4gICAgICAgICAgICApXG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZUluaXQoKSB7XG4gICAgICAgIHRoaXMuZGVsYXkgPSAoKDQgKiBNYXRoLnJhbmRvbSgpKXwwKSAqIDEwMDA7XG4gICAgICAgIHRoaXMuc3BlZWQgPSAuMjUgKiB0aGlzLndvcmxkLmxldmVsO1xuICAgICAgICB0aGlzLnNwcml0ZU51bSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDQpO1xuICAgIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQge0V2ZW50TGlzdGVuZXJ9IGZyb20gXCIuL2V2ZW50cy5qc1wiO1xuXG5cbmV4cG9ydCBjbGFzcyBBY3RvciB7XG4gICAgY29uc3RydWN0b3Iod29ybGQpIHtcbiAgICAgICAgdGhpcy5iYXNlQ29udHJvbFN0YXRlID0gbnVsbDtcbiAgICAgICAgdGhpcy5iYXNlUmVuZGVyU3RhdGUgPSBudWxsO1xuICAgICAgICB0aGlzLmNvbnRyb2xTdGF0ZSA9IG51bGw7XG4gICAgICAgIHRoaXMucmVuZGVyU3RhdGUgPSBudWxsO1xuICAgICAgICB0aGlzLmV2ZW50cyA9IG5ldyBFdmVudExpc3RlbmVyKCk7XG5cbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuICAgICAgICB0aGlzLnggPSAwO1xuICAgICAgICB0aGlzLnkgPSAwO1xuICAgICAgICB0aGlzLndpZHRoID0gNjQ7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gNjQ7XG4gICAgfVxuXG4gICAgZ2V0SGl0Qm94ZXMoKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb2xsZWN0KCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdXBkYXRlKGR0KSB7XG4gICAgICAgIGxldCBjdXIgPSB0aGlzLmNvbnRyb2xTdGF0ZS5uZXh0KHtkdDogZHR9KTtcbiAgICAgICAgaWYgKGN1ci52YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5jb250cm9sU3RhdGUgPSBjdXIudmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VyLmRvbmUpIHtcbiAgICAgICAgICAgIHRoaXMuY29udHJvbFN0YXRlID0gdGhpcy5iYXNlQ29udHJvbFN0YXRlLmJpbmQodGhpcykoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcihkdCwgY3R4KSB7XG4gICAgICAgIGxldCBjdXIgPSB0aGlzLnJlbmRlclN0YXRlLm5leHQoe2R0OiBkdCwgY3R4OiBjdHh9KTtcbiAgICAgICAgaWYgKGN1ci52YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJTdGF0ZSA9IGN1ci52YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXIuZG9uZSkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJTdGF0ZSA9IHRoaXMuYmFzZVJlbmRlclN0YXRlLmJpbmQodGhpcykoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5cbmV4cG9ydCBjbGFzcyBFdmVudExpc3RlbmVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5ldmVudHMgPSB7fTtcbiAgICB9XG5cbiAgICBhZGRFdmVudExpc3RlbmVyKG5hbWUsIGZ1bmMpIHtcbiAgICAgICAgbGV0IGV2ZW50cyA9IHRoaXMuZXZlbnRzW25hbWVdIHx8IFtdO1xuICAgICAgICB0aGlzLmV2ZW50c1tuYW1lXSA9IGV2ZW50cztcblxuICAgICAgICBldmVudHMucHVzaChmdW5jKTtcbiAgICB9XG5cbiAgICBlbWl0KG5hbWUsIGFyZ3MpIHtcbiAgICAgICAgbGV0IGV2ZW50cyA9IHRoaXMuZXZlbnRzW25hbWVdIHx8IFtdO1xuICAgICAgICBmb3IgKGxldCBldiBvZiBldmVudHMpIHtcbiAgICAgICAgICAgIGV2KGFyZ3MpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydCBjbGFzcyBDb250cm9sbGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5pbnB1dCA9IHtcbiAgICAgICAgICAgIHVwOiBmYWxzZSxcbiAgICAgICAgICAgIGRvd246IGZhbHNlLFxuICAgICAgICAgICAgcmlnaHQ6IGZhbHNlLFxuICAgICAgICAgICAgbGVmdDogZmFsc2UsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICB9XG5cbiAgICBpc0FueVByZXNzZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlucHV0LnVwIHxcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuZG93biB8XG4gICAgICAgICAgICB0aGlzLmlucHV0LnJpZ2h0IHxcbiAgICAgICAgICAgIHRoaXMuaW5wdXQubGVmdDtcbiAgICB9XG5cbiAgICBjbGVhcigpIHtcbiAgICAgICAgdGhpcy5zYXZlZElucHV0ID0ge1xuICAgICAgICAgICAgdXA6IGZhbHNlLFxuICAgICAgICAgICAgZG93bjogZmFsc2UsXG4gICAgICAgICAgICByaWdodDogZmFsc2UsXG4gICAgICAgICAgICBsZWZ0OiBmYWxzZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGF0dGFjaCgpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCBwcmV2ZW50RGVmYXVsdCA9IGZhbHNlXG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDM4OiBjYXNlIDg3OiAvLyBVcFxuICAgICAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC51cCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlZElucHV0LnVwID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgMzc6IGNhc2UgNjU6IC8vTGVmdFxuICAgICAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5sZWZ0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmVkSW5wdXQubGVmdCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlIDM5OiBjYXNlIDY4OiAvLyBSaWdodFxuICAgICAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5yaWdodCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlZElucHV0LnJpZ2h0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgNDA6IGNhc2UgODM6IC8vIERvd25cbiAgICAgICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQuZG93biA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlZElucHV0LmRvd24gPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAzODogY2FzZSA4NzogLy8gVXBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC51cCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSAzNzogY2FzZSA2NTogLy9MZWZ0XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQubGVmdCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSAzOTogY2FzZSA2ODogLy8gUmlnaHRcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5yaWdodCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSA0MDogY2FzZSA4MzogLy8gRG93blxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LmRvd24gPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHtBY3Rvcn0gZnJvbSBcIi4vY29tbW9uL2FjdG9yLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBGbGFnIGV4dGVuZHMgQWN0b3Ige1xuICAgIGNvbnN0cnVjdG9yKHdvcmxkKSB7XG4gICAgICAgIHN1cGVyKHdvcmxkKTtcbiAgICAgICAgdGhpcy53aWR0aCA9IDY0O1xuICAgICAgICB0aGlzLmhlaWdodCA9IDY0O1xuICAgICAgICB0aGlzLnggPSB0aGlzLndpZHRoICogMTE7XG4gICAgICAgIHRoaXMueSA9IHRoaXMuaGVpZ2h0ICogNTtcbiAgICAgICAgdGhpcy5yZW5kZXJTdGF0ZSA9IHRoaXMucmVuZGVyTWFpbi5iaW5kKHRoaXMpKCk7XG4gICAgICAgIHRoaXMuY29udHJvbFN0YXRlID0gdGhpcy5jb250cm9sTWFpbi5iaW5kKHRoaXMpKCk7XG4gICAgICAgIHRoaXMuc3ByaXRlID0gbmV3IEltYWdlKCk7XG4gICAgICAgIHRoaXMuc3ByaXRlLnNyYyA9IFwiLi9hc3NldHMvZmxhZ19kb3duLnBuZ1wiO1xuICAgICAgICB0aGlzLnNwcml0ZVVwID0gbmV3IEltYWdlKCk7XG4gICAgICAgIHRoaXMuc3ByaXRlVXAuc3JjID0gXCIuL2Fzc2V0cy9mbGFnLnBuZ1wiO1xuICAgICAgICB0aGlzLmlzVXAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5ldmVudHMuYWRkRXZlbnRMaXN0ZW5lcignY29sbGlzaW9uJywgdGhpcy5jb2xsaWRlLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGNvbGxpZGUob3RoZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNVcCkge1xuICAgICAgICAgICAgdGhpcy53b3JsZC5uZXh0TGV2ZWwoKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgKnJlbmRlck1haW4oY3R4KSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBsZXQge2R0LCBjdHh9ID0geWllbGQgbnVsbDtcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICAgICAgdGhpcy5pc1VwPyB0aGlzLnNwcml0ZVVwOiB0aGlzLnNwcml0ZSxcbiAgICAgICAgICAgICAgICAwLCAwLCAxMjQsIDEyNCxcbiAgICAgICAgICAgICAgICB0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICApXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAqY29udHJvbE1haW4oKSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBsZXQge2R0fSA9IHlpZWxkIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHtQbGF5ZXJ9IGZyb20gXCIuL3BsYXllci5qc1wiO1xuaW1wb3J0IHtDYXJ9IGZyb20gXCIuL2Nhci5qc1wiO1xuaW1wb3J0IHtCdXR0b259IGZyb20gXCIuL2J1dHRvbi5qc1wiO1xuaW1wb3J0IHtGbGFnfSBmcm9tIFwiLi9mbGFnLmpzXCI7XG5cbmxldCBiYWNrZHJvcCA9IG5ldyBJbWFnZSgpO1xuYmFja2Ryb3Auc3JjID0gZW5jb2RlVVJJKCdhc3NldHMvY2FudmFzLnBuZycpO1xuXG5leHBvcnQgY2xhc3MgR2FtZSB7XG4gICAgY29uc3RydWN0b3Ioc2NyZWVuKSB7XG4gICAgICAgIC8vIFNldCB1cCBidWZmZXJzXG4gICAgICAgIHRoaXMuZnJvbnRCdWZmZXIgPSBzY3JlZW47XG4gICAgICAgIHRoaXMuZnJvbnRDdHggPSBzY3JlZW4uZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgdGhpcy5iYWNrQnVmZmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIHRoaXMuYmFja0J1ZmZlci53aWR0aCA9IHNjcmVlbi53aWR0aDtcbiAgICAgICAgdGhpcy5iYWNrQnVmZmVyLmhlaWdodCA9IHNjcmVlbi5oZWlnaHQ7XG4gICAgICAgIHRoaXMuYmFja0N0eCA9IHRoaXMuYmFja0J1ZmZlci5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIHRoaXMud2lkdGggPSB0aGlzLmZyb250QnVmZmVyLndpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuZnJvbnRCdWZmZXIuaGVpZ2h0O1xuXG4gICAgICAgIC8vIFN0YXJ0IHRoZSBnYW1lIGxvb3BcbiAgICAgICAgdGhpcy5vbGRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIHRoaXMucGF1c2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMubGV2ZWwgPSAwO1xuICAgICAgICB0aGlzLmxpdmVzID0gMztcblxuICAgICAgICB0aGlzLmVuZFRpbWVvdXQgPSAwO1xuXG4gICAgICAgIHRoaXMubmV4dExldmVsKCk7XG4gICAgfVxuXG4gICAgcGF1c2UoZmxhZykge1xuICAgICAgICB0aGlzLnBhdXNlZCA9IChmbGFnID09IHRydWUpO1xuICAgIH1cblxuICAgIGxvb3AobmV3VGltZSkge1xuICAgICAgICB2YXIgZ2FtZSA9IHRoaXM7XG4gICAgICAgIHZhciBlbGFwc2VkVGltZSA9IG5ld1RpbWUgLSB0aGlzLm9sZFRpbWU7XG4gICAgICAgIHRoaXMub2xkVGltZSA9IG5ld1RpbWU7XG5cbiAgICAgICAgaWYoIXRoaXMucGF1c2VkKSB0aGlzLnVwZGF0ZShlbGFwc2VkVGltZSk7XG4gICAgICAgIHRoaXMucmVuZGVyKGVsYXBzZWRUaW1lLCB0aGlzLmZyb250Q3R4KTtcblxuICAgICAgICAvLyBGbGlwIHRoZSBiYWNrIGJ1ZmZlclxuICAgICAgICB0aGlzLmZyb250Q3R4LmRyYXdJbWFnZSh0aGlzLmJhY2tCdWZmZXIsIDAsIDApO1xuICAgIH1cblxuICAgIGxvc2UoKSB7XG4gICAgICAgIHRoaXMuZW5kVGltZW91dCA9IDQwMDA7XG4gICAgICAgIHRoaXMubGV2ZWwgPSAwO1xuICAgICAgICB0aGlzLmxpdmVzID0gMztcbiAgICAgICAgdGhpcy5uZXh0TGV2ZWwoKTtcbiAgICAgICAgY29uc29sZS5sb2coJ2xvc2UnKVxuICAgIH1cblxuICAgIGRpZSgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2RpZScpO1xuICAgICAgICB0aGlzLmxpdmVzLS07XG4gICAgICAgIGlmICh0aGlzLmxpdmVzIDw9IDApIHtcbiAgICAgICAgICAgIHRoaXMubG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICB9XG5cbiAgICBuZXh0TGV2ZWwoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCduZXh0JylcbiAgICAgICAgdGhpcy5sZXZlbCsrO1xuICAgICAgICB0aGlzLnN0YXJ0KCk7XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7XG4gICAgICAgIHRoaXMucGxheWVyID0gbmV3IFBsYXllcih7eDogMCwgeTogMjU2fSwgdGhpcyk7XG4gICAgICAgIHRoaXMuYnV0dG9uID0gbmV3IEJ1dHRvbih0aGlzKTtcbiAgICAgICAgdGhpcy5mbGFnID0gbmV3IEZsYWcodGhpcyk7XG4gICAgICAgIHRoaXMuY2FycyA9IFt0aGlzLmJ1dHRvbiwgdGhpcy5mbGFnXTtcbiAgICAgICAgZm9yIChsZXQgaT0xOyBpPDExOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuY2Fycy5wdXNoKG5ldyBDYXIodGhpcywge2hlYWRpbmc6IChNYXRoLmZsb29yKChpKzEpLzIpJTI9PT0wPy0xOjEpLCB4OiA2NCppLCB5OiAtMTExMn0pKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZShlbGFwc2VkVGltZSkge1xuICAgICAgICBpZiAodGhpcy5lbmRUaW1lb3V0ID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucGxheWVyLnVwZGF0ZShlbGFwc2VkVGltZSk7XG4gICAgICAgIHRoaXMuYnV0dG9uLnVwZGF0ZShlbGFwc2VkVGltZSk7XG4gICAgICAgIHRoaXMuZmxhZy51cGRhdGUoZWxhcHNlZFRpbWUpO1xuICAgICAgICBsZXQgaGl0Qm94ID0gdGhpcy5wbGF5ZXIuZ2V0SGl0Qm94ZXMoKVswXTtcbiAgICAgICAgZm9yIChsZXQgY2FyIG9mIHRoaXMuY2Fycykge1xuICAgICAgICAgICAgY2FyLnVwZGF0ZShlbGFwc2VkVGltZSk7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgKChoaXRCb3gueCA+PSBjYXIueCAmJiBoaXRCb3gueCA8PSBjYXIueCArIGNhci53aWR0aCAtMSkgfHwgKGhpdEJveC54ICsgaGl0Qm94LndpZHRoIC0xID49IGNhci54ICYmIGhpdEJveC54ICsgaGl0Qm94LndpZHRoIC0xIDw9IGNhci54ICsgY2FyLndpZHRoIC0xKSkgJiZcbiAgICAgICAgICAgICAgICAoKGhpdEJveC55ID49IGNhci55ICYmIGhpdEJveC55IDw9IGNhci55ICsgY2FyLmhlaWdodCAtMSkgfHwgKGhpdEJveC55ICsgaGl0Qm94LmhlaWdodCAtMSA+PSBjYXIueSAmJiBoaXRCb3gueSArIGhpdEJveC5oZWlnaHQgLTEgPD0gY2FyLnkgKyBjYXIuaGVpZ2h0IC0xKSlcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyLmV2ZW50cy5lbWl0KCdjb2xsaXNpb24nLCBjYXIpO1xuICAgICAgICAgICAgICAgIGNhci5ldmVudHMuZW1pdCgnY29sbGlzaW9uJywgdGhpcy5wbGF5ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKGVsYXBzZWRUaW1lLCBjdHgpIHtcbiAgICAgICAgaWYgKHRoaXMuZW5kVGltZW91dCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuZW5kVGltZW91dCAtPSBlbGFwc2VkVGltZTtcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBgcmdiYSgwLCAwLCAwLCAwLjEpYDtcbiAgICAgICAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gYHJnYmEoMjU1LCAwLCAwLCAwLjEpYDtcbiAgICAgICAgICAgIGN0eC5maWxsVGV4dChcImxvc2VyXCIsIDQwMCwgMjAwKTtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGN0eC5kcmF3SW1hZ2UoYmFja2Ryb3AsIDAsIDApO1xuICAgICAgICB0aGlzLmJ1dHRvbi5yZW5kZXIoZWxhcHNlZFRpbWUsIGN0eCk7XG4gICAgICAgIHRoaXMuZmxhZy5yZW5kZXIoZWxhcHNlZFRpbWUsIGN0eCk7XG4gICAgICAgIGZvciAobGV0IGNhciBvZiB0aGlzLmNhcnMpIHtcbiAgICAgICAgICAgIGNhci5yZW5kZXIoZWxhcHNlZFRpbWUsIGN0eClcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBsYXllci5yZW5kZXIoZWxhcHNlZFRpbWUsIGN0eCk7XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xuICAgICAgICBjdHguZmlsbFRleHQodGhpcy5saXZlcyArICcgTGl2ZXMnLCA3MTAsIDQwKTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KCdMZXZlbCAnK3RoaXMubGV2ZWwsIDcxMCwgMjApXG4gICAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB7Q29udHJvbGxlcn0gZnJvbSBcIi4vY29tbW9uL2lucHV0LmpzXCI7XG5pbXBvcnQge0V2ZW50TGlzdGVuZXJ9IGZyb20gXCIuL2NvbW1vbi9ldmVudHMuanNcIjtcbmltcG9ydCB7Q2FyfSBmcm9tIFwiLi9jYXIuanNcIjtcblxuY29uc3QgTVNfUEVSX0ZSQU1FID0gMTAwMC8xNjtcblxuY29uc3QgU1RBVEVTID0ge1xuICAgIGlkbGU6IFN5bWJvbCgpLFxuICAgIHdhbGtpbmc6IFN5bWJvbCgpLFxuICAgIGJsaW5raW5nOiBTeW1ib2woKSxcbiAgICBqdW1waW5nOiBTeW1ib2woKSxcbn1cblxubGV0IGF1ZGlvQ29udGV4dCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcblxubGV0IGNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcigpO1xuY29udHJvbGxlci5hdHRhY2goKTtcblxuXG5cbmxldCBib25nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmJvbmcuc3JjID0gZW5jb2RlVVJJKCdhc3NldHMvYm9uZy5vZ2cnKTtcblxubGV0IG11c2ljID0gbmV3IEF1ZGlvKGVuY29kZVVSSSgnYXNzZXRzL2JnbV9hY3Rpb25fMi5tcDMnKSk7XG5tdXNpYy5sb29wID0gdHJ1ZTtcbm11c2ljLnBsYXkoKTtcblxuKCgpPT57XG52YXIgYXVkaW9DdHggPSBuZXcgd2luZG93LkF1ZGlvQ29udGV4dCgpO1xud2luZG93LmF1ZGlvID0gYXVkaW9DdHg7XG52YXIgZ2Fpbk5vZGUgPSBhdWRpb0N0eC5jcmVhdGVHYWluKCk7XG5nYWluTm9kZS5nYWluLnZhbHVlID0gMS4wO1xuZ2Fpbk5vZGUuY29ubmVjdChhdWRpb0N0eC5kZXN0aW5hdGlvbik7XG5cbmxldCBib25nU291cmNlID0gYXVkaW9DdHguY3JlYXRlTWVkaWFFbGVtZW50U291cmNlKGJvbmcpO1xuYm9uZ1NvdXJjZS5jb25uZWN0KGdhaW5Ob2RlKTtcblxubGV0IG11c2ljU291cmNlID0gYXVkaW9DdHguY3JlYXRlTWVkaWFFbGVtZW50U291cmNlKG11c2ljKTtcbm11c2ljU291cmNlLmNvbm5lY3QoZ2Fpbk5vZGUpO1xufSkoKVxuXG5leHBvcnQgY2xhc3MgUGxheWVyIHtcbiAgICBjb25zdHJ1Y3Rvcihwb3NpdGlvbiwgd29ybGQpIHtcbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVTLmlkbGU7XG4gICAgICAgIHRoaXMuc3RhdGVGdW5jID0gdGhpcy5zdGF0ZUlkbGUuYmluZCh0aGlzKSgpO1xuICAgICAgICB0aGlzLnggPSBwb3NpdGlvbi54O1xuICAgICAgICB0aGlzLnkgPSBwb3NpdGlvbi55O1xuICAgICAgICB0aGlzLndpZHRoICA9IDY0O1xuICAgICAgICB0aGlzLmhlaWdodCA9IDY0O1xuICAgICAgICB0aGlzLnNwcml0ZXNoZWV0ICA9IG5ldyBJbWFnZSgpO1xuICAgICAgICB0aGlzLnNwcml0ZXNoZWV0LnNyYyA9IGVuY29kZVVSSSgnYXNzZXRzL1BsYXllclNwcml0ZTIucG5nJyk7XG4gICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICAgICAgdGhpcy5ldmVudHMgPSBuZXcgRXZlbnRMaXN0ZW5lcigpO1xuICAgICAgICB0aGlzLnNpdHRpbmdTcHJpdGVzID0gW3t4OiA2NCozLCB5OiA2NH0sIHt4OiA2NCowLCB5OiA2NH0sIHt4OiA2NCoxLCB5OiA2NH0sIHt4OiA2NCoyLCB5OiA2NH0sIHt4OiA2NCoxLCB5OiA2NH0sIHt4OiA2NCowLCB5OiA2NH1dO1xuICAgICAgICB0aGlzLmp1bXBpbmdTcHJpdGVzID0gW3t4OiA2NCozLCB5OiAwfSwge3g6IDY0KjIsIHk6IDB9LCB7eDogNjQqMSwgeTogMH0sIHt4OiA2NCowLCB5OiAwfSwge3g6IDY0KjEsIHk6IDB9LCB7eDogNjQqMiwgeTogMH0sIHt4OiA2NCozLCB5OiAwfV07XG4gICAgICAgIHRoaXMuZXZlbnRzLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbGxpc2lvbicsIHRoaXMuY29sbGlkZS5iaW5kKHRoaXMpKVxuICAgIH1cblxuICAgIGNvbGxpZGUob3RoZXIpIHtcbiAgICAgICAgaWYgKG90aGVyLmNvbnN0cnVjdG9yID09PSBDYXIpIHtcbiAgICAgICAgICAgIHRoaXMud29ybGQuZGllKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGUodGltZSkge1xuICAgICAgICB0aGlzLnRpbWVyICs9IHRpbWU7XG4gICAgICAgIGxldCBuZXdGcmFtZSA9IGZhbHNlO1xuICAgICAgICBpZih0aGlzLnRpbWVyID4gTVNfUEVSX0ZSQU1FKSB7XG4gICAgICAgICAgICB0aGlzLnRpbWVyID0gMDtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjdXIgPSB0aGlzLnN0YXRlRnVuYy5uZXh0KHtkdDogdGltZX0pO1xuICAgICAgICBpZiAoY3VyLmRvbmUpIHtcbiAgICAgICAgICAgdGhpcy5zdGF0ZUZ1bmMgPSB0aGlzLnN0YXRlSWRsZS5iaW5kKHRoaXMpKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VyLnZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlRnVuYyA9IGN1ci52YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldEhpdEJveGVzKCkge1xuICAgICAgICByZXR1cm4gW3t4OiB0aGlzLngsIHk6IHRoaXMueSwgd2lkdGg6IHRoaXMud2lkdGgsIGhlaWdodDogdGhpcy5oZWlnaHQsIG9iajogdGhpc31dO1xuICAgIH1cblxuICAgICpzdGF0ZUlkbGUoKSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBsZXQge2R0fSA9IHlpZWxkIG51bGw7XG5cbiAgICAgICAgICAgIGlmIChjb250cm9sbGVyLmlzQW55UHJlc3NlZCgpKSB7XG4gICAgICAgICAgICAgICAgbGV0IGggPSB7eDogMCwgeTogMH07XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRyb2xsZXIuaW5wdXQucmlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgaC54ID0gMTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvbnRyb2xsZXIuaW5wdXQubGVmdCkge1xuICAgICAgICAgICAgICAgICAgICBoLnggPSAtMTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvbnRyb2xsZXIuaW5wdXQudXApIHtcbiAgICAgICAgICAgICAgICAgICAgaC55ID0gLTE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb250cm9sbGVyLmlucHV0LmRvd24pIHtcbiAgICAgICAgICAgICAgICAgICAgaC55ID0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZUZ1bmMgPSB0aGlzLnN0YXRlSnVtcGluZy5iaW5kKHRoaXMpKGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgKnN0YXRlSnVtcGluZyhoZWFkaW5nKSB7XG4gICAgICAgIGJvbmcucGxheSgpO1xuICAgICAgICBsZXQge3gsIHl9ID0gaGVhZGluZztcbiAgICAgICAgbGV0IFtlbmRYLCBlbmRZXSA9IFt0aGlzLnggKyB0aGlzLmhlaWdodCp4LCB0aGlzLnkgKyB0aGlzLmhlaWdodCp5XTtcbiAgICAgICAgbGV0IHRpbWVUb1Rha2UgPSAxMDAwLyAxODtcbiAgICAgICAgbGV0IHRpbWUgPSAwO1xuICAgICAgICB3aGlsZSAodGltZSA8IHRpbWVUb1Rha2UpIHtcbiAgICAgICAgICAgIGxldCB7ZHR9ID0geWllbGQgbnVsbDtcbiAgICAgICAgICAgIGxldCBkZCA9IGR0IC8gdGltZVRvVGFrZTtcbiAgICAgICAgICAgIHRpbWUgKz0gZHQ7XG4gICAgICAgICAgICB0aGlzLnggKz0gdGhpcy53aWR0aCAqIHggKiBkZDtcbiAgICAgICAgICAgIHRoaXMueSArPSB0aGlzLmhlaWdodCAqIHkgKiBkZDtcbiAgICAgICAgfVxuICAgICAgICBbdGhpcy54LCB0aGlzLnldID0gW2VuZFgsIGVuZFldO1xuICAgICAgICBib25nLnBhdXNlKCk7XG4gICAgICAgIC8vIGJvbmcuZmFzdFNlZWsoMCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKHRpbWUsIGN0eCkge1xuICAgICAgICBzd2l0Y2godGhpcy5zdGF0ZSkge1xuICAgICAgICAgICAgY2FzZSBTVEFURVMuanVtcGluZzoge1xuICAgICAgICAgICAgICAgIGxldCBmcmFtZSA9IHRoaXMuZnJhbWUgJSAodGhpcy5qdW1waW5nU3ByaXRlcy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGxldCB7eCwgeX0gPSB0aGlzLmp1bXBpbmdTcHJpdGVzW2ZyYW1lXTtcbiAgICAgICAgICAgICAgICBjdHguZHJhd0ltYWdlKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZXNoZWV0LFxuICAgICAgICAgICAgICAgICAgICB4LCB5LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5mcmFtZSA9PT0gdGhpcy5qdW1waW5nU3ByaXRlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mcmFtZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBTVEFURVMuaWRsZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhc2UgU1RBVEVTLmlkbGU6IHtcbiAgICAgICAgICAgICAgICBpZiAoY29udHJvbGxlci5pc0FueVByZXNzZWQoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFNUQVRFUy5qdW1waW5nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBoYW5kbGUgYmxpbmtpbmdcbiAgICAgICAgICAgICAgICBsZXQgZnJhbWUgPSBNYXRoLm1pbih0aGlzLmZyYW1lICUgKHRoaXMuc2l0dGluZ1Nwcml0ZXMubGVuZ3RoICsgMjApLCB0aGlzLnNpdHRpbmdTcHJpdGVzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgZnJhbWUgPSBmcmFtZSAlIHRoaXMuc2l0dGluZ1Nwcml0ZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGxldCB7eCwgeX0gPSB0aGlzLnNpdHRpbmdTcHJpdGVzW2ZyYW1lXTtcbiAgICAgICAgICAgICAgICBjdHguZHJhd0ltYWdlKFxuICAgICAgICAgICAgICAgICAgICAvLyBpbWFnZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZXNoZWV0LFxuICAgICAgICAgICAgICAgICAgICAvLyBzb3VyY2UgcmVjdGFuZ2xlXG4gICAgICAgICAgICAgICAgICAgIHgsIHksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAvLyBkZXN0aW5hdGlvbiByZWN0YW5nbGVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBJbXBsZW1lbnQgeW91ciBwbGF5ZXIncyByZWRlcmluZyBhY2NvcmRpbmcgdG8gc3RhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==
