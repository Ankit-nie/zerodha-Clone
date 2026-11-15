import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3002"
    : "https://zerodha-clone-bgai.onrender.com";

const Orders = () => {
  const [allOrders, setAllOrders] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/allOrders`).then((res) => {
      setAllOrders(res.data);
    });
  }, []);

  const handleDeleteOrder = (id) => {
    axios
      .delete(`${API_BASE_URL}/deleteOrder/${id}`)
      .then(() => {
        setAllOrders((prevOrders) =>
          prevOrders.filter((order) => order._id !== id)
        );
      })
      .catch((err) => console.error("Error deleting order:", err));
  };

  return (
    <div className="orders">
      {allOrders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders today</p>
          <Link to={"/"} className="btn">
            Get started
          </Link>
        </div>
      ) : (
        <>
          <h3 className="title">Orders ({allOrders.length})</h3>
          <div className="order-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Qty.</th>
                  <th>Price</th>
                  <th>Total (₹)</th>
                  <th>Mode</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allOrders.map((stock) => {
                  const total = (Number(stock.qty) || 0) * (Number(stock.price) || 0);
                  const isBuy = stock.mode === "BUY";
                  return (
                    <tr key={stock._id}>
                      <td>{stock.name}</td>
                      <td>{stock.qty}</td>
                      <td>{Number(stock.price).toFixed(2)}</td>
                      <td>{total.toFixed(2)}</td>
                      <td>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "3px",
                            fontSize: "0.72rem",
                            fontWeight: 500,
                            background: isBuy ? "#e3f2fd" : "#fbe9e7",
                            color: isBuy ? "#1976d2" : "#d84315",
                          }}
                        >
                          {stock.mode}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteOrder(stock._id)}
                          style={{
                            background: "#ff5722",
                            color: "#fff",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: "3px",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Orders;