import { NOT_LOADED } from "./app.helper";

const APPS = [];
/**
 * 注册app
 * @param {string} appName 要注册的app名称
 * @param {Function<Promise> | Object} applicationOrLoadFunction app异步加载函数或者app内容
 * @param {Function<boolean>} activityWhen 判断app应该在何时被启动
 * @param {Object} customProps 自定义配置
 */
export function registerApplication(appName, applicationOrLoadFunction, activityWhen, customProps = {}) {
  // 参数判断
  if (!appName || typeof appName !== "string") {
    throw new Error("the app name must be a non-empty string");
  }
  if (getAppNames().indexOf(appName) !== -1) {
    throw new Error("There is already an app declared with name " + appName);
  }
  if (typeof customProps !== "object" || Array.isArray(customProps)) {
    throw new Error("the customProps must be a pure object");
  }

  if (!applicationOrLoadFunction) {
    throw new Error("the application or load function is required");
  }

  if (typeof activityWhen !== "function") {
    throw new Error("the activityWhen must be a function");
  }

  // 如果 applicationOrLoadFunction 不是函数（即对象），转成函数
  if (typeof applicationOrLoadFunction !== "function") {
    applicationOrLoadFunction = () => Promise.resolve(applicationOrLoadFunction);
  }

  APPS.push({
    name: appName,
    loadApp: applicationOrLoadFunction,
    activityWhen,
    customProps,
    status: NOT_LOADED,
    services: {},
  });
}
