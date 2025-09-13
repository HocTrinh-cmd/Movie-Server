FROM node:18

# Thư mục làm việc trong container
WORKDIR /app

# Copy package.json trước để cache dependency
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ code vào container
COPY . .

# Expose cổng 3000 (nếu app bạn lắng nghe ở port 3000)
EXPOSE 6122

# Chạy server bằng ts-node
CMD ["npm", "start"]
