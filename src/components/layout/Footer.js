import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <Card className="rounded-none border-t border-b-0 border-x-0 bg-gray-100">
      <CardContent className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* 회사 정보 섹션 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">회사명</h3>
              <p className="text-muted-foreground mb-4">
                간단한 회사 소개글이나 미션 문구를 넣을 수 있습니다.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" className="h-9 w-9 p-0">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 p-0">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 p-0">
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 p-0">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 빠른 링크 섹션 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">빠른 링크</h3>
              <div className="flex flex-col space-y-2">
                <Button variant="link" className="h-auto p-0 justify-start">
                  회사 소개
                </Button>
                <Button variant="link" className="h-auto p-0 justify-start">
                  서비스
                </Button>
                <Button variant="link" className="h-auto p-0 justify-start">
                  제품
                </Button>
                <Button variant="link" className="h-auto p-0 justify-start">
                  문의하기
                </Button>
              </div>
            </div>

            {/* 고객 지원 섹션 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">고객 지원</h3>
              <div className="flex flex-col space-y-2">
                <Button variant="link" className="h-auto p-0 justify-start">
                  자주 묻는 질문
                </Button>
                <Button variant="link" className="h-auto p-0 justify-start">
                  개인정보처리방침
                </Button>
                <Button variant="link" className="h-auto p-0 justify-start">
                  이용약관
                </Button>
              </div>
            </div>

            {/* 연락처 섹션 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">연락처</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>서울특별시 강남구 테헤란로</p>
                <p>전화: 02-1234-5678</p>
                <p>이메일: contact@example.com</p>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* 저작권 정보 */}
          <div className="text-center text-muted-foreground">
            © 2025 회사명. All rights reserved.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Footer;