// Past 10 trading days closing price history for TradeX watchlist & holdings stocks
const HISTORICAL_STOCK_DATA = [
  {
    name: "INFY",
    sector: "IT",
    history: [1612.0, 1605.5, 1598.2, 1602.0, 1590.4, 1584.1, 1579.0, 1581.5, 1580.7, 1555.45],
  },
  {
    name: "ONGC",
    sector: "Energy",
    history: [119.5, 118.9, 119.2, 118.4, 117.8, 118.1, 117.5, 117.2, 116.9, 116.8],
  },
  {
    name: "TCS",
    sector: "IT",
    history: [3245.0, 3238.5, 3229.0, 3234.2, 3220.0, 3214.8, 3209.5, 3206.0, 3202.8, 3194.8],
  },
  {
    name: "KPITTECH",
    sector: "IT / Auto Tech",
    history: [242.5, 245.0, 244.2, 248.6, 250.3, 253.8, 255.1, 257.4, 257.35, 266.45],
  },
  {
    name: "QUICKHEAL",
    sector: "Cybersecurity",
    history: [316.2, 315.0, 314.4, 313.8, 312.5, 311.9, 310.8, 309.9, 309.0, 308.55],
  },
  {
    name: "WIPRO",
    sector: "IT",
    history: [560.4, 562.8, 565.1, 564.0, 567.5, 570.2, 572.1, 574.0, 575.9, 577.75],
  },
  {
    name: "M&M",
    sector: "Automobile",
    history: [798.5, 795.0, 792.4, 790.1, 788.6, 785.2, 783.9, 781.5, 779.9, 779.8],
  },
  {
    name: "RELIANCE",
    sector: "Conglomerate",
    history: [2040.0, 2052.5, 2048.0, 2061.4, 2070.0, 2078.6, 2085.2, 2081.0, 2082.4, 2112.4],
  },
  {
    name: "HUL",
    sector: "FMCG",
    history: [494.0, 496.5, 498.2, 497.0, 500.4, 502.8, 504.5, 506.0, 507.1, 512.4],
  },
  {
    name: "BHARTIARTL",
    sector: "Telecom",
    history: [512.0, 515.4, 518.0, 520.2, 523.5, 526.0, 528.4, 525.9, 525.45, 541.15],
  },
  {
    name: "HDFCBANK",
    sector: "Banking",
    history: [1488.0, 1492.5, 1496.0, 1500.2, 1504.8, 1509.1, 1513.5, 1517.2, 1520.7, 1522.35],
  },
  {
    name: "ITC",
    sector: "FMCG",
    history: [199.5, 200.2, 201.4, 201.8, 203.0, 203.9, 204.6, 205.5, 206.25, 207.9],
  },
  {
    name: "SBIN",
    sector: "Banking",
    history: [442.0, 440.5, 439.2, 438.8, 436.5, 435.4, 434.0, 433.1, 431.65, 430.2],
  },
  {
    name: "TATAPOWER",
    sector: "Power",
    history: [129.8, 129.1, 128.4, 127.9, 127.2, 126.5, 126.0, 125.1, 124.45, 124.15],
  },
];

// Calculate Simple Moving Average over last `period` prices
const calculateSMA = (prices, period) => {
  const slice = prices.slice(-period);
  const sum = slice.reduce((acc, val) => acc + val, 0);
  return sum / slice.length;
};

// Calculate Relative Strength Index (RSI, 0-100)
const calculateRSI = (prices) => {
  let gains = 0;
  let losses = 0;
  for (let i = 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }
  const avgGain = gains / (prices.length - 1);
  const avgLoss = losses / (prices.length - 1);
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
};

// Ordinary Least Squares Linear Regression forecast for next day (x = n)
const linearRegressionNext = (prices) => {
  const n = prices.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += prices[i];
    sumXY += i * prices[i];
    sumXX += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { predicted: slope * n + intercept, slope };
};

const predictStock = ({ name, sector, history }) => {
  const currentPrice = history[history.length - 1];
  const sma3 = calculateSMA(history, 3);
  const sma7 = calculateSMA(history, 7);
  const rsi = calculateRSI(history);
  const { slope } = linearRegressionNext(history);

  // Project today's price from currentPrice using Linear Regression daily slope + SMA momentum
  const smaMomentumDelta = (sma3 - sma7) * 0.25;
  let predictedPrice = currentPrice + slope * 0.75 + smaMomentumDelta;

  // Apply mild RSI overbought/oversold damping so predictions remain realistic
  if (rsi > 80) predictedPrice -= currentPrice * 0.002;
  if (rsi < 20) predictedPrice += currentPrice * 0.002;

  const expectedChange = predictedPrice - currentPrice;
  const expectedPercent = (expectedChange / currentPrice) * 100;
  const isProfit = expectedChange >= 0;

  // Confidence based on agreement between Linear Regression slope & SMA crossover
  const slopeMatchesSMA = (slope >= 0 && sma3 >= sma7) || (slope < 0 && sma3 < sma7);
  const strengthBonus = Math.min(18, Math.abs(expectedPercent) * 6);
  const confidence = Math.min(
    93,
    Math.round((slopeMatchesSMA ? 72 : 58) + strengthBonus)
  );

  const targetPrice = isProfit
    ? predictedPrice * 1.008
    : predictedPrice * 0.992;
  const stopLoss = isProfit
    ? currentPrice * 0.985
    : currentPrice * 1.015;

  const reason = isProfit
    ? `3-day average (₹${sma3.toFixed(2)}) is above 7-day average (₹${sma7.toFixed(
        2
      )}) with upward past trend.`
    : `3-day average (₹${sma3.toFixed(2)}) is below 7-day average (₹${sma7.toFixed(
        2
      )}) with downward past trend.`;

  return {
    name,
    sector,
    currentPrice: Number(currentPrice.toFixed(2)),
    predictedPrice: Number(predictedPrice.toFixed(2)),
    expectedChange: Number(expectedChange.toFixed(2)),
    expectedPercent: Number(expectedPercent.toFixed(2)),
    prediction: isProfit ? "PROFIT" : "LOSS",
    trend: isProfit ? "Bullish" : "Bearish",
    sma3: Number(sma3.toFixed(2)),
    sma7: Number(sma7.toFixed(2)),
    rsi: Number(rsi.toFixed(1)),
    confidence,
    targetPrice: Number(targetPrice.toFixed(2)),
    stopLoss: Number(stopLoss.toFixed(2)),
    reason,
    history: history.map((p, idx) => ({
      day: `Day ${idx + 1}`,
      price: p,
    })),
  };
};

const getAllPredictions = () => HISTORICAL_STOCK_DATA.map(predictStock);

module.exports = { getAllPredictions, HISTORICAL_STOCK_DATA };
