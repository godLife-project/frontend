// PopupManager.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance";
import TimedPopup from "./TimedPopup";

function PopupManager() {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPopupIndex, setCurrentPopupIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  // Dialog 상태를 PopupManager에서 관리
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  useEffect(() => {
    // API에서 현재 활성화된 팝업 정보들 가져오기
    const fetchPopupData = async () => {
      try {
        // 실제 API 호출
        const response = await axiosInstance.get(`/notice/popup`);
        console.log(response.data.notice);
        const data = await response.data.notice;

        const mappedData = data.map((item) => ({
          id: item.noticeIdx.toString(),
          title: item.noticeTitle,
          content: item.noticeSub,
          startDate: item.popupStartDate,
          endDate: item.popupEndDate,
          isActive: item.isPopup === "Y",
          priority: 1, // 기본 우선순위
          isHtmlContent: false, // 기본값 (필요시 API에서 제공하는 값으로 변경)
        }));

        // 예시 데이터 (실제로는 API 응답으로 대체)
        // const mockData = [
        //   {
        //     id: "spring-promotion",
        //     title: "🌸 봄맞이 프로모션",
        //     content:
        //       "4월 한 달간 모든 서비스 20% 할인! 지금 바로 확인해보세요.",
        //     startDate: "2025-04-01",
        //     endDate: "2025-04-30",
        //     isActive: true,
        //     priority: 2, // 우선순위 (높을수록 먼저 표시)
        //     isHtmlContent: false, // 일반 텍스트 콘텐츠
        //   },
        //   {
        //     id: "new-features",
        //     title: "✨ 새로운 기능 업데이트",
        //     content:
        //       "<p><strong>사용자 요청이 많았던 기능들이 추가되었습니다.</strong></p><ul><li>프로필 사진 업로드 기능</li><li>다크 모드 지원</li><li>알림 설정 개선</li></ul><p>새로운 경험을 즐겨보세요!</p>",
        //     startDate: "2025-04-02",
        //     endDate: "2025-04-25",
        //     isActive: true,
        //     priority: 1,
        //     isHtmlContent: true, // HTML 콘텐츠
        //   },
        //   {
        //     id: "maintenance-notice",
        //     title: "🔧 서버 점검 안내",
        //     content:
        //       "<p>2025년 4월 10일 오전 2시부터 5시까지 서버 점검이 예정되어 있습니다.</p><img src='/images/maintenance.jpg' alt='서버 점검' width='300' /><p><em>이용에 불편을 드려 죄송합니다.</em></p>",
        //     startDate: "2025-04-05",
        //     endDate: "2025-04-10",
        //     isActive: true,
        //     priority: 3,
        //     isHtmlContent: true, // HTML 콘텐츠 (이미지 포함)
        //   },
        // ];

        // 활성화된 팝업 필터링 및 우선순위 정렬
        // const activePopups = mockData
        //   .filter((popup) => popup.isActive)
        //   .sort((a, b) => b.priority - a.priority);

        // 실제로 표시할 팝업 필터링 (날짜 체크 & 이미 닫은 팝업 체크)
        const now = new Date();
        const filteredPopups = mappedData.filter((popup) => {
          const startDate = new Date(popup.startDate);
          const endDate = new Date(popup.endDate);
          endDate.setHours(23, 59, 59, 999); // 종료일 끝까지 포함

          // 날짜 범위 확인
          if (now < startDate || now > endDate) {
            return false;
          }

          // "오늘 하루 보지 않음" 체크
          const dontShowUntil = localStorage.getItem(
            `popup-${popup.id}-dontshow`
          );
          if (dontShowUntil) {
            const dontShowDate = new Date(dontShowUntil);
            if (now < dontShowDate) {
              return false;
            }
          }

          return true;
        });
        console.log("Filtered popups:", filteredPopups);
        setPopups(filteredPopups);

        // 표시할 팝업이 있으면 첫 번째 팝업 표시
        if (filteredPopups.length > 0) {
          setShowPopup(true);
          setIsDialogOpen(true); // 초기 Dialog 상태 설정
        }
      } catch (error) {
        console.error("팝업 데이터 가져오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopupData();
  }, []);

  // 팝업을 닫고 다음 팝업으로 이동하는 함수
  const handlePopupClose = (dontShowToday, popupId) => {
    // "오늘 하루 보지 않음" 처리
    if (dontShowToday) {
      const tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      localStorage.setItem(`popup-${popupId}-dontshow`, tomorrow.toISOString());
    }

    const nextIndex = currentPopupIndex + 1;

    if (nextIndex < popups.length) {
      // 다음 팝업이 있을 경우, Dialog를 닫았다가 다시 열어 리렌더링을 강제합니다
      setIsDialogOpen(false);

      // 약간의 지연 후 다음 팝업으로 넘어가고 Dialog를 다시 엽니다
      setTimeout(() => {
        setCurrentPopupIndex(nextIndex);
        setIsDialogOpen(true);
      }, 50); // 짧은 시간 지연
    } else {
      // 더 이상 표시할 팝업이 없으면 모든 팝업 표시 종료
      setShowPopup(false);
    }
  };

  // 로딩 중이거나 표시할 팝업이 없으면 null 반환
  if (loading || !showPopup || popups.length === 0) {
    return null;
  }

  const currentPopup = popups[currentPopupIndex];

  // 디버깅용 로그
  console.log(
    `현재 팝업 인덱스: ${currentPopupIndex}, 총 팝업 수: ${popups.length}, Dialog 상태: ${isDialogOpen}`
  );
  console.log(`현재 팝업: ${currentPopup?.title}`);

  return (
    <TimedPopup
      title={currentPopup.title}
      content={currentPopup.content}
      startDate={currentPopup.startDate}
      endDate={currentPopup.endDate}
      popupId={currentPopup.id}
      onClose={(dontShowToday) =>
        handlePopupClose(dontShowToday, currentPopup.id)
      }
      popupCount={popups.length}
      currentIndex={currentPopupIndex}
      isOpen={isDialogOpen}
      setIsOpen={setIsDialogOpen}
      isHtmlContent={currentPopup.isHtmlContent || false} // HTML 콘텐츠 여부 전달
    />
  );
}

export default PopupManager;
