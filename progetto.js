
//VISUAL ELEMENTS --------------------------------------------------------------------------------------------------------------------------------
let padLightTime = 150;
const defaultString = "MiniLab";

let infoDisplay = document.querySelector('#display');

//function that activates and deactivates the single pad.
function activeLed(id) {
    let led = document.querySelector(id);
    led.children[0].classList.add('activeDot');
    led.children[0].classList.toggle('dot');
}

//function that start the sequence of pad lights.
function turnOnLight(htmlPad) {
    htmlPad.classList.add('activePad');
    htmlPad.classList.toggle('pad');
    setTimeout(() => {
        htmlPad.classList.add('pad');
        htmlPad.classList.toggle('activePad');
    }, padLightTime);
}

let padSwitch = 0;
let interval;

function startLights(id) {
    let pad;
    if (padSwitch == 0) {
        padSwitch = 1;
        infoDisplay.innerHTML = 'Pad Lights turned on.'
        //first cicle of padLights
        for (i = 0; i < 8; i++) {
            let pad;
            //build the ID of the current pad as a String:
            indexOfCurrentPad = String(i + 1);
            idOfCurrentPad = id + indexOfCurrentPad;
            //get the pad Object and make it light:
            pad = document.querySelector(idOfCurrentPad);
            h = padLightTime * i;
            setTimeout(() => { turnOnLight(pad) }, h);
        }

        interval = setInterval(() => {
            for (i = 0; i < 8; i++) {
                let pad;
                //build the ID of the current pad as a String:
                indexOfCurrentPad = String(i + 1);
                idOfCurrentPad = id + indexOfCurrentPad;
                //get the pad Object and make it light:
                pad = document.querySelector(idOfCurrentPad);
                h = padLightTime * i;
                setTimeout(() => { turnOnLight(pad) }, h);
            }
        }, padLightTime * 8)
    }
    else {
        //if the lights are activated and we click on the display, the lights will be turned off.
        infoDisplay.innerHTML = 'Pad Lights turned off.'
        clearInterval(interval);
        padSwitch = 0;
    }
}


// MANAGE INPUT ---------------------------------------------------------------------------------------------------------------------------

const pressedKeys = {};// Object to keep track of pressed keys and their corresponding oscillators

function getNoteByIndex(index) {
    if (index == 1 || index == 1 + 12 || index == 1 + 24) return 'Do';
    if (index == 2 || index == 2 + 12) return 'Do#';
    if (index == 3 || index == 3 + 12) return 'Re';
    if (index == 4 || index == 4 + 12) return 'Re#';
    if (index == 5 || index == 5 + 12) return 'Mi';
    if (index == 6 || index == 6 + 12) return 'Fa';
    if (index == 7 || index == 7 + 12) return 'Fa#';
    if (index == 8 || index == 8 + 12) return 'Sol';
    if (index == 9 || index == 9 + 12) return 'Sol#';
    if (index == 10 || index == 10 + 12) return 'La';
    if (index == 11 || index == 11 + 12) return 'La#';
    if (index == 12 || index == 12 + 12) return 'Si';
}

// Add event listeners to each piano key
const keys = document.querySelectorAll('.key');
keys.forEach((key) => {
    const note = Number(key.getAttribute('dataNote'));

    key.addEventListener('mousedown', () => {
        if (!pressedKeys[note]) {
            pressedKeys[note] = playNote(note);
            document.getElementById("display").innerHTML = document.getElementById("display").innerHTML + '<br>' + getNoteByIndex(note);
            activeLed('#key' + String(note));
        }
    });

    key.addEventListener('mouseup', () => {
        if (pressedKeys[note]) {
            stopNote(pressedKeys[note]);
            delete pressedKeys[note];
            document.getElementById('display').innerHTML = defaultString;
            activeLed('#key' + String(note));
        }
    });

    key.addEventListener('mouseleave', () => {
        if (pressedKeys[note]) {
            stopNote(pressedKeys[note]);
            delete pressedKeys[note];
            document.getElementById('display').innerHTML = defaultString;
            activeLed('#key' + String(note));
        }
    });
});

const blacKeys = document.querySelectorAll('.blacKey');
blacKeys.forEach((key) => {
    const note = Number(key.getAttribute('dataNote'));

    key.addEventListener('mousedown', () => {
        if (!pressedKeys[note]) {
            pressedKeys[note] = playNote(note);
            document.getElementById("display").innerHTML = document.getElementById("display").innerHTML + '<br>' + getNoteByIndex(note);
            activeLed('#key' + String(note));
        }
    });

    key.addEventListener('mouseup', () => {
        if (pressedKeys[note]) {
            stopNote(pressedKeys[note]);
            delete pressedKeys[note];
            document.getElementById('display').innerHTML = defaultString;
            activeLed('#key' + String(note));
        }
    });

    key.addEventListener('mouseleave', () => {
        if (pressedKeys[note]) {
            stopNote(pressedKeys[note]);
            delete pressedKeys[note];
            document.getElementById('display').innerHTML = defaultString;
            activeLed('#key' + String(note));
        }
    });
});

