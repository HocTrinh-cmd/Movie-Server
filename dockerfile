FROM node:20-alpine

# Thư mục làm việc trong container
WORKDIR /app

# Copy package.json trước để cache dependency
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ code vào container
COPY . .

RUN npm run build

# Expose cổng 3000 (nếu app bạn lắng nghe ở port 3000)
EXPOSE 3000

# Chạy server bằng ts-node
CMD ["sh", "-c", "npm run db:push && npm run start"]
