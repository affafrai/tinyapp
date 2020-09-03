
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs")

function generateRandomString(strLength, arr) {
  var ans = ''; 
  for (var i = strLength; i > 0; i--) { 
    ans +=  
    arr[Math.floor(Math.random() * arr.length)]; 
  } 
  return ans;
} 
//global object to store user Data
const users ={"1234": { id: "1234", email: "user@example.com", 
password: "purple-monkey-dinosaur" }};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!\n");
  // app.get("/urls.json", (req, res) => {
  //   res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let cookieValue = req.cookies["user_id"];
  let user = users[cookieValue];
  let templateVars = { urls: urlDatabase, userObj: user};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let cookieValue =req.cookies["user_id"];
  let user = users[cookieValue];
  let templateVars = {
    userObj: user
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let cookieValue = req.cookies["user_id"];
  let user = users[cookieValue] ;
  let templateVars = { userObj: user };
  let shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL, templateVars);
})

app.get("/urls/:shortURL", (req, res) => {
  let cookieValue = req.cookies["user_id"];
  let user = users[cookieValue] ;
  let templateVars = { shortURL : req.params.shortURL, longURL : urlDatabase[req.params.shortURL], userObj: user };
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
  let randomString = generateRandomString(6,["5","3","a","f","n"]);  // Log the POST request body to the console
  urlDatabase[randomString] = req.body.longURL;  
  res.redirect(`/urls/${randomString}`);         // Respond with 'Ok' (we will replace this)
});
  
app.post("/urls/:shortURL/update", (req,res) => {
  let newLongURL = req.body.longURL;
  let id = req.params.shortURL;
  for ( let key in urlDatabase) {
    if (id === key) {
      urlDatabase[id] = newLongURL;
      res.redirect("/urls");
    }
  } 
})

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
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
  res.sendStatus(403)
})
  
  // console.log("user email " + email)

app.post("/register", (req, res) => {
  const randomString = generateRandomString(6, ["j","i","2","8","s"]);
  if (req.body.email && req.body.password) {
    for(let keys in users) {
      if (req.body.email === users[keys].email) {
        return(res.sendStatus(400));
      }
    }
    users[randomString] = {id: randomString, email: req.body.email, password: req.body.password };
    res.cookie('user_id', randomString).redirect("/urls");
  } else {
    
    res.sendStatus(400);
  }
  
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

