"use strict";

import {Game} from "./game.js";
import {Player} from "./player.js";
import {Car} from "./car.js";
import {Button} from "./button.js";
import {Flag} from "./flag.js";

var canvas = document.getElementById('screen');
var game = new Game(canvas);


var masterLoop = function(timestamp) {
    game.loop(timestamp);
    window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());
