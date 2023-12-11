// view.js
class View {
    constructor(audioModel) {
        this.audioModel = audioModel;
        this.canvas = document.getElementById('signalCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.frequency = 0.02;
        this.phase = 0;
        this.audioVisColor = 'hsl(' + 0 + ',' + 0 + '%, ' + 0 + '%)';
        this.colorBackgound = 'hsl(' + 0 + ',' + 0 + '%, ' + 0 + '%)';
        this.color = 'hsl(' + 100 + ',' + 100 + '%, ' + 100 + '%)';
        this.centerX = this.canvas.width / 2;
        this.amplitudeHistory = [];
        this.maxHistoryLength = 120;
        console.log('View ok.');
    }
    //lights-----------------------------------------------------------
    flipLed(led) {
        if (led.classList.value === 'dot') {
            led.classList.add('activeDot');
            led.classList.toggle('dot');
        } else if (led.classList.value === 'activeDot') {
            led.classList.add('dot');
            led.classList.toggle('activeDot');
        }
    }


    flipKey(keyElement, keyType) {
        if (keyElement.classList.value === keyType) {
            keyElement.classList.add(`${keyType}_active`);
            keyElement.classList.toggle(keyType);
        } else if (keyElement.classList.value === `${keyType}_active`) {
            keyElement.classList.add(keyType);
            keyElement.classList.toggle(`${keyType}_active`);
        } else {
            // Handle other cases if needed
        }
    }

    flipPad(padElement) {
        if (padElement.classList.value === 'pad') {
            padElement.classList.remove('pad');
            padElement.classList.add('activePad');
        } else if (padElement.classList.value === 'activePad') {
            padElement.classList.remove('activePad');
            padElement.classList.add('pad');
        }
    }

    //Knobs-----------------------------------------------------------
    rotateKnob(knob, rotation) {
        knob.children[0].style.transform = `rotate(${rotation * 2.7 - 135}deg)`;
        knob.children[1].innerHTML = rotation.toFixed(0);
    }
    updateDisplayVolumeIndicator(VolumeIndicator, value) {
        VolumeIndicator.innerHTML = value.toFixed(0);
    }

    // Visualizer-----------------------------------------------------------
    drawAmplitudePlot(knobElements, displayPads, display, keyOptions, bassOptions, arpOptions, keyVolumeIndicator, bassVolumeIndicator,arpVolumeIndicator, buttons, leds) {
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.ctx.clearRect(0, 0, width, height);

        //ExternLine
        this.ctx.beginPath();

        const sum = this.amplitudeHistory.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        const sum2 = this.amplitudeHistory.slice(70, 100).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        // Calculate the average
        const average = (sum / this.amplitudeHistory.length);
        const realTimeAverage = (sum2);

        this.ctx.strokeStyle = 'rgb(128, 128, 128)';
        this.ctx.lineWidth = 15;
        if (this.amplitudeHistory.length === this.maxHistoryLength) { this.amplitudeHistory.shift(); }
        this.amplitudeHistory.push((this.audioModel.getAmplitude()));
        const historyLength = this.amplitudeHistory.length;

        if (historyLength > 1) {
            const xStep = width / historyLength;

            for (let i = 0; i < historyLength; i++) {
                const x = i * xStep;
                const y = height / 2 - this.amplitudeHistory[i] * 280 * Math.pow(-1, i);
                this.ctx.lineTo(x, y);
            }

            this.ctx.stroke();
        }

        //BorderLine
        this.ctx.beginPath();

        this.ctx.strokeStyle = 'rgb(128, 128, 128)';
        this.ctx.lineWidth = 10;
        if (this.amplitudeHistory.length === this.maxHistoryLength) { this.amplitudeHistory.shift(); }
        this.amplitudeHistory.push((this.audioModel.getAmplitude()));

        if (historyLength > 1) {
            const xStep = width / historyLength;

            for (let i = 0; i < historyLength; i++) {
                const x = i * xStep;
                const y = height / 2 - this.amplitudeHistory[i] * 80 * Math.pow(-1, i);
                this.ctx.lineTo(x, y);
            }

            this.ctx.stroke();
        }

        //InternLine
        this.ctx.beginPath();
        const hue = 55000 - 1000 * average;
        const perc1 = Math.min(100, Math.pow(45, realTimeAverage));
        const perc2 = Math.min(50, Math.pow(45, realTimeAverage));
        const perc2Display = Math.min(10, Math.pow(45, realTimeAverage));
        const perc2Pad = 100 - 1.5 * Math.min(10, Math.pow(2, realTimeAverage));
        this.audioVisColor = 'hsl(' + hue + ',' + perc1 + '%, ' + perc2 + '%)';
        this.colorBackgound = 'hsl(' + hue + ',' + perc1 + '%, ' + perc2Display + '%)';
        this.color = 'hsl(' + hue + ',' + perc1 + '%, ' + perc2Pad + '%)';
        this.interfaceColorGradient(knobElements, displayPads, display, keyOptions, bassOptions,arpOptions, keyVolumeIndicator, bassVolumeIndicator,arpVolumeIndicator, buttons, leds);
        this.ctx.strokeStyle = this.audioVisColor;
        this.ctx.lineWidth = 10;
        if (this.amplitudeHistory.length === this.maxHistoryLength) { this.amplitudeHistory.shift(); }
        this.amplitudeHistory.push((this.audioModel.getAmplitude()));

        if (historyLength > 1) {
            const xStep = width / historyLength;

            for (let i = 0; i < historyLength; i++) {
                const x = i * xStep;
                const y = height / 2 - this.amplitudeHistory[i] * 30 * Math.pow(-1, i);
                this.ctx.lineTo(x, y);
            }

            this.ctx.stroke();
        }
    }

    animateAmplitudePlot(knobElements, displayPads, display, keyOptions, bassOptions,arpOptions, keyVolumeIndicator, bassVolumeIndicator, arpVolumeIndicator, buttons, leds) {
        this.drawAmplitudePlot(Array.from(knobElements), displayPads, display, keyOptions, bassOptions,arpOptions, keyVolumeIndicator, bassVolumeIndicator,arpVolumeIndicator, buttons, leds);
        requestAnimationFrame(() => this.animateAmplitudePlot(knobElements, displayPads, display, keyOptions, bassOptions,arpOptions, keyVolumeIndicator, bassVolumeIndicator,arpVolumeIndicator, buttons, leds));
    }


    interfaceColorGradient(knobElements, pads, display, keyOptions, bassOptions,arpOptions, keyVolumeIndicator, bassVolumeIndicator, arpVolumeIndicator, buttons, leds) {
        document.body.style.backgroundColor = this.colorBackgound;
        knobElements.forEach(knob => {
            knob.children[0].style.backgroundColor = this.color;
            knob.children[1].style.color = this.color;
        });
        pads.forEach(pad => {
            if (pad.classList.contains('pad') && !pad.classList.contains('activePad')) {
                pad.style.backgroundColor = this.color;
            }
            else {
                pad.style.backgroundColor = 'black';
            }
        });
        buttons.forEach(button => {
            if (button.classList.contains('mono') && !button.classList.contains('monoActive')) {
                button.style.backgroundColor = this.color;
                button.style.color = 'black';
            }
            else {
                button.style.backgroundColor = 'black';
                button.style.color = this.color;
            }
        });
        leds.forEach(led => {
            if (led.classList.contains('activeDot') && !led.classList.contains('dot')) {
                led.style.backgroundColor = this.color;
            }
            else {
                led.style.backgroundColor = 'transparent';
            }
        });
        
        bassVolumeIndicator.style.backgroundColor=this.color;
        keyVolumeIndicator.style.backgroundColor=this.color;
        arpVolumeIndicator.style.backgroundColor=this.color;
        keyOptions.style.backgroundColor=this.color;
        bassOptions.style.backgroundColor=this.color;
        arpOptions.style.backgroundColor=this.color;
        display.style.backgroundColor = this.color;

    }


    //display-----------------------------------------------------------
    updateDisplayOctave(octave, displayObj) {
        displayObj.innerHTML = octave;
    }

    renderActiveIndicator(indicator, boolean) {
        if (boolean && indicator.classList.value === 'turnOn') {
            indicator.classList.add('turnOnActive');
            indicator.classList.toggle('turnOn');
        }
        else if (!boolean && indicator.classList.value === 'turnOnActive') {
            indicator.classList.add('turnOn');
            indicator.classList.toggle('turnOnActive');
        }
    }

    showOscillatorType(cell, text) {
        cell.textContent = text.toUpperCase();
    }

    flipButton(button, boolean) {
        if (boolean && button.classList.value === 'mono') {
            button.classList.add('monoActive');
            button.classList.toggle('mono');
        }
        else if (!boolean && button.classList.value === 'monoActive') {
            button.classList.add('mono');
            button.classList.toggle('monoActive');
        }
    }
    updateSplitDot(dot, boolean) {
        if (boolean && dot.classList.value === 'splitDot') {
            dot.classList.add('splitDotActive');
            dot.classList.toggle('splitDot');
        }
        else if (!boolean && dot.classList.value === 'splitDotActive') {
            dot.classList.add('splitDot');
            dot.classList.toggle('splitDotActive');
        }
    }
}
