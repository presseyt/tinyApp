const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

var PORT = process.env.PORT || 8080;


var urlDatabase = {
  'asdf': 'http://google.ca',
  'sdfg': 'http://www.lighthouselabs.ca'
};

function generateRandomString(){
  let output = "";
  for(let i = 0; i < 6; i++){
    let rnd = Math.floor(Math.random() * 36);
    rnd = rnd < 10 ? rnd + 49 : rnd + 87;
    output += String.fromCharCode(rnd);
  }
  return output;
}

console.log(generateRandomString(), generateRandomString(), generateRandomString());

app.set("view engine", "ejs");

app.get("/urls/new", (req,res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls", (request,response) => {
  let templateVars = {urls: urlDatabase};
  response.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase};
  res.render("urls_show", templateVars);
});

console.log(`Listening on port ${PORT}!`);
app.listen(PORT);