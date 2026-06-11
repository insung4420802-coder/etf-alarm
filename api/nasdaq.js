function calcRSI(closes, period = 14) {
  if (closes.length < period + 1) return null;
  let gains = 0, losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  const rs = (gains / period) / ((losses / period) || 0.0001);
  return parseFloat((100 - 100 / (1 + rs)).toFixed(2));
}

export default async function handler(req, res) {
  try {
    const headers = { "User-Agent": "Mozilla/5.0" };

    const dailyRes = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/QQQ?range=3mo&interval=1d",
      { headers }
    );
    const daily = await dailyRes.json();
    const closes = daily.chart.result[0].indicators.quote[0].close.filter(Boolean);
    const rsi = calcRSI(closes);
    const current = closes[closes.length - 1];

    const monthlyRes = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/QQQ?range=10y&interval=1mo",
      { headers }
    );
    const monthly = await monthlyRes.json();
    const q = monthly.chart.result[0].indicators.quote[0];
    const highs = (q.high || q.close).filter(Boolean);
    const ath = Math.max(...highs, current);
    const dropPct = parseFloat(((current - ath) / ath * 100).toFixed(2));

    res.status(200).json({ rsi, current, ath, dropPct });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
