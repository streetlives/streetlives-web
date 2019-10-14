import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../components/modal';
import Header from '../../../components/header';
import Icon from '../../../components/icon';
import Button from '../../../components/button';
import ProgressBar from '../../../components/progressBar';
import Prompt from './Prompt';
import SkipFlowConfirmation from './SkipFlowConfirmation';
import QuitFlowConfirmation from './QuitFlowConfirmation';

class QuestionFlow extends Component {
  state = {
    isConfirmingQuit: false,
    isConfirmingSkip: false,
  };

  confirmQuitFlow = () => this.setState({ isConfirmingQuit: true });
  confirmSkipFlow = () => this.setState({ isConfirmingSkip: true });
  closeConfirmation = () => this.setState({ isConfirmingQuit: false, isConfirmingSkip: false });

  startQuestions = () => {
    this.closeConfirmation();
    this.props.startQuestions();
  }

  renderQuestion = () => {
    const {
      questions,
      questionIndex,
      answers,
      answerQuestion,
    } = this.props;

    const currentQuestion = questions[questionIndex || 0];
    if (!currentQuestion) {
      return null;
    }

    const QuestionComponent = currentQuestion.component;
    const { param, question } = currentQuestion;

    return (
      <div>
        <Header size="medium" className="text-left mb-5">{question}</Header>
        <QuestionComponent
          value={answers[param]}
          onAnswer={answer => answerQuestion({ param, answer })}
        />
      </div>
    );
  };

  renderQuestionHeader = () => {
    const {
      questions,
      questionIndex,
      categoryName,
      goBack,
    } = this.props;

    const questionsNum = questions && questions.length;
    if (!questionsNum) {
      return null;
    }

    return (
      <div>
        <Icon
          name="chevron-left"
          onClick={goBack}
          style={{
            position: 'absolute',
            left: 0,
            top: '0.2em',
          }}
        />
        <Header size="medium" className="mx-4 d-inline text-uppercase">
          {categoryName}
        </Header>
        <ProgressBar step={questionIndex} steps={questionsNum} />
      </div>
    );
  };

  render() {
    const {
      categoryName,
      hasAnsweredPrompt,
      skipQuestion,
      quitFlow,
    } = this.props;
    const { isConfirmingQuit, isConfirmingSkip } = this.state;

    return (
      <Modal className="pb-4">
        {isConfirmingQuit &&
          <QuitFlowConfirmation onQuit={quitFlow} onClose={this.closeConfirmation} />}
        {isConfirmingSkip &&
          <SkipFlowConfirmation onSkip={quitFlow} onAnswer={this.startQuestions} />}

        <div className="mx-3 mt-4 position-relative">
          {hasAnsweredPrompt && this.renderQuestionHeader()}
          <Icon
            name="times"
            onClick={this.confirmQuitFlow}
            style={{
              position: 'absolute',
              right: 0,
              top: '0.2em',
            }}
          />
        </div>
        <div className="px-3 mb-5">
          {!hasAnsweredPrompt && (
            <Prompt
              categoryName={categoryName}
              onConfirm={this.startQuestions}
              onSkip={this.confirmSkipFlow}
            />
          )}
          {hasAnsweredPrompt && (
            <div className="px-2 mb-5">
              {this.renderQuestion()}
              <div className="p-3 mx-2 fixed-bottom">
                <Button onClick={skipQuestion} secondary fluid className="position-relative">
                  <Icon
                    name="times"
                    style={{
                      position: 'absolute',
                      left: 16,
                      lineHeight: 'inherit',
                    }}
                  />
                  Skip this question
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  }
}

QuestionFlow.propTypes = {
  categoryName: PropTypes.string.isRequired,
  hasAnsweredPrompt: PropTypes.bool.isRequired,
  questions: PropTypes.arrayOf(PropTypes.shape({
    component: PropTypes.func,
    param: PropTypes.string.isRequired,
  })).isRequired,
  questionIndex: PropTypes.number,
  answers: PropTypes.objectOf(PropTypes.any).isRequired,
  startQuestions: PropTypes.func.isRequired,
  answerQuestion: PropTypes.func.isRequired,
  skipQuestion: PropTypes.func.isRequired,
  goBack: PropTypes.func.isRequired,
  quitFlow: PropTypes.func.isRequired,
};

export default QuestionFlow;
