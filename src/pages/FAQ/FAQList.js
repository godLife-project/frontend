// import { useState } from "react";
// import { Input } from "@/components/ui/input";
// import axiosInstance from "@/api/axiosInstance";
// import { useNavigate } from "react-router-dom";
// const faqData = [
//   {
//     id: 1,
//     category: "routine",
//     question: "루틴은 어떻게 설정하나요?",
//     answer:
//       "루틴 설정은 메인 화면에서 '루틴 추가' 버튼을 클릭하여 새로운 루틴을 만들 수 있습니다.",
//   },
//   {
//     id: 2,
//     category: "challenge",
//     question: "챌린지에 참여하는 방법은 무엇인가요?",
//     answer: "챌린지 메뉴에서 확인 후 참여할 수 있습니다.",
//   },
//   {
//     id: 3,
//     category: "account",
//     question: "이메일로 인증번호가 오지 않아요.",
//     answer: "스팸편지함으로 이동되어 있지는 않은지 확인해 주세요.",
//   },
//   {
//     id: 4,
//     category: "account",
//     question: "아이디를 잊어버렸어요.",
//     answer: "로그인 화면에서 '아이디 찾기'를 이용하세요.",
//   },
//   {
//     id: 5,
//     category: "account",
//     question: "비밀번호를 잊어버렸어요.",
//     answer: "로그인 화면에서 '비밀번호 찾기'를 이용하세요.",
//   },
// ];

// const categories = [
//   { key: "all", label: "전체" },
//   { key: "routine", label: "루틴" },
//   { key: "challenge", label: "챌린지" },
//   { key: "account", label: "계정" },
// ];

// const PER_PAGE = 4;

// export default function FAQPage() {
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("all");
//   const [openId, setOpenId] = useState(null);
//   const [page, setPage] = useState(1);
//   const navigate = useNavigate();
//   const filtered = faqData.filter(
//     (item) =>
//       (category === "all" || item.category === category) &&
//       (item.question.includes(search) || item.answer.includes(search))
//   );

//   const totalPages = Math.ceil(filtered.length / PER_PAGE);
//   const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

//   const handleCategoryChange = (key) => {
//     setCategory(key);
//     setPage(1); // 페이지 초기화
//     setOpenId(null); // 열려 있는 질문 닫기기
//   };

//   return (
//     <div className="container mx-auto py-8">
//       <h1 className="text-3xl font-extrabold tracking-tight mb-2">FAQ</h1>
//       <p className="text-muted-foreground mb-4">
//         자주 묻는 질문들을 확인하세요
//       </p>

//       <Input
//         placeholder="궁금한 내용을 검색해보세요요"
//         className="mb-6"
//         value={search}
//         onChange={(e) => {
//           setSearch(e.target.value);
//           setPage(1);
//         }}
//       />

//       <div className="flex gap-2 mb-6">
//         {categories.map((cat) => (
//           <button
//             key={cat.key}
//             onClick={() => handleCategoryChange(cat.key)}
//             className={`px-4 py-2 rounded text-sm border ${
//               category === cat.key
//                 ? "bg-black text-white border-black"
//                 : "bg-transparent text-gray-700 border-gray-300"
//             }`}
//           >
//             {cat.label}
//           </button>
//         ))}
//       </div>

//       {paginated.length === 0 ? (
//         <p className="text-center text-gray-400 py-12">검색 결과가 없습니다.</p>
//       ) : (
//         <div className="divide-y divide-gray-200">
//           {paginated.map((faq) => (
//             <div
//               key={faq.id}
//               className="py-4 cursor-pointer"
//               onClick={() =>
//                 setOpenId((prev) => (prev === faq.id ? null : faq.id))
//               }
//             >
//               <div className="flex justify-between items-center text-sm mb-1"></div>
//               <div className="font-semibold text-base flex justify-between items-center">
//                 {faq.question}
//                 <span className="text-gray-400 text-xl">
//                   {openId === faq.id ? "−" : "+"}
//                 </span>
//               </div>
//               {openId === faq.id && (
//                 <p className="text-sm text-gray-600 mt-3 pl-1">{faq.answer}</p>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//       <div className="flex justify-end mt-6 mb-4">
//         <button
//           onClick={() => navigate("/inquiry")}
//           className="text-black  text-sm font-medium"
//         >
//           더 궁금한 것이 있으신가요?{" "}
//           <span className="font-bold hover:text-black hover:underline ">
//             1:1 문의
//           </span>
//         </button>
//       </div>

//       {/* 페이지네이션 */}
//       {totalPages > 1 && (
//         <div className="flex justify-center items-center gap-4 mt-8 text-sm">
//           <button
//             onClick={() => setPage((p) => Math.max(p - 1, 1))}
//             disabled={page === 1}
//             className="px-3 py-1 border rounded disabled:opacity-30"
//           >
//             이전
//           </button>
//           <span>
//             {page} / {totalPages}
//           </span>
//           <button
//             onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
//             disabled={page === totalPages}
//             className="px-3 py-1 border rounded disabled:opacity-30"
//           >
//             다음
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/api/axiosInstance";
import { useNavigate } from "react-router-dom";

