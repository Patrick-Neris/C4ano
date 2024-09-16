// the link to your model provided by Teachable Machine export panel
const URL = `tm-my-image-model/`;

let model, webcam, labelContainer, maxPredictions;
let date = new Date(5000);
let lastSpoken = "";

// Load the image model and setup the webcam
async function init() {
  // Esconde o botão "Start" quando a função init é chamada
  document.getElementById("start-btn").style.display = "none";

  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // Carrega o modelo e os metadados
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Configura a webcam
  const flip = false; // whether to flip the webcam
  webcam = new tmImage.Webcam(400, 400, flip); // width, height, flip
  await webcam.setup({ facingMode: "environment" }); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);

  // Adiciona elementos ao DOM
  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    // Cria os contêineres de rótulo
    labelContainer.appendChild(document.createElement("div"));
  }
}

async function loop() {
  webcam.update(); // Atualiza o quadro da webcam
  await predict();
  window.requestAnimationFrame(loop);
}

// Executa a imagem da webcam através do modelo de imagem
async function predict() {
  const prediction = await model.predict(webcam.canvas);
  for (let i = 0; i < maxPredictions; i++) {
    let probability = prediction[i].probability.toFixed(2); // Fixar a porcentagem com 2 casas decimais
    if (probability > 1) probability = 1; // Garante que a probabilidade não exceda 100%

    const classPrediction = `${prediction[i].className}: ${(probability * 100).toFixed(0)}%`;

    // Verifica se a probabilidade excede 85% para aplicar um estilo especial
    if (probability >= 0.85) {
      labelContainer.childNodes[i].innerHTML = `<span class="highlight">${classPrediction}</span>`;
      
      // Adiciona um intervalo de 2 segundos antes de falar novamente
      if (new Date().getTime() - date.getTime() >= 2000 && prediction[i].className !== lastSpoken) {
        date = new Date();
        if (prediction[i].className !== "Outros") {
          responsiveVoice.speak(
            `Estou vendo ${prediction[i].className}`,
            "Brazilian Portuguese Female",
            {
              rate: 1.1,
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
