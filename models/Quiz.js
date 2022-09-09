const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const quizSchema = new Schema(
  { 
    cantidad: Number,
    preguntas: [{
    }],
  },
  { versionKey: false }
);

quizSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = Quiz;
