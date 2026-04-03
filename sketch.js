/**
 * ============================================================
 * CM2030 – Graphics Programming | Coursework Finals
 * ============================================================
 * 
 * Image process application.
 * depandences: P5.js and ml% FaceMesh
 * 
 * WALKTHROUGH
 * 
 * Two video streams are created (Reasons explained below). One for the 
 * webCam live video feed displayed on the right where you see all other 
 * non mandatory filters applied and the other for the snapshots that are 
 * displayed in the left static images grid. The webCam feeds the live display 
 * and pressing s captures a snapshot and then populates a 3 colum grid.
 * Pressing U allows for the uplode and population of a static test image stored on the device.
 * 
 * The grid covers the following operations. Row 1 shows the
 * original image and a greyscale version with brightness
 * reduced by 20%, with constrain() preventing values falling below zero. Row 2 isolates the
 * red, green and blue channels. Row 3 applies per-channel binary
 * thresholding with individual 0-255 sliders for each channel.
 * Row 4 repeats the original alongside HSV conversion with
 * saturation boosted by a variable multiplier, and YCbCr
 * conversion using the ITU-R BT.601 matrix. Row 5 contains
 * the face filter tile, a YCbCr Cr-channel threshold slider,
 * and an HSV hue threshold slider with a 0-360 range.
 * 
 * Face detections runs using ml5 FaceMesh and when a snapshot is 
 * taken it runs direct on the static image.Keys 1, 2
 * and 3 switch the face filter tile between invert, horizontal
 * flip and pixelation. The live stream face filter cycles
 * through twelve filter modes using the P key, including
 * invert, greyscale, channel filters, blur, edge detection,
 * HSV, YCbCr, flip and pixelation.
 * 
 * Extensions 
 * Three extensions were implemented. The first is the
 * applyFaceFiltur generic wrapper function. Rather than
 * writing separate crop filter blocks for every face
 * filter, the wrapper centralises the extract-process-replace
 * pipeline and accepts any filter mode as a parameter. maximising reusability.
 * 
 * The second extension is the real-time intensity slider. This works on the face 
 * filter alone alowing for a change in intensity in the filter effects for the 
 * blur kernel size, threshold cutoff, brightness multiplier and HSV saturation boost
 * 
 * The third extension is the split comparison view toggled
 * by C. This is a standard tool in professional image
 * processing software and demonstrates precise pixel-level
 * control by splitting the image at the midpoint of the
 * pixel array rather than using any p5 drawing shortcuts.
 * 
 * PROJECT PROGRESS
 * The main requirements were completed successfully. Some
 * planned quality of life additions were not implemented due
 * to time constraints but the architecture supports them
 * without structural changes. These include more advanced filters and others.
 * 
 * PROBLEMS FACED
 * The first significant problem was the live videoStream
 * freezing whenever no face was detected.The fix was calling both at the top of draw() every frame
 * regardless of detection state rather than just in the face filter functions.
 * 
 * The second problem was the pixelation filter. The initial
 * approach drew filled circles directly onto the main canvas
 * using circle(), but these were immediately painted over by
 * the subsequent image() call each frame. The solution was
 * to render circles into a createGraphics() offscreen buffer
 * at the exact dimensions of the face region, then copy the
 * buffer's pixel array back into the target image.
 * 
 * The third problem was implementing the comparison view
 * without breaking the filter pipeline. The solution was to
 * run the comparison entirely inside display() after
 * applyFilter() completes. A fresh unfiltered copy is read
 * from this.original, and only the left half of the pixel
 * array is copied back into this.snap before image() draws
 * it. The right half retains the filtered result untouched.
 */






var videoStream;    //store the video stream 
var snapStream;    //stream for the actual snap
var grid          // the grid
var testImage;   // testing image camara quality low
var faceMesh;   //store the FaceMesh model.
var faces = []
let options = { maxFaces: 2, refineLandmarks: false, flipped: false };
let faceFilterMode = 1; // for static image
var vidoeFiltur = false;
let filterValue = 0 // for dynamic webcam video
var intensitySlider //master intensity slider
var comparisonMode = false;

function preload(){
    testImage = loadImage("image.png");
    faceMesh = ml5.faceMesh(options);
}


function setup() {
    // 1. Make the canvas responsive to the Iframe size
    let canvas = createCanvas(windowWidth, windowHeight);
    // 2. Attach the canvas to your wrapper div (Matches your Portfolio ID)
    background(0);
    pixelDensity(1);
    
    videoStream = createCapture(VIDEO);
    videoStream.hide()
    snapStream = createCapture(VIDEO);
    snapStream.hide()

    grid = new Grid(3); //takes arguments to inisilies number of colums
    faceMesh.detectStart(videoStream, gotFaces);

    intensitySlider = createSlider(0, 100, 50);
    intensitySlider.position(700, 360);
    intensitySlider.size(150);

    input = createFileInput(handleImage);
    input.hide()


}

