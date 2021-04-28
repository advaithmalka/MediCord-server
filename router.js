require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const keywords = require("./keywords");
const fetch = require("node-fetch");
const unirest = require("unirest");

let SummarizerManager = require("node-summarizer").SummarizerManager;
router.route("/").get((req, res) => {
  res.sendStatus(200);
});
router.route("/signup").post(async ({ body }, res) => {
  const hashPwd = await bcrypt.hash(body.password, 10);
  const user = new User({
    password: hashPwd,
    email: body.email,
  });

  const result = await user.save();
  const token = jwt.sign(
    {
      id: result.id,
      email: result.email,
    },
    process.env.TOKEN_KEY,
    { expiresIn: "1h" }
  );

  res.send({ status: "ok", token });
});
router.route("/login").post(async ({ body }, res) => {
  const user = await User.findOne({ email: body.email });
  if (!user) {
    return res.send({ error: "NOT_FOUND" });
  }

  const validPwd = await bcrypt.compare(body.password, user.password);

  if (!validPwd) {
    return res.send({ error: "INVALID_PASSWORD" });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.TOKEN_KEY,
    { expiresIn: 86400 }
  );

  res.send({ status: "ok", token });
});

router.route("/sessions/all/:userID").get(async (req, res) => {
  let user;
  if (req.params.userID) {
    user = await User.findById(req.params.userID);
  } else {
    return res.send({ error: "MISSING_PARAM" });
  }
  if (user) {
    return res.json(user.sessions);
  }
  return res.send({ error: "NOT_FOUND" });
});
let lastQuery = "";
router.route("/upload").post(async (req, res) => {
  // let url = req.body.url.replace(/\/(?=[^\/]*$)/, "%2F");
  let url = req.body.url;
  if (lastQuery === url) return;
  lastQuery = url;
  const postReq = unirest("POST", `https://api.assemblyai.com/v2/transcript`);

  postReq.headers({
    authorization: process.env.ASSEMBLY_AI_KEY,
    "content-type": "application/json",
  });

  postReq.type("json");
  postReq.send({
    audio_url: `${url}&token=${req.body.token}`,
    word_boost: keywords,
  });

  postReq.end(async re => {
    let data = await getTranscript(re);
    const poll = async () => {
      data = await getTranscript(re);
      if (data.text) {
        console.log(data.text);

        //Summarizer
        const sentences = data.text.match(/[\w|\)][.?!](\s|$)/g).length;
        const numSentences = Math.ceil(sentences * (0.01 * req.body.percent));
        let Summarizer = new SummarizerManager(data.text, numSentences);
        let summary = Summarizer.getSummaryByFrequency().summary;

        const user = await User.findById(req.body.id);
        user.sessions.unshift({
          transcription: data.text,
          summary,
          title: req.body.title,
        });
        await user.save();
        res.send({ status: "ok" });
        return;
      }
      return setTimeout(poll, 2000);
    };
    console.log(re.body.id);
    await poll();
    if (re.error) {
      res.send({ error: re.error });
      return console.error(re.error);
    }
  });
});

module.exports = router;
const getTranscript = async re => {
  const r = await fetch(
    `https://api.assemblyai.com/v2/transcript/${re.body.id}`,
    {
      method: "GET",
      headers: {
        authorization: process.env.ASSEMBLY_AI_KEY,
        "content-type": "application/json",
      },
    }
  );
  const d = await r.json();
  return d;
};
