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
        if (cur.done) {
           this.controlState = this.baseControlState.bind(this)();
        } else if (cur.value !== null) {
            this.controlState = cur.value;
        }
    }

    render(dt, ctx) {
        let cur = this.renderState.next({dt: dt, ctx: ctx});
        if (cur.done) {
           this.renderState = this.baseRenderState.bind(this)();
        } else if (cur.value !== null) {
            this.renderState = cur.value;
        }
    }
}

export class Car extends Actor {
    constructor(world) {
        super(world)
        this.controlState = this.controlDrive.bind(this)();
        this.renderState = this.renderDrive.bind(this)();
        this.sprite = new Image();
        this.sprite.src = encodeURI('./assets/cars_mini.svg');
        this.width = 64;
        this.height = 112;
        this.spriteNum = 0;
        this.setColor();
    }

    collect() {
        if (this.y+this.height < 0 || this.x+this.width < 0 ||
                this.x > this.world.width || this.y > this.world.height) {
            this.setColor();
            return true;
        }
    }

    *controlDrive() {
        while (true) {
            let {dt}= yield null;
            this.y += 400 * dt / 1000;
            if (this.collect()) {
                this.y = 1-this.height;
            }
        }
    }

    *renderDrive(ctx) {
        while (true) {
            let {dt, ctx} = yield null;
            ctx.fillStyle = "rgb(200,0,0)";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.drawImage(
                this.sprite,
                247*this.spriteNum, 0, 200, 350,
                this.x, this.y, this.width, this.height
            )
        }
    }

    setColor() {
        this.spriteNum = Math.floor(Math.random() * 4);
    }
}
