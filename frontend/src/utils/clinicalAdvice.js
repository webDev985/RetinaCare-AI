export function getClinicalAdvice(prediction, confidence) {
  if (prediction === "No DR") {
    return {
      level: "Low Risk",
      advice:
        confidence > 85
          ? "No diabetic retinopathy detected. Maintain yearly screening."
          : "Low confidence result. Recommend follow-up screening."
    };
  }

  if (prediction === "Mild") {
    return {
      level: "Early Stage",
      advice:
        "Mild signs detected. Lifestyle management and regular monitoring recommended."
    };
  }

  if (prediction === "Moderate") {
    return {
      level: "Moderate Risk",
      advice:
        confidence > 70
          ? "Moderate DR detected. Consult ophthalmologist soon."
          : "Uncertain classification. Retesting advised."
    };
  }

  if (prediction === "Severe") {
    return {
      level: "High Risk",
      advice:
        "Severe DR detected. Immediate medical attention required."
    };
  }

  if (prediction === "Proliferative DR") {
    return {
      level: "Critical",
      advice:
        "Advanced stage detected. Urgent treatment needed to prevent blindness."
    };
  }

  return {
    level: "Unknown",
    advice: "Consult specialist."
  };
}