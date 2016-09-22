"use strict";

import {Game} from "./game.js";
import {Player} from "./player.js";
import {Car} from "./car.js";
import {Button} from "./button.js";
import {Flag} from "./flag.js";

var canvas = document.getElementById('screen');
let backdrop = new Image();
backdrop.src = encodeURI('assets/canvas.png');
var game = new Game(canvas, update, render);
var player = new Player({x: 0, y: 256}, game);
game.player = player;
var button = new Button(game);
game.button = button;
var flag = new Flag(game);
game.flag = flag;
let cars = [button, flag];
for (let i=1; i<11; i++) {
    cars.push(new Car(game, {heading: (Math.floor((i+1)/2)%2===0?-1:1), x: 64*i, y: -1112}));
}

var masterLoop = function(timestamp) {
    game.loop(timestamp);
    window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());

function update(elapsedTime) {
    player.update(elapsedTime);
    button.update(elapsedTime);
    flag.update(elapsedTime);
    let hitBox = player.getHitBoxes()[0];
    for (let car of cars) {
        car.update(elapsedTime);
        if (
            ((hitBox.x >= car.x && hitBox.x <= car.x + car.width -1) || (hitBox.x + hitBox.width -1 >= car.x && hitBox.x + hitBox.width -1 <= car.x + car.width -1)) &&
            ((hitBox.y >= car.y && hitBox.y <= car.y + car.height -1) || (hitBox.y + hitBox.height -1 >= car.y && hitBox.y + hitBox.height -1 <= car.y + car.height -1))
        ) {
            player.events.emit('collision', car);
            car.events.emit('collision', player);
        }
    }
}

function render(elapsedTime, ctx) {
    ctx.drawImage(backdrop, 0, 0);
    button.render(elapsedTime, ctx);
    player.render(elapsedTime, ctx);
    flag.render(elapsedTime, ctx);
    for (let car of cars) {
        car.render(elapsedTime, ctx)
    }
}
