(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.mySingleSpa = {}));
}(this, (function (exports) { 'use strict';

  // 未加载
  const NOT_LOADED = "NOT_LOADED"; // 加载时参数校验未通过，或非致命错误

  const SKIP_BECAUSE_BROKEN = "SKIP_BECAUSE_BROKEN"; // 加载时遇到致命错误

  const LOAD_ERROR = "LOAD_ERROR"; // 加载app代码中

  const LOAD_RESOURCE_CODE = "LOAD_RESOURCE_CODE"; // 没有加载中断

  function notSkipped(app) {
    return app.status !== SKIP_BECAUSE_BROKEN;
  } // 没有加载错误

  function withoutLoadError(app) {
    return app.status !== LOAD_ERROR;
  } // 没有被加载过

  function isntLoaded(app) {
    return app.status === NOT_LOADED;
  } // 满足app.activityWhen()

  function shouldBeActive(app) {
    console.log(window.location, 'window.location');

    try {
      return app.activityWhen(window.location);
    } catch (e) {
      app.status = SKIP_BECAUSE_BROKEN;
    }
  }

  function start() {} // 判断系统是否已启动

  // 判断是否是一个Promise
  function smellLikeAPromise(promise) {
    if (promise instanceof Promise) {
      return true;
    } //   自己构造的


    return typeof promise === "object" && typeof promise.then === "function" && typeof promise.catch === "function";
  } // 判断生命周期是否合法

  function validateLifeCyclesFn() {
    if (typeof fn === "function") {
      return true;
    }

    if (Array.isArray(fn)) {
      return fn.filter(item => typeof item !== "function").length === 0;
    }

    return false;
  }
  function flattenLifecycleArray(fns, description) {
    if (!Array.isArray(fns)) {
      fns = [fns];
    }

    if (fns.length === 0) {
      fns = [() => Promise.resolve()];
    }

    return function (props) {
      return new Promise((resolve, reject) => {
        waitForPromises(0);

        function waitForPromises(index) {
          let fn = fns[index](props);

          if (!smellLikeAPromise(fn)) {
            reject(`${description} at index ${index} did not return a promise`);
            return;
          }

          fn.then(() => {
            if (index === fns.length - 1) {
              resolve();
            } else {
              waitForPromises(++index);
            }
          }).catch(e => {
            reject(e);
          });
        }
      });
    };
  }

  function toLoadPromise(app) {
    // 状态不满足需要被load
    if (app.status !== NOT_LOADED) {
      return Promise.resolve(app);
    }

    app.status = LOAD_RESOURCE_CODE;
    let loadPromise = app.loadFunction(); //   不是Promise 返回错误

    if (!smellLikeAPromise(loadPromise)) {
      return Promise.reject(new Error(""));
    }

    loadPromise.then(appConfig => {
      if (typeof appConfig !== "object") {
        throw new Error("");
      } //   生命周期 bootstrap mount unmount
      // 判断生命周期是否存在并且合法


      let errorMsg = [][("unmount")].forEach(lifecycle => {
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

  let loadAppsUnderway = false; // 标记循环的状态
  /**
   * 核心功能
   */

  function invoke() {
    if (loadAppsUnderway) {
      return new Promise((resolve, reject) => {
      });
    }

    loadAppsUnderway = true; // 判断系统是否启动

    {
      // 系统未启动 > 加载APPS
      loadApps();
    } // 加载APPS


    function loadApps() {
      // 获取需要被load的APP
      getAppsToLoad().map(toLoadPromise);
    }
  }

  const APPS = [];
  /**
   * 注册app
   * @param {string} appName 要注册的app名称
   * @param {Function<Promise> | Object} applicationOrLoadFunction app异步加载函数或者app内容
   * @param {Function<boolean>} activityWhen 判断app应该在何时被启动
   * @param {Object} customProps 自定义配置
   */

  function registerApplication(appName, applicationOrLoadFunction, activityWhen, customProps = {}) {
    // 参数判断
    if (!appName || typeof appName !== "string") {
      throw new Error("the app name must be a non-empty string");
    } // if (applicationOrLoadFunction().indexOf(appName) !== -1) {
    //   throw new Error("There is already an app declared with name " + appName);
    // }


    if (typeof customProps !== "object" || Array.isArray(customProps)) {
      throw new Error("the customProps must be a pure object");
    }

    if (!applicationOrLoadFunction) {
      throw new Error("the application or load function is required");
    }

    if (typeof activityWhen !== "function") {
      throw new Error("the activityWhen must be a function");
    } // 如果 applicationOrLoadFunction 不是函数（即对象），转成函数


    if (typeof applicationOrLoadFunction !== "function") {
      applicationOrLoadFunction = () => Promise.resolve(applicationOrLoadFunction);
    }

    APPS.push({
      name: appName,
      loadApp: applicationOrLoadFunction,
      activityWhen,
      customProps,
      status: NOT_LOADED,
      services: {}
    });
    invoke();
  }
  /**
   * 获取满足加载条件的app
   * 1、没有加载中断
   * 2、没有加载错误
   * 3、没有被加载过
   * 4、满足app.activityWhen()
   * @return {*[]}
   */

  function getAppsToLoad() {
    return APPS.filter(notSkipped).filter(withoutLoadError).filter(isntLoaded).filter(shouldBeActive);
  }

  exports.registerApplication = registerApplication;
  exports.start = start;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=my-single-spa.js.map
