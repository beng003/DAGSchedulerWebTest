// API服务模块 - 负责与后端API交互

// 初始化函数
$(document).ready(function () {
  initApiButtons(); // 添加API请求相关代码
});

/**
 * 初始化API按钮事件
 */
function initApiButtons() {
  // 获取任务列表按钮
  $("#btnGetTaskList").click(function () {
    getTaskList();
  });

  // 添加任务按钮
  $("#btnAddTask").click(function () {
    // 触发隐藏的文件输入框
    $("#taskFileInput").click();
  });

  // 文件选择事件处理
  $("#taskFileInput").change(function (e) {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    // 检查文件类型
    const fileName = file.name.toLowerCase();
    const fileReader = new FileReader();

    fileReader.onload = function (e) {
      try {
        let taskData;
        const content = e.target.result;

        if (fileName.endsWith(".json")) {
          // JSON文件解析
          taskData = JSON.parse(content);
        } else if (fileName.endsWith(".yaml") || fileName.endsWith(".yml")) {
          // YAML文件解析，使用引入的js-yaml库
          taskData = jsyaml.load(content);
        } else {
          throw new Error("不支持的文件类型，请选择JSON或YAML文件");
        }

        // 调用添加任务的函数
        addTask(taskData);
        // 清空文件输入，以便可以重复选择同一个文件
        $("#taskFileInput").val("");
      } catch (error) {
        console.error("文件解析错误:", error);
        alert("文件解析失败：" + error.message);
        // 清空文件输入
        $("#taskFileInput").val("");
      }
    };

    // 读取文件内容
    fileReader.readAsText(file, "utf-8");
  });

  // 启动任务按钮
  $("#btnStartTask").click(function () {
    const taskUid = prompt("请输入要启动的任务ID:");
    if (taskUid) {
      startTask(taskUid);
    }
  });

  // 停止任务按钮
  $("#btnStopTask").click(function () {
    const taskUid = prompt("请输入要停止的任务ID:");
    if (taskUid) {
      stopTask(taskUid);
    }
  });
}

/**
 * 获取任务列表
 */
function getTaskList() {
  // 注意：后端API的根路径配置
  const baseUrl = getApiBaseUrl();
  const url = baseUrl + "/scheduler/task/list";

  //   showLoading();

  $.ajax({
    url: url,
    type: "GET",
    dataType: "json",
    success: function (response) {
      displayApiResponse("获取任务列表成功", response);
    },
    error: function (xhr, status, error) {
      displayApiResponse("获取任务列表失败", {
        error: error || "未知错误",
        status: xhr.status,
      });
    },
    complete: function () {
      hideLoading();
    },
  });
}

/**
 * 添加任务
 * @param {object} taskData - 任务数据对象
 */
function addTask(taskData) {
  const baseUrl = getApiBaseUrl();
  const url = baseUrl + "/scheduler/task/add";

  // showLoading();

  $.ajax({
    url: url,
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(taskData),
    success: function (response) {
      displayApiResponse("添加任务成功", response);
    },
    error: function (xhr, status, error) {
      displayApiResponse("添加任务失败", {
        error: error || "未知错误",
        status: xhr.status,
      });
    },
    complete: function () {
      hideLoading();
    },
  });
}

/**
 * 启动任务
 * @param {string} taskUid - 任务唯一标识
 */
function startTask(taskUid) {
  const baseUrl = getApiBaseUrl();
  const url =
    baseUrl + `/scheduler/task/start?task_uid=${encodeURIComponent(taskUid)}`;

  //   showLoading();

  $.ajax({
    url: url,
    type: "POST",
    dataType: "json",
    // success: function (response) {
    //   displayApiResponse("启动任务成功", response);
    // },
    // error: function (xhr, status, error) {
    //   displayApiResponse("启动任务失败", {
    //     error: error || "未知错误",
    //     status: xhr.status,
    //   });
    // },
    // complete: function () {
    //   hideLoading();
    // },
  });
}

/**
 * 停止任务
 * @param {string} taskUid - 任务唯一标识
 */
function stopTask(taskUid) {
  const baseUrl = getApiBaseUrl();
  const url =
    baseUrl + `/scheduler/task/stop?task_uid=${encodeURIComponent(taskUid)}`;

  //   showLoading();

  $.ajax({
    url: url,
    type: "POST",
    dataType: "json",
    // success: function (response) {
    //   displayApiResponse("停止任务成功", response);
    // },
    // error: function (xhr, status, error) {
    //   displayApiResponse("停止任务失败", {
    //     error: error || "未知错误",
    //     status: xhr.status,
    //   });
    // },
    // complete: function () {
    //   hideLoading();
    // },
  });
}

/**
 * 获取API基础URL
 * @returns {string} API基础URL
 */
function getApiBaseUrl() {
  // 从全局配置中获取，而不是硬编码
  console.log(appConfig);
  return config.fileBaseUrl;
}

/**
 * 显示加载状态
 */
function showLoading() {
  const $content = $("#fileContent");
  $content.html(
    '<p style="text-align: center; padding: 20px;">请求处理中...</p>'
  );
}

/**
 * 隐藏加载状态
 * 此函数可以留空，因为响应显示会覆盖加载状态
 */
function hideLoading() {
  // 此函数可以留空，因为响应显示会覆盖加载状态
}

/**
 * HTML转义函数
 * @param {string} text - 需要转义的文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}

/**
 * 显示API响应结果
 * @param {string} title - 响应标题
 * @param {object} response - 响应数据
 */
function displayApiResponse(title, response) {
  // // 判断响应是否成功（这里假设response中包含success字段或状态码来判断成功失败）
  // const isSuccess =
  //   response && (response.success === true || response.code === 200);
  // // 显示弹窗提示
  // if (isSuccess) {
  //   alert(title + " 成功");
  // } else {
  //   alert(title + " 失败");
  // }
}
