// TimedPopup.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const TimedPopup = ({
  title = "공지사항",
  content = "안녕하세요! 새로운 기능이 추가되었습니다.",
  startDate = "2025-04-01",
  endDate = "2025-04-15",
  popupId = "default-popup",
  onClose,
  popupCount = 1,
  currentIndex = 0,
  // 외부에서 Dialog 상태를 제어하기 위한 props
  isOpen = true,
  setIsOpen,
  // HTML 콘텐츠인지 여부 (Toast UI Editor로 작성된 내용)
  isHtmlContent = false,
}) => {
  const [dontShowToday, setDontShowToday] = useState(false);

  const handleClose = () => {
    if (onClose) {
      onClose(dontShowToday);
    }
  };

  // 팝업 카운터 UI 생성 함수
  const renderPopupCounter = () => {
    if (popupCount <= 1) return null;

    return (
      <div className="flex items-center mt-2 text-sm text-slate-500">
        <span>{`${currentIndex + 1}/${popupCount}`}</span>
        {currentIndex < popupCount - 1 && (
          <span className="ml-2">(다음 공지가 있습니다)</span>
        )}
      </div>
    );
  };

  // 컨텐츠 렌더링 - HTML 또는 일반 텍스트
  const renderContent = () => {
    if (isHtmlContent) {
      return (
        <div
          className="tui-editor-contents"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    return <p>{content}</p>;
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Dialog가 외부에서 닫히는 경우(ESC, 외부 클릭) 처리
        if (!open && setIsOpen) {
          handleClose(); // 닫기 처리 로직 실행
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {title}
            {popupCount > 1 && (
              <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">
                {currentIndex + 1}/{popupCount}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          {/* 팝업의 주요 내용 */}
          <div className="rounded-lg bg-slate-50 p-4">
            {/* 컨텐츠 렌더링 */}
            <div className="popup-content mb-4">{renderContent()}</div>

            {/* 유효기간 표시 */}
            <p className="text-sm text-slate-800 mt-2">
              유효기간: {new Date(startDate).toLocaleDateString()} ~{" "}
              {new Date(endDate).toLocaleDateString()}
            </p>
            {renderPopupCounter()}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`dont-show-today-${popupId}`}
              checked={dontShowToday}
              onCheckedChange={setDontShowToday}
            />
            <label
              htmlFor={`dont-show-today-${popupId}`}
              className="text-sm font-medium"
            >
              오늘 하루 보지 않기
            </label>
          </div>
          <Button onClick={handleClose}>
            {currentIndex < popupCount - 1 ? "다음" : "확인"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimedPopup;
