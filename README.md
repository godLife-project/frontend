# 폴더 구조 설명
```
frontend
├─ public
└─ src
    ├─ App.js
    ├─ components             # 모든 컴포넌트의 위치
    │  ├─ auth                # 로그인, 회원가입 관련 폼(폼태그만)
    │  ├─ layout              # 헤더, 푸터, nav등 레이아웃 전반
    │  ├─ Navigation          # nav의 상세 컴포넌트트, 데스크탑 버전과 모바일 버전
    │  └─ ui                  # shadcn ui 폴더
    ├─ context
    ├─ hooks
    ├─ pages                  # 페이지 관련(로그인페이지, 회원가입 페이지, 홈 등)
    │  ├─ Auth                # 인증관련 페이지(폼과 번반적인거를 합친 구성)
    │  └─ Home                # 홈
    └─ routes

```
# shadcn-ui 환경 세팅
tailwindcss 설치 이후 진행한다.
```
npm install tailwindcss-animate class-variance-authority clsx tailwind-merge lucide-react
```

ts를 사용하면 tsconfig, js를 사용하면 jsconfig.json파일을 생성한다.
```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```
tailwind.config.js를 수정한다
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```
globals.css를 설정한다
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 47.4% 11.2%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 47.4% 11.2%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 100% 50%;
    --destructive-foreground: 210 40% 98%;
    --ring: 215 20.2% 65.1%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 224 71% 4%;
    --foreground: 213 31% 91%;
    --muted: 223 47% 11%;
    --muted-foreground: 215.4 16.3% 56.9%;
    --accent: 216 34% 17%;
    --accent-foreground: 210 40% 98%;
    --popover: 224 71% 4%;
    --popover-foreground: 215 20.2% 65.1%;
    --border: 216 34% 17%;
    --input: 216 34% 17%;
    --card: 224 71% 4%;
    --card-foreground: 213 31% 91%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 1.2%;
    --secondary: 222.2 47.4% 11.2%;
    --secondary-foreground: 210 40% 98%;
    --destructive: 0 63% 31%;
    --destructive-foreground: 210 40% 98%;
    --ring: 216 34% 17%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply font-sans antialiased bg-background text-foreground;
  }
}
```
lib/utils.js를 생성한다
```js
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
```
사용할 컴포넌트를 add한다
```
npm install @radix-ui/react-slot
```
공식 홈페이지에서 컴포넌트 코드를 복사해서 components/ui 폴더에 넣어준다.  
ex) https://ui.shadcn.com/docs/components/button 
