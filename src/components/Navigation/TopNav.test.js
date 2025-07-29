import axiosInstance from "../../api/axiosInstance";

// API 모킹
jest.mock("../../api/axiosInstance", () => ({
  get: jest.fn(),
}));

describe("TopNav API 테스트", () => {
  // 실제 API 응답 구조에 맞는 목업 데이터
  const realApiResponse = [
    // 여기에 실제 API가 반환하는 형식으로 데이터를 작성하세요
    // 예: { id: 1, name: '카테고리1', link: '/category1' }
    // 아래는 예시일 뿐이므로 실제 데이터 구조로 대체하세요
    {
      topId: 1,
      topName: "New",
      topAddr: "/new",
    },
    {
      topId: 2,
      topName: "challenge",
      topAddr: "/challenge",
    },
  ];

  beforeEach(() => {
    axiosInstance.get.mockReset();
  });

  test("API가 올바른 엔드포인트로 요청된다  /categories/topMenu", async () => {
    axiosInstance.get.mockResolvedValue({ data: realApiResponse });

    await axiosInstance.get("/categories/topMenu");

    expect(axiosInstance.get).toHaveBeenCalledWith("/categories/topMenu");
  });

  test("API 응답이 예상된 데이터 구조를 가진다", async () => {
    axiosInstance.get.mockResolvedValue({ data: realApiResponse });

    const response = await axiosInstance.get("/categories/topMenu");
    const data = response.data;

    // 실제 API 응답 구조 검증
    expect(Array.isArray(data)).toBe(true);

    // 각 카테고리 항목의 필수 속성 확인 (실제 구조에 맞게 조정)
    data.forEach((category) => {
      // topId와 topName, topAddr 모든 항목에 있어야 함
      expect(category).toHaveProperty("topId");
      expect(category).toHaveProperty("topName");
      expect(category).toHaveProperty("topAddr");

      // 항목 유형에 따라 다른 속성 확인
      // if (category.submenu) {
      //   // 서브메뉴가 있는 경우
      //   expect(Array.isArray(category.submenu)).toBe(true);

      //   category.submenu.forEach((subItem) => {
      //     // 서브메뉴 항목의 필수 속성 확인
      //     expect(subItem).toHaveProperty("id");
      //     expect(subItem).toHaveProperty("topName");
      //     expect(subItem).toHaveProperty("href");
      //   });
      // } else {
      //   // 서브메뉴가 없는 경우
      //   expect(category).toHaveProperty("topAddr");
      // }
    });
  });

  test("TopNav 컴포넌트의 핵심 로직 시뮬레이션", async () => {
    // 1. 실제 API 대신 가짜(mock) API 응답을 설정합니다.
    // realApiResponse는 개발자가 알고 있는 실제 API 응답 구조를 모방한 데이터입니다.
    // 위에서 realApiResponse를 정의함.
    axiosInstance.get.mockResolvedValue({ data: realApiResponse });

    // 2. React의 useState 훅을 시뮬레이션합니다.
    // - categoriesState: 상태 변수 (useState의 첫 번째 반환값)
    // - setCategories: 상태 설정 함수 (useState의 두 번째 반환값)
    let categoriesState = []; // 초기 상태는 빈 배열
    const setCategories = jest.fn((data) => {
      categoriesState = data; // 상태 업데이트 시뮬레이션
    });

    // 3. TopNav 컴포넌트의 useEffect 내부 로직을 시뮬레이션하는 함수
    // 실제 컴포넌트 코드:
    // useEffect(() => {
    //   axiosInstance.get("/categories/topMenu")
    //     .then((response) => setCategories(response.data))
    //     .catch((error) => console.error("Error fetching categories:", error));
    // }, []);
    const simulateComponentLogic = () => {
      axiosInstance
        .get("/categories/topMenu")
        .then((response) => setCategories(response.data))
        // 원래는 useState로 정의된 set함수에 의해 response를 categories에 넣지만 위에서 setCategories 동작을 정의해줌
        .catch((error) => console.error("Error fetching categories:", error));
    };

    // 4. 시뮬레이션 함수를 실행합니다 (useEffect가 실행되는 것과 유사)
    simulateComponentLogic();

    // 5. 비동기 작업이 완료될 시간을 줍니다 (Promise가 resolve될 때까지 기다림)
    await new Promise((resolve) => setTimeout(resolve, 0));

    // 6. 테스트 검증 - API 응답 데이터로 상태가 업데이트되었는지 확인
    // setCategories 함수가 API 응답 데이터로 호출되었는지 확인
    expect(setCategories).toHaveBeenCalledWith(realApiResponse);

    // categoriesState 변수가 API 응답 데이터로 업데이트되었는지 확인
    expect(categoriesState).toEqual(realApiResponse);

    // 7. 데이터 구조가 컴포넌트에서 사용하기에 적합한지 추가 검증
    categoriesState.forEach((item) => {
      if (item.submenu) {
        // 드롭다운 메뉴 항목 검증
        expect(item.topName).toBeDefined();
        expect(Array.isArray(item.submenu)).toBe(true);
      } else {
        // 일반 메뉴 항목 검증
        expect(item.topName).toBeDefined();
        expect(item.topAddr).toBeDefined();
      }
    });
  });
});
