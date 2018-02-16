import { parseHtml,cloneVnode } from "./htmlParse";
import { diff } from "./diff";
import { optimize } from "./directive";
import { domProxy } from "./eventloop";

export function createRender(lv, template) {
  lv.AstDomTree =lv.AstDomTree || parseHtml(template); //生成基础ast，此时data和l-if等标签和数据还没有解析
  let Vnode = cloneVnode(lv.AstDomTree);//创建副本，生成虚拟dom
  optimize(Vnode, lv); //进行data和l-if,l-for等标签的解析,生成vnode
  return Vnode;
}

//用来稍微规范一下html
export function cleanHtml(template) {
  var div = domProxy.createElement("div");
  div.innerHTML = template.trim();
  return div.innerHTML;
}

export function renderHtml(dom, template) {
  //在这里给一个template，带v-if那些，然后吐出一个ok的Vnode,所以l-if，l-for都被解析好了;
  let vnode = createRender(this, template);
  // console.log(vnode);
  if (!this.oldVnode) {//第一次页面渲染
    this.oldVnode = vnode;
    var fra = domProxy.createDocumentFragment();
    var elDom = createDom(vnode, fra);
    fra.appendChild(elDom);
    dom.appendChild(fra);
  } else {//以后只用diff比较差异
    this.newVnode = vnode;
    diff(this.oldVnode, this.newVnode);
  }
}

export function createDom(vnode) {
  var dom = null;
  if (vnode.tagName === "") {
    return;
  }
  if (vnode.tagName === "text") {
    dom = domProxy.createTextNode(vnode.text);
  } else if (vnode.tagName === "comment") {
    dom = domProxy.createComment(vnode.text);
  } else {
    dom = domProxy.createElement(vnode.tagName);
    childrenDom(vnode.children, dom);
  }
  vnode.el = dom;
  return dom;
}

export function childrenDom(children, dom) {
  if (children) {
    for (let i = 0, length = children.length; i < length; i++) {
      let eldom = null;
      if ((eldom = createDom(children[i], dom))) {
        dom.appendChild(eldom);
      }
    }
  }
}
