import React, { useState, useEffect } from "react";
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
    CheckCircle2,
    MessageSquare,
    Clock,
    CheckCircle,
    HelpCircle,
} from "lucide-react";

// QnAAdminDetail - 관리자용 상세 컴포넌트 (웹소켓 기반)
export const QnAAdminDetail = ({
    selectedQna,
    qnaContent,
    qnaReplies,
    replyText,
    setReplyText,
    onSendReply,
    onCompleteQna,
    onRefresh,
    currentUser
}) => {
    const [categories, setCategories] = useState([]);
    const [categoryLoading, setCategoryLoading] = useState(true);

    // 카테고리 목록 불러오기
    useEffect(() => {
        const fetchCategories = async () => {
            setCategoryLoading(true);
            try {
                const response = await axiosInstance.get('/categories/qna');
                if (response.status === 200) {
                    setCategories(response.data);
                }
            } catch (error) {
                console.error('카테고리 로딩 오류:', error);
            } finally {
                setCategoryLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // 카테고리 이름 찾기 함수
    const getCategoryName = (categoryIdx) => {
        if (!categories.length) return "로딩 중...";

        // 모든 하위 카테고리를 탐색
        for (const parent of categories) {
            if (!parent.childCategory) continue;

            for (const child of parent.childCategory) {
                if (child.categoryIdx === categoryIdx) {
                    return `${parent.parentName} > ${child.categoryName}`;
                }
            }
        }

        return "알 수 없음";
    };

    // 상태에 따른 배지 스타일 변환
    const getStatusBadge = (status) => {
        switch (status) {
            case "WAIT":
                return <Badge variant="outline" className="bg-yellow-100">대기중</Badge>;
            case "CONNECT":
                return <Badge variant="outline" className="bg-blue-100">연결됨</Badge>;
            case "RESPONDING":
                return <Badge variant="outline" className="bg-purple-100">응대중</Badge>;
            case "COMPLETE":
                return <Badge variant="outline" className="bg-green-100">완료됨</Badge>;
            case "SLEEP":
                return <Badge variant="outline" className="bg-gray-100">휴면중</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
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

    if (!selectedQna) {
        return (
            <Card className="h-full">
                <CardContent className="flex h-full items-center justify-center">
                    <div className="text-center p-6">
                        <h3 className="text-lg font-medium mb-2">문의를 선택해주세요</h3>
                        <p className="text-muted-foreground">좌측 목록에서 문의를 선택하면 상세 내용이 표시됩니다.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl">문의 상세</CardTitle>
                </div>
                <div className="flex gap-2">
                    {/* 새로고침 버튼 */}
                    {/* <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            새로고침
          </Button> */}

                    {/* 완료 처리 버튼 */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onCompleteQna}
                        className="flex items-center"
                        disabled={selectedQna.qnaStatus === "COMPLETE"}
                    >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        완료 처리
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 overflow-auto max-h-[calc(100vh-250px)]">
                {/* 문의 제목 및 메타 정보 */}
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 justify-between">
                        <h2 className="text-xl font-semibold">{selectedQna.title}</h2>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                                {categoryLoading ? "카테고리 로딩 중..." : getCategoryName(selectedQna.category)}
                            </Badge>
                            {getStatusBadge(selectedQna.qnaStatus)}
                        </div>
                    </div>
                    <div className="flex flex-wrap text-sm text-muted-foreground gap-x-4 gap-y-1">
                        <div>작성자: {selectedQna.userName || "-"}</div>
                        <div>작성일: {formatDate(selectedQna.createdAt)}</div>
                        {selectedQna.modifiedAt && selectedQna.modifiedAt !== selectedQna.createdAt && (
                            <div>
                                수정일: {formatDate(selectedQna.modifiedAt)}
                            </div>
                        )}
                    </div>
                </div>

                <Separator />

                {/* 문의 내용 */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium">문의 내용</h3>
                    <div className="p-4 rounded-md bg-muted/50 whitespace-pre-wrap min-h-[150px]">
                        {qnaContent || "내용을 불러오는 중..."}
                    </div>
                </div>

                <Separator />

                {/* 답변 목록 */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            답변 및 댓글 ({qnaReplies?.length || 0})
                        </h3>
                    </div>

                    {qnaReplies && qnaReplies.length > 0 ? (
                        <div className="space-y-4">
                            {qnaReplies.map((comment) => {
                                // 콘솔에 댓글 데이터 출력하여 확인
                                console.log('관리자 패널 댓글 데이터:', comment);
                                console.log('👤 userNick:', comment.userNick);
                                console.log('🏷️ nickTag:', comment.nickTag);
                                
                                // userNick + nickTag 조합으로 사용자명 생성
                                const displayName = comment.userNick && comment.nickTag
                                    ? `${comment.userNick}${comment.nickTag}`
                                    : comment.userNick || comment.nickTag || comment.userName || '상담원';

                                console.log('✨ 최종 표시명:', displayName);

                                // 관리자인지 사용자인지 구분 (필요시 백엔드에서 userType 필드 추가 가능)
                                const isAdmin = comment.userType === 'ADMIN' || displayName.includes('상담원');
                                const isCurrentUser = displayName === currentUser;

                                return (
                                    <div
                                        key={comment.qnaReplyIdx}
                                        className={`p-4 rounded-lg border ${
                                            isCurrentUser
                                                ? "bg-blue-50 border-blue-200"
                                                : isAdmin 
                                                    ? "bg-green-50 border-green-200" 
                                                    : "bg-gray-50 border-gray-200"
                                        }`}
                                    >
                                        <div className="flex flex-wrap items-center justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                                <Badge 
                                                    variant={isAdmin ? "default" : "secondary"}
                                                    className={`${
                                                        isCurrentUser
                                                            ? "bg-blue-100 text-blue-800 border-blue-300"
                                                            : isAdmin 
                                                                ? "bg-green-100 text-green-800 border-green-300" 
                                                                : "bg-gray-100 text-gray-800 border-gray-300"
                                                    }`}
                                                >
                                                    {isAdmin ? "🛡️ " : "👤 "}{displayName}
                                                </Badge>
                                                {isAdmin && (
                                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                                        관리자
                                                    </Badge>
                                                )}
                                                {isCurrentUser && (
                                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                                        본인
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {formatDate(comment.createdAt)}
                                            </div>
                                        </div>
                                        <div className="pl-1">
                                            <div className="text-sm leading-relaxed whitespace-pre-wrap bg-white p-3 rounded border">
                                                {comment.content}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-muted-foreground">
                            답변이 아직 없습니다.
                        </div>
                    )}

                    {/* 새 댓글 작성 폼 */}
                    <div className="space-y-3">
                        <Textarea
                            placeholder="답변을 입력하세요..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="min-h-[100px]"
                        />
                        <div className="flex justify-end">
                            <Button
                                onClick={onSendReply}
                                disabled={!replyText.trim()}
                                className="flex items-center"
                            >
                                <Send className="h-4 w-4 mr-1" />
                                답변 등록
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default QnAAdminDetail;