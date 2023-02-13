const mongoose = require("mongoose");

let exerciseSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: Date,
  _id: mongoose.Types.ObjectId,
  username: String,
});

module.exports = mongoose.model("Exercise", exerciseSchema);
