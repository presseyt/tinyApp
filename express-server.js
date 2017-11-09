const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}))
   .use(cookieParser());

const PORT = process.env.PORT || 8080;


const urlDatabase = {
  'asdf': 'http://google.ca',
  'sdfg': 'http://www.lighthouselabs.ca'
};

function generateRandomString(){
  var charSet = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let output = "";
  for(let i = 0; i < 6; i++){
    let rnd = Math.floor(Math.random() * charSet.length);
    output += charSet[rnd];
  }
  return output;
}


app.set("view engine", "ejs");

app.get("/urls/new", (req,res) => {
  let templateVars = {username: req.cookies.username};
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  // debug statement to see POST parameters
  let shortString = generateRandomString();
  urlDatabase[shortString] = req.body.longURL;
  res.redirect(`http://localhost:8080/urls/${shortString}`);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`http://localhost:8080/urls`);
});

app.post("/urls/:id/modify", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect(`http://localhost:8080/urls`);
});

app.post("/login", (req,res) => {
  res.cookie('username', req.body.username);
  res.redirect(`http://localhost:8080/urls`);
});

app.get("/urls", (request,response) => {
  console.log('Cookies: ', request.cookies);

  let templateVars = {urls: urlDatabase, username: request.cookies.username};
  response.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                           urls: urlDatabase,
                       username: req.params.username};

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req,res)=>{
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

console.log(`Listening on port ${PORT}!`);
app.listen(PORT);




