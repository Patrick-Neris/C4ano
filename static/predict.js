// the link to your model provided by Teachable Machine export panel
const URL = `modelos/Restaurantes/`;

let model, webcam, labelContainer, maxPredictions;
let date = new Date();
let lastSpoken = "";

document.addEventListener("DOMContentLoaded", () => {});

function redirect(page) {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  window.location.href = `${page}`;
}

function redirectMenu(rest) {
  const links = {
    Churros:
      "https://drive.google.com/file/d/1_vekwh-DGQSdnqMyg3_DG8FfSyzbO7Pw/view?usp=sharing",
    "Cinquentão Hamburguer":
      "https://drive.google.com/file/d/1ODbYj5r2SzRahw9Rkn1BfkIhRfmMlWKU/view?usp=sharing",
    Crepise:
      "https://drive.google.com/file/d/1-ShiioVX6glPsxY3xobBTgY0RbP2PGsC/view?usp=sharing",
    "Comida Mexicana":
      "https://drive.google.com/file/d/1NkHMsifBbXOybuh9u8QuWjEq6FskfqE4/view?usp=sharing",
    "J Dog":
      "https://drive.google.com/file/d/10tjdJ_EyhqMr2YQAd3_joFXwd6IuwMWw/view?usp=sharing",
    MilkShake:
      "https://drive.google.com/file/d/129NeMKrYQuFmZ8F6li64nOLPXcHyoU6h/view?usp=sharing",
    Mygati:
      "https://drive.google.com/file/d/1mAAVJtRYoRey_nob2WsfSW_HCwL9smzU/view?usp=sharing",
    Pipoca:
      "https://drive.google.com/file/d/1LdM2lVZ0917yw5D4elvFhgix2SbUQ8v_/view?usp=sharing",
    Pizza:
      "https://drive.google.com/file/d/1Vu3Fjc1bqhZItP7xdZpmx8g8oaxiavi5/view?usp=sharing",
    "Veronas Grill":
      "https://drive.google.com/file/d/1PFyMD6yWreL7aWM6_v77y71G14DdbPNm/view?usp=sharing",
  };
  var btn = document.getElementById("menu-btn");
  if (btn) {
    btn.onclick = () => {
      console.log(links[rest]);
      window.location.href = links[rest];
    };
  }
  var divWebcam = document.getElementById("webcam-container");
  divWebcam.style.display = "none";
  var divMenu = document.getElementById("menu-redirect-button");
  divMenu.style.display = "block";
}

// Load the image model and setup the webcam
async function init() {
  let ut = new SpeechSynthesisUtterance(
    "Bem vindo ao site da Luminus, você está na aba de identificação de restaurantes, para identificar lixeiras, clique na parte inferior esquerda da tela, para identificar produtos, clique na parte inferior direita da tela."
  );
  ut.lang = "pt-BR";
  ut.rate = 1.5;
  window.speechSynthesis.speak(ut);
  // Esconde o botão "Start" quando a função init é chamada
  document.getElementById("start-btn").style.display = "none";
  document.getElementById("label-container").style.paddingTop = "5vh";
  document.getElementById("label-container").style.paddingBottom = "5vh";

  var divButtons = document.querySelectorAll(".redirect-btn");
  divButtons.forEach((btn) => {
    btn.style.display = "block";
  });
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
  var divWebcam = document.getElementById("webcam-container");
  var divMenu = document.getElementById("menu-redirect-button");
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
          if (prediction[i].className !== "Cadeira") {
            ut = new SpeechSynthesisUtterance(
              `Estou vendo ${prediction[i].className}, se desejar abrir o cardápio, toque na parte superior da tela`
            );
            ut.lang = "pt-BR";
            ut.rate = 1.5;
            window.speechSynthesis.speak(ut);
            redirectMenu(prediction[i].className);
          } else {
            ut = new SpeechSynthesisUtterance(
              `Estou vendo ${prediction[i].className}`
            );
            ut.lang = "pt-BR";
            ut.rate = 2;
            window.speechSynthesis.speak(ut);
          }
        } else {
          divMenu.style.display = "none";
          divWebcam.style.display = "flex";
        }
        lastSpoken = prediction[i].className;
      }
    } else {
      labelContainer.childNodes[i].innerHTML = classPrediction;
    }
  }
}
