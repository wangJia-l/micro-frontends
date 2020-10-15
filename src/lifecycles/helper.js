// 判断是否是一个Promise
export function smellLikeAPromise(promise) {
  if (promise instanceof Promise) {
    return true;
  }
  //   自己构造的
  return typeof promise === "object" && typeof promise.then === "function" && typeof promise.catch === "function";
}

// 判断生命周期是否合法
export function validateLifeCyclesFn() {
  if (typeof fn === "function") {
    return true;
  }
  if (Array.isArray(fn)) {
    return fn.filter((item) => typeof item !== "function").length === 0;
  }
  return false;
}

export function flattenLifecycleArray(fns, description) {
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
        }).catch((e) => {
          reject(e);
        });
      }
    });
  };
}
