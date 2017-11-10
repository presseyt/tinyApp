const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');

const checkLogin = function(req, res, next){
  //Disallow any unauthenticated requests to pages
  if (!req.session.user_id){
    //except login, register and /u/shortURL:
    if (req.path != "/login" && req.path != "/register" && !req.path.match(RegExp('/u/') )){
      res.redirect("/login");
      return;
    }

  }
  else{
    //remove an improper login.
      //(With encrypted cookies, this is probably overkill)
    if(!userExists(req.session.user_id)){
      req.session = null;
      res.redirect("/login");
      return;
    }
  }

  next();
};

app.use(methodOverride('_method'))
   .use(bodyParser.urlencoded({extended: true}))
   .use(cookieSession({name: 'session', keys: ['pinwesedfa', 'nvuiapiub', 'piub12'], maxAge: 24*60*60*1000}))
   .use(checkLogin);

app.set("view engine", "ejs");

const PORT = process.env.PORT || 8080;

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//"DATABASES"

const urlDatabase = {
  'asdf': {link: 'http://google.ca',
           user_id: 'H5xp12',
           visits: []
  },
  'sdfg': {link: 'http://www.lighthouselabs.ca',
           user_id: 'Ls00xG',
           visits: []
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
  let charSet = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
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

function makeVisitorId(string){
  let charSet = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let arr = [0,5,12,43,14,40];
  for(let i = 0; i < string.length; i++)
    arr[i % 6] += string.charCodeAt(i);
  for(let i = 0; i < 6; i++)
    arr[i] = charSet[arr[i] % charSet.length];
  return arr.join('');
}

function doAnalytics(req, shortURL){
  urlDatabase[shortURL].visits.unshift({"visitor_id": makeVisitorId(req.headers["user-agent"]),
                                                time: new Date()});
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//app GET
app.get("/", (req,res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  }
  else {
    res.redirect("/urls");
  }
});

app.get("/register", (req,res) => {
  let templateVars = {user: users[req.session.user_id]};
  res.render("register", templateVars);
});

app.get("/login", (req,res) => {
  let templateVars = {user: users[req.session.user_id]};
  res.render("login", templateVars);
});

app.get("/urls", (req,res) => {
  let templateVars = {urls: getUserURLs(req.session.user_id), user: users[req.session.user_id]};
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req,res) => {
  if (!urlDatabase[req.params.id]){
    res.status(404).send("404 Link does not exist");
    return;
  }
  let templateVars = { shortURL: req.params.id,
                        urlInfo: urlDatabase[req.params.id],
                           user: users[req.session.user_id],
                   userOwnsLink: userMatchesLink(req.session.user_id, req.params.id)
                     };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req,res) => {
  if (!urlDatabase[req.params.shortURL]){
    res.status(404).send("404 Link does not exist");
    return;
  }
  res.redirect(urlDatabase[req.params.shortURL].link);
  doAnalytics(req, req.params.shortURL);
});

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
  //check that the email is new
  for(let user in users){
    if (users[user].email === req.body.email){
      res.status(400).send("Error: email already exists");
      return;
    }
  }
  //make the new account
  let newID = generateRandomString();
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  //log them in:
  req.session.user_id = newID;
  res.redirect("/urls");
});

app.post("/login", (req,res) => {
  for(user in users){
    //check if login credentials are valid
    if (users[user].email === req.body.email && bcrypt.compareSync(req.body.password, users[user].password)){
      req.session.user_id = user;
      res.redirect(`/urls`);
      return;
    }
  }
  res.status(400).send("Error: login failed.");
});

app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/urls", (req,res) => {
  let shortString = generateRandomString();
  urlDatabase[shortString] = {link: req.body.longURL, user_id: req.session.user_id, visits: []};
  res.redirect(`/urls/${shortString}`);
});

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//app PUT

app.put("/urls/:shortURL", (req,res) => {
  if (!userMatchesLink(req.session.user_id, req.params.shortURL)){
    res.status(400).send("Error: you do not own this link");
    return;
  }
  urlDatabase[req.params.shortURL].link = req.body.newURL;
  res.redirect("/urls");
});

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//app DELETE

app.delete("/urls/:shortURL", (req,res) => {
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

















