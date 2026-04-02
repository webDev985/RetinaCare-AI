import axios from "axios";
import FormData from "form-data";
import fs from "fs";

export async function callML(imagePath) {
  const mlUrl = process.env.ML_URL;
  if (!mlUrl) {
    throw new Error("ML_URL not set in .env");
  }

  const form = new FormData();
  form.append("image", fs.createReadStream(imagePath));

  const headers = form.getHeaders();

  const res = await axios.post(mlUrl, form, { headers });

  return res.data; // { success, ml: { prediction, confidence, all_scores } } or error
}
