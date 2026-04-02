import express from "express";

const router = express.Router();

router.get("/nearby", async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Location required" });
  }

  const query = `
    [out:json];
    (
      node["amenity"="hospital"](around:5000,${lat},${lng});
    );
    out;
  `;

  try {
    const response = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        body: query,
      }
    );

    const text = await response.text();

    // 🔥 Check if response is JSON or not
    if (text.startsWith("<")) {
      console.error("❌ Overpass returned XML/HTML:", text);
      return res.status(500).json({
        error: "Overpass API returned invalid response",
      });
    }

    // ✅ Parse JSON safely
    const data = JSON.parse(text);

    res.json(data.elements || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch hospitals" });
  }
});

export default router;