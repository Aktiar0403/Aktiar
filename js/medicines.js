export let medicines = [];

export function loadMedicines() {
  return fetch('/medicines.json')
    .then(response => response.json())
    .then(data => {
      medicines = data;
      console.log('✅ Medicines loaded:', medicines);
      return medicines;
    })
    .catch(error => {
      console.error('❌ Error loading medicines:', error);
    });
}

export function getMedicinesForDiagnosis(diagnosisText) {
  if (!diagnosisText) return [];

  const suggestions = [];
  medicines.forEach(med => {
    med.indications.forEach(indication => {
      if (diagnosisText.toLowerCase().includes(indication.toLowerCase())) {
        suggestions.push(med);
      }
    });
  });
  return suggestions;
}

