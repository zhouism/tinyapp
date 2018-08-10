var express = require("express");
var app = express();
var PORT = 8080; 

app.set("view engine", "ejs");

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "julia": {
    id: "julia", 
    email: "julia@email.com", 
    password: "password"
  },
 "marc": {
    id: "marc", 
    email: "marc@email.com", 
    password: "password"
  }
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/register", (req, res) => {
  res.render("register")
});

app.get("/login", (req, res) => {
  res.render("login")
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let userID = req.cookies['userid'];
  let templateVars = { 
    urls: urlDatabase, 
    username: users[userID]};
    console.log(users[userID])
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let userID = req.cookies['userid'];
  let templateVars = { 
    username: users[userID]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let userID = req.cookies['userid'];
  let templateVars = { 
    shortURL: req.params.id, 
    username: users[userID], 
    urls: urlDatabase }; //refactor: only send the url neeed from the database
    res.render("urls_show", templateVars);
});

app.post("/register", (req, res) => {
  let randomID = generateRandomString(5);
  let userInfo = {
    id: randomID,
    email: req.body.email,
    password:req.body.password,
  };
  // checks if email is already in user database
 for (let user in users){
   if (userInfo.email === users[user]['email']){
      res.end("This email already exists!");
      return;
    } 
    };
  users[randomID] = userInfo;
  res.cookie("userid", randomID)
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let userInfo = {
    email: req.body.email,
    password:req.body.password,
  };
  // checks if email is already in user database
 for (let user in users){
   if (userInfo.email === users[user]['email'] && 
    userInfo.password === users[user]['password']){
    res.cookie("userid", users[user]['id'])
    res.redirect("/urls");
    } 
    };
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete",(req, res) => {
  let shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let newLongURL = req.body.new_url;
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userid");
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });

function generateRandomString(keyLength) {
  var i, 
  key = "", 
  characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var charactersLength = characters.length;
    for (i = 0; i < keyLength; i++) {
        key += characters.substr(Math.floor((Math.random() * charactersLength) + 1), 1);
    }
    return key;
}