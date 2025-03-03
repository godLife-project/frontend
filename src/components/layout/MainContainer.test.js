import React from "react";
import { render, screen } from "@testing-library/react";
import MainContainer from "./MainContainer";

describe("MainContainer 컴포넌트", () => {
  test("자식 요소가 올바르게 렌더링되는지 확인", () => {
    // 테스트용 자식 요소 생성
    const testContent = <div data-testid="test-content">테스트 콘텐츠</div>;

    // MainContainer에 자식 요소를 넣어 렌더링
    render(<MainContainer>{testContent}</MainContainer>);

    // 자식 요소가 DOM에 존재하는지 확인
    const contentElement = screen.getByTestId("test-content");
    expect(contentElement).toBeInTheDocument();
    expect(contentElement.textContent).toBe("테스트 콘텐츠");
  });
  test("여러 자식 요소가 올바르게 렌더링되는지 확인", () => {
    // 여러 자식 요소 생성
    const multipleChildren = (
      <>
        <div data-testid="first-child">첫 번째 요소</div>
        <div data-testid="second-child">두 번째 요소</div>
        <div data-testid="third-child">세 번째 요소</div>
      </>
    );

    // MainContainer에 여러 자식 요소 렌더링
    render(<MainContainer>{multipleChildren}</MainContainer>);

    // 모든 자식 요소가 존재하는지 확인
    expect(screen.getByTestId("first-child")).toBeInTheDocument();
    expect(screen.getByTestId("second-child")).toBeInTheDocument();
    expect(screen.getByTestId("third-child")).toBeInTheDocument();
  });
  test("내용이 없을 때도 제대로 렌더링되는지 확인", () => {
    // children 없이 렌더링
    const { container } = render(<MainContainer />);

    // 빈 컨테이너가 렌더링되었는지 확인
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild.textContent).toBe("");
  });
});
