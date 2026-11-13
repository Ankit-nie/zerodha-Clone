import React from "react";

function Hero() {
  return (
    <section className="container-fluid" id="supportHero">
      <div className="p-5" id="supportWrapper">
        <h4>Support Portal</h4>
        <a href="">Track Tickets</a>
      </div>
      <div className=" row p-5 m-5">
        <div className="col-6 p-5">
          <h1 className="fs-3">
            Search for an answer of browser help topics to create a tickets
          </h1>
          <input placeholder="Eg. how do i activate F&Q,why is my order getting rejected" />
          <br />
          <a href="">Track account Opening</a> &nbsp;&nbsp;
          <a href="">Track segment activation</a>&nbsp;&nbsp;
          <a href="">intraday margins</a>&nbsp;&nbsp;
          <a href="">kite user manuals</a>
        </div>
        <div className="col-6 p-5 ps-5 ">
          <h1 className="fs-3">Featured</h1>
          <ol style={{ lineHeight: "2.5" }}>
            <li>
              <a href="">Current Takeovers and Delisting - january 2024</a>
            </li>
            <li>
              <a href="">Latest Intraday leveages -MIS & CO</a>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

export default Hero;
