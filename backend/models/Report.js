import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    imagePath: { type: String, required: true },
    prediction: { type: String },
    report: { type: Object }
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
export default Report;
