# 1단계: 빌드용 이미지
FROM node:18 as build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# 2단계: nginx + 정적 파일
FROM nginx:1.25-alpine

# 빌드 결과물을 nginx 정적 리소스로 복사
COPY --from=build /app/build /usr/share/nginx/html

# nginx 설정 덮어쓰기
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
