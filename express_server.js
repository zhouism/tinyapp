var express = require("express");
var app = express();
var PORT = 8080; 
const bcrypt = require('bcrypt');


app.set("view engine", "ejs");

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const userChecker = (currentUser) => {
  for (let user in users) {
    if (user === currentUser) {
      return true;
    }
  } return false;
};

var urlDatabase = {
  "b2xVn2": {
    id: "julia",
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca"
  },
  "9sm5xK":{
    id: "julia",
    shortURL: "9sm5xK",
    longURL: "http://www.google.com"
  }
};

var users = { 
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
  let userID = req.cookies.userid;
  if (userID === undefined) {
    res.redirect("/login")
  } 

  if (userID) {
    let templateVars = {
      urlMatches: [],
      username: users[userID]
    };
  
    for (let key in urlDatabase) {
      if (userID === urlDatabase[key]['id']){
        templateVars.urlMatches.push({ 
          shortURL: urlDatabase[key]['shortURL'],
          longURL: urlDatabase[key]['longURL'],
        })
      } 
    } 
    res.render("urls_index", templateVars);

  } else {
    res.redirect("/urls/new")
  }
});

//NEW URL NEEDS TO BE PUSHED TO DATABASE
app.get("/urls/new", (req, res) => {
  let userID = req.cookies['userid'];
  if (userChecker(userID)) {
    let newLink = {};
    
    for (let url in urlDatabase){
      if (urlDatabase[url]['id'] === userID){
        newLink[url] = urlDatabase[url];
      }
    }
    let templateVars = {
      url: newLink,
      username: userID
    };
    res.render('urls_new', templateVars);
  } else {
    res.status(401).send('Error: 401: You are not authorized, Please <a href="/"> Login </a>');
  }

  // let templateVars = {
  //   username: users[userID],
  // };
  // res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let userID = req.cookies['userid'];
  let key = req.params['id']
  let templateVars = { 
    username: users[userID],
    shortURL: key, 
    longURL: urlDatabase[key]['longURL'] };
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
   //NEEDS TO HASH PASSWORDS
    bcrypt.compare(userInfo.password, users[user]['password'])){
    res.cookie("userid", users[user]['id'])
    res.redirect("/urls");
    } 
    };
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  let userID = req.cookies['userid'];
  let newURL = generateRandomString(6);
    if (userChecker(userID)) {
      urlDatabase[newURL] = {
        id: userID,
        shortURL: newURL,
        longURL: req.body.longURL
      };
      res.redirect("/urls");
    }
});

app.post("/urls/:id/delete",(req, res) => {
  let userID = req.cookies.userid;
  let shortURL = req.params.id;
  if (userChecker(userID)) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status(403).send('403: You do not have permissions to delete this.');
  }
});

app.post("/urls/:id", (req, res) => {
  let userID = req.cookies['userid'];
  let shortURL = req.params.id;
  let newLongURL = req.body.new_url;
  urlDatabase[shortURL]['longURL'] = newLongURL;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userid");
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  if(!urlDatabase[shortURL]) {
    res.status(404).send('Error: 404: Page not found. <a href="/"> Go Back </a>');
  }
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