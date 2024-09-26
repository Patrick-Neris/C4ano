const express = require("express");
const path = require("path"); // Importar path para construir o caminho do arquivo
const app = express();

app.use(express.static("./static"));

app.get("/", (req, res) => {
  console.log("Redirecionou");
  res.sendFile(path.join(__dirname, "static", "predict-with-tfjs.html"));
});

module.exports = app;
