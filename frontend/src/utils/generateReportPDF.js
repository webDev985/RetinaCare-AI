import jsPDF from "jspdf";
import QRCode from "qrcode";
import { getClinicalAdvice } from "./clinicalAdvice";

/* 🔥 ADD THIS MAPPING HERE */
const ADVICE_LABELS = {
  "No DR": "No DR",
  Mild: "Mild",
  Moderate: "Moderate",
  Severe: "Severe",
  "Proliferative DR": "Proliferative", // ✅ FIX
};

export async function generatePDF(
  elementId,
  prediction,
  confidence,
  patient = {
    name: "Anonymous Patient",
    age: "N/A",
    bloodGroup: "N/A",
  }
) {
  const doc = new jsPDF("p", "mm", "a4");

  /* 🔥 FIX APPLIED HERE */
  const adviceKey = ADVICE_LABELS[prediction] || prediction;
  const advice = getClinicalAdvice(adviceKey);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const now = new Date();
  const reportDate = now.toLocaleDateString();
  const reportTime = now.toLocaleTimeString();

  /* ================= PAGE BORDER ================= */
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(1);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  /* ================= HEADER ================= */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("RetinaCare AI", pageWidth / 2, 25, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.text(
    "Diabetic Retinopathy Screening Report",
    pageWidth / 2,
    33,
    { align: "center" }
  );

  doc.setLineWidth(0.5);
  doc.line(20, 38, pageWidth - 20, 38);

  /* ================= PATIENT DETAILS ================= */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Patient Information", 20, 50);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Full Name      : ${patient.name}`, 20, 60);
  doc.text(`Age            : ${patient.age} years`, 20, 68);
  doc.text(`Blood Group    : ${patient.bloodGroup}`, 20, 76);
  doc.text(`Report Date    : ${reportDate}`, 20, 84);
  doc.text(`Report Time    : ${reportTime}`, 20, 92);

  doc.line(20, 98, pageWidth - 20, 98);

  /* ================= AI RESULT ================= */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("AI Screening Result", 20, 112);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Detected Severity : ${prediction}`, 20, 122);
  doc.text(`Model Confidence  : ${confidence}%`, 20, 130);

  /* ================= CLINICAL RECOMMENDATION ================= */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Clinical Recommendation", 20, 145);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  doc.text(advice?.level || "Consult Specialist", 20, 155);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  doc.text(
    advice?.advice ||
      "Further medical evaluation is recommended.",
    20,
    165,
    {
      maxWidth: 170,
      lineHeightFactor: 1.6,
    }
  );

  /* ================= DOCTOR RECOMMENDATION ================= */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Doctor Recommendation", 20, 195);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(
    `Based on the AI-assisted screening result, it is strongly recommended
that the patient consult a qualified ophthalmologist for confirmation
and further medical evaluation.

Recommended by:
RetinaCare AI Clinical Decision Support System`,
    20,
    205,
    { maxWidth: 170, lineHeightFactor: 1.6 }
  );

  /* ================= QR CODE ================= */
  const qrData = `
Patient: ${patient.name}
Age: ${patient.age}
Blood Group: ${patient.bloodGroup}
Severity: ${prediction}
Confidence: ${confidence}%
Date: ${reportDate} ${reportTime}
`;

  const qrImage = await QRCode.toDataURL(qrData);

  doc.addImage(qrImage, "PNG", pageWidth - 60, pageHeight - 95, 40, 40);

  doc.setFontSize(9);
  doc.text("Scan to verify report", pageWidth - 60, pageHeight - 50);

  /* ================= DISCLAIMER ================= */
  doc.setLineWidth(0.3);
  doc.line(20, pageHeight - 35, pageWidth - 20, pageHeight - 35);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.text(
    "Disclaimer: This AI-generated report is intended for screening assistance only and must not replace professional medical diagnosis.",
    20,
    pageHeight - 28,
    { maxWidth: 170 }
  );

  /* ================= FOOTER ================= */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    "RetinaCare AI • Vision Transformer Based Diabetic Retinopathy Detection System",
    pageWidth / 2,
    pageHeight - 12,
    { align: "center" }
  );

  /* ================= SAVE ================= */
  doc.save(
    `RetinaCare_Report_${patient.name.replace(/\s+/g, "_")}.pdf`
  );
}