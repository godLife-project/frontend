import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoPeople } from "react-icons/go";
import { GoClock } from "react-icons/go";
import { MdOutlineDateRange } from "react-icons/md";
import { BiAward } from "react-icons/bi";

const Difficulty = ({ difficulty }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={i < difficulty ? "text-yellow-400" : "text-gray-300"}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const ChallengeDetailForm = () => {
  const difficulty = 3; // 난이도 설정

  return (
    <div>
      <div>
        <div className="mb-20">
          {/* 카테고리 */}
          <div className="flex flex-col items-center">
            <div className="border border-gray-300 px-2 py-1 rounded-lg text-xs inline-flex">
              독서
            </div>
          </div>
          {/* 제목 */}
          <div className="text-center text-2xl font-bold mb-2 mt-1">
            하루 독서 3시간 챌린지
          </div>
          <div className="text-center text-gray-500">개설일자 : 2025-03-20</div>
        </div>
        {/* 참여인원 */}
        <div className="flex items-center mt-10">
          <GoPeople />
          <span className="ml-1">42/99명 참여중</span>
        </div>
        <hr className="my-3 border-gray-200" />
        {/* 도전기간 */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center">
            <GoClock />
            <span className="ml-1">도전 기간</span>
          </div>
          <span>24일</span>
        </div>
        <hr className="my-3 border-gray-200" />
        {/* 난이도 */}
        <div className="flex items-center mt-3 justify-between">
          <div className="flex items-center">
            <BiAward />
            <span className="ml-1">난이도</span>
          </div>
          <Difficulty difficulty={difficulty} />
        </div>
        <hr className="my-3 border-gray-200" />
        {/* 일정 */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center">
            <MdOutlineDateRange />
            <span className="ml-1">일정</span>
          </div>
          <span>자유 참여</span>
        </div>
        <hr className="my-3 border-gray-200" />
        {/* 챌린지 소개 */}
        <div className="mt-3">
          챌린지 소개
          <Card className="bg-white shadow-sm mt-3">
            <CardHeader>
              나랏말싸미 듕귁에 달아.. 요즘 독해력이 매우 떨어지고 있습니다.
              모두 함께 하루 독서 3시간을 통해 갓생을 살아봐요!
            </CardHeader>
          </Card>
        </div>
        <Button className="w-full mt-10">지금 참여하기</Button>
      </div>
    </div>
  );
};

export default ChallengeDetailForm;
