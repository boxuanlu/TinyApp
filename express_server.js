const express = require("express");
const app = express();
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const PORT = process.env.PORT || 8080;

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],

  };
  res.render("urls_index", templateVars);
});

// get information from new;
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],

  };
  res.render("urls_new", templateVars);

});

// get information from registration page;
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],

  }
  res.render("register", templateVars);
});

// get information from login page
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],

  }
  res.render("login", templateVars);
});

// get information from show page;
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    urlDatabase: urlDatabase,
    user: users[req.cookies["user_id"]],

  };
  res.render("urls_show", templateVars);
});

// get information from /u/:shortURL(which is a 6 random number);
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  let templateVars = { user: users[req.cookies["user_id"]] };

  res.redirect(longURL);
});

// for creat new web shortURL;
app.post("/urls", (req, res) => {
  let randomData = generateRandomString();
  urlDatabase[randomData] = "http://" + req.body["longURL"];
  res.redirect("/urls/" + randomData);
});
//for delete;
app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// for edite;
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL] = "http://" + req.body["longURL"];
  res.redirect("/urls");

});


//for logout;
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

//for login part;logg


app.post("/login", (req, res) => {
  let validLogin = false;
  let randomName = "";
  for (key in users) {
    if (users[key]["email"] === req.body["email"] && users[key]["password"] === req.body["password"]) {
      validLogin = true;
      randomName = key;
    }
  }
  if (!validLogin) {
    res.status(403);
    res.send("wrong information!")
    res.redirect("/login");
  } else {
    res.cookie('user_id', randomName);
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
      "password": req.body["password"]
    }
    res.cookie('user_id', randomname);
    console.log(users);
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);

});
