export let diagnosisRules = [];

export function loadDiagnosisRules() {
  diagnosisRules = JSON.parse(localStorage.getItem('diagnosisRules')) || getDefaultRules();
  saveDiagnosisRules();
  return diagnosisRules;
}

export function saveDiagnosisRules() {
  localStorage.setItem('diagnosisRules', JSON.stringify(diagnosisRules));
}

export function getDefaultRules() {
  return [
  // Existing CKD Staging
  { type: "simple", test: "egfr", operator: "<", threshold: 90, suggestion: "CKD Stage 2", reason: "KDIGO guidelines" },
  { type: "simple", test: "egfr", operator: "<", threshold: 60, suggestion: "CKD Stage 3", reason: "Moderate reduction" },
  { type: "simple", test: "egfr", operator: "<", threshold: 30, suggestion: "CKD Stage 4", reason: "Severe reduction" },
  { type: "simple", test: "egfr", operator: "<", threshold: 15, suggestion: "CKD Stage 5 (ESRD)", reason: "Kidney failure" },
  
  // Albuminuria
  { type: "simple", test: "acr", operator: ">", threshold: 30, suggestion: "Microalbuminuria", reason: "Early kidney damage" },
  { type: "simple", test: "acr", operator: ">", threshold: 300, suggestion: "Nephrotic-range proteinuria", reason: "Severe glomerular disease" },

  // Electrolytes
  { type: "simple", test: "sodium", operator: "<", threshold: 135, suggestion: "Hyponatremia", reason: "Low sodium level" },
  { type: "simple", test: "sodium", operator: ">", threshold: 145, suggestion: "Hypernatremia", reason: "High sodium level" },
  { type: "simple", test: "potassium", operator: "<", threshold: 3.5, suggestion: "Hypokalemia", reason: "Low potassium level" },
  { type: "simple", test: "potassium", operator: ">", threshold: 5.2, suggestion: "Hyperkalemia", reason: "High potassium level" },
  
  // Calcium & Phosphate
  { type: "simple", test: "calcium", operator: "<", threshold: 8.5, suggestion: "Hypocalcemia", reason: "Low calcium level" },
  { type: "simple", test: "calcium", operator: ">", threshold: 10.5, suggestion: "Hypercalcemia", reason: "High calcium level" },
  { type: "simple", test: "phosphate", operator: "<", threshold: 2.5, suggestion: "Hypophosphatemia", reason: "Low phosphate" },
  { type: "simple", test: "phosphate", operator: ">", threshold: 4.5, suggestion: "Hyperphosphatemia", reason: "High phosphate" },

  // Anemia
  { type: "simple", test: "hemoglobin", operator: "<", threshold: 12, suggestion: "Anemia", reason: "Low hemoglobin" },

  // Hypoalbuminemia
  { type: "simple", test: "albumin", operator: "<", threshold: 3.5, suggestion: "Hypoalbuminemia", reason: "Low serum albumin" },

  // Proteinuric CKD
  {
    type: "multi",
    conditions: [
      { section: "blood", field: "egfr", operator: "<", value: 60 },
      { section: "urine", field: "acr", operator: ">", value: 300 }
    ],
    suggestion: "Proteinuric CKD",
    reason: "Combined eGFR reduction and albuminuria."
  },

  // Advanced Diabetic Nephropathy
  {
    type: "compound",
    conditions: [
      { section: "medical", field: "diabetes", operator: "==", value: true },
      { section: "blood", field: "egfr", operator: "<", value: 30 },
      { section: "urine", field: "acr", operator: ">", value: 300 },
      { section: "ultrasound", field: "echogenicity", operator: "in", value: ["Mildly increased", "Markedly increased"] }
    ],
    suggestion: "Advanced Diabetic Nephropathy",
    reason: "Very low eGFR with severe albuminuria and echogenic changes."
  },

  // Advanced Hypertensive Nephrosclerosis
  {
    type: "compound",
    conditions: [
      { section: "medical", field: "hypertension", operator: "==", value: true },
      { section: "blood", field: "egfr", operator: "<", value: 45 },
      { section: "ultrasound", field: "kidneySize", operator: "==", value: "Decreased" },
      { section: "ultrasound", field: "echogenicity", operator: "==", value: "Mildly increased" }
    ],
    suggestion: "Advanced Hypertensive Nephrosclerosis",
    reason: "Decreased kidney size and echogenicity with reduced eGFR."
  },

  // Nephrotic Syndrome
  {
    type: "compound",
    conditions: [
      { section: "urine", field: "acr", operator: ">", value: 300 },
      { section: "urine", field: "urine-protein-24h", operator: ">", value: 3.5 },
      { section: "symptoms", field: "edema", operator: "==", value: true }
    ],
    suggestion: "Nephrotic Syndrome",
    reason: "Heavy proteinuria with edema."
  },

  // CKD Stage 5 with Metabolic Complications
  {
    type: "compound",
    conditions: [
      { section: "blood", field: "egfr", operator: "<", value: 15 },
      { section: "blood", field: "potassium", operator: ">", value: 5.5 },
      { section: "blood", field: "bicarbonate", operator: "<", value: 18 }
    ],
    suggestion: "CKD Stage 5 with Metabolic Complications",
    reason: "Very low eGFR with hyperkalemia and metabolic acidosis."
  },

  // AKI with Hyperkalemia
  {
    type: "compound",
    conditions: [
      { section: "blood", field: "creatinine", operator: ">", value: 2 },
      { section: "blood", field: "potassium", operator: ">", value: 5.5 }
    ],
    suggestion: "Possible AKI with Hyperkalemia",
    reason: "Elevated creatinine and potassium suggest AKI."
  },

  // CKD Stage 4 with Anemia
  {
    type: "compound",
    conditions: [
      { section: "blood", field: "egfr", operator: "<", value: 30 },
      { section: "blood", field: "hemoglobin", operator: "<", value: 11 }
    ],
    suggestion: "CKD Stage 4 with Anemia",
    reason: "Severe reduction in eGFR with anemia."
  }

  [
  {
    "type": "simple",
    "test": "egfr",
    "operator": "<",
    "threshold": 45,
    "suggestion": "Moderate CKD (Stage 3B)",
    "reason": "eGFR between 30-44 indicates Stage 3B CKD per KDIGO."
  },
  {
    "type": "simple",
    "test": "acr",
    "operator": ">",
    "threshold": 1000,
    "suggestion": "Massive Proteinuria",
    "reason": "ACR above 1000 suggests nephrotic-range proteinuria."
  },
  {
    "type": "multi",
    "conditions": [
      { "section": "blood", "field": "egfr", "operator": "<", "value": 30 },
      { "section": "urine", "field": "acr", "operator": ">", "value": 300 }
    ],
    "suggestion": "Severe Proteinuric CKD",
    "reason": "Advanced CKD with high albuminuria."
  },
  {
    "type": "compound",
    "conditions": [
      { "section": "medical", "field": "diabetes", "operator": "==", "value": true },
      { "section": "blood", "field": "egfr", "operator": "<", "value": 45 },
      { "section": "urine", "field": "acr", "operator": ">", "value": 300 },
      { "section": "ultrasound", "field": "echogenicity", "operator": "in", "value": ["Mildly increased", "Markedly increased"] }
    ],
    "suggestion": "Advanced Diabetic Nephropathy",
    "reason": "Diabetes with reduced eGFR, heavy proteinuria, abnormal USG."
  },
  {
    "type": "compound",
    "conditions": [
      { "section": "medical", "field": "hypertension", "operator": "==", "value": true },
      { "section": "blood", "field": "egfr", "operator": "<", "value": 60 },
      { "section": "ultrasound", "field": "kidneySize", "operator": "==", "value": "Decreased" },
      { "section": "ultrasound", "field": "echogenicity", "operator": "==", "value": "Markedly increased" }
    ],
    "suggestion": "Hypertensive Nephrosclerosis with Atrophy",
    "reason": "Long-standing hypertension causing shrunken, scarred kidneys."
  },
  {
    "type": "compound",
    "conditions": [
      { "section": "medical", "field": "nsaid-use", "operator": "==", "value": true },
      { "section": "blood", "field": "creatinine", "operator": ">", "value": 2.0 },
      { "section": "blood", "field": "bicarbonate", "operator": "<", "value": 20 }
    ],
    "suggestion": "AKI on CKD from NSAID Use",
    "reason": "NSAID nephrotoxicity with acidosis and rising creatinine."
  },
  {
    "type": "compound",
    "conditions": [
      { "section": "blood", "field": "potassium", "operator": ">", "value": 5.5 },
      { "section": "symptoms", "field": "fatigue", "operator": "==", "value": true },
      { "section": "vitals", "field": "sbp", "operator": "<", "value": 100 }
    ],
    "suggestion": "Hyperkalemia with Hypotension",
    "reason": "High potassium in context of low BP—urgent risk."
  },
  {
    "type": "multi",
    "conditions": [
      { "section": "blood", "field": "hemoglobin", "operator": "<", "value": 10 },
      { "section": "blood", "field": "egfr", "operator": "<", "value": 30 }
    ],
    "suggestion": "Anemia of CKD",
    "reason": "Low Hb with advanced CKD."
  },
  {
    "type": "multi",
    "conditions": [
      { "section": "blood", "field": "calcium", "operator": "<", "value": 8.5 },
      { "section": "blood", "field": "phosphate", "operator": ">", "value": 4.5 },
      { "section": "blood", "field": "egfr", "operator": "<", "value": 30 }
    ],
    "suggestion": "CKD-MBD (Mineral Bone Disorder)",
    "reason": "Disordered mineral metabolism in advanced CKD."
  },
  {
    "type": "compound",
    "conditions": [
      { "section": "blood", "field": "egfr", "operator": "<", "value": 15 },
      { "section": "blood", "field": "bicarbonate", "operator": "<", "value": 18 },
      { "section": "blood", "field": "potassium", "operator": ">", "value": 5.5 },
      { "section": "blood", "field": "hemoglobin", "operator": "<", "value": 10 }
    ],
    "suggestion": "ESRD with Complications",
    "reason": "End-stage kidney disease with metabolic acidosis, hyperkalemia, anemia."
  }
  [
  {
    "type": "simple",
    "test": "egfr",
    "operator": "<",
    "threshold": 75,
    "suggestion": "Early CKD Stage 2 Alert",
    "reason": "Mild reduction in GFR—consider monitoring."
  },
  {
    "type": "simple",
    "test": "phosphate",
    "operator": ">",
    "threshold": 5.0,
    "suggestion": "Hyperphosphatemia",
    "reason": "Common in CKD—suggests need for phosphate binders."
  },
  {
    "type": "multi",
    "conditions": [
      { "section": "blood", "field": "urea", "operator": ">", "value": 60 },
      { "section": "blood", "field": "creatinine", "operator": ">", "value": 2.0 }
    ],
    "suggestion": "Azotemia",
    "reason": "Elevated urea and creatinine indicate renal impairment."
  },
  {
    "type": "compound",
    "conditions": [
      { "section": "medical", "field": "nsaid-use", "operator": "==", "value": true },
      { "section": "blood", "field": "creatinine", "operator": ">", "value": 1.5 },
      { "section": "symptoms", "field": "decreased-urine-output", "operator": "==", "value": true }
    ],
    "suggestion": "Suspected NSAID-induced AKI",
    "reason": "History of NSAID use with rising creatinine and oliguria."
  },
  {
    "type": "compound",
    "conditions": [
      { "section": "ultrasound", "field": "cysts", "operator": "in", "value": ["Multiple bilateral"] },
      { "section": "medical", "field": "family-ckd", "operator": "==", "value": true }
    ],
    "suggestion": "Likely Polycystic Kidney Disease",
    "reason": "Bilateral cysts plus family history consistent with PKD."
  },
  {
    "type": "compound",
    "conditions": [
      { "section": "blood", "field": "potassium", "operator": ">", "value": 6.0 },
      { "section": "vitals", "field": "sbp", "operator": "<", "value": 100 }
    ],
    "suggestion": "Severe Hyperkalemia with Hypotension",
    "reason": "Life-threatening combination needing urgent treatment."
  },
  {
    "type": "multi",
    "conditions": [
      { "section": "blood", "field": "hemoglobin", "operator": "<", "value": 9 },
      { "section": "blood", "field": "albumin", "operator": "<", "value": 3.0 }
    ],
    "suggestion": "Anemia and Hypoalbuminemia",
    "reason": "May suggest chronic disease or nephrotic syndrome."
  },
  {
    "type": "compound",
    "conditions": [
      { "section": "medical", "field": "diabetes", "operator": "==", "value": true },
      { "section": "blood", "field": "egfr", "operator": "<", "value": 45 },
      { "section": "urine", "field": "acr", "operator": ">", "value": 500 }
    ],
    "suggestion": "Severe Diabetic Kidney Disease",
    "reason": "Advanced DKD with high albuminuria."
  },
  {
    "type": "multi",
    "conditions": [
      { "section": "ultrasound", "field": "hydronephrosis", "operator": "in", "value": ["Moderate", "Severe"] },
      { "section": "symptoms", "field": "flank-pain", "operator": "==", "value": true }
    ],
    "suggestion": "Obstructive Uropathy",
    "reason": "USG shows hydronephrosis with flank pain."
  },
  {
    "type": "compound",
    "conditions": [
      { "section": "blood", "field": "bicarbonate", "operator": "<", "value": 18 },
      { "section": "blood", "field": "potassium", "operator": ">", "value": 5.5 },
      { "section": "blood", "field": "egfr", "operator": "<", "value": 30 }
    ],
    "suggestion": "Metabolic Acidosis with Hyperkalemia in CKD",
    "reason": "Critical metabolic derangement in advanced CKD."
  }
  [
  {
    "type": "simple",
    "test": "calcium",
    "operator": "<",
    "threshold": 8.0,
    "suggestion": "Hypocalcemia",
    "reason": "Common in advanced CKD or vitamin D deficiency."
  },
  {
    "type": "simple",
    "test": "sodium",
    "operator": "<",
    "threshold": 130,
    "suggestion": "Hyponatremia Alert",
    "reason": "Risk of cerebral edema and seizures if severe."
  },
  {
    "type": "multi",
    "conditions": [
      { "section": "blood", "field": "phosphate", "operator": ">", "value": 5.5 },
      { "section": "blood", "field": "calcium", "operator": "<", "value": 8.0 }
    ],
    "suggestion": "Secondary Hyperparathyroidism",
    "reason": "CKD mineral bone disorder pattern."
  },
  {
    "type": "compound",
    "conditions": [
      { "section": "medical", "field": "hypertension", "operator": "==", "value": true },
      { "section": "vitals", "field": "sbp", "operator": ">", "value": 160 },
      { "section": "vitals", "field": "dbp", "operator": ">", "value": 100 }
    ],
    "suggestion": "Severe Hypertension",
    "reason": "High BP needing urgent medical attention."
  },
  {
    "type": "compound",
    "conditions": [
      { "section": "medical", "field": "diabetes", "operator": "==", "value": true },
      { "section": "blood", "field": "albumin", "operator": "<", "value": 3.0 },
      { "section": "urine", "field": "acr", "operator": ">", "value": 1000 }
    ],
    "suggestion": "Nephrotic-Range Proteinuria in Diabetes",
    "reason": "High risk of progression to ESRD."
  },
  {
    "type": "multi",
    "conditions": [
      { "section": "blood", "field": "creatinine", "operator": ">", "value": 3.5 },
      { "section": "ultrasound", "field": "kidney-size", "operator": "==", "value": "Decreased" }
    ],
    "suggestion": "Chronic Renal Atrophy",
    "reason": "Small kidneys with high creatinine suggest chronicity."
  },
  {
    "type": "compound",
    "conditions": [
      { "section": "symptoms", "field": "nausea", "operator": "==", "value": true },
      { "section": "symptoms", "field": "vomiting", "operator": "==", "value": true },
      { "section": "blood", "field": "bicarbonate", "operator": "<", "value": 18 }
    ],
    "suggestion": "Uremic Symptoms with Acidosis",
    "reason": "Consider dialysis if worsening."
  },
  {
    "type": "multi",
    "conditions": [
      { "section": "urine", "field": "acr", "operator": ">", "value": 300 },
      { "section": "urine", "field": "urine-protein-24h", "operator": ">", "value": 3.5 }
    ],
    "suggestion": "Nephrotic Syndrome Range Proteinuria",
    "reason": "Massive proteinuria confirmed by 24h test."
  },
  {
    "type": "compound",
    "conditions": [
      { "section": "ultrasound", "field": "hydronephrosis", "operator": "==", "value": "Severe" },
      { "section": "ultrasound", "field": "stones", "operator": "in", "value": ["Single", "Multiple"] }
    ],
    "suggestion": "Obstructive Uropathy due to Stones",
    "reason": "Severe hydronephrosis plus stones on imaging."
  },
  {
    "type": "multi",
    "conditions": [
      { "section": "blood", "field": "albumin", "operator": "<", "value": 2.5 },
      { "section": "symptoms", "field": "edema", "operator": "==", "value": true }
    ],
    "suggestion": "Severe Hypoalbuminemia with Edema",
    "reason": "Suggests nephrotic syndrome or liver disease."
  }
  [
  {
    "type": "simple",
    "test": "potassium",
    "operator": ">",
    "threshold": 5.5,
    "suggestion": "Hyperkalemia Alert",
    "reason": "High risk of cardiac arrhythmia in CKD."
  },
  {
    "type": "simple",
    "test": "potassium",
    "operator": "<",
    "threshold": 3.0,
    "suggestion": "Severe Hypokalemia",
    "reason": "Risk of arrhythmia and muscle weakness."
  },
  {
    "type": "multi",
    "conditions": [
      { "section": "blood", "field": "sodium", "operator": ">", "value": 150 },
      { "section": "symptoms", "field": "decreased-urine-output", "operator": "==", "value": true }
    ],
    "suggestion": "Hypernatremia with Oliguria",
    "reason": "Suggests volume depletion or advanced CKD."
  },
  {
    "type": "compound",
    "conditions": [
      { "section": "medical", "field": "nsaid-use", "operator": "==", "value": true },
      { "section": "blood", "field": "creatinine", "operator": ">", "value": 1.5 }
    ],
    "suggestion": "Possible NSAID-Induced AKI",
    "reason": "Creatinine rise in NSAID users."
  },
  {
    "type": "multi",
    "conditions": [
      { "section": "ultrasound", "field": "cysts", "operator": "in", "value": ["Multiple bilateral"] },
      { "section": "blood", "field": "egfr", "operator": "<", "value": 60 }
    ],
    "suggestion": "Likely ADPKD",
    "reason": "Polycystic kidneys with reduced function."
  },
  {
    "type": "compound",
    "conditions": [
      { "section": "medical", "field": "family-ckd", "operator": "==", "value": true },
      { "section": "blood", "field": "egfr", "operator": "<", "value": 60 }
    ],
    "suggestion": "Familial CKD Suspicion",
    "reason": "Family history plus reduced eGFR."
  },
  {
    "type": "multi",
    "conditions": [
      { "section": "blood", "field": "bicarbonate", "operator": "<", "value": 18 },
      { "section": "blood", "field": "potassium", "operator": ">", "value": 5.5 }
    ],
    "suggestion": "Metabolic Acidosis with Hyperkalemia",
    "reason": "Common in advanced CKD."
  },
  {
    "type": "compound",
    "conditions": [
      { "section": "symptoms", "field": "breathlessness", "operator": "==", "value": true },
      { "section": "vitals", "field": "volume-status", "operator": "==", "value": "Hypervolemic" }
    ],
    "suggestion": "Volume Overload State",
    "reason": "Consider diuretics or dialysis planning."
  },
  {
    "type": "multi",
    "conditions": [
      { "section": "blood", "field": "albumin", "operator": "<", "value": 3.5 },
      { "section": "urine", "field": "acr", "operator": ">", "value": 300 }
    ],
    "suggestion": "Significant Proteinuria with Hypoalbuminemia",
    "reason": "Suggests nephrotic-range loss."
  },
  {
    "type": "compound",
    "conditions": [
      { "section": "ultrasound", "field": "echogenicity", "operator": "==", "value": "Markedly increased" },
      { "section": "ultrasound", "field": "kidney-size", "operator": "==", "value": "Decreased" },
      { "section": "blood", "field": "egfr", "operator": "<", "value": 30 }
    ],
    "suggestion": "Advanced CKD Imaging Pattern",
    "reason": "Consistent with advanced chronic damage."
  }
]

]

]

]

];

    
  ;

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
    case ">": return parseFloat(val) > cond.value;
    case "==": return val == cond.value;
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
