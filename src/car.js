"use strict";

import {Actor} from "./common/actor.js";


export class Car extends Actor {
    constructor(world, args) {
        let {x, y, heading} = args;
        super(world)
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
        if (this.y+this.height < 0 || this.x+this.width < 0 ||
                this.x > this.world.width || this.y > this.world.height) {
            this.reInit();
            return true;
        }
    }

    getHitBoxes() {
        return [{x: this.x, y: this.y, width: this.width, height: this.height, obj: this}];
    }

    *controlDrive() {
        this.reInit();
        let time = 0;
        while (true) {
            let {dt}= yield null;
            time += dt;
            if (time < this.delay) {
                continue;
            }
            this.y += this.heading * this.speed * 400 * dt / 1000;
            if (this.collect()) {
                if (this.heading === 1) {
                    this.y = 1-this.height;
                } else {
                    this.y = this.world.height;
                }
                return this.controlDrive();
            }
        }
    }

    *renderDrive(ctx) {
        while (true) {
            let {dt, ctx} = yield null;
            ctx.save()
            if (this.heading === 1) {
                ctx.translate(this.x+this.width, this.y+this.height);
                ctx.rotate(Math.PI)
            } else {
                ctx.translate(this.x, this.y);
            }
            ctx.drawImage(
                this.sprite,
                247*this.spriteNum, 0, 200, 350,
                0, 0, this.width, this.height
            )
            ctx.restore()
        }
    }

    reInit() {
        this.delay = ((4 * Math.random())|0) * 1000;
        this.speed = .25 * this.world.level;
        this.spriteNum = Math.floor(Math.random() * 4);
    }
}
