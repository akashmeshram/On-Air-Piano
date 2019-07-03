const nKeys = 8;
let camera;
let pixelValues = [8];
let oldValue = [8];
let isPressed = [8];

var noteList = [
"C3", "D3", "E3", "F4", "G4", "A4", "B4", "C4"];

function setup() {
    let ctx = createCanvas(800, 500);

    let reverb = new Tone.JCReverb(0.9).connect(Tone.Master);
    let delay = new Tone.FeedbackDelay(0.6); 
    polySynth = new Tone.PolySynth(6, Tone.Synth);
    let vol = new Tone.Volume(-28);
    polySynth.chain(vol, reverb).chain(vol, delay).chain(vol, Tone.Master);

    camera = createCapture(VIDEO);
    camera.size(800, 500);
    liveScreen = createImage(800, 250);

    for (let i = 0; i < 8; i++) {
        oldValue.push(0);
        isPressed.push(false);
    }
}


function draw() {
    background(30, 20, 90);
    capturePress();
    createTiles();
    createSound();
    push();
    translate(0, 0);
    image(liveScreenUpdate(camera), 0, 250, width, height);
    pop(); 
}

function createTiles() {
    push();
    let xPos;        
    stroke(255);
    strokeWeight(width / nKeys * 0.7);
    for (var i = 0; i < nKeys; i++) {
        xPos = (i + 0.5) * width / nKeys ;
        (isPressed[i]) ? stroke(255):  stroke(100, 100, 100);
        line(xPos, 0, xPos, height - 250);
    }    
    stroke(0);
    for (var i = 0; i < nKeys - 1; i++) {
        xPos = (i + 1) * width / nKeys ;
        line(xPos, 0, xPos, (height - 250)/2);
    }   
    pop();
}

function liveScreenUpdate(dev) {
    dev.loadPixels();
    liveScreen.loadPixels();

    for (let y = 0; y < dev.height; y++) {
        for (let x = 0; x < dev.width; x++) {
            if (y > 250) {
                let i = y * dev.width + (dev.width - 1 - x);
                let _c = [dev.pixels[i * 4 + 0], dev.pixels[i * 4 + 1], dev.pixels[i * 4 + 2], 255];
                liveScreen.set(x, y - 250, _c);
            }
        }
    }
    liveScreen.updatePixels();

    return liveScreen;
}

function capturePress() {
    for (let i = 0; i < nKeys; i++) {
        let _index = (251- (i + 0.5) / nKeys) * camera.width; 
        pixelValues[i] = [camera.pixels[_index * 4 + 0], camera.pixels[_index * 4 + 1], camera.pixels[_index * 4 + 2], 255];
    }
}

function createSound() {
    for (let i = 0; i < 8; i++) {
        let _valueSum = (pixelValues[i][0] + pixelValues[i][1] + pixelValues[i][2]) / 3.0;
        let _diffValue = abs(_valueSum - oldValue[i]);

        if (_diffValue > 40) {
            isPressed[i] = !isPressed[i];
            oldValue[i] = _valueSum;
            polySynth.triggerAttackRelease(noteList[i], "16t");
        }
    }
}
