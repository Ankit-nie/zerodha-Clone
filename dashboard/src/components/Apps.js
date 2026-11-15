import React, { useState } from "react";

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
    </div>
  );
};

export default Apps;
