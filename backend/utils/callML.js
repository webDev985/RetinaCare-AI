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

  try {
    const res = await axios.post(mlUrl, form, {
      headers: form.getHeaders(),
      timeout: 60000, // ⏱ prevent hanging
    });

    console.log("✅ ML Response:", res.data);

    if (!res.data || !res.data.ml) {
      throw new Error("Invalid ML response format");
    }

    return res.data;

  } catch (err) {
    console.error("❌ ML ERROR:", err.message);
    throw err;
  }
}