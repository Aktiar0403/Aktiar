export let diagnosisRules = [];

export function loadDiagnosisRules() {
  diagnosisRules = JSON.parse(localStorage.getItem('diagnosisRules')) || getDefaultRules();
  saveDiagnosisRules();
  return diagnosisRules;
}

export function saveDiagnosisRules() {
  localStorage.setItem('diagnosisRules', JSON.stringify(diagnosisRules));
}

export function addDiagnosisRule(rule) {
  diagnosisRules.push(rule);
  saveDiagnosisRules();
}

export function deleteDiagnosisRule(index) {
  diagnosisRules.splice(index, 1);
  saveDiagnosisRules();
}

// Handles simple condition logic
export function evaluateCondition(cond, visit) {
  const sectionData = visit[cond.section];
  if (!sectionData) return false;

  const val = sectionData[cond.field];
  if (val === undefined) return false;

  switch (cond.operator) {
    case "<": return parseFloat(val) < cond.value;
    case "<=": return parseFloat(val) <= cond.value;
    case ">": return parseFloat(val) > cond.value;
    case ">=": return parseFloat(val) >= cond.value;
    case "==": return val == cond.value;
    case "!=": return val != cond.value;
    case "in": return cond.value.includes(val);
    default: return false;
  }
}

export function evaluateRule(rule, visit) {
  if (rule.type === "simple") {
    return evaluateCondition({
      section: "blood",
      field: rule.test,
      operator: rule.operator,
      value: rule.threshold
    }, visit);
  }

  if (rule.type === "multi" || rule.type === "compound") {
    return rule.conditions.every(cond => evaluateCondition(cond, visit));
  }

  return false;
}

export function generateDiagnosisText(visit) {
  const matches = [];
  for (const rule of diagnosisRules) {
    if (evaluateRule(rule, visit)) {
      matches.push(`- ${rule.suggestion} (Reason: ${rule.reason})`);
    }
  }
  return matches.length ? matches.join('\n') : "No diagnosis suggestions matched.";
}

export function getDefaultRules() {
  return [
    {
      "type": "simple",
      "test": "egfr",
      "operator": "<",
      "threshold": 60,
      "suggestion": "CKD Stage 3",
      "reason": "Moderate reduction in kidney function"
    },
    {
      "type": "compound",
      "conditions": [
        { "section": "blood", "field": "egfr", "operator": "<", "value": 30 },
        { "section": "blood", "field": "hemoglobin", "operator": "<", "value": 11 }
      ],
      "suggestion": "CKD Stage 4 with Anemia",
      "reason": "Severe kidney function decline with anemia"
    }
    // Add more clean rules here
  ];
}
