const cam = document.getElementById("cam");
const music = document.getElementById("myAudio");
const video = document.getElementById("hero")
music.volume = 0.25;

const startVideo = () => {
  navigator.mediaDevices.enumerateDevices().then((devices) => {
    if (Array.isArray(devices)) {
      devices.forEach((device) => {
        if (device.kind === "videoinput") {
          navigator.getUserMedia(
            {
              video: {
                deviceId: device.deviceId,
              },
            },
            (stream) => (cam.srcObject = stream),
            (error) => console.error(error)
          );
        }
      });
    }
  });
};

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("../assets/lib/face-api/models/tiny_face_detector_model-weights_manifest.json"),
  faceapi.nets.faceLandmark68Net.loadFromUri("../assets/lib/face-api/models/face_landmark_68_model-weights_manifest.json"),
  faceapi.nets.faceRecognitionNet.loadFromUri("../assets/lib/face-api/models/face_recognition_model-weights_manifest.json"),
  faceapi.nets.faceExpressionNet.loadFromUri("../assets/lib/face-api/models/face_expression_model-weights_manifest.json"),
  faceapi.nets.ageGenderNet.loadFromUri("../assets/lib/face-api/models/age_gender_model-weights_manifest.json"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("../assets/lib/face-api/models/ssd_mobilenetv1_model-weights_manifest.json"),
]).then(startVideo);

let avarageAges = 0;
cam.addEventListener("play", async () => {
  const canvas = faceapi.createCanvasFromMedia(cam);
  const canvasSize = {
    width: cam.width,
    height: cam.height,
  };
  faceapi.matchDimensions(canvas, canvasSize);
  video.appendChild(canvas);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(cam, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    const resizedDetections = faceapi.resizeResults(detections, canvasSize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    resizedDetections.forEach((detection) => {
      const { age, gender, genderProbability } = detection;
      const textField = new faceapi.draw.DrawTextField(
        [
          `${parseInt(age, 10)} years`,
          `${gender}  (${parseInt(genderProbability * 100, 10)}%)`,
        ],
        detection.detection.box.topRight
      );
      textField.draw(canvas);
    });

    // sidebar info
    const show = (id, content) => {
      document.getElementById(id).innerHTML = content;
    };

    const totalDetections = resizedDetections.length;
    let totalAges = 0;
    let totalMale = 0;
    let totalFemale = 0;

    resizedDetections.forEach((detection) => {
      totalAges += detection.age;
      if (detection.gender === "male") {
        totalMale++;
      } else if (detection.gender === "female") {
        totalFemale++;
      }
    });

    const showInfo = (id, content) => {
      document.getElementById(id).innerHTML = content;
    };

    avarageAges = parseInt(totalAges / totalDetections, 10);

    if(avarageAges !== 0) {
      if (avarageAges < 23) {
        const source = document.createElement("source");
        source.src = "/assets/music/song4.mp3"
        music.appendChild(source);
        music.play();
        music.addEventListener('ended', function() {
        music.pause();
        source.remove();
        });
      } else if(avarageAges < 33){
        const source = document.createElement("source");
        source.src = "/assets/music/song3.mp3"
        music.appendChild(source);
        music.play();
        music.addEventListener('ended', function() {
        music.pause();
        source.remove();
       });
      } else if(avarageAges < 60){
        const source = document.createElement("source");
        source.src = "/assets/music/song5.mp3"
        music.appendChild(source);
        music.play();
        music.addEventListener('ended', function() {
        music.pause();
        source.remove();
       });
    }
  }
  
    setTimeout(() => {
        showInfo("showTotal", `Total of Detections: ${totalDetections}`);
        showInfo("showTotalAges", `Total of Ages: ${totalDetections > 1 ? parseInt(totalAges) : ""}`);
        showInfo("showAvarage", `Average of Ages: ${isNaN(avarageAges) ? "" : avarageAges}`);
        showInfo("showMale", `Total Male: ${totalMale || ""}`);
        showInfo("showFemale", `Total Female: ${totalFemale || ""}`);

    }, 1750);
  }, 100);
});