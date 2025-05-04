FROM node:18-alpine as builder

WORKDIR /app

# 复制package文件
COPY package*.json ./
# 复制源代码和配置文件
COPY tsconfig.json ./
COPY src/ ./src/

# 安装依赖并构建应用
RUN npm install
RUN npm run build

# 运行时阶段
FROM node:18-alpine

WORKDIR /app

# 复制package文件和构建产物
COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY bin/ ./bin/

# 只安装生产依赖
RUN npm ci --only=production

# 设置环境变量
ENV NODE_ENV=production

# 暴露端口（如果需要）
# EXPOSE 3000

# 启动应用
CMD ["node", "dist/server.js"] 