// 카테고리 목록 정의
const categories = [
  { key: "all", label: "전체" },
  { key: "루틴", label: "루틴" },
  { key: "챌린지", label: "챌린지" },
  { key: "계정", label: "계정" },
];

const PER_PAGE = 4;

export default function FAQPage() {
  const [faqData, setFaqData] = useState([]);
  const [faqDetails, setFaqDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [openId, setOpenId] = useState(null);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // API에서 FAQ 목록 데이터 가져오기
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/faq");

        // 응답 데이터 구조 확인 및 추출
        let responseData = [];
        if (
          response.data &&
          response.data.message &&
          Array.isArray(response.data.message)
        ) {
          responseData = response.data.message;
        } else if (Array.isArray(response.data)) {
          responseData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          responseData = response.data.data;
        }

        console.log("받아온 FAQ 데이터:", responseData);
        setFaqData(responseData);
        setError(null);
      } catch (err) {
        console.error("FAQ 데이터를 가져오는 중 오류 발생:", err);
        setError("FAQ 데이터를 불러오는 데 실패했습니다.");
        setFaqData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  // 특정 FAQ 상세 내용 가져오기
  const fetchFAQDetail = async (faqIdx) => {
    if (faqDetails[faqIdx]) {
      return; // 이미 상세 내용이 있으면 API 호출하지 않음
    }

    try {
      setDetailLoading(true);
      const response = await axiosInstance.get(`/faq/${faqIdx}`);

      // 응답 데이터 구조 확인 및 추출
      let detailData = response.data;
      if (response.data && response.data.message) {
        detailData = response.data.message;
      }

      console.log(`FAQ ${faqIdx} 상세 데이터:`, detailData);
      setFaqDetails((prev) => ({
        ...prev,
        [faqIdx]: detailData,
      }));
    } catch (err) {
      console.error(`FAQ ${faqIdx} 상세 내용을 가져오는 중 오류 발생:`, err);
    } finally {
      setDetailLoading(false);
    }
  };

  // 필터링 전에 faqData가 배열인지 확인
  const filtered = Array.isArray(faqData)
    ? faqData.filter(
        (item) =>
          (category === "all" || item.faqCategory === category) &&
          item.faqTitle?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleCategoryChange = (key) => {
    setCategory(key);
    setPage(1); // 페이지 초기화
    setOpenId(null); // 열려 있는 질문 닫기
  };

  const handleFaqClick = async (faqIdx) => {
    if (openId === faqIdx) {
      setOpenId(null); // 이미 열려있는 항목을 다시 클릭하면 닫기
    } else {
      setOpenId(faqIdx);
      await fetchFAQDetail(faqIdx); // FAQ 상세 내용 가져오기
    }
  };

  // FAQ 답변 가져오기
  const getFaqAnswer = (faqIdx) => {
    // 상세 데이터가 있으면 해당 데이터의 답변을 사용
    if (faqDetails[faqIdx] && faqDetails[faqIdx].faqAnswer) {
      return faqDetails[faqIdx].faqAnswer;
    }

    // 상세 데이터가 없거나 답변이 null이면 메시지 표시
    return "답변을 불러오는 중...";
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">FAQ</h1>
      <p className="text-muted-foreground mb-4">
        자주 묻는 질문들을 확인하세요
      </p>

      <Input
        placeholder="궁금한 내용을 검색해보세요"
        className="mb-6"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      <div className="flex gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategoryChange(cat.key)}
            className={`px-4 py-2 rounded text-sm border ${
              category === cat.key
                ? "bg-black text-white border-black"
                : "bg-transparent text-gray-700 border-gray-300"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-12">로딩 중...</p>
      ) : error ? (
        <p className="text-center text-red-500 py-12">{error}</p>
      ) : paginated.length === 0 ? (
        <p className="text-center text-gray-400 py-12">검색 결과가 없습니다.</p>
      ) : (
        <div className="divide-y divide-gray-200">
          {paginated.map((faq) => (
            <div
              key={faq.faqIdx}
              className="py-4 cursor-pointer"
              onClick={() => handleFaqClick(faq.faqIdx)}
            >
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {faq.faqCategory}
                </span>
              </div>
              <div className="font-semibold text-base flex justify-between items-center">
                {faq.faqTitle}
                <span className="text-gray-400 text-xl">
                  {openId === faq.faqIdx ? "−" : "+"}
                </span>
              </div>
              {openId === faq.faqIdx && (
                <div className="text-sm text-gray-600 mt-3 pl-1">
                  {detailLoading && !faqDetails[faq.faqIdx] ? (
                    <p className="text-gray-400">답변을 불러오는 중...</p>
                  ) : (
                    <p>{getFaqAnswer(faq.faqIdx)}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end mt-6 mb-4">
        <button
          onClick={() => navigate("/inquiry")}
          className="text-black text-sm font-medium"
        >
          더 궁금한 것이 있으신가요?{" "}
          <span className="font-bold hover:text-black hover:underline">
            1:1 문의
          </span>
        </button>
      </div>

      {/* 페이지네이션 */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-30"
          >
            이전
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-30"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
