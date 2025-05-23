import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import axiosInstance from "../../api/axiosInstance";

// 컴포넌트 임포트
import StatsDashboard from "@/components/QnA/StatsDashboard";
import QnaAdminList from "@/components/QnA/QnaAdminList";
import QnAAdminDetail from "@/components/QnA/QnAAdminDetail";
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
    // 상태 초기값을 localStorage에서 읽어오거나, 없으면 true(자동할당)로 설정
    const [autoAssignment, setAutoAssignment] = useState(() => {
        const savedAutoAssignment = localStorage.getItem("qnaAutoAssignment");
        return savedAutoAssignment !== null ? savedAutoAssignment === "true" : true;
    });
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

    // 현재 상담원의 자동 할당 상태 조회
    useEffect(() => {
        const fetchAdminStatus = async () => {
            try {
                console.log("🔍 서버 상담원 상태 조회 시작...");
                const response = await axiosInstance.get("/service/admin/get/status", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                console.log("📋 상담원 상태 조회 전체 응답:", response);
                console.log("📋 상담원 상태 응답 데이터:", response.data);
                console.log("📋 상담원 상태 메시지:", response.data?.message);

                // 응답에서 상태 추출
                if (response.data && response.data.message) {
                    const isAutoAssignment = response.data.message === "활성화";
                    const currentLocalState = localStorage.getItem("qnaAutoAssignment");

                    console.log(`🎯 서버 상태: ${response.data.message}`);
                    console.log(`🎯 서버에서 파싱된 자동할당 여부: ${isAutoAssignment}`);
                    console.log(`🎯 현재 로컬 상태: ${currentLocalState}`);
                    console.log(`🎯 현재 React 상태: ${autoAssignment}`);

                    setAutoAssignment(isAutoAssignment);
                    // 상태를 localStorage에 저장하여 새로고침 시에도 유지
                    localStorage.setItem("qnaAutoAssignment", isAutoAssignment.toString());
                    console.log(`✅ 상태 업데이트 완료: ${isAutoAssignment ? '자동 할당(활성화)' : '수동 할당(비활성화)'}`);
                } else {
                    console.warn("⚠️ 서버 응답에 message 필드가 없습니다:", response.data);
                }
            } catch (error) {
                console.error("❌ 상담원 상태 조회 오류:", error);
                console.error("❌ 오류 상세:", error.response?.data || error.message);

                // API 호출 실패 시 localStorage에 저장된 값으로 폴백
                const savedAutoAssignment = localStorage.getItem("qnaAutoAssignment");
                if (savedAutoAssignment !== null) {
                    setAutoAssignment(savedAutoAssignment === "true");
                    console.log(`🔄 API 오류로 localStorage 값 사용: ${savedAutoAssignment === "true" ? '자동 할당' : '수동 할당'}`);
                } else {
                    console.log("⚠️ localStorage에도 저장된 상태가 없습니다. 기본값(자동할당) 사용");
                }
            }
        };

        // 컴포넌트 마운트 시 상태 조회
        fetchAdminStatus();
    }, [accessToken]);

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

    // STOMP 웹소켓 연결 설정
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
            stompClient.debug = function (str) {
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

                    // 1. 대기중 문의 리스트 구독 추가
                    stompClient.subscribe('/sub/waitList', (message) => {
                        try {
                            let { waitQnA, status } = JSON.parse(message.body);
                            console.log('📥 대기중 문의 수신:', status, waitQnA);
                            console.log('대기중인 문의 수신 데이터 전체:', JSON.parse(message.body));

                            if (!Array.isArray(waitQnA)) waitQnA = [waitQnA];

                            setWaitList((prevList) => {
                                switch (status) {
                                    case 'RELOAD':
                                        showStatusMessage('대기중 문의 목록이 새로고침되었습니다.', 'info');
                                        return waitQnA;
                                    case 'ADD': {
                                        const newItems = waitQnA.filter(
                                            newItem => !prevList.some(existing => existing.qnaIdx === newItem.qnaIdx)
                                        );
                                        if (newItems.length > 0) {
                                            showStatusMessage(`${newItems.length}개의 대기중 문의가 추가되었습니다.`, 'info');
                                        }
                                        return [...prevList, ...newItems];
                                    }
                                    case 'REMOVE': {
                                        const removeIds = waitQnA.map(item => item.qnaIdx);
                                        showStatusMessage(`${removeIds.join(', ')}번 문의가 삭제되었습니다.`, 'info');
                                        return prevList.filter(item => !removeIds.includes(item.qnaIdx));
                                    }
                                    case 'UPDATE': {
                                        const updateIds = waitQnA.map(item => item.qnaIdx);
                                        showStatusMessage(`${updateIds.join(', ')}번 문의가 수정되었습니다.`, 'info');
                                        return prevList.map(item => {
                                            const updatedItem = waitQnA.find(update => update.qnaIdx === item.qnaIdx);
                                            return updatedItem ? updatedItem : item;
                                        });
                                    }
                                    default:
                                        console.warn('알 수 없는 상태:', status);
                                        return prevList;
                                }
                            });
                        } catch (error) {
                            console.error('대기중 문의 처리 오류:', error);
                            showStatusMessage('데이터 처리 중 오류가 발생했습니다.', 'error');
                        }
                    });

                    // 2. 매칭된 문의 리스트 구독
                    stompClient.subscribe('/user/queue/matched/qna', (message) => {
                        try {
                            let { matchedQnA, status } = JSON.parse(message.body);
                            console.log('매칭된 문의 수신 데이터:', JSON.parse(message.body));

                            if (!Array.isArray(matchedQnA)) matchedQnA = [matchedQnA];

                            setAssignedList((prevList) => {
                                switch (status) {
                                    case 'RELOAD':
                                        showStatusMessage('할당된 문의 목록이 새로고침되었습니다.', 'info');
                                        return matchedQnA;
                                    case 'ADD': {
                                        const newItems = matchedQnA.filter(
                                            newItem => !prevList.some(existing => existing.qnaIdx === newItem.qnaIdx)
                                        );
                                        if (newItems.length > 0) {
                                            showStatusMessage(`${newItems.length}개의 문의가 할당되었습니다.`, 'success');
                                        }
                                        return [...prevList, ...newItems];
                                    }
                                    case 'REMOVE': {
                                        const removeIds = matchedQnA.map(item => item.qnaIdx);
                                        return prevList.filter(item => !removeIds.includes(item.qnaIdx));
                                    }
                                    case 'UPDATE': {
                                        const updateIds = matchedQnA.map(item => item.qnaIdx);
                                        return prevList.map(item => {
                                            const updatedItem = matchedQnA.find(update => update.qnaIdx === item.qnaIdx);
                                            return updatedItem ? updatedItem : item;
                                        });
                                    }
                                    default:
                                        console.warn('알 수 없는 상태:', status);
                                        return prevList;
                                }
                            });
                        } catch (error) {
                            console.error('할당된 문의 처리 오류:', error);
                            showStatusMessage('데이터 처리 중 오류가 발생했습니다.', 'error');
                        }
                    });

                    // 3. 오류 처리 및 토큰 재발급
                    stompClient.subscribe('/user/queue/admin/errors', async (message) => {
                        const error = JSON.parse(message.body);
                        console.log("에러 메시지:", error);
                        if (error.code === 4001) {
                            try {
                                const response = await axiosInstance.post('/reissue', null, {
                                    withCredentials: true,
                                });

                                const newAccessToken = response.headers['authorization'];
                                if (newAccessToken) {
                                    const token = newAccessToken.replace('Bearer ', '');
                                    localStorage.setItem('accessToken', token);
                                    showStatusMessage('토큰이 재발급되었습니다.', 'success');

                                    // 기존 연결 종료 후 재연결
                                    if (stompClient?.connected) {
                                        stompClient.disconnect(() => {
                                            console.log('STOMP 연결 재시도');
                                            window.location.reload();
                                        });
                                    }
                                } else {
                                    showStatusMessage('토큰 재발급에 실패했습니다.', 'error');
                                }
                            } catch (err) {
                                console.error('토큰 갱신 중 에러:', err);
                                showStatusMessage('인증이 만료되었습니다.', 'error');
                            }
                        } else {
                            showStatusMessage(error.message || '오류가 발생했습니다.', 'error');
                        }
                    });

                    // 4. 수동 할당 응답
                    stompClient.subscribe('/user/queue/isMatched/waitQna', (message) => {
                        if (message?.body) {
                            showStatusMessage(message.body, 'success');
                        }
                    });

                    // 5. 댓글 응답 구독 (추가)
                    stompClient.subscribe('/user/queue/qna/reply/result', (message) => {
                        try {
                            const response = JSON.parse(message.body);
                            console.log("댓글 응답:", response);

                            if (response.success) {
                                showStatusMessage("답변이 등록되었습니다.", "success");
                            } else {
                                showStatusMessage(response.message || "답변 등록에 실패했습니다.", "error");
                            }
                        } catch (error) {
                            console.error("댓글 응답 처리 오류:", error);
                        }
                    });

                    // 초기 데이터 요청
                    stompClient.send('/pub/get/waitList/init', {}, JSON.stringify({}));
                    stompClient.send('/pub/get/matched/qna/init', {
                        Authorization: `Bearer ${accessToken}`,
                    });
                },
                (error) => {
                    console.error("❌ STOMP 연결 실패:", error);
                    setConnectionStatus("연결 실패");
                    showStatusMessage("서버 연결에 실패했습니다.", "error");
                }
            );
        } catch (error) {
            console.error("STOMP 초기화 오류:", error);
            setConnectionStatus("초기화 실패");
            showStatusMessage("연결 초기화에 실패했습니다.", "error");
        }

        return () => {
            if (qnaSubscriptionRef.current) {
                try {
                    qnaSubscriptionRef.current.unsubscribe();
                } catch (error) {
                    console.error("구독 해제 실패:", error);
                }
            }

            if (stompClientRef.current?.connected) {
                stompClientRef.current.disconnect(() => {
                    console.log('STOMP 연결 해제');
                });
            }
        };
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
        console.log(`🔄 할당 모드 전환 시작 - 현재 상태: ${autoAssignment ? '자동' : '수동'}`);

        try {
            const response = await axiosInstance.patch(
                "/service/admin/switch/status",
                {},
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            console.log("📋 상태 전환 전체 응답:", response);
            console.log("📋 상태 전환 응답 데이터:", response.data);

            // 응답에서 새로운 상태 확인
            if (response.data && response.data.message) {
                // message가 "활성화"면 자동 할당, "비활성화"면 수동 할당
                const newStatus = response.data.message === "활성화";

                console.log(`🎯 전환 후 서버 상태: ${response.data.message}`);
                console.log(`🎯 전환 후 파싱된 자동할당 여부: ${newStatus}`);
                console.log(`🎯 이전 상태와 비교: ${autoAssignment} → ${newStatus}`);

                // 현재 autoAssignment와 다른 경우에만 상태 업데이트
                if (newStatus !== autoAssignment) {
                    setAutoAssignment(newStatus);
                    // 로컬스토리지에 저장
                    localStorage.setItem("qnaAutoAssignment", newStatus.toString());
                }

                // 메시지 표시
                const statusText = newStatus ? "자동 할당" : "수동 할당";
                showStatusMessage(`${statusText} 모드로 전환되었습니다.`, "success");

                console.log(`✅ 할당 모드 변경 완료: ${newStatus ? '자동 할당(활성화)' : '수동 할당(비활성화)'}`);

                // 🎯 자동할당으로 전환된 경우 추가 확인
                if (newStatus === true) {
                    console.log("🚀 자동할당 모드로 전환됨 - 대기중인 문의 자동 할당 대기 중...");
                    console.log("📊 현재 대기중인 문의 수:", waitList.length);
                    console.log("📊 현재 할당된 문의 수:", assignedList.length);
                }

            } else {
                // 응답에 메시지가 없는 경우, 로그를 남기고 상태는 변경하지 않음
                console.warn("⚠️ 서버 응답에 상태 메시지가 없습니다:", response.data);
                showStatusMessage("상태가 변경되었습니다.", "success");
            }
        } catch (error) {
            console.error("❌ 상태 전환 오류:", error);
            console.error("❌ 오류 상세:", error.response?.data || error.message);
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

                                // 🔍 디버깅: 댓글 데이터 확인
                                console.log("📥 RELOAD - 전체 댓글 데이터:", comments);
                                if (comments && comments.length > 0) {
                                    comments.forEach((comment, index) => {
                                        console.log(`📝 댓글 ${index + 1}:`, {
                                            qnaReplyIdx: comment.qnaReplyIdx,
                                            userName: comment.userName,
                                            content: comment.content,
                                            createdAt: comment.createdAt
                                        });
                                    });
                                }
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

                                    // 🔍 디버깅: 새 댓글 데이터 확인
                                    console.log("✨ 새 댓글 추가:", {
                                        qnaReplyIdx: newComment.qnaReplyIdx,
                                        userName: newComment.userName,
                                        content: newComment.content,
                                        createdAt: newComment.createdAt
                                    });

                                    setQnaReplies((prev) => {
                                        const exists = prev.some(
                                            (c) => c.qnaReplyIdx === newComment.qnaReplyIdx
                                        );
                                        const updatedReplies = exists ? prev : [...prev, newComment];

                                        // 🔍 디버깅: 업데이트된 댓글 목록 확인
                                        console.log("📋 업데이트된 댓글 목록:", updatedReplies);

                                        return updatedReplies;
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
            showStatusMessage("답변 내용을 입력해주세요.", "error");
            return;
        }

        // 상담원 답변 전송
        const qnaIdx = selectedQna.qnaIdx;
        console.log(`문의 ${qnaIdx}번에 답변 전송 시도:`, replyText);

        // 현재 로그인한 사용자 정보 가져오기
        let userIdx = null;
        try {
            const userInfoString = localStorage.getItem("userInfo");
            if (userInfoString) {
                const userInfo = JSON.parse(userInfoString);
                userIdx = userInfo.userIdx;
                console.log("답변 작성자 userIdx:", userIdx);
            }
        } catch (e) {
            console.error("사용자 정보 파싱 오류:", e);
        }

        // 정확한 API 엔드포인트로 직접 요청
        console.log("지정된 API 엔드포인트(/qna/auth/comment/reply)로 답변 전송 시도");

        // 요청 데이터 구성
        const requestData = {
            qnaIdx: qnaIdx,
            content: replyText
        };

        // userIdx가 있으면 포함
        if (userIdx) {
            requestData.userIdx = userIdx;
        }

        console.log("답변 요청 데이터:", requestData);

        axiosInstance.post("/qna/auth/comment/reply", requestData, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
            .then(response => {
                console.log("답변 등록 성공:", response);
                showStatusMessage("답변이 등록되었습니다.", "success");
                setReplyText("");

                // 데이터 갱신을 위해 상세 정보 다시 요청
                if (stompClientRef.current?.connected) {
                    // 약간의 지연 후 데이터 갱신 요청 (서버 처리 시간 고려)
                    setTimeout(() => {
                        stompClientRef.current.send(
                            `/pub/get/matched/qna/detail/${qnaIdx}`,
                            { Authorization: `Bearer ${accessToken}` },
                            null
                        );
                    }, 300);
                }
            })
            .catch(error => {
                console.error("답변 등록 오류:", error);

                if (error.response) {
                    // 응답은 있지만 오류 상태인 경우
                    console.error("오류 응답:", error.response.status, error.response.data);

                    // 토큰 만료 등의 특정 오류 처리
                    if (error.response.status === 401) {
                        showStatusMessage("인증이 만료되었습니다. 다시 로그인해주세요.", "error");
                    } else {
                        showStatusMessage(
                            error.response.data?.message || "답변 등록에 실패했습니다.",
                            "error"
                        );
                    }
                } else if (error.request) {
                    // 요청은 전송되었지만 응답이 없는 경우
                    console.error("응답 없음:", error.request);
                    showStatusMessage("서버에서 응답이 없습니다. 네트워크 연결을 확인해주세요.", "error");
                } else {
                    // 요청 생성 중 오류가 발생한 경우
                    console.error("요청 오류:", error.message);
                    showStatusMessage("요청 생성 중 오류가 발생했습니다.", "error");
                }
            });
    };

    // QnA 완료 처리
    const handleCompleteQna = () => {
        if (!selectedQna) return;

        // 완료 처리 API 호출
        const qnaIdx = selectedQna.qnaIdx;

        axiosInstance.patch(`/qna/auth/complete/${qnaIdx}`, {}, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
            .then(response => {
                console.log("문의 완료 처리 성공:", response);
                showStatusMessage("문의가 완료 처리되었습니다.", "success");

                // 목록에서 해당 문의 상태 업데이트
                setAssignedList(prev =>
                    prev.map(item =>
                        item.qnaIdx === qnaIdx
                            ? { ...item, qnaStatus: "COMPLETE" }
                            : item
                    )
                );

                // 선택된 QnA 상태 업데이트
                setSelectedQna(prev =>
                    prev ? { ...prev, qnaStatus: "COMPLETE" } : null
                );
            })
            .catch(error => {
                console.error("문의 완료 처리 오류:", error);
                showStatusMessage("문의 완료 처리에 실패했습니다.", "error");
            });
    };

    // 상태 배지 렌더링
    const renderStatusBadge = (status) => {
        switch (status) {
            case "WAIT":
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-100 border-yellow-300 text-yellow-800"
                    >
                        대기중
                    </Badge>
                );
            case "CONNECT":
                return (
                    <Badge
                        variant="outline"
                        className="bg-blue-100 border-blue-300 text-blue-800"
                    >
                        연결됨
                    </Badge>
                );
            case "RESPONDING":
                return (
                    <Badge
                        variant="outline"
                        className="bg-purple-100 border-purple-300 text-purple-800"
                    >
                        응대중
                    </Badge>
                );
            case "COMPLETE":
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-100 border-green-300 text-green-800"
                    >
                        완료
                    </Badge>
                );
            case "SLEEP":
                return (
                    <Badge
                        variant="outline"
                        className="bg-gray-100 border-gray-300 text-gray-800"
                    >
                        휴면중
                    </Badge>
                );
            case "DELETED":
                return (
                    <Badge
                        variant="outline"
                        className="bg-red-100 border-red-300 text-red-800"
                    >
                        삭제됨
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
                        <span className={`text-sm ${autoAssignment ? 'font-semibold' : ''}`}>자동 할당</span>
                        <Switch
                            checked={!autoAssignment} // 자동 할당이 true일 때 Switch는 OFF(false)
                            onCheckedChange={handleToggleAutoAssignment}
                            className="data-[state=checked]:bg-green-500"
                        />
                        <span className={`text-sm ${!autoAssignment ? 'font-semibold' : ''}`}>수동 할당</span>
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
                    className={`mb-4 transition-opacity duration-500 ${isStatusVisible ? "opacity-100" : "opacity-0"
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
                    <QnAAdminDetail
                        selectedQna={selectedQna}
                        qnaContent={qnaContent}
                        qnaReplies={qnaReplies}
                        replyText={replyText}
                        setReplyText={setReplyText}
                        onSendReply={handleSendReply}
                        onCompleteQna={handleCompleteQna}
                        onRefresh={() => selectedQna && handleOpenQnaDetail(selectedQna)}
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