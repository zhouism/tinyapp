var express = require("express");
var app = express();
var PORT = 8080; 
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session')


app.set("view engine", "ejs");

// const cookieParser = require('cookie-parser');
// app.use(cookieParser());

app.use(cookieSession({
  name: 'session',
  keys: ['secretkey'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const userChecker = (currentUser) => {
  for (let user in users) {
    if (user === currentUser) {
      return true;
    }
  } return false;
};

function badLogin(req, res) {
  req.session.errMessage = "You provided invalid credentials.";
  res.redirect('/login');
}

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
    password: bcrypt.hashSync('password', 10)}
  ,
   "marc": {
    id: "marc", 
    email: "marc@email.com", 
    password: bcrypt.hashSync('password', 10)}
}

app.get("/", (req, res) => {
  if (req.session.userid) {
    res.redirect("/urls")
  } else
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  let userID = req.session.userid;
  if (userChecker(userID)) {
    res.redirect("/urls")
  };
  res.render("register")
});

app.get("/login", (req, res) => {
  let userID = req.session.userid;
  if (userChecker(userID)) {
    res.redirect("/urls")
  };
  res.render("login")
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// VIEW ALL URLS OWNED BY USER
app.get("/urls", (req, res) => {
  let userID = req.session.userid;
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

// ADDS NEW URLS TO URL DATABASE
app.get("/urls/new", (req, res) => {
  let userID = req.session['userid'];
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
    res.redirect('/login')
  }
});

// REDIRECTS SHORT URL TO LONG URL
app.get("/urls/:id", (req, res) => {
  let userID = req.session['userid'];
  let key = req.params['id']
  if (!userChecker(userID)) {
    res.status(403).send('Please login first.')
  };
  if (userID !== urlDatabase[key]['id']){
    res.status(403).send('You do not have permissions to edit this.')
  }
  let templateVars = { 
    username: users[userID],
    shortURL: key, 
    longURL: urlDatabase[key]['longURL'] };
    res.render("urls_show", templateVars);
});

// REGISTER A NEW EMAIL
app.post("/register", (req, res) => {
  let newRandomID = generateRandomString(5);
  let userInfo = {
    id: newRandomID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };

  // checks if email is already in user database
  for (let user in users){
    if (userInfo.email === users[user]['email']){
        res.end("This email already exists!");
    } 
  }
  
  // add new ID to to database
  users[newRandomID] = userInfo;
  req.session.userid = newRandomID;
  res.redirect("/urls");
});


// LOGIN WITH EXISTING EMAIL AND PASSWORD
app.post("/login", (req, res) => {
  let userInfo = {
    email: req.body.email,
    password:req.body.password,
  };
  // checks if email and password match with database
  for (let user in users){
    if (userInfo.email === users[user]['email'] && 
      bcrypt.compareSync(userInfo.password, users[user]['password'])){
      req.session.userid = users[user]['id']
      res.redirect("/urls");
      } else {
        badLogin(req, res)
      } 
    };
});

// GENERATE NEW SHORT URL
app.post("/urls", (req, res) => {
  let userID = req.session['userid'];
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

// DELETE URLS OWNED BY USER
app.post("/urls/:id/delete",(req, res) => {
  let userID = req.session.userid;
  let shortURL = req.params.id;
  if (userChecker(userID)) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status(403).send('403: You do not have permissions to delete this.');
  }
});

//GIVES URL OWNERS ABILITY TO EDIT AND DELETE
app.post("/urls/:id", (req, res) => {
  let userID = req.session['userid'];
  let shortURL = req.params.id;
  let newLongURL = req.body.new_url;
  urlDatabase[shortURL]['longURL'] = newLongURL;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session.userid = null;
  res.redirect("/");
});

// REDIRECTS TO LONG URL
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