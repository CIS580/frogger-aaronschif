"use strict";

export class Actor {
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
        let cur = this.controlState.next({dt: dt});
        if (cur.value !== null) {
            this.controlState = cur.value;
        } else if (cur.done) {
            this.controlState = this.baseControlState.bind(this)();
        }
    }

    render(dt, ctx) {
        let cur = this.renderState.next({dt: dt, ctx: ctx});
        if (cur.value !== null) {
            this.renderState = cur.value;
        } else if (cur.done) {
            this.renderState = this.baseRenderState.bind(this)();
        }
    }
}

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
            ctx.drawImage(
                this.sprite,
                247*this.spriteNum, 0, 200, 350,
                this.x, this.y, this.width, this.height
            )
        }
    }

    reInit() {
        this.delay = 4 * Math.random() * 1000;
        this.speed = .5 + Math.random() /4;
        this.spriteNum = Math.floor(Math.random() * 4);
    }
}
