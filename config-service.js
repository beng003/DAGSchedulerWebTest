// 此脚本用于生成配置文件，会在服务器启动前运行
const fs = require("fs");
const path = require("path");

// 从环境变量获取配置，如果没有则使用默认值
const fileBaseUrl = process.env.FILE_BASE_URL || "127.0.0.1:9099";
const apiBaseUrl = process.env.API_BASE_URL || fileBaseUrl;
const pollInterval = process.env.POLL_INTERVAL || 2000;

// 创建配置对象
const config = {
  fileBaseUrl,
  apiBaseUrl,
  pollInterval: parseInt(pollInterval, 10),
};

// 生成配置文件内容
const configContent = `// 自动生成的配置文件，请勿手动修改
const appConfig = ${JSON.stringify(config, null, 2)};`;

// 写入配置文件
fs.writeFileSync(path.join(__dirname, "app-config.js"), configContent);
console.log("配置文件已生成:", config);
