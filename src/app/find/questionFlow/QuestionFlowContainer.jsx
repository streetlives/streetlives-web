import React, { Component } from 'react';
import { withRouter } from 'react-router';
import QuestionFlow from './QuestionFlow';
import categoryQuestions from './categoryQuestions';

class QuestionFlowContainer extends Component {
  state = {
    questionIndex: null,
    answers: {},
    hasAnsweredPrompt: false,
  };

  componentDidMount() {
    if (!this.questions) {
      this.goToResults({});
    }
  }

  goToResults = (answers) => {
    const { categoryName } = this.props.match.params;
    const paramStrings = Object.keys(answers)
      .filter(param => answers[param] != null)
      .map(param => `${param}=${answers[param]}`);
    const queryString = paramStrings.length ? `?${paramStrings.join('&')}` : '';
    this.props.history.push(`/find/${categoryName}${queryString}`);
  };

  questions = categoryQuestions[this.props.match.params.categoryName.trim().toLowerCase()];

  startQuestions = () => this.setState({ hasAnsweredPrompt: true, questionIndex: 0 });

  goToNextQuestion = () => {
    this.setState({ questionIndex: this.state.questionIndex + 1 }, () => {
      const nextQuestion = this.questions[this.state.questionIndex];
      if (!nextQuestion) {
        this.goToResults(this.state.answers);
      }
    });
  };

  goBack = () => {
    const { questionIndex } = this.state;
    if (questionIndex && questionIndex >= 1) {
      this.setState({ questionIndex: questionIndex - 1 });
    } else {
      this.setState({ hasAnsweredPrompt: false });
    }
  };

  answerQuestion = ({ param, answer }) => {
    this.setState({
      answers: {
        ...this.state.answers,
        [param]: answer,
      },
    }, this.goToNextQuestion);
  };

  skipQuestion = () => {
    const { param } = this.questions[this.state.questionIndex];
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

    return (
      <QuestionFlow
        categoryName={this.props.match.params.categoryName}
        questions={this.questions}
        hasAnsweredPrompt={this.state.hasAnsweredPrompt}
        questionIndex={this.state.questionIndex}
        answers={this.state.answers}
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
