import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3002"
    : "https://zerodha-backend-7kup.onrender.com";

// Local fallback historical dataset so predictions also work immediately offline
const FALLBACK_HISTORY = [
  { name: "INFY", sector: "IT", history: [1612.0, 1605.5, 1598.2, 1602.0, 1590.4, 1584.1, 1579.0, 1581.5, 1580.7, 1555.45] },
  { name: "ONGC", sector: "Energy", history: [119.5, 118.9, 119.2, 118.4, 117.8, 118.1, 117.5, 117.2, 116.9, 116.8] },
  { name: "TCS", sector: "IT", history: [3245.0, 3238.5, 3229.0, 3234.2, 3220.0, 3214.8, 3209.5, 3206.0, 3202.8, 3194.8] },
  { name: "KPITTECH", sector: "IT / Auto Tech", history: [242.5, 245.0, 244.2, 248.6, 250.3, 253.8, 255.1, 257.4, 257.35, 266.45] },
  { name: "QUICKHEAL", sector: "Cybersecurity", history: [316.2, 315.0, 314.4, 313.8, 312.5, 311.9, 310.8, 309.9, 309.0, 308.55] },
  { name: "WIPRO", sector: "IT", history: [560.4, 562.8, 565.1, 564.0, 567.5, 570.2, 572.1, 574.0, 575.9, 577.75] },
  { name: "M&M", sector: "Automobile", history: [798.5, 795.0, 792.4, 790.1, 788.6, 785.2, 783.9, 781.5, 779.9, 779.8] },
  { name: "RELIANCE", sector: "Conglomerate", history: [2040.0, 2052.5, 2048.0, 2061.4, 2070.0, 2078.6, 2085.2, 2081.0, 2082.4, 2112.4] },
  { name: "HUL", sector: "FMCG", history: [494.0, 496.5, 498.2, 497.0, 500.4, 502.8, 504.5, 506.0, 507.1, 512.4] },
  { name: "BHARTIARTL", sector: "Telecom", history: [512.0, 515.4, 518.0, 520.2, 523.5, 526.0, 528.4, 525.9, 525.45, 541.15] },
  { name: "HDFCBANK", sector: "Banking", history: [1488.0, 1492.5, 1496.0, 1500.2, 1504.8, 1509.1, 1513.5, 1517.2, 1520.7, 1522.35] },
  { name: "ITC", sector: "FMCG", history: [199.5, 200.2, 201.4, 201.8, 203.0, 203.9, 204.6, 205.5, 206.25, 207.9] },
  { name: "SBIN", sector: "Banking", history: [442.0, 440.5, 439.2, 438.8, 436.5, 435.4, 434.0, 433.1, 431.65, 430.2] },
  { name: "TATAPOWER", sector: "Power", history: [129.8, 129.1, 128.4, 127.9, 127.2, 126.5, 126.0, 125.1, 124.45, 124.15] },
];

const computeLocalPredictions = () => {
  return FALLBACK_HISTORY.map(({ name, sector, history }) => {
    const n = history.length;
    const currentPrice = history[n - 1];
    const sma3 = history.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const sma7 = history.slice(-7).reduce((a, b) => a + b, 0) / 7;

    let gains = 0;
    let losses = 0;
    for (let i = 1; i < n; i++) {
      const diff = history[i] - history[i - 1];
      if (diff > 0) gains += diff;
      else losses += Math.abs(diff);
    }
    const rsi = losses === 0 ? 100 : 100 - 100 / (1 + gains / losses);

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += history[i];
      sumXY += i * history[i];
      sumXX += i * i;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    let predictedPrice = currentPrice + slope * 0.75 + (sma3 - sma7) * 0.25;
    if (rsi > 80) predictedPrice -= currentPrice * 0.002;
    if (rsi < 20) predictedPrice += currentPrice * 0.002;

    const expectedChange = predictedPrice - currentPrice;
    const expectedPercent = (expectedChange / currentPrice) * 100;
    const isProfit = expectedChange >= 0;
    const slopeMatchesSMA = (slope >= 0 && sma3 >= sma7) || (slope < 0 && sma3 < sma7);
    const confidence = Math.min(93, Math.round((slopeMatchesSMA ? 72 : 58) + Math.min(18, Math.abs(expectedPercent) * 6)));

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
      targetPrice: Number((isProfit ? predictedPrice * 1.008 : predictedPrice * 0.992).toFixed(2)),
      stopLoss: Number((isProfit ? currentPrice * 0.985 : currentPrice * 1.015).toFixed(2)),
      reason: isProfit
        ? `3-day average (₹${sma3.toFixed(2)}) is above 7-day average (₹${sma7.toFixed(2)}) with upward past trend.`
        : `3-day average (₹${sma3.toFixed(2)}) is below 7-day average (₹${sma7.toFixed(2)}) with downward past trend.`,
      history: history.map((p, idx) => ({ day: `Day ${idx + 1}`, price: p })),
    };
  });
};

