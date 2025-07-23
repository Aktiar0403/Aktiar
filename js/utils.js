export const referenceRanges = {
  creatinine: { min: 0.6, max: 1.3 },
  egfr: { min: 60, max: 120 },
  urea: { min: 10, max: 50 },
  potassium: { min: 3.5, max: 5.2 },
  sodium: { min: 135, max: 145 },
  calcium: { min: 8.5, max: 10.5 },
  phosphate: { min: 2.5, max: 4.5 },
  hemoglobin: { min: 12, max: 16 },
  albumin: { min: 3.5, max: 5.5 },
  sbp: { min: 90, max: 140 },
  dbp: { min: 60, max: 90 },
  weight: { min: 30, max: 200 }
};

export function evaluateCondition(cond, visit) {
  const sectionData = visit[cond.section];
  if (!sectionData) return false;

  const val = sectionData[cond.field];
  if (val === undefined) return false;

  switch (cond.operator) {
    case "<": return parseFloat(val) < cond.value;
    case ">": return parseFloat(val) > cond.value;
    case "==": return val == cond.value;
    case "in": return cond.value.includes(val);
    default: return false;
  }
}

export function renderFields(data) {
  return Object.entries(data)
    .map(([key, value]) => {
      if (!value) value = 'Not provided';
      let style = '';
      if (referenceRanges[key]) {
        const { min, max } = referenceRanges[key];
        const num = parseFloat(value);
        if (!isNaN(num)) {
          if (num < min) style = 'color: orange;';
          else if (num > max) style = 'color: red;';
          else style = 'color: green;';
        }
      }
      return `<li><strong>${key}:</strong> <span style="${style}">${value}</span></li>`;
    })
    .join('');
}