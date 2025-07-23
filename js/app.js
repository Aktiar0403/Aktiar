

import { medicines, getMedicinesForDiagnosis } from './medicines.js';
import { diagnosisRules, loadDiagnosisRules, saveDiagnosisRules, addDiagnosisRule, deleteDiagnosisRule, generateDiagnosisText } from './diagnosis.js';




// Reference Ranges
const referenceRanges = {
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

// Global data
let visits = JSON.parse(localStorage.getItem('visits')) || [];
let serialCounter = parseInt(localStorage.getItem('visitSerialCounter')) || 1;

// UI references
const saveButton = document.getElementById('save-visit');
const recordsList = document.getElementById('saved-records-list');
const visitDetails = document.getElementById('visit-details');
const exportButton = document.getElementById('export-button');
const exportText = document.getElementById('export-text');

// Accordion toggle
document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.accordion-button');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const content = button.nextElementSibling;

      if (content.classList.contains('show')) {
        content.classList.remove('show');
      } else {
        content.classList.add('show');
      }
    });
  });
});



// Load diagnosis rules at start
loadDiagnosisRules();
renderRulesList();
renderVisitList();
setupReferenceHelpers();

function setupReferenceHelpers() {
  Object.entries(referenceRanges).forEach(([id, range]) => {
    const input = document.getElementById(id);
    if (input) {
      const helper = document.createElement('small');
      helper.className = 'ref-range';
      helper.textContent = `Reference: ${range.min} – ${range.max}`;
      input.parentNode.insertBefore(helper, input.nextSibling);

      input.addEventListener('input', () => {
        const val = parseFloat(input.value);
        if (isNaN(val)) {
          input.classList.remove('input-ok', 'input-warn');
          return;
        }
        if (val >= range.min && val <= range.max) {
          input.classList.add('input-ok');
          input.classList.remove('input-warn');
        } else {
          input.classList.add('input-warn');
          input.classList.remove('input-ok');
        }
      });
    }
  });
}

// Save visit
saveButton.addEventListener('click', () => {
  const visitData = collectVisitData();
  visits.push(visitData);
  serialCounter++;
  localStorage.setItem('visitSerialCounter', serialCounter);
  localStorage.setItem('visits', JSON.stringify(visits));
  renderVisitList();
  alert('Visit saved!');
});

function collectVisitData() {
  const getData = (id) => Object.fromEntries(new FormData(document.getElementById(id)));
  const today = new Date();
  const datePart = `${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getFullYear()).slice(-2)}`;
  const serialNumber = String(serialCounter).padStart(4, '0');
  const visitId = `${datePart}-${serialNumber}`;

  return {
    id: visitId,
    date: datePart,
    serial: serialNumber,
    profile: getData('patient-profile-form'),
    medical: getData('medical-history-form'),
    symptoms: getData('symptoms-form'),
    vitals: getData('vital-signs-form'),
    blood: getData('blood-tests-form'),
    urine: getData('urine-tests-form'),
    ultrasound: getData('ultrasound-report-form'),
    prescription: getData('prescription-form'),
    diagnosis: {
      doctor: document.getElementById('doctor-diagnosis').value,
      patient: document.getElementById('patient-diagnosis').value
    }
  };
}

function renderFields(data) {
  return Object.entries(data)
    .map(([key, value]) => {
      if (!value) value = 'Not provided';
      let style = '';
      if (referenceRanges[key]) {
        const min = referenceRanges[key].min;
        const max = referenceRanges[key].max;
        const num = parseFloat(value);
        if (!isNaN(num)) {
          style = (num < min) ? 'color: orange;' :
                  (num > max) ? 'color: red;' :
                  'color: green;';
        }
      }
      return `<li><strong>${key}:</strong> <span style="${style}">${value}</span></li>`;
    }).join('');
}

function renderVisitList() {
  recordsList.innerHTML = '';
  if (!visits.length) {
    recordsList.innerHTML = '<p>No saved records yet.</p>';
    return;
  }
  visits.forEach((visit, index) => {
    const li = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = visit.id || `Visit ${index + 1}`;
    label.style.cursor = 'pointer';
    label.addEventListener('click', () => displayVisitDetails(visit));
    const delButton = document.createElement('button');
    delButton.textContent = '🗑️ Delete';
    delButton.addEventListener('click', () => {
      if (confirm('Delete this visit?')) {
        visits.splice(index, 1);
        localStorage.setItem('visits', JSON.stringify(visits));
        renderVisitList();
        visitDetails.innerHTML = '';
      }
    });
    li.append(label, delButton);
    recordsList.appendChild(li);
  });
}

function displayVisitDetails(visit) {
  visitDetails.innerHTML = `
    <h4>🆔 Visit ID: ${visit.id}</h4>
    <h4>🧾 Patient Profile</h4><ul>${renderFields(visit.profile)}</ul>
    <h4>🗂️ Medical History</h4><ul>${renderFields(visit.medical)}</ul>
    <h4>🩹 Symptoms</h4><ul>${renderFields(visit.symptoms)}</ul>
    <h4>💓 Vital Signs</h4><ul>${renderFields(visit.vitals)}</ul>
    <h4>🩸 Blood Tests</h4><ul>${renderFields(visit.blood)}</ul>
    <h4>💧 Urine Tests</h4><ul>${renderFields(visit.urine)}</ul>
    <h4>🖼️ Ultrasound Report</h4><ul>${renderFields(visit.ultrasound)}</ul>
    <h4>💊 Prescription</h4><ul>${renderFields(visit.prescription)}</ul>
    <h4>🧭 AI Diagnosis</h4>
    <p><strong>Doctor-level:</strong> ${visit.diagnosis.doctor || 'Not provided'}</p>
    <p><strong>Patient-friendly:</strong> ${visit.diagnosis.patient || 'Not provided'}</p>`;
  exportButton.style.display = 'block';
  exportButton.onclick = () => {
    exportText.value = generateExportText(visit);
    exportText.style.display = 'block';
  };
}

