"use strict";

import {Game} from "./game.js";
import {Player} from "./player.js";

var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var player = new Player({x: 0, y: 240})

var masterLoop = function(timestamp) {
    game.loop(timestamp);
    window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());

function update(elapsedTime) {
    player.update(elapsedTime);
    // TODO: Update the game objects
}

function render(elapsedTime, ctx) {
    ctx.fillStyle = "lightblue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.render(elapsedTime, ctx);
}
