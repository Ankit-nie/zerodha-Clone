import React from "react";

function RightSection({
  imageUrl,
  productName,
  productDesription,
  learnMore,
}) {
  return (
    <div className="container mt-5 text-center">
      <div className="row">

        <div className="col-6 p-5 mt-5">
          <h1>{productName}</h1>

          <p>{productDesription}</p>

          <div>
            <a href={learnMore}>
              Learn More
              <i className="fa-solid fa-arrow-right-long"></i>
            </a>
          </div>
        </div>

        <div className="col-6">
          <img src={imageUrl} alt={productName} />
        </div>

      </div>
    </div>
  );
}

export default RightSection;
