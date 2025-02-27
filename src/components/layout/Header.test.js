import React from "react";
import { render, screen } from "@testing-library/react";
import Header from "./Header";

// TopNav와 SideNav 컴포넌트를 모킹
jest.mock("../Navigation/TopNav", () => {
  return function MockTopNav() {
    return <div data-testid="mock-top-nav">Top Navigation</div>;
  };
});

jest.mock("../Navigation/SideNav", () => {
  return function MockSideNav() {
    return <div data-testid="mock-side-nav">Side Navigation</div>;
  };
});

describe("Header 컴포넌트", () => {
  test("TopNav와 SideNav 컴포넌트를 가지고 있는지 확인(실제 컴포넌트를 렌더링해서 확인X nav들이 있는지 구조적 확인일 뿐)", () => {
    render(<Header />);

    // TopNav 컴포넌트 확인
    const topNav = screen.getByTestId("mock-top-nav");
    expect(topNav).toBeInTheDocument();
    expect(topNav.textContent).toBe("Top Navigation");

    // SideNav 컴포넌트 확인
    const sideNav = screen.getByTestId("mock-side-nav");
    expect(sideNav).toBeInTheDocument();
    expect(sideNav.textContent).toBe("Side Navigation");

    // expect(screen.getByTestId("top-navigation")).toBeInTheDocument();
    // expect(screen.getByTestId("side-navigation")).toBeInTheDocument();
  });
});
