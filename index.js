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
const Exercise = require("./src/models/exercise");
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
app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.params._id });

    if (user) {
      let dateExists = Date.parse(req.body.date);
      let date = dateExists ? new Date(req.body.date) : new Date();
      let exercise = new Exercise({
        _user_id: user._id,
        username: user.username,
        description: req.body.description,
        duration: req.body.duration,
        date: date,
      });
      exercise.save((err, exercise) => {
        if (err == null) {
          exercise.date = exercise.date.toDateString();
          res.json({
            username: exercise.username,
            description: exercise.description,
            duration: exercise.duration,
            date: exercise.date.toDateString(),
            _id: exercise._user_id,
          });
        }
      });
    } else {
      throw new Error();
    }
  } catch (error) {
    res.json({ error: "something wrong happened" });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
