"use strict";

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
