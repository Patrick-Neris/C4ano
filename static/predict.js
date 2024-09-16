// the link to your model provided by Teachable Machine export panel
const URL = `tm-my-image-model/`;

let model, webcam, labelContainer, maxPredictions;
let date = new Date(2000);
let lastSpoken = "";

// Load the image model and setup the webcam
async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // load the model and metadata
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Convenience function to setup a webcam
  const flip = false; // whether to flip the webcam
  webcam = new tmImage.Webcam(400, 400, flip); // width, height, flip
  await webcam.setup({ facingMode: "environment" }); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);

  // append elements to the DOM
  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    // and class labels
    labelContainer.appendChild(document.createElement("div"));
  }
}

async function loop() {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
  const prediction = await model.predict(webcam.canvas);
  for (let i = 0; i < maxPredictions; i++) {
    let probability = prediction[i].probability.toFixed(2); // Fix the percentage to 2 decimal places
    if (probability > 1) probability = 1; // Ensure that the probability doesn't exceed 100%

    const classPrediction = `${prediction[i].className}: ${(
      probability * 100
    ).toFixed(0)}%`;

    // Check if probability exceeds 85% to apply a special style
    if (probability >= 0.85) {
      labelContainer.childNodes[
        i
      ].innerHTML = `<span class="highlight">${classPrediction}</span>`;
      if (
        new Date().getTime() - date.getTime() >= 2000 &&
        prediction[i].className !== lastSpoken
      ) {
        date = new Date();
        if (prediction[i].className !== "Outros") {
          responsiveVoice.speak(
            `Estou vendo ${prediction[i].className}`,
            "Brazilian Portuguese Female",
            {
              rate: 1.5,
            }
          );
        }
        lastSpoken = prediction[i].className;
      }
    } else {
      labelContainer.childNodes[i].innerHTML = classPrediction;
    }
  }
}
