# 🎬 Movie Server API

Movie Server backend được viết bằng **Node.js + Express + DrizzleORM + PostgreSQL**.  
Hỗ trợ chạy bằng Docker.

## 🚀 Chạy dự án

### Yêu cầu
- Docker
- Docker Compose

### Cài đặt
 1. Clone dự án:
git clone https://github.com/HocTrinh-cmd/Movie-Server.git

   cd Movie-Server

3. Chạy với Docker Compose:
docker-compose up --build

4. Apply migrations (lần đầu hoặc khi có update DB):
docker exec -it movie-server npx drizzle-kit push

5. nếu muốn có database chạy lệnh:
npx ts-node seedData.ts

download file API-postman_collection:
https://drive.google.com/file/d/1MxwFlxpAiXcSOqpFLXrnSktI7yr78mBW/view?usp=sharing
