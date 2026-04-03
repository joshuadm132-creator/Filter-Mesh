


// ===== INVERT ====
function invertFilter(pixels){

    for (let i = 0; i < pixels.length; i += 4) {

        pixels[i] = 255 - pixels[i];
        pixels[i+1] = 255 - pixels[i+1];
        pixels[i+2] = 255 - pixels[i+2];
    }
}


// ===== GRAYSCALE =====
function grayscaleFilter(pixels, intensity = 0.8){
    for (let i = 0; i < pixels.length; i += 4) {
        let avg = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
        avg = avg * intensity;  // for snapshot it will default to 80% brightness
        avg = constrain(avg, 0, 255)
        pixels[i] = avg;
        pixels[i+1] = avg;
        pixels[i+2] = avg;
    }
}



// ===== RED CHANNEL =====
function redFilter(pixels){

    for (let i = 0; i < pixels.length; i += 4) {

        pixels[i+1] = 0;
        pixels[i+2] = 0;
    }
}




// ==== GREEN CHANNEL ====
function greenFilter(pixels){

    for (let i = 0; i < pixels.length; i += 4) {

        pixels[i] = 0;
        pixels[i+2] = 0;
    }
}


// ===== BLUE CHANNEL ====
function blueFilter(pixels){

    for (let i = 0; i < pixels.length; i += 4) {

        pixels[i] = 0;
        pixels[i+1] = 0;
    }
}
// ===== THRESHOLD =====
function thresholdFilter(pixels, intensity = 90){
    for (let i = 0; i < pixels.length; i += 4) {
        let brightness = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
        let val = brightness > intensity ? 255 : 0; 
        pixels[i] = val;
        pixels[i+1] = val;
        pixels[i+2] = val;
    }
}

// Filter logic for the Channel Threshold tile///////
function ThresholdFilter(pixels, threshold,RGB){

    for (let i = 0; i < pixels.length; i += 4) {

        if(RGB == "r"){
            let rgb = pixels[i];
            let val = rgb > threshold ? 255 : 0;
            pixels[i] = val;
            pixels[i+1] = 0;
            pixels[i+2] = 0;
        }else 
            if(RGB == "g"){
                let rgb = pixels[i+1];
                let val = rgb > threshold ? 255 : 0;
                pixels[i] = 0;
                pixels[i+1] = val;
                pixels[i+2] = 0;
        }
        else
             if(RGB == "b"){
                let rgb = pixels[i+2];
                let val = rgb > threshold ? 255 : 0;
                pixels[i] = 0;
                pixels[i+1] = 0;
                pixels[i+2] = val;
        }
       
    }
}





/////////////////
function blurFilter(pixels, width, height, intensity = 5){
    // clamp intensity to odd numbers between 3 and 9
    let kSize = constrain(floor(intensity), 1, 9);
    if(kSize % 2 === 0) kSize++;  // must be odd

    let weight = 1 / (kSize * kSize);
    let matrix = [];
    for(let i = 0; i < kSize; i++){
        matrix[i] = [];
        for(let j = 0; j < kSize; j++){
            matrix[i][j] = weight;
        }
    }

    let result = new Uint8ClampedArray(pixels.length);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let index = (x + y * width) * 4;
            let c = convolution(x, y, matrix, kSize, pixels, width, height);
            result[index]   = c[0];
            result[index+1] = c[1];
            result[index+2] = c[2];
            result[index+3] = pixels[index+3];
        }
    }
    for (let i = 0; i < pixels.length; i++) pixels[i] = result[i];
}

