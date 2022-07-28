const express = require("express");
const mongoose = require("mongoose");
const messageScheme = require("../models/Message");
const conversationScheme = require("../models/Conversation");
const jsonParser = express.json();

const conversationRouter = express.Router();

const Message = mongoose.model("Chat", messageScheme);
const Conversation = mongoose.model("Conversation", conversationScheme);

// create new converstation
conversationRouter.post("/", jsonParser, async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const conversation = await newConversation.save();

    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get conversations of a user
conversationRouter.get("/:userId", jsonParser, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: { $in: [req.params.userId] },
    });

    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json(err);
  }
});

// delete conversation

conversationRouter.delete("/:id", jsonParser, async (req, res) => {
  try {
    const messages = await Message.deleteMany({
      conversationId: req.params.id,
    });

    const conversation = await Conversation.findByIdAndDelete(req.params.id);

    res.status(200).json("Диалог и сообщения удалены");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = conversationRouter;
