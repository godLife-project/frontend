import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SignUpForm() {
  const [input, setInput] = useState({
    id: "",
    name: "",
    nickname: "",
    password: "",
    passwordConfirm: "",
    email: "",
  });

  const onChange = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="h-screen bg-gray-200 flex items-center justify-center">
      <div className="bg-white p-6 rounded-3xl shadow-md w-full max-w-sm h-[500px]">
        <ScrollArea className="h-[450px] pr-2">
          <div className="flex justify-between">
            <span className="font-semibold">
              Welcome to <span className="text-blue-500">LOREM</span>
            </span>
            <div className="flex flex-col space-x-4 pt-2">
              <span className="text-gray-400 text-xs">계정이 있으신가요?</span>
              <Button
                type="button"
                className="text-xs bg-transparent border-none p-0 h-3 pt-3 text-gray-400 hover:text-blue-500 hover:bg-white focus:outline-none shadow-none ring-0"
              >
                로그인하러 가기
              </Button>
            </div>
          </div>
          <div className="pb-7 text-4xl font-bold">Sign up</div>
          <div>
            <h1 className="mb-2 text-xs font-semibold">아이디</h1>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="id"
                name="id"
                value={input.id}
                onChange={onChange}
                placeholder="ID"
              />
              <Button
                type="button"
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-1 text-xs rounded"
              >
                중복 확인
              </Button>
            </div>
          </div>
          <div className="flex space-x-4">
            <div>
              <h1 className="mt-4 mb-2 text-xs font-semibold">이름</h1>
              <Input
                type="text"
                name="name"
                value={input.name}
                onChange={onChange}
                placeholder="User name"
              />
            </div>
            <div>
              <h1 className="mt-4 mb-2 text-xs font-semibold">닉네임</h1>
              <Input
                type="text"
                name="nickname"
                value={input.nickname}
                onChange={onChange}
                placeholder="Nick name"
              />
            </div>
          </div>
          <div>
            <h1 className="mt-4 mb-2 text-xs font-semibold">비밀번호</h1>
            <Input
              type="password"
              name="password"
              value={input.password}
              onChange={onChange}
              placeholder="Password"
            />
          </div>
          <div className="mt-4">
            <h1 className="mb-2 text-xs font-semibold">비밀번호 확인</h1>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="password"
                name="passwordConfirm"
                value={input.passwordConfirm}
                onChange={onChange}
                placeholder="Password"
              />
              <Button
                type="button"
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-1 text-xs rounded"
              >
                비밀번호 확인
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <h1 className="mb-2 text-xs font-semibold">성별</h1>
            <RadioGroup defaultValue="comfortable" className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="r1" />
                <Label htmlFor="r1">
                  <span className="text-xs">여성</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="r2" />
                <Label htmlFor="r2">
                  <span className="text-xs">남성</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="secret" id="r3" />
                <Label htmlFor="r3">
                  <span className="text-xs">비밀</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex space-x-4 mt-4">
            <div className="flex-1">
              <h1 className="mb-2 text-xs font-semibold">직업</h1>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>선택</SelectLabel>
                    <SelectItem value="developer">개발자</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-0">
              <h1 className="mb-2 text-xs font-semibold">생년월일</h1>
              <Input
                type="date"
                name="birthdate"
                value={input.birthdate}
                onChange={onChange}
                className="w-full"
              />
            </div>
          </div>
          <div className="pb-4">
            <h1 className="mt-4 mb-2 text-xs font-semibold">이메일</h1>
            <Input
              type="email"
              name="email"
              value={input.email}
              onChange={onChange}
              placeholder="Email"
            />
          </div>
          <Button
            type="button"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
          >
            Sign up
          </Button>
        </ScrollArea>
      </div>
    </div>
  );
}

export default SignUpForm;
