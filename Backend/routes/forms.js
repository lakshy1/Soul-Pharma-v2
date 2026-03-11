const express = require("express");
const FormResponse = require("../models/FormResponse");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, topic, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }
    const response = await FormResponse.create({
      name,
      email,
      phone,
      topic,
      message
    });
    return res.status(201).json({ response });
  } catch (error) {
    return res.status(500).json({ message: "Unable to submit form" });
  }
});

module.exports = router;
