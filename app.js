//Array to hold question information. Would normally be pulled from a database.
var QUESTIONS = [
  {
    text: 'Who invented the first laptop?',
    choices: ['IBM','Apple','Tandy','Osborne'],
    correctChoiceIndex: 3
  },
  {
    text: 'Which of these is NOT an internet search engine?',
    choices: ['Archie','Veronica','Betty','Jughead'],
    correctChoiceIndex: 2
  },
  {
    text: 'What year was Facebook Founded?',
    choices: ['2003','2004','2005','2006'],
    correctChoiceIndex: 1
  },
  {
    text: 'How many bytes are in a megabyte',
    choices: ['1 trillion','1 billion','1 million','1 thousand'],
    correctChoiceIndex: 2
  },
  {
    text: 'Which of these is a type of computer monitor?',
    choices: ['CRT','RCT','TCR','CTR'],
    correctChoiceIndex: 0
  },
];


//Defines quiz object
var Quiz = {

  score: 0,
  questions: [],
  currentQuestionIndex: 0,

  // Returns current question
  currentQuestion: function() {
    return this.questions[this.currentQuestionIndex]
  },

  // Returns the header feedback text of whether or not an answer is wrong or correct
  answerFeedbackHeader: function(isCorrect) {
    return isCorrect ? "<h1 class='user-was-incorrect'>CORRECT</h1>" :
      "<h1 class='user-was-incorrect'>WRONG!</>";
  },

  // Returns feedback paragraph text depending on whether the answer is right or wrong
  answerFeedbackText: function(isCorrect) {

    var praises = 'The Force Is Strong In You Padawan';
    var admonishments = 'You Have Veered From The Force Padawan';

      var choices = isCorrect ? praises : admonishments;
    return choices;

  },

  //controls the text displayed on the feedback button.
  seeNextText: function() {
    return this.currentQuestionIndex <
      this.questions.length - 1 ? "Next Question" : "See Your Score";

  },

  //controls the text displayed for the current question number in reference to the total nummber of questions
  questionCountText: function() {
    return (this.currentQuestionIndex + 1) + "/" +
      this.questions.length + ": ";
  },

  //controls the text displayed at the end of the quiz. It shows how many the user 
  //got right in reference to the total number of questions
  finalFeedbackText: function() {
    return "You got " + this.score + " out of " +
      this.questions.length + " questions right.";
  },

  // this method compares the user's answer to
  // the correct answer for the current question
  scoreUserAnswer: function(answer) {
    var correctChoice = this.currentQuestion().choices[this.currentQuestion().correctChoiceIndex];
    if (answer === correctChoice) {
      this.score ++;
    }
    return answer === correctChoice;
  }
}

//invokes a new instance of the quiz object defined above
function getNewQuiz() {
  var quiz = Object.create(Quiz);
  // Sets the quiz objects question array to the main Questions array that hold all the questions.
  quiz.questions = QUESTIONS;
  return quiz
}


// The functions below manipulate the DOM to show the proper html cloned template layout
//when a action is take by a user [answer question, show feedback, diplay fianal results, quiz start]

function makeCurrentQuestionElem(quiz) {

//clones a copy of the html question layout from indext.html
  var questionElem = $("#js-question-template" ).children().clone();
  var question = quiz.currentQuestion();
//sets the question count text and question text in the cloned quesiton template html.
  questionElem.find(".js-question-count").text(quiz.questionCountText());
  questionElem.find('.js-question-text').text(question.text);

  //clones the ol and li and adds radio buttion add options to the cloned html template
  for (var i = 0; i < question.choices.length; i++) {

    var choice = question.choices[i];
    var choiceElem = $( "#js-choice-template" ).children().clone();
    choiceElem.find("input").attr("value", choice);
    var choiceId = "js-question-" + quiz.currentQuestionIndex + "-choice-" + i;
    choiceElem.find("input").attr("id", choiceId)
    choiceElem.find("label").text(choice);
    choiceElem.find("label").attr("for", choiceId);
    questionElem.find(".js-choices").append(choiceElem);
  };

  return questionElem;
}

//clones the main feedback template in the index.html file. It displays feedback to the user
//on whether or not they got the question right.
function makeAnswerFeedbackElem(isCorrect, correctAnswer, quiz) {
  var feedbackElem = $("#js-answer-feedback-template").children().clone();
  feedbackElem.find(".js-feedback-header").html(
    quiz.answerFeedbackHeader(isCorrect));
  feedbackElem.find(".js-feedback-text").text(
    quiz.answerFeedbackText(isCorrect));
  feedbackElem.find(".js-see-next").text(quiz.seeNextText());
  return feedbackElem;
}

function makeFinalFeedbackElem(quiz) {
  var finalFeedbackElem = $("#js-final-feedback-template").clone();
  finalFeedbackElem.find(".js-results-text").text(quiz.finalFeedbackText());
  return finalFeedbackElem;
}


// this function just listens for when the user clicks the see next
// question. if there are more questions, it displays the next one,
// otherwise it displays the final feedback
function handleSeeNext(quiz, currentQuestionElem) {

  $("main").on("click", ".js-see-next", function(event) {

    if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
      // manually remove event listener on the `.js-see-next` because they
      // otherwise continue occuring for previous, inactive questions
      $("main").off("click", ".js-see-next");
      quiz.currentQuestionIndex ++;
      $("main").html(makeCurrentQuestionElem(quiz));
    }
    else {
      $("main").html(makeFinalFeedbackElem(quiz))
    }
  });
}

// When user submits an answer it grades the qustion and set values for the feedback template.
function handleAnswers(quiz) {
  $("main").on("submit", "form[name='current-question']", function(event) {
    event.preventDefault();
    var answer = $("input[name='user-answer']:checked").val();
    quiz.scoreUserAnswer(answer);
    var question = quiz.currentQuestion();
    var correctAnswer = question.choices[question.correctChoiceIndex]
    var isCorrect = answer === correctAnswer;
    handleSeeNext(quiz);
    $("main").html(makeAnswerFeedbackElem(isCorrect, correctAnswer, quiz));
  });
}

// display the quiz start content
function handleQuizStart() {
  $("main").html($("#js-start-template").clone());
  $("form[name='game-start']").submit(function(event) {
    var quiz = getNewQuiz();
    event.preventDefault();
    $("main").html(makeCurrentQuestionElem(quiz));
    handleAnswers(quiz);
    handleRestarts();
  });
}

//When user clicks restart this resets the game
function handleRestarts() {
  $("main").on("click", ".js-restart-game", function(event){
    event.preventDefault();
    // this removes all event listeners from `<main>` cause we want them
    // set afresh by `handleQuizStart`
    $("main").off();
    handleQuizStart();
  });
}

//Initially loads the quiz start up template
$(document).ready(function() {
  handleQuizStart();
});