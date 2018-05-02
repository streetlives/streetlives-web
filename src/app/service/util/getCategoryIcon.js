export default function getCategoryIcon(categoryName) {
  switch (categoryName) {
    case 'Food':
      return 'cutlery';
    case 'Shelter':
      return 'home';
    case 'Other':
    default:
      return 'ellipsis-h';
  }
}
