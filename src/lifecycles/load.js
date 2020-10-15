import { NOT_LOADED, LOAD_RESOURCE_CODE, SKIP_BECAUSE_BROKEN } from "../application/app.helper";
import { smellLikeAPromise, validateLifeCyclesFn, flattenLifecycleArray } from "./helper";

export function toLoadPromise(app) {
  // 状态不满足需要被load
  if (app.status !== NOT_LOADED) {
    return Promise.resolve(app);
  }

  app.status = LOAD_RESOURCE_CODE;
  let loadPromise = app.loadFunction();

  //   不是Promise 返回错误
  if (!smellLikeAPromise(loadPromise)) {
    return Promise.reject(new Error(""));
  }

  loadPromise.then((appConfig) => {
    if (typeof appConfig !== "object") {
      throw new Error("");
    }

    //   生命周期 bootstrap mount unmount
    // 判断生命周期是否存在并且合法
    let errorMsg = [][("bootstrap", "mount", "unmount")].forEach((lifecycle) => {
      if (!validateLifeCyclesFn(appConfig[lifecycle])) {
        errorMsg.push(`app:${app.name} dost not export ${lifecycle} as a function or function array`);
      }
    });
    if (errorMsg.length) {
      app.status = SKIP_BECAUSE_BROKEN;
      return;
    }

    app.bootstrap = flattenLifecycleArray(appConfig.bootstrap);
    app.mount = flattenLifecycleArray(appConfig.mount);
    app.unmount = flattenLifecycleArray(appConfig.unmount);
  });
}
