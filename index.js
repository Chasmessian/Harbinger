 class Canvas{
    constructor(canvasElement){
        this.canvas = canvasElement
        this.ctx = this.canvas.getContext("2d")
        this.activeScene = new Scene(this)
    }
    getScene(){
        return(this.activeScene)
    }
    changeScene(newScene){
        
    }
    render(){
     this.activeScene.render()
    }
}

class Scene{
    constructor(canvas){
        this.canvas = canvas
        this.elements = []        
    }
    addShape(shape){
        this.elements.push(shape)
    }
    render(){
        this.canvas.ctx.clearRect(0,0,this.canvas.canvas.width,this.canvas.canvas.height)
        this.elements.sort((a, b) => a.layer - b.layer)
        for(var i = 0; i<this.elements.length; i++){
            this.elements[i].render()
        }
    }
}

 class Shape{
    constructor(x,y,scale,rotation,color,layer=0, parentCanvas){
        this.x = x
        this.y = y
        this.scale = scale
        this.rotation = rotation
        this.color = color
        this.layer = layer
        this.canvas = parent
        this.nodes = []
        this.lineWidth = 5
        this.parentCanvas = parentCanvas
    }
    preRender(){

    }
    postRender(){

    }
    render(type="stroke"){

        this.preRender()
        this.parentCanvas.ctx.save()
        // this.parentCanvas.ctx.transform(1,1,0,0,this.x,this.y)
        // this.parentCanvas.ctx.rotate(this.rotation)
        this.parentCanvas.ctx.beginPath()
        this.parentCanvas.ctx.moveTo((this.nodes[this.nodes.length-1].x * this.scale)+ this.x,(this.nodes[this.nodes.length-1].y * this.scale) + this.y)
        for(var i = 0; i<this.nodes.length; i++){

            let currentNode = {
                x:(this.nodes[i].x * this.scale) + this.x,
                y:(this.nodes[i].y * this.scale) + this.y,
                approachStyle:this.nodes[i].approachStyle,
                radius: this.nodes[i].radius,
                arcDirection: this.nodes[i].arcDirection
            }
            if(currentNode.approachStyle=="line"){
                this.parentCanvas.ctx.lineTo(currentNode.x,currentNode.y)
                //draws line between nodes
            } else if(currentNode.approachStyle=="empty"){
                this.parentCanvas.ctx.moveTo(currentNode.x,currentNode.y)
                //pretty basic, skips drawing. 
                //Potential Problem: can't fill shape
                //TODO: look into this potential problem

            } else if(currentNode.approachStyle=="arc"){
                /*
                takes radius of arc, positions of this node and the previous node
                finds midpoint between the nodes
                Finds angle between two nodes, depending on direction of arc, rotates it by 1/2 * PI radians or 90 degrees or a negative equivalent
                uses trig to find distance from midpoint to intersections
                moves that distance along the angle
                this is the center of the arc.
                find angles between center and nodes
                draws arc
                */
                let radius = currentNode.radius * this.scale
                let previousNode = {
                    x:(this.nodes[i-1].x * this.scale) + this.x,
                    y:(this.nodes[i-1].y * this.scale) + this.y
                }
                if(i==0){
                    previousNode = {
                        x:(this.nodes[this.nodes.length-1].x * this.scale) + this.x,
                        y:(this.nodes[this.nodes.length-1].y * this.scale) + this.y
                    }
                }
                let nodeDistance = (Math.sqrt(Math.pow(currentNode.y-previousNode.y,2)+Math.pow(currentNode.x-previousNode.x,2)))
                if(radius<nodeDistance/2){
                    radius = nodeDistance/2
                }

                    // add this.x and thos.y only to currentNode since previous node has it built in
                let midpoint = {
                    x: ( (previousNode.x-currentNode.x)  /2  ) + currentNode.x, 
                    y: ( (previousNode.y-currentNode.y)  /2  ) + currentNode.y
                }
                //I know the first set of parenthesis aren't needed, but it hurts me to not include
                let nodeToNodeAngle = Math.atan2(currentNode.y-previousNode.y,currentNode.x-previousNode.x)

                //above in radians
                let newAngle = 0
                if(currentNode.arcDirection.toLowerCase() == "positive"){
                    newAngle = nodeToNodeAngle + (Math.PI / 2)
                } else if(currentNode.arcDirection.toLowerCase()=="negative"){
                    newAngle = nodeToNodeAngle - (Math.PI / 2)
                }
                let midpointIntersectionDistance = Math.sqrt(Math.pow(radius,2)-Math.pow(previousNode.x-midpoint.x,2)+Math.pow(previousNode.y-midpoint.y,2))
                let arcCenter = {
                    x: midpointIntersectionDistance * Math.cos(newAngle) + midpoint.x,
                    y: midpointIntersectionDistance * Math.sin(newAngle) + midpoint.y
                }


         
           


                let angleToThis = Math.atan2(currentNode.y - arcCenter.y, currentNode.x - arcCenter.x)
                let angleToPrevious = Math.atan2(previousNode.y - arcCenter.y,previousNode.x - arcCenter.x)
                this.parentCanvas.ctx.arc(arcCenter.x,arcCenter.y,radius,angleToPrevious,angleToThis,currentNode.arcDirection.toLowerCase()=="negative")
             
                // this.parentCanvas.ctx.moveTo(currentNode.x,currentNode.y)
                //testing needed
            }
        }
        if(type="stroke"){
            this.parentCanvas.ctx.strokeStyle = this.color
            this.parentCanvas.ctx.lineWidth = this.lineWidth
            this.parentCanvas.ctx.closePath()
            this.parentCanvas.ctx.stroke()
        } else if(type="fill"){
            this.parentCanvas.ctx.fillStyle = this.color
            this.parentCanvas.ctx.closePath()
            this.parentCanvas.ctx.fill()
        }
        this.parentCanvas.ctx.restore
        this.postRender()
    }
    setColor(newColor){
        this.color = newColor
    }
    getColor(){
        return(this.color)
    }
    
    scaleShape(factor){
        this.scale *= factor
        return(this.scale)
    }
    setScale(scale){
        this.scale = scale
    }
    getScale(){
        return(this.scale)
    }
    setCoordinates(x,y){
        this.x = x
        this.y = y
    }
    getCoordinates(){
        return([this.x,this.y])
    }
    addNode(node, index){
        this.nodes.push(node)
    }
    deleteNode(index){
        this.nodes.splice(index,1)
    }
}


 class Node{
    constructor(x,y,approachStyle = "line", duration=0, easing="default", arcRadius=0, arcDirection="positive", canvas){
        this.x=x
        this.y=y
        this.approachStyle = approachStyle
        if(approachStyle=="arc"){
            this.radius = arcRadius
            this.arcDirection = arcDirection
        }
        this.duration = duration
        this.easing = easing
        this.canvas = canvas
    }
    scale(scale){
        this.x=this.x * scale
        this.y=this.y * scale
        return([this.x,this.y])
    }
    verticalScale(scale){
        this.y = this.y * scale
        return([this.y])
    }
    horizontalScale(scale){
        this.x = this.x * scale
    }
    // DEBUGRENDER(size){
    //     this.canvas.ctx.beginPath()
    //     this.canvas.arc(this.x,this.y,size,0,Math.PI * 2)
    //     ctx.fillStyle = "#FFFFFF"
    //     ctx.fill()
    // }

}
 class Easing{
    #clamp(x){
        if(x<=0){
            return(0)
        } else if(x>=1){
            return(1)
        } else{
            return(x)
        }
    }
    linear(t){
        return(this.#clamp(t))
    }
    quadratic(t){
        return(this.#clamp(t*t))
    }
}


class spline{
    constructor(x,y,rotation,parentScene){
        this.x = x
        this.y = y
        this.rotation = rotation
        this.parentCanvas = parentScene
    }
}

class splineNode{
    constructor(baseX,baseY,handleX,handleY){
        this.baseX = baseX
        this.baseY = baseY
        this.handleX = handleX
        this.handleY = handleY
    }
}



//testing below


canvas = new Canvas(document.getElementById("canvas"))
defaultScene = canvas.getScene()
rect = new Shape(75,75,1,0,"#000000",0,canvas)
rect.addNode(new Node(20,20,"line"))
rect.addNode(new Node(60,20,"arc", 0, "default", 30, "negative"))//for some reason, negative and positive don't change anything
rect.addNode(new Node(60,60,"line"))
rect.addNode(new Node(20,60,"line"))
defaultScene.addShape(rect)
// loop = setInterval(function(){
//     rect.rotation
//     canvas.render()
// },16)