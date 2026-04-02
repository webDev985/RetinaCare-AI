export function getClinicalAdvice(severity) {
  switch (severity) {
    case "No_DR":
    case "No DR":
      return {
        level: "Low Risk",
        advice: "No signs of Diabetic Retinopathy detected. Annual routine eye screening is recommended.",
        color: "text-green-400",
      };

    case "Mild":
      return {
        level: "Early Stage",
        advice: "Mild Diabetic Retinopathy detected. Lifestyle monitoring and periodic ophthalmic checkups advised.",
        color: "text-yellow-400",
      };

    case "Moderate":
      return {
        level: "Moderate Risk",
        advice: "Moderate Diabetic Retinopathy detected. Consultation with an ophthalmologist is recommended.",
        color: "text-orange-400",
      };

    case "Severe":
      return {
        level: "High Risk",
        advice: "Severe Diabetic Retinopathy detected. Immediate referral to an eye specialist is required.",
        color: "text-red-400",
      };

    case "Proliferate_DR":
    case "Proliferative":
      return {
        level: "Critical",
        advice: "Proliferative Diabetic Retinopathy detected. Urgent medical treatment is required to prevent vision loss.",
        color: "text-red-600",
      };

    default:
      return {
        level: "Unknown",
        advice: "Unable to determine clinical recommendation.",
        color: "text-slate-400",
      };
  }
}
