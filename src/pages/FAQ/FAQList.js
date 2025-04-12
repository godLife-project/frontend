import { useState } from "react";
import { Input } from "@/components/ui/input";

const faqData = [
  // 👉 실제로는 더 많은 데이터를 넣을 수 있음
  {
    id: 1,
    category: "routine",
    question: "루틴은 어떻게 설정하나요?",
    answer:
      "루틴 설정은 메인 화면에서 '루틴 추가' 버튼을 클릭하여 새로운 루틴을 만들 수 있습니다.",
  },
  {
    id: 2,
    category: "challenge",
    question: "챌린지에 참여하는 방법은 무엇인가요?",
    answer: "챌린지 메뉴에서 확인 후 참여할 수 있습니다.",
  },
  {
    id: 3,
    category: "account",
    question: "이메일로 인증번호가 오지 않아요.",
    answer: "스팸편지함으로 이동되어 있지는 않은지 확인해 주세요.",
  },
  {
    id: 4,
    category: "account",
    question: "아이디를 잊어버렸어요.",
    answer: "로그인 화면에서 '아이디 찾기'를 이용하세요.",
  },
  {
    id: 5,
    category: "account",
    question: "비밀번호를 잊어버렸어요.",
    answer: "로그인 화면에서 '비밀번호 찾기'를 이용하세요.",
  },
];

const categories = [
  { key: "all", label: "전체" },
  { key: "routine", label: "루틴" },
  { key: "challenge", label: "챌린지" },
  { key: "account", label: "계정" },
];

const PER_PAGE = 4;

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [openId, setOpenId] = useState(null);
  const [page, setPage] = useState(1);

  const filtered = faqData.filter(
    (item) =>
      (category === "all" || item.category === category) &&
      (item.question.includes(search) || item.answer.includes(search))
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleCategoryChange = (key) => {
    setCategory(key);
    setPage(1); // 페이지 초기화
    setOpenId(null); // 열려 있는 질문 닫기기
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">FAQ</h1>
      <p className="text-muted-foreground mb-4">
        자주 묻는 질문들을 확인하세요
      </p>

      <Input
        placeholder="검색어 입력"
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

      {paginated.length === 0 ? (
        <p className="text-center text-gray-400 py-12">검색 결과가 없습니다.</p>
      ) : (
        <div className="divide-y divide-gray-200">
          {paginated.map((faq) => (
            <div
              key={faq.id}
              className="py-4 cursor-pointer"
              onClick={() =>
                setOpenId((prev) => (prev === faq.id ? null : faq.id))
              }
            >
              <div className="flex justify-between items-center text-sm mb-1"></div>
              <div className="font-semibold text-base flex justify-between items-center">
                {faq.question}
                <span className="text-gray-400 text-xl">
                  {openId === faq.id ? "−" : "+"}
                </span>
              </div>
              {openId === faq.id && (
                <p className="text-sm text-gray-600 mt-3 pl-1">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
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
    </div>
  );
}
