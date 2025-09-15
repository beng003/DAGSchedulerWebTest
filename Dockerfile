# 使用Node.js 18作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json到工作目录
COPY package*.json ./

# 安装项目依赖
RUN npm install --production

# 复制项目的所有文件到工作目录
COPY . .

# 确保index.html文件存在
RUN if [ ! -f /app/index.html ]; then echo "Error: index.html file not found" && exit 1; fi

# 关键修改：在构建镜像时就删除app-config.js，确保容器启动时重新生成
RUN rm -f /app/app-config.js

# 暴露端口（使用package.json中指定的8081端口）
EXPOSE 8081

# 设置环境变量
ENV NODE_ENV=production

# 使用http-server启动服务，替代live-server（更适合生产环境）
CMD ["npm", "start"]