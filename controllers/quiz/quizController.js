const Question = require("../../models/Question");

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
  try {
    let number = Number(quantity);
    return res.status(200).json(number);
  } catch (err) {
    let message = "Error no definido";
    return res.status(400).json({
      success: false,
      message: message,
    });
  }
};

function listenForMessages() {
  // References an existing subscription
  const subscription = pubSubClient.subscription(subscriptionName);

  // Create an event handler to handle messages
  let messageCount = 0;
  const messageHandler = (message) => {
    console.log(`\tData: ${message.data}`);
    const data = JSON.parse(`${message.data}`);
    addElement(data);
    messageCount += 1;

    // "Ack" (acknowledge receipt of) the message
    message.ack();
  };

  // Listen for new messages until timeout is hit
  subscription.on("message", messageHandler);
}

async function addElement(data) {
  let question = new Question({
    textoPregunta: data.textoPregunta,
    imagenPregunta: data.imagenPregunta,
    tipoPregunta: data.tipoPregunta,
    codigo: data.codigo,
    peso: data.peso,
  });
  try {
    await question.save();
    if (data.tipoPregunta == 1) {
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
        console.error("Error al buscar: ", error);
      }
    }
  } catch (error) {
    console.log("Elemento no agregado: ", error);
  }
}
