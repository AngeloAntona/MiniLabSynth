# MiniLab 🎹

This is a project developed during the "Advanced Coding Tools And Methodologies" course in the Music Engineering program at the Polytechnic University of Milan. 

## Overview

My code implements a 'synthesizer' that allows playing rhythmically and harmonically rich songs even if you're a soloist. This goal is achieved through the use of various oscillators, an arpeggiator, and a set of percussion instruments. Sounds can be combined at will by the user, who can use standard presets or create their own and save them in the cloud (Firebase). More details are provided below.

![Legend](https://github.com/AngeloAntona/MiniLab/blob/master/ReadmeResources/Legend.png)

* **Main Display** &rarr; Allows you to select the active instruments. For each instrument, you can modify the following options:
    - the oscillator to be emitted by the instrument;
    - whether the instrument should play in mono or be polyphonic;
    - which MIDI commands the particular instrument should respond to (e.g., sustain, pitchWheel);
    - the octave at which the instrument should sound.
* **Keyboard Split** &rarr; Allows you to split the keyboard in half, setting one instrument to the left and one to the right. It's possible to select whether the arpeggiator should also be split directly from the Main Display.

* **Knobs Section** &rarr; The knobs make it easy to modify the parameters of the sounds emitted by the synth. Starting from the left and going through each column, the functions of the knobs are as follows:
    * General gains:
        - Instruments gain: allows you to manage the overall volume of the instrumental part.
        - Drum gain: allows you to manage the volume of the drum.
    * LPF: allows you to choose the cutoff frequency of the LPF.
    * HPF: allows you to choose the cutoff frequency of the HPF.
    * Instrument delay time: allows you to lengthen or shorten the time interval between one delay iteration and the next.
    * Instrument delay volume: allows you to vary the volume of delay iterations. This way, you can create a delay or a reverb.
    * Two free knobs: are left free for possible project updates.
    * Single instrument volume: allows you to modify the volume of the individual instrument, in order to equalize the overall sound better.
    * Arp Knobs:
        - Arp volume: allows you to set the volume of the individual arpeggiator.
        - Arp time: allows you to set the speed at which the arpeggio is executed.

    Each knob can be automated by mapping it to the control pedal. By right-clicking on any of the knobs, you can choose from the following options:
    - No mapping: the knob will not respond to the control pedal's movement.
    - Direct mapping: when the control pedal's value increases, the knob will increment the controlled parameter.
    - Inverse mapping: when the control pedal's value increases, the knob will decrease the controlled parameter.
* **Login** &rarr; allows you to access the login menu.

* **DB interaction** &rarr; is the section in which the user can:
    - ↓: use one of the previously saved plugins.
    - X: delete one of the previously saved plugins.
    - ↑: save a new plugin.

## Audio Chain

The audio chain is constructed as represented in the following diagram:

![AudioChain](https://github.com/AngeloAntona/MiniLab/blob/master/ReadmeResources/AudioChain_(AudioModel).png)ù

## Status
| Main objectives                           | State           |
| ----------------------------------------- |:---------------:|
| Keyboard and Pad Sounds                   | :green_circle:  |
| Mini amplitude display                    | :green_circle:  |
| Separate volumes for instruments          | :green_circle:  |
| MIDI keyboard input                       | :green_circle:  |
| Sustain and Control Pedal MIDI input      | :green_circle:  |
| Mappable control pedal                    | :green_circle:  |
| Mappable knobButtons presets              | :green_circle:  |
| Keyboard split                            | :green_circle:  |
| Sound presets                             | :green_circle:  |
| Write/read/delete presets on Firebase     | :green_circle:  |
| Playable remotely                         | :green_circle:  |

| Sound effects                             | State           |
| ----------------------------------------- |:---------------:|
| Frequency weel                            | :green_circle:  |
| Reverb                                    | :green_circle:  |
| Delay                                     | :green_circle:  |
| LPF                                       | :green_circle:  |
| HPF                                       | :green_circle:  |
| Arpeggiator                               | :green_circle:  |
| Different presets of sounds combinations  | :green_circle:  |

### Legend
- :green_circle: Implemented
- :yellow_circle: Implementing
- :red_circle: Not Implemented

### Site
https://angeloantona.github.io/MiniLab/



## Maintainer
| Name                                                  | Email                         |
| ----------------------------------------------------- |:-----------------------------:|
| [Angelo Antona](https://github.com/AngeloAntona)      | angelo.antona@mail.polimi.it  | 
