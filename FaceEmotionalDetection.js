const faceDetectors = {
  SSD_MOBILENETV1: {
    minConfidence: .5
  },
  TINY_FACE_DETECTOR: {
    inputSize: 512,
    scoreThreshold: 0.5,
  },
  MTCNN: {
    minFaceSize: 20
  }
}
const MODEL_URL = './weights';
class FaceEmotionalDetection {
  constructor({ faceDetector }) {
    switch (faceDetector) {
      case 'ssd_mobilenetv1':
        this._faceDetectorConfig = new faceapi.SsdMobilenetv1Options({ ...faceDetectors.SSD_MOBILENETV1 })
        this._faceDetector = faceapi.nets.ssdMobilenetv1;
        break
      case 'mtcnn':
        this._faceDetectorConfig = new faceapi.MtcnnOptions({ ...faceDetectors.MTCNN })
        this._faceDetector = faceapi.nets.mtcnn;
        break
      case 'tiny_face_detector':
        this._faceDetectorConfig = new faceapi.TinyFaceDetectorOptions({ ...faceDetectors.TINY_FACE_DETECTOR })
        this._faceDetector = faceapi.nets.tinyFaceDetector;
    }
    this._faceDetector.load(MODEL_URL)

    this.loadModels()
  }

  get faceDetectorConfig() {
    return this._faceDetectorConfig;
  }

  get faceDetector() {
    return this._faceDetector
  }

  get isLoaded() {
    return !!this._faceDetector.params
  }

  async loadModels() {
    await faceapi.loadFaceLandmarkModel(MODEL_URL)
    await faceapi.loadFaceRecognitionModel(MODEL_URL)
    await faceapi.loadFaceExpressionModel(MODEL_URL)
  }
}