let KickPad = document.getElementById('pad1');
KickPad.addEventListener('mousedown', () => {
    playKick();
    document.getElementById("display").innerHTML = document.getElementById("display").innerHTML + '<br>' + 'Kick';
    setTimeout(() => { document.getElementById("display").innerHTML = defaultString; }, 500);
})

let snarePad = document.getElementById('pad2');
snarePad.addEventListener('mousedown', () => {
    playSnare();
    document.getElementById("display").innerHTML = document.getElementById("display").innerHTML + '<br>' + 'Snare';
    setTimeout(() => { document.getElementById("display").innerHTML = defaultString; }, 500);
})

let closedHitPad = document.getElementById('pad3');
closedHitPad.addEventListener('mousedown', () => {
    playClosedHiHat();
    document.getElementById("display").innerHTML = document.getElementById("display").innerHTML + '<br>' + 'Closed Hit Hat';
    setTimeout(() => { document.getElementById("display").innerHTML = defaultStri1ng; }, 500);
})

let crashPad = document.getElementById('pad4');
crashPad.addEventListener('mousedown', () => {
    playCrashCymbal();
    document.getElementById("display").innerHTML = document.getElementById("display").innerHTML + '<br>' + 'Crash Cymbal';
    setTimeout(() => { document.getElementById("display").innerHTML = defaultString; }, 500);
})


// Define a key-to-note mapping object
const keyToNote = {
    'z': 1, 's': 2, 'x': 3, 'd': 4, 'c': 5, 'v': 6, 'g': 7, 'b': 8, 'h': 9, 'n': 10, 'j': 11, 'm': 12, ',': 13
};

function getPressedNote(key) {
    return keyToNote[key] || 0; // Return 0 if the key is not in the mapping
}

document.addEventListener('keydown', (e) => {
    if (e.key == '1') playKick();
    else if (e.key == '2') playSnare();
    else if (e.key == '3') playClosedHiHat();
    else if (e.key == '4') playCrashCymbal();
    else {
        note = getPressedNote(e.key);
        if (note && !pressedKeys[note]) pressedKeys[note] = playNote(note);
    }
})


document.addEventListener('keyup', (e) => {
    note = getPressedNote(e.key);
    if (note) {
        stopNote(pressedKeys[note]);
        delete pressedKeys[note];
    }
})




// AUDIO CHAIN SETUP --------------------------------------------------------------------------------------------------------------------------------

const c = new AudioContext();
const compressor = c.createDynamicsCompressor();
let attackNote = 0.06;
let releaseNote = 0.10;
let gainVal = 0;

//analyser_node:
const analyser = c.createAnalyser();
// Set up the AnalyserNode properties
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
function getAmplitude() { // Function to get the current amplitude
    analyser.getByteTimeDomainData(dataArray);
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
        sum += Math.abs(dataArray[i] - 128) / 128; // Normalize the value
    }
    const amplitude = sum / bufferLength;
    return amplitude;
}
// Connect the custom analyser node to the audio output
compressor.connect(analyser);
analyser.connect(c.destination);
let octave = 1 / 2;


// PLAYFUNCTIONS -----------------------------------------------------------------------------------------------------------------------------------------------------

function playNote(note) {
    var o = c.createOscillator();
    o.type = "sawtooth";
    var g = c.createGain();

    o.frequency.value = 261.63 * octave * Math.pow(2, note / 12);
    o.connect(g);
    g.connect(compressor);

    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(gainVal * 0.7, c.currentTime + attackNote);

    o.start();

    return { o, g };
}

function stopNote(note) {
    const releaseTime = c.currentTime + releaseNote;
    const fadeOutDuration = 0.01; // Adjust this duration as needed

    note.g.gain.cancelScheduledValues(c.currentTime); // Cancel any previous automation
    note.g.gain.setValueAtTime(note.g.gain.value, releaseTime); // Set the current value as the starting point
    note.g.gain.linearRampToValueAtTime(0, releaseTime + fadeOutDuration);

    setTimeout(() => {
        note.o.stop();
        note.o.disconnect();
    }, (releaseNote + fadeOutDuration) * 1000); // Convert seconds to milliseconds
}


function playKick() {
    const duration = 2; // Duration of the kick sound in seconds
    const attackDuration = 0.01; // Attack duration in seconds
    const releaseDuration = 4; // Release duration in seconds

    let buffer = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
    let bufferData = buffer.getChannelData(0);
    let initialFrequency = 30;
    let initialAmplitude = 10;

    for (let i = 0; i < bufferData.length; i++) {
        let amplitude = Math.exp(-i * (initialAmplitude / c.sampleRate));
        let frequency = 100 * Math.exp(-i * (initialFrequency / c.sampleRate));
        bufferData[i] = (amplitude * Math.cos(2 * Math.PI * frequency * i / c.sampleRate));
    }

    const source = c.createBufferSource();
    source.buffer = buffer;

    g = c.createGain();
    g.gain.value = gainVal;

    source.connect(g);
    g.connect(compressor);
    source.start(0);

    // Schedule the stop of the source node after the duration
    source.stop(c.currentTime + duration);
}




