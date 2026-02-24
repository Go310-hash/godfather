/**
 * Registration fee per class (XAF)
 * Form 1: 50,000; +5,000 per level up to Upper Sixth
 */
const CLASS_ORDER = [
  'Form 1',
  'Form 2',
  'Form 3',
  'Form 4',
  'Form 5',
  'Lower Sixth',
  'Upper Sixth',
];

const BASE_FEE = 50000;
const INCREMENT = 5000;

const feesByClass = {};
CLASS_ORDER.forEach((cls, index) => {
  feesByClass[cls] = BASE_FEE + index * INCREMENT;
});

function getFeeForClass(className) {
  return feesByClass[className] != null ? feesByClass[className] : null;
}

function getAllFees() {
  return { ...feesByClass };
}

module.exports = {
  CLASS_ORDER,
  getFeeForClass,
  getAllFees,
};
