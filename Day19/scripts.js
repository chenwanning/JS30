const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(localMediaStream => {
            console.log(localMediaStream);

            /*objectURL = URL.createObjectURL(object);
            Parameters object:
            A File, Blob, or MediaStream object to create an object URL for.
            */
            video.src = window.URL.createObjectURL(localMediaStream);
            video.play();
        })
        .catch(err => {
            console.error(`OH NO!!!`, err);
        });
}

function paintToCanvas() {
    /* HTMLVideoElement.width
    Is a DOMString that reflects the width HTML attribute, 
    which specifies the width of the display area, in CSS pixels.
    */
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;


    /*沒有return也可以運作，但如果想要stop this from painting,可以呼叫clearInterval()
    The ID value returned by setInterval()
    is used as the parameter for the clearInterval() method.
    */
    return setInterval(() => {
        //The drawImage() method draws an image, canvas, or video onto the canvas.
        ctx.drawImage(video, 0, 0, width, height);
        // take the pixels out

        /*
            The getImageData() method returns an ImageData object that copies the pixel data 
            for the specified rectangle on a canvas.
        	context.getImageData(x,y,width,height);
            x	The x coordinate (in pixels) of the upper-left corner to start copy from
            width	The width of the rectangular area you will copy
        */
        let pixels = ctx.getImageData(0, 0, width, height);
        // console.log(pixels);
        /* 
        跑出一堆pixels，可在console使用debugger;
        With a debugger, you can also set breakpoints 
        (places where code execution can be stopped),
         and examine variables while the code is executing.
        */



        // mess with them
        // pixels = redEffect(pixels);

        // pixels = rgbSplit(pixels);
        // ctx.globalAlpha = 0.8;
        // console.log(pixels);
        pixels = greenScreen(pixels);
        // put them back
        ctx.putImageData(pixels, 0, 0);
    }, 16);
}

function takePhoto() {
    // played the sound
    snap.currentTime = 0;
    snap.play();

    // take the data out of the canvas
    /*canvas.toDataURL(type, encoderOptions);
     type: Optional,A DOMString indicating the image format.
     The default format type is image/png.
    */
    const data = canvas.toDataURL('image/jpeg');
    // console.log(data);
    const link = document.createElement('a');
    link.href = data;
    //element.setAttribute(attributename, attributevalue)
    link.setAttribute('download', 'handsome');
    // console.log(link);
    link.innerHTML = `<img src="${data}" alt="Handsome Man" />`;
    strip.insertBefore(link, strip.firsChild);
}

function redEffect(pixels) {
    for (let i = 0; i < pixels.data.length; i += 4) {
        pixels.data[i + 0] = pixels.data[i + 0] + 200; // RED
        pixels.data[i + 1] = pixels.data[i + 1] - 50; // GREEN
        pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // Blue
    }
    return pixels;
}


//把顏色移到旁邊去?
function rgbSplit(pixels) {
    for (let i = 0; i < pixels.data.length; i += 4) {
        pixels.data[i - 150] = pixels.data[i + 0]; // RED
        pixels.data[i + 500] = pixels.data[i + 1]; // GREEN
        pixels.data[i - 550] = pixels.data[i + 2]; // Blue
    }
    return pixels;
}

function greenScreen(pixels) {
    const levels = {};

    document.querySelectorAll('.rgb input').forEach((input) => {
        levels[input.name] = input.value;
    });
    // console.log(levels);

    for (i = 0; i < pixels.data.length; i = i + 4) {
        red = pixels.data[i + 0];
        green = pixels.data[i + 1];
        blue = pixels.data[i + 2];
        alpha = pixels.data[i + 3];

        //顏色若落在這個範圍就把顏色拿走，alphe=0,注意這個顏色要這三個範圍都符合喔!因為它是用&&
        if (red >= levels.rmin
            && green >= levels.gmin
            && blue >= levels.bmin
            && red <= levels.rmax
            && green <= levels.gmax
            && blue <= levels.bmax) {
            // take it out!
            //alpha設為0的話會變成透明的(transparent)
            pixels.data[i + 3] = 0;
        }
    }

    return pixels;
}

getVideo();
/*The canplay event occurs when the browser can start playing the specified audio/video 
(when it has buffered(緩衝器) enough to begin).
*/
video.addEventListener('canplay', paintToCanvas);