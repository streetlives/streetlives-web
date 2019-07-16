import ClothingForQuestion from './ClothingForQuestion';
import GenderQuestion from './GenderQuestion';
import PhotoIdQuestion from './PhotoIdQuestion';
import ZipcodeQuestion from './ZipcodeQuestion';

const QuestionsInOrder = [
  { param: 'clothesDemographic', component: ClothingForQuestion },
  { param: 'gender', component: GenderQuestion },
  { param: 'photoId', component: PhotoIdQuestion },
  { param: 'zipcode', component: ZipcodeQuestion },
];

export default QuestionsInOrder;
