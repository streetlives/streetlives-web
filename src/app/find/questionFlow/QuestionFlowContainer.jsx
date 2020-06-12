import React, { Component } from 'react';
import { withRouter } from 'react-router';
import QuestionFlow from './QuestionFlow';
import categoryQuestions from './categoryQuestions';

class QuestionFlowContainer extends Component {
  state = {
    answers: {},
  };

  componentDidMount() {
    if (!this.questions) {
      const { categoryName } = this.props.match.params;
      this.props.history.replace(`/find/${categoryName}`);
    }
  }

  getCurrentQuestion = () => {
    const { question } = this.props.match.params;
    return question != null ? parseInt(question, 10) : null;
  };

  goToResults = (answers) => {
    const { categoryName } = this.props.match.params;
    const paramStrings = Object.keys(answers)
      .filter(param => answers[param] != null)
      .map(param => `${param}=${answers[param]}`);
    const queryString = paramStrings.length ? `?${paramStrings.join('&')}` : '';
    this.props.history.push(`/find/${categoryName}${queryString}`);
  };

  questions = categoryQuestions[this.props.match.params.categoryName.trim().toLowerCase()];

  startQuestions = () => {
    const { categoryName } = this.props.match.params;
    this.props.history.push(`/find/${categoryName}/questions/0`);
  }

  goToNextQuestion = (nextParam) => {
    const { categoryName } = this.props.match.params;
    const question = this.getCurrentQuestion();

    let nextQuestionIndex;
    if (nextParam) {
      nextQuestionIndex = this.questions.findIndex(({ param }) => param === nextParam);
    } else {
      nextQuestionIndex = parseInt(question, 10) + 1;
    }

    const nextQuestion = this.questions[nextQuestionIndex];
    if (nextQuestion) {
      this.props.history.push(`/find/${categoryName}/questions/${nextQuestionIndex}`);
    } else {
      this.goToResults(this.state.answers);
    }
  };

  goBack = () => this.props.history.goBack();

  answerQuestion = ({
    param,
    answer,
    nextParam,
    skipToEnd,
  }) => {
    this.setState({
      answers: {
        ...this.state.answers,
        [param]: answer,
      },
    }, () => (skipToEnd ? this.goToResults(this.state.answers) : this.goToNextQuestion(nextParam)));
  };

  skipQuestion = () => {
    const question = this.getCurrentQuestion();
    const { param } = this.questions[question];
    this.setState({
      answers: {
        ...this.state.answers,
        [param]: undefined,
      },
    }, this.goToNextQuestion);
  }

  quitFlow = () => this.goToResults({});

  render() {
    if (!this.questions) {
      return null;
    }

    const { answers } = this.state;
    const { categoryName } = this.props.match.params;
    const question = this.getCurrentQuestion();

    return (
      <QuestionFlow
        categoryName={categoryName}
        questions={this.questions}
        hasAnsweredPrompt={question != null}
        questionIndex={question}
        answers={answers}
        startQuestions={this.startQuestions}
        answerQuestion={this.answerQuestion}
        skipQuestion={this.skipQuestion}
        goBack={this.goBack}
        quitFlow={this.quitFlow}
      />
    );
  }
}

export default withRouter(QuestionFlowContainer);
