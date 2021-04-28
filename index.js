require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const router = require("./router");
const app = express();
const port = process.env.PORT || 6942;
mongoose
  .connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`Server running at http://localhost:${port}`))
  .catch(err => {
    console.error(err);
  });

const allowList = ["https://advaithmalka.github.io", "http://localhost:3000"];
app.use((req, res, next) => {
  if (allowList.indexOf(req.headers.origin) === -1) return res.sendStatus(401);
  next();
});
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));
app.use(router);
app.listen(port);
