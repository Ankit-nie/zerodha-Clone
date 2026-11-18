import React, { useState } from "react";
import { holdings, watchlist } from "../data/data";

const TRADEX_APPS = [
  {
    id: "coin",
    name: "TradeX Coin",
    category: "Mutual Funds",
    description:
      "Invest in direct mutual funds on TradeX with zero commission, credited straight to your TradeX Demat account.",
    color: "#387ed1",
    items: [
      { name: "TradeX Nifty 50 Index Direct Plan", nav: "₹198.40", cagr: "+15.8%", minSip: "₹500" },
      { name: "TradeX Flexi Cap Growth Fund", nav: "₹84.25", cagr: "+19.4%", minSip: "₹1,000" },
      { name: "TradeX Technology Opportunities Fund", nav: "₹142.10", cagr: "+22.1%", minSip: "₹500" },
    ],
  },
  {
    id: "streak",
    name: "TradeX Streak",
    category: "Algo & Strategy",
    description:
      "Create, backtest, and deploy automated trading strategies inside TradeX without coding.",
    color: "#6c5ce7",
    items: [
      { name: "RSI Momentum Breakout (INFY, TCS)", nav: "Win Rate: 68%", cagr: "+18.2%", minSip: "Active" },
      { name: "20-EMA Intraday Crossover", nav: "Win Rate: 64%", cagr: "+14.5%", minSip: "Active" },
      { name: "Bollinger Band Mean Reversion", nav: "Win Rate: 71%", cagr: "+21.0%", minSip: "Ready" },
    ],
  },
  {
    id: "sensibull",
    name: "TradeX Options",
    category: "Options Trading",
    description:
      "TradeX native options chain, payoff analyzer, and low-risk option strategies for NIFTY & SENSEX.",
    color: "#e17055",
    items: [
      { name: "NIFTY Bull Call Spread", nav: "Max Loss: ₹1,800", cagr: "Max Profit: ₹4,200", minSip: "POP: 62%" },
      { name: "NIFTY Iron Condor Weekly", nav: "Max Loss: ₹2,400", cagr: "Max Profit: ₹3,100", minSip: "POP: 74%" },
      { name: "SENSEX Straddle Hedge", nav: "Max Loss: ₹1,500", cagr: "Max Profit: Unlimited", minSip: "POP: 58%" },
    ],
  },
  {
    id: "smallcase",
    name: "TradeX Baskets",
    category: "Thematic Investing",
    description:
      "Invest in ready-made stock baskets curated by TradeX research across IT, Energy, and Banking.",
    color: "#00b894",
    items: [
      { name: "TradeX IT Leaders (TCS, INFY, WIPRO, KPITTECH)", nav: "₹6,589.45", cagr: "+17.6%", minSip: "4 Stocks" },
      { name: "TradeX Bluechip Dividend Basket (ONGC, HUL, RELIANCE)", nav: "₹2,741.60", cagr: "+14.9%", minSip: "3 Stocks" },
      { name: "TradeX Auto & Tech Growth (M&M, KPITTECH)", nav: "₹1,046.25", cagr: "+24.3%", minSip: "2 Stocks" },
    ],
  },
  {
    id: "varsity",
    name: "TradeX Academy",
    category: "Education",
    description:
      "Learn stock market fundamentals, technical analysis, and risk management directly on TradeX.",
    color: "#fdcb6e",
    items: [
      { name: "Module 1: Introduction to Stock Markets & Demat", nav: "12 Chapters", cagr: "Beginner", minSip: "Free" },
      { name: "Module 2: Technical Analysis & Candlestick Patterns", nav: "18 Chapters", cagr: "Intermediate", minSip: "Free" },
      { name: "Module 3: Position Sizing & Portfolio Risk Management", nav: "10 Chapters", cagr: "Advanced", minSip: "Free" },
    ],
  },
  {
    id: "ditto",
    name: "TradeX Shield",
    category: "Portfolio Protection",
    description:
      "Protect your capital and family with TradeX advisory for emergency funds, health, and term cover.",
    color: "#0984e3",
    items: [
      { name: "TradeX Emergency Liquid Reserve Plan", nav: "6x Monthly Expense", cagr: "6.8% Yield", minSip: "Instant" },
      { name: "TradeX Comprehensive Health Shield", nav: "₹10L - ₹50L Cover", cagr: "Zero Co-pay", minSip: "₹450/mo" },
      { name: "TradeX Pure Term Protection", nav: "₹1 Cr Life Cover", cagr: "99.3% Claim Ratio", minSip: "₹620/mo" },
    ],
  },
];

