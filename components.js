AFRAME.registerComponent('programaticsound',{
    schema:{type: 'string', default: 'C'},

    playSound: function(){
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

        //Adds animation
        var teleporterAnimation = document.createElement('a-animation')
        teleporterAnimation.setAttribute('mixin','teleporter-anim')
        this.el.appendChild(teleporterAnimation)

        // On clicked
        this.el.addEventListener('click',function(){
            if (!self.data.current){
                var thisEntity = self.el
                var id = self.system.getId(thisEntity)
                // Plays a sound
                thisEntity.components.programaticsound.playSound()

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
            console.log('camerareachedtarget: '+ev.detail)
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
    },


    fromSystemToComponent: function() {
        console.log('this function is called from the system')
    }
})
