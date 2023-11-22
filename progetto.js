
//VISUAL ELEMENTS --------------------------------------------------------------------------------------------------------------------------------
let padLightTime = 150;
const defaultString = "MiniLab";

let infoDisplay = document.querySelector('#display');


//Knobs
const knobs = document.querySelectorAll('.knob');

knobs.forEach((knob) => {
    const knob_Id = knob.getAttribute('id');
    const knob_Idx = knob.getAttribute('idx');

    let isDragging = false;
    knob.style.transform = `rotate(${0 * 2.7 - 135}deg)`;
    knob.addEventListener('mousedown', (e) => { // 'e' is the event object
        isDragging = true;
        initialValue = knobs_level[knob_Idx] - e.clientY; //e.clientY è la posizione sull'asse y del mouse
    });

    knob.addEventListener('mousemove', (e) => {
        if (isDragging) {
            knobs_level[knob_Idx] = Math.min(100, Math.max(0, initialValue + e.clientY)) / 100;
            rotateKnob(knob, knobs_level[knob_Idx] * 100);
        }
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });
});
function rotateKnob(knob, rotation) {
    knob.style.transform = `rotate(${rotation * 2.7 - 135}deg)`;
}


//function that activates and deactivates the single pad.
function activeLed(id) {
    let led = document.querySelector(id);
    led.children[0].classList.add('activeDot');
    led.children[0].classList.toggle('dot');
}
function activeKey(id) {
    let key = document.querySelector(id);
    if (key.classList.value == "key") {
        key.classList.add('key_active');
        key.classList.toggle('key')
    }
    else if (key.classList.value == "key_active") {
        key.classList.add('key');
        key.classList.toggle('key_active')
    }
    else if (key.classList.value == "blacKey") {
        key.classList.add('blacKey_active');
        key.classList.toggle('blacKey');
    }
    else {
        key.classList.add('blacKey');
        key.classList.toggle('blacKey_active');
    }
}

