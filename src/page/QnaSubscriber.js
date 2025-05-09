import React, { useEffect, useState, useRef, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import axiosInstance from "../api/axiosInstance";
import { Viewer } from '@toast-ui/react-editor';


const ChatRoom = () => {
  const [chatList, setChatList] = useState([]);
  const [message, setMessage] = useState('');
  const [personalMessageList, setPersonalMessageList] = useState([]);
  const [expandedQnaIdx, setExpandedQnaIdx] = useState(null);
  const [qnaContents, setQnaContents] = useState({});
  const [qnaComments, setQnaComments] = useState({});
  const [currentUser, setCurrentUser] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('연결 안됨');
  const [waitList, setWaitList] = useState([]);
  const [isWaitListOpen, setIsWaitListOpen] = useState(false);  // 대기중인 문의 리스트 열기/닫기 상태 추가
  const stompClientRef = useRef(null);
  const roomNo = 'room1';
  // 메시지 상태
  const [waitStatusMessage, setWaitStatusMessage] = useState('');
  const [matchedStatusMessage, setMatchedStatusMessage] = useState('');

  const [isVisible, setIsVisible] = useState(false);

  const [adminList, setAdminList] = useState([]);



  // 메시지 표시 및 자동 사라짐 함수
  const showWaitListMessage = (msg, duration = 3000) => {
    setWaitStatusMessage(msg);
    setIsVisible(true);

        // 3초 동안 서서히 사라짐: 마지막 1초는 페이드아웃
        setTimeout(() => {
          setIsVisible(false);
        }, duration - 1000); // 2초 후 페이드아웃 시작

        // 메시지 완전히 제거
        setTimeout(() => {
          setWaitStatusMessage('');
        }, duration);
  };

  const showMatchedListMessage = (msg, duration = 3000) => {
    setMatchedStatusMessage(msg);
    setIsVisible(true);

        // 3초 동안 서서히 사라짐: 마지막 1초는 페이드아웃
        setTimeout(() => {
          setIsVisible(false);
        }, duration - 1000); // 2초 후 페이드아웃 시작

        // 메시지 완전히 제거
        setTimeout(() => {
          setMatchedStatusMessage('');
        }, duration);
  };

  const accessToken = localStorage.getItem('accessToken');

  const handleTakeQna = (qnaIdx) => {
    if (!stompClientRef.current || !stompClientRef.current.connected) {
      alert('📡 STOMP 연결되지 않았습니다.');
      return;
    }

    stompClientRef.current.send(
      `/pub/take/waitQna/${qnaIdx}`,
      {
        Authorization: `Bearer ${accessToken}`,
      },
      JSON.stringify({})
    );
  };

  const handleTokenReissue = useCallback(async (stompClient) => {
    try {
      const response = await axiosInstance.post('/reissue', null, {
        withCredentials: true,
      });

      const newAccessToken = response.headers['authorization'];
      if (newAccessToken) {
        const token = newAccessToken.replace('Bearer ', '');
        localStorage.setItem('accessToken', token);
        alert('🔐 AccessToken이 재발급되었습니다.');

        // 💡 기존 연결 끊고 새로 연결
          if (stompClient?.connected) {
            stompClient.disconnect(() => {
              console.log('🔄 STOMP 연결 재시도');
              window.location.reload(); // 또는 reconnectStompClient(token) 같은 함수로 재연결
            });
          }
      } else {
        alert('⚠️ 새 accessToken이 없습니다.');
      }
    } catch (err) {
      console.error('토큰 갱신 중 에러:', err);
      alert('인증 만료로 연결이 종료됩니다.');
    }
  }, []);



  useEffect(() => {
    const userName = localStorage.getItem('userName');
    if (userName) setCurrentUser(userName);

    // 이전 연결이 있으면 먼저 끊기
    if (stompClientRef.current?.connected) {
      stompClientRef.current.disconnect(() => {
        console.log('🔌 이전 STOMP 연결 해제됨 (accessToken 변경 등)');
      });
    }

    // 새 연결 생성
    const socket = new SockJS('http://localhost:9090/ws-stomp');
    const stompClient = Stomp.over(socket);
    stompClientRef.current = stompClient;

    stompClient.connect(
      {
        Authorization: `Bearer ${accessToken}`,
      },
      () => {
        console.log('✅ STOMP 연결 성공');
        setConnectionStatus('연결됨');

        // 1. 대기중 문의 리스트 수신
        stompClient.subscribe('/sub/waitList', (message) => {
          try {
            let { waitQnA, status } = JSON.parse(message.body);
            console.log('📥 대기중 문의 수신:', status, waitQnA);
            if (!Array.isArray(waitQnA)) waitQnA = [waitQnA];

            setWaitList((prevList) => {
              switch (status) {
                case 'RELOAD':
                  showWaitListMessage('🔄 대기중 문의 리스트 새로고침');
                  return waitQnA;
                case 'ADD': {
                  const newItems = waitQnA.filter(
                    newItem => !prevList.some(existing => existing.qnaIdx === newItem.qnaIdx)
                  );
                  if (newItems.length > 0) {
                    showWaitListMessage(`➕ ${newItems.length}개의 대기중 문의가 추가됨`);
                  }
                  return [...prevList, ...newItems];
                }
                case 'REMOVE': {
                  const removeIds = waitQnA.map(item => item.qnaIdx);
                  showWaitListMessage(`🗑️ ${removeIds.join(', ')}번 문의 삭제됨`);
                  return prevList.filter(item => !removeIds.includes(item.qnaIdx));
                }
                case 'UPDATE': {
                  const updateIds = waitQnA.map(item => item.qnaIdx);
                  showWaitListMessage(`✏️ ${updateIds.join(', ')}번 문의 수정됨`);
                  return prevList.map(item => {
                    const updatedItem = waitQnA.find(update => update.qnaIdx === item.qnaIdx);
                    return updatedItem ? updatedItem : item;
                  });
                }
                default:
                  console.warn('❓ 알 수 없는 상태:', status);
                  return prevList;
              }
            });
          } catch (error) {
            console.error('📛 대기중 문의 JSON 파싱 오류:', error);
            showWaitListMessage('❗대기중 문의 처리 중 오류');
          }
        });

        // 2. 매칭된 문의 리스트 수신
        stompClient.subscribe('/user/queue/matched/qna', (message) => {
          try {
            let { matchedQnA, status } = JSON.parse(message.body);
            if (!Array.isArray(matchedQnA)) matchedQnA = [matchedQnA];

            setPersonalMessageList((prevList) => {
              switch (status) {
                case 'RELOAD':
                  showMatchedListMessage('🔄 매칭된 문의가 새로고침 되었습니다.');
                  return matchedQnA;
                case 'ADD': {
                  const newItems = matchedQnA.filter(
                    newItem => !prevList.some(existing => existing.qnaIdx === newItem.qnaIdx)
                  );
                  if (newItems.length > 0) {
                    showMatchedListMessage(`➕ ${newItems.length}개의 문의가 추가되었습니다.`);
                  }
                  return [...prevList, ...newItems];
                }
                case 'REMOVE': {
                  const removeIds = matchedQnA.map(item => item.qnaIdx);
                  showMatchedListMessage(`🗑️ 문의 ${removeIds.join(', ')}번이 삭제되었습니다.`);
                  return prevList.filter(item => !removeIds.includes(item.qnaIdx));
                }
                case 'UPDATE': {
                  const updateIds = matchedQnA.map(item => item.qnaIdx);
                  showMatchedListMessage(`✏️ 문의 ${updateIds.join(', ')}번이 수정되었습니다.`);
                  return prevList.map(item => {
                    const updatedItem = matchedQnA.find(update => update.qnaIdx === item.qnaIdx);
                    return updatedItem ? updatedItem : item;
                  });
                }
                default:
                  console.warn('📛 알 수 없는 상태:', status);
                  return prevList;
              }
            });
          } catch (error) {
            console.error('📛 JSON 파싱 오류:', error);
            showMatchedListMessage('❗데이터 처리 중 오류가 발생했습니다.');
          }
        });

        // 접속 중인 관리자 목록 수신
        stompClient.subscribe('/sub/access/list', (message) => {
          try {
            const accessAdmin = JSON.parse(message.body);
            console.log('접속 중인 관리자 목록', accessAdmin);

            // 접속 중인 관리자 데이터가 배열이 아닌 객체일 경우 처리
            if (Array.isArray(accessAdmin)) {
              setAdminList(accessAdmin); // 기존 데이터를 덮어쓰는 방식으로 처리
            } else {
              setAdminList([accessAdmin]); // 단일 객체를 덮어쓰기 위해 배열로 감싸서 처리
            }
          } catch (error) {
            console.error('📛 JSON 파싱 오류:', error);
            showMatchedListMessage('❗데이터 처리 중 오류가 발생했습니다.');
          }
        });




        // 3. 채팅 수신
        stompClient.subscribe(`/sub/roomChat/${roomNo}`, (message) => {
          const received = JSON.parse(message.body);
          setChatList((prev) => [...prev, received]);
        });

        // 4. 오류 처리 및 토큰 재발급
        stompClient.subscribe('/user/queue/admin/errors', async (message) => {
          const error = JSON.parse(message.body);
          if (error.code === 4001) {
            await handleTokenReissue(stompClient);
          } else {
            alert(`🚨 ${error.message}`);
          }
        });

        // 5. 수동 할당 응답
        stompClient.subscribe('/user/queue/isMatched/waitQna', (message) => {
          if (message?.body) alert(`📩 응답 메시지: ${message.body}`);
        });

        // 초기 데이터 요청
        stompClient.send('/pub/get/waitList/init', {}, JSON.stringify({}));
        stompClient.send('/pub/get/matched/qna/init', {
          Authorization: `Bearer ${accessToken}`,
        });
        stompClient.send('/pub/get/access/serviceCenter', {}, JSON.stringify({}));
      },
      (error) => {
        console.error('❌ STOMP 연결 실패:', error);
        setConnectionStatus('연결 안됨');
      }
    );

    return () => {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.disconnect(() => {
          console.log('🔌 STOMP 연결 해제');
        });
      }
    };
  }, [accessToken]);


  const sendMessage = () => {
    if (!message.trim()) return;
    const chatData = { sender: currentUser, content: message };
    stompClientRef.current.send(`/pub/roomChat/${roomNo}`, {}, JSON.stringify(chatData));
    setMessage('');
  };

  const sendPersonalMessage = () => {
    stompClientRef.current?.send('/pub/get/matched/qna/init', {
      Authorization: `Bearer ${accessToken}`,
    });
  };

  const handleSwitchStatus = async () => {
    try {
      const response = await axiosInstance.patch(
        '/service/admin/switch/status',
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      // 응답 데이터에서 message 추출
      const { message } = response.data;
      alert(`✅ ${message}`); // 응답 메시지를 alert로 표시

    } catch (error) {
      alert('상태 전환에 실패했습니다.');
    }
  };

  const qnaSubscriptionRef = useRef(null);

  const toggleQnaContent = (qnaIdx) => {
    if (expandedQnaIdx === qnaIdx) {
      setExpandedQnaIdx(null);

      // 👉 요청 전송
      try {
        stompClientRef.current?.send('/pub/close/detail', null);
      } catch (error) {
        console.error("STOMP 요청 전송 실패:", error);
      }

      // 👉 현재 구독 해제
      try {
        qnaSubscriptionRef.current?.unsubscribe();
        qnaSubscriptionRef.current = null;
      } catch (error) {
        console.error("구독 해제 실패:", error);
      }
      return;
    }

    // 👉 기존 구독 해제 후 새 구독 준비
    try {
      qnaSubscriptionRef.current?.unsubscribe();
    } catch (error) {
      console.error("기존 구독 해제 실패:", error);
    }

    // 👉 메시지 수신 핸들러 정의
    const handleQnaDetailMessage = (message) => {
      let data;
      try {
        data = JSON.parse(message.body); // JSON 파싱 시 오류 처리
      } catch (error) {
        console.error("수신된 메시지 파싱 실패:", error);
        return; // 파싱 실패 시 더 이상 처리하지 않음
      }

      const { status, qnaIdx } = data;

      // 👉 수신 데이터 콘솔 로그
      console.log("📩 받은 메시지 전체:", data);
      console.log("📌 상태:", status);
      console.log("📝 본문:", data.body);
      console.log("💬 댓글들:", data.comments);

      try {
        switch (status) {
          case "RELOAD":
            setQnaContents((prev) => ({
              ...prev,
              [qnaIdx]: { body: data.body },
            }));
            setQnaComments((prev) => ({
              ...prev,
              [qnaIdx]: data.comments,
            }));
            break;

          case "MOD_BODY":
            setQnaContents((prev) => ({
              ...prev,
              [qnaIdx]: { body: data.body },
            }));
            break;

          case "MOD_COMM":
            if (!Array.isArray(data.comments) || data.comments.length === 0) {
              console.warn("MOD_COMM 상태인데 comments 정보가 없습니다.", data);
              break;
            }
            const updatedComment = data.comments[0];
            setQnaComments((prev) => {
              const existing = prev[qnaIdx] || [];
              const updated = existing.map((comment) =>
                comment.qnaReplyIdx === updatedComment.qnaReplyIdx ? updatedComment : comment
              );
              return {
                ...prev,
                [qnaIdx]: updated,
              };
            });
            break;

          case "ADD_COMM":
            if (!Array.isArray(data.comments) || data.comments.length === 0) {
              console.warn("ADD_COMM 상태인데 comments 정보가 없습니다.", data);
              break;
            }
            const newComment = data.comments[0];
            setQnaComments((prev) => {
              const existing = prev[qnaIdx] || [];
              const exists = existing.some(c => c.qnaReplyIdx === newComment.qnaReplyIdx);
              return {
                ...prev,
                [qnaIdx]: exists ? existing : [...existing, newComment],
              };
            });
            break;

          case "DEL_COMM":
            if (!Array.isArray(data.comments) || data.comments.length === 0) {
              console.warn("DEL_COMM 상태인데 comments 정보가 없습니다.", data);
              break;
            }
            const deleteQnaReplyIdx = data.comments[0].qnaReplyIdx;
            setQnaComments((prev) => {
              const existing = prev[qnaIdx] || [];
              const filtered = existing.filter(c => c.qnaReplyIdx !== deleteQnaReplyIdx);
              return {
                ...prev,
                [qnaIdx]: filtered,
              };
            });
            break;

          default:
            console.warn("알 수 없는 상태입니다:", status);
        }
      } catch (error) {
        console.error("메시지 처리 중 오류 발생:", error);
      }

      // 초기에 열린 상태 아니면 상태 설정
      setExpandedQnaIdx(qnaIdx);
    };

    // 👉 구독 먼저 등록
    try {
      const newSubscription = stompClientRef.current?.subscribe(
        `/user/queue/set/qna/detail/${qnaIdx}`,
        handleQnaDetailMessage
      );
      qnaSubscriptionRef.current = newSubscription;
    } catch (error) {
      console.error("STOMP 구독 등록 실패:", error);
    }

    // 👉 요청 전송
    try {
      stompClientRef.current?.send(
        `/pub/get/matched/qna/detail/${qnaIdx}`,
        { Authorization: `Bearer ${accessToken}` },
        null
      );
    } catch (error) {
      console.error("STOMP 요청 전송 실패:", error);
    }
  };

  const toggleWaitList = () => {
    setIsWaitListOpen((prev) => !prev);  // 대기중인 문의 리스트 열기/닫기 토글
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>📢 채팅방: {roomNo}</h2>
      <div style={{ marginTop: '10px', fontSize: '1.2em', color: connectionStatus === '연결됨' ? 'green' : 'red' }}>
        {connectionStatus}
      </div>

      {waitStatusMessage && (
        <div style={{
          margin: '15px 0',
          padding: '10px',
          backgroundColor: '#fffae6',
          borderRadius: '6px',
          fontSize: '0.9em',
          color: '#666',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 1s ease-in-out'
        }}>
          {waitStatusMessage}
        </div>
      )}

      {matchedStatusMessage && (
        <div style={{
          margin: '15px 0',
          padding: '10px',
          backgroundColor: '#e6f7ff',
          borderRadius: '6px',
          fontSize: '0.9em',
          color: '#004085',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 1s ease-in-out'
        }}>
          {matchedStatusMessage}
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <div style={{
          padding: '15px',
          backgroundColor: '#f0f0f0', // 컨테이너 배경색 추가
          borderRadius: '8px', // 전체 컨테이너에 둥근 모서리 적용
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // 컨테이너 그림자 추가
          width: '500px', // 고정된 너비 (픽셀 값)
          height: 'auto', // 높이는 자동으로 설정
          boxSizing: 'border-box' // 여백을 포함한 크기 계산
        }}>
          <h3 style={{ fontSize: '1.3em', marginBottom: '10px', color: '#4CAF50' }}>
            접속 중인 관리자 목록
          </h3>

          {adminList.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: '0' }}>
              {adminList.map((admin, index) => (
                <li key={index} style={{
                  backgroundColor: '#fff', // 각 카드 배경색
                  marginBottom: '10px',
                  padding: '12px',
                  borderRadius: '8px',
                  boxShadow: '0 3px 5px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.9em',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>이름: {admin.userName}</div>
                    <div style={{ color: '#555' }}><strong>매칭 수:</strong> {admin.matched}</div>
                    <div style={{
                      backgroundColor: admin.status === 0 ? '#b0b0b0' : '#4CAF50', // 비활성 상태는 회색, 활성 상태는 녹색
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '5px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      fontSize: '0.8em'
                    }}>
                      상태: {admin.status === 0 ? '비활성' : '활성'}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '1em', color: '#999' }}>접속 중인 관리자가 없습니다.</p>
          )}
        </div>
        <button onClick={sendPersonalMessage}>🔒 개인 메시지 테스트</button>
        <button onClick={handleSwitchStatus} style={{ marginLeft: '10px' }}>🔄 상태 전환</button>
        <button onClick={handleTokenReissue}>🔁 토큰 재발급</button>

        {personalMessageList.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3>🔐 개인 메시지 응답 목록:</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {personalMessageList.map((msg, idx) => {
                const qna = msg;
                const isExpanded = expandedQnaIdx === qna.qnaIdx;

                return (
                  <li key={idx} onClick={() => toggleQnaContent(qna.qnaIdx)}
                    style={{
                      position: 'relative',  // 뱃지 위치를 위한 상대 위치 설정
                      marginBottom: '10px',
                      padding: '8px',
                      backgroundColor: '#f2f9ff',
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      fontSize: '0.9em',
                    }}>
                    {/* 🔴 질문 수 뱃지 표시 */}
                    {qna.qcount > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: 'red',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8em',
                        fontWeight: 'bold',
                        boxShadow: '0 0 4px rgba(0,0,0,0.2)'
                      }}>
                        {qna.qcount}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div><strong>QnA 번호:</strong> {qna.qnaIdx}</div>
                        <div><strong>유저 이름:</strong> {qna.userName}</div>
                        <div><strong>제목:</strong> {qna.title}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <div><strong>작성일시:</strong> {new Date(qna.createdAt).toLocaleString()}</div>
                        <div><strong>카테고리:</strong> {qna.category}</div>
                        <div><strong>상태:</strong> {qna.qnaStatus}</div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: '8px', padding: '6px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #ddd' }}>
                        <strong>본문:</strong>
                        <div style={{ marginTop: '5px' }}>
                          <Viewer
                            key={qnaContents[qna.qnaIdx]?.body}  // body가 바뀔 때 Viewer가 재마운트됨
                            initialValue={qnaContents[qna.qnaIdx]?.body || '로딩 중...'}
                          />
                        </div>

                        {/* 답변 렌더링 */}
                        <div style={{ marginTop: '16px' }}>
                          <strong>답변 목록:</strong>
                          {qnaComments[qna.qnaIdx]?.length > 0 ? (
                            qnaComments[qna.qnaIdx].map((comment, index) => {
                              const isMine = comment.userName === localStorage.getItem("userName");

                              const commentContainerStyle = {
                                display: 'flex',
                                justifyContent: isMine ? 'flex-end' : 'flex-start',
                              };

                              const commentBoxStyle = {
                                width: '85%', // 더 넓게
                                marginLeft: isMine ? '40px' : '0',   // 내가 쓴 글은 왼쪽 여백
                                marginRight: isMine ? '0' : '40px',  // 상대 글은 오른쪽 여백
                                marginTop: '12px',
                                padding: '10px',
                                backgroundColor: isMine ? '#FFFACD' : '#f9f9f9',
                                borderRadius: '10px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                wordBreak: 'break-word',
                              };

                              const infoStyle = {
                                fontSize: '12px',
                                color: '#666',
                                marginBottom: '6px',
                              };

                              return (
                                <div key={comment.qnaReplyIdx} style={commentContainerStyle}>
                                  <div style={commentBoxStyle}>
                                    <div style={infoStyle}>
                                      작성자: {comment.userName} | 작성일: {comment.createdAt}
                                    </div>
                                    <div style={{
                                      backgroundColor: '#fefefe',
                                      padding: '8px 12px',
                                      borderRadius: '6px',
                                      border: '1px solid #eee',
                                      marginTop: '6px'
                                    }}>
                                      <Viewer key={comment.qnaReplyIdx + comment.modifiedAt} initialValue={comment.content} />
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div style={{ marginTop: '10px', color: '#999' }}>답변이 없습니다.</div>
                          )}
                        </div>
                      </div>
                    )}

                  </li>
                );
              })}

            </ul>
          </div>
        )}
      </div>

      <div style={{
        border: '1px solid #ccc',
        height: '300px',
        overflowY: 'auto',
        margin: '30px 0 10px',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {chatList.map((chat, idx) => {
          const isMine = chat.sender === currentUser;
          return (
            <div key={idx} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', margin: '5px 0' }}>
              <div style={{
                maxWidth: '70%',
                backgroundColor: isMine ? '#DCF8C6' : '#F1F0F0',
                borderRadius: '10px',
                padding: '8px 12px',
                color: '#000',
              }}>
                <div style={{ fontSize: '0.8em', color: '#555' }}>{isMine ? '나' : chat.sender}</div>
                <div>{chat.content}</div>
              </div>
            </div>
          );
        })}
      </div>

      <input
        type="text"
        value={message}
        placeholder="메시지를 입력하세요"
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        style={{ width: '80%', marginRight: '10px' }}
      />
      <button onClick={sendMessage}>전송</button>

      {/* 우측 하단 고정 버튼 */}
      <button
        onClick={toggleWaitList}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          borderRadius: '30px',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          fontSize: '16px',
        }}
      >
        {isWaitListOpen ? '대기중 문의 리스트 닫기' : '대기중 문의 리스트 열기'}
      </button>

      {isWaitListOpen && waitList.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '80px',  // 버튼 위에 대기리스트 배치
          right: '20px',
          width: '300px',
          maxHeight: '400px',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          border: '1px solid #ccc',
          borderRadius: '10px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
          padding: '10px',
        }}>
          <h3>대기중 문의 리스트</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {waitList.map((item) => {
              const qna = item;
              return (
                <li key={qna.qnaIdx} style={{
                  backgroundColor: '#f7f7f7',
                  marginBottom: '10px',
                  padding: '8px',
                  borderRadius: '6px',
                }}>
                  <div><strong>QnA 번호:</strong> {qna.qnaIdx}</div>
                  <div><strong>유저:</strong> {qna.userName}</div>
                  <div><strong>제목:</strong> {qna.title}</div>
                  <div><strong>상태:</strong> {qna.qnaStatus}</div>
                  <button
                    onClick={() => handleTakeQna(qna.qnaIdx)}
                    style={{
                      marginTop: '6px',
                      padding: '5px 10px',
                      backgroundColor: '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                    할당
                  </button>
                </li>
              );
            })}


          </ul>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
