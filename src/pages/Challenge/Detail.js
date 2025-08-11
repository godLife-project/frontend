import React from "react";
import Navigation from "@/components/Navigation";
// shadcn/ui 컴포넌트
import { Card, CardContent } from "@/components/ui/card";
import ChallengeDetailForm from "@/components/challengeDetail";
import { BiChevronLeftCircle } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const ChallengDetailPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white relative">
            <div className="absolute left-8 top-1/2 transform -translate-y-1/2">
              <BiChevronLeftCircle
                className="cursor-pointer"
                onClick={() => navigate(-1)}
                size={30}
              />
            </div>
          </div>

          <CardContent className="p-8 bg-white">
            <div className="space-y-4">
              <ChallengeDetailForm />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChallengDetailPage;