function edgedetectionFilter(pixels, width, height,intensity = 3){
grayscaleFilter(pixels)
 let xMatrix = [
 [-1,-2,-1],
 [0,0,0],
 [1,2,1],
 
];
 let yMatrix = [
 [-1,0,1],
 [-2,0,2],
 [-1,0,1],
  
];



    let result = new Uint8ClampedArray(pixels.length);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {

            let index = (x + y * width) * 4;

            let cX = map(abs(convolution(x, y, xMatrix, 3, pixels, width, height)[0]),0,1020,0,255);
            let cY =  map(abs(convolution(x, y, yMatrix, 3, pixels, width, height)[0]),0,1020,0,255);

            var c = (cX+cY)*intensity//multiply by 5 to increase edge detection
            c = constrain(c,0,255)
            result[index] = c;
            result[index+1] = c; 
            result[index+2] = c;
            result[index+3] = pixels[index+3];
        }
    }

    // copy back
    for (let i = 0; i < pixels.length; i++){
        pixels[i] = result[i];
    }
}



function convolution(x, y, matrix, matrixSize, pixels, width, height){

    let totalR = 0;
    let totalG = 0;
    let totalB = 0;

    let offset = floor(matrixSize / 2);

    for(let i = 0; i < matrixSize; i++){
        for(let j = 0; j < matrixSize; j++){

            let xloc = constrain(x + i - offset, 0, width - 1);
            let yloc = constrain(y + j - offset, 0, height - 1);

            let index = (xloc + yloc * width) * 4;

            let weight = matrix[j][i];

            totalR += pixels[index] * weight;
            totalG += pixels[index+1] * weight;
            totalB += pixels[index+2] * weight;
        }
    }

    return [
        constrain(totalR, 0, 255),
        constrain(totalG, 0, 255),
        constrain(totalB, 0, 255)
    ];
}

function hsvFilter(pixels){

    for(let i = 0; i < pixels.length; i += 4){

        let r = pixels[i] / 255;
        let g = pixels[i+1] / 255;
        let b = pixels[i+2] / 255;

        let max = Math.max(r,g,b);
        let min = Math.min(r,g,b);
        // RGB to HSV
        let h = 0;

        if((max - min) != 0){
            if(max === r){
                h = 60 * (((g - b) / (max - min)) % 6);
            } else if(max === g){
                h = 60 * (((b - r) / (max - min)) + 2);
            } else {
                h = 60 * (((r - g) / (max - min)) + 4);
            }
        }

        if(h < 0){ 
            h += 360;
        }

        let s = max === 0 ? 0 : (max - min) / max;
        let v = max;

        
        s *= 5; // increase saturation
        s = constrain(s,0,1);

        //converting back to rgb
        let c = v * s;
        let x = c * (1 - Math.abs((h/60)%2 - 1));
        let m = v - c;

        let r1,g1,b1;

        if (h < 60)       [r1,g1,b1] = [c,x,0];
        else if (h < 120) [r1,g1,b1] = [x,c,0];
        else if (h < 180) [r1,g1,b1] = [0,c,x];
        else if (h < 240) [r1,g1,b1] = [0,x,c];
        else if (h < 300) [r1,g1,b1] = [x,0,c];
        else              [r1,g1,b1] = [c,0,x];

        pixels[i]   = (r1 + m) * 255;
        pixels[i+1] = (g1 + m) * 255;
        pixels[i+2] = (b1 + m) * 255;
    }
}


function convertToYCbCr(pixels) {
   
    for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i];
        let g = pixels[i+1];
        let b = pixels[i+2];

        // Standard YCbCr conversion formula
        let y  =  0.299 * r + 0.587 * g + 0.114 * b;
        let cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
        let cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
        //converting back to rgb
        pixels[i]   = y;  // Y channel
        pixels[i+1] = cb; // Cb channel
        pixels[i+2] = cr; // Cr channel
    }
   
}
function thresholdconvertToYCbCr(pixels, threshold) {
   
    for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i];
        let g = pixels[i+1];
        let b = pixels[i+2];

       
        // Standard YCbCr conversion formula
        let y  =  0.299 * r + 0.587 * g + 0.114 * b;
        let cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
        let cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
        
        let output = cr > threshold ? 255 : 0;

        pixels[i]   = output;  // Y channel
        pixels[i+1] = output; // Cb channel
        pixels[i+2] = output; // Cr channel
    } 
   
}
function thresholdhsvFilter(pixels, threshold){

    for(let i = 0; i < pixels.length; i += 4){

        let r = pixels[i] / 255;
        let g = pixels[i+1] / 255;
        let b = pixels[i+2] / 255;

        let max = Math.max(r,g,b);
        let min = Math.min(r,g,b);
        let delta = max - min;

        let h = 0;

        if(delta != 0){
            if(max === r){
                h = 60 * (((g - b)/delta) % 6);
            } else if(max === g){
                h = 60 * (((b - r)/delta) + 2);
            } else {
                h = 60 * (((r - g)/delta) + 4);
            }
        }

        if(h < 0) h += 360;

        // slider assumed 0–360
        let output = h > threshold ? 255 : 0;

        pixels[i]   = output;
        pixels[i+1] = output;
        pixels[i+2] = output;
    }
}