function activePad(id) {
    let padRow = document.getElementById('padrow');
    pad = padRow.children[id];
    if (pad.classList.value == "pad") {
        pad.classList.add('activePad');
        pad.classList.toggle('pad');
    }
    else if (pad.classList.value == "activePad") {
        pad.classList.add('pad');
        pad.classList.toggle('activePad');
    }
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
var pads = [0, 0, 0, 0, 0, 0, 0, 0];
var knobs_level = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


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

// Keep track of the sustain pedal state
let isSustainPedalDown = false;

// Initialize Web MIDI API
navigator.requestMIDIAccess().then((midiAccess) => {
    const deviceName = "Arturia MiniLab mkII"; // Replace with your MIDI device name

    midiAccess.inputs.forEach((input) => {
        if (input.name === deviceName) {
            input.onmidimessage = (event) => {
                const statusByte = event.data[0] & 0xf0; // Extract the top 4 bits

                if (statusByte === 0xB0) {
                    const controllerNumber = event.data[1];
                    const value = event.data[2];
                    // Control Change message (knob or slider)
                    if (controllerNumber === 64) {
                        // Sustain pedal event
                        console.log(value);
                        if (value > 0) {
                            isSustainPedalDown = true;
                        } else {
                            isSustainPedalDown = false;
                            handleSustain();
                        }
                    }
                    else {
                        // Handle MIDI control change events (knob rotations)
                        handleMIDIControlChangeEvent(controllerNumber, value);
                    }
                } else if (statusByte === 0x90 || statusByte === 0x80) {
                    // Note On or Note Off message
                    const noteNumber = event.data[1];
                    const velocity = event.data[2];
                    // Handle other MIDI note events
                    if (noteNumber > 7) {
                        // Handle MIDI note events for keys
                        if (statusByte === 0x90 && velocity > 0) {
                            handleMIDINoteOn(noteNumber);
                        } else if ((statusByte === 0x80 || (statusByte === 0x90 && velocity === 0))) {
                            handleMIDINoteOff(noteNumber);
                        }
                    } else {
                        // Handle MIDI note events for pads
                        if (statusByte === 0x90 && velocity > 0) {
                            handleMIDIPadOn(noteNumber);
                        } else if ((statusByte === 0x80 || (statusByte === 0x90 && velocity === 0))) {
                            handleMIDIPadOff(noteNumber);
                        }
                    }
                }
            };
        }
    });
}).catch((error) => {
    console.error('Error accessing MIDI:', error);
});


// Keep track of sustained notes when the sustain pedal is down
const sustainedNotes = {};

function handleSustain(note) {
    if (note) {
        sustainedNotes[note] = pressedKeys[note]; // Add the note to the list of sustained notes
        delete pressedKeys[note];
    }
    else {
        Object.keys(sustainedNotes).forEach((key) => {
            if (!pressedKeys[key]) {
                stopNote(sustainedNotes[key]);
                delete sustainedNotes[key];
            }

        });
    }
}

notecorrection = 0;
noteDivisor = 24;
noteshift = 1;
function handleMIDINoteOn(note) {
    // Handle MIDI Note On event
    if (!pressedKeys[note]) {
        pressedKeys[note] = playNote(note);
        document.getElementById("display").innerHTML += '<br>' + getNoteByIndex(Math.abs(note - 12) % 12 + 1);
        activeLed('#key' + String(Math.abs(note - notecorrection) % noteDivisor + noteshift));
        activeKey('#key' + String(Math.abs(note - notecorrection) % noteDivisor + noteshift));
    }
}

function handleMIDINoteOff(note) {
    if (pressedKeys[note]) {
        document.getElementById('display').innerHTML = defaultString;
        console.log(Math.abs(note - notecorrection) % noteDivisor + noteshift);
        activeLed('#key' + String(Math.abs(note - notecorrection) % noteDivisor + noteshift));
        activeKey('#key' + String(Math.abs(note - notecorrection) % noteDivisor + noteshift));
        console.log(pressedKeys);
        console.log(sustainedNotes);
        // Handle MIDI Note Off event
        if (isSustainPedalDown && !sustainedNotes[note]) {
            handleSustain(note); // Check for sustain when a note is released
        }
        else {
            stopNote(pressedKeys[note]);
            delete pressedKeys[note];
        }
    }

}


function handleMIDIPadOn(note) {
    if (pads[note] == 0) {
        // Handle MIDI Note On event
        if (note == 0) {
            playKick();
            document.getElementById("display").innerHTML = document.getElementById("display").innerHTML + '<br>' + 'Kick';
        }
        else if (note == 1) {
            playSnare();
            document.getElementById("display").innerHTML = document.getElementById("display").innerHTML + '<br>' + 'Snare';
        }
        else if (note == 2) {
            playClosedHiHat()
            document.getElementById("display").innerHTML = document.getElementById("display").innerHTML + '<br>' + 'Closed Hit Hat';
        }
        else if (note == 3) {
            playCrashCymbal();
            document.getElementById("display").innerHTML = document.getElementById("display").innerHTML + '<br>' + 'Crash Cymbal';
        }
        pads[note] = 1;
        activePad(note);
    }
}

function handleMIDIControlChangeEvent(controllerNumber, value) {
    id = controllerNumber - 19;
    knobs_level[id] = value / 127;
    // Code to handle MIDI control change events (knob rotations)
    knob = document.getElementById('knob' + id);
    applyKnobsValues();
    rotateKnob(knob, value / 127 * 100);
}

function handleMIDIPadOff(note) {
    if (pads[note] == 1) {
        // Handle MIDI Note Off event
        if (note == 0) { document.getElementById("display").innerHTML = defaultString; }
        else if (note == 1) { document.getElementById("display").innerHTML = defaultString; }
        else if (note == 2) { document.getElementById("display").innerHTML = defaultString; }
        else if (note == 3) { document.getElementById("display").innerHTML = defaultString; }
        pads[note] = 0;
        activePad(note);
    }

}


keys.forEach((key) => {
    const note = Number(key.getAttribute('dataNote'));

    key.addEventListener('mousedown', () => {
        if (!pressedKeys[47 + note]) {
            handleMIDINoteOn(47 + note);
        }
    });

    key.addEventListener('mouseup', () => {
        if (pressedKeys[47 + note]) {
            handleMIDINoteOff(47 + note);
        }
    });

    key.addEventListener('mouseleave', () => {
        if (pressedKeys[47 + note]) {
            handleMIDINoteOff(47 + note);
        }
    });
});

const blacKeys = document.querySelectorAll('.blacKey');
blacKeys.forEach((key) => {
    const note = Number(key.getAttribute('dataNote'));

    key.addEventListener('mousedown', () => {
        if (!pressedKeys[47 + note]) {
            handleMIDINoteOn(47 + note);
        }
    });

    key.addEventListener('mouseup', () => {
        if (pressedKeys[47 + note]) {
            handleMIDINoteOff(47 + note);
        }
    });

    key.addEventListener('mouseleave', () => {
        if (pressedKeys[47 + note]) {
            handleMIDINoteOff(47 + note);
        }
    });
});

let KickPad = document.getElementById('pad1');
KickPad.addEventListener('mousedown', () => {
    handleMIDIPadOn(0)
})
KickPad.addEventListener('mouseup', () => {
    handleMIDIPadOff(0)
})
KickPad.addEventListener('mouseleave', () => {
    handleMIDIPadOff(0)
})

let snarePad = document.getElementById('pad2');
snarePad.addEventListener('mousedown', () => {
    handleMIDIPadOn(1)
})
snarePad.addEventListener('mouseup', () => {
    handleMIDIPadOff(1)
})
snarePad.addEventListener('mouseleave', () => {
    handleMIDIPadOff(1)
})

let closedHitPad = document.getElementById('pad3');
closedHitPad.addEventListener('mousedown', () => {
    handleMIDIPadOn(2)
})
closedHitPad.addEventListener('mouseup', () => {
    handleMIDIPadOff(2)
})
closedHitPad.addEventListener('mouseleave', () => {
    handleMIDIPadOff(2)
})

let crashPad = document.getElementById('pad4');
crashPad.addEventListener('mousedown', () => {
    handleMIDIPadOn(3)
})
crashPad.addEventListener('mouseup', () => {
    handleMIDIPadOff(3)
})
crashPad.addEventListener('mouseleave', () => {
    handleMIDIPadOff(3)
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
        if (note && !pressedKeys[47 + note]) {
            handleMIDINoteOn(47 + note);
        }
    }
})

