
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session')

app.use(cookieSession({
  name: 'session',
  keys: ["key1"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")

function generateRandomString() {
  var result = '';   
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';   
  for ( var i = 0; i < 6; i++ ) {      
    result += characters.charAt(Math.floor(Math.random() * 62));   
  }   
    return (result);
} 
//global object to store user Data
const users ={};
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  let cookieValue = req.session.user_id;
  let user = users[cookieValue];
  let newDB = {};
  if (user) {
    for(let url in urlDatabase) {
      if (user.id === urlDatabase[url].userID) { 
        newDB[url] = urlDatabase[url];
      }
    }
    let templateVars = { urls: newDB, userObj: user};
    return res.render("urls_index", templateVars);
  } else {
    res.redirect("/login")
  }
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login")
  }
  let cookieValue = req.session.user_id;
  let user = users[cookieValue];
  let templateVars = {userObj: user};
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.send("the url is not existed");
  } 
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  let cookieValue = req.session.user_id;
  let user = users[cookieValue];
  for (let shorturlID in urlDatabase) {
    if(shorturlID === req.params.shortURL) {
      if (urlDatabase[shorturlID].userID === cookieValue) {
        let templateVars = { shortURL : req.params.shortURL, longURL : urlDatabase[req.params.shortURL].longURL, userObj: user};
        return res.render("urls_show", templateVars);
      } else {
        res.send("you don't own this short URL");
      }
    }
  }
});

app.get("/register", (req, res) => {
  let cookieValue = req.session.user_id;
  let user = users[cookieValue];
  let templateVars = {userObj: user};
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let cookieValue = req.session.user_id;
  let user = users[cookieValue];
  let templateVars = {userObj: user};
  res.render("login", templateVars);
});

app.post("/urls", (req, res) => {
  let randomString = generateRandomString();  // Log the POST request body to the console
  let id = req.session.user_id;
  urlDatabase[randomString]={"longURL": req.body.longURL, "userID": id }; 
  res.redirect(`/urls/${randomString}`);
});
  
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    return(res.sendStatus(403));
  }
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});


app.post("/urls/:shortURL/update", (req,res) => {
  if (!req.session.user_id) {
    return(res.sendStatus(403));
  }
  let newLongURL = req.body.longURL;
  let id = req.params.shortURL;
  for (let key in urlDatabase) {
    if (id === key) {
      urlDatabase[id].longURL = newLongURL;
      res.redirect("/urls");
    }
  } 
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
})


app.post('/login', (req, res) => {
  for (let key in users) {
    if (users[key].email === req.body.email && bcrypt.compareSync(req.body.password, users[key].password)) {
      req.session.user_id = key;
      return res.redirect("/urls");
    }
  } 
  res.sendStatus(404);
})
  
  // console.log("user email " + email)

app.post("/register", (req, res) => {
  const randomString = generateRandomString();
  if (req.body.email && req.body.password) {
    for (let keys in users) {
      if (req.body.email === users[keys].email) {
        return(res.sendStatus(400));
      }
    }
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[randomString] = {id: randomString.toString(), email: req.body.email, password: hashedPassword };
    req.session.user_id = randomString;
    res.redirect("/urls");
  } else {
    res.sendStatus(400);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

