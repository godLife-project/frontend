import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import axiosInstance from "../../api/axiosInstance";

// 컴포넌트 임포트
import StatsDashboard from "@/components/QnA/StatsDashboard";
import QnaAdminList from "@/components/QnA/QnaAdminList";
import QnaDetail from "@/components/QnA/QnaDetail";
import StatusBar from "@/components/QnA/StatusBar";

// UI 컴포넌트 임포트
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

const QnaAdminDashboard = () => {
  // 상태 관리
  const [waitList, setWaitList] = useState([]);
  const [assignedList, setAssignedList] = useState([]);
  const [selectedQna, setSelectedQna] = useState(null);
  const [qnaContent, setQnaContent] = useState(null);
  const [qnaReplies, setQnaReplies] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("연결 중...");
  const [autoAssignment, setAutoAssignment] = useState(true);
  const [statusMessage, setStatusMessage] = useState({
    text: "",
    type: "info",
  });
  const [isStatusVisible, setIsStatusVisible] = useState(false);

  // 통계 데이터 (실제로는 API에서 가져올 데이터)
  const [stats, setStats] = useState({
    today: {
      completed: 12,
      average: 8,
      averageTime: "14분 35초",
      myAverageTime: "11분 22초",
    },
    month: {
      completed: 247,
      average: 215,
      averageTime: "15분 42초",
      myAverageTime: "12분 18초",
    },
  });

  // 참조 객체
  const stompClientRef = useRef(null);
  const qnaSubscriptionRef = useRef(null);

  // localStorage에서 토큰과 사용자 정보 가져오기
  const accessToken = localStorage.getItem("accessToken");
  const currentUser = localStorage.getItem("userName") || "상담원";

  // 상태 메시지 표시 함수
  const showStatusMessage = (message, type = "info", duration = 3000) => {
    setStatusMessage({ text: message, type });
    setIsStatusVisible(true);

    setTimeout(() => {
      setIsStatusVisible(false);
    }, duration - 1000);

    setTimeout(() => {
      setStatusMessage({ text: "", type: "info" });
    }, duration);
  };

 // QnADashboard.js에서
useEffect(() => {
  // 이미 연결된 경우 리턴
  if (stompClientRef.current?.connected) {
    setConnectionStatus("연결됨");
    return;
  }

  const socketUrl = '/ws-stomp';
  console.log("STOMP 연결 시도:", socketUrl);

  try {
    // SockJS 객체 생성 - 더 많은 옵션 추가
    const socket = new SockJS(socketUrl, null, {
      transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
      timeout: 15000 // 타임아웃 늘리기
    });
    
    // STOMP 클라이언트 생성
    const stompClient = Stomp.over(socket);
    
    // 디버깅 활성화
    stompClient.debug = function(str) {
      console.log("STOMP 디버그:", str);
    };
    
    // 하트비트 설정 - Ngrok과의 연결 유지에 중요
    stompClient.heartbeat.outgoing = 30000; // 30초
    stompClient.heartbeat.incoming = 30000; // 30초
    
    stompClientRef.current = stompClient;

    // 연결 시도 - 접속 헤더 수정
    stompClient.connect(
      { 
        Authorization: `Bearer ${accessToken}`,
        "accept-version": "1.1,1.0",
        "heart-beat": "30000,30000"
      },
      (frame) => {
        console.log("✅ STOMP 연결 성공:", frame);
        setConnectionStatus("연결됨");
        
        // 여기서부터 원래 코드...
      },
      (error) => {
        console.error("❌ STOMP 연결 실패:", error);
        setConnectionStatus("연결 실패");
        // 에러 처리...
      }
    );
  } catch (error) {
    console.error("STOMP 초기화 오류:", error);
    setConnectionStatus("초기화 실패");
  }
  
  // 정리 함수...
}, [accessToken]);

  // QnA 수동 할당 처리
  const handleAssignQna = (qnaIdx) => {
    if (!stompClientRef.current?.connected) {
      showStatusMessage("서버에 연결되어 있지 않습니다.", "error");
      return;
    }

    stompClientRef.current.send(
      `/pub/take/waitQna/${qnaIdx}`,
      { Authorization: `Bearer ${accessToken}` },
      JSON.stringify({})
    );
  };

  // 자동/수동 할당 모드 전환
  const handleToggleAutoAssignment = async () => {
    try {
      const response = await axiosInstance.patch(
        "/service/admin/switch/status",
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      setAutoAssignment(!autoAssignment);
      showStatusMessage(
        response.data.message ||
          `${!autoAssignment ? "자동" : "수동"} 할당 모드로 전환되었습니다.`,
        "success"
      );
    } catch (error) {
      showStatusMessage("상태 전환에 실패했습니다.", "error");
    }
  };

  // 목록 새로고침
  const handleRefreshLists = () => {
    if (!stompClientRef.current?.connected) {
      showStatusMessage("서버에 연결되어 있지 않습니다.", "error");
      return;
    }

    stompClientRef.current.send(
      "/pub/get/waitList/init",
      {},
      JSON.stringify({})
    );
    stompClientRef.current.send("/pub/get/matched/qna/init", {
      Authorization: `Bearer ${accessToken}`,
    });

    showStatusMessage("목록을 새로고침 중입니다...", "info");
  };

  // QnA 상세 정보 열기
  const handleOpenQnaDetail = (qna) => {
    // 기존 구독 해제
    if (qnaSubscriptionRef.current) {
      try {
        qnaSubscriptionRef.current.unsubscribe();
      } catch (error) {
        console.error("구독 해제 실패:", error);
      }
    }

    // 같은 QnA를 클릭한 경우 닫기
    if (selectedQna && selectedQna.qnaIdx === qna.qnaIdx) {
      setSelectedQna(null);
      setQnaContent(null);
      setQnaReplies([]);
      return;
    }

    setSelectedQna(qna);

    // QnA 상세 정보 구독
    if (stompClientRef.current?.connected) {
      const subscription = stompClientRef.current.subscribe(
        `/user/queue/set/qna/detail/${qna.qnaIdx}`,
        (message) => {
          try {
            const data = JSON.parse(message.body);
            const { status, qnaIdx, body, comments } = data;

            switch (status) {
              case "RELOAD":
                setQnaContent(body);
                setQnaReplies(comments || []);
                break;

              case "MOD_BODY":
                setQnaContent(body);
                break;

              case "MOD_COMM":
                if (Array.isArray(comments) && comments.length > 0) {
                  const updatedComment = comments[0];
                  setQnaReplies((prev) =>
                    prev.map((comment) =>
                      comment.qnaReplyIdx === updatedComment.qnaReplyIdx
                        ? updatedComment
                        : comment
                    )
                  );
                }
                break;

              case "ADD_COMM":
                if (Array.isArray(comments) && comments.length > 0) {
                  const newComment = comments[0];
                  setQnaReplies((prev) => {
                    const exists = prev.some(
                      (c) => c.qnaReplyIdx === newComment.qnaReplyIdx
                    );
                    return exists ? prev : [...prev, newComment];
                  });
                }
                break;

              case "DEL_COMM":
                setQnaReplies((prev) =>
                  prev.filter((c) => c.qnaReplyIdx !== data.qnaReplyIdx)
                );
                break;

              default:
                console.warn("알 수 없는 상태:", status);
            }
          } catch (error) {
            console.error("QnA 상세 정보 처리 오류:", error);
          }
        }
      );

      qnaSubscriptionRef.current = subscription;

      // QnA 상세 정보 요청
      stompClientRef.current.send(
        `/pub/get/matched/qna/detail/${qna.qnaIdx}`,
        { Authorization: `Bearer ${accessToken}` },
        null
      );
    }
  };

  // 답변 전송
  const handleSendReply = () => {
    if (!replyText.trim() || !selectedQna) {
      return;
    }

    // 실제 구현에서는 서버에 답변 전송 API 호출
    // 예시:
    // axiosInstance.post('/service/admin/qna/reply', {
    //   qnaIdx: selectedQna.qnaIdx,
    //   content: replyText
    // })

    // 임시 처리 (실제로는 서버 응답으로 처리해야 함)
    const newReply = {
      qnaReplyIdx: Date.now(),
      content: replyText,
      userName: currentUser,
      createdAt: new Date().toISOString(),
    };

    setQnaReplies((prev) => [...prev, newReply]);
    setReplyText("");

    showStatusMessage("답변이 등록되었습니다.", "success");
  };

  // QnA 완료 처리
  const handleCompleteQna = () => {
    if (!selectedQna) return;

    // 실제 구현에서는 서버에 상태 변경 API 호출
    // 예시:
    // axiosInstance.patch(`/service/admin/qna/${selectedQna.qnaIdx}/complete`)

    // 임시 처리 (실제로는 서버 응답으로 처리해야 함)
    setAssignedList((prev) =>
      prev.map((item) =>
        item.qnaIdx === selectedQna.qnaIdx
          ? { ...item, qnaStatus: "완료" }
          : item
      )
    );

    setSelectedQna((prev) => (prev ? { ...prev, qnaStatus: "완료" } : null));

    showStatusMessage("문의가 완료 처리되었습니다.", "success");
  };

  // 상태 배지 렌더링
  const renderStatusBadge = (status) => {
    switch (status) {
      case "대기중":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 border-yellow-300 text-yellow-800"
          >
            대기중
          </Badge>
        );
      case "처리중":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 border-blue-300 text-blue-800"
          >
            처리중
          </Badge>
        );
      case "완료":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 border-green-300 text-green-800"
          >
            완료
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">1:1 문의 관리 시스템</h1>
          <p className="text-gray-500">
            상담원: {currentUser} | 상태:
            <span
              className={
                connectionStatus === "연결됨"
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {" "}
              {connectionStatus}
            </span>
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm">자동 할당</span>
            <Switch
              checked={autoAssignment}
              onCheckedChange={handleToggleAutoAssignment}
              className="data-[state=checked]:bg-green-500"
            />
            <span className="text-sm">수동 할당</span>
          </div>

          <Button
            onClick={handleRefreshLists}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            새로고침
          </Button>
        </div>
      </div>

      {/* 상태 메시지 */}
      {statusMessage.text && (
        <Alert
          variant={statusMessage.type === "error" ? "destructive" : "default"}
          className={`mb-4 transition-opacity duration-500 ${
            isStatusVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {statusMessage.type === "error" && (
            <AlertCircle className="h-4 w-4" />
          )}
          {statusMessage.type === "success" && (
            <CheckCircle2 className="h-4 w-4" />
          )}
          <AlertTitle>
            {statusMessage.type === "error"
              ? "오류"
              : statusMessage.type === "success"
              ? "성공"
              : "알림"}
          </AlertTitle>
          <AlertDescription>{statusMessage.text}</AlertDescription>
        </Alert>
      )}

      {/* 메인 컨텐츠 */}
      <div className="grid grid-cols-12 gap-6">
        {/* 통계 패널 */}
        <StatsDashboard stats={stats} />

        {/* QnA 목록 */}
        <QnaAdminList
          waitList={waitList}
          assignedList={assignedList}
          selectedQna={selectedQna}
          onQnaSelect={handleOpenQnaDetail}
          onAssignQna={handleAssignQna}
          renderStatusBadge={renderStatusBadge}
        />

        {/* QnA 상세 정보 */}
        <div className="col-span-8">
          <QnaDetail
            selectedQna={selectedQna}
            qnaContent={qnaContent}
            qnaReplies={qnaReplies}
            replyText={replyText}
            setReplyText={setReplyText}
            onSendReply={handleSendReply}
            onCompleteQna={handleCompleteQna}
            renderStatusBadge={renderStatusBadge}
            currentUser={currentUser}
          />
        </div>
      </div>

      {/* 하단 상태 바 */}
      <StatusBar waitList={waitList} assignedList={assignedList} />
    </div>
  );
};

export default QnaAdminDashboard;