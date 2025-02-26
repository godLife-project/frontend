import React, { useEffect } from "react";
import { useApi } from "../../hooks/useApi";

function Home() {
  const { data, loading, error, get } = useApi();

  useEffect(() => {
    get("/categories/topMenu");
  }, [get]); // get 함수를 의존성 배열에 추가

  return (
    <div>
      {loading
        ? "로딩 중..."
        : error
        ? `에러 발생: ${error.message}`
        : data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

export default Home;
