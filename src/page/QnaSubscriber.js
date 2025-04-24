import React, { useEffect, useState, useRef } from 'react';
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


  useEffect(() => {
    const userName = localStorage.getItem('userName');
    if (userName) setCurrentUser(userName);

    // STOMP 중복 연결 방지
    if (stompClientRef.current?.connected) {
      console.log('이미 연결됨');
      setConnectionStatus('연결됨');
      return;
    }

    // ws-stomp 경로를 통해 STOMP 연결 시도
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

        stompClient.send('/pub/get/waitList/init', {}, JSON.stringify({}));
        stompClient.send('/pub/get/matched/qna/init', {
          Authorization: `Bearer ${accessToken}`,
        });

        // 대기 상태 문의 리스트 수신
        // 각 상태에 따라 초기화, 추가, 삭제, 최신화 기능 수행
        stompClient.subscribe('/sub/waitList', (message) => {
          try {
            let { waitQnA, status } = JSON.parse(message.body);
            console.log('📥 대기중 문의 수신:', status, waitQnA);

            if (!Array.isArray(waitQnA)) {
              waitQnA = [waitQnA];  // 단일 객체를 배열로 감싸기
            }

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


        stompClient.subscribe(`/sub/roomChat/${roomNo}`, (message) => {
          const received = JSON.parse(message.body);
          setChatList((prev) => [...prev, received]);
        });

        // 나에게 할당된 문의 리스트 수신
        // 각 상태에 따라 초기화, 추가, 삭제, 최신화 기능 수행
        stompClient.subscribe('/user/queue/matched/qna', (message) => {
          try {
            let { matchedQnA, status } = JSON.parse(message.body);
            console.log('✅매칭된 문의 리스트 수신:', status, matchedQnA);

            // 👉 matchedQnA가 배열이 아니면 배열로 감싸기
            if (!Array.isArray(matchedQnA)) {
              matchedQnA = [matchedQnA];
            }

            setPersonalMessageList((prevList) => {
              switch (status) {
                case 'RELOAD': {
                  showMatchedListMessage('🔄 매칭된 문의가 새로고침 되었습니다.');
                  return matchedQnA;
                }

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

        // 각종 에러메세지를 수신
        stompClient.subscribe('/user/queue/admin/errors', (message) => {
          const error = JSON.parse(message.body);
          alert(`🚨 ${error.message}`);
        });

        // 수동 할당 시 응답 결과 수신
        stompClient.subscribe('/user/queue/isMatched/waitQna', (message) => {
          if (message && message.body) {
            alert(`📩 응답 메시지: ${message.body}`);
          }
        });

      },
      (error) => {
        console.error('❌ STOMP 연결 실패:', error);
        setConnectionStatus('연결 안됨');
      }
    );

    return () => {
      if (stompClient.connected) {
        stompClient.disconnect(() => {
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
            setQnaComments((prev) => {
              const existing = prev[qnaIdx] || [];
              const filtered = existing.filter(c => c.qnaReplyIdx !== data.qnaReplyIdx);
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
        <button onClick={sendPersonalMessage}>🔒 개인 메시지 테스트</button>
        <button onClick={handleSwitchStatus} style={{ marginLeft: '10px' }}>🔄 상태 전환</button>

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
                          <Viewer initialValue={qnaContents[qna.qnaIdx]?.body || '로딩 중...'} />
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
                                      <Viewer initialValue={comment.content} />
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
