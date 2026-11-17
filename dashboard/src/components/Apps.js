import React, { useState } from "react";
import { holdings, watchlist } from "../data/data";

const ZERODHA_APPS = [
  {
    id: "coin",
    name: "Coin",
    category: "Mutual Funds",
    description:
      "Buy direct mutual funds online with zero commission, directly deposited to your Demat account.",
    url: "https://coin.zerodha.com",
    color: "#387ed1",
  },
  {
    id: "streak",
    name: "Streak",
    category: "Algo & Strategy",
    description:
      "Create, backtest, and deploy trading algorithms without writing a single line of code.",
    url: "https://www.streak.tech",
    color: "#6c5ce7",
  },
  {
    id: "sensibull",
    name: "Sensibull",
    category: "Options Trading",
    description:
      "India's largest options trading platform with strategy builder, option chain, and virtual trading.",
    url: "https://sensibull.com",
    color: "#e17055",
  },
  {
    id: "smallcase",
    name: "smallcase",
    category: "Thematic Investing",
    description:
      "Invest in ready-made portfolios of stocks and ETFs curated by SEBI-registered experts.",
    url: "https://www.smallcase.com",
    color: "#00b894",
  },
  {
    id: "varsity",
    name: "Varsity",
    category: "Education",
    description:
      "Free, in-depth collection of stock market and financial lessons with illustrations.",
    url: "https://zerodha.com/varsity",
    color: "#fdcb6e",
  },
  {
    id: "ditto",
    name: "Ditto",
    category: "Insurance",
    description:
      "Compare and buy health and term life insurance with spam-free personalized advice.",
    url: "https://joinditto.in",
    color: "#0984e3",
  },
];

