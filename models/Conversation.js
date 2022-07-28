const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const conversationScheme = new Schema(
  {
    members: {
      type: Array,
    },
  },
  { timestamps: true }
);

module.exports = conversationScheme;
