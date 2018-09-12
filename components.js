AFRAME.registerComponent('programaticsound',{
    schema:{type: 'string', default: 'C'},

    playSound: function(){
        this.system.playSound(this.data)
    },

    playRandomSound: function(){
        this.system.playRandomSound()
    }
})

// makes the camera (actually the cameraWrapper) move from the actual position to a target position
AFRAME.registerComponent('movement',{
    schema:{
        target:{type:'vec3'},
        speed: {type: 'number', default: 4}
    },
    tick: function (time, timeDelta) {
        var thisEntity = this.el
        var n = this.data.target
        var p = this.el.getAttribute('position')
        var target = new THREE.Vector3(n.x,n.y,n.z)
        var dir = target.clone().sub(p).normalize()
        var speed = this.data.speed * timeDelta*0.001
        if (p.distanceTo(target)>speed){
            this.el.object3D.position.add(dir.multiplyScalar(speed))
        }else if(this.moving){
            thisEntity.emit('camerareachedtarget','reached'+this.targetId)
            this.moving = false
        }
    },

    init: function(){
        this.targetId = 'none'
        this.moving = false
        this.el.addEventListener('teleporteractive',function(e){
            console.log(e.msg)
        })
    }
})

// Assigns a new target position to the movement component + fancy things
AFRAME.registerComponent('teleporter',{
    schema:{
        current: {default: false},
        targetId: {type: 'string', default: 'cameraWrapper'} // cameraWrapper, powerCell
    },
    init: function () {
        this.system.registerMe(this.el)
        var self = this
        this.active = false

        //Adds animation
        var teleporterAnimation = document.createElement('a-animation')
        teleporterAnimation.setAttribute('mixin','teleporter-anim')
        this.el.appendChild(teleporterAnimation)

        //Make active when appears
        this.el.addEventListener('appeared',function(){
            self.active = true
        })

        // On clicked
        this.el.addEventListener('click',function(){
            if (!self.data.current && self.active){
                var thisEntity = self.el
                var id = self.system.getId(thisEntity)
                // Plays a sound
                thisEntity.components.programaticsound.playRandomSound()

                // Adds this position to the camera target position
                var cam = document.getElementById(self.data.targetId)
                var p = thisEntity.getAttribute('position')
                AFRAME.utils.entity.setComponentProperty(cam, 'movement.target',p.x+' '+p.y+' '+p.z);
                // cam.setAttribute('movement.target',p.x+' '+p.y+' '+p.z)
                cam.components.movement.targetId = id
                cam.components.movement.moving = true

                // Marks entity as current so this action is executed only once
                AFRAME.utils.entity.setComponentProperty(thisEntity, 'teleporter.current',true);

                // Add fancy animations using mixins to give feedback
                var fadeAnim = document.createElement('a-animation')
                fadeAnim.setAttribute('mixin','fade-away')
                var scaleAnim = document.createElement('a-animation')
                scaleAnim.setAttribute('mixin','scale-away')
                thisEntity.appendChild(scaleAnim)
                thisEntity.appendChild(fadeAnim)

                // Emits an event
                thisEntity.emit('elementclicked', { 'id': id})
            }                            
        })
    }
})

