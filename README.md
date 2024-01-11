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

## Overview of the code structure

In developing the project, I haven't used external libraries except for Firebase, which is useful for database management. The audio part has been implemented using the Web Audio API. 

Let's now take a look at the code structure:

![codeOvrvHiLvl](https://github.com/AngeloAntona/MiniLab/blob/master/ReadmeResources/codeStructureHiLvl.png)

* **Main** &rarr; This Main class handles the interaction between the lower level classes and the Firebase server. Inside it, instances of other classes are constructed, and login is managed. The main functionalities implemented through this class are:
    * *Initialization and Controller Setup*: The script sets up various controllers (AudioModel, Model, View, Controller, MidiController, TouchController) for managing different aspects of the application.
    * *Firebase Integration*: The script initializes Firebase with specific configuration parameters (API keys, domain, etc.). The Firestore database (db) and Firebase Authentication service (auth) are set up for data storage and user authentication.
    * *User Authentication*: Functions like logOut, onAuthStateChanged, and loginWithMail manage user authentication states. Users can log in with email and password, and their authentication state changes are monitored to load appropriate data.
    * *Data Retrieval and Management*: Functions getDefaultPresets and getUserPresets retrieve preset data from Firestore. pushNewUserPreset and deletePreset allow adding and deleting user-specific presets in the Firestore database.

* **MidiController** &rarr; The MidiController class acts as a bridge between MIDI hardware inputs and the software logic of your application. It interprets MIDI messages from a keyboard and a control pedal, translating them into actionable commands or data. The main functionalities that this class manages are:
    * *MIDI Setup*:
        * initializeMIDI: Requests access to MIDI devices and, upon success, calls setupMIDIInput to configure MIDI input handling.
        * setupMIDIInput: Iterates over available MIDI input devices and sets up event handlers for the specified keyboard and control pedal.
    * *Handling MIDI Messages*:
        * handleKeyboardMIDIMessage: Processes MIDI messages received from the keyboard. It interprets different types of MIDI messages such as Pitch Bend, Control Change, Note On, and Note Off.
        * handlecntrlPedalMIDIMessage: Processes MIDI messages from the control pedal. It handles specific control changes based on the pedal's input.
* **TouchController** &rarr; TouchController provides a touch-based interface for interacting with various elements of the synthesizer. It translates user actions like clicking and dragging on screen elements into meaningful commands that are sent to the controller. This class manages the following functions:
    * *Touch Interaction*: The methods attachKeysEventListeners, attachPadsEventListeners, attachDisplayButtonsEventListeners and attachDisplaySplitEventListener listen for mouse down, up, and leave events and send the corresponding commands to the controller class.
* **Controller** &rarr; the Controller class serves as an intermediary between the other controllers (midi and touch input), the model (data and logic) and the view (UI). The mediation between the different classes consists of:
    * *Preset Management*: setPreset changes the current preset based on user selection. synchronizeKnobs updates the knob elements on the UI to reflect the current state of the model.
    * *Instruments Handling*: handleNoteOn and handleNoteOff manage the behavior when musical notes are played or stopped. This includes handling for different instruments like keys, bass, and arpeggio (arp). handleSustain manages sustain pedal effects for notes. Functions like handlePadOn, handlePadOff, handleControlChangeEvent, and handleWheel handle various user interactions with pads, control changes, and modulation wheels. handleArp toggles the arpeggiator and updates the interface accordingly.
    * *Instrument Configuration*: shiftOctave, waveformChanger, splitManager, turnOn, flipWheel, flipMono, flipSustain are used to modify settings of the instruments like octave shifting, waveform changing, mono/polyphonic modes, and sustain settings.
    * *MIDI and Preset Mapping*: handleMidiPresetChange and handleMidiMappingPresetChange manage changes in MIDI presets and mappings.
    * *Rendering and Display Updates*: renderAll is a comprehensive function that updates the entire view based on the current state of the model. It updates various components like volume indicators, oscillator types, active indicators, and more.
* **View** &rarr; View class is focused on the visual aspects of the application. It manages the dynamic updating of UI components based on user interactions and audio processing events. This includes visual feedback on controls like knobs and buttons, visualizations of audio signals, and general UI theming and layout adjustments. This class manages:
    * *Knob Interaction*: rotateKnob updates the visual representation of a knob element based on the rotation value, reflecting changes in settings like volume or filter cutoff.
    * *Display Updates*: functions like updateDisplayOctave, renderActiveIndicator, showOscillatorType, flipButton, updateSplitDot and updateDisplayVolumeIndicator update various display indicators (es. the display of the current octave for an instrument, the current type of oscillator,...). 
    * *Amplitude Visualization*: drawAmplitudePlot and animateAmplitudePlot are responsible for creating and animating an amplitude plot on the canvas. These methods visualize the audio signal's amplitude over time.
    *  *User Interface Color Theming*: interfaceColorGradient adjusts the color scheme of various interface elements like knobs, pads, and buttons based on the audio signal's properties.
* **Model** &rarr; The Model class acts as the central repository for the application's state, handling the logic for audio parameters, user interactions, and interface changes. The main functionalities that this class manages are:
    * *Preset Management*: setPresets and setPreset are used to manage presets, which are predefined settings for the application. getPresetNames provides a list of available preset names. handleMidiPresetChange changes presets based on MIDI input.
    * *Instrument Settings*: Methods like flipSplit, flipMono, flipSust, and flipWheel toggle different modes for instruments (e.g., split mode, mono/polyphonic mode, sustain, wheel control). setWaveform updates the waveform type for different instruments based on user selection.
    * *Knob and Control Pedal Handling*: updateKnobLevel and handleControlChangeEvent manage changes in knob levels and control changes from the MIDI or touch input. connectPedalKnobs links control pedals to specific knob functions.
    * *Audio Parameter Updates*: refreshAudioParameters updates the audioModel with the current state of various controls like gain, filter frequencies, delay settings, etc.
    * *Note Handling for Instruments*: Methods like handleNoteOn, handleNoteOff, handleBassOn, handleBassOff, and related methods manage the playing and stopping of notes for keys, bass, and arpeggiator. deleteAllNotes and deleteAllSustainedNotes are used to stop all currently playing or sustained notes.
    * *Arpeggiator Control*: handleArpeggioOn, handleArpeggioOff, playArpSequence, and handleArpSustain control the behavior of the arpeggiator, including note playing and sustaining.
    * *Drum Pad Handling*: handlePadOn and handlePadOff manage interactions with drum pads, triggering different drum sounds.
* **AudioModel** &rarr; AudioModel acts as the audio engine for the application, generating and manipulating sound based on user interactions and control settings. It provides a wide range of functionalities for synthesizing musical notes, applying audio effects like filters and delays, and generating drum sounds. Going into more detail, the main functionalities of this class are:
    * *Gain Control*: Methods like setMainGain, setInstGain, setDrumGain, setKeyGain, setBassGain, and setArpGain control the volume levels of different audio sources.
    * *Filter and Delay Configuration*: setLowPassFilterFrequency and setHiPassFilterFrequency configure the frequencies of low-pass and high-pass filters for keys and bass. setDelayTime and setDelayFeedback adjust the delay time and feedback amount for keys and bass delay effects.
    * *Oscillator Configuration*: setNoteOscillator sets the type of waveform to be used for note oscillators.
    * *Note Handling and Sound Generation*: playNote creates an OscillatorNode and GainNode to play a musical note. It sets the oscillator frequency based on the note and instrument type and connects it to appropriate audio nodes. stopNote gracefully fades out and stops a playing note.
    * *Drum Sounds*: playKick, playSnare, playClosedHiHat, and playCrashCymbal generate various drum sounds using techniques like white noise generation and filter application.
    * *Amplitude Analysis*: getAmplitude analyzes the audio signal to calculate the amplitude for visualization purposes.

### Audio Chain

The audio chain is constructed in the AudioModel class following the scheme represented below:

![AudioChain](https://github.com/AngeloAntona/MiniLab/blob/master/ReadmeResources/AudioChain_(AudioModel).png)


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
