# MiniLab 🎹

This is a project developed during the "Advanced Coding Tools And Methodologies" course in the Music Engineering program at the Polytechnic University of Milan. 

https://angeloantona.github.io/MiniLab/

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
    * *General gains*:
        - *Instruments gain*: allows you to manage the overall volume of the instrumental part.
        - *Drum gain*: allows you to manage the volume of the drum.
    * *LPF*: allows you to choose the cutoff frequency of the LPF.
    * *HPF*: allows you to choose the cutoff frequency of the HPF.
    * *Instrument delay time*: allows you to lengthen or shorten the time interval between one delay iteration and the next.
    * *Instrument delay volume*: allows you to vary the volume of delay iterations. This way, you can create a delay or a reverb.
    * *Two free knobs*: are left free for possible project updates.
    * *Single instrument volume*: allows you to modify the volume of the individual instrument, in order to equalize the overall sound better.
    * *Arp Knobs*:
        - *Arp volume*: allows you to set the volume of the individual arpeggiator.
        - *Arp time*: allows you to set the speed at which the arpeggio is executed.

    Each knob can be automated by mapping it to the control pedal. By right-clicking on any of the knobs, you can choose from the following options:
    - *No mapping*: the knob will not respond to the control pedal's movement.
    - *Direct mapping*: when the control pedal's value increases, the knob will increment the controlled parameter.
    - *Inverse mapping*: when the control pedal's value increases, the knob will decrease the controlled parameter.
* **Login** &rarr; allows you to access the login menu.

* **DB interaction** &rarr; is the section in which the user can:
    - left click on ↓ &rarr; use one of the previously saved plugins.
    - right click on X &rarr; delete one of the previously saved plugins.
    - left click on ↑ &rarr; save a new plugin.

## Audio Chain

The audio chain is constructed as represented in the following diagram:

![AudioChain](https://github.com/AngeloAntona/MiniLab/blob/master/ReadmeResources/AudioChain_(AudioModel).png)

The audio chain is managed by the AudioModel class, which will be discussed in the following paragraph.

## Overview of the code structure

In developing the project, I haven't used external libraries except for Firebase, which is useful for database management. The audio part has been implemented using the Web Audio API. 
Let's now take a look at the code structure:

![codeOvrvHiLvl](https://github.com/AngeloAntona/MiniLab/blob/master/ReadmeResources/codeStructureHiLvl.png)

* **Main** &rarr; This Main class handles the interaction between the lower level classes and the Firebase server. Inside it, instances of other classes are constructed, and login is managed. The main functionalities implemented through this class are:
    * *Initialization and Controller Setup*: The script sets up various controllers (AudioModel, Model, View, Controller, MidiController, TouchController) for managing different aspects of the application.
    * *Firebase Integration*: The script initializes Firebase with specific configuration parameters (API keys, domain, etc.). The Firestore database (db) and Firebase Authentication service (auth) are set up for data storage and user authentication.
    * *User Authentication*: Functions like logOut, onAuthStateChanged, and loginWithMail manage user authentication states. Users can log in with email and password, and their authentication state changes are monitored to load appropriate data.
    * *Data Retrieval and Management*: Functions getDefaultPresets and getUserPresets retrieve preset data from Firestore. This data is related to user-specific settings or configurations (presets). pushNewUserPreset and deletePreset allow adding and deleting user-specific presets in the Firestore database.

* **MidiController** &rarr; The MidiController class acts as a bridge between MIDI hardware inputs and the software logic of your application. It interprets MIDI messages from a keyboard and a control pedal, translating them into actionable commands or data.
* **TouchController** &rarr; TouchController provides a touch-based interface for interacting with various elements of the synthesizer. It translates user actions like clicking and dragging on screen elements into meaningful commands that sends to the controller.
* **Controller** &rarr; the Controller class serves as an intermediary between the other controllers (midi and touch input), the model (data and logic) and the view (UI).
* **View** &rarr; View class is focused on the visual aspects of the application. It manages the dynamic updating of UI components based on user interactions and audio processing events. This includes visual feedback on controls like knobs and buttons, visualizations of audio signals, and general UI theming and layout adjustments.
* **Model** &rarr; The Model class acts as the central repository for the application's state, handling the logic for audio parameters, user interactions, and interface changes.
* **AudioModel** &rarr; AudioModel acts as the audio engine for the application, generating and manipulating sound based on user interactions and control settings. It provides a wide range of functionalities for synthesizing musical notes, applying audio effects like filters and delays, and generating drum sounds.

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


## Maintainer
| Name                                                  | Email                         |
| ----------------------------------------------------- |:-----------------------------:|
| [Angelo Antona](https://github.com/AngeloAntona)      | angelo.antona@mail.polimi.it  | 
