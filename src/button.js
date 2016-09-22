"use strict";

import {Actor} from "./common/actor.js";

export class Button extends Actor {
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
            let {dt, ctx} = yield null;
            ctx.drawImage(
                this.sprite,
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
