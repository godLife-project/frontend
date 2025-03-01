import React from "react";
import { render, screen } from "@testing-library/react";

// API 모듈만 모킹
jest.mock("../../api/axiosInstance", () => ({
  default: {
    get: jest.fn().mockImplementation(() => Promise.resolve({ data: [] }))
  }
}));

// 모킹을 먼저 정의 (중요: import 문 이후, 다른 코드 이전에 정의)
jest.mock("./Header", () => {
  return function MockHeader() {
    return <header data-testid="mock-header">Header Component</header>;
  };
});

jest.mock("./Footer", () => {
  return function MockFooter() {
    return <footer data-testid="mock-footer">Footer Component</footer>;
  };
});

jest.mock("./MainContainer", () => {
  return function MockMainContainer({ children }) {
    return <main data-testid="mock-main-container">{children}</main>;
  };
});

// 테스트할 컴포넌트 import (모킹 이후에 import)
import Layout from "./Layout";

describe("Layout 컴포넌트 테스트", () => {
  test("모든 필수 컴포넌트(Header, Footer, MainContainer)가 존재하는지 확인", () => {
    render(
      <Layout>
        <div data-testid="test-content">테스트 콘텐츠</div>
      </Layout>
    );

    // 모의 컴포넌트들이 DOM에 렌더링되었는지 확인
    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
    expect(screen.getByTestId("mock-main-container")).toBeInTheDocument();
  });

  test("자식 요소가 MainContainer에 올바르게 전달되는지 확인", () => {
    render(
      <Layout>
        <div data-testid="test-content">테스트 콘텐츠</div>
      </Layout>
    );

    // MainContainer 내부에 자식 요소가 있는지 확인
    const mainContainer = screen.getByTestId("mock-main-container");
    const testContent = screen.getByTestId("test-content");
    expect(mainContainer).toContainElement(testContent);
  });

  test("Layout이 Header, MainContainer, Footer 순으로 flex-col되어 보이는지 확인", () => {
    const { container } = render(
      <Layout>
        <div>테스트 콘텐츠</div>
      </Layout>
    );

    // Layout의 루트 div 요소가 올바른 클래스를 가지고 있는지 확인
    const layoutRoot = container.firstChild;
    expect(layoutRoot).toHaveClass("flex");
    expect(layoutRoot).toHaveClass("flex-col");
    expect(layoutRoot).toHaveClass("min-h-screen");
  });
});
