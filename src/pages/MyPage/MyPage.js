import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import MyPageForm from "@/components/mypage/mypage";

const MyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="overflow-hidden">
          <CardContent className="p-8 bg-white">
            <div className="p-5 space-y-4">
              <MyPageForm />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyPage;
