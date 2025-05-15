import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";

// UI 컴포넌트
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Send,
  Pencil,
  Trash2,
  MessageSquare,
  Clock,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

const QnADetail = () => {
  // URL 파라미터에서 QnA ID 가져오기
  const { qnaIdx } = useParams();
  const navigate = useNavigate();

  // 상태 관리
  const [qnaDetail, setQnaDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isDeletingQna, setIsDeletingQna] = useState(false);

  // QnA 상세 정보 불러오기
  const fetchQnADetail = async () => {
    setIsLoading(true);
    setError("");

    try {
      console.log("QnA 상세 정보 요청 시작. qnaIdx:", qnaIdx);
      
      // axiosInstance를 사용하여 API 요청
      const response = await axiosInstance.get(`/qna/auth/${qnaIdx}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        }
      });
      
      console.log("API 응답:", response);

      if (response.status === 200) {
        // 응답 데이터 처리
        const data = response.data.message || response.data;
        console.log("응답 데이터:", data);
        
        setQnaDetail(data);
      } else {
        setError("문의 상세 정보를 불러오는 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("QnA 상세 정보 불러오기 오류:", error);
      
      if (error.response) {
        console.error("에러 응답:", error.response);
        console.error("상태 코드:", error.response.status);
        
        if (error.response.status === 403) {
          setError("이 문의에 접근할 권한이 없습니다. 본인이 작성한 문의만 볼 수 있습니다.");
        } else if (error.response.status === 401) {
          setError("인증이 만료되었습니다. 다시 로그인해주세요.");
        } else {
          setError(error.response.data?.message || "문의 상세 정보를 불러오는 중 오류가 발생했습니다.");
        }
      } else if (error.request) {
        setError("서버에서 응답이 없습니다. 네트워크 연결을 확인해주세요.");
      } else {
        setError(error.message || "문의 상세 정보를 불러오는 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 상세 정보 불러오기
  useEffect(() => {
    if (qnaIdx) {
      fetchQnADetail();
    } else {
      setError("문의 ID가 없습니다.");
      setIsLoading(false);
    }
  }, [qnaIdx]);

  // 댓글 작성 처리 - 수정된 API 경로와 요청 형식
  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      return;
    }

    setIsSubmittingComment(true);
    setError("");

    try {
      console.log("댓글 작성 요청 시작. qnaIdx:", qnaIdx);
      
      // 수정된 API 경로와 요청 형식으로 댓글 작성
      const response = await axiosInstance.post("/qna/auth/comment/reply", 
        {
          qnaIdx: parseInt(qnaIdx, 10),
          content: newComment
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          }
        }
      );
      
      console.log("댓글 작성 응답:", response);

      if (response.status === 200 || response.status === 201) {
        // 성공적으로 댓글이 작성됨
        setNewComment(""); // 입력 필드 초기화
        fetchQnADetail(); // 상세 정보 다시 불러오기
      } else {
        setError("댓글 작성 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("댓글 작성 오류:", error);
      
      if (error.response) {
        console.error("에러 응답:", error.response);
        console.error("상태 코드:", error.response.status);
        console.error("에러 데이터:", error.response.data);
        
        if (error.response.status === 403) {
          setError("댓글을 작성할 권한이 없습니다.");
        } else if (error.response.status === 401) {
          setError("인증이 만료되었습니다. 다시 로그인해주세요.");
        } else {
          setError(error.response.data?.message || "댓글 작성 중 오류가 발생했습니다.");
        }
      } else if (error.request) {
        setError("서버에서 응답이 없습니다. 네트워크 연결을 확인해주세요.");
      } else {
        setError(error.message || "댓글 작성 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 문의 삭제 처리
  const handleDelete = async () => {
    // 사용자에게 삭제 확인
    if (!window.confirm("정말 이 문의를 삭제하시겠습니까? 삭제된 문의는 복구할 수 없습니다.")) {
      return;
    }

    setIsDeletingQna(true);
    setError("");

    try {
      console.log("QnA 삭제 요청 시작. qnaIdx:", qnaIdx);
      
      // 삭제 API 호출
      const response = await axiosInstance.delete(`/qna/auth/delete/${qnaIdx}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        }
      });
      
      console.log("삭제 API 응답:", response);

      if (response.status === 200) {
        alert("문의가 성공적으로 삭제되었습니다.");
        // 목록 페이지로 이동
        navigate("/qna/list");
      } else {
        setError("문의 삭제 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("QnA 삭제 오류:", error);
      
      if (error.response) {
        console.error("에러 응답:", error.response);
        console.error("상태 코드:", error.response.status);
        
        if (error.response.status === 403) {
          setError("이 문의를 삭제할 권한이 없습니다. 본인이 작성한 문의만 삭제할 수 있습니다.");
        } else if (error.response.status === 401) {
          setError("인증이 만료되었습니다. 다시 로그인해주세요.");
        } else {
          setError(error.response.data?.message || "문의 삭제 중 오류가 발생했습니다.");
        }
      } else if (error.request) {
        setError("서버에서 응답이 없습니다. 네트워크 연결을 확인해주세요.");
      } else {
        setError(error.message || "문의 삭제 중 오류가 발생했습니다.");
      }
    } finally {
      setIsDeletingQna(false);
    }
  };

  // 카테고리 이름 변환 함수
  const getCategoryName = (categoryId) => {
    const categories = {
      1: "계정 관련",
      2: "결제 관련",
      3: "서비스 이용",
      4: "기능 제안",
      5: "오류 신고",
      6: "기타",
    };
    return categories[categoryId] || "기타";
  };

  // 상태에 따른 배지 스타일 변환
  const getStatusBadge = (status) => {
    switch (status) {
      case "wait":
        return <Badge variant="outline" className="bg-yellow-100">답변 대기중</Badge>;
      case "answered":
        return <Badge variant="outline" className="bg-green-100">답변 완료</Badge>;
      case "responding":
        return <Badge variant="outline" className="bg-blue-100">답변 진행중</Badge>;
      case "reload":
        return <Badge variant="outline" className="bg-purple-100">재확인 중</Badge>;
      case "closed":
        return <Badge variant="outline" className="bg-gray-100">종료됨</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // 상태에 따른 안내 메시지
  const getStatusMessage = (status) => {
    switch (status) {
      case "wait":
        return {
          text: "문의가 접수되었습니다. 상담원 할당을 기다리고 있습니다.",
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          color: "bg-yellow-50 text-yellow-700 border-yellow-200"
        };
      case "answeres":
        return {
          text: "문의에 대한 답변이 완료되었습니다.",
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          color: "bg-green-50 text-green-700 border-green-200"
        };
      case "responding":
        return {
          text: "상담원이 문의를 확인 중입니다. 곧 답변이 등록될 예정입니다.",
          icon: <MessageSquare className="h-5 w-5 text-blue-500" />,
          color: "bg-blue-50 text-blue-700 border-blue-200"
        };
      case "reload":
        return {
          text: "추가 확인이 필요한 문의입니다. 상담원의 답변을 기다려주세요.",
          icon: <RefreshCw className="h-5 w-5 text-purple-500" />,
          color: "bg-purple-50 text-purple-700 border-purple-200"
        };
      case "closed":
        return {
          text: "문의가 종료되었습니다.",
          icon: <CheckCircle className="h-5 w-5 text-gray-500" />,
          color: "bg-gray-50 text-gray-700 border-gray-200"
        };
      default:
        return {
          text: "처리 중인 문의입니다.",
          icon: <HelpCircle className="h-5 w-5 text-gray-500" />,
          color: "bg-gray-50 text-gray-700 border-gray-200"
        };
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // 문의 수정 페이지로 이동
  const handleEdit = () => {
    navigate(`/qna/edit/${qnaIdx}`);
  };

  // 댓글 입력이 가능한지 확인
  const canAddComment = (status) => {
    // WAITING 상태일 때만 댓글 입력 가능
    return status === "wait";
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/qna/list")}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> 목록으로
            </Button>
            <CardTitle className="text-xl">1:1 문의 상세</CardTitle>
          </div>
          {!isLoading && qnaDetail && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchQnADetail}
                disabled={isLoading || isDeletingQna}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
                새로고침
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                disabled={isLoading || isDeletingQna}
                className="flex items-center"
              >
                <Pencil className="h-4 w-4 mr-1" />
                수정
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading || isDeletingQna}
                className="flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {isDeletingQna ? "삭제 중..." : "삭제"}
              </Button>
            </div>
          )}
        </CardHeader>

        {/* 로딩 중 */}
        {isLoading ? (
          <CardContent className="flex justify-center items-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin opacity-70" />
            <span className="ml-2">데이터를 불러오는 중...</span>
          </CardContent>
        ) : error ? (
          // 에러 발생 시
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>오류</AlertTitle>
              <AlertDescription className="space-y-2">
                <div>{error}</div>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchQnADetail}
                    className="mt-2"
                  >
                    다시 시도하기
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        ) : qnaDetail ? (
          // 상세 내용 표시
          <>
            <CardContent className="space-y-6">
              {/* 문의 제목 및 메타 정보 */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <h2 className="text-xl font-semibold">{qnaDetail.title}</h2>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {getCategoryName(qnaDetail.category)}
                    </Badge>
                    {getStatusBadge(qnaDetail.qnaStatus)}
                  </div>
                </div>
                <div className="flex flex-wrap text-sm text-muted-foreground gap-x-4 gap-y-1">
                  <div>
                    작성일: {formatDate(qnaDetail.createdAt)}
                  </div>
                  {qnaDetail.modifiedAt && qnaDetail.modifiedAt !== qnaDetail.createdAt && (
                    <div>
                      수정일: {formatDate(qnaDetail.modifiedAt)}
                    </div>
                  )}
                </div>
              </div>

              {/* 상태 안내 메시지 */}
              {qnaDetail.qnaStatus && (
                <div className={`flex items-start p-4 rounded-md border ${getStatusMessage(qnaDetail.qnaStatus).color}`}>
                  <div className="mr-3 mt-0.5">
                    {getStatusMessage(qnaDetail.qnaStatus).icon}
                  </div>
                  <div>
                    <p className="font-medium">{getStatusMessage(qnaDetail.qnaStatus).text}</p>
                    {!canAddComment(qnaDetail.qnaStatus) && (
                      <p className="text-sm mt-1">
                        {qnaDetail.qnaStatus === "wait" 
                          ? "문의가 접수되었습니다. 상담원이 배정되기를 기다려주세요." 
                          : "현재 상담원이 배정되어 답변 중입니다. 댓글은 상담원이 배정된 후에 작성할 수 있습니다."}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <Separator />

              {/* 문의 내용 */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">문의 내용</h3>
                <div className="p-4 rounded-md bg-muted/50 whitespace-pre-wrap min-h-[150px]">
                  {qnaDetail.body}
                </div>
              </div>

              <Separator />

              {/* 답변 목록 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    답변 및 댓글 ({qnaDetail.comments?.length || 0})
                  </h3>
                </div>

                {qnaDetail.comments && qnaDetail.comments.length > 0 ? (
                  <div className="space-y-4">
                    {qnaDetail.comments.map((comment) => (
                      <div
                        key={comment.qnaReplyIdx}
                        className="p-4 rounded-md bg-muted/50"
                      >
                        <div className="flex flex-wrap items-center justify-between mb-2">
                          <div className="font-medium">
                            {comment.userName}
                            {comment.userIdx === 0 && (
                              <Badge variant="secondary" className="ml-2">관리자</Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </div>
                        </div>
                        <div className="whitespace-pre-wrap text-sm">
                          {comment.content}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    답변이 아직 없습니다.
                  </div>
                )}

                {/* 새 댓글 작성 - 오류 메시지 표시 영역 추가 */}
                {error && error.includes("댓글") && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>댓글 오류</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* 새 댓글 작성 폼 - WAIT 상태일 때만 표시 */}
                {canAddComment(qnaDetail.qnaStatus) ? (
                  <form onSubmit={handleSubmitComment} className="space-y-3">
                    <Textarea
                      placeholder="댓글을 입력하세요..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[100px]"
                      disabled={isSubmittingComment}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={!newComment.trim() || isSubmittingComment}
                        className="flex items-center"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        {isSubmittingComment ? "전송 중..." : "댓글 작성"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="rounded-md bg-gray-50 border-gray-200 border p-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <p className="text-gray-600">
                        현재 상담원이 배정되어 있지 않아 댓글 작성이 제한됩니다.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex justify-between pt-0">
              <Button
                variant="outline"
                onClick={() => navigate("/qna/list")}
              >
                목록으로
              </Button>
            </CardFooter>
          </>
        ) : (
          // 데이터가 없는 경우
          <CardContent>
            <div className="text-center py-12">
              <p className="text-muted-foreground">문의를 찾을 수 없습니다.</p>
              <Button
                onClick={() => navigate("/qna/list")}
                variant="outline"
                className="mt-4"
              >
                목록으로 돌아가기
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default QnADetail;