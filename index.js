const express = require("express");
const app = express();

require("./mongo_db");

// built-in middleware for json
app.use(express.json());

//Routes applicant
app.use("/quiz", require("./routes/quiz/get_quiz"));
// app.use("/applicant", require("./routes/applicant/post_applicant"));

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
