"use strict";

import {Player} from "./player.js";
import {Car} from "./car.js";
import {Button} from "./button.js";
import {Flag} from "./flag.js";

let backdrop = new Image();
backdrop.src = encodeURI('assets/canvas.png');

export class Game {
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
        this.paused = (flag == true);
    }

    loop(newTime) {
        var game = this;
        var elapsedTime = newTime - this.oldTime;
        this.oldTime = newTime;

        if(!this.paused) this.update(elapsedTime);
        this.render(elapsedTime, this.frontCtx);

        // Flip the back buffer
        this.frontCtx.drawImage(this.backBuffer, 0, 0);
    }

    lose() {
        this.endTimeout = 4000;
        this.level = 0;
        this.lives = 3;
        this.nextLevel();
        console.log('lose')
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
        console.log('next')
        this.level++;
        this.start();
    }

    start() {
        this.player = new Player({x: 0, y: 256}, this);
        this.button = new Button(this);
        this.flag = new Flag(this);
        this.cars = [this.button, this.flag];
        for (let i=1; i<11; i++) {
            this.cars.push(new Car(this, {heading: (Math.floor((i+1)/2)%2===0?-1:1), x: 64*i, y: -1112}));
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
            if (
                ((hitBox.x >= car.x && hitBox.x <= car.x + car.width -1) || (hitBox.x + hitBox.width -1 >= car.x && hitBox.x + hitBox.width -1 <= car.x + car.width -1)) &&
                ((hitBox.y >= car.y && hitBox.y <= car.y + car.height -1) || (hitBox.y + hitBox.height -1 >= car.y && hitBox.y + hitBox.height -1 <= car.y + car.height -1))
            ) {
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
            return
        }
        ctx.drawImage(backdrop, 0, 0);
        this.button.render(elapsedTime, ctx);
        this.flag.render(elapsedTime, ctx);
        for (let car of this.cars) {
            car.render(elapsedTime, ctx)
        }
        this.player.render(elapsedTime, ctx);
        ctx.fillStyle = 'black';
        ctx.fillText(this.lives + ' Lives', 710, 40);
        ctx.fillText('Level '+this.level, 710, 20)
    }
}
