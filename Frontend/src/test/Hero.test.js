import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import Hero from "../landing_page/home/Hero";

describe("Hero Component", () => {
  test("renders hero image", () => {
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    );
    const heroImage = screen.getByAltText("Hero Image");
    expect(heroImage).toBeInTheDocument();
    expect(heroImage).toHaveAttribute("src", "media/homeHero.png");
  });

  test("renders signup link button", () => {
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    );
    const signupLink = screen.getByRole("link", { name: /signup for free/i });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveClass("btn-primary");
    expect(signupLink).toHaveAttribute("href", "/signup");
  });
});