const faceConfig = new FaceEmotionalDetection({ faceDetector: 'tiny_face_detector' });
const videoEl = document.querySelector('#inputVideo')
const canvas = document.querySelector('#overlay')

async function onPlay() {

    if (videoEl.paused || videoEl.ended || !faceConfig.isLoaded)
        return setTimeout(() => onPlay())

    const result = await faceapi
        .detectAllFaces(videoEl, faceConfig.faceDetectorConfig)
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withFaceExpressions()

    if (result) {
        const dims = faceapi.matchDimensions(canvas, videoEl, true)
        const resizedResults = faceapi.resizeResults(result, dims)
        const minConfidence = 0.01
        faceapi.draw.drawDetections(canvas, resizedResults)
        faceapi.draw.drawFaceExpressions(canvas, resizedResults, minConfidence)
    }

    setTimeout(() => onPlay())
}


async function run() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
    faceapi.env.monkeyPatch({
        Canvas: HTMLCanvasElement,
        Image: HTMLImageElement,
        ImageData: ImageData,
        Video: HTMLVideoElement,
        createCanvasElement: () => document.createElement('canvas'),
        createImageElement: () => document.createElement('img')
    })
    videoEl.srcObject = stream
    videoEl.play();
    onPlay()
}
run()