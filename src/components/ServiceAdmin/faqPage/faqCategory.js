import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/api/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MdOutlineMode } from "react-icons/md";
import { MdOutlineDelete } from "react-icons/md";
import { IoSearchOutline } from "react-icons/io5";
import { useToast } from "@/components/ui/use-toast";

export default function FAQPage() {
  const { toast } = useToast();
  const { faqIdx } = useParams();
  const [faqData, setFaqData] = useState([]);
  const [faqDetails, setFaqDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
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
  // API에서 카테고리 목록 가져오기
  const [categories, setCategories] = useState([{ key: "all", label: "전체" }]);

  // localStorage에서 accessToken과 userIdx 가져오기
  const accessToken = localStorage.getItem("accessToken");
  const userInfoString = localStorage.getItem("userInfo");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const userIdx = userInfo?.userIdx || "21";
  const roleStatus = userInfo?.roleStatus || false; // 기본값은 false

  // API에서 카테고리 목록 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);

        // "전체" 카테고리만 초기값으로 설정
        setCategories([{ key: "all", label: "전체" }]);

        // API 호출
        const response = await axiosInstance.get(
          "/admin/compSystem/faqCategory",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("API 응답 전체 데이터:", response.data);

        // API 응답에서 카테고리 데이터 추출
        let categoryData = [];

        if (response.data && Array.isArray(response.data.faqCategory)) {
          categoryData = response.data.faqCategory;
          console.log(
            "faqCategory 배열에서 카테고리 데이터 추출:",
            categoryData
          );
        }

        // 카테고리 데이터 변환 및 적용
        if (categoryData && categoryData.length > 0) {
          const apiCategories = categoryData.map((cat) => ({
            key:
              cat.faqCategoryIdx?.toString() ||
              cat.categoryIdx?.toString() ||
              "unknown",
            label: cat.faqCategoryName || cat.categoryName || "알 수 없음",
            originalValue:
              cat.faqCategoryName || cat.categoryName || "알 수 없음",
          }));

          const formattedCategories = [
            { key: "all", label: "전체" },
            ...apiCategories,
          ];

          setCategories(formattedCategories);
          console.log("적용된 카테고리 데이터:", formattedCategories);
        } else {
          console.log(
            "카테고리 데이터가 비어있거나 API 응답 구조가 예상과 다릅니다."
          );
        }
      } catch (err) {
        console.error("카테고리 데이터를 가져오는 중 오류 발생:", err);

        // 인증 오류(401, 403)이거나 토큰이 없는 경우 토스트 메시지를 표시하지 않음
        if (
          accessToken &&
          !(
            err.response &&
            (err.response.status === 401 || err.response.status === 403)
          )
        ) {
          toast({
            variant: "destructive",
            title: "카테고리 로딩 실패",
            description: "카테고리 정보를 불러오는 중 오류가 발생했습니다.",
          });
        }
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, [toast, accessToken]);

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
    ? faqData.filter((item) => {
        // 카테고리 필터링 로직을 수정
        let matchesCategory = false;

        if (category === "all") {
          matchesCategory = true;
        } else {
          // 카테고리 키 비교
          if (item.faqCategoryIdx?.toString() === category) {
            matchesCategory = true;
          } else {
            // 카테고리 이름 비교
            const selectedCategory = categories.find(
              (cat) => cat.key === category
            );
            if (
              selectedCategory &&
              (item.faqCategory === selectedCategory.originalValue ||
                item.faqCategoryName === selectedCategory.originalValue)
            ) {
              matchesCategory = true;
            }
          }
        }

        // 검색어 필터링
        const matchesSearch = item.faqTitle
          ?.toLowerCase()
          .includes(search.toLowerCase());

        return matchesCategory && matchesSearch;
      })
    : [];

  const PER_PAGE = 4;
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

  // FAQ 삭제 버튼(관리자만)
  const deleteChallenge = async (faqIdx) => {
    try {
      setDeleting(true);

      await axiosInstance.delete(`/faq/admin/${faqIdx}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      // 상태 업데이트: 삭제된 항목을 화면에서 제거
      setFaqData((prevData) =>
        prevData.filter((item) => item.faqIdx !== faqIdx)
      );

      // 열려있는 FAQ가 삭제된 것이라면 닫기
      if (openId === faqIdx) {
        setOpenId(null);
      }

      toast({
        title: "성공",
        description: "FAQ가 성공적으로 삭제되었습니다.",
      });
    } catch (err) {
      console.error("FAQ 삭제 실패:", err);
      toast({
        title: "오류",
        description: "FAQ 삭제에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };
  // 작성 버튼 (관리자만)
  const WriteButtons = () => {
    if (roleStatus === true) {
      return (
        <button
          className={`px-6 py-3 rounded-md ${
            writing
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          onClick={() => navigate(`/faq/write`)}
          disabled={writing}
        >
          {writing ? "작성 중..." : "FAQ 추가"}
        </button>
      );
    }
    return null;
  };

  //수정 버튼(관리자만)
  const ModifyButtons = ({ faqIdx }) => {
    if (roleStatus === true) {
      return (
        <MdOutlineMode onClick={() => navigate(`/faq/modify/${faqIdx}`)} />
      );
    }
    return null;
  };

  const DeleteButtons = ({ faqIdx }) => {
    if (roleStatus === true) {
      return <MdOutlineDelete onClick={() => deleteChallenge(faqIdx)} />;
    }
    return null;
  };

  // 카테고리 이름 가져오기
  const getCategoryName = (faqItem) => {
    // 카테고리 표시 방식: faqCategoryName이 있다면 그것을 사용, 아니면 faqCategory 사용
    return faqItem.faqCategoryName || faqItem.faqCategory || "미분류";
  };

  return (
    <div className="container mx-auto">
      {/* 카테고리 탭 네비게이션 */}
      <div className="flex mb-6 space-x-2">
        {categoryLoading ? (
          <p className="text-sm text-gray-400">카테고리 로딩 중...</p>
        ) : (
          <>
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => handleCategoryChange(cat.key)}
                className={`px-6 py-3 rounded-md ${
                  category === cat.key
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </>
        )}
        <div className="flex-grow"></div>
        <WriteButtons />
      </div>

      {/* 검색 바 */}
      <div className="relative mb-6">
        <div className="relative">
          <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="검색"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // 검색 시 페이지 초기화
            }}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* 로딩 및 에러 상태 */}
      {loading && (
        <div className="flex justify-center py-8">
          <p className="text-gray-500">데이터를 불러오는 중...</p>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* FAQ 목록 */}
      {!loading && !error && (
        <>
          {paginated.length === 0 ? (
            <div className="flex justify-center py-8">
              <p className="text-gray-500">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {" "}
              {paginated.map((faq) => (
                <div
                  key={faq.faqIdx}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleFaqClick(faq.faqIdx)}
                >
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {getCategoryName(faq)}
                    </span>
                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ModifyButtons faqIdx={faq.faqIdx} />
                      <DeleteButtons faqIdx={faq.faqIdx} />
                    </div>
                  </div>
                  <div className="font-semibold text-base flex justify-between items-center">
                    {faq.faqTitle}
                    <span className="text-gray-400 text-xl">
                      {openId === faq.faqIdx ? "−" : "+"}
                    </span>
                  </div>
                  {openId === faq.faqIdx && (
                    <div className="text-sm text-gray-600 mt-3 pl-1 pt-3 border-t border-gray-100">
                      {" "}
                      {/* 상단 구분선 추가 */}
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

          {/* 페이지네이션은 그대로 유지 */}
          {totalPages > 1 && (
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
        </>
      )}
    </div>
  );
}
