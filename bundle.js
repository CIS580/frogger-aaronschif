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
    ctx.fillStyle = "lightblue";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backdrop, 0, 0);
    player.render(elapsedTime, ctx);
    for (let car of cars) {
        car.render(elapsedTime, ctx);
    }
}

},{"./car.js":2,"./game.js":4,"./player.js":5}],2:[function(require,module,exports){
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
class Car extends Actor {
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
            ctx.drawImage(this.sprite, 247 * this.spriteNum, 0, 200, 350, this.x, this.y, this.width, this.height);
        }
    }

    reInit() {
        this.delay = 4 * Math.random() * 1000;
        this.speed = .5 + Math.random() / 4;
        this.spriteNum = Math.floor(Math.random() * 4);
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

let audioContext = new AudioContext();

let controller = new _common.Controller();
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

},{"./common.js":3}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2Nhci5qcyIsInNyYy9jb21tb24uanMiLCJzcmMvZ2FtZS5qcyIsInNyYy9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFFQSxJQUFJLFNBQVMsU0FBUyxjQUFULENBQXdCLFFBQXhCLENBQWI7QUFDQSxJQUFJLFdBQVcsSUFBSSxLQUFKLEVBQWY7QUFDQSxTQUFTLEdBQVQsR0FBZSxVQUFVLG1CQUFWLENBQWY7QUFDQSxJQUFJLE9BQU8sZUFBUyxNQUFULEVBQWlCLE1BQWpCLEVBQXlCLE1BQXpCLENBQVg7QUFDQSxJQUFJLFNBQVMsbUJBQVcsRUFBQyxHQUFHLENBQUosRUFBTyxHQUFHLEdBQVYsRUFBWCxDQUFiO0FBQ0EsSUFBSSxPQUFPLEVBQVg7QUFDQSxLQUFLLElBQUksSUFBRSxDQUFYLEVBQWMsSUFBRSxFQUFoQixFQUFvQixHQUFwQixFQUF5QjtBQUNyQixTQUFLLElBQUwsQ0FBVSxhQUFRLE1BQVIsRUFBZ0IsRUFBQyxTQUFVLEtBQUssS0FBTCxDQUFXLENBQUMsSUFBRSxDQUFILElBQU0sQ0FBakIsSUFBb0IsQ0FBcEIsS0FBd0IsQ0FBeEIsR0FBMEIsQ0FBQyxDQUEzQixHQUE2QixDQUF4QyxFQUE0QyxHQUFHLEtBQUcsQ0FBbEQsRUFBcUQsR0FBRyxDQUFDLElBQXpELEVBQWhCLENBQVY7QUFDSDs7QUFFRCxJQUFJLGFBQWEsVUFBUyxTQUFULEVBQW9CO0FBQ2pDLFNBQUssSUFBTCxDQUFVLFNBQVY7QUFDQSxXQUFPLHFCQUFQLENBQTZCLFVBQTdCO0FBQ0gsQ0FIRDtBQUlBLFdBQVcsWUFBWSxHQUFaLEVBQVg7O0FBRUEsU0FBUyxNQUFULENBQWdCLFdBQWhCLEVBQTZCO0FBQ3pCLFdBQU8sTUFBUCxDQUFjLFdBQWQ7QUFDQSxTQUFLLElBQUksR0FBVCxJQUFnQixJ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S0FBSyxjQUFMLENBQW9CLE1BQXZDLEVBQStDO0FBQzNDLDZCQUFLLEtBQUwsR0FBYSxDQUFiO0FBQ0EsNkJBQUssS0FBTCxHQUFhLE9BQU8sSUFBcEI7QUFDSDtBQUNEO0FBQ0g7O0FBRUQsaUJBQUssT0FBTyxJQUFaO0FBQWtCO0FBQ2Qsd0JBQUksV0FBVyxZQUFYLEVBQUosRUFBK0I7QUFDM0IsNkJBQUssS0FBTCxHQUFhLENBQWI7QUFDQSw2QkFBSyxLQUFMLEdBQWEsT0FBTyxPQUFwQjtBQUNIO0FBQ0Q7QUFDQSx3QkFBSSxRQUFRLEtBQUssR0FBTCxDQUFTLEtBQUssS0FBTCxJQUFjLEtBQUssY0FBTCxDQUFvQixNQUFwQixHQUE2QixFQUEzQyxDQUFULEVBQXlELEtBQUssY0FBTCxDQUFvQixNQUE3RSxDQUFaO0FBQ0EsNEJBQVEsUUFBUSxLQUFLLGNBQUwsQ0FBb0IsTUFBcEM7QUFDQSx3QkFBSSxFQUFDLENBQUQsRUFBSSxDQUFKLEtBQVMsS0FBSyxjQUFMLENBQW9CLEtBQXBCLENBQWI7QUFDQSx3QkFBSSxTQUFKO0FBQ0k7QUFDQSx5QkFBSyxXQUZUO0FBR0k7QUFDQSxxQkFKSixFQUlPLENBSlAsRUFJVSxLQUFLLEtBSmYsRUFJc0IsS0FBSyxNQUozQjtBQUtJO0FBQ0EseUJBQUssQ0FOVCxFQU1ZLEtBQUssQ0FOakIsRUFNb0IsS0FBSyxLQU56QixFQU1nQyxLQUFLLE1BTnJDO0FBUUE7QUFDQTtBQUNIO0FBbkNMO0FBcUNIO0FBOUdlO1FBQVAsTSxHQUFBLE0iLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB7R2FtZX0gZnJvbSBcIi4vZ2FtZS5qc1wiO1xuaW1wb3J0IHtQbGF5ZXJ9IGZyb20gXCIuL3BsYXllci5qc1wiO1xuaW1wb3J0IHtDYXJ9IGZyb20gXCIuL2Nhci5qc1wiO1xuXG52YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjcmVlbicpO1xubGV0IGJhY2tkcm9wID0gbmV3IEltYWdlKCk7XG5iYWNrZHJvcC5zcmMgPSBlbmNvZGVVUkkoJ2Fzc2V0cy9jYW52YXMucG5nJyk7XG52YXIgZ2FtZSA9IG5ldyBHYW1lKGNhbnZhcywgdXBkYXRlLCByZW5kZXIpO1xudmFyIHBsYXllciA9IG5ldyBQbGF5ZXIoe3g6IDAsIHk6IDI1Nn0pXG5sZXQgY2FycyA9IFtdO1xuZm9yIChsZXQgaT0xOyBpPDExOyBpKyspIHtcbiAgICBjYXJzLnB1c2gobmV3IENhcihjYW52YXMsIHtoZWFkaW5nOiAoTWF0aC5mbG9vcigoaSsxKS8yKSUyPT09MD8tMToxKSwgeDogNjQqaSwgeTogLTExMTJ9KSk7XG59XG5cbnZhciBtYXN0ZXJMb29wID0gZnVuY3Rpb24odGltZXN0YW1wKSB7XG4gICAgZ2FtZS5sb29wKHRpbWVzdGFtcCk7XG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtYXN0ZXJMb29wKTtcbn1cbm1hc3Rlckxvb3AocGVyZm9ybWFuY2Uubm93KCkpO1xuXG5mdW5jdGlvbiB1cGRhdGUoZWxhcHNlZFRpbWUpIHtcbiAgICBwbGF5ZXIudXBkYXRlKGVsYXBzZWRUaW1lKTtcbiAgICBmb3IgKGxldCBjYXIgb2YgY2Fycykge1xuICAgICAgICBjYXIudXBkYXRlKGVsYXBzZWRUaW1lKTtcbiAgICB9XG4gICAgLy8gVE9ETzogVXBkYXRlIHRoZSBnYW1lIG9iamVjdHNcbn1cblxuZnVuY3Rpb24gcmVuZGVyKGVsYXBzZWRUaW1lLCBjdHgpIHtcbiAgICBjdHguZmlsbFN0eWxlID0gXCJsaWdodGJsdWVcIjtcbiAgICAvLyBjdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICBjdHguZHJhd0ltYWdlKGJhY2tkcm9wLCAwLCAwKTtcbiAgICBwbGF5ZXIucmVuZGVyKGVsYXBzZWRUaW1lLCBjdHgpO1xuICAgIGZvciAobGV0IGNhciBvZiBjYXJzKSB7XG4gICAgICAgIGNhci5yZW5kZXIoZWxhcHNlZFRpbWUsIGN0eClcbiAgICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0IGNsYXNzIEFjdG9yIHtcbiAgICBjb25zdHJ1Y3Rvcih3b3JsZCkge1xuICAgICAgICB0aGlzLmJhc2VDb250cm9sU3RhdGUgPSBudWxsO1xuICAgICAgICB0aGlzLmJhc2VSZW5kZXJTdGF0ZSA9IG51bGw7XG4gICAgICAgIHRoaXMuY29udHJvbFN0YXRlID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZW5kZXJTdGF0ZSA9IG51bGw7XG5cbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuICAgICAgICB0aGlzLnggPSAwO1xuICAgICAgICB0aGlzLnkgPSAwO1xuICAgICAgICB0aGlzLndpZHRoID0gNjQ7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gNjQ7XG4gICAgfVxuXG4gICAgZ2V0SGl0Qm94ZXMoKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb2xsZWN0KCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdXBkYXRlKGR0KSB7XG4gICAgICAgIGxldCBjdXIgPSB0aGlzLmNvbnRyb2xTdGF0ZS5uZXh0KHtkdDogZHR9KTtcbiAgICAgICAgaWYgKGN1ci52YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5jb250cm9sU3RhdGUgPSBjdXIudmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VyLmRvbmUpIHtcbiAgICAgICAgICAgIHRoaXMuY29udHJvbFN0YXRlID0gdGhpcy5iYXNlQ29udHJvbFN0YXRlLmJpbmQodGhpcykoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcihkdCwgY3R4KSB7XG4gICAgICAgIGxldCBjdXIgPSB0aGlzLnJlbmRlclN0YXRlLm5leHQoe2R0OiBkdCwgY3R4OiBjdHh9KTtcbiAgICAgICAgaWYgKGN1ci52YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJTdGF0ZSA9IGN1ci52YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXIuZG9uZSkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJTdGF0ZSA9IHRoaXMuYmFzZVJlbmRlclN0YXRlLmJpbmQodGhpcykoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIENhciBleHRlbmRzIEFjdG9yIHtcbiAgICBjb25zdHJ1Y3Rvcih3b3JsZCwgYXJncykge1xuICAgICAgICBsZXQge3gsIHksIGhlYWRpbmd9ID0gYXJncztcbiAgICAgICAgc3VwZXIod29ybGQpXG4gICAgICAgIHRoaXMuY29udHJvbFN0YXRlID0gdGhpcy5jb250cm9sRHJpdmUuYmluZCh0aGlzKSgpO1xuICAgICAgICB0aGlzLnJlbmRlclN0YXRlID0gdGhpcy5yZW5kZXJEcml2ZS5iaW5kKHRoaXMpKCk7XG4gICAgICAgIHRoaXMuc3ByaXRlID0gbmV3IEltYWdlKCk7XG4gICAgICAgIHRoaXMuc3ByaXRlLnNyYyA9IGVuY29kZVVSSSgnLi9hc3NldHMvY2Fyc19taW5pLnN2ZycpO1xuICAgICAgICB0aGlzLndpZHRoID0gNjQ7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gMTEyO1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgICAgICB0aGlzLmhlYWRpbmcgPSBoZWFkaW5nO1xuICAgICAgICB0aGlzLnNwZWVkID0gMTtcbiAgICAgICAgdGhpcy5zcHJpdGVOdW0gPSAwO1xuICAgICAgICB0aGlzLmRlbGF5ID0gMDtcbiAgICAgICAgdGhpcy5yZUluaXQoKTtcbiAgICB9XG5cbiAgICBjb2xsZWN0KCkge1xuICAgICAgICBpZiAodGhpcy55K3RoaXMuaGVpZ2h0IDwgMCB8fCB0aGlzLngrdGhpcy53aWR0aCA8IDAgfHxcbiAgICAgICAgICAgICAgICB0aGlzLnggPiB0aGlzLndvcmxkLndpZHRoIHx8IHRoaXMueSA+IHRoaXMud29ybGQuaGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLnJlSW5pdCgpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAqY29udHJvbERyaXZlKCkge1xuICAgICAgICB0aGlzLnJlSW5pdCgpO1xuICAgICAgICBsZXQgdGltZSA9IDA7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBsZXQge2R0fT0geWllbGQgbnVsbDtcbiAgICAgICAgICAgIHRpbWUgKz0gZHQ7XG4gICAgICAgICAgICBpZiAodGltZSA8IHRoaXMuZGVsYXkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMueSArPSB0aGlzLmhlYWRpbmcgKiB0aGlzLnNwZWVkICogNDAwICogZHQgLyAxMDAwO1xuICAgICAgICAgICAgaWYgKHRoaXMuY29sbGVjdCgpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaGVhZGluZyA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnkgPSAxLXRoaXMuaGVpZ2h0O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMueSA9IHRoaXMud29ybGQuaGVpZ2h0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb250cm9sRHJpdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgICpyZW5kZXJEcml2ZShjdHgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGxldCB7ZHQsIGN0eH0gPSB5aWVsZCBudWxsO1xuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZSxcbiAgICAgICAgICAgICAgICAyNDcqdGhpcy5zcHJpdGVOdW0sIDAsIDIwMCwgMzUwLFxuICAgICAgICAgICAgICAgIHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodFxuICAgICAgICAgICAgKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVJbml0KCkge1xuICAgICAgICB0aGlzLmRlbGF5ID0gNCAqIE1hdGgucmFuZG9tKCkgKiAxMDAwO1xuICAgICAgICB0aGlzLnNwZWVkID0gLjUgKyBNYXRoLnJhbmRvbSgpIC80O1xuICAgICAgICB0aGlzLnNwcml0ZU51bSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDQpO1xuICAgIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnQgY2xhc3MgQ29udHJvbGxlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuaW5wdXQgPSB7XG4gICAgICAgICAgICB1cDogZmFsc2UsXG4gICAgICAgICAgICBkb3duOiBmYWxzZSxcbiAgICAgICAgICAgIHJpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgIGxlZnQ6IGZhbHNlLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgaXNBbnlQcmVzc2VkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC51cCB8XG4gICAgICAgICAgICB0aGlzLmlucHV0LmRvd24gfFxuICAgICAgICAgICAgdGhpcy5pbnB1dC5yaWdodCB8XG4gICAgICAgICAgICB0aGlzLmlucHV0LmxlZnQ7XG4gICAgfVxuXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuc2F2ZWRJbnB1dCA9IHtcbiAgICAgICAgICAgIHVwOiBmYWxzZSxcbiAgICAgICAgICAgIGRvd246IGZhbHNlLFxuICAgICAgICAgICAgcmlnaHQ6IGZhbHNlLFxuICAgICAgICAgICAgbGVmdDogZmFsc2VcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhdHRhY2goKSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgcHJldmVudERlZmF1bHQgPSBmYWxzZVxuICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAzODogY2FzZSA4NzogLy8gVXBcbiAgICAgICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQudXAgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZWRJbnB1dC51cCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlIDM3OiBjYXNlIDY1OiAvL0xlZnRcbiAgICAgICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQubGVmdCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlZElucHV0LmxlZnQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSAzOTogY2FzZSA2ODogLy8gUmlnaHRcbiAgICAgICAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQucmlnaHQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZWRJbnB1dC5yaWdodCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlIDQwOiBjYXNlIDgzOiAvLyBEb3duXG4gICAgICAgICAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LmRvd24gPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZWRJbnB1dC5kb3duID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMzg6IGNhc2UgODc6IC8vIFVwXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQudXAgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgMzc6IGNhc2UgNjU6IC8vTGVmdFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LmxlZnQgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgMzk6IGNhc2UgNjg6IC8vIFJpZ2h0XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQucmlnaHQgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgNDA6IGNhc2UgODM6IC8vIERvd25cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5kb3duID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cblxuZXhwb3J0IGNsYXNzIEdhbWUge1xuICAgIGNvbnN0cnVjdG9yKHNjcmVlbiwgdXBkYXRlRnVuY3Rpb24sIHJlbmRlckZ1bmN0aW9uKSB7XG5cbiAgICAgICAgdGhpcy51cGRhdGUgPSB1cGRhdGVGdW5jdGlvbjtcbiAgICAgICAgdGhpcy5yZW5kZXIgPSByZW5kZXJGdW5jdGlvbjtcblxuICAgICAgICAvLyBTZXQgdXAgYnVmZmVyc1xuICAgICAgICB0aGlzLmZyb250QnVmZmVyID0gc2NyZWVuO1xuICAgICAgICB0aGlzLmZyb250Q3R4ID0gc2NyZWVuLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIHRoaXMuYmFja0J1ZmZlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICB0aGlzLmJhY2tCdWZmZXIud2lkdGggPSBzY3JlZW4ud2lkdGg7XG4gICAgICAgIHRoaXMuYmFja0J1ZmZlci5oZWlnaHQgPSBzY3JlZW4uaGVpZ2h0O1xuICAgICAgICB0aGlzLmJhY2tDdHggPSB0aGlzLmJhY2tCdWZmZXIuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICAvLyBTdGFydCB0aGUgZ2FtZSBsb29wXG4gICAgICAgIHRoaXMub2xkVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHBhdXNlKGZsYWcpIHtcbiAgICAgICAgdGhpcy5wYXVzZWQgPSAoZmxhZyA9PSB0cnVlKTtcbiAgICB9XG5cbiAgICBsb29wKG5ld1RpbWUpIHtcbiAgICAgICAgdmFyIGdhbWUgPSB0aGlzO1xuICAgICAgICB2YXIgZWxhcHNlZFRpbWUgPSBuZXdUaW1lIC0gdGhpcy5vbGRUaW1lO1xuICAgICAgICB0aGlzLm9sZFRpbWUgPSBuZXdUaW1lO1xuXG4gICAgICAgIGlmKCF0aGlzLnBhdXNlZCkgdGhpcy51cGRhdGUoZWxhcHNlZFRpbWUpO1xuICAgICAgICB0aGlzLnJlbmRlcihlbGFwc2VkVGltZSwgdGhpcy5mcm9udEN0eCk7XG5cbiAgICAgICAgLy8gRmxpcCB0aGUgYmFjayBidWZmZXJcbiAgICAgICAgdGhpcy5mcm9udEN0eC5kcmF3SW1hZ2UodGhpcy5iYWNrQnVmZmVyLCAwLCAwKTtcbiAgICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHtDb250cm9sbGVyfSBmcm9tIFwiLi9jb21tb24uanNcIjtcblxuY29uc3QgTVNfUEVSX0ZSQU1FID0gMTAwMC8xNjtcblxuY29uc3QgU1RBVEVTID0ge1xuICAgIGlkbGU6IFN5bWJvbCgpLFxuICAgIHdhbGtpbmc6IFN5bWJvbCgpLFxuICAgIGJsaW5raW5nOiBTeW1ib2woKSxcbiAgICBqdW1waW5nOiBTeW1ib2woKSxcbn1cblxubGV0IGF1ZGlvQ29udGV4dCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcblxubGV0IGNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcigpO1xuY29udHJvbGxlci5hdHRhY2goKTtcblxuXG5cbmxldCBib25nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmJvbmcuc3JjID0gZW5jb2RlVVJJKCdhc3NldHMvYm9uZy5vZ2cnKTtcblxubGV0IG11c2ljID0gbmV3IEF1ZGlvKGVuY29kZVVSSSgnYXNzZXRzL2JnbV9hY3Rpb25fMi5tcDMnKSk7XG5tdXNpYy5sb29wID0gdHJ1ZTtcbm11c2ljLnBsYXkoKTtcblxuKCgpPT57XG52YXIgYXVkaW9DdHggPSBuZXcgd2luZG93LkF1ZGlvQ29udGV4dCgpO1xud2luZG93LmF1ZGlvID0gYXVkaW9DdHg7XG52YXIgZ2Fpbk5vZGUgPSBhdWRpb0N0eC5jcmVhdGVHYWluKCk7XG5nYWluTm9kZS5nYWluLnZhbHVlID0gMS4wO1xuZ2Fpbk5vZGUuY29ubmVjdChhdWRpb0N0eC5kZXN0aW5hdGlvbik7XG5cbmxldCBib25nU291cmNlID0gYXVkaW9DdHguY3JlYXRlTWVkaWFFbGVtZW50U291cmNlKGJvbmcpO1xuYm9uZ1NvdXJjZS5jb25uZWN0KGdhaW5Ob2RlKTtcblxubGV0IG11c2ljU291cmNlID0gYXVkaW9DdHguY3JlYXRlTWVkaWFFbGVtZW50U291cmNlKG11c2ljKTtcbm11c2ljU291cmNlLmNvbm5lY3QoZ2Fpbk5vZGUpO1xufSkoKVxuXG5leHBvcnQgY2xhc3MgUGxheWVyIHtcbiAgICBjb25zdHJ1Y3Rvcihwb3NpdGlvbikge1xuICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVTLmlkbGU7XG4gICAgICAgIHRoaXMuc3RhdGVGdW5jID0gdGhpcy5zdGF0ZUlkbGUuYmluZCh0aGlzKSgpO1xuICAgICAgICB0aGlzLnggPSBwb3NpdGlvbi54O1xuICAgICAgICB0aGlzLnkgPSBwb3NpdGlvbi55O1xuICAgICAgICB0aGlzLndpZHRoICA9IDY0O1xuICAgICAgICB0aGlzLmhlaWdodCA9IDY0O1xuICAgICAgICB0aGlzLnNwcml0ZXNoZWV0ICA9IG5ldyBJbWFnZSgpO1xuICAgICAgICB0aGlzLnNwcml0ZXNoZWV0LnNyYyA9IGVuY29kZVVSSSgnYXNzZXRzL1BsYXllclNwcml0ZTIucG5nJyk7XG4gICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICAgICAgdGhpcy5zaXR0aW5nU3ByaXRlcyA9IFt7eDogNjQqMywgeTogNjR9LCB7eDogNjQqMCwgeTogNjR9LCB7eDogNjQqMSwgeTogNjR9LCB7eDogNjQqMiwgeTogNjR9LCB7eDogNjQqMSwgeTogNjR9LCB7eDogNjQqMCwgeTogNjR9XTtcbiAgICAgICAgdGhpcy5qdW1waW5nU3ByaXRlcyA9IFt7eDogNjQqMywgeTogMH0sIHt4OiA2NCoyLCB5OiAwfSwge3g6IDY0KjEsIHk6IDB9LCB7eDogNjQqMCwgeTogMH0sIHt4OiA2NCoxLCB5OiAwfSwge3g6IDY0KjIsIHk6IDB9LCB7eDogNjQqMywgeTogMH1dO1xuICAgIH1cblxuICAgIHVwZGF0ZSh0aW1lKSB7XG4gICAgICAgIHRoaXMudGltZXIgKz0gdGltZTtcbiAgICAgICAgbGV0IG5ld0ZyYW1lID0gZmFsc2U7XG4gICAgICAgIGlmKHRoaXMudGltZXIgPiBNU19QRVJfRlJBTUUpIHtcbiAgICAgICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGN1ciA9IHRoaXMuc3RhdGVGdW5jLm5leHQoe2R0OiB0aW1lfSk7XG4gICAgICAgIGlmIChjdXIuZG9uZSkge1xuICAgICAgICAgICB0aGlzLnN0YXRlRnVuYyA9IHRoaXMuc3RhdGVJZGxlLmJpbmQodGhpcykoKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXIudmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGVGdW5jID0gY3VyLnZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgKnN0YXRlSWRsZSgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGxldCB7ZHR9ID0geWllbGQgbnVsbDtcblxuICAgICAgICAgICAgaWYgKGNvbnRyb2xsZXIuaXNBbnlQcmVzc2VkKCkpIHtcbiAgICAgICAgICAgICAgICBsZXQgaCA9IHt4OiAwLCB5OiAwfTtcbiAgICAgICAgICAgICAgICBpZiAoY29udHJvbGxlci5pbnB1dC5yaWdodCkge1xuICAgICAgICAgICAgICAgICAgICBoLnggPSAxO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29udHJvbGxlci5pbnB1dC5sZWZ0KSB7XG4gICAgICAgICAgICAgICAgICAgIGgueCA9IC0xO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29udHJvbGxlci5pbnB1dC51cCkge1xuICAgICAgICAgICAgICAgICAgICBoLnkgPSAtMTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvbnRyb2xsZXIuaW5wdXQuZG93bikge1xuICAgICAgICAgICAgICAgICAgICBoLnkgPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlRnVuYyA9IHRoaXMuc3RhdGVKdW1waW5nLmJpbmQodGhpcykoaCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAqc3RhdGVKdW1waW5nKGhlYWRpbmcpIHtcbiAgICAgICAgYm9uZy5wbGF5KCk7XG4gICAgICAgIGxldCB7eCwgeX0gPSBoZWFkaW5nO1xuICAgICAgICBsZXQgW2VuZFgsIGVuZFldID0gW3RoaXMueCArIHRoaXMuaGVpZ2h0KngsIHRoaXMueSArIHRoaXMuaGVpZ2h0KnldO1xuICAgICAgICBsZXQgdGltZVRvVGFrZSA9IDEwMDAvIDE4O1xuICAgICAgICBsZXQgdGltZSA9IDA7XG4gICAgICAgIHdoaWxlICh0aW1lIDwgdGltZVRvVGFrZSkge1xuICAgICAgICAgICAgbGV0IHtkdH0gPSB5aWVsZCBudWxsO1xuICAgICAgICAgICAgbGV0IGRkID0gZHQgLyB0aW1lVG9UYWtlO1xuICAgICAgICAgICAgdGltZSArPSBkdDtcbiAgICAgICAgICAgIHRoaXMueCArPSB0aGlzLndpZHRoICogeCAqIGRkO1xuICAgICAgICAgICAgdGhpcy55ICs9IHRoaXMuaGVpZ2h0ICogeSAqIGRkO1xuICAgICAgICB9XG4gICAgICAgIFt0aGlzLngsIHRoaXMueV0gPSBbZW5kWCwgZW5kWV07XG4gICAgICAgIGJvbmcucGF1c2UoKTtcbiAgICAgICAgYm9uZy5mYXN0U2VlaygwKTtcbiAgICB9XG5cbiAgICByZW5kZXIodGltZSwgY3R4KSB7XG4gICAgICAgIHN3aXRjaCh0aGlzLnN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlIFNUQVRFUy5qdW1waW5nOiB7XG4gICAgICAgICAgICAgICAgbGV0IGZyYW1lID0gdGhpcy5mcmFtZSAlICh0aGlzLmp1bXBpbmdTcHJpdGVzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgbGV0IHt4LCB5fSA9IHRoaXMuanVtcGluZ1Nwcml0ZXNbZnJhbWVdO1xuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlc2hlZXQsXG4gICAgICAgICAgICAgICAgICAgIHgsIHksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZyYW1lID09PSB0aGlzLmp1bXBpbmdTcHJpdGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFNUQVRFUy5pZGxlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FzZSBTVEFURVMuaWRsZToge1xuICAgICAgICAgICAgICAgIGlmIChjb250cm9sbGVyLmlzQW55UHJlc3NlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZnJhbWUgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVTLmp1bXBpbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGhhbmRsZSBibGlua2luZ1xuICAgICAgICAgICAgICAgIGxldCBmcmFtZSA9IE1hdGgubWluKHRoaXMuZnJhbWUgJSAodGhpcy5zaXR0aW5nU3ByaXRlcy5sZW5ndGggKyAyMCksIHRoaXMuc2l0dGluZ1Nwcml0ZXMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBmcmFtZSA9IGZyYW1lICUgdGhpcy5zaXR0aW5nU3ByaXRlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgbGV0IHt4LCB5fSA9IHRoaXMuc2l0dGluZ1Nwcml0ZXNbZnJhbWVdO1xuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICAgICAgICAgIC8vIGltYWdlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlc2hlZXQsXG4gICAgICAgICAgICAgICAgICAgIC8vIHNvdXJjZSByZWN0YW5nbGVcbiAgICAgICAgICAgICAgICAgICAgeCwgeSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIC8vIGRlc3RpbmF0aW9uIHJlY3RhbmdsZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IEltcGxlbWVudCB5b3VyIHBsYXllcidzIHJlZGVyaW5nIGFjY29yZGluZyB0byBzdGF0ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl19
