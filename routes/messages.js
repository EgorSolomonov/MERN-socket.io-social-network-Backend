const express = require("express");
const mongoose = require("mongoose");
const messageScheme = require("../models/Message");
const jsonParser = express.json();

const messageRouter = express.Router();

const Message = mongoose.model("Chat", messageScheme);

// create new message
messageRouter.post("/", jsonParser, async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const message = await newMessage.save();

    res.status(200).json(message);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get messages of a conversation
messageRouter.get("/:conversationId", jsonParser, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get one message from a conversation
messageRouter.get("/:messageId", jsonParser, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    res.status(200).json(message);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = messageRouter;
