const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const mongoose = require("mongoose");

//setting up mongodb
const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
mongoose
  .connect(process.env.MONGO_URI, connectionParams)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("Error connecting to the databse " + err);
  });

app.use(cors());
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: false }));
const User = require("./src/models/user");
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
app.post("/api/users", (req, res) => {
  try {
    let user = new User({ username: req.body.username });
    user.save((err, data) => {
      res.json(user);
    });
  } catch (error) {
    res.json({ error: "there has been an error" });
  }
});
app.get("/api/users", async (req, res) => {
  try {
    let users = await User.find();
    res.json(users);
  } catch (error) {
    res.json({ error: "there has been an error finding users" });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