function generateExportText(visit) {
  const sections = ['profile','medical','symptoms','vitals','blood','urine','ultrasound','prescription'];
  let text = `🆔 Visit ID: ${visit.id}\n\n`;
  sections.forEach(section => {
    text += `🗂️ ${section.charAt(0).toUpperCase() + section.slice(1)}\n`;
    text += Object.entries(visit[section])
      .map(([k,v]) => `- ${k}: ${v || 'Not provided'}`).join('\n') + '\n\n';
  });
  text += `🧭 AI Diagnosis\nDoctor-level: ${visit.diagnosis.doctor || 'Not provided'}\nPatient-friendly: ${visit.diagnosis.patient || 'Not provided'}\n`;
  return text;
}

// Diagnosis generation button
document.getElementById('generate-diagnosis').addEventListener('click', () => {
  const visitData = collectVisitData();

  // Check if user left everything empty
  const allEmpty = Object.entries(visitData).every(([section, data]) => {
    if (typeof data === 'object') {
      return Object.values(data).every(val => !val || val === 'on' || val === '');
    }
    return !data;
  });

  let diagnosisText = "";

  if (allEmpty) {
    diagnosisText = "🩺 Please fill out the form to help me diagnose better! Health story begins with your words.";
  } else {
    diagnosisText = generateDiagnosisText(visitData);
    if (diagnosisText.includes("No diagnosis suggestions matched")) {
      diagnosisText = `🩺 Your data is a riddle yet unsolved.\nTell me symptoms, history, tests – so I may see the truth within.`;
    }
  }

  document.getElementById('doctor-diagnosis').value = diagnosisText;
  document.getElementById('patient-diagnosis').value = diagnosisText;

  // Suggest medicines if diagnosisText is meaningful
  if (!diagnosisText.includes("Please fill") && !diagnosisText.includes("riddle yet unsolved")) {
    const meds = getMedicinesForDiagnosis(diagnosisText);
    const medNames = meds.map(m => `${m.name} (${m.type})`).join('\n');
    document.getElementById('med-name').value = medNames;
  } else {
    document.getElementById('med-name').value = '';
  }
});

// Rule save
document.getElementById('save-rule').addEventListener('click', () => {
  const testName = document.getElementById('test-name').value.trim();
  const operator = document.getElementById('operator').value.trim();
  const threshold = parseFloat(document.getElementById('threshold').value.trim());
  const suggestion = document.getElementById('suggestion').value.trim();
  const reason = document.getElementById('reason').value.trim();
  if (!testName || !operator || isNaN(threshold) || !suggestion || !reason) {
    alert('All fields required!');
    return;
  }
  addDiagnosisRule({ test: testName, operator, threshold, suggestion, reason });
  renderRulesList();
  alert('Rule saved!');
});

function renderRulesList() {
  const rulesList = document.getElementById('rules-list');
  rulesList.innerHTML = '';
  if (!diagnosisRules.length) {
    rulesList.innerHTML = '<li>No custom rules added yet.</li>';
    return;
  }
  diagnosisRules.forEach((rule, index) => {
    const li = document.createElement('li');
    li.innerHTML = `${rule.test} ${rule.operator} ${rule.threshold} → ${rule.suggestion}
      <br><small>Reason: ${rule.reason}</small>
      <button data-index="${index}">🗑️ Delete</button>`;
    li.querySelector('button').addEventListener('click', () => {
      if (confirm('Delete this rule?')) {
        deleteDiagnosisRule(index);
        renderRulesList();
      }
    });
    rulesList.appendChild(li);
  });
}

// Print Prescription
document.getElementById('print-prescription').addEventListener('click', () => {
  const symptoms = Object.entries(Object.fromEntries(new FormData(document.getElementById('symptoms-form'))))
    .filter(([_, val]) => val === "on")
    .map(([k]) => k.replace(/-/g, ' ')).join(', ') || 'None reported';

  const doctorDiagnosis = document.getElementById('doctor-diagnosis').value;
  const patientDiagnosis = document.getElementById('patient-diagnosis').value;
  const medName = document.getElementById('med-name').value;
  const dose = document.getElementById('dose').value;
  const notes = document.getElementById('notes').value;
  const patientInstructions = document.getElementById('patient-instructions').value;
  const doctorName = prompt("Enter Doctor's Name for Signature:", "Dr. John Doe") || "____________________";

  const printableDiv = document.getElementById('printable-prescription');
  printableDiv.innerHTML = `
    <h2>🩺 Dr. NephroCare Pro</h2>
    <p><strong>Symptoms:</strong> ${symptoms}</p>
    <p><strong>Diagnosis (Doctor-level):</strong> ${doctorDiagnosis}</p>
    <p><strong>Diagnosis (Patient-friendly):</strong> ${patientDiagnosis}</p>
    <h3>Prescription</h3>
    <ul>
      <li><strong>Medicine Name:</strong> ${medName || 'None'}</li>
      <li><strong>Dose:</strong> ${dose || 'Not specified'}</li>
      <li><strong>Doctor Notes:</strong> ${notes || 'None'}</li>
      <li><strong>Patient Instructions:</strong> ${patientInstructions || 'None'}</li>
    </ul>
    <br>
    <p>Verified by: ${doctorName}</p>`;
  printableDiv.style.display = 'block';
  window.print();
  printableDiv.style.display = 'none';

});
