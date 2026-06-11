export default async function handler(req, res) {
  try {
    const r = await fetch(
      "https://production.dataviz.cnn.io/index/fearandgreed/graphdata",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (!r.ok) throw new Error("CNN HTTP " + r.status);
    const json = await r.json();
    res.status(200).json({
      value: Math.round(json.fear_and_greed.score),
      label: json.fear_and_greed.rating
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
