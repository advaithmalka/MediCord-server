const { model, Schema } = require("mongoose");

const User = new Schema({
  email: String,
  username: String,
  password: String,
  sessions: [
    {
      transcription: String,
      summary: String,
      title: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});
module.exports = model("user", User);
