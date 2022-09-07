const express = require("express");
const router = express.Router();
const app = express();

// built-in middleware for json
app.use(express.json());

//Controller Quiz
const applicant_controller = require("../../controllers/quiz/quizController");

//GET quiz by quantity
router.get("/:quantity", applicant_controller.quiz_get_byQuantity);
router.get("/answer/answers", applicant_controller.quiz_get_answers);

module.exports = router;
