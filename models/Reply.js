const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const replySchema = new Schema(
  {
    question: 
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
      },
    choice: {
      type: Schema.Types.ObjectId,
      ref: "Answer",
    },
  },
  { versionKey: false }
);

replySchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Quiz = mongoose.model("Quiz", replySchema);

module.exports = Quiz;
