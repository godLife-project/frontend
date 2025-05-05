import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Users } from "lucide-react";

const QnaList = ({
  waitList,
  assignedList,
  selectedQna,
  onQnaSelect,
  onAssignQna,
  renderStatusBadge,
}) => {
  return (
    <div className="col-span-4">
      <Tabs defaultValue="assigned">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assigned" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            나의 문의 ({assignedList.length})
          </TabsTrigger>
          <TabsTrigger value="waiting" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            대기 목록 ({waitList.length})
          </TabsTrigger>
        </TabsList>

        {/* 할당된 QnA 목록 */}
        <TabsContent value="assigned">
          <Card>
            <CardHeader>
              <CardTitle>나에게 할당된 문의</CardTitle>
              <CardDescription>
                내가 처리 중인 1:1 문의 목록입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                {assignedList.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    할당된 문의가 없습니다.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>번호</TableHead>
                        <TableHead>제목</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>작성일</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedList.map((qna) => (
                        <TableRow
                          key={qna.qnaIdx}
                          className={`cursor-pointer hover:bg-gray-50 ${
                            selectedQna?.qnaIdx === qna.qnaIdx
                              ? "bg-blue-50"
                              : ""
                          }`}
                          onClick={() => onQnaSelect(qna)}
                        >
                          <TableCell className="font-medium">
                            {qna.qnaIdx}
                          </TableCell>
                          <TableCell className="flex items-center gap-2">
                            {qna.qcount > 0 && (
                              <Badge
                                variant="destructive"
                                className="rounded-full h-5 w-5 p-0 flex items-center justify-center"
                              >
                                {qna.qcount}
                              </Badge>
                            )}
                            {qna.title}
                          </TableCell>
                          <TableCell>
                            {renderStatusBadge(qna.qnaStatus)}
                          </TableCell>
                          <TableCell className="text-xs">
                            {new Date(qna.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 대기 QnA 목록 */}
        <TabsContent value="waiting">
          <Card>
            <CardHeader>
              <CardTitle>대기 중인 문의</CardTitle>
              <CardDescription>
                할당 대기 중인 1:1 문의 목록입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                {waitList.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    대기 중인 문의가 없습니다.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>번호</TableHead>
                        <TableHead>제목</TableHead>
                        <TableHead>사용자</TableHead>
                        <TableHead>작성일</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {waitList.map((qna) => (
                        <TableRow key={qna.qnaIdx}>
                          <TableCell className="font-medium">
                            {qna.qnaIdx}
                          </TableCell>
                          <TableCell>{qna.title}</TableCell>
                          <TableCell>{qna.userName}</TableCell>
                          <TableCell className="text-xs">
                            {new Date(qna.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAssignQna(qna.qnaIdx);
                              }}
                            >
                              할당받기
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QnaList;
