var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase, 
    username: req.cookies['userid']};
  // console.log('req.cookies' + JSON.stringify(req.cookies)) => {"userid":"juliazhou"}
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  console.log(req.cookies['userid']) //=> juliazhou
  let templateVars = { 
    username: req.cookies['userid']};
  console.log("templatevars" + templateVars.username)
  res.render("urls_new", templateVars); // Path must be a string. Received { username: 'juliazhou' }
  //console.log(templateVars) // => { username: 'juliazhou', _locals: {} }
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { 
    shortURL: req.params.id, 
    username: req.cookies['userid'], 
    urls: urlDatabase }; //refector: only send the url neeed from the database
  res.render("urls_show", templateVars);
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

app.post("/login", (req, res) => {
  let name = req.body.username;
  res.cookie("userid", name);
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