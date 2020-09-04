
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
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
const users ={"1234": { id: "1234", email: "user@example.com", 
password: "purple-monkey-dinosaur" }};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }

};
app.get("/", (req, res) => {
  res.send("Hello!\n");
  // app.get("/urls.json", (req, res) => {
  //   res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login")
  }
  let cookieValue = req.cookies["user_id"];
  let user = users[cookieValue];
  let newDB = {};
  for(let url in urlDatabase) { 
    if (user.id === urlDatabase[url].userID) { 
      newDB[url] = urlDatabase[url];
    }
  }
  let templateVars = { urls: newDB, userObj: user};
  console.log(templateVars)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login")
  }
  let cookieValue =req.cookies["user_id"];
  let user = users[cookieValue];
  let templateVars = {
    userObj: user
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // let cookieValue = req.cookies["user_id"];
  // let user = users[cookieValue] ;
  // let templateVars = { userObj: user };
  let shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
})

app.get("/urls/:shortURL", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login")
  }
  let cookieValue = req.cookies["user_id"];
  let user = users[cookieValue] ;
  let templateVars = { shortURL : req.params.shortURL, longURL : urlDatabase[req.params.shortURL].longURL, userObj: user };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  let cookieValue = req.cookies["user_id"]
  let user = users[cookieValue] ;
  let templateVars = {
    userObj: user
  };
 res.render("register", templateVars)
})

app.get("/login", (req, res) => {
  let cookieValue = req.cookies["user_id"]
  let user = users[cookieValue] ;
  let templateVars = {userObj: user}
res.render("login", templateVars)
})

app.post("/urls", (req, res) => {
  let randomString = generateRandomString();  // Log the POST request body to the console
  console.log(randomString)
  let id = req.cookies["user_id"] 
  urlDatabase[randomString]={"longURL": req.body.longURL, "userID": id }; 
  console.log(urlDatabase)
  res.redirect(`/urls/${randomString}`);
});
  
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("yay we made it")
  if (!req.cookies["user_id"]) {
    return(res.sendStatus(403));
  }
  console.log(req.params.shortURL)
  let shortURL = req.params.shortURL;
  console.log(shortURL)
  delete urlDatabase[shortURL];
  res.redirect("/urls");
}) 


app.post("/urls/:shortURL/update", (req,res) => {
  if (!req.cookies["user_id"]) {
    return(res.sendStatus(403));
  }
  let newLongURL = req.body.longURL;
  let id = req.params.shortURL;
  for ( let key in urlDatabase) {
    if (id === key) {
      urlDatabase[id].longURL = newLongURL;
      res.redirect("/urls");
    }
  } 
})


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

app.post('/login', (req, res) => {
  for (let key in users) {
    if(users[key].email === req.body.email && users[key].password === req.body.password) {
      return(res.cookie('user_id', key).redirect("/urls"));
    }
  } 
  res.sendStatus(404)
})
  
  // console.log("user email " + email)

app.post("/register", (req, res) => {
  const randomString = generateRandomString();
  if (req.body.email && req.body.password) {
    for(let keys in users) {
      if (req.body.email === users[keys].email) {
        return(res.sendStatus(400));
      }
    }
    users[randomString] = {id: randomString.toString(), email: req.body.email, password: req.body.password };
    res.cookie('user_id', randomString).redirect("/urls");
  } else {
    
    res.sendStatus(400);
  }
  
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

