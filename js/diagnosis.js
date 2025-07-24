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
    case "in": return Array.isArray(cond.value) && cond.value.includes(val);
    default: return false;
  }
}

// Handles simple condition logic


export function evaluateRule(rule, visit) {
  if (rule.type === "simple") {
    return evaluateCondition({
      section: "blood", // default section for simple rules
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

export function getMissingFieldsForRule(rule, visit) {
  const missing = [];

  const conditions = rule.type === "simple"
    ? [{ section: "blood", field: rule.test }]
    : rule.conditions;

  for (const cond of conditions) {
    const sectionData = visit[cond.section];
    if (!sectionData || sectionData[cond.field] === undefined || sectionData[cond.field] === "") {
      missing.push(`${cond.section}.${cond.field}`);
    }
  }

  return missing;
}



export function generateDiagnosisText(visit) {
  const matched = [];
  const missingSuggestions = [];

  for (const rule of diagnosisRules) {
    if (evaluateRule(rule, visit)) {
      matched.push(`- ${rule.suggestion} — *${rule.reason}*`);
    } else {
      const missing = getMissingFieldsForRule(rule, visit);
      if (missing.length > 0) {
        missingSuggestions.push({
          suggestion: rule.suggestion,
          reason: rule.reason,
          missing
        });
      }
    }
  }

  if (matched.length > 0) {
    return matched.join("\n");
  }

  if (missingSuggestions.length > 0) {
    const lines = missingSuggestions.slice(0, 3).map(ms =>
      `🧪 To evaluate *${ms.suggestion}*, consider testing: ${ms.missing.join(", ")}`
    );
    return "No confirmed diagnosis yet.\n" + lines.join("\n");
  }

  return "No diagnosis match and no major data gaps detected.";
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
