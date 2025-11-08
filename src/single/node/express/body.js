const express = require("express");

express()
  .use(express.json())
  .post("/", ({ body }, res) => {
    res.json(body);
  })
  .listen(3000);
