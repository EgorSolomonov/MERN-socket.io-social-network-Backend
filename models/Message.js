const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageScheme = new Schema(
  {
    conversationId: {
      type: String,
    },
    author: {
      type: String,
    },
    text: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = messageScheme;