function gotFaces(results) {
  // Save the output to the faces variable
  faces = results;
  console.log("FaceMesh ready");
}
 
function drawFaceDetection(){

 for (let face of faces) {
    stroke(255,0,0);
    noFill();
    rect(getFaceBounds(face,).minX,getFaceBounds(face).minY,
    getFaceBounds(face).maxX-getFaceBounds(face).minX,
    getFaceBounds(face).maxY-getFaceBounds(face).minY);
  }
  
}


function draw() {
    background(0);
    fill(255);  
    videoStream.loadPixels()
    videoStream.updatePixels()

    let intensityValue = intensitySlider.value() / 100; // normalise to 0.0–1.0
   

  for(let face of faces){
         applyFaceFiltur(face, filterValue, intensityValue);
        if(filterValue == 11){
            applyFaceFlip(face)
        }
          if(filterValue == 12){
           applyFacePixelate(face)
        }
  }

    fill(255); // White text
    textAlign(LEFT);
    textSize(16);
    textStyle(BOLD);
    text("APPLICATION CONTROLS", 700, 410);

    textStyle(NORMAL);
    textSize(13);
    let lineSpacing = 22;
    let startY = 435;
    text("Intensity: " + intensitySlider.value(), 730, 330);
    text("• Press 'U': Upload custom image", 700, startY);
    text("• Press 'T': Process uploaded/test image", 700, startY + lineSpacing);
    text("• Press 'S': Take snapshot from Live Cam", 700, startY + lineSpacing * 2);
    text("• Press '1, 2, 3': Change Face Privacy Filter", 700, startY + lineSpacing * 3);
    text("• Press '0': Clear Face Filter", 700, startY + lineSpacing * 4);
    text("• Press 'P': Cycle filters on Live Cam", 700, startY + lineSpacing * 5);
    text("• Press 'C': Toggle Comparison Mode", 700, startY + lineSpacing * 6);

   
    fill(0, 255, 0); 
    text("Active Face Mode: " + faceFilterMode, 700, startY + lineSpacing * 8);

    text("LIVE CAMERA", 730, 90);
    text("Face filter: " + filterValue, 730, 315);
    image(videoStream,690,100,200,200)
    textSize(22);
    text("Filter CAMERA", 200, 30);
    push()
    translate(0,100)
    fill(215)
    textSize(16);
    grid.draw(0,50);
    pop()

    

   
}
 
function keyPressed(){

    if(key == "s"||key =="S"){
        /* 
        creates snap shot of the video 
        stream to use as picture without saving to drive
        load it into grid

        using One stream for optimisation instead pf creating multiple streams for each snap shot
        */
        let snapshot = snapStream.get();
        faceMesh.detect(snapshot, function(results){
            grid.populate(snapshot);
            grid.setFaces(results);
        });
      
    }
    if(key =="t" ||key =="T"){
        
           faceMesh.detect(testImage, function(results){
            grid.populate(testImage);
            grid.setFaces(results);
        });
          
    }
    if(key == "1"){ faceFilterMode = 1; grid.setFaceFilterMode(1); }
    if(key == "2"){ faceFilterMode = 2; grid.setFaceFilterMode(2); }
    if(key == "3"){ faceFilterMode = 3; grid.setFaceFilterMode(3); }
    if(key == "0"){ 
        faceFilterMode = 0; 
        grid.setFaceFilterMode(0); 
    }
    if(key == "p"||key =="P"){
         filterValue++
        if(filterValue > 12) {
            filterValue = 0
        }  
        
    }
    
    if(key == "c" ||key =="C"){
        comparisonMode = !comparisonMode;
        grid.setComparisonMode(comparisonMode);
    }

    if (key == "u"||key =="U"){

        input.elt.click();

    }
    
}

function handleImage(file) {
  if (file.type === 'image') {
    //  Load the data into a p5 Image object 
    loadImage(file.data, (img) => {
        img.resize(160, 0);
        testImage = img;
        console.log("Image Uploaded.loadingggg");
        
        // Automatically trigger FaceMesh on the new image
        faceMesh.detect(testImage, function(results) {
            grid.populate(testImage);
            grid.setFaces(results);
            console.log("Grid populated");
      });
    });
  } else {
    console.log("File is not an image.");
    testImage = null;
  }
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    // Re-position the slider so it doesn't float off-screen
    if(intensitySlider) {
        intensitySlider.position(windowWidth * 0.6, windowHeight * 0.3);
    }
}
