import { domProxy } from "./domApiProxy";

let list = ["appendChild", "removeChild", "insertBefore", "setTextContent"];

export function eventloop(domProxy, whiteList) {
  let apiProxy = {},
    keys = Object.keys(domProxy);
  var event = {
    stack: [],
    loopFunc: whiteList || keys, //可以放入eventloop中的白名单
    run() {
      event.stack.forEach(func => {
        func();
      });
      event.stack.length = 0;
    }
  };

  keys.forEach(key => {
    let func = domProxy[key];
    apiProxy[key] = (...args) => {
      let returnData = null;
      if (event.loopFunc.includes(key) && event.stack.length <= 0) {
        setTimeout(() => {
          whiteList && console.log("eventloop末尾一波更新");
          event.run();
        }, 0);
      }
      if (event.loopFunc.includes(key)) {
        event.stack.push(() => {
          func.apply(domProxy, args);
        });
      } else {
        returnData = func.apply(domProxy, args);
      }
      return returnData;
    };
  });
  return apiProxy;
}

let apiProxy = eventloop(domProxy, list);

export { apiProxy as domProxy };
