import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3002"
    : "https://zerodha-clone-bgai.onrender.com";

const Funds = () => {
  const BASE_OPENING_MARGIN = 4043.1;
  const BASE_USED_MARGIN = 3757.3;
  const BASE_PAYIN = 4064.0;

  const [ordersUsedMargin, setOrdersUsedMargin] = useState(0);

  // Saved added funds & withdrawn funds
  const [addedFunds, setAddedFunds] = useState(() => {
    const saved = localStorage.getItem("zerodha_added_funds");
    return saved ? parseFloat(saved) : 0;
  });

  const [withdrawnFunds, setWithdrawnFunds] = useState(() => {
    const saved = localStorage.getItem("zerodha_withdrawn_funds");
    return saved ? parseFloat(saved) : 0;
  });

  // Commodity Account state
  const [hasCommodityAccount, setHasCommodityAccount] = useState(() => {
    return localStorage.getItem("zerodha_commodity_account") === "true";
  });
  const [commodityBalance] = useState(() => {
    const saved = localStorage.getItem("zerodha_commodity_balance");
    return saved ? parseFloat(saved) : 1500.0;
  });

  // Active action form ("add" | "withdraw" | null)
  const [activeAction, setActiveAction] = useState(null);
  const [amountInput, setAmountInput] = useState("");
  const [message, setMessage] = useState("");

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
      .catch((err) => console.error("Error fetching orders for funds:", err));
  }, []);

  const availableMargin =
    BASE_OPENING_MARGIN + addedFunds - withdrawnFunds - ordersUsedMargin;
  const usedMargin = BASE_USED_MARGIN + ordersUsedMargin;
  const payin = BASE_PAYIN + addedFunds;

  const handleTransactionSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(amountInput);

    if (isNaN(amount) || amount <= 0) {
      setMessage("Please enter a valid amount greater than ₹0.");
      return;
    }

    if (activeAction === "add") {
      const updatedAdded = addedFunds + amount;
      setAddedFunds(updatedAdded);
      localStorage.setItem("zerodha_added_funds", updatedAdded.toString());
      setMessage(`₹${amount.toFixed(2)} added successfully!`);
    } else if (activeAction === "withdraw") {
      if (amount > availableMargin) {
        setMessage("Insufficient available cash to withdraw this amount!");
        return;
      }
      const updatedWithdrawn = withdrawnFunds + amount;
      setWithdrawnFunds(updatedWithdrawn);
      localStorage.setItem(
        "zerodha_withdrawn_funds",
        updatedWithdrawn.toString()
      );
      setMessage(`₹${amount.toFixed(2)} withdrawn successfully!`);
    }

    setAmountInput("");
    setActiveAction(null);
  };

  const handleOpenCommodityAccount = () => {
    setHasCommodityAccount(true);
    localStorage.setItem("zerodha_commodity_account", "true");
    setMessage("Commodity account activated successfully!");
  };

  return (
    <>
      <div className="funds">
        <p>Instant, zero-cost fund transfers with UPI </p>
        <Link
          to="#"
          className="btn btn-green"
          onClick={() => {
            setActiveAction(activeAction === "add" ? null : "add");
            setMessage("");
          }}
        >
          Add funds
        </Link>
        <Link
          to="#"
          className="btn btn-blue"
          onClick={() => {
            setActiveAction(activeAction === "withdraw" ? null : "withdraw");
            setMessage("");
          }}
        >
          Withdraw
        </Link>
      </div>

      {message && (
        <div
          style={{
            marginTop: "12px",
            padding: "10px 15px",
            background: "#e8f5e9",
            color: "#2e7d32",
            borderRadius: "4px",
            fontSize: "0.9rem",
          }}
        >
          {message}
        </div>
      )}

      {activeAction && (
        <form
          onSubmit={handleTransactionSubmit}
          style={{
            marginTop: "15px",
            padding: "15px 20px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            background: "#fafafa",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <strong style={{ fontSize: "0.9rem", color: "#444" }}>
            {activeAction === "add" ? "Add Funds (₹):" : "Withdraw Funds (₹):"}
          </strong>
          <input
            type="number"
            step="0.01"
            placeholder="Enter amount"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #ccc",
              borderRadius: "3px",
            }}
            required
          />
          <button
            type="submit"
            className={`btn ${
              activeAction === "add" ? "btn-green" : "btn-blue"
            }`}
            style={{ border: "none", cursor: "pointer" }}
          >
            {activeAction === "add" ? "Confirm Add" : "Confirm Withdraw"}
          </button>
          <button
            type="button"
            onClick={() => setActiveAction(null)}
            style={{
              padding: "8px 14px",
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
              borderRadius: "3px",
            }}
          >
            Cancel
          </button>
        </form>
      )}

      <div className="row">
        <div className="col">
          <span>
            <p>Equity</p>
          </span>

          <div className="table">
            <div className="data">
              <p>Available margin</p>
              <p className="imp colored">{availableMargin.toFixed(2)}</p>
            </div>
            <div className="data">
              <p>Used margin</p>
              <p className="imp">{usedMargin.toFixed(2)}</p>
            </div>
            <div className="data">
              <p>Available cash</p>
              <p className="imp">{availableMargin.toFixed(2)}</p>
            </div>
            <hr />
            <div className="data">
              <p>Opening Balance</p>
              <p>{BASE_OPENING_MARGIN.toFixed(2)}</p>
            </div>
            <div className="data">
              <p>Opening Balance</p>
              <p>3736.40</p>
            </div>
            <div className="data">
              <p>Payin</p>
              <p>{payin.toFixed(2)}</p>
            </div>
            <div className="data">
              <p>Payout (Withdrawn)</p>
              <p>{withdrawnFunds.toFixed(2)}</p>
            </div>
            <div className="data">
              <p>SPAN</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Delivery margin</p>
              <p>{ordersUsedMargin.toFixed(2)}</p>
            </div>
            <div className="data">
              <p>Exposure</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Options premium</p>
              <p>0.00</p>
            </div>
            <hr />
            <div className="data">
              <p>Collateral (Liquid funds)</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Collateral (Equity)</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Total Collateral</p>
              <p>0.00</p>
            </div>
          </div>
        </div>

        <div className="col">
          {!hasCommodityAccount ? (
            <div className="commodity">
              <p>You don't have a commodity account</p>
              <Link
                to="#"
                className="btn btn-blue"
                onClick={handleOpenCommodityAccount}
              >
                Open Account
              </Link>
            </div>
          ) : (
            <>
              <span>
                <p>Commodity</p>
              </span>
              <div className="table">
                <div className="data">
                  <p>Available margin</p>
                  <p className="imp colored">{commodityBalance.toFixed(2)}</p>
                </div>
                <div className="data">
                  <p>Used margin</p>
                  <p className="imp">0.00</p>
                </div>
                <div className="data">
                  <p>Available cash</p>
                  <p className="imp">{commodityBalance.toFixed(2)}</p>
                </div>
                <hr />
                <div className="data">
                  <p>Opening Balance</p>
                  <p>{commodityBalance.toFixed(2)}</p>
                </div>
                <div className="data">
                  <p>Payin</p>
                  <p>0.00</p>
                </div>
                <div className="data">
                  <p>SPAN</p>
                  <p>0.00</p>
                </div>
                <div className="data">
                  <p>Exposure</p>
                  <p>0.00</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Funds;