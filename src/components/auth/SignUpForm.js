import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
function SignUpForm(props) {
  return (
    <div className="h-[500px] bg-gray-200 flex items-center justify-center">
      <div className="bg-white p-6 rounded-3xl shadow-md w-full max-w-sm">
        <div className="flex justify-between">
          <span className="font-semibold">
            Welcome to <span className="text-blue-500">LOREM</span>
          </span>
          <div className="flex flex-col space-x-4 pt-2">
            <span className="text-gray-200 text-xs bg-transparent border-none p-0 h-4 shadow-none ring-0">
              계정이 있으시나요?
            </span>
            <Button
              type="button"
              className="text-xs bg-transparent border-none p-0 h-3 pt-3  text-gray-400 hover:text-blue-500 hover:bg-white focus:outline-none shadow-none ring-0"
            >
              로그인하러 가기
            </Button>
          </div>
        </div>
        <div className="pb-7 text-4xl font-bold">Sign up</div>
        <div>
          <h1 className="mt-4 mb-2 text-xs font-semibold">아이디</h1>
          <Input type="ID" placeholder="ID" />
        </div>
        <div className="flex space-x-4">
          <div>
            <h1 className="mt-4 mb-2 text-xs font-semibold">이름</h1>
            <Input type="name" placeholder="User name" />
          </div>
          <div>
            <h1 className="mt-4 mb-2 text-xs font-semibold">닉네임</h1>
            <Input type="nickname" placeholder="Nick name" />
          </div>
        </div>
        <div>
          <h1 className="mt-4 mb-2 text-xs font-semibold">비밀번호</h1>
          <Input type="password" placeholder="Password" />
        </div>
        <h1 className="mt-4 mb-2 text-xs font-semibold">비밀번호 확인</h1>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input type="password" placeholder="Password" />
          <Button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-1 text-xs rounded"
          >
            <span>비밀번호 확인</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SignUpForm;
