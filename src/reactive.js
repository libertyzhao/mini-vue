import { createRender, renderHtml } from "./template";

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

let notifyStrategy = {//通知策略
  'watch':function(func,args){
    func.apply(undefined,args);
  },
  'computed':function(func,args){
    func.call(undefined);
  },
  rendering:false,
  'render':function(func,args){
    if(!this.rendering){
      this.rendering = true;
      setTimeout(() => {
        func();
        this.rendering = false;
      }, 0);
    }
  }
}

function Observable(value) {
  this.value = value;
  this.dep = [];
  this.get = function() {
    if (DepTarget) {
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
      notifyStrategy[type](func,args);
    }
  };
}

export function Watcher(lv, watch, key) {
  DepTarget = {
    type:'watch',
    cb:watch[key],
  };
  lv.data[key];
  DepTarget = null;
}

export function Computed(lv, computed, key) {
  lv.data = lv.data || {};
  DepTarget = {
    type:'computed',
    cb:() => {
      lv.data[key] = computed[key]();
    }
  };
  lv.data[key] = computed[key]();
  DepTarget = null;
}

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
      ob.notify(arr);
    };
  });
  middleware.__proto__ = arrProto;
  arr.__proto__ = middleware;
}

export function Render(lv, template, htmlAst) {
	let dom = document.querySelector(lv.el);
  let render = createRender(template);
  DepTarget = {
    type:'render',
    cb:renderHtml.bind(lv,dom,render),
  };
  DepTarget.cb();
	DepTarget = null;
}

