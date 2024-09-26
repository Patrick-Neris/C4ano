const express = require("express");
const path = require("path"); // Importar path para construir o caminho do arquivo
const app = express();

app.use(express.static("./static"));

module.exports = app;
