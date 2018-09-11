AFRAME.registerComponent('programaticsound',{
    schema:{type: 'string', default: 'C'},

    playSound: function(){
        this.system.playSound(this.data)
    }
})

// makes the camera (actually the cameraWrapper) move from the actual position to a target position
AFRAME.registerComponent('movement',{
    schema:{
        type:'vec3'
    },
    tick: function () {
        var thisEntity = this.el
        var n = this.el.getAttribute('movement')
        var p = this.el.getAttribute('position')
        var target = new THREE.Vector3(n.x,n.y - 2,n.z)
        var dir = target.clone().sub(p).normalize()
        if (p.distanceTo(target)>0.1){
            var speed = 0.1
            this.el.object3D.position.add(dir.multiplyScalar(speed))
        }else if(this.moving){
            thisEntity.emit('camerareachedtarget','reached'+this.target)
            this.moving = false
        }
    },
    update: function(oldData){
        this.el.setAttribute('movement',this.data)
    },

    init: function(){
        this.target = 'none'
        this.moving = false
        this.el.addEventListener('teleporteractive',function(e){
            console.log(e.msg)
        })
    }
})

// Assigns a new target position to the movement component + fancy things
AFRAME.registerComponent('teleporter',{
    schema:{
        current: {default: false}
    },
    init: function () {
        this.system.registerMe(this.el)
        var self = this

        // On clicked
        this.el.addEventListener('click',function(){
            if (!self.data.current){
                var thisEntity = self.el
                var id = self.system.getId(thisEntity)
                // Plays a sound
                thisEntity.components.programaticsound.playSound()

                // Adds this position to the camera target position
                var cam = document.getElementById("cameraWrapper")
                var p = thisEntity.getAttribute('position')
                cam.setAttribute('movement',p.x+' '+p.y+' '+p.z)
                cam.components.movement.target = id
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
