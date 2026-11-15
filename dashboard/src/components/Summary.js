import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3002"
    : "https://zerodha-clone-bgai.onrender.com";

const Summary = () => {
  const BASE_OPENING_MARGIN = 4043.1;
  const [ordersUsedMargin, setOrdersUsedMargin] = useState(0);

  const addedFunds = parseFloat(localStorage.getItem("zerodha_added_funds") || "0");
  const withdrawnFunds = parseFloat(localStorage.getItem("zerodha_withdrawn_funds") || "0");

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/allOrders`)
      .then((res) => {
        const totalOrderCost = res.data.reduce((sum, order) => {
          const qty = Number(order.qty) || 0;
          const price = Number(order.price) || 0;
          return order.mode === "SELL" ? sum - qty * price : sum + qty * price;
        }, 0);
        setOrdersUsedMargin(totalOrderCost);
      })
      .catch((err) => console.error("Error fetching orders for summary:", err));
  }, []);

  const availableMargin = BASE_OPENING_MARGIN + addedFunds - withdrawnFunds - ordersUsedMargin;
  const savedProfile = JSON.parse(localStorage.getItem("zerodha_user_profile") || '{"name":"Ankit"}');

  return (
    <>
      <div className="username">
        <h6>Hi, {savedProfile.name}!</h6>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Equity</p>
        </span>

        <div className="data">
          <div className="first">
            <h3>{(availableMargin / 1000).toFixed(2)}k</h3>
            <p>Margin available</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Margins used <span>{ordersUsedMargin.toFixed(2)}</span>{" "}
            </p>
            <p>
              Opening balance <span>{(BASE_OPENING_MARGIN / 1000).toFixed(2)}k</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Holdings (13)</p>
        </span>

        <div className="data">
          <div className="first">
            <h3 className="profit">
              1.55k <small>+5.20%</small>{" "}
            </h3>
            <p>P&L</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Current Value <span>31.43k</span>{" "}
            </p>
            <p>
              Investment <span>29.88k</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>
    </>
  );
};

export default Summary;
