const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");

const { getAllPredictions, HISTORICAL_STOCK_DATA } = require("../util/StockPredictor");
const { app } = require("../index");

describe("StockPredictor unit tests", () => {
  it("generates predictions for every stock in historical data", () => {
    const predictions = getAllPredictions();
    assert.equal(predictions.length, HISTORICAL_STOCK_DATA.length);
    assert.ok(predictions.length > 0);
  });

  it("returns valid numeric fields, RSI bounds, and trend labels", () => {
    const predictions = getAllPredictions();
    for (const item of predictions) {
      assert.equal(typeof item.name, "string");
      assert.equal(typeof item.currentPrice, "number");
      assert.equal(typeof item.predictedPrice, "number");
      assert.ok(item.rsi >= 0 && item.rsi <= 100, `RSI out of bounds for ${item.name}`);
      assert.ok(
        item.confidence >= 0 && item.confidence <= 100,
        `Confidence out of bounds for ${item.name}`
      );
      assert.ok(["PROFIT", "LOSS"].includes(item.prediction));
      assert.ok(["Bullish", "Bearish"].includes(item.trend));
      assert.equal(item.history.length, 10);
    }
  });
});

describe("TradeX Backend HTTP endpoints", () => {
  let server;
  let baseUrl;

  before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it("GET / returns running status text", async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    const body = await res.text();
    assert.match(body, /TradeX Backend API is running/);
  });

  it("GET /health returns structured JSON health status", async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "ok");
    assert.equal(body.service, "tradex-backend");
    assert.equal(typeof body.uptime, "number");
  });

  it("GET /predictions returns non-empty stock prediction list", async () => {
    const res = await fetch(`${baseUrl}/predictions`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body));
    assert.equal(body.length, HISTORICAL_STOCK_DATA.length);
  });
});
