const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const cookieParser = require("cookie-parser");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Helper function for generating random string
function generateRandomString() {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); // Generate a random short URL
  const longURL = req.body.longURL; // Extract the longURL from the form submission
  urlDatabase[shortURL] = longURL; // Add the new URL to the database
  res.redirect(`/urls/${shortURL}`); // Redirect to the newly created short URL
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

// Route handler for /urls
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

// Redirect short URLs to long URLs
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]; // Retrieve the longURL from the database
  res.redirect(longURL); // Redirect to the corresponding longURL
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars);
});

app.get('/login', (req, res) => {
  res.render('login', { user: users[req.cookies["user_id"]] });
});

// POST route to delete a URL resource
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id; // Retrieve the URL id from the request parameters
  delete urlDatabase[id]; // Use the delete operator to remove the URL
  res.redirect("/urls"); // Redirect the client back to the urls_index page
});

app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id; // Extract the short URL ID from the request parameters
  const newLongURL = req.body.longURL; // Extract the updated long URL from the request body

  // Update the value of the stored long URL based on the new value in req.body
  urlDatabase[shortURL] = newLongURL;

  // Redirect the client back to /urls
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  let userFound = false;
  let matchedUserId;

  for (const userId in users) {
    if (users[userId].email === email) {
      userFound = true;
      if (users[userId].password === password) {
        matchedUserId = userId;
        break;
      } else {
        res.status(403).send("Password does not match.");
        return;
      }
    }
  }

  if (!userFound) {
    res.status(403).send("User not found.");
    return;
  }

  res.cookie('user_id', matchedUserId);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); // Clear the user_id cookie
  res.redirect("/login"); // Redirect the client back to the /login page
});

app.post("/register", (req, res) => {
  const userId = generateRandomString(); // Generate a random user ID
  const { email, password } = req.body; // Extract the email and password from the request body

  // Check for empty email or password
  if (!email || !password) {
    res.status(400).send("Email or password cannot be empty.");
    return;
  }

  // Check if the email already exists in the users object
  const existingUser = Object.values(users).find(user => user.email === email);
  if (existingUser) {
    res.status(400).send("Email already exists. Please use a different email.");
    return;
  }

  // Add a new user object to the global users object
  users[userId] = {
    id: userId,
    email: email,
    password: password
  };

  // Set a user_id cookie containing the user's newly generated ID
  res.cookie("user_id", userId);

  // Redirect the user to the /urls page
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});