AFRAME.registerComponent('animator', {

    schema:{
        conditionAppear: {
            type: 'string',
            default: 'init'
        },
        conditionDisappear: {
            type: 'string',
            default: 'none'
        }
    },

    init: function() {
        var self = this
        this.system.registerMe(this.el)

        if(this.data.conditionDisappear == 'init'){
            this.disappear()
        }
        if(this.data.conditionAppear == 'init'){
            this.appear()
        }


        this.el.addEventListener('elementclicked',function(ev){
            self.system.animateNext(ev.detail.id)
        })

        this.el.addEventListener('camerareachedtarget',function(ev){
            // console.log('camerareachedtarget: '+ev.detail)
            self.system.animateNext(ev.detail)
        })

        
    },

    appear: function() {
        var thisEntity = this.el
        var toPos = this.el.object3D.position
        var offset = new THREE.Vector3(0,-3,0)
        var fromPos = toPos.clone().add(offset)
        var fadeAnim = document.createElement('a-animation')
        if (thisEntity.getAttribute('text')){
            fadeAnim.setAttribute('mixin','fade-text')
            fadeAnim.setAttribute('from',0)
            fadeAnim.setAttribute('to',1)
        }else{
            fadeAnim.setAttribute('mixin','fade-in')
        }
        var positionAnim = document.createElement('a-animation')
        positionAnim.setAttribute('mixin','show-up')
        positionAnim.setAttribute('from',AFRAME.utils.coordinates.stringify(fromPos))
        positionAnim.setAttribute('to',AFRAME.utils.coordinates.stringify(toPos))
        thisEntity.appendChild(positionAnim)
        thisEntity.appendChild(fadeAnim)
        thisEntity.emit('appeared')

    },

    disappear: function() {
        var thisEntity = this.el
        var fromPos = this.el.object3D.position
        var offset = new THREE.Vector3(0,-3,0)
        var toPos = fromPos.clone().add(offset)
        var fadeAnim = document.createElement('a-animation')
        if (thisEntity.getAttribute('text')){
            fadeAnim.setAttribute('mixin','fade-text')
        }else{
            fadeAnim.setAttribute('mixin','fade-away')
        }
        var positionAnim = document.createElement('a-animation')
        positionAnim.setAttribute('mixin','show-up')
        positionAnim.setAttribute('from',AFRAME.utils.coordinates.stringify(fromPos))
        positionAnim.setAttribute('to',AFRAME.utils.coordinates.stringify(toPos))
        thisEntity.appendChild(positionAnim)
        thisEntity.appendChild(fadeAnim)
        thisEntity.emit('disappeared')
    },


    fromSystemToComponent: function() {
        console.log('this function is called from the system')
    }
})

AFRAME.registerComponent('door',{
    schema: {
        melody: {type: 'string'}
    },
    init: function() {
        this.colors = ['violet','aquamarine','tomato','orange','greenyellow']
        this.musicalNotes = ['C','D','E','F','G','A','B','A#','G#']
        this.tiles = []
        this.level = 0
        this.playing = false
        var self = this

        // Add start button
        var startButton = document.createElement('a-cylinder')
        startButton.setAttribute('rotation','-90 0 0')
        startButton.setAttribute('position','-1 2 0')
        startButton.setAttribute('radius','0.4')
        startButton.setAttribute('color','green')
        startButton.addEventListener('click', function(){
            self.playMelody(2)
        })
        this.el.appendChild(startButton)


        for(var i = 0; i < 3; i++){
            for(var j = 0; j < 3; j++){
                var tile = document.createElement('a-plane')
                tile.setAttribute('color',this.getRandomColor())
                tile.setAttribute('programaticsound',this.musicalNotes[(3*i)+j])
                tile.setAttribute('position',i +' '+ j + ' 0')
                tile.setAttribute('width', "0.8")
                tile.setAttribute('height', "0.8")
                tile.setAttribute('keytile', "")
                this.el.appendChild(tile)

                this.tiles.push(tile)
            }
        }
    },

    getRandomColor: function() {
        return this.colors[Math.floor(Math.random()*this.colors.length)]
    },

    playMelody: function(level) {
        if (!this.playing){
            this.playing = true;
            var self = this

            var l = this.data.melody.length - 3 + level
            var melodyTiles = []

            for(var i = 0; i < l; i++){
                var note = this.data.melody.charAt(i)
                console.log(note)
                var noteIdx = this.musicalNotes.indexOf(note)
                melodyTiles.push(this.tiles[noteIdx])
            }
    
            melodyTiles.forEach(function(element,index) {
                if(element.hasLoaded){
                    setTimeout(function(){
                        element.components.keytile.playSound()
                        // var ps = element.components.programaticsound
                        // ps.playSound()
                        if (index >= l-1){
                            self.playing = false
                        }
                    },index*500)
                }
            });
        }
    },
})

AFRAME.registerComponent('keytile',{
    schema:{},
    init: function(){
        var self = this
        this.color = this.el.getAttribute('color')
        this.el.setAttribute('color','white')
        this.el.addEventListener('click',function(){
            self.playSound()
        })
    },
    playSound(){
        this.el.components.programaticsound.playSound()
        this.el.setAttribute('color',this.color)
        var self = this
        setTimeout(function(){
            self.el.setAttribute('color','white')        

        },500)
    }
})