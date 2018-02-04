import { createRender, renderHtml } from "./template";

//属性代理
export function defineProxy(lv, key, proxy) {
  Object.defineProperty(lv, key, {
    get() {
      return proxy[key];
    },
    set(value) {
      return (proxy[key] = value);
    }
  });
}

//响应系统核心
export function defineReactive(target, key) {
  var ob = new Observable(target[key]);
  recursiveObj(target[key], ob);
  Object.defineProperty(target, key, {
    get() {
      return ob.get();
    },
    set(value) {
      return ob.set(value);
    }
  });
  return ob;
}

//递归对象的所有属性，把它们再转换成observable
function recursiveObj(obj, ob) {
  if (Array.isArray(obj)) {
    arrReactive(obj, ob);
  } else if (typeof obj === "object") {
    Object.keys(obj).forEach(item => {
      defineReactive(obj, item);
    });
  }
}

var DepTarget = null; //被收集的watcher

let notifyStrategy = {
  //通知策略
  watch: function(func, args) {
    //多次修改时，考虑用户可能需要触发watch里面的钩子
    func.call(undefined, args);
  },
  computed: function(func, args) {
    //多次修改时，考虑用户可能需要触发computed里面的钩子
    func.call(undefined);
  },
  rendering: false,
  render: function(func, args) {
    if (!this.rendering) {
      //只用重新渲染diff一次就够了
      this.rendering = true;
      setTimeout(() => {
        func();
        this.rendering = false;
      }, 0);
    }
  }
};

function Observable(value) {
  this.value = value;
  this.dep = [];
  this.get = function() {
    if (DepTarget && filterRender(this.dep, DepTarget.type)) {
      this.dep.push(DepTarget);
    }
    return this.value;
  };
  this.set = function(value) {
    this.value = value;
    this.notify(value);
  };
  this.notify = function(value) {
    var deps = this.dep.slice();
    for (var i = 0, length = deps.length; i < length; i++) {
      let type = deps[i].type,
        func = deps[i].cb,
        args = value;
      notifyStrategy[type](func, args);
    }
  };
  function filterRender(dep, type) {
    //一个被观察者的观察者数组中，只需要一个render
    let bool = true;
    dep.some(item => {
      if (item.type === "render" && type === "render") {
        bool = false;
        return true;
      }
      return false;
    });
    return bool;
  }
}

export function Watcher(lv, watch, key) {
  DepTarget = {
    type: "watch",
    cb: watch[key]
  };
  lv.data[key];
  DepTarget = null;
}

export function Computed(lv, computed, key) {
  lv.data = lv.data || {};
  DepTarget = {
    type: "computed",
    cb: () => {
      lv.data[key] = computed[key]();
    }
  };
  lv.data[key] = computed[key]();
  DepTarget = null;
}

//数组响应式，其实就是代理数组的几个修改数组的方法
function arrReactive(arr, ob) {
  let arrProto = Object.create(Array.prototype);
  let arrMethods = [
    "push",
    "pop",
    "shift",
    "unshift",
    "splice",
    "sort",
    "reverse"
  ];
  let middleware = {};
  arrMethods.forEach(method => {
    middleware[method] = (...args) => {
      Array.prototype[method].apply(arr, args);
      ob.notify(args);
    };
  });
  middleware.__proto__ = arrProto;
  arr.__proto__ = middleware;
}

export function Render(lv, template, dom) {
  DepTarget = {
    type: "render",
    cb: renderHtml.bind(lv, dom, template)
  };
  DepTarget.cb();
  DepTarget = null;
}