function getFaceBounds(face,relativeMode=true) {


    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    if(relativeMode == true){
        for (let keypoint of face.keypoints) {
            let mappedX = map(keypoint.x, 0, videoStream.width, 690, 690 + 200);
            let mappedY = map(keypoint.y, 0, videoStream.height, 100, 100 + 200);
            minX = min(minX,mappedX);
            minY = min(minY, mappedY);
            maxX = max(maxX, mappedX);
            maxY = max(maxY, mappedY);
         }
    }else{
        for (let keypoint of face.keypoints) {
            minX = min(minX, keypoint.x);
            minY = min(minY, keypoint.y);
            maxX = max(maxX, keypoint.x);
            maxY = max(maxY, keypoint.y);
    }



    }

    return { minX, minY, maxX, maxY };
}

//===========Invert=========
function applyFaceInvert(img,face) {
    
    const bounds = getFaceBounds(face,false);
    
    // Safety check
    if (!bounds) return;
    const { minX, minY, maxX, maxY } = bounds;
    img.loadPixels();
    
    // 3. Loop through the bounded 
    for (let y = floor(minY); y < floor(maxY); y++) {
        for (let x = floor(minX); x < floor(maxX); x++) {
            let index = (x + y * img.width) * 4;
            if (faceFilterMode ==1){
                img.pixels[index]     = 255 - img.pixels[index];     // R
                img.pixels[index + 1] = 255 - img.pixels[index + 1]; // G
                img.pixels[index + 2] = 255 - img.pixels[index + 2]; // B
            }
        }
    }

    img.updatePixels();
}


function applyFaceFiltur(face, filterMode, intensity = 0.5){

    const bounds = getFaceBounds(face, false);
    if (!bounds) return;
    const { minX, minY, maxX, maxY } = bounds;

    // crop just the face region into a temporary p5.Image
    let fw = floor(maxX) - floor(minX);
    let fh = floor(maxY) - floor(minY);
    let faceRegion = videoStream.get(floor(minX), floor(minY), fw, fh);

    //  run filter on that cropped image
    // some filtures expects (pixels, width, height)
    faceRegion.loadPixels();

      switch(filterMode){
        case 1:
            invertFilter(faceRegion.pixels);
            break;
        case 2:
             grayscaleFilter(faceRegion.pixels, intensity);
            break;
        case 3:
            redFilter(faceRegion.pixels);
            break;
        case 4:
            greenFilter(faceRegion.pixels);
            break;
        case 5:
            blueFilter(faceRegion.pixels);
            break;
        case 6:
              thresholdFilter(faceRegion.pixels, intensity * 255);
            break;
        case 7:
            blurFilter(faceRegion.pixels, fw, fh, intensity * 9);
            break;
        case 8:
            edgedetectionFilter(faceRegion.pixels, fw, fh,intensity * 6);
            break;
        case 9:
           hsvFilter(faceRegion.pixels, intensity * 10);  // scale to 0-10
            break;
        case 10:
            convertToYCbCr(faceRegion.pixels);
            break;
    }
    faceRegion.updatePixels();

    videoStream.loadPixels();
    for (let y = 0; y < fh; y++) {
        for (let x = 0; x < fw; x++) {

            // index in the small cropped image
            let cropIndex = (x + y * fw) * 4;

            // index in the full videoStream where this pixel lives
            let streamIndex = ((floor(minX) + x) + (floor(minY) + y) * videoStream.width) * 4;

            videoStream.pixels[streamIndex]     =  faceRegion.pixels[cropIndex];
            videoStream.pixels[streamIndex + 1] =  faceRegion.pixels[cropIndex + 1];
            videoStream.pixels[streamIndex + 2] =  faceRegion.pixels[cropIndex + 2];
        }
    }
    videoStream.updatePixels();
}


