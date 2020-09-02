
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
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  let shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL, templateVars);
})

app.get("/urls/:shortURL", (req, res) => {
  let templateVars ={ shortURL : req.params.shortURL, longURL : urlDatabase[req.params.shortURL],username: req.cookies["username"] };
  console.log("show req params")
  console.log(req.params)
  res.render("urls_show", templateVars) 
});
app.get("/register", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
 res.render("register", templateVars)
})

app.post("/urls", (req, res) => {
    console.log("post to DB")
    console.log(req.body);
    let randomString = generateRandomString(6,["5","3","a","f","n"])  // Log the POST request body to the console
    console.log(randomString);
    urlDatabase[randomString] = req.body.longURL    
    res.redirect(`/urls/${randomString}`);         // Respond with 'Ok' (we will replace this)
  });
  
app.post("/urls/:shortURL/update", (req,res) => {
 //  urlDatabase[req.params.shortURL]= 
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
  let shortURL = req.params.shortURL
  delete urlDatabase[shortURL];
  res.redirect("/urls");
}) 

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls")
})

app.post('/login', (req, res) => {
  const { username } = req.body
  console.log("user name " + username)
  res.cookie('username', username).redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

