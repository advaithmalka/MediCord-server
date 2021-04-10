const { model, Schema } = require("mongoose");

const User = new Schema({
  email: String,
  username:String,
  password:String
});
module.exports = model("user", User);
