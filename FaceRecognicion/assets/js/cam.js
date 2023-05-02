const cam = document.getElementById("cam");
const music = document.getElementById("myAudio");

music.volume = 0.1;

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
  faceapi.nets.tinyFaceDetector.loadFromUri("./assets/lib/face-api/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./assets/lib/face-api/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("./assets/lib/face-api/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("./assets/lib/face-api/models"),
  faceapi.nets.ageGenderNet.loadFromUri("./assets/lib/face-api/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("./assets/lib/face-api/models"),
]).then(startVideo);

cam.addEventListener("play", async () => {
  const canvas = faceapi.createCanvasFromMedia(cam);
  const canvasSize = {
    width: cam.width,
    height: cam.height,
  };
  faceapi.matchDimensions(canvas, canvasSize);
  document.body.appendChild(canvas);
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
          `${parseInt(age, 10)} anos`,
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

    setTimeout(() => {
      const avarageAges = parseInt(totalAges / totalDetections, 10);
        showInfo("showTotal", `Total de pessoas: ${totalDetections}`);
        showInfo("showTotalAges", `Total das idades: ${totalDetections > 1 ? parseInt(totalAges) : ""}`);
        showInfo("showAvarage", `Média das Idades: ${isNaN(avarageAges) ? "" : avarageAges}`);
        showInfo("showMale", `Total Masculinos: ${totalMale || ""}`);
        showInfo("showFemale", `Total Feminino: ${totalFemale || ""}`);


      if (avarageAges > 30) {
        music.play();
      }
    }, 1750);
  }, 100);
});