// ===== FACE HORIZONTAL FLIP  DYNAMIC=====
function applyFaceFlip(face) {

    const bounds = getFaceBounds(face, false);
    if (!bounds) return;
    const { minX, minY, maxX, maxY } = bounds;

    let fw = floor(maxX) - floor(minX);
    let fh = floor(maxY) - floor(minY);

    // take a clean copy of the face region before we start writing
    let faceRegion = videoStream.get(floor(minX), floor(minY), fw, fh);
    faceRegion.loadPixels();

    // write back into videoStream but mirror the x position
    videoStream.loadPixels();
    for (let y = 0; y < fh; y++) {
        for (let x = 0; x < fw; x++) {

            // source pixel from the clean copy (normal order)
            let cropIndex = (x + y * fw) * 4;

            // destination: mirror x so leftmost goes to rightmost
            let flippedX = fw - 1 - x;
            let streamIndex = ((floor(minX) + flippedX) + (floor(minY) + y) * videoStream.width) * 4;

            videoStream.pixels[streamIndex]     = faceRegion.pixels[cropIndex];
            videoStream.pixels[streamIndex + 1] = faceRegion.pixels[cropIndex + 1];
            videoStream.pixels[streamIndex + 2] = faceRegion.pixels[cropIndex + 2];
        }
    }
    videoStream.updatePixels();
}


// ===== STATIC FACE HORIZONTAL FLIP =====
function applyStaticFaceFlip(img, face) {

    const bounds = getFaceBounds(face, false);
    if (!bounds) return;
    const { minX, minY, maxX, maxY } = bounds;

    let fw = floor(maxX) - floor(minX);
    let fh = floor(maxY) - floor(minY);

    // same as dynamic version
    let faceRegion = img.get(floor(minX), floor(minY), fw, fh);
    faceRegion.loadPixels();

    img.loadPixels();
    for (let y = 0; y < fh; y++) {
        for (let x = 0; x < fw; x++) {
            let cropIndex   = (x + y * fw) * 4;
            let flippedX    = fw - 1 - x;
            let imgIndex    = ((floor(minX) + flippedX) + (floor(minY) + y) * img.width) * 4;
            img.pixels[imgIndex]     = faceRegion.pixels[cropIndex];
            img.pixels[imgIndex + 1] = faceRegion.pixels[cropIndex + 1];
            img.pixels[imgIndex + 2] = faceRegion.pixels[cropIndex + 2];
        }
    }
    img.updatePixels();
}



// ===== FACE PIXELATES =====

