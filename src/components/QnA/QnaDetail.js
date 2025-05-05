import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, MessageCircle, Send } from "lucide-react";
import { Viewer } from "@toast-ui/react-editor";

const QnaDetail = ({
  selectedQna,
  qnaContent,
  qnaReplies,
  replyText,
  setReplyText,
  onSendReply,
  onCompleteQna,
  renderStatusBadge,
  currentUser,
}) => {
  return (
    <Card className="h-full">
      {selectedQna ? (
        <>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="mb-1">
                  #{selectedQna.qnaIdx}: {selectedQna.title}
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedQna.userName}`}
                      />
                      <AvatarFallback>
                        {selectedQna.userName.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedQna.userName} ·{" "}
                    {new Date(selectedQna.createdAt).toLocaleString()}·
                    카테고리: {selectedQna.category}
                  </div>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {renderStatusBadge(selectedQna.qnaStatus)}
                {selectedQna.qnaStatus !== "완료" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    onClick={onCompleteQna}
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" /> 완료 처리
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 본문 내용 */}
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h3 className="font-medium mb-2 text-gray-700">문의 내용</h3>
                <div className="prose max-w-none">
                  {qnaContent ? (
                    <Viewer initialValue={qnaContent} />
                  ) : (
                    <p className="text-gray-500">로딩 중...</p>
                  )}
                </div>
              </div>

              {/* 답변 목록 */}
              <div>
                <h3 className="font-medium mb-3 text-gray-700 flex items-center">
                  <MessageCircle className="mr-2 h-4 w-4" /> 답변 내역
                </h3>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {qnaReplies && qnaReplies.length > 0 ? (
                    qnaReplies.map((reply) => {
                      const isMine = reply.userName === currentUser;

                      return (
                        <div
                          key={reply.qnaReplyIdx}
                          className={`flex ${
                            isMine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              isMine
                                ? "bg-blue-50 border border-blue-100"
                                : "bg-gray-50 border border-gray-100"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Avatar className="h-5 w-5">
                                <AvatarImage
                                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${reply.userName}`}
                                />
                                <AvatarFallback>
                                  {reply.userName.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{reply.userName}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(reply.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="mt-2 bg-white p-2 rounded border border-gray-100">
                              <Viewer initialValue={reply.content || ""} />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      아직 답변이 없습니다.
                    </div>
                  )}
                </div>
              </div>

              {/* 답변 작성 폼 */}
              {selectedQna.qnaStatus !== "완료" && (
                <div>
                  <h3 className="font-medium mb-2 text-gray-700">답변 작성</h3>
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="답변을 입력하세요..."
                    className="mb-2"
                    rows={4}
                  />
                  <Button
                    onClick={onSendReply}
                    disabled={!replyText.trim()}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" /> 답변 등록
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </>
      ) : (
        <div className="h-full flex items-center justify-center p-6 text-center text-gray-500">
          <div>
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium mb-2">문의를 선택해주세요</h3>
            <p className="max-w-md">
              왼쪽의 목록에서 문의를 선택하면 상세 내용을 확인하고 답변할 수
              있습니다.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default QnaDetail;
