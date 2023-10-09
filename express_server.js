const express = require("express");
const app = express();
const PORT = 8080;
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// function that returns a string of 6 random alphanumeric characters
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}

app.post("/urls", (req, res) => {
  const id = generateRandomString(6);

  // Get the longURL from the request body
  const longURL = req.body.longURL;

  // Save the key-value pair to urlDatabase
  urlDatabase[id] = longURL;

  // Redirect to a page showing the newly created URL (you can customize this URL)
  res.redirect(`/urls/${id}`);
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  // Assuming you have a urlDatabase object containing your URL data
  const longURL = urlDatabase[id]; // Replace with your actual data retrieval logic
  const templateVars = { id, longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;

  // Check if the id exists in your urlDatabase
  if (urlDatabase[id]) {
    // If it exists, retrieve the longURL and perform the redirection
    const longURL = urlDatabase[id];
    res.redirect(longURL);
  } else {
    // If the id doesn't exist, you can handle it as an error or redirect to an error page
    res.status(404).send("URL not found"); // You can customize the error message or page
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;

  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const urlId = req.params.id;
  const newLongURL = req.body.newLongURL; // Assuming you have a form field named 'newLongURL'

  // Update the long URL in your database or data structure (e.g., urlDatabase)
  urlDatabase[urlId] = newLongURL;

  res.redirect("/urls"); // Redirect the client back to /urls
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});