// Draws directly onto the canvas using circle() so cannot use applyFaceFiltur wrapper
function applyFacePixelate(face) {

    const bounds = getFaceBounds(face, false);
    if (!bounds) return;
    const { minX, minY, maxX, maxY } = bounds;

    let fw = floor(maxX) - floor(minX);
    let fh = floor(maxY) - floor(minY);

    // greyscale the face region first
    let faceRegion = videoStream.get(floor(minX), floor(minY), fw, fh);
    faceRegion.loadPixels();
    grayscaleFilter(faceRegion.pixels);
    faceRegion.updatePixels();

    // draw circles into offscreen buffer
    let pg = createGraphics(fw, fh);
    pg.noStroke();
    pg.background(0);

    let blockSize = 10;

    for (let by = 0; by < fh; by += blockSize) {
        for (let bx = 0; bx < fw; bx += blockSize) {

            let total = 0, count = 0;
            for (let dy = 0; dy < blockSize; dy++) {
                for (let dx = 0; dx < blockSize; dx++) {
                    let px = constrain(bx + dx, 0, fw - 1);
                    let py = constrain(by + dy, 0, fh - 1);
                    let idx = (px + py * fw) * 4;
                    total += faceRegion.pixels[idx];
                    count++;
                }
            }
            let avg = total / count;

            pg.fill(avg);
            pg.circle(bx + blockSize / 2, by + blockSize / 2, blockSize);
        }
    }

    // copy buffer pixels back into videoStream at the correct position
    let pgImg = pg.get();
    pgImg.loadPixels();
    videoStream.loadPixels();

    for (let y = 0; y < fh; y++) {
        for (let x = 0; x < fw; x++) {
            let pgIdx      = (x + y * fw) * 4;
            let streamIdx  = ((floor(minX) + x) + (floor(minY) + y) * videoStream.width) * 4;
            videoStream.pixels[streamIdx]     = pgImg.pixels[pgIdx];
            videoStream.pixels[streamIdx + 1] = pgImg.pixels[pgIdx + 1];
            videoStream.pixels[streamIdx + 2] = pgImg.pixels[pgIdx + 2];
        }
    }
    videoStream.updatePixels();
    pg.remove();
}


function applyStaticFacePixelate(img, face) {

    const bounds = getFaceBounds(face, false);
    if (!bounds) return;
    const { minX, minY, maxX, maxY } = bounds;

    let fw = floor(maxX) - floor(minX);
    let fh = floor(maxY) - floor(minY);

    // greyscale the face region first
    let faceRegion = img.get(floor(minX), floor(minY), fw, fh);
    faceRegion.loadPixels();
    grayscaleFilter(faceRegion.pixels);
    faceRegion.updatePixels();

    //createGraphics(fw, fh) creates a hidden canvas in memory, exactly the same size as the face region
    //this is to simulate a new graphics buffer so the circles arent drawn over by the looping draw
    let pixelGraphic = createGraphics(fw, fh);
    pixelGraphic.noStroke();
    pixelGraphic.background(0);

    let blockSize = 10;

    // draw circles into the buffer (coordinates are local to the buffer)
    for (let by = 0; by < fh; by += blockSize) {
        for (let bx = 0; bx < fw; bx += blockSize) {

            let total = 0, count = 0;
            for (let dy = 0; dy < blockSize; dy++) {
                for (let dx = 0; dx < blockSize; dx++) {
                    let px = constrain(bx + dx, 0, fw - 1);
                    let py = constrain(by + dy, 0, fh - 1);
                    let idx = (px + py * fw) * 4;
                    total += faceRegion.pixels[idx];
                    count++;
                }
            }
            let avg = total / count;

            pixelGraphic.fill(avg);
            // coordinates are relative to the buffer so no offset needed
            pixelGraphic.circle(bx + blockSize / 2, by + blockSize / 2, blockSize);
        }
    }

    // copy the buffer pixels back into the correct region of img
    let pgImg = pixelGraphic.get();
    pgImg.loadPixels();
    img.loadPixels();

    for (let y = 0; y < fh; y++) {
        for (let x = 0; x < fw; x++) {
            let pgIdx  = (x + y * fw) * 4;
            let imgIdx = ((floor(minX) + x) + (floor(minY) + y) * img.width) * 4;
            img.pixels[imgIdx]     = pgImg.pixels[pgIdx];
            img.pixels[imgIdx + 1] = pgImg.pixels[pgIdx + 1];
            img.pixels[imgIdx + 2] = pgImg.pixels[pgIdx + 2];
        }
    }
    img.updatePixels();
    pixelGraphic.remove(); // clean up the buffer
}