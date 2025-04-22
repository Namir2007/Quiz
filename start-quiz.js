let gameId = "";
let currentQuestion = null;

async function startQuiz() {
  try {
    const token = localStorage.getItem("authToken");

    const response = await fetch("https://quiz-be-zeta.vercel.app/game/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Greška pri pokretanju kviza.");
    }

    const data = await response.json();

    gameId = data.gameId;
    currentQuestion = data.question;

    if (
      currentQuestion &&
      currentQuestion.answers &&
      currentQuestion.answers.length > 0
    ) {
      showQuestion(currentQuestion);
    } else {
      throw new Error("Pitanje ili odgovori nisu ispravno učitani.");
    }
  } catch (error) {
    console.error("Greška:", error);
  }
}

function showQuestion(question) {
  const questionText = document.querySelector(".text-content");
  const options = document.querySelectorAll(".option-btn");
  const counter = document.querySelector(".question-box span");

  questionText.textContent = question.questionText;
  counter.textContent = `Pitanje ${question.questionNumber} od ${question.totalQuestions}`;

  question.answers.forEach((answer, index) => {
    const letter = String.fromCharCode(65 + index); // A, B, C, D
    options[index].innerHTML = `<span>${letter}</span> ${answer.answerText}`;
    options[index].onclick = () => submitAnswer(question._id, answer._id);
  });
}

async function submitAnswer(questionId, answerId) {
  try {
    const token = localStorage.getItem("authToken");

    const response = await fetch(
      "https://quiz-be-zeta.vercel.app/game/answer",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameId: gameId,
          questionId: questionId,
          answer: answerId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Greška pri slanju odgovora.");
    }

    const data = await response.json();

    if (data.finished) {
      window.location.href = "finish-page.html";
    } else {
      currentQuestion = data.nextQuestion;
      showQuestion(currentQuestion);
    }
  } catch (error) {
    console.error("Greška:", error);
  }
}

window.addEventListener("DOMContentLoaded", startQuiz);
