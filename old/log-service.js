/**
 * LogService - 日志服务模块
 * 负责处理文件内容的获取、显示和自动滚动功能
 */



// 加载默认文件函数
function loadDefaultFile() {
  initScrollbarFunctionality(); // 初始化滚动条功能
  // 清除之前的轮询
  if (config.pollTimer) {
    clearTimeout(config.pollTimer);
    config.pollTimer = null;
  }

  $("#fileContent").html(
    '<p style="text-align: center; padding: 20px;">加载中...</p>'
  );

  // 开始加载文件内容
  fetchFileContent();
}

/**
 * 初始化滚动条功能
 * 包括自动滚动、滚动位置保存和恢复
 */
function initScrollbarFunctionality() {
  // 初始化自动滚动复选框事件
  $("#autoScroll").change(function () {
    if (this.checked && config.currentFile) {
      scrollToBottom();
    }
  });

  // 监听内容区域的滚动事件，并防抖
  $("#fileContent").on("scroll", function () {
    // 如果开启了自动滚动，则不保存位置
    if ($("#autoScroll").is(":checked")) return;

    clearTimeout(config.scrollSaveTimer);
    config.scrollSaveTimer = setTimeout(function () {
      // 保存滚动位置到sessionStorage
      sessionStorage.setItem(
        "fileContentScrollPosition",
        $("#fileContent").scrollTop()
      );
    }, 150); // 150毫秒的防抖间隔
  });

  // 页面加载时，尝试从sessionStorage读取并恢复滚动位置
  const savedPosition = sessionStorage.getItem("fileContentScrollPosition");
  if (savedPosition !== null) {
    // 稍作延迟以确保DOM已渲染
    setTimeout(function () {
      $("#fileContent").scrollTop(parseInt(savedPosition, 10));
    }, 100);
  }
}


/**
 * 获取文件内容
 * 从指定的URL获取文件内容并处理，包括内容更新检测、滚动位置保存和恢复
 */
function fetchFileContent() {
  // 如果当前没有要加载的文件，则直接返回
  if (!config.currentFile) return;

  // 构建完整的文件URL路径
  const url = config.fileBaseUrl + config.currentFile;
  console.log("访问地址:", url);

  // 发送AJAX请求获取文件内容
  $.ajax({
    url: url,
    type: "GET",
    dataType: "text",
    success: function (data) {
      // 检查内容是否有更新
      if (data !== config.lastContent) {
        // 更新保存的最后内容
        config.lastContent = data;

        // 检查是否启用了自动滚动
        const shouldAutoScroll = $("#autoScroll").is(":checked");

        // 主要逻辑：只在需要时保存和恢复滚动位置
        let previousScrollTop = null;
        if (!shouldAutoScroll) {
          // 1. 在更新内容前，保存当前的滚动位置
          previousScrollTop = $("#fileContent").scrollTop();
          // 同时也从sessionStorage读取一次，确保是最新的用户操作
          const savedPos = sessionStorage.getItem("fileContentScrollPosition");
          if (savedPos !== null) {
            previousScrollTop = Math.max(
              previousScrollTop,
              parseInt(savedPos, 10)
            );
          }
        }

        // 更新内容显示
        displayContent(data);

        // 根据自动滚动设置决定是否滚动到底部
        if (shouldAutoScroll) {
          setTimeout(scrollToBottom, 50);
        } else if (previousScrollTop !== null) {
          // 2. 内容更新后，恢复滚动位置
          // 使用requestAnimationFrame确保在浏览器重绘前执行
          requestAnimationFrame(function () {
            $("#fileContent").scrollTop(previousScrollTop);
          });
        }
      }

      // 更新最后更新时间显示
      $("#lastUpdated").text("最后更新: " + new Date().toLocaleTimeString());

      // 设置下一次轮询，实现文件内容自动刷新
      config.pollTimer = setTimeout(fetchFileContent, config.pollInterval);
    },
    error: function (xhr, status, error) {
      // 显示加载失败信息
      $("#fileContent").html(`
                        <p style="color: #e74c3c; text-align: center; padding: 20px;">
                            加载文件失败: ${error || "未知错误"}
                        </p>
                    `);

      // 设置下一次轮询（即使出错也继续尝试）
      config.pollTimer = setTimeout(fetchFileContent, config.pollInterval);
    },
  });
}

/**
 * 显示文件内容
 * @param {string} content - 要显示的文件内容文本
 * 处理内容显示逻辑，包括空文件检查、ANSI颜色代码转换和高亮效果
 */
function displayContent(content) {
  const $content = $("#fileContent");

  // 更新内容
  if (content.trim() === "") {
    // 显示空文件提示
    $content.html(
      '<p style="color: #7f8c8d; text-align: center; padding: 40px;">文件为空</p>'
    );
  } else {
    // 修复：使用converter将ANSI颜色代码转换为HTML
    // 创建 ansi_up 实例
    const ansiConverter = new AnsiUp();
    // 将 ANSI 文本转换为 HTML，保留颜色信息
    const coloredHtml = ansiConverter.ansi_to_html(content);
    // 更新内容区域的HTML
    $content.html(coloredHtml);

    // 添加内容更新高亮效果，提升用户体验
    $content.addClass("highlight");
    setTimeout(() => {
      $content.removeClass("highlight");
    }, 1000);
  }

  // 如果自动滚动已勾选，则滚动到底部
  if ($("#autoScroll").is(":checked")) {
    // 给一点延迟确保DOM已更新
    setTimeout(scrollToBottom, 50);
  }
}

/**
 * 滚动到底部
 * 将文件内容区域滚动到最底部，用于自动滚动功能
 */
function scrollToBottom() {
  const $content = $("#fileContent");
  // 设置滚动位置到内容的最大高度，即滚动到底部
  $content.scrollTop($content[0].scrollHeight);
}