document.addEventListener('keyup', (e) => {
    note = getPressedNote(e.key);
    if (note) {
        handleMIDINoteOff(47 + note);
    }
})


// AUDIO CHAIN SETUP --------------------------------------------------------------------------------------------------------------------------------

const c = new AudioContext();
const compressor = c.createDynamicsCompressor();
const mainGain = c.createGain();
let attackNote = 0.06;
let releaseNote = 0.10;

//analyser_node:
const analyser = c.createAnalyser();
// Set up the AnalyserNode properties
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength); //array that will contains the element of the buffer
function getAmplitude() { // Function to get the current amplitude
    analyser.getByteTimeDomainData(dataArray);
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
        sum += Math.abs(dataArray[i] - 128) / 128; // Normalize the single value between 1 and -1
    }
    const amplitude = sum / bufferLength; //normalize the total amplitude in order to get a value between 1 and -1.
    return amplitude;
}
// Connect the custom analyser node to the audio output
compressor.connect(mainGain);
mainGain.connect(analyser);
analyser.connect(c.destination);

function applyKnobsValues() {
    mainGain.gain.value = knobs_level[0];
}
applyKnobsValues();

// PLAYFUNCTIONS -----------------------------------------------------------------------------------------------------------------------------------------------------

function playNote(note) {
    var o = c.createOscillator();
    o.type = "sawtooth";
    var g = c.createGain();
    o.frequency.value = 261.63 * Math.pow(2, (note - 57) / 12);
    o.connect(g);
    g.connect(compressor);

    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(knobs_level[1], c.currentTime + attackNote);

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
    g.gain.value = knobs_level[9];

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
    noiseGain.gain.setValueAtTime(knobs_level[9], c.currentTime);
    noiseGain.gain.linearRampToValueAtTime(0, c.currentTime + bufferSize / c.sampleRate);

    // Create white noise for the snare
    for (let i = 0; i < bufferSize; i++) {
        bufferData[i] = (Math.random() * 2 - 1); // Generate random noise
    }

    const toneOscillator = c.createOscillator();
    toneOscillator.type = 'sine';
    toneOscillator.frequency.value = 40; // Adjust this value for the desired pitch

    const toneGain = c.createGain();
    toneGain.gain.setValueAtTime(knobs_level[9] / 5, c.currentTime);
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
    noiseGain.gain.setValueAtTime(knobs_level[9], c.currentTime);
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
    noiseGain.gain.setValueAtTime(knobs_level[9] * 0.5, c.currentTime);
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
















document.addEventListener('DOMContentLoaded', function () {
    mainFrame.addEventListener('contextmenu', function (event) {
        // Prevent the default context menu
        event.preventDefault();
    })
    // Get references to the clickable objects and the context menus
    const display = document.getElementById('display');
    const knobs = document.querySelectorAll('.knob');
    const displayMenu = document.getElementById('displayMenu');
    const knobMenu = document.getElementById('knobMenu');

    // Add a contextmenu event listener to the display (right-click)
    display.addEventListener('contextmenu', function (event) {
        handleContextMenu(event, displayMenu);
    });

    // Add a contextmenu event listener to each knob
    knobs.forEach((knob) => {
        knob.addEventListener('contextmenu', function (event) {
            handleContextMenu(event, knobMenu);
        });
    });

    // Get references to the selection menu components
    const presetOptions = document.getElementById('presetOptions');
    const pedalOptions = document.getElementById('pedalOptions');
    const presetSelect = document.getElementById('presetSelect');
    const pedalSelect = document.getElementById('pedalSelect');

    // Add a click event listener to the preset select button
    presetSelect.addEventListener('click', function () {
        const selectedOption = presetOptions.value;

        alert('Selected option: ' + selectedOption);

        displayMenu.classList.add('hidden');
    });

    // Add a click event listener to the pedal select button
    pedalSelect.addEventListener('click', function () {
        const selectedOption = pedalOptions.value;

        alert('Selected option: ' + selectedOption);

        knobMenu.classList.add('hidden');
    });

    // Add a click event listener to the document to hide the context menu on a click outside the menu
    document.addEventListener('click', function (e) {
        if (!displayMenu.contains(e.target) && !knobMenu.contains(e.target)) {
            displayMenu.classList.add('hidden');
            knobMenu.classList.add('hidden');
        }
    });

    function handleContextMenu(event, menu) {

        menu.style.position = 'absolute';
        menu.style.left = event.clientX + 'px';
        menu.style.top = event.clientY + 'px';

        menu.classList.remove('hidden');
    }
});