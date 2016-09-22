"use strict";

import {Actor} from "./common/actor.js";

export class Flag extends Actor {
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
            this.world.nextLevel()
        }
    }

    *renderMain(ctx) {
        while (true) {
            let {dt, ctx} = yield null;
            ctx.drawImage(
                this.isUp? this.spriteUp: this.sprite,
                0, 0, 124, 124,
                this.x, this.y, this.width, this.height,
            )
        }
    }

    *controlMain() {
        while (true) {
            let {dt} = yield null;
        }
    }
}
