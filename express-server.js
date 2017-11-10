const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const checkLogin = function(req, res, next){
  req.message = "I've been middleware'd";

  //remove an improper login
  if(!userExists(req.session.user_id)){
    req.session.user_id = "";
  }

  //Disallow any unauthenticated get requests to pages
  if (!req.session.user_id && req.method == "GET"){
    //except login, register and /u/shortURL:
    if (req.path != "/login" && req.path != "/register" && !req.path.match(RegExp('/u/') )){
      console.log('NO ACCESS');
      res.redirect("/login");
      return;
    }
  }

  if (req.method == "POST" && !req.session.user_id){
    if (req.path != '/login' && req.path != '/register'){
      console.log("NOT ALLOWED");
      res.redirect("/login");
      return;
    }
  }

  next();
};

app.use(bodyParser.urlencoded({extended: true}))
   .use(cookieSession({name: 'session', keys: ['pinwesedfa', 'nvuiapiub', 'piub12'], maxAge: 24*60*60*1000}))
   .use(checkLogin);

app.set("view engine", "ejs");

const PORT = process.env.PORT || 8080;

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//"DATABASES"

const urlDatabase = {
  'asdf': {link: 'http://google.ca',
           user_id: 'H5xp12'
  },
  'sdfg': {link: 'http://www.lighthouselabs.ca',
           user_id: 'Ls00xG'
  }
};

const users = {
  "H5xp12": {
    id: "H5xp12",
    email: "user@example.com",
    password: bcrypt.hashSync("asdf",10)
  },
  "Ls00xG": {
    id: "Ls00xG",
    email: "user2@emample.com",
    password: bcrypt.hashSync("asdf",10)
  }
};

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//Functions

function generateRandomString(){
  var charSet = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let output = "";
  for(let i = 0; i < 6; i++){
    let rnd = Math.floor(Math.random() * charSet.length);
    output += charSet[rnd];
  }
  return output;
}

function getUserURLs(user_id){
  const userURLs = {};
  for (let shortURL in urlDatabase){
    if (urlDatabase[shortURL].user_id === user_id){
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
}

function userMatchesLink(user, shortURL){
  if (urlDatabase[shortURL]){
    if (urlDatabase[shortURL].user_id == user){
      return true;
    }
  }
  return false;
}

function userExists(user){
  for(id in users){
    if (user === id) return true;
  }
  return false;
}


//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//app GET

app.get("/register", (req,res) => {
  let templateVars = {user: users[req.session.user_id]};
  res.render("register", templateVars);
});

app.get("/login", (req,res) => {
  let templateVars = {user: users[req.session.user_id]};
  res.render("login", templateVars);
});

app.get("/logout", (req,res) => {
  req.session.user_id = "";
  res.redirect("/login");
});

app.get("/urls", (req,res) => {
  let templateVars = {urls: getUserURLs(req.session.user_id), user: users[req.session.user_id]};
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req,res) => {
    let templateVars = { shortURL: req.params.id,
                          longURL: urlDatabase[req.params.id].link,
                             user: users[req.session.user_id]
                       };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req,res) => {
  res.redirect(urlDatabase[req.params.shortURL].link);
})

app.get("/new", (req,res) => {
  let templateVars = {user: users[req.session.user_id]};
  res.render("urls_new", templateVars);
});

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//app POST

app.post("/register", (req,res) => {
  //check that fields are not blank
  if ((!req.body.email) || (!req.body.password)){
    res.status(400).send("Error: email & password required");
    return;
  }
  for(let user in users){
    if (users[user].email === req.body.email){
      res.status(400).send("Error: email already exists");
      return;
    }
  }
  let newID = generateRandomString();
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session.user_id = newID;
  res.redirect("/urls");
});

app.post("/login", (req,res) => {
  console.log(users);
  for(user in users){
    if (users[user].email === req.body.email && bcrypt.compareSync(req.body.password, users[user].password)){
      req.session.user_id = user;
      res.redirect(`/urls`);
      return;
    }
  }
  res.status(400).send("Error: login failed.");
});

app.post("/logout", (req,res) => {
  req.session.user_id = "";   ///clear cookie somehow?
  res.redirect("/login");
});

app.post("/urls", (req,res) => {
  let shortString = generateRandomString();
  urlDatabase[shortString] = {link: req.body.longURL, user_id: req.session.user_id};
  res.redirect(`/urls/${shortString}`);
});

app.post("/urls/:shortURL/modify", (req,res) => {
  if (!userMatchesLink(req.session.user_id, req.params.shortURL)){
    res.status(400).send("Error: you do not own this link");
    return;
  }
  urlDatabase[req.params.shortURL] = {link: req.body.newURL, user_id: req.session.user_id};
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req,res) => {
  if (!userMatchesLink(req.session.user_id, req.params.shortURL)){
    res.status(400).send("Error: you do not own this link");
    return;
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//start the server!

console.log(`listening on ${PORT}`);
app.listen(PORT);

















