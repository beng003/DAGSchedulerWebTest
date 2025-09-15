/**
 * LogWebSocket - 日志WebSocket模块
 * 负责与后端WebSocket服务建立连接并接收日志消息
 */

document.addEventListener("DOMContentLoaded", function () {
  // 获取DOM元素
  logWebSocket();
});

function logWebSocket() {
  // 获取DOM元素
  const logContainer = document.getElementById("logContainer");
  const statusIndicator = document.getElementById("statusIndicator");
  const statusText = document.getElementById("statusText");
  const connectionInfo = document.getElementById("connectionInfo");
  const clearBtn = document.getElementById("clearBtn");
  const searchInput = document.getElementById("searchInput");
  const showInfo = document.getElementById("showInfo");
  const showWarning = document.getElementById("showWarning");
  const showError = document.getElementById("showError");
  const showDebug = document.getElementById("showDebug");

  // 创建WebSocket连接
  const logWebSocket = new WebSocket("ws://" + appConfig.fileBaseUrl + "/logs/ws");
  console.log(
    "WebSocket连接尝试中...,地址：" + "ws://" + appConfig.fileBaseUrl + "/logs/ws"
  );

  // 连接建立时
  logWebSocket.onopen = function (event) {
    console.log("WebSocket连接已建立");
    statusIndicator.classList.add("connected");
    statusText.textContent = "已连接";
    connectionInfo.textContent =
      "已连接到 ws://" + appConfig.fileBaseUrl + "/logs/ws";

    // 可以定期发送心跳包保持连接
    setInterval(() => {
      if (logWebSocket.readyState === WebSocket.OPEN) {
        logWebSocket.send("ping");
      }
    }, 30000); // 每30秒发送一次
  };

  // 接收到消息时
  logWebSocket.onmessage = function (event) {
    const logMessage = event.data;
    displayLogInUI(logMessage);
  };

  // 连接关闭时
  logWebSocket.onclose = function (event) {
    console.log("WebSocket连接已关闭");
    statusIndicator.classList.remove("connected");
    statusText.textContent = "未连接";
    connectionInfo.textContent = "连接已关闭";

    // 可以在这里添加重连逻辑
    setTimeout(() => {
      console.log("尝试重新连接...");
      // 实际应用中这里应该是重新创建WebSocket连接
    }, 5000);
  };

  // 发生错误时
  logWebSocket.onerror = function (error) {
    console.error("WebSocket错误:", error);
    statusText.textContent = "连接错误";
    connectionInfo.textContent = "连接发生错误";
  };

  // 显示日志到UI
  function displayLogInUI(message) {
    // 检查日志是否符合当前过滤条件
    if (!isLogVisible(message)) {
      return;
    }

    const logElement = document.createElement("div");
    logElement.classList.add("log-entry");

    // 添加时间戳
    // const timestamp = new Date().toLocaleTimeString();
    // const timeSpan = document.createElement("span");
    // timeSpan.classList.add("timestamp");
    // timeSpan.textContent = `[${timestamp}]`;
    // logElement.appendChild(timeSpan);

    const ansiConverter = new AnsiUp();
    // 将 ANSI 文本转换为 HTML，保留颜色信息
    const coloredHtml = ansiConverter.ansi_to_html(message);

    // 添加html日志内容
    const logContent = document.createElement("div");
    logContent.innerHTML = coloredHtml;
    logElement.appendChild(logContent);

    // 根据日志级别添加样式
    if (message.includes("CRITICAL")) {
      logElement.classList.add("log-critical");
    } else if (message.includes("ERROR")) {
      logElement.classList.add("log-error");
    } else if (message.includes("WARNING")) {
      logElement.classList.add("log-warning");
    } else if (message.includes("DEBUG")) {
      logElement.classList.add("log-debug");
    } else {
      logElement.classList.add("log-info");
    }

    // 添加到日志容器
    logContainer.appendChild(logElement);

    // 自动滚动到底部
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  // 检查日志是否应该显示
  function isLogVisible(message) {
    // 搜索过滤
    const searchText = searchInput.value.toLowerCase();
    if (searchText && !message.toLowerCase().includes(searchText)) {
      return false;
    }

    // 日志级别过滤
    if (message.includes("INFO") && !showInfo.checked) {
      return false;
    }
    if (message.includes("WARNING") && !showWarning.checked) {
      return false;
    }
    if (message.includes("ERROR") && !showError.checked) {
      return false;
    }
    if (message.includes("DEBUG") && !showDebug.checked) {
      return false;
    }

    return true;
  }

  // 清空日志按钮事件
  clearBtn.addEventListener("click", function () {
    logContainer.innerHTML = "";
  });

  // 搜索输入框事件
  searchInput.addEventListener("input", function () {
    filterLogs();
  });

  // 复选框事件
  showInfo.addEventListener("change", filterLogs);
  showWarning.addEventListener("change", filterLogs);
  showError.addEventListener("change", filterLogs);
  showDebug.addEventListener("change", filterLogs);

  // 过滤日志函数
  function filterLogs() {
    const allLogs = logContainer.getElementsByClassName("log-entry");
    for (let log of allLogs) {
      const logText = log.textContent;
      if (isLogVisible(logText)) {
        log.style.display = "block";
      } else {
        log.style.display = "none";
      }
    }
  }

  // 添加一些示例日志（在实际应用中应删除）
  setTimeout(() => {
    if (
      logContainer.children.length === 1 &&
      logContainer.children[0].textContent.includes("等待日志数据")
    ) {
      const sampleLogs = [
        "[INFO] 应用程序已启动，等待初始化...",
        "[WARNING] 配置文件中缺少可选参数，使用默认值",
        "[DEBUG] 加载模块: user-auth, 耗时 45ms",
        "[INFO] 数据库连接成功建立",
        "[ERROR] 无法连接到外部API: https://api.example.com/data",
        "[CRITICAL] 主服务进程异常退出，尝试重启...",
        "[INFO] 服务重启成功，运行正常",
      ];

      logContainer.innerHTML = "";

      sampleLogs.forEach((log) => {
        displayLogInUI(log);
      });
    }
  }, 2000);
}
