const Question = require("../../models/Question");
const Answer = require("../../models/Answer");
const Quiz = require("../../models/Quiz");

//Topic PubSub
const subscriptionName = "hestia-sub";

// Imports the Google Cloud client library
const { PubSub } = require("@google-cloud/pubsub");

// Creates a client; cache this for further use
const pubSubClient = new PubSub();

listenForMessages();

// Display Applicant
exports.quiz_get_byQuantity = async (req, res) => {
  const { quantity } = req.params;
  let number = Number(quantity);
  let lengthArray = number;
  var arrayQuestions = [];
  let array = generateRandomArray(lengthArray);
  try {
    for (let i = 0; i < lengthArray; i++) {
      let index = array[i];
      let question = await Question.findOne({
        codigo: { $eq: index },
        tipoPregunta: { $eq: 2 },
      });
      arrayQuestions = arrayQuestions.concat(question);
      let arrayAns = [];
      for (const id of question.respuestas) {
        respuesta = await Answer.findOne({ pregunta: id });
        arrayAns.push(respuesta);
      }
      arrayQuestions[i].respuestas = arrayAns;
    }
    let newQuiz = new Quiz({
      cantidad: quantity,
    });
    newQuiz.preguntas = arrayQuestions;
    let savedQuiz = await newQuiz.save();
    return res.status(200).json(savedQuiz);
  } catch (err) {
    let message = "Error no definido get Quiz, cantidad excedida " + err;
    return res.status(400).json({
      success: false,
      message: message,
    });
  }
};

exports.quiz_get_answers = async (req, res) => {
  const { answers } = req.body;
  console.log(answers);
  try {
    let arrayAnswers = [];
    for (const ans of answers) {
      respuesta = await Answer.findOne({ pregunta: ans });
      arrayAnswers.push(respuesta);
    }
    return res.status(200).json(arrayAnswers);
  } catch (error) {
    let message = "Error no definido get Answers: " + error;
    return res.status(400).json({
      success: false,
      message: message,
    });
  }
};

function generateRandomArray(lengthArray) {
  let arrayNumbers = [];
  for (let i = 0; i < lengthArray; i++) {
    let n = Math.floor(Math.random() * lengthArray + 1);
    if (arrayNumbers.includes(n) == false) {
      arrayNumbers = arrayNumbers.concat(n);
    } else {
      i = i - 1;
    }
  }
  return arrayNumbers;
}

function listenForMessages() {
  // References an existing subscription
  const subscription = pubSubClient.subscription(subscriptionName);

  // Create an event handler to handle messages
  const messageHandler = (message) => {
    console.log(`\tData: ${message.data}`);
    const data = JSON.parse(`${message.data}`);
    addElement(data);

    // "Ack" (acknowledge receipt of) the message
    message.ack();
  };

  // Listen for new messages until timeout is hit
  subscription.on("message", messageHandler);
}

async function addElement(data) {
  try {
    if (data.textoRespuesta) {
      let newRespuesta = new Answer({
        textoRespuesta: data.textoRespuesta,
        imagenRespuesta: data.imagenRespuesta,
        esCorrecta: data.esCorrecta,
        pregunta: data.id,
      });
      newRespuesta.save();
    } else if (data.tipoPregunta == 1) {
      try {
        let result = await Question.find({
          codigo: data.codigo,
          tipoPregunta: 0,
        });
        result.forEach(async (element) => {
          await Question.updateOne(
            { codigo: data.codigo, tipoPregunta: 1 },
            { $push: { subPreguntas: element._id } }
          );
        });
      } catch (error) {
        console.error("Error Find/Update Question: ", error);
      }
    } else if (data.codigo) {
      let question = new Question({
        textoPregunta: data.textoPregunta,
        imagenPregunta: data.imagenPregunta,
        tipoPregunta: data.tipoPregunta,
        codigo: data.codigo,
        peso: data.peso,
        respuestas: data.respuestas,
      });
      await question.save();
    }
  } catch (error) {
    console.log("Elemento no agregado: ", error);
  }
}
