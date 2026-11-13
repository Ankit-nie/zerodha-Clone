import React from "react";

function LeftSection({
  imageUrl,
  productName,
  productDesription,
  tryDemo,
  learnMore,
  googlePlay,
  appStore,
}) {
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-6 p-5">
          <img src={imageUrl} />
        </div>

        <div className="col-6 p-5 mt-5">
          <h1>{productName}</h1>

          <p>{productDesription}</p>

          <div style={{ textDecoration: "none" }}>
            <a href={tryDemo}>
              TryDemo <i class="fa-solid fa-arrow-right-long"></i>
            </a>

            <a href={learnMore} style={{ marginLeft: "50px" }} >
              LearnMore <i class="fa-solid fa-arrow-right-long"></i>
            </a>
          </div>

          <div className="mt-3 ">
            <a href={googlePlay}>
              <img
                src="media/googlePlayBadge.svg"
                style={{ width: "150px" }}
                alt="Google Play"
              />
            </a>

            <a href={appStore}>
              <img
                src="media/appStoreBadge.svg"
                style={{ width: "150px" }}
                alt="App Store"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeftSection;
