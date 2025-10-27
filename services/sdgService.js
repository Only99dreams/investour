// services/sdgService.js
const SDG_GOALS = [1, 4, 5, 8, 10];

exports.validateSDG = (sdgArray) => {
  return sdgArray.every(sdg => SDG_GOALS.includes(sdg));
};

exports.getSDGDetails = (goal) => {
  const details = {
    1: { name: 'No Poverty', color: '#E5243B' },
    4: { name: 'Quality Education', color: '#C5192D' },
    5: { name: 'Gender Equality', color: '#DD1367' },
    8: { name: 'Decent Work and Economic Growth', color: '#A21942' },
    10: { name: 'Reduced Inequalities', color: '#CD202D' }
  };
  return details[goal] || { name: `SDG ${goal}`, color: '#000000' };
};