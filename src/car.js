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

    update(dt) {
        let cur = this.controlState.next({dt: time});
        if (cur.done) {
           this.controlState = this.baseControlState.bind(this)();
        } else if (cur.value !== null) {
            this.controlState = cur.value;
        }
    }

    render(dt, ctx) {
        let cur = this.renderState.next({dt: time});
        if (cur.done) {
           this.renderState = this.baseRenderState.bind(this)();
        } else if (cur.value !== null) {
            this.renderState = cur.value;
        }
    }
}

export class Car extends Actor {

}