function playSnare() {
    const bufferSize = c.sampleRate * 0.1;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const bufferData = buffer.getChannelData(0);

    const noiseGain = c.createGain();
    noiseGain.gain.setValueAtTime(gainVal, c.currentTime);
    noiseGain.gain.linearRampToValueAtTime(0, c.currentTime + bufferSize / c.sampleRate);

    // Create white noise for the snare
    for (let i = 0; i < bufferSize; i++) {
        bufferData[i] = (Math.random() * 2 - 1); // Generate random noise
    }

    const toneOscillator = c.createOscillator();
    toneOscillator.type = 'sine';
    toneOscillator.frequency.value = 40; // Adjust this value for the desired pitch

    const toneGain = c.createGain();
    toneGain.gain.setValueAtTime(gainVal / 5, c.currentTime);
    toneGain.gain.linearRampToValueAtTime(0, c.currentTime + 0.02); // Adjust the duration of the tone burst

    // Connect the components
    noiseGain.connect(toneGain.gain);
    toneOscillator.connect(toneGain);
    toneGain.connect(compressor);

    // Start the noise and the tone simultaneously
    noiseGain.connect(compressor);
    toneOscillator.start();
    toneOscillator.stop(c.currentTime + 0.02); // Adjust the duration of the tone burst

    const source = c.createBufferSource();
    source.buffer = buffer;
    source.connect(noiseGain);
    source.start(0);
}


function playClosedHiHat() {
    const bufferSize = c.sampleRate * 0.03;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const bufferData = buffer.getChannelData(0);

    const noiseGain = c.createGain();
    noiseGain.gain.setValueAtTime(gainVal, c.currentTime);
    noiseGain.gain.linearRampToValueAtTime(0, c.currentTime + bufferSize / c.sampleRate);

    // Create white noise for the closed hi-hat
    for (let i = 0; i < bufferSize; i++) {
        bufferData[i] = (Math.random() * 2 - 1); // Generate random noise
    }

    // Create a band-pass filter
    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 3000; // Adjust this value for the desired pitch
    filter.Q.value = 1; // Adjust this value for the filter resonance

    // Connect the components
    noiseGain.connect(filter);
    filter.connect(compressor);

    const source = c.createBufferSource();
    source.buffer = buffer;
    source.connect(noiseGain);
    source.start(0);
}





function playCrashCymbal() {
    const bufferSize = c.sampleRate * 1.; // Adjust this value for the desired duration
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const bufferData = buffer.getChannelData(0);

    const noiseGain = c.createGain();
    noiseGain.gain.setValueAtTime(gainVal * 0.5, c.currentTime);
    noiseGain.gain.linearRampToValueAtTime(0, c.currentTime + bufferSize / c.sampleRate);

    // Create white noise for the crash cymbal
    for (let i = 0; i < bufferSize; i++) {
        bufferData[i] = (Math.random() * 2 - 1); // Generate random noise
    }

    // Create a low-pass filter to shape the cymbal sound
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(9900, c.currentTime); // Adjust this value for the desired tone
    filter.Q.setValueAtTime(1, c.currentTime);

    // Connect the components
    noiseGain.connect(filter);
    filter.connect(compressor);

    const source = c.createBufferSource();
    source.buffer = buffer;
    source.connect(noiseGain);
    source.start(0);
}

//KNOBS ---------------------------------------------------------------------------------------------------------------------------------------------------
const knobs = document.querySelectorAll('.knob');

knobs.forEach((knob) => {
    let isDragging = false;
    let initialValue = 0;
    let currentValue = 0;

    knob.addEventListener('mousedown', (e) => { // 'e' is the event object
        knob_Id = knob.getAttribute('id');
        isDragging = true;
        initialValue = (currentValue || 0) - e.clientY; //e.clientY è la posizione sull'asse y del mouse
    });

    window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const newValue = Math.min(100, Math.max(0, initialValue + e.clientY));
            currentValue = newValue;
            knob.style.transform = `rotate(${newValue * 2.7 - 135}deg)`;

            if (knob_Id == 'megaKnob') { //Volume Knob
                // Calculate the new gain based on the knob position
                const minFrequency = 0; // Minimum gain
                const maxFrequency = 1; // Maximum gain
                gainVal = minFrequency + (maxFrequency - minFrequency) * (newValue / 100);
            }

        }
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });
});
// SINUSOID ------------------------------------------------------------------------------------------------------------------------------------------------
const canvas = document.getElementById('signalCanvas');
const ctx = canvas.getContext('2d');
const frequency = 0.02;
let phase = 0;
const centerX = canvas.width / 2;

function drawSinusoidalSignal() {
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    ctx.strokeStyle = 'k';
    ctx.lineWidth = 10;

    for (let x = 0; x < width; x++) {
        const currentAmplitude = getAmplitude();
        const y = height / 2 + Math.sin(frequency * x + phase) * 200 * currentAmplitude;
        ctx.lineTo(x, y);
    }

    ctx.stroke();
}

function animate() {
    phase += 0.1; // Adjust the animation speed
    drawSinusoidalSignal();
    requestAnimationFrame(animate);
}

animate();