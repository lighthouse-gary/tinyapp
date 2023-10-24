const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const cookieSession = require("cookie-session");
const bcrypt = require('bcryptjs');
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

// Existing users data
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: "1234",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: "5678",
  },
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'] // Specify your own array of keys here
}));

// Updated urlDatabase structure with userID association
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};


app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  }
  const templateVars = {
    user: users[req.session["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send("You must be logged in to create a new URL.");
    return;
  }
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  urlDatabase[shortURL] = { longURL: longURL, userID: userID }; // Updated structure for urlDatabase
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (req, res) => {
  const shortURLId = req.params.id;
  const url = urlDatabase[shortURLId];

  if (!url) {
    // If the short URL ID does not exist, send an error message
    res.status(404).send("Short URL not found");
    return;
  }

  const userId = req.session.user_id;

  if (url.userID !== userId) {
    res.status(403).send("You do not have permission to access this URL.");
    return;
  }

  const templateVars = {
    user: users[req.session["user_id"]],
    id: shortURLId,
    longURL: url.longURL
  };
  res.render("urls_show", templateVars);
});

// Update the route for displaying all URLs associated with a specific user
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.status(403).send("Please log in or register first.");
    return;
  }
  const userUrls = urlsForUser(userId, urlDatabase);
  const templateVars = {
    user: users[userId],
    urls: userUrls,
  };
  res.render("urls_index", templateVars);
});

// Redirect short URLs to long URLs
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]; // Retrieve the longURL from the database
  if (longURL) {
    res.redirect(longURL); // Redirect to the corresponding longURL
  } else {
    res.status(404).send("Short URL not found");
  }
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
    return;
  }
  const templateVars = {
    user: users[req.session["user_id"]]
  };
  res.render("urls_register", templateVars);
});

app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
    return;
  }
  res.render('login', { user: users[req.session["user_id"]] });
});

// POST route to delete a URL resource
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID === req.session.user_id) {
    delete urlDatabase[shortURL];
  }
  res.redirect("/urls");
});

// POST route to update a URL resource
app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;

  if (!urlDatabase[shortURL]) {
    res.status(404).send("Short URL not found");
    return;
  }

  if (!req.session.user_id) {
    res.status(401).send("You must be logged in to edit this URL.");
    return;
  }

  if (urlDatabase[shortURL].userID !== req.session.user_id) {
    res.status(403).send("You do not have permission to edit this URL.");
    return;
  }

  // Update the value of the stored long URL and ensure the userID is preserved
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect('/urls');
});

// POST route to delete a URL resource
app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;

  if (!urlDatabase[shortURL]) {
    res.status(404).send("Short URL not found");
    return;
  }

  if (!req.session.user_id) {
    res.status(401).send("You must be logged in to delete this URL.");
    return;
  }

  if (urlDatabase[shortURL].userID !== req.session.user_id) {
    res.status(403).send("You do not have permission to delete this URL.");
    return;
  }

  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  req.session.user_id = null; // Clear the user_id from the session
  res.redirect("/login"); // Redirect the client back to the /login page
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = getUserByEmail(email, users);
  if (!user) {
    res.status(403).send("User not found");
  }

  const passwordMatch = bcrypt.compareSync(password, user.password);

  if (!passwordMatch) {
    res.status(403).send("Password does not match");
    return;
  }

  req.session.user_id = user.id; // Set the user_id in the session
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Check for empty email or password
  if (!email || !password) {
    res.status(400).send("Email or password cannot be empty.");
    return;
  }

  // Check if the email already exists in the users object
  if (getUserByEmail(email)) {
    res.status(400).send("Email already exists. Please use a different email.");
    return;
  }

  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Add a new user object to the global users object
  users[id] = { id, email, password: hashedPassword };

  // Set the user_id in the session
  req.session.user_id = id;

  // Redirect the user to the /urls page
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});