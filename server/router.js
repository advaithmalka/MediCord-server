const express = require("express");
const app = express();
const router = express.Router();

router.route('/signup').post(async (req, res)=>{
  res.send(req)
})

module.exports = router;
