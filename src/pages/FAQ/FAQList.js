import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MdOutlineMode } from "react-icons/md";
import { MdOutlineDelete } from "react-icons/md";
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
  const [deleting, setDeleting] = useState(false);
  const [writing, setWriting] = useState(false);
  const [modify, setModify] = useState(false);
  // localStorage에서 accessToken과 userIdx 가져오기
  const accessToken = localStorage.getItem("accessToken");
  const userInfoString = localStorage.getItem("userInfo");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const userIdx = userInfo?.userIdx || "21";
  const roleStatus = userInfo?.roleStatus || false; // 기본값은 false
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

  // // 챌린지 삭제 버튼(관리자만)
  // const deleteChallenge = async () => {
  //   try {
  //     setDeleting(true);

  //     // PATCH 요청으로 챌린지 삭제
  //     await axiosInstance.patch(
  //       "/challenges/admin/delete",
  //       { challIdx: challIdx }, // 요청 본문에 challIdx 포함
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     toast({
  //       title: "성공",
  //       description: "챌린지가 성공적으로 삭제되었습니다.",
  //     });

  //     // 삭제 후 챌린지 목록 페이지로 이동
  //     navigate("/challenges");
  //   } catch (err) {
  //     console.error("챌린지 삭제 실패:", err);
  //     toast({
  //       title: "오류",
  //       description: "챌린지 삭제에 실패했습니다. 다시 시도해주세요.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setDeleting(false);
  //   }
  // };
  // // 수정/삭제 버튼 (관리자만)
  // const ModifyDeleteButtons = () => {
  //   if (roleStatus === true) {
  //     return (
  //       <div className="flex space-x-2 mt-4">
  //         <Button
  //           variant="outline"
  //           className="w-1/2"
  //           onClick={() => navigate(`/`)}
  //         >
  //           수정하기
  //         </Button>
  //         <Button
  //           variant="destructive"
  //           className="w-1/2"
  //           onClick={() => {
  //             if (window.confirm("정말 이 챌린지를 삭제하시겠습니까?")) {
  //               deleteChallenge();
  //             }
  //           }}
  //           disabled={deleting}
  //         >
  //           {deleting ? "삭제 중..." : "삭제하기"}
  //         </Button>
  //       </div>
  //     );
  //   }
  //   return;
  // };
  // 작성 버튼 (관리자만)
  const WriteButtons = () => {
    if (roleStatus === false) {
      return (
        <Button
          className="ml-auto px-4 py-2 rounded text-sm"
          onClick={() => navigate(`/faq/write`)}
          disabled={writing}
        >
          {writing ? "참여 신청 중..." : "작성하기"}
        </Button>
      );
    }
    return;
  };

  const ModifyButtons = () => {
    if (roleStatus === false) {
      return <MdOutlineMode onClick={() => navigate(`/`)} />;
    }
    return;
  };

  const DeleteButtons = () => {
    if (roleStatus === false) {
      return <MdOutlineDelete onClick={() => navigate(`/`)} />;
    }
    return;
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

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
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

        <WriteButtons />
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
                <div className="flex gap-2">
                  <ModifyButtons />
                  <DeleteButtons />
                </div>
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
