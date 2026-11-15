import React from "react";

function Hero() {
  return (
    <div className="container border-bottom mb-5">
      <div className="row text-center mt-5 p-5">
        <h2>TradeX Products</h2>
        <h4 className="text-muted mt-3">Sleek, modern, and intuitive trading platforms</h4>
        <p>
          <a href=" " style={{ textDecoration: "none" }}>
            Check out our investment offerings{" "}
            <i class="fa-solid fa-arrow-right-long"></i>
          </a>
        </p>
      </div>
    </div>
  );
}

export default Hero;
