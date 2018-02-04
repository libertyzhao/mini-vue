import { cloneVnode } from "./htmlParse";
import { findIndex } from "./util";
import { eventloop } from "./eventloop";
import { domProxy } from "./domApiProxy";

let domProxyDelay = eventloop(domProxy);

export function optimize(Vnode, lv) {
  let attr = Vnode.attrList;
  parseDirective(attr, Vnode.parent, Vnode, lv);
  parseData(Vnode, lv);
  dfsChildren(Vnode, lv);
}

function dfsChildren(Vnode, lv) {
  let children = Vnode.children,
    length = children.length;
  if (length > 0 && Array.isArray(children)) {
    //如果节点中含有指令，那么该节点的所有子节点的遍历和处理由该指令自行解决
    for (var i = 0; i < children.length; i++) {
      if (!children[i].directive) {
        optimize(children[i], lv);
      }
    }
  }
}

export function parseDirective(attr, parent, vnode, lv) {
  for (let i = 0, length = attr.length; i < length; i++) {
    if (attr[i].includes("l-for")) {
      lFor(attr[i], parent, vnode, lv);
    }
    if (attr[i].includes("l-if")) {
      lIf(attr[i], parent, vnode, lv);
    }
    if (attr[i].includes("l-on")) {
      lOn(attr[i], parent, vnode, lv);
    }
    if (attr[i].includes("l-model")) {
      lModel(attr[i], parent, vnode, lv);
    }
  }
}

function parseData(vnode, lv) {
  if (vnode.tagName === "text") {
    let data = injectData(vnode.text);
    vnode.text = data(lv);
  }
}

function injectData(template) {
  //这里只添加最后的数据
  let reg = /{{[ \t]*([\w\W]*?)[ \t]*}}/g,
    result,
    index = 0;
  while ((result = reg.exec(template))) {
    template = template.replace(result[0], "${lv." + result[1] + "}");
  }
  let render = new Function("lv", "return `" + template + "`");
  return render;
}

function lIf(attr, parent, vnode, lv) {
  // 条件渲染
  let attrArr = attr.split("="),
    val = attrArr[1],
    { value } = getDirectiveValue(val, lv);
  value = JSON.parse(value);
  if (!value) {
    vnode.directive = true;
    vnode.text = vnode.tagName;
    vnode.tagName = "comment";
    vnode.children = [];
  }
}

function lOn(attr, parent, vnode, lv) {
  // 事件绑定
  let attrArr = attr.split("="),
    key = attrArr[0],
    val = attrArr[1],
    { result } = getDirectiveValue(val, lv),
    event = key.split("on")[1];
  domProxyDelay.deady(() => {
    domProxy.addEventListener(vnode.el, event, lv[result[result.length - 1]]);
  });
}

function lModel(attr, parent, vnode, lv) {
  // input标签之类的双向绑定
  let attrArr = attr.split("="),
    val = attrArr[1],
    { value, result } = getDirectiveValue(val, lv);
  val = val.replace(/"/g, "");
  domProxyDelay.deady(() => {
    domProxy.setValue(vnode.el, value);
    domProxy.addEventListener(vnode.el, "input", e => {
      lv[val] = e.target.value;
    });
  });
}

function lFor(attr, parent, vnode, lv) {
  // 列表循环
  let attrArr = attr.split("="),
    val = attrArr[1],
    { value, result } = getDirectiveValue(val, lv),
    arr = value.split(","),
    item = result[0],
    index = "index";
  if (result.length > 3) {
    index = result[1];
  }
  let node, nodeIndex;
  for (var i = 0, length = arr.length; i < length; i++) {
    if (i < length - 1) {
      node = cloneVnode(vnode);
      nodeIndex = findIndex(parent.children, vnode);
      parent.children.splice(nodeIndex + 1, 0, node);
    }
    lv[item] = arr[i];
    lv[index] = i;
    dfsChildren(vnode, lv);
    vnode.directive = true;
    vnode = node;
  }
}

function getDirectiveValue(val, lv) {
  let reg = /([^"'(),\s=]+)/g,
    result = val.match(reg),
    value = injectData(`{{${result[result.length - 1]}}}`)(lv);
  return { value, result };
}

function filterEmpty(Vnode) {
  if (Vnode.tagName === "") {
    let children = Vnode.parent.children;
    let nodeIndex = findIndex(children, Vnode);
    children.splice(nodeIndex, 1);
  }
}
