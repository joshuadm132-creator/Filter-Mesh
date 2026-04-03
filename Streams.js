
class SnapUnit {

    constructor(stream, filterType){
        this.original = stream
        this.snap = stream.get();
        this.filter = filterType;
        this.sizeX = 160;
        this.sizeY = 120;
        this.xPos = 0;
        this.yPos = 0;
        this.slider = null
        this.needsUpdate = true;
        this.faces = [] 
        this.comparisonMode = false;
        
    }

   display(){
    this.applyFilter();
    if (this.filter == " ") return;
    text(this.filter, this.xPos, this.yPos - 10);
    image(this.snap, this.xPos, this.yPos, this.sizeX, this.sizeY);
    // draw dividing line if comparison mode is on
    if(this.comparisonMode){
        stroke(255, 0, 0);
        strokeWeight(2);
        let midX = this.xPos + this.sizeX / 2;
        line(midX, this.yPos, midX, this.yPos + this.sizeY);
        noStroke();
    }
}
  

 
    setPos(x,y){
        this.xPos = x
        this.yPos = y

          if (this.slider) {
            this.slider.position(this.xPos, this.yPos + this.sizeY * 1.85);
    }
    }

    addSlider(max = 255, min = 0, defaultVal = null){
        if (!this.slider) {  
            let startVal = defaultVal !== null ? defaultVal : (min + max) / 2;
            this.slider = createSlider(min, max, startVal);
            this.slider.position(this.xPos, this.yPos + this.sizeY * 1.85);
            this.slider.size(120);
        }
        this.slider.input(() => {
            this.needsUpdate = true;
        });
    }
    setFaces(faces){
        this.faces = faces;
        this.needsUpdate = true; 
    }

setComparisonMode(mode){
    this.comparisonMode = mode;
    this.needsUpdate = true;
}
    

applyFilter() {
  if (!this.needsUpdate) return;

    this.snap = this.original.get();
    this.snap.loadPixels();
 
    if (this.snap.pixels ===null || this.snap.pixels.length === 0) {
        return;
    }
    switch(this.filter) {

        case "gray":
            grayscaleFilter(this.snap.pixels);
            break;

        case "red":
            redFilter(this.snap.pixels);
            break;

        case "green":
            greenFilter(this.snap.pixels);
            break;
        
        case "redThresholdFilter":
            this.addSlider();
            ThresholdFilter(this.snap.pixels, this.slider.value(),"r");
            break;
        case "greenThresholdFilter":
            this.addSlider();
            ThresholdFilter(this.snap.pixels, this.slider.value(),"g");
            break;
        case "blueThresholdFilter":
            this.addSlider();
            ThresholdFilter(this.snap.pixels, this.slider.value(),"b");
            break;

        case "blue":
            blueFilter(this.snap.pixels);
            break;
 
        case "invert":
            invertFilter(this.snap.pixels);
            break;

        case "threshold":
            thresholdFilter(this.snap.pixels);
            break;
        case "blur":
            blurFilter(this.snap.pixels, this.snap.width, this.snap.height);
            break;
        case "edge":
            edgedetectionFilter(this.snap.pixels, this.snap.width, this.snap.height);
            break
        case " ":
            break;
        case "hsvFilter":
            hsvFilter(this.snap.pixels)  
            break
        case"convertToYCbCr":
            convertToYCbCr(this.snap.pixels)       
            break   
        case "thresholdhsvFilter":
            this.addSlider(360);
            thresholdhsvFilter(this.snap.pixels, this.slider.value());
            break;
        case "thresholdconvertToYCbCr":
            this.addSlider(160,120);
            thresholdconvertToYCbCr(this.snap.pixels, this.slider.value());
            break;
        case "faceFilter":
            if(this.faces.length > 0){
                if(faceFilterMode === 1){
                    applyFaceInvert(this.snap,this.faces[0])
                } else if(faceFilterMode === 2){
                    applyStaticFaceFlip(this.snap, this.faces[0]);
                } else if(faceFilterMode === 3){
                    applyStaticFacePixelate(this.snap, this.faces[0]);
                }
            }
            break;
    }

    // comparison mode - overwrite left half with original pixels
    if(this.comparisonMode){
        let original = this.original.get();
        original.loadPixels();
        let halfWidth = floor(this.snap.width / 2);

        for(let y = 0; y < this.snap.height; y++){
            for(let x = 0; x < halfWidth; x++){
                let idx = (x + y * this.snap.width) * 4;
                this.snap.pixels[idx]     = original.pixels[idx];
                this.snap.pixels[idx + 1] = original.pixels[idx + 1];
                this.snap.pixels[idx + 2] = original.pixels[idx + 2];
            }
        }
}

    this.snap.updatePixels();
    this.needsUpdate = false;
}

}

class Grid {

    constructor(col){
        this.colum = col
        this.units = []
    }
    addUnit(unit){
        this.units.push(unit)
       
        const index = this.units.length-1
        const x = (index % this.colum) * 190 + (20*(index%this.colum))
        const y = Math.floor(index/this.colum) * 200
        unit.setPos(x,y) 
    }

    setComparisonMode(mode){
    for(let unit of this.units){
        unit.setComparisonMode(mode);
    }
}

    populate(snapshot){
        for (let unit of this.units) {
        if (unit.slider) {
            unit.slider.remove();
        }
        }
        this.units = []
       
        let filters = [
        "webcam",
        "gray",
        " ",
        "red",
        "green",
        "blue",
        "redThresholdFilter",
        "greenThresholdFilter",
        "blueThresholdFilter",
        "webcam repeat",
        "hsvFilter",
        "convertToYCbCr","faceFilter",
        "thresholdconvertToYCbCr","thresholdhsvFilter",
       
    ];
        for(let i =0;i<15;i++){
           
            let copy = snapshot.get();
            this.addUnit(new SnapUnit(copy,filters[i]));
        }

    }

    setFaces(faces){
    for(let unit of this.units){
        if(unit.filter === "faceFilter"){
            unit.setFaces(faces);
        }
    }
}

setFaceFilterMode(mode){
    for(let unit of this.units){
        if(unit.filter === "faceFilter"){
            unit.needsUpdate = true;
        }
    }
}

    draw(){
        for(let unit of this.units){
            unit.display()
        }
        
    }

}

function  vidoeFiltur(faces,filterValue){
   
    if(faces.length>0){

        switch(filterValue){
            case 1:
                applyFaceInvert(videoStream,faces[0])
                break
            case 2:
                applyFaceFiltur(faces[0])
                break
            case 3:    
                applyFaceFlip(faces[0])
                break
            case 4:
                applyFacePixelate(faces[0])
                break
            case 0:
                break

        }
        drawFaceDetection()
    }

}