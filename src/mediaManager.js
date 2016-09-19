"use strict";

class Graphic {
    constructor(args) {
        const {x, y, w, h, url} = args;
        let img = new Image();
        img.src= encodeURI(url);
    }
}

class Media {
    constructor() {
        this.audioContext = new AudioContext();
    }

    fetchAudio() {

    }

    fetchImage(url) {
        let source = new Image();
        source.src = encodeURI(url);
    }

    fetch () {

    }
}
