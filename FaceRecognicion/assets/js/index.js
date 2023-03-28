const cam = document.getElementById("cam");

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
      new faceapi.draw.DrawTextField(
        [
          `${parseInt(age, 10)} anos`,
          `${gender}  (${parseInt(genderProbability * 100, 10)}%)`,
        ],

        detection.detection.box.topRight
      ).draw(canvas);
    });

    // sidebar info
    const show = (id, content) => {
      document.getElementById(id).innerHTML = content;
    };

    const totalDetections = resizedDetections.length;
    show("showTotal", "Total de pessoas: " + totalDetections);

    const totalAges = resizedDetections.reduce((accumulator, curValue) => {
      return accumulator + curValue.age;
    }, 0);

    if (totalDetections > 1) {
      show("showTotalAges", "Total das idades: " + parseInt(totalAges));
    } else {
      show("showTotalAges", "...");
    }

    const avarageAges = parseInt(totalAges / totalDetections, 10);
    if (!isNaN(avarageAges)) {
      show("showAvarage", "Média das Idades: " + avarageAges);
    } else {
      show("showAvarage", "...");
    }

    let totalMale = 0;
    let totalFemale = 0;

    resizedDetections.forEach((curValue) => {
      if (curValue.gender === "male") {
        totalMale++;
      } else if (curValue.gender === "female") {
        totalFemale++;
      }
    });

    if (totalMale > 0) {
      show("showMale", `Total Masculinos: ${totalMale}`);
      show("showFemale", "...");
    } else if (totalFemale > 0) {
      show("showFemale", `Total Feminino: ${totalFemale}`);
      show("showMale", "...");
    } else {
      show("showMale", "...");
      show("showFemale", "...");
    }
  }, 1750);
});

document.getElementById("navbar").style.width = "250px";
