export default function getCategoryIcon(categoryName) {
  switch (categoryName) {
    case 'Food':
      return 'cutlery';
    case 'Shelter':
      return 'home';
    case 'Personal Care':
      return 'shower';
    case 'Clothing':
      return 'tshirt';
    case 'Other':
    default:
      return 'ellipsis-h';
  }
}
