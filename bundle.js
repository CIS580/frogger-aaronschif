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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2J1dHRvbi5qcyIsInNyYy9jYXIuanMiLCJzcmMvY29tbW9uL2FjdG9yLmpzIiwic3JjL2NvbW1vbi9ldmVudHMuanMiLCJzcmMvY29tbW9uL2lucHV0LmpzIiwic3JjL2ZsYWcuanMiLCJzcmMvZ2FtZS5qcyIsInNyYy9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQSxJQUFJLFNBQVMsU0FBUyxjQUFULENBQXdCLFFBQXhCLENBQWI7QUFDQSxJQUFJLE9BQU8sZUFBUyxNQUFULENBQVg7O0FBR0EsSUFBSSxhQUFhLFVBQVMsU0FBVCxFQUFvQjtBQUNqQyxTQUFLLElBQUwsQ0FBVSxTQUFWO0FBQ0EsV0FBTyxxQkFBUCxDQUE2QixVQUE3QjtBQUNILENBSEQ7QUFJQSxXQUFXLFlBQVksR0FBWixFQUFYOzs7QUNoQkE7Ozs7Ozs7QUFFQTs7QUFFTyxNQUFNLE1BQU4sc0JBQTJCO0FBQzlCLGdCQUFZLEtBQVosRUFBbUI7QUFDZixjQUFNLEtBQU47QUFDQSxhQUFLLEtBQUwsR0FBYSxFQUFiO0FBQ0EsYUFBSyxNQUFMLEdBQWMsRUFBZDtBQUNBLGFBQUssQ0FBTCxHQUFTLEtBQUssS0FBTCxHQUFhLEVBQXRCO0FBQ0EsYUFBSyxDQUFMLEdBQVMsS0FBSyxNQUFMLEdBQWMsQ0FBdkI7QUFDQSxhQUFLLFdBQUwsR0FBbUIsS0FBSyxVQUFMLENBQWdCLElBQWhCLENBQXFCLElBQXJCLEdBQW5CO0FBQ0EsYUFBSyxZQUFMLEdBQW9CLEtBQUssV0FBTCxDQUFpQixJQUFqQixDQUFzQixJQUF0QixHQUFwQjtBQUNBLGFBQUssTUFBTCxHQUFjLElBQUksS0FBSixFQUFkO0FBQ0EsYUFBSyxNQUFMLENBQVksR0FBWixHQUFrQixxQkFBbEI7QUFDQSxhQUFLLE1BQUwsQ0FB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d0JBQUksUUFBUSxLQUFLLEdBQUwsQ0FBUyxLQUFLLEtBQUwsSUFBYyxLQUFLLGNBQUwsQ0FBb0IsTUFBcEIsR0FBNkIsRUFBM0MsQ0FBVCxFQUF5RCxLQUFLLGNBQUwsQ0FBb0IsTUFBN0UsQ0FBWjtBQUNBLDRCQUFRLFFBQVEsS0FBSyxjQUFMLENBQW9CLE1BQXBDO0FBQ0Esd0JBQUksRUFBQyxDQUFELEVBQUksQ0FBSixLQUFTLEtBQUssY0FBTCxDQUFvQixLQUFwQixDQUFiO0FBQ0Esd0JBQUksU0FBSjtBQUNJO0FBQ0EseUJBQUssV0FGVDtBQUdJO0FBQ0EscUJBSkosRUFJTyxDQUpQLEVBSVUsS0FBSyxLQUpmLEVBSXNCLEtBQUssTUFKM0I7QUFLSTtBQUNBLHlCQUFLLENBTlQsRUFNWSxLQUFLLENBTmpCLEVBTW9CLEtBQUssS0FOekIsRUFNZ0MsS0FBSyxNQU5yQztBQVFBO0FBQ0E7QUFDSDtBQW5DTDtBQXFDSDtBQTNIZTtRQUFQLE0sR0FBQSxNIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQge0dhbWV9IGZyb20gXCIuL2dhbWUuanNcIjtcbmltcG9ydCB7UGxheWVyfSBmcm9tIFwiLi9wbGF5ZXIuanNcIjtcbmltcG9ydCB7Q2FyfSBmcm9tIFwiLi9jYXIuanNcIjtcbmltcG9ydCB7QnV0dG9ufSBmcm9tIFwiLi9idXR0b24uanNcIjtcbmltcG9ydCB7RmxhZ30gZnJvbSBcIi4vZmxhZy5qc1wiO1xuXG52YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjcmVlbicpO1xudmFyIGdhbWUgPSBuZXcgR2FtZShjYW52YXMpO1xuXG5cbnZhciBtYXN0ZXJMb29wID0gZnVuY3Rpb24odGltZXN0YW1wKSB7XG4gICAgZ2FtZS5sb29wKHRpbWVzdGFtcCk7XG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtYXN0ZXJMb29wKTtcbn1cbm1hc3Rlckxvb3AocGVyZm9ybWFuY2Uubm93KCkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB7QWN0b3J9IGZyb20gXCIuL2NvbW1vbi9hY3Rvci5qc1wiO1xuXG5leHBvcnQgY2xhc3MgQnV0dG9uIGV4dGVuZHMgQWN0b3Ige1xuICAgIGNvbnN0cnVjdG9yKHdvcmxkKSB7XG4gICAgICAgIHN1cGVyKHdvcmxkKTtcbiAgICAgICAgdGhpcy53aWR0aCA9IDY0O1xuICAgICAgICB0aGlzLmhlaWdodCA9IDY0O1xuICAgICAgICB0aGlzLnggPSB0aGlzLndpZHRoICogMTE7XG4gICAgICAgIHRoaXMueSA9IHRoaXMuaGVpZ2h0ICogMTtcbiAgICAgICAgdGhpcy5yZW5kZXJTdGF0ZSA9IHRoaXMucmVuZGVyTWFpbi5iaW5kKHRoaXMpKCk7XG4gICAgICAgIHRoaXMuY29udHJvbFN0YXRlID0gdGhpcy5jb250cm9sTWFpbi5iaW5kKHRoaXMpKCk7XG4gICAgICAgIHRoaXMuc3ByaXRlID0gbmV3IEltYWdlKCk7XG4gICAgICAgIHRoaXMuc3ByaXRlLnNyYyA9IFwiLi9hc3NldHMvYnV0dG9uLnBuZ1wiO1xuICAgICAgICB0aGlzLmV2ZW50cy5hZGRFdmVudExpc3RlbmVyKCdjb2xsaXNpb24nLCB0aGlzLmNvbGxpZGUuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgY29sbGlkZShvdGhlcikge1xuICAgICAgICB0aGlzLndvcmxkLmZsYWcuaXNVcCA9IHRydWU7XG4gICAgfVxuXG4gICAgKnJlbmRlck1haW4oY3R4KSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBsZXQge2R0LCBjdHh9ID0geWllbGQgbnVsbDtcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGUsXG4gICAgICAgICAgICAgICAgMCwgMCwgMTI0LCAxMjQsXG4gICAgICAgICAgICAgICAgdGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgKmNvbnRyb2xNYWluKCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgbGV0IHtkdH0gPSB5aWVsZCBudWxsO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB7QWN0b3J9IGZyb20gXCIuL2NvbW1vbi9hY3Rvci5qc1wiO1xuXG5cbmV4cG9ydCBjbGFzcyBDYXIgZXh0ZW5kcyBBY3RvciB7XG4gICAgY29uc3RydWN0b3Iod29ybGQsIGFyZ3MpIHtcbiAgICAgICAgbGV0IHt4LCB5LCBoZWFkaW5nfSA9IGFyZ3M7XG4gICAgICAgIHN1cGVyKHdvcmxkKVxuICAgICAgICB0aGlzLmNvbnRyb2xTdGF0ZSA9IHRoaXMuY29udHJvbERyaXZlLmJpbmQodGhpcykoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJTdGF0ZSA9IHRoaXMucmVuZGVyRHJpdmUuYmluZCh0aGlzKSgpO1xuICAgICAgICB0aGlzLnNwcml0ZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICB0aGlzLnNwcml0ZS5zcmMgPSBlbmNvZGVVUkkoJy4vYXNzZXRzL2NhcnNfbWluaS5zdmcnKTtcbiAgICAgICAgdGhpcy53aWR0aCA9IDY0O1xuICAgICAgICB0aGlzLmhlaWdodCA9IDExMjtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgdGhpcy5oZWFkaW5nID0gaGVhZGluZztcbiAgICAgICAgdGhpcy5zcGVlZCA9IDE7XG4gICAgICAgIHRoaXMuc3ByaXRlTnVtID0gMDtcbiAgICAgICAgdGhpcy5kZWxheSA9IDA7XG4gICAgICAgIHRoaXMucmVJbml0KCk7XG4gICAgfVxuXG4gICAgY29sbGVjdCgpIHtcbiAgICAgICAgaWYgKHRoaXMueSt0aGlzLmhlaWdodCA8IDAgfHwgdGhpcy54K3RoaXMud2lkdGggPCAwIHx8XG4gICAgICAgICAgICAgICAgdGhpcy54ID4gdGhpcy53b3JsZC53aWR0aCB8fCB0aGlzLnkgPiB0aGlzLndvcmxkLmhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5yZUluaXQoKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0SGl0Qm94ZXMoKSB7XG4gICAgICAgIHJldHVybiBbe3g6IHRoaXMueCwgeTogdGhpcy55LCB3aWR0aDogdGhpcy53aWR0aCwgaGVpZ2h0OiB0aGlzLmhlaWdodCwgb2JqOiB0aGlzfV07XG4gICAgfVxuXG4gICAgKmNvbnRyb2xEcml2ZSgpIHtcbiAgICAgICAgdGhpcy5yZUluaXQoKTtcbiAgICAgICAgbGV0IHRpbWUgPSAwO1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgbGV0IHtkdH09IHlpZWxkIG51bGw7XG4gICAgICAgICAgICB0aW1lICs9IGR0O1xuICAgICAgICAgICAgaWYgKHRpbWUgPCB0aGlzLmRlbGF5KSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnkgKz0gdGhpcy5oZWFkaW5nICogdGhpcy5zcGVlZCAqIDQwMCAqIGR0IC8gMTAwMDtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbGxlY3QoKSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmhlYWRpbmcgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy55ID0gMS10aGlzLmhlaWdodDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnkgPSB0aGlzLndvcmxkLmhlaWdodDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29udHJvbERyaXZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAqcmVuZGVyRHJpdmUoY3R4KSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBsZXQge2R0LCBjdHh9ID0geWllbGQgbnVsbDtcbiAgICAgICAgICAgIGN0eC5zYXZlKClcbiAgICAgICAgICAgIGlmICh0aGlzLmhlYWRpbmcgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBjdHgudHJhbnNsYXRlKHRoaXMueCt0aGlzLndpZHRoLCB0aGlzLnkrdGhpcy5oZWlnaHQpO1xuICAgICAgICAgICAgICAgIGN0eC5yb3RhdGUoTWF0aC5QSSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSh0aGlzLngsIHRoaXMueSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKFxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlLFxuICAgICAgICAgICAgICAgIDI0Nyp0aGlzLnNwcml0ZU51bSwgMCwgMjAwLCAzNTAsXG4gICAgICAgICAgICAgICAgMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHRcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlSW5pdCgpIHtcbiAgICAgICAgdGhpcy5kZWxheSA9ICgoNCAqIE1hdGgucmFuZG9tKCkpfDApICogMTAwMDtcbiAgICAgICAgdGhpcy5zcGVlZCA9IC4yNSAqIHRoaXMud29ybGQubGV2ZWw7XG4gICAgICAgIHRoaXMuc3ByaXRlTnVtID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNCk7XG4gICAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB7RXZlbnRMaXN0ZW5lcn0gZnJvbSBcIi4vZXZlbnRzLmpzXCI7XG5cblxuZXhwb3J0IGNsYXNzIEFjdG9yIHtcbiAgICBjb25zdHJ1Y3Rvcih3b3JsZCkge1xuICAgICAgICB0aGlzLmJhc2VDb250cm9sU3RhdGUgPSBudWxsO1xuICAgICAgICB0aGlzLmJhc2VSZW5kZXJTdGF0ZSA9IG51bGw7XG4gICAgICAgIHRoaXMuY29udHJvbFN0YXRlID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZW5kZXJTdGF0ZSA9IG51bGw7XG4gICAgICAgIHRoaXMuZXZlbnRzID0gbmV3IEV2ZW50TGlzdGVuZXIoKTtcblxuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XG4gICAgICAgIHRoaXMueCA9IDA7XG4gICAgICAgIHRoaXMueSA9IDA7XG4gICAgICAgIHRoaXMud2lkdGggPSA2NDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSA2NDtcbiAgICB9XG5cbiAgICBnZXRIaXRCb3hlcygpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbGxlY3QoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB1cGRhdGUoZHQpIHtcbiAgICAgICAgbGV0IGN1ciA9IHRoaXMuY29udHJvbFN0YXRlLm5leHQoe2R0OiBkdH0pO1xuICAgICAgICBpZiAoY3VyLnZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xTdGF0ZSA9IGN1ci52YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXIuZG9uZSkge1xuICAgICAgICAgICAgdGhpcy5jb250cm9sU3RhdGUgPSB0aGlzLmJhc2VDb250cm9sU3RhdGUuYmluZCh0aGlzKSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKGR0LCBjdHgpIHtcbiAgICAgICAgbGV0IGN1ciA9IHRoaXMucmVuZGVyU3RhdGUubmV4dCh7ZHQ6IGR0LCBjdHg6IGN0eH0pO1xuICAgICAgICBpZiAoY3VyLnZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlclN0YXRlID0gY3VyLnZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKGN1ci5kb25lKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlclN0YXRlID0gdGhpcy5iYXNlUmVuZGVyU3RhdGUuYmluZCh0aGlzKSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cblxuZXhwb3J0IGNsYXNzIEV2ZW50TGlzdGVuZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmV2ZW50cyA9IHt9O1xuICAgIH1cblxuICAgIGFkZEV2ZW50TGlzdGVuZXIobmFtZSwgZnVuYykge1xuICAgICAgICBsZXQgZXZlbnRzID0gdGhpcy5ldmVudHNbbmFtZV0gfHwgW107XG4gICAgICAgIHRoaXMuZXZlbnRzW25hbWVdID0gZXZlbnRzO1xuXG4gICAgICAgIGV2ZW50cy5wdXNoKGZ1bmMpO1xuICAgIH1cblxuICAgIGVtaXQobmFtZSwgYXJncykge1xuICAgICAgICBsZXQgZXZlbnRzID0gdGhpcy5ldmVudHNbbmFtZV0gfHwgW107XG4gICAgICAgIGZvciAobGV0IGV2IG9mIGV2ZW50cykge1xuICAgICAgICAgICAgZXYoYXJncyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0IGNsYXNzIENvbnRyb2xsZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmlucHV0ID0ge1xuICAgICAgICAgICAgdXA6IGZhbHNlLFxuICAgICAgICAgICAgZG93bjogZmFsc2UsXG4gICAgICAgICAgICByaWdodDogZmFsc2UsXG4gICAgICAgICAgICBsZWZ0OiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgIH1cblxuICAgIGlzQW55UHJlc3NlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQudXAgfFxuICAgICAgICAgICAgdGhpcy5pbnB1dC5kb3duIHxcbiAgICAgICAgICAgIHRoaXMuaW5wdXQucmlnaHQgfFxuICAgICAgICAgICAgdGhpcy5pbnB1dC5sZWZ0O1xuICAgIH1cblxuICAgIGNsZWFyKCkge1xuICAgICAgICB0aGlzLnNhdmVkSW5wdXQgPSB7XG4gICAgICAgICAgICB1cDogZmFsc2UsXG4gICAgICAgICAgICBkb3duOiBmYWxzZSxcbiAgICAgICAgICAgIHJpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgIGxlZnQ6IGZhbHNlXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXR0YWNoKCkge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IHByZXZlbnREZWZhdWx0ID0gZmFsc2VcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMzg6IGNhc2UgODc6IC8vIFVwXG4gICAgICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LnVwID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmVkSW5wdXQudXAgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSAzNzogY2FzZSA2NTogLy9MZWZ0XG4gICAgICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LmxlZnQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZWRJbnB1dC5sZWZ0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgMzk6IGNhc2UgNjg6IC8vIFJpZ2h0XG4gICAgICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LnJpZ2h0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmVkSW5wdXQucmlnaHQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSA0MDogY2FzZSA4MzogLy8gRG93blxuICAgICAgICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5kb3duID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmVkSW5wdXQuZG93biA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDM4OiBjYXNlIDg3OiAvLyBVcFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LnVwID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlIDM3OiBjYXNlIDY1OiAvL0xlZnRcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5sZWZ0ID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlIDM5OiBjYXNlIDY4OiAvLyBSaWdodFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LnJpZ2h0ID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlIDQwOiBjYXNlIDgzOiAvLyBEb3duXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQuZG93biA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQge0FjdG9yfSBmcm9tIFwiLi9jb21tb24vYWN0b3IuanNcIjtcblxuZXhwb3J0IGNsYXNzIEZsYWcgZXh0ZW5kcyBBY3RvciB7XG4gICAgY29uc3RydWN0b3Iod29ybGQpIHtcbiAgICAgICAgc3VwZXIod29ybGQpO1xuICAgICAgICB0aGlzLndpZHRoID0gNjQ7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gNjQ7XG4gICAgICAgIHRoaXMueCA9IHRoaXMud2lkdGggKiAxMTtcbiAgICAgICAgdGhpcy55ID0gdGhpcy5oZWlnaHQgKiA1O1xuICAgICAgICB0aGlzLnJlbmRlclN0YXRlID0gdGhpcy5yZW5kZXJNYWluLmJpbmQodGhpcykoKTtcbiAgICAgICAgdGhpcy5jb250cm9sU3RhdGUgPSB0aGlzLmNvbnRyb2xNYWluLmJpbmQodGhpcykoKTtcbiAgICAgICAgdGhpcy5zcHJpdGUgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgdGhpcy5zcHJpdGUuc3JjID0gXCIuL2Fzc2V0cy9mbGFnX2Rvd24ucG5nXCI7XG4gICAgICAgIHRoaXMuc3ByaXRlVXAgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgdGhpcy5zcHJpdGVVcC5zcmMgPSBcIi4vYXNzZXRzL2ZsYWcucG5nXCI7XG4gICAgICAgIHRoaXMuaXNVcCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmV2ZW50cy5hZGRFdmVudExpc3RlbmVyKCdjb2xsaXNpb24nLCB0aGlzLmNvbGxpZGUuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgY29sbGlkZShvdGhlcikge1xuICAgICAgICBpZiAodGhpcy5pc1VwKSB7XG4gICAgICAgICAgICB0aGlzLndvcmxkLm5leHRMZXZlbCgpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAqcmVuZGVyTWFpbihjdHgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGxldCB7ZHQsIGN0eH0gPSB5aWVsZCBudWxsO1xuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShcbiAgICAgICAgICAgICAgICB0aGlzLmlzVXA/IHRoaXMuc3ByaXRlVXA6IHRoaXMuc3ByaXRlLFxuICAgICAgICAgICAgICAgIDAsIDAsIDEyNCwgMTI0LFxuICAgICAgICAgICAgICAgIHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgIClcbiAgICAgICAgfVxuICAgIH1cblxuICAgICpjb250cm9sTWFpbigpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGxldCB7ZHR9ID0geWllbGQgbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQge1BsYXllcn0gZnJvbSBcIi4vcGxheWVyLmpzXCI7XG5pbXBvcnQge0Nhcn0gZnJvbSBcIi4vY2FyLmpzXCI7XG5pbXBvcnQge0J1dHRvbn0gZnJvbSBcIi4vYnV0dG9uLmpzXCI7XG5pbXBvcnQge0ZsYWd9IGZyb20gXCIuL2ZsYWcuanNcIjtcblxubGV0IGJhY2tkcm9wID0gbmV3IEltYWdlKCk7XG5iYWNrZHJvcC5zcmMgPSBlbmNvZGVVUkkoJ2Fzc2V0cy9jYW52YXMucG5nJyk7XG5cbmV4cG9ydCBjbGFzcyBHYW1lIHtcbiAgICBjb25zdHJ1Y3RvcihzY3JlZW4pIHtcbiAgICAgICAgLy8gU2V0IHVwIGJ1ZmZlcnNcbiAgICAgICAgdGhpcy5mcm9udEJ1ZmZlciA9IHNjcmVlbjtcbiAgICAgICAgdGhpcy5mcm9udEN0eCA9IHNjcmVlbi5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICB0aGlzLmJhY2tCdWZmZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgdGhpcy5iYWNrQnVmZmVyLndpZHRoID0gc2NyZWVuLndpZHRoO1xuICAgICAgICB0aGlzLmJhY2tCdWZmZXIuaGVpZ2h0ID0gc2NyZWVuLmhlaWdodDtcbiAgICAgICAgdGhpcy5iYWNrQ3R4ID0gdGhpcy5iYWNrQnVmZmVyLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgdGhpcy53aWR0aCA9IHRoaXMuZnJvbnRCdWZmZXIud2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5mcm9udEJ1ZmZlci5oZWlnaHQ7XG5cbiAgICAgICAgLy8gU3RhcnQgdGhlIGdhbWUgbG9vcFxuICAgICAgICB0aGlzLm9sZFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5sZXZlbCA9IDA7XG4gICAgICAgIHRoaXMubGl2ZXMgPSAzO1xuXG4gICAgICAgIHRoaXMuZW5kVGltZW91dCA9IDA7XG5cbiAgICAgICAgdGhpcy5uZXh0TGV2ZWwoKTtcbiAgICB9XG5cbiAgICBwYXVzZShmbGFnKSB7XG4gICAgICAgIHRoaXMucGF1c2VkID0gKGZsYWcgPT0gdHJ1ZSk7XG4gICAgfVxuXG4gICAgbG9vcChuZXdUaW1lKSB7XG4gICAgICAgIHZhciBnYW1lID0gdGhpcztcbiAgICAgICAgdmFyIGVsYXBzZWRUaW1lID0gbmV3VGltZSAtIHRoaXMub2xkVGltZTtcbiAgICAgICAgdGhpcy5vbGRUaW1lID0gbmV3VGltZTtcblxuICAgICAgICBpZighdGhpcy5wYXVzZWQpIHRoaXMudXBkYXRlKGVsYXBzZWRUaW1lKTtcbiAgICAgICAgdGhpcy5yZW5kZXIoZWxhcHNlZFRpbWUsIHRoaXMuZnJvbnRDdHgpO1xuXG4gICAgICAgIC8vIEZsaXAgdGhlIGJhY2sgYnVmZmVyXG4gICAgICAgIHRoaXMuZnJvbnRDdHguZHJhd0ltYWdlKHRoaXMuYmFja0J1ZmZlciwgMCwgMCk7XG4gICAgfVxuXG4gICAgbG9zZSgpIHtcbiAgICAgICAgdGhpcy5lbmRUaW1lb3V0ID0gNDAwMDtcbiAgICAgICAgdGhpcy5sZXZlbCA9IDA7XG4gICAgICAgIHRoaXMubGl2ZXMgPSAzO1xuICAgICAgICB0aGlzLm5leHRMZXZlbCgpO1xuICAgICAgICBjb25zb2xlLmxvZygnbG9zZScpXG4gICAgfVxuXG4gICAgZGllKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnZGllJyk7XG4gICAgICAgIHRoaXMubGl2ZXMtLTtcbiAgICAgICAgaWYgKHRoaXMubGl2ZXMgPD0gMCkge1xuICAgICAgICAgICAgdGhpcy5sb3NlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdGFydCgpO1xuICAgIH1cblxuICAgIG5leHRMZXZlbCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ25leHQnKVxuICAgICAgICB0aGlzLmxldmVsKys7XG4gICAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIgPSBuZXcgUGxheWVyKHt4OiAwLCB5OiAyNTZ9LCB0aGlzKTtcbiAgICAgICAgdGhpcy5idXR0b24gPSBuZXcgQnV0dG9uKHRoaXMpO1xuICAgICAgICB0aGlzLmZsYWcgPSBuZXcgRmxhZyh0aGlzKTtcbiAgICAgICAgdGhpcy5jYXJzID0gW3RoaXMuYnV0dG9uLCB0aGlzLmZsYWddO1xuICAgICAgICBmb3IgKGxldCBpPTE7IGk8MTE7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5jYXJzLnB1c2gobmV3IENhcih0aGlzLCB7aGVhZGluZzogKE1hdGguZmxvb3IoKGkrMSkvMiklMj09PTA/LTE6MSksIHg6IDY0KmksIHk6IC0xMTEyfSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlKGVsYXBzZWRUaW1lKSB7XG4gICAgICAgIGlmICh0aGlzLmVuZFRpbWVvdXQgPiAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wbGF5ZXIudXBkYXRlKGVsYXBzZWRUaW1lKTtcbiAgICAgICAgdGhpcy5idXR0b24udXBkYXRlKGVsYXBzZWRUaW1lKTtcbiAgICAgICAgdGhpcy5mbGFnLnVwZGF0ZShlbGFwc2VkVGltZSk7XG4gICAgICAgIGxldCBoaXRCb3ggPSB0aGlzLnBsYXllci5nZXRIaXRCb3hlcygpWzBdO1xuICAgICAgICBmb3IgKGxldCBjYXIgb2YgdGhpcy5jYXJzKSB7XG4gICAgICAgICAgICBjYXIudXBkYXRlKGVsYXBzZWRUaW1lKTtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAoKGhpdEJveC54ID49IGNhci54ICYmIGhpdEJveC54IDw9IGNhci54ICsgY2FyLndpZHRoIC0xKSB8fCAoaGl0Qm94LnggKyBoaXRCb3gud2lkdGggLTEgPj0gY2FyLnggJiYgaGl0Qm94LnggKyBoaXRCb3gud2lkdGggLTEgPD0gY2FyLnggKyBjYXIud2lkdGggLTEpKSAmJlxuICAgICAgICAgICAgICAgICgoaGl0Qm94LnkgPj0gY2FyLnkgJiYgaGl0Qm94LnkgPD0gY2FyLnkgKyBjYXIuaGVpZ2h0IC0xKSB8fCAoaGl0Qm94LnkgKyBoaXRCb3guaGVpZ2h0IC0xID49IGNhci55ICYmIGhpdEJveC55ICsgaGl0Qm94LmhlaWdodCAtMSA8PSBjYXIueSArIGNhci5oZWlnaHQgLTEpKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXIuZXZlbnRzLmVtaXQoJ2NvbGxpc2lvbicsIGNhcik7XG4gICAgICAgICAgICAgICAgY2FyLmV2ZW50cy5lbWl0KCdjb2xsaXNpb24nLCB0aGlzLnBsYXllcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoZWxhcHNlZFRpbWUsIGN0eCkge1xuICAgICAgICBpZiAodGhpcy5lbmRUaW1lb3V0ID4gMCkge1xuICAgICAgICAgICAgdGhpcy5lbmRUaW1lb3V0IC09IGVsYXBzZWRUaW1lO1xuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGByZ2JhKDAsIDAsIDAsIDAuMSlgO1xuICAgICAgICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBgcmdiYSgyNTUsIDAsIDAsIDAuMSlgO1xuICAgICAgICAgICAgY3R4LmZpbGxUZXh0KFwibG9zZXJcIiwgNDAwLCAyMDApO1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgY3R4LmRyYXdJbWFnZShiYWNrZHJvcCwgMCwgMCk7XG4gICAgICAgIHRoaXMuYnV0dG9uLnJlbmRlcihlbGFwc2VkVGltZSwgY3R4KTtcbiAgICAgICAgdGhpcy5mbGFnLnJlbmRlcihlbGFwc2VkVGltZSwgY3R4KTtcbiAgICAgICAgZm9yIChsZXQgY2FyIG9mIHRoaXMuY2Fycykge1xuICAgICAgICAgICAgY2FyLnJlbmRlcihlbGFwc2VkVGltZSwgY3R4KVxuICAgICAgICB9XG4gICAgICAgIHRoaXMucGxheWVyLnJlbmRlcihlbGFwc2VkVGltZSwgY3R4KTtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICdibGFjayc7XG4gICAgICAgIGN0eC5maWxsVGV4dCh0aGlzLmxpdmVzICsgJyBMaXZlcycsIDcxMCwgNDApO1xuICAgICAgICBjdHguZmlsbFRleHQoJ0xldmVsICcrdGhpcy5sZXZlbCwgNzEwLCAyMClcbiAgICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHtDb250cm9sbGVyfSBmcm9tIFwiLi9jb21tb24vaW5wdXQuanNcIjtcbmltcG9ydCB7RXZlbnRMaXN0ZW5lcn0gZnJvbSBcIi4vY29tbW9uL2V2ZW50cy5qc1wiO1xuaW1wb3J0IHtDYXJ9IGZyb20gXCIuL2Nhci5qc1wiO1xuXG5jb25zdCBNU19QRVJfRlJBTUUgPSAxMDAwLzE2O1xuXG5jb25zdCBTVEFURVMgPSB7XG4gICAgaWRsZTogU3ltYm9sKCksXG4gICAgd2Fsa2luZzogU3ltYm9sKCksXG4gICAgYmxpbmtpbmc6IFN5bWJvbCgpLFxuICAgIGp1bXBpbmc6IFN5bWJvbCgpLFxufVxuXG5sZXQgYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuXG5sZXQgY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKCk7XG5jb250cm9sbGVyLmF0dGFjaCgpO1xuXG5cblxubGV0IGJvbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xuYm9uZy5zcmMgPSBlbmNvZGVVUkkoJ2Fzc2V0cy9ib25nLm9nZycpO1xuXG5sZXQgbXVzaWMgPSBuZXcgQXVkaW8oZW5jb2RlVVJJKCdhc3NldHMvYmdtX2FjdGlvbl8yLm1wMycpKTtcbm11c2ljLmxvb3AgPSB0cnVlO1xubXVzaWMucGxheSgpO1xuXG4oKCk9PntcbnZhciBhdWRpb0N0eCA9IG5ldyB3aW5kb3cuQXVkaW9Db250ZXh0KCk7XG53aW5kb3cuYXVkaW8gPSBhdWRpb0N0eDtcbnZhciBnYWluTm9kZSA9IGF1ZGlvQ3R4LmNyZWF0ZUdhaW4oKTtcbmdhaW5Ob2RlLmdhaW4udmFsdWUgPSAxLjA7XG5nYWluTm9kZS5jb25uZWN0KGF1ZGlvQ3R4LmRlc3RpbmF0aW9uKTtcblxubGV0IGJvbmdTb3VyY2UgPSBhdWRpb0N0eC5jcmVhdGVNZWRpYUVsZW1lbnRTb3VyY2UoYm9uZyk7XG5ib25nU291cmNlLmNvbm5lY3QoZ2Fpbk5vZGUpO1xuXG5sZXQgbXVzaWNTb3VyY2UgPSBhdWRpb0N0eC5jcmVhdGVNZWRpYUVsZW1lbnRTb3VyY2UobXVzaWMpO1xubXVzaWNTb3VyY2UuY29ubmVjdChnYWluTm9kZSk7XG59KSgpXG5cbmV4cG9ydCBjbGFzcyBQbGF5ZXIge1xuICAgIGNvbnN0cnVjdG9yKHBvc2l0aW9uLCB3b3JsZCkge1xuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBTVEFURVMuaWRsZTtcbiAgICAgICAgdGhpcy5zdGF0ZUZ1bmMgPSB0aGlzLnN0YXRlSWRsZS5iaW5kKHRoaXMpKCk7XG4gICAgICAgIHRoaXMueCA9IHBvc2l0aW9uLng7XG4gICAgICAgIHRoaXMueSA9IHBvc2l0aW9uLnk7XG4gICAgICAgIHRoaXMud2lkdGggID0gNjQ7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gNjQ7XG4gICAgICAgIHRoaXMuc3ByaXRlc2hlZXQgID0gbmV3IEltYWdlKCk7XG4gICAgICAgIHRoaXMuc3ByaXRlc2hlZXQuc3JjID0gZW5jb2RlVVJJKCdhc3NldHMvUGxheWVyU3ByaXRlMi5wbmcnKTtcbiAgICAgICAgdGhpcy50aW1lciA9IDA7XG4gICAgICAgIHRoaXMuZnJhbWUgPSAwO1xuICAgICAgICB0aGlzLmV2ZW50cyA9IG5ldyBFdmVudExpc3RlbmVyKCk7XG4gICAgICAgIHRoaXMuc2l0dGluZ1Nwcml0ZXMgPSBbe3g6IDY0KjMsIHk6IDY0fSwge3g6IDY0KjAsIHk6IDY0fSwge3g6IDY0KjEsIHk6IDY0fSwge3g6IDY0KjIsIHk6IDY0fSwge3g6IDY0KjEsIHk6IDY0fSwge3g6IDY0KjAsIHk6IDY0fV07XG4gICAgICAgIHRoaXMuanVtcGluZ1Nwcml0ZXMgPSBbe3g6IDY0KjMsIHk6IDB9LCB7eDogNjQqMiwgeTogMH0sIHt4OiA2NCoxLCB5OiAwfSwge3g6IDY0KjAsIHk6IDB9LCB7eDogNjQqMSwgeTogMH0sIHt4OiA2NCoyLCB5OiAwfSwge3g6IDY0KjMsIHk6IDB9XTtcbiAgICAgICAgdGhpcy5ldmVudHMuYWRkRXZlbnRMaXN0ZW5lcignY29sbGlzaW9uJywgdGhpcy5jb2xsaWRlLmJpbmQodGhpcykpXG4gICAgfVxuXG4gICAgY29sbGlkZShvdGhlcikge1xuICAgICAgICBpZiAob3RoZXIuY29uc3RydWN0b3IgPT09IENhcikge1xuICAgICAgICAgICAgdGhpcy53b3JsZC5kaWUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZSh0aW1lKSB7XG4gICAgICAgIHRoaXMudGltZXIgKz0gdGltZTtcbiAgICAgICAgbGV0IG5ld0ZyYW1lID0gZmFsc2U7XG4gICAgICAgIGlmKHRoaXMudGltZXIgPiBNU19QRVJfRlJBTUUpIHtcbiAgICAgICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGN1ciA9IHRoaXMuc3RhdGVGdW5jLm5leHQoe2R0OiB0aW1lfSk7XG4gICAgICAgIGlmIChjdXIuZG9uZSkge1xuICAgICAgICAgICB0aGlzLnN0YXRlRnVuYyA9IHRoaXMuc3RhdGVJZGxlLmJpbmQodGhpcykoKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXIudmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGVGdW5jID0gY3VyLnZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0SGl0Qm94ZXMoKSB7XG4gICAgICAgIHJldHVybiBbe3g6IHRoaXMueCwgeTogdGhpcy55LCB3aWR0aDogdGhpcy53aWR0aCwgaGVpZ2h0OiB0aGlzLmhlaWdodCwgb2JqOiB0aGlzfV07XG4gICAgfVxuXG4gICAgKnN0YXRlSWRsZSgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGxldCB7ZHR9ID0geWllbGQgbnVsbDtcblxuICAgICAgICAgICAgaWYgKGNvbnRyb2xsZXIuaXNBbnlQcmVzc2VkKCkpIHtcbiAgICAgICAgICAgICAgICBsZXQgaCA9IHt4OiAwLCB5OiAwfTtcbiAgICAgICAgICAgICAgICBpZiAoY29udHJvbGxlci5pbnB1dC5yaWdodCkge1xuICAgICAgICAgICAgICAgICAgICBoLnggPSAxO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29udHJvbGxlci5pbnB1dC5sZWZ0KSB7XG4gICAgICAgICAgICAgICAgICAgIGgueCA9IC0xO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29udHJvbGxlci5pbnB1dC51cCkge1xuICAgICAgICAgICAgICAgICAgICBoLnkgPSAtMTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvbnRyb2xsZXIuaW5wdXQuZG93bikge1xuICAgICAgICAgICAgICAgICAgICBoLnkgPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlRnVuYyA9IHRoaXMuc3RhdGVKdW1waW5nLmJpbmQodGhpcykoaCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAqc3RhdGVKdW1waW5nKGhlYWRpbmcpIHtcbiAgICAgICAgYm9uZy5wbGF5KCk7XG4gICAgICAgIGxldCB7eCwgeX0gPSBoZWFkaW5nO1xuICAgICAgICBsZXQgW2VuZFgsIGVuZFldID0gW3RoaXMueCArIHRoaXMuaGVpZ2h0KngsIHRoaXMueSArIHRoaXMuaGVpZ2h0KnldO1xuICAgICAgICBsZXQgdGltZVRvVGFrZSA9IDEwMDAvIDE4O1xuICAgICAgICBsZXQgdGltZSA9IDA7XG4gICAgICAgIHdoaWxlICh0aW1lIDwgdGltZVRvVGFrZSkge1xuICAgICAgICAgICAgbGV0IHtkdH0gPSB5aWVsZCBudWxsO1xuICAgICAgICAgICAgbGV0IGRkID0gZHQgLyB0aW1lVG9UYWtlO1xuICAgICAgICAgICAgdGltZSArPSBkdDtcbiAgICAgICAgICAgIHRoaXMueCArPSB0aGlzLndpZHRoICogeCAqIGRkO1xuICAgICAgICAgICAgdGhpcy55ICs9IHRoaXMuaGVpZ2h0ICogeSAqIGRkO1xuICAgICAgICB9XG4gICAgICAgIFt0aGlzLngsIHRoaXMueV0gPSBbZW5kWCwgZW5kWV07XG4gICAgICAgIGJvbmcucGF1c2UoKTtcbiAgICAgICAgYm9uZy5mYXN0U2VlaygwKTtcbiAgICB9XG5cbiAgICByZW5kZXIodGltZSwgY3R4KSB7XG4gICAgICAgIHN3aXRjaCh0aGlzLnN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlIFNUQVRFUy5qdW1waW5nOiB7XG4gICAgICAgICAgICAgICAgbGV0IGZyYW1lID0gdGhpcy5mcmFtZSAlICh0aGlzLmp1bXBpbmdTcHJpdGVzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgbGV0IHt4LCB5fSA9IHRoaXMuanVtcGluZ1Nwcml0ZXNbZnJhbWVdO1xuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlc2hlZXQsXG4gICAgICAgICAgICAgICAgICAgIHgsIHksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZyYW1lID09PSB0aGlzLmp1bXBpbmdTcHJpdGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFNUQVRFUy5pZGxlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FzZSBTVEFURVMuaWRsZToge1xuICAgICAgICAgICAgICAgIGlmIChjb250cm9sbGVyLmlzQW55UHJlc3NlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZnJhbWUgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVTLmp1bXBpbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGhhbmRsZSBibGlua2luZ1xuICAgICAgICAgICAgICAgIGxldCBmcmFtZSA9IE1hdGgubWluKHRoaXMuZnJhbWUgJSAodGhpcy5zaXR0aW5nU3ByaXRlcy5sZW5ndGggKyAyMCksIHRoaXMuc2l0dGluZ1Nwcml0ZXMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBmcmFtZSA9IGZyYW1lICUgdGhpcy5zaXR0aW5nU3ByaXRlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgbGV0IHt4LCB5fSA9IHRoaXMuc2l0dGluZ1Nwcml0ZXNbZnJhbWVdO1xuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICAgICAgICAgIC8vIGltYWdlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlc2hlZXQsXG4gICAgICAgICAgICAgICAgICAgIC8vIHNvdXJjZSByZWN0YW5nbGVcbiAgICAgICAgICAgICAgICAgICAgeCwgeSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIC8vIGRlc3RpbmF0aW9uIHJlY3RhbmdsZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IEltcGxlbWVudCB5b3VyIHBsYXllcidzIHJlZGVyaW5nIGFjY29yZGluZyB0byBzdGF0ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl19