const Predictions = () => {
  const [predictions, setPredictions] = useState(() => computeLocalPredictions());
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/predictions`)
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setPredictions(res.data);
          setSelectedStock((prev) => prev || res.data[0]);
        }
      })
      .catch(() => {
        // Keep local computed predictions if backend is offline
      });
  }, []);

  useEffect(() => {
    if (!selectedStock && predictions.length > 0) {
      setSelectedStock(predictions[0]);
    }
  }, [predictions, selectedStock]);

  const filteredPredictions = predictions.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "ALL" || item.prediction === filter;
    return matchesSearch && matchesFilter;
  });

  const profitCount = predictions.filter((p) => p.prediction === "PROFIT").length;
  const lossCount = predictions.filter((p) => p.prediction === "LOSS").length;
  const avgConfidence = predictions.length
    ? Math.round(
        predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
      )
    : 0;

  const activeStock = selectedStock || filteredPredictions[0];

  const chartData = activeStock
    ? {
        labels: [...activeStock.history.map((h) => h.day), "Today (Predicted)"],
        datasets: [
          {
            label: `${activeStock.name} Past 10 Days + Today's Forecast (₹)`,
            data: [
              ...activeStock.history.map((h) => h.price),
              activeStock.predictedPrice,
            ],
            borderColor:
              activeStock.prediction === "PROFIT"
                ? "rgb(72, 194, 55)"
                : "rgb(223, 73, 73)",
            backgroundColor:
              activeStock.prediction === "PROFIT"
                ? "rgba(72, 194, 55, 0.1)"
                : "rgba(223, 73, 73, 0.1)",
            pointBackgroundColor: [
              ...activeStock.history.map(() => "#4184f3"),
              activeStock.prediction === "PROFIT"
                ? "rgb(72, 194, 55)"
                : "rgb(223, 73, 73)",
            ],
            pointRadius: [
              ...activeStock.history.map(() => 3),
              6,
            ],
            tension: 0.3,
            fill: true,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          font: {
            family:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            size: 12,
            weight: "300",
          },
          color: "rgb(70, 70, 70)",
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "rgb(136, 136, 136)", font: { size: 11 } },
        grid: { display: false },
      },
      y: {
        ticks: { color: "rgb(136, 136, 136)", font: { size: 11 } },
        grid: { color: "rgb(243, 242, 242)" },
      },
    },
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "10px",
        }}
      >
        <h3 className="title" style={{ margin: 0 }}>
          Today's Stock Profit / Loss Predictions ({filteredPredictions.length})
        </h3>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search stock or sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid rgb(224, 224, 224)",
              borderRadius: "2px",
              fontFamily: "inherit",
              fontSize: "0.8rem",
              fontWeight: 300,
              color: "rgb(70, 70, 70)",
              outline: "none",
            }}
          />
          {["ALL", "PROFIT", "LOSS"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className="btn"
              style={{
                background: filter === type ? "#4184f3" : "#f1f1f1",
                color: filter === type ? "#fff" : "rgb(70, 70, 70)",
                border: "none",
                cursor: "pointer",
                padding: "8px 12px",
                fontFamily: "inherit",
                fontSize: "0.8rem",
                fontWeight: 300,
              }}
            >
              {type === "ALL"
                ? "All"
                : type === "PROFIT"
                ? `Profit (${profitCount})`
                : `Loss (${lossCount})`}
            </button>
          ))}
        </div>
      </div>

      <p
        style={{
          fontSize: "0.8rem",
          fontWeight: 300,
          color: "rgb(136, 136, 136)",
          marginBottom: "18px",
        }}
      >
        Forecasted in advance using Past 10-Day Historical Data (Linear Regression + SMA-3/SMA-7 Crossover + RSI). Click any stock row to inspect its chart.
      </p>

      {/* Summary Metrics Row */}
      <div className="row" style={{ marginTop: "10px", marginBottom: "22px" }}>
        <div className="col">
          <h5 className="up">{profitCount}</h5>
          <p>Predicted profit stocks today</p>
        </div>
        <div className="col">
          <h5 className="down">{lossCount}</h5>
          <p>Predicted loss stocks today</p>
        </div>
        <div className="col">
          <h5 style={{ color: "#4184f3" }}>{avgConfidence}%</h5>
          <p>Average model confidence</p>
        </div>
      </div>

      {/* Selected Stock Past vs Predicted Chart */}
      {activeStock && chartData && (
        <div
          style={{
            border: "1px solid rgb(235, 234, 234)",
            borderRadius: "4px",
            padding: "18px",
            marginBottom: "24px",
            background: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: "12px",
            }}
          >
            <div>
              <h3 className="title" style={{ margin: "0 0 4px 0" }}>
                {activeStock.name} ({activeStock.sector}) —{" "}
                <span
                  className={activeStock.prediction === "PROFIT" ? "up" : "down"}
                >
                  Expected {activeStock.prediction} (
                  {activeStock.expectedPercent >= 0 ? "+" : ""}
                  {activeStock.expectedPercent}%)
                </span>
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8rem",
                  fontWeight: 300,
                  color: "rgb(110, 110, 110)",
                }}
              >
                {activeStock.reason}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: "18px",
                fontSize: "0.8rem",
                fontWeight: 300,
                color: "rgb(70, 70, 70)",
              }}
            >
              <span>Target: ₹{activeStock.targetPrice}</span>
              <span>Stop-Loss: ₹{activeStock.stopLoss}</span>
              <span>RSI: {activeStock.rsi}</span>
            </div>
          </div>

          <div style={{ maxHeight: "260px" }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Predictions Table */}
      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Current (₹)</th>
              <th>Predicted (₹)</th>
              <th>Expected P&L</th>
              <th>Prediction</th>
              <th>SMA-3 / SMA-7</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {filteredPredictions.map((stock) => {
              const isProfit = stock.prediction === "PROFIT";
              const isSelected = activeStock && activeStock.name === stock.name;
              return (
                <tr
                  key={stock.name}
                  onClick={() => setSelectedStock(stock)}
                  style={{
                    cursor: "pointer",
                    background: isSelected ? "#f7faff" : "transparent",
                  }}
                >
                  <td>{stock.name}</td>
                  <td>{stock.currentPrice.toFixed(2)}</td>
                  <td>{stock.predictedPrice.toFixed(2)}</td>
                  <td className={isProfit ? "profit" : "loss"}>
                    {stock.expectedChange >= 0 ? "+" : ""}
                    {stock.expectedChange.toFixed(2)} ({stock.expectedPercent >= 0 ? "+" : ""}
                    {stock.expectedPercent}%)
                  </td>
                  <td className={isProfit ? "profit" : "loss"}>
                    {stock.prediction}
                  </td>
                  <td>
                    {stock.sma3} / {stock.sma7}
                  </td>
                  <td style={{ fontSize: "0.85rem" }}>{stock.confidence}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Predictions;
