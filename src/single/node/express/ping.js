const express = require("express");

express()
  .get("/", (req, res) => {
    res.setHeader("content-type", "text/plain").send("Hi");
  })
  .listen(3000);
