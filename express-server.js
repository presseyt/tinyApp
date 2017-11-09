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
    password: "asdf"
  },
  "user2": {
    id: "user2",
    email: "user2@emample.com",
    password: "asdf"
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
  let templateVars = {user: users[req.cookies.user_id]};
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  // debug statement to see POST parameters
  let shortString = generateRandomString();
  urlDatabase[shortString] = req.body.longURL;
  res.redirect(`/urls/${shortString}`);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

app.post("/urls/:id/modify", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect(`/urls`);
});

app.post("/login", (req,res) => {
  if (req.body.user_id === ""){
    res.cookie("user_id", "");
    res.redirect("/urls");
    return;
  }

  for(user in users){
    if (users[user].email === req.body.email && users[user].password === req.body.password){
      res.cookie("user_id", user);
      res.redirect(`/urls`);
      return;
    }
  }
  res.status(400).send({error: "login failed."});
});

app.get("/urls", (req,res) => {
  let templateVars = {urls: urlDatabase, user: users[req.cookies.user_id]};
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                           urls: urlDatabase,
                           user: users[req.cookies.user_id]
                      };

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req,res)=>{
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req,res) => {
  res.render("register", {user: users[req.cookies.user_id]});
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
  res.cookie('user_id', newID);
  res.redirect("/urls");
});

app.get("/login", (req,res) => {
  res.render("login", {user: users[req.cookies.user_id]});
})

console.log(`Listening on port ${PORT}!`);
app.listen(PORT);




