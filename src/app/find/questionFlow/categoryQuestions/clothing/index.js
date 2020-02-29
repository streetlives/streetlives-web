import ClothingForQuestion from './ClothingForQuestion';
import GenderQuestion from './GenderQuestion';
import PhotoIdQuestion from './PhotoIdQuestion';
import ZipcodeQuestion from './ZipcodeQuestion';

const QuestionsInOrder = [
  {
    param: 'wearerAge',
    component: ClothingForQuestion,
    question: 'Who are the clothes for?',
  },
  {
    param: 'gender',
    component: GenderQuestion,
    question: 'Which gender clothing do you prefer?',
  },
  {
    param: 'photoId',
    component: PhotoIdQuestion,
    question: 'Can you provide your photo ID when you go?',
  },
  {
    param: 'zipcode',
    component: ZipcodeQuestion,
    question: 'Please provide the ZIP at your registered address',
  },
];

export default QuestionsInOrder;
