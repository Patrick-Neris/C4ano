const express = require("express");
const path = require("path"); // Importar path para construir o caminho do arquivo
const app = express();

app.use(express.static("./static"));

// Rota padrão para redirecionar para o predict-with-tfjs.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "predict-with-tfjs.html"));
});

module.exports = app;
