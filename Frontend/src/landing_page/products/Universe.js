import React from "react";
import { useNavigate } from "react-router-dom";

function Universe() {
  const navigate = useNavigate();

  return (
    <div className="container mt-5  text-center">
      <div className="row">
        <h1 className="mt-5">The Zerodha Universe</h1>
        <p className="mt-3">
          Extend your trading and investment experience even further with our
          partner platforms
        </p>
        <div className="col-4 p-3">
          <img
            style={{
              width: "200px",
              height: "70px",
              objectFit: "contain",
              marginBottom: "20px",
            }}
            src="media/zerodhaFundhouse.png"
          />
          <p className="text-small text-muted">
            Our asset management venture that is creating simple and transparent
            index funds to help you save for your goals.
          </p>
        </div>
        <div className="col-4 p-3 ">
          <img
            style={{
              width: "200px",
              height: "70px",
              objectFit: "contain",
              marginBottom: "20px",
            }}
            src="media/sensibullLogo.svg"
          />
          <p className="text-small text-muted">
            Options trading platform that lets you create strategies, analyze
            positions, and examine data points like open interest, FII/DII, and
            more.
          </p>
        </div>
        <div className="col-4 p-3 ">
          <img
            style={{
              width: "200px",
              height: "70px",
              objectFit: "contain",
              marginBottom: "20px",
            }}
            src="media/goldenpiLogo.png"
          />
          <p className="text-small text-muted">
            Investment research platform that offers detailed insights on
            stocks, sectors, supply chains, and more.
          </p>
        </div>
        <div className="col-4 p-3 mt-5">
          <img
            style={{
              width: "200px",
              height: "70px",
              objectFit: "contain",
              marginBottom: "20px",
            }}
            src="media/smallcaseLogo.png"
          />
          <p className="text-small text-muted">
            Thematic investing platform that helps you invest in diversified
            baskets of stocks on ETFs.
          </p>
        </div>
        <div className="col-4 p-3 mt-5">
          <img
            style={{
              width: "200px",
              height: "70px",
              objectFit: "contain",
              marginBottom: "20px",
            }}
            src="media/streakLogo.png"
          />
          <p className="text-small text-muted">
            Thematic investing platform that helps you invest in diversified
            baskets of stocks on ETFs.
          </p>
        </div>
        <div className="col-4 p-3 mt-5">
          <img
            style={{
              width: "200px",
              height: "70px",
              objectFit: "contain",
              marginBottom: "20px",
            }}
            src="media/dittoLogo.png"
          />
          <p className="text-small text-muted">
            Personalized advice on life and health insurance. No spam and no
            mis-selling.
          </p>
        </div>
        <button
          onClick={() => navigate("/signup")}
          className="p-2 btn btn-primary fs-5 mb-5"
          style={{ width: "20%", margin: "0 auto" }}
        >
          Signup for free
        </button>
      </div>
    </div>
  );
}

export default Universe;