const Apps = () => {
  const [connectedApps, setConnectedApps] = useState(() => {
    const saved = localStorage.getItem("zerodha_connected_apps");
    return saved ? JSON.parse(saved) : ["coin", "varsity"];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [marketShift, setMarketShift] = useState(0);
  const [alertStock, setAlertStock] = useState(watchlist[0]?.name || "INFY");
  const [targetPrice, setTargetPrice] = useState("");
  const [priceAlerts, setPriceAlerts] = useState(() => {
    const saved = localStorage.getItem("zerodha_price_alerts");
    return saved
      ? JSON.parse(saved)
      : [{ stock: "INFY", price: "1500.00" }, { stock: "TCS", price: "3150.00" }];
  });

  const currentPortfolioValue = holdings.reduce(
    (total, stock) => total + stock.price * stock.qty,
    0
  );
  const projectedValue = currentPortfolioValue * (1 + marketShift / 100);
  const difference = projectedValue - currentPortfolioValue;

  const handleAddPriceAlert = (e) => {
    e.preventDefault();
    if (!targetPrice || Number(targetPrice) <= 0) return;
    const updated = [
      ...priceAlerts,
      { stock: alertStock, price: Number(targetPrice).toFixed(2) },
    ];
    setPriceAlerts(updated);
    localStorage.setItem("zerodha_price_alerts", JSON.stringify(updated));
    setTargetPrice("");
  };

  const handleRemoveAlert = (indexToRemove) => {
    const updated = priceAlerts.filter((_, idx) => idx !== indexToRemove);
    setPriceAlerts(updated);
    localStorage.setItem("zerodha_price_alerts", JSON.stringify(updated));
  };

  const toggleConnectApp = (id) => {
    const updated = connectedApps.includes(id)
      ? connectedApps.filter((appId) => appId !== id)
      : [...connectedApps, id];
    setConnectedApps(updated);
    localStorage.setItem("zerodha_connected_apps", JSON.stringify(updated));
  };

  const filteredApps = ZERODHA_APPS.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "connected" && connectedApps.includes(app.id));
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ padding: "10px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <h3 className="title" style={{ margin: 0 }}>
          Apps ({filteredApps.length})
        </h3>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search apps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "0.85rem",
            }}
          />
          <button
            onClick={() => setFilter("all")}
            className="btn"
            style={{
              background: filter === "all" ? "#4184f3" : "#f1f1f1",
              color: filter === "all" ? "#fff" : "#444",
              border: "none",
              cursor: "pointer",
              padding: "8px 14px",
              fontSize: "0.8rem",
            }}
          >
            All Apps
          </button>
          <button
            onClick={() => setFilter("connected")}
            className="btn"
            style={{
              background: filter === "connected" ? "#4184f3" : "#f1f1f1",
              color: filter === "connected" ? "#fff" : "#444",
              border: "none",
              cursor: "pointer",
              padding: "8px 14px",
              fontSize: "0.8rem",
            }}
          >
            Connected ({connectedApps.length})
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "18px",
        }}
      >
        {filteredApps.map((app) => {
          const isConnected = connectedApps.includes(app.id);
          return (
            <div
              key={app.id}
              style={{
                border: "1px solid #e0e0e0",
                borderRadius: "6px",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: "#fff",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "6px",
                        background: app.color,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "600",
                        fontSize: "1rem",
                      }}
                    >
                      {app.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "1rem",
                          color: "#333",
                          fontWeight: 500,
                        }}
                      >
                        {app.name}
                      </h4>
                      <span style={{ fontSize: "0.75rem", color: "#888" }}>
                        {app.category}
                      </span>
                    </div>
                  </div>

                  {isConnected && (
                    <span
                      style={{
                        fontSize: "0.7rem",
                        background: "#e8f5e9",
                        color: "#2e7d32",
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontWeight: 500,
                      }}
                    >
                      Active
                    </span>
                  )}
                </div>

                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "#666",
                    lineHeight: "1.45",
                    margin: "10px 0 18px",
                  }}
                >
                  {app.description}
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <a
                  href={app.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-blue"
                  style={{
                    fontSize: "0.8rem",
                    padding: "7px 14px",
                    textAlign: "center",
                    flex: 1,
                  }}
                >
                  Open App
                </a>
                <button
                  onClick={() => toggleConnectApp(app.id)}
                  style={{
                    fontSize: "0.8rem",
                    padding: "7px 12px",
                    border: isConnected
                      ? "1px solid #ef5350"
                      : "1px solid #4caf50",
                    background: "#fff",
                    color: isConnected ? "#ef5350" : "#4caf50",
                    borderRadius: "2px",
                    cursor: "pointer",
                  }}
                >
                  {isConnected ? "Disconnect" : "Connect"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <hr className="divider" />

      {/* Extra Feature 1: Portfolio What-If Simulator */}
      <div className="section">
        <h3 className="title">Portfolio Simulator</h3>
        <div className="col">
          <p>Simulate NIFTY 50 movement (-20% to +20%)</p>
          <input
            type="range"
            min="-20"
            max="20"
            value={marketShift}
            onChange={(e) => setMarketShift(Number(e.target.value))}
            style={{ width: "50%", marginTop: "12px" }}
          />
        </div>

        <div className="row">
          <div className="col">
            <h5>{marketShift > 0 ? `+${marketShift}%` : `${marketShift}%`}</h5>
            <p>Market change</p>
          </div>
          <div className="col">
            <h5>{currentPortfolioValue.toFixed(2)}</h5>
            <p>Current value</p>
          </div>
          <div className="col">
            <h5 className={difference >= 0 ? "up" : "down"}>
              {projectedValue.toFixed(2)}{" "}
              <span>
                ({difference >= 0 ? "+" : ""}
                {difference.toFixed(2)})
              </span>
            </h5>
            <p>Projected value</p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      {/* Extra Feature 2: Smart GTT Price Alerts */}
      <div className="section">
        <h3 className="title">Smart Price Alerts ({priceAlerts.length})</h3>
        <form
          onSubmit={handleAddPriceAlert}
          style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "20px" }}
        >
          <select
            value={alertStock}
            onChange={(e) => setAlertStock(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "2px",
              fontSize: "0.85rem",
              color: "rgb(71, 71, 71)",
              fontWeight: 300,
            }}
          >
            {watchlist.map((stock, idx) => (
              <option key={idx} value={stock.name}>
                {stock.name} (₹{stock.price})
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.05"
            placeholder="Target price (₹)"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "2px",
              fontSize: "0.85rem",
              color: "rgb(71, 71, 71)",
              fontWeight: 300,
            }}
          />
          <button
            type="submit"
            className="btn btn-blue"
            style={{ border: "none", cursor: "pointer", fontSize: "0.8rem" }}
          >
            Add Alert
          </button>
        </form>

        <div className="order-table">
          <table>
            <thead>
              <tr>
                <th>Instrument</th>
                <th>Target Price (₹)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {priceAlerts.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.stock}</td>
                  <td>{item.price}</td>
                  <td className="profit">Active</td>
                  <td>
                    <button
                      onClick={() => handleRemoveAlert(idx)}
                      style={{
                        background: "#ff5722",
                        color: "#fff",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "2px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Apps;
