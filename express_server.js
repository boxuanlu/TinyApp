const express = require("express");
const app = express();
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
//const cookieParser = require('cookie-parser');
//app.use(cookieParser());
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ["boxuanlu" /* secret keys */ ],

  // Cookie Options
  //maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const PORT = process.env.PORT || 8080;

let urlDatabase = {
  "b2xVn2": { url: "http://www.lighthouselabs.ca", userID: "user3RandomID" },
  "9sm5xK": { url: "http://www.google.com", userID: "user2RandomID" }
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "981374771@qq.com",
    password: bcrypt.hashSync("www4137757", 10)
  }
};


function generateRandomString() {
  let randomString = '';
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (i = 0; i < 6; i++) {
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return randomString;
}

// get information from root;
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello<b>World</b></body></html>\n");
});

// get information from index;
app.get("/urls", (req, res) => {
  let userUrls = {};
  let userID = req.session.user_id;

  for (shortURL in urlDatabase) {
    if (userID === urlDatabase[shortURL]["userID"]) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  let templateVars = {
    urls: userUrls,
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});

// get information from new;
app.get("/urls/new", (req, res) => {
  if (req.session.user_id === undefined || !(req.session.user_id in users)) {
    res.redirect("/login");
  }
  let templateVars = {
    user: users[req.session.user_id],

  };
  res.render("urls_new", templateVars);

});

// get information from registration page;
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],

  }
  res.render("register", templateVars);
});

// get information from login page
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],

  }
  res.render("login", templateVars);
});

// get information from show page;
app.get("/urls/:id", (req, res) => {
  if (req.session.user_id === undefined) {
    res.status(403);
    res.send("user not logged in!");
  }
  if (req.params.id in urlDatabase){
  if (req.session.user_id === urlDatabase[req.params.id]["userID"]) {
    let templateVars = {
      shortURL: req.params.id,
      urlDatabase: urlDatabase,
      user: users[req.session.user_id],
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(403);
    res.send("you do not own this short URL!");
  } } else {
    res.send("this shortURL is wrong");
  }
});

// get information from /u/:shortURL(which is a 6 random number);
app.get("/u/:shortURL", (req, res) => {
  if (req.params.shortURL in urlDatabase) {
    let longURL = urlDatabase[req.params.shortURL]["url"];
    let templateVars = { user: users[req.session.user_id] };
    res.redirect(longURL);
  } else {
    res.send("wrong ShortURL");
  }

});

// for creat new web shortURL;
app.post("/urls", (req, res) => {
  let randomData = generateRandomString();
  urlDatabase[randomData] = { url: "http://" + req.body["longURL"], userID: req.session.user_id };
  res.redirect("/urls/" + randomData);
});
//for delete;
app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;
  if (req.session.user_id === urlDatabase[shortURL]["userID"]) {
    delete urlDatabase[shortURL];
  }
  res.redirect("/urls");
});

// for edite;
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  if (req.session.user_id === urlDatabase[shortURL]["userID"]) {
    urlDatabase[shortURL]["url"] = "http://" + req.body["longURL"];
  }
  res.redirect("/urls");
});


//for logout;
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//for login part;logg


app.post("/login", (req, res) => {
  let validLogin = false;
  let randomName = "";
  for (key in users) {
    //  console.log("2");
    if (users[key]["email"] === req.body["email"] && bcrypt.compareSync(req.body["password"], users[key]["password"])) {
      validLogin = true;
      randomName = key;
      //  console.log("3");
    }
  }
  if (!validLogin) {
    res.status(403);
    res.send("wrong information!")
    res.re("/login");
  } else {
    req.session.user_id = randomName;
    res.redirect("/urls");
  }
});

// for register part;
app.post("/register", (req, res) => {
  let emailInUse = false;
  for (key in users) {
    if (users[key]["email"] === req.body["email"]) {
      emailInUse = true;
    }
  }
  if (emailInUse) {
    res.status(400);
    res.send("email has been used. try another one!")
  }
  if (!req.body["email"] || !req.body["password"]) {
    res.status(400);
    res.send('You need enter both email and password');

  } else {
    let randomname = generateRandomString();

    users[randomname] = {
      "id": randomname,
      "email": req.body["email"],
      "password": bcrypt.hashSync(req.body["password"], 10)
    }
    req.session.user_id = randomname;
    //res.cookie('user_id', randomname); this is cookie method is not in used now;
    // console.log(users);
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);

});
