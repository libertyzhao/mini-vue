import { createDom, childrenDom } from "./template";
import { createVnode } from "./htmlParse";
import { domProxy } from "./eventloop";

//保证每次diff之后，oldVnode永远是最新的
export function diff(oldVnode, Vnode, parent, index) {
  if (sameNode(oldVnode, Vnode)) {
    patchVnode(oldVnode, Vnode);
  } else {
    const el = oldVnode.el;
    const parentEl = domProxy.parentNode(el);
    createDom(Vnode); //生成新的dom
    if (parentEl !== null) {
      domProxy.insertBefore(parentEl, Vnode.el, domProxy.nextSibling(el)); //插入新的dom
      domProxy.removeChild(parentEl, el); //移除之前的dom
      if (parent) {
        parent[index] = Vnode;
      }
    }
  }
  return Vnode;
}

function sameNode(oldVnode, Vnode) {
  return oldVnode && Vnode && oldVnode.tagName == Vnode.tagName;
}

function patchVnode(oldVnode, Vnode) {
  if (Vnode.tagName === "text" && oldVnode.tagName === "text") {
    if (Vnode.text !== oldVnode.text) {
      domProxy.setTextContent(oldVnode.el, Vnode.text);
      oldVnode.text = Vnode.text;
    }
  } else {
    Vnode.el = oldVnode.el;
    if (oldVnode.attrString !== Vnode.attrString) {
      //需要替换props
      replaceAttr(oldVnode.el, Vnode.attrList);
      oldVnode.attrString = Vnode.attrString;
      oldVnode.attrList = Vnode.attrList;
    }
    diffChildren(oldVnode, Vnode);
  }
}

function diffChildren(oldVnode, Vnode) {
  let VnodeChildren = Vnode.children,
    oldVnodeChildren = oldVnode.children;
  const max = Math.max(VnodeChildren.length, oldVnodeChildren.length);
  for (var i = 0; i < max; i++) {
    let oNode = oldVnodeChildren[i];
    let node = VnodeChildren[i];

    if (!oNode) {
      //说明新增了节点
      createDom(node);
      oldVnodeChildren[i] = node;
      domProxy.appendChild(oldVnode.el, node.el);
    } else if (!node) {
      //说明删除了节点
      domProxy.removeChild(oldVnode.el, oldVnodeChildren[i].el);
      oldVnodeChildren.splice(i, 1);
    } else {
      node = diff(oNode, node, oldVnodeChildren, i);
    }
  }
}

function replaceAttr(dom, attr) {
  for (var i = 0, length = attr.length; i < length; i++) {
    let keyValue = attr[i].split("=");
    dom.setAttribute(keyValue[0], keyValue[1]);
  }
}
