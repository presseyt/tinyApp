const express = require('express');
const app = express();
var PORT = process.env.PORT || 8080;

var urlDatabase = {
  'asdf': 'http://google.ca',
  'sdfg': 'http://www.lighthouselabs.ca'
};

app.set("view engine", "ejs");

app.get("/urls", (request,response) => {
  let templateVars = {urls: urlDatabase};
  response.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase};
  res.render("urls_show", templateVars);
});

console.log(`Listening on port ${PORT}!`);
app.listen(PORT);