const Apps = () => {
  const [connectedApps, setConnectedApps] = useState(() => {
    const saved = localStorage.getItem("zerodha_connected_apps");
    return saved ? JSON.parse(saved) : ["coin", "varsity"];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [openedAppId, setOpenedAppId] = useState(null);
  const [appActionMsg, setAppActionMsg] = useState("");

  // Extra Feature states: Simulator & Price Alerts
  const [marketShift, setMarketShift] = useState(0);
  const [alertStock, setAlertStock] = useState(watchlist[0]?.name || "INFY");
  const [targetPrice, setTargetPrice] = useState("");
  const [priceAlerts, setPriceAlerts] = useState(() => {
    const saved = localStorage.getItem("zerodha_price_alerts");
    return saved
      ? JSON.parse(saved)
      : [
          { stock: "INFY", price: "1500.00" },
          { stock: "TCS", price: "3150.00" },
        ];
  });

  const toggleConnectApp = (id) => {
    const updated = connectedApps.includes(id)
      ? connectedApps.filter((appId) => appId !== id)
      : [...connectedApps, id];
    setConnectedApps(updated);
    localStorage.setItem("zerodha_connected_apps", JSON.stringify(updated));
  };

  const filteredApps = TRADEX_APPS.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "connected" && connectedApps.includes(app.id));
    return matchesSearch && matchesFilter;
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

  const activeApp = TRADEX_APPS.find((a) => a.id === openedAppId);

  // If user clicked "Open App", render the internal TradeX App Portal
  if (activeApp) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3 className="title" style={{ margin: 0 }}>
            {activeApp.name} — {activeApp.category}
          </h3>
          <button
            onClick={() => {
              setOpenedAppId(null);
              setAppActionMsg("");
            }}
            className="btn btn-blue"
            style={{
              border: "none",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: 300,
              padding: "8px 14px",
            }}
          >
            ← Back to TradeX Apps
          </button>
        </div>

        <p
          style={{
            marginBottom: "20px",
            lineHeight: "1.6",
            fontSize: "0.8rem",
            fontWeight: 300,
            color: "rgb(70, 70, 70)",
          }}
        >
          {activeApp.description}
        </p>

        {appActionMsg && (
          <div
            style={{
              padding: "10px 16px",
              marginBottom: "18px",
              border: "1px solid rgb(235, 234, 234)",
              borderLeft: "3px solid rgb(103, 201, 136)",
              color: "rgb(70, 70, 70)",
              fontSize: "0.8rem",
              fontWeight: 300,
            }}
          >
            {appActionMsg}
          </div>
        )}

        <div className="order-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Details</th>
                <th>Return / Metric</th>
                <th>Requirement</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeApp.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.nav}</td>
                  <td className="profit">{item.cagr}</td>
                  <td>{item.minSip}</td>
                  <td>
                    <button
                      onClick={() =>
                        setAppActionMsg(
                          `TradeX Order initiated for "${item.name}" under your TradeX account.`
                        )
                      }
                      className="btn btn-blue"
                      style={{
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        fontWeight: 300,
                        padding: "5px 12px",
                      }}
                    >
                      Select on TradeX
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

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
          TradeX Apps ({filteredApps.length})
        </h3>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search TradeX apps..."
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
          <button
            onClick={() => setFilter("all")}
            className="btn"
            style={{
              background: filter === "all" ? "#4184f3" : "#f1f1f1",
              color: filter === "all" ? "#fff" : "rgb(70, 70, 70)",
              border: "none",
              cursor: "pointer",
              padding: "8px 14px",
              fontFamily: "inherit",
              fontSize: "0.8rem",
              fontWeight: 300,
            }}
          >
            All Apps
          </button>
          <button
            onClick={() => setFilter("connected")}
            className="btn"
            style={{
              background: filter === "connected" ? "#4184f3" : "#f1f1f1",
              color: filter === "connected" ? "#fff" : "rgb(70, 70, 70)",
              border: "none",
              cursor: "pointer",
              padding: "8px 14px",
              fontFamily: "inherit",
              fontSize: "0.8rem",
              fontWeight: 300,
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
                borderRadius: "4px",
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
                        width: "34px",
                        height: "34px",
                        borderRadius: "4px",
                        background: app.color,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 300,
                        fontSize: "0.85rem",
                      }}
                    >
                      {app.name.replace("TradeX ", "")[0].toUpperCase()}
                    </div>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.85rem",
                          fontWeight: 300,
                          color: "rgb(70, 70, 70)",
                        }}
                      >
                        {app.name}
                      </p>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 300,
                          color: "rgb(110, 110, 110)",
                        }}
                      >
                        {app.category}
                      </span>
                    </div>
                  </div>

                  {isConnected && (
                    <span
                      className="up"
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 300,
                      }}
                    >
                      Active
                    </span>
                  )}
                </div>

                <p
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 300,
                    color: "rgb(70, 70, 70)",
                    lineHeight: "1.5",
                    margin: "10px 0 18px",
                  }}
                >
                  {app.description}
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setOpenedAppId(app.id)}
                  className="btn btn-blue"
                  style={{
                    fontFamily: "inherit",
                    fontSize: "0.8rem",
                    fontWeight: 300,
                    padding: "7px 14px",
                    textAlign: "center",
                    flex: 1,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Open App
                </button>
                <button
                  onClick={() => toggleConnectApp(app.id)}
                  style={{
                    fontFamily: "inherit",
                    fontSize: "0.8rem",
                    fontWeight: 300,
                    padding: "7px 12px",
                    border: isConnected
                      ? "1px solid rgb(223, 73, 73)"
                      : "1px solid rgb(103, 201, 136)",
                    background: "#fff",
                    color: isConnected
                      ? "rgb(223, 73, 73)"
                      : "rgb(103, 201, 136)",
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
        <h3 className="title">TradeX Portfolio Simulator</h3>
        <p
          style={{
            fontSize: "0.8rem",
            fontWeight: 300,
            color: "rgb(70, 70, 70)",
            marginBottom: "10px",
          }}
        >
          Simulate NIFTY 50 movement (-20% to +20%)
        </p>
        <input
          type="range"
          min="-20"
          max="20"
          value={marketShift}
          onChange={(e) => setMarketShift(Number(e.target.value))}
          style={{ width: "50%", marginTop: "6px" }}
        />

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
        <h3 className="title">TradeX Smart Price Alerts ({priceAlerts.length})</h3>
        <form
          onSubmit={handleAddPriceAlert}
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <select
            value={alertStock}
            onChange={(e) => setAlertStock(e.target.value)}
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
              border: "1px solid rgb(224, 224, 224)",
              borderRadius: "2px",
              fontFamily: "inherit",
              fontSize: "0.8rem",
              fontWeight: 300,
              color: "rgb(70, 70, 70)",
              outline: "none",
            }}
          />
          <button
            type="submit"
            className="btn btn-blue"
            style={{
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "0.8rem",
              fontWeight: 300,
              padding: "8px 14px",
            }}
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
                        fontFamily: "inherit",
                        fontSize: "0.8rem",
                        fontWeight: 300,
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
