// the link to your model provided by Teachable Machine export panel
const URL = `../../modelos/Roupas/`;

let model, webcam, labelContainer, maxPredictions;
let date = new Date(2000);
let lastSpoken = "";
let page = document.getElementById("page").innerText;
console.log(page);

document.addEventListener("DOMContentLoaded", () => {
  document.title = `Luminus - Reconhecendo ${page}`;
  let ut = new SpeechSynthesisUtterance(
    "Você está na aba de identificação de produtos, para identificar Restaurantes, clique na parte inferior esquerda da tela, para identificar lixeiras, clique na parte inferior direita da tela."
  );
  ut.lang = "pt-BR";
  ut.rate = 1;
  window.speechSynthesis.speak(ut);
  init();
});

function redirect(page) {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  window.location.href = `${page}`;
}

// Load the image model and setup the webcam
async function init() {
  document.getElementById("label-container").style.paddingTop = "5vh";
  document.getElementById("label-container").style.paddingBottom = "5vh";
  document.getElementById("buttons-container").style.height = "40vh";

  var divWrapper = document.querySelector(".wrapper");
  divWrapper.style.padding = "0";
  divWrapper.style.paddingBottom = "0";
  divWrapper.style.marginTop = "5vh";

  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // Carrega o modelo e os metadados
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Configura a webcam
  const flip = false; // whether to flip the webcam
  if (window.innerWidth > 1000) {
    // Verificando se é um notebook
    webcam = new tmImage.Webcam(
      0.5 * window.innerWidth,
      0.7 * window.innerHeight,
      flip
    );
  } else {
    // Se for um celular
    webcam = new tmImage.Webcam(
      0.9 * window.innerWidth,
      0.5 * window.innerHeight,
      flip
    ); // width, height, flip
  }
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
    let probability = prediction[i].probability.toFixed(2); // Fix the percentage to 2 decimal places
    if (probability > 1) probability = 1; // Ensure that the probability doesn't exceed 100%

    const classPrediction = `${prediction[i].className}: ${(
      probability * 100
    ).toFixed(0)}%`;

    // Verifica se a probabilidade excede 95% para aplicar um estilo especial
    if (probability >= 0.95) {
      labelContainer.childNodes[
        i
      ].innerHTML = `<span class="highlight">${classPrediction}</span>`;
      if (
        new Date().getTime() - date.getTime() >= 5000 &&
        prediction[i].className !== lastSpoken
      ) {
        date = new Date();
        if (prediction[i].className !== "Outros") {
          ut = new SpeechSynthesisUtterance(
            `Estou vendo ${prediction[i].className}`
          );
          ut.lang = "pt-BR";
          ut.rate = 1;
          window.speechSynthesis.speak(ut);
        }
        lastSpoken = prediction[i].className;
      }
    } else {
      labelContainer.childNodes[i].innerHTML = classPrediction;
    }
  }
}
