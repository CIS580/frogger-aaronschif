"use strict";

export class Actor {
    constructor() {
        this.baseControlState = null;
        this.baseRenderState = null;
        this.controlState = null;
        this.renderState = null;

        this.x = 0;
        this.y = 0;
        this.width = 64;
        this.height = 64;
    }

    getHitBoxes() {
        return [];
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
    constructor() {
        super()
        this.controlState = this.controlDrive.bind(this)();
        this.renderState = this.renderDrive.bind(this)();
    }

    *controlDrive() {
        while (true) {
            let {dt}= yield null;
            this.y += 1;
        }
    }

    *renderDrive(ctx) {
        while (true) {
            let {dt, ctx} = yield null;
            ctx.fillStyle = "rgb(200,0,0)";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}
