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
const { json } = require("express");
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
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(users, null, 2));
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

// GET /api/users/:_id/logs
app.get("/api/users/:_id/logs", async (req, res) => {
  try {
    let user = await User.findById(req.params._id);
    let exercises;
    if (Date.parse(req.query.from) && Date.parse(req.query.to)) {
      exercises = await Exercise.find({
        _user_id: user._id,
        date: {
          $gte: req.query.from,
          $lte: req.query.to,
        },
      }).limit(req.query.limit);
    } else {
      exercises = await Exercise.find({
        _user_id: user._id,
      }).limit(req.query.limit);
    }
    exercises = exercises.map((e) => {
      return {
        description: e.description,
        duration: e.duration,
        date: e.date.toDateString(),
      };
    });
    res.header("Content-Type", "application/json");
    res.send(
      JSON.stringify(
        {
          username: user.username,
          count: exercises.length,
          log: exercises,
        },
        null,
        4
      )
    );
  } catch (error) {
    res.json({ error: "an error has occurred" });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
