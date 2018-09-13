// Handles all animations sequences for the game
AFRAME.registerSystem('animator',{
    schema: {},

    init: function() {
        this.entities = []
    },

    // Registers entity with an animator component asociated
    registerMe: function(el) {
        this.entities.push(el)
    },

    unregisterMe: function (el) {
        var index = this.entities.indexOf(el);
        this.entities.splice(index, 1);
    },



    fromComponentToSystem: function() {
        console.log('this is a function called from a component')
        this.entities.forEach(function(element) {
            element.components.animator.fromSystemToComponent();
        });
    },

    animateNext: function(trigger) {
        this.entities.forEach(function(element) {
            var animator = element.components.animator
            if(animator.data.conditionAppear == trigger){
                animator.appear()
            }
            if(animator.data.conditionDisappear == trigger){
                animator.disappear()
            }
        });
    }

})

// This systems creates all the elements needed to play simple audio waves using an oscillator
AFRAME.registerSystem('programaticsound',{
    schema:{
        context:{default: new AudioContext()},
        frequencies:{
            default: {   
                'C': 349.2,
                'C#': 370.0,
                'D': 392.0,
                'D#': 415.3,
                'E': 440.0,
                'F': 466.2,
                'F#': 493.9,
                'G': 523.3,
                'G#': 554.4,
                'A': 587.3,
                'A#': 622.3,
                'B': 659.3
            }
        }
    },

    init: function() {
        this.currentNote = 0
        this.gain = 0.8
        this.frequenciesArray = ['C','D','E','F','G','A','B']
    },

    playSound: function(note) {
        var context = this.data.context
        var frequencies = this.data.frequencies
        
        // creates oscillator to create the actual sound with the choosen note frequency
        var o = context.createOscillator()
        o.frequency.value = frequencies[note]

        var g = context.createGain() // creates gain to gracefully reduce the sound through time

        g.gain.value = this.gain

        o.connect(g) //Connects oscillator output to gain input

        g.connect(context.destination) //Conect gain module to the output

        o.start(context.currentTime) //Start playing

        // Reduces exponentially the sound, this gives a reallystic feeling
        // as the produced sound decreases the same way the sound of a pulled
        // guitar string would decrease.
        g.gain.setTargetAtTime(
            0, context.currentTime, 0.25
        )
    },

    playRandomSound: function (){
        var randomNote = this.frequenciesArray[Math.floor(Math.random()*this.frequenciesArray.length)]
        this.playSound(randomNote)
    }
}),


AFRAME.registerSystem('teleporter', {
    schema: {},

    init: function() {
        this.entities = []
    },

    // Registers entity with an animator component asociated
    registerMe: function(el) {
        this.entities.push(el)
    },

    unregisterMe: function (el) {
        var index = this.entities.indexOf(el);
        this.entities.splice(index, 1);
    },

    getId: function(el){
        return 'tel' + this.entities.indexOf(el); //Starts from 0
    }
})

AFRAME.registerSystem('door',{
    schema: {},
    init: function(){
        this.entities = []
        this.setDefaultValues()
    },
    setDefaultValues: function(){
        this.programedMelody = ''
        this.playerMelody = ''
        this.listening = false
    },
    registerMe: function(el) {
        this.entities.push(el)
    },

    unregisterMe: function (el) {
        var index = this.entities.indexOf(el);
        this.entities.splice(index, 1);
    },

    getId: function(el){
        return this.entities.indexOf(el); //Starts from 0
    },

    startListening: function(entity, melody){
        this.currentDoor = entity
        this.programedMelody = melody
        this.listening = true
        this.playerMelody = ''
    },
    registerNote: function(note){
        console.log('note : ' + note)
        if (this.listening){
            this.playerMelody+=note
            if (this.programedMelody.length == this.playerMelody.length){
                if (this.programedMelody == this.playerMelody){
                    this.currentDoor.components.door.open()
                }else{
                    this.currentDoor.components.door.keepClosed()
                }
                this.setDefaultValues()
            }
        }
    }

})