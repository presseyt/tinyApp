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

const users = {
  "tim": {
    id: "tim",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2": {
    id: "user2",
    email: "user2@emample.com",
    password: "diswasher-funk"
  }
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

app.get("/urls", (req,res) => {
  let templateVars = {urls: urlDatabase, username: req.cookies.username};
  res.render("urls_index", templateVars);
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

app.get("/register", (req,res) => {
  res.render("register", {username: req.cookies.username});
});

app.post("/register", (req,res) => {
  //check that fields are not blank
  if ((!req.body.email) || (!req.body.password)){
    res.status(400).send({error: "email & password required"});
    return;
  }
  for(let user in users){
    if (users[user].email === req.body.email){
      res.status(400).send({error: "email already exists"});
      return;
    }
  }
  let newID = generateRandomString();
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: req.body.password
  };
  console.log(users[newID]);
  res.cookie('user_id', newID);
  res.redirect("/urls");
});

console.log(`Listening on port ${PORT}!`);
app.listen(PORT);




