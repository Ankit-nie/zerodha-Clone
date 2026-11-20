import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TopBar from "../components/TopBar";
import Positions from "../components/Positions";
import { positions } from "../data/data";

describe("TradeX Dashboard Components", () => {
  test("TopBar renders market indices and TradeX navigation", () => {
    render(
      <MemoryRouter>
        <TopBar />
      </MemoryRouter>
    );

    expect(screen.getByText(/NIFTY 50/i)).toBeInTheDocument();
    expect(screen.getByText(/SENSEX/i)).toBeInTheDocument();
    expect(screen.getByText(/TradeX/i)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Predictions/i)).toBeInTheDocument();
  });

  test("Positions renders all mock position instruments", () => {
    render(<Positions />);

    expect(
      screen.getByText(`Positions (${positions.length})`)
    ).toBeInTheDocument();
    for (const stock of positions) {
      expect(screen.getByText(stock.name)).toBeInTheDocument();
    }
  });
});
