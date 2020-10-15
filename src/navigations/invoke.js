import { isStarted } from "../start";
import { getAppsToLoad } from "../application/apps";
import { toLoadPromise } from "../lifecycles/load";

let loadAppsUnderway = false; // 标记循环的状态
let changesQueue = [];

/**
 * 核心功能
 */
export function invoke() {
  if (loadAppsUnderway) {
    return new Promise((resolve, reject) => {
      changesQueue.push({
        success: resolve,
        failure: reject,
      });
    });
  }
  loadAppsUnderway = true;

  // 判断系统是否启动
  if (isStarted()) {
    // 系统已经启动 > 启动APPS
  } else {
    // 系统未启动 > 加载APPS
    loadApps();
  }

  // 加载APPS
  function loadApps() {
    // 获取需要被load的APP
    getAppsToLoad().map(toLoadPromise);
  }
}
