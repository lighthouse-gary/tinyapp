const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }

  return randomString;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id; // Get the id from the URL
  const longURL = urlDatabase[id]; // Retrieve the corresponding URL from urlDatabase

  const templateVars = { id, longURL }; // Create template variables

  res.render("urls_show", templateVars); // Render the template with the data
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id; // Get the id from the URL
  const longURL = urlDatabase[id]; // Retrieve the corresponding URL from urlDatabase
  
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL; // Get the longURL from the POST request body
  const shortURL = generateRandomString(6); // Generate a random short URL

  // Save the key-value pair in the urlDatabase
  urlDatabase[shortURL] = longURL;

  // Redirect to the page that displays the new URL
  res.redirect(`/urls/${shortURL}`);
});

// Define a POST route to remove a URL resource
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;

  // Check if the URL with the provided ID exists
  if (urlDatabase[id]) {
    // Use the delete operator to remove the URL
    delete urlDatabase[id];
    // Redirect the client back to the urls page
    res.redirect("/urls");
  } else {
    // Handle the case where the URL with the provided ID does not exist
    res.status(404).send("URL not found");
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});