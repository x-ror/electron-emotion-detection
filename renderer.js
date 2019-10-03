const faceConfig = new FaceEmotionalDetection({ faceDetector: 'tiny_face_detector' });
const videoEl = document.querySelector('#inputVideo')
const canvas = document.querySelector('#overlay')
const container = document.querySelector('.video-container')

const locale = {
    angry: 'angry [злість]',
    disgusted: 'disgusted [відчуває огиду]',
    fearful: 'fearful [боязкий]',
    happy: 'happy [щасливий]',
    neutral: 'neutral [нейтральний, байдужий]',
    sad: 'sad [нахмурений]',
    surprised: 'surprised [здивований]',
}

async function onPlay() {

    if (videoEl.paused || videoEl.ended || !faceConfig.isLoaded)
        return setTimeout(() => onPlay())

    const result = await faceapi
        .detectAllFaces(videoEl, faceConfig.faceDetectorConfig)
        // .withFaceLandmarks()
        // .withFaceDescriptors()
        .withFaceExpressions()
        .withAgeAndGender()

    if (result) {
        const dims = faceapi.matchDimensions(canvas, videoEl, true)
        const resizedResults = faceapi.resizeResults(result, dims)

        resizedResults.forEach((bestMatch, i) => {
            const {
                expressions,
                age,
                gender,
                detection: { box }
            } = bestMatch;
            let maxKey;
            let minValue = 0;
            for (const [key, value] of Object.entries(expressions)) {
                if (minValue < value) {
                    maxKey = key;
                    minValue = value;
                }
            }

            const text = [
                locale[maxKey] + '(' + (Math.round(10000 * expressions[maxKey]) / 10000) + ')',
                '[' + Math.round(age) + ', ' + gender + ']'
            ]
            const drawOptions = {
                anchorPosition: 'TOP_LEFT',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                fontSize: 12
            }

            const anchor = { x: box.bottomLeft._x, y: box.bottomLeft._y };
            let drawBox = new faceapi.draw.DrawTextField(text, anchor, drawOptions);
            drawBox.draw(canvas);
            drawBox = new faceapi.draw.DrawBox(box);
            drawBox.draw(canvas);
        })
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
    resizeCanvas()
    onPlay()
}
run()

window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    container.height = window.innerHeight;
    container.width = window.innerWidth;
}