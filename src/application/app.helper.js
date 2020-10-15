// 未加载
export const NOT_LOADED = "NOT_LOADED";
// 加载时参数校验未通过，或非致命错误
export const SKIP_BECAUSE_BROKEN = "SKIP_BECAUSE_BROKEN";
// 加载时遇到致命错误
export const LOAD_ERROR = "LOAD_ERROR";
// 加载app代码中
export const LOAD_RESOURCE_CODE = "LOAD_RESOURCE_CODE"

// 没有加载中断
export function notSkipped(app) {
  return app.status !== SKIP_BECAUSE_BROKEN;
}
// 没有加载错误
export function withoutLoadError(app) {
  return app.status !== LOAD_ERROR;
}
// 没有被加载过
export function isntLoaded(app) {
  return app.status === NOT_LOADED;
}
// 满足app.activityWhen()
export function shouldBeActive(app) {
    console.log(window.location, 'window.location')
  try {
    return app.activityWhen(window.location);
  } catch (e) {
    app.status = SKIP_BECAUSE_BROKEN;
  }
}
