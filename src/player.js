"use strict";

import {Controller} from "./common/input.js";
import {EventListener} from "./common/events.js";
import {Car} from "./car.js";

const MS_PER_FRAME = 1000/16;

const STATES = {
    idle: Symbol(),
    walking: Symbol(),
    blinking: Symbol(),
    jumping: Symbol(),
}

let audioContext = new AudioContext();

let controller = new Controller();
controller.attach();



let bong = document.createElement('audio');
bong.src = encodeURI('assets/bong.ogg');

let music = new Audio(encodeURI('assets/bgm_action_2.mp3'));
music.loop = true;
music.play();

(()=>{
var audioCtx = new window.AudioContext();
window.audio = audioCtx;
var gainNode = audioCtx.createGain();
gainNode.gain.value = 1.0;
gainNode.connect(audioCtx.destination);

let bongSource = audioCtx.createMediaElementSource(bong);
bongSource.connect(gainNode);

let musicSource = audioCtx.createMediaElementSource(music);
musicSource.connect(gainNode);
})()

export class Player {
    constructor(position, world) {
        this.world = world;
        this.state = STATES.idle;
        this.stateFunc = this.stateIdle.bind(this)();
        this.x = position.x;
        this.y = position.y;
        this.width  = 64;
        this.height = 64;
        this.spritesheet  = new Image();
        this.spritesheet.src = encodeURI('assets/PlayerSprite2.png');
        this.timer = 0;
        this.frame = 0;
        this.events = new EventListener();
        this.sittingSprites = [{x: 64*3, y: 64}, {x: 64*0, y: 64}, {x: 64*1, y: 64}, {x: 64*2, y: 64}, {x: 64*1, y: 64}, {x: 64*0, y: 64}];
        this.jumpingSprites = [{x: 64*3, y: 0}, {x: 64*2, y: 0}, {x: 64*1, y: 0}, {x: 64*0, y: 0}, {x: 64*1, y: 0}, {x: 64*2, y: 0}, {x: 64*3, y: 0}];
        this.events.addEventListener('collision', this.collide.bind(this))
    }

    collide(other) {
        if (other.constructor === Car) {
            this.world.die();
        }
    }

    update(time) {
        this.timer += time;
        let newFrame = false;
        if(this.timer > MS_PER_FRAME) {
            this.timer = 0;
            this.frame++;
        } else {
            return;
        }

        let cur = this.stateFunc.next({dt: time});
        if (cur.done) {
           this.stateFunc = this.stateIdle.bind(this)();
        } else if (cur.value !== null) {
            this.stateFunc = cur.value;
        }
    }

    getHitBoxes() {
        return [{x: this.x, y: this.y, width: this.width, height: this.height, obj: this}];
    }

    *stateIdle() {
        while (true) {
            let {dt} = yield null;

            if (controller.isAnyPressed()) {
                let h = {x: 0, y: 0};
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
        let {x, y} = heading;
        let [endX, endY] = [this.x + this.height*x, this.y + this.height*y];
        let timeToTake = 1000/ 18;
        let time = 0;
        while (time < timeToTake) {
            let {dt} = yield null;
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
        switch(this.state) {
            case STATES.jumping: {
                let frame = this.frame % (this.jumpingSprites.length);
                let {x, y} = this.jumpingSprites[frame];
                ctx.drawImage(
                    this.spritesheet,
                    x, y, this.width, this.height,
                    this.x, this.y, this.width, this.height
                );
                if (this.frame === this.jumpingSprites.length) {
                    this.frame = 0;
                    this.state = STATES.idle;
                }
                break;
            }

            case STATES.idle: {
                if (controller.isAnyPressed()) {
                    this.frame = 0;
                    this.state = STATES.jumping;
                }
                // handle blinking
                let frame = Math.min(this.frame % (this.sittingSprites.length + 20), this.sittingSprites.length);
                frame = frame % this.sittingSprites.length;
                let {x, y} = this.sittingSprites[frame];
                ctx.drawImage(
                    // image
                    this.spritesheet,
                    // source rectangle
                    x, y, this.width, this.height,
                    // destination rectangle
                    this.x, this.y, this.width, this.height
                );
                break;
                // TODO: Implement your player's redering according to state
            }
        }
    }
}
