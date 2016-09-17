"use strict";

import {Game} from "./game.js";
import {Player} from "./player.js";
import {Car} from "./car.js";

var canvas = document.getElementById('screen');
let backdrop = new Image();
backdrop.src = encodeURI('assets/canvas.png');
var game = new Game(canvas, update, render);
var player = new Player({x: 0, y: 256})
let cars = [];
for (let i=1; i<11; i++) {
    cars.push(new Car(canvas, {heading: (Math.floor((i+1)/2)%2===0?-1:1), x: 64*i, y: -1112}));
}

var masterLoop = function(timestamp) {
    game.loop(timestamp);
    window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());

function update(elapsedTime) {
    player.update(elapsedTime);
    for (let car of cars) {
        car.update(elapsedTime);
    }
    // TODO: Update the game objects
}

function render(elapsedTime, ctx) {
    ctx.fillStyle = "lightblue";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backdrop, 0, 0);
    player.render(elapsedTime, ctx);
    for (let car of cars) {
        car.render(elapsedTime, ctx)
    }
}
