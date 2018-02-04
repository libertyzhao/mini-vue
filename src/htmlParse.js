/**
 * 从上往下遍历节点
 * 
 * <div class="a" data-abc="123">
      <input type="text" >
      <span>{{a.c}}</span>
      {{b}}{{arr[0]}}
    </div>

      <input type="text" >
      <span>{{a.c}}</span>
      {{b}}{{arr[0]}}
    </div>

    <span>{{a.c}}</span>
      {{b}}{{arr[0]}}
    </div>
    ...
    一直根据当前html解析出来的节点和当前的空vnode来处理，vnode有parent
 */

var singleTag = "br hr img input";

var startTagOpen = /<(\/)?([a-zA-Z]*)[^>\/]*(\/)?>/;
var attribute = /^\s*([^\s=]*)=(["'\w\s(),]*"|')/; //考虑兼容l-for指令的一些情况
var startTagClose = /^\s*(\/?)>/;
var endTag = `<\/([a-zA-Z]*)[^>]*>`;

export function parseHtml(html, Vnode = createVnode()) {
  if (!html) {
    return Vnode;
  }
  let textLength = html.indexOf("<"),
    data = null;
  if (textLength !== 0) {
    data = parseText(textLength, html, Vnode);
  } else {
    data = parseDom(html, Vnode);
  }
  parseHtml(data.html.trim(), data.target);
  return Vnode;
}

function parseText(textLength, html, Vnode) {
  if (textLength === -1) {
    textLength = 0;
  }
  var text = html.slice(0, textLength);
  Vnode.tagName = "text";
  Vnode.text = text;
  return {
    html: forward(html, text.length).trim(),
    target: stackAdd(Vnode)
  };
}

function parseDom(html, Vnode) {
  var result = html.match(startTagOpen),
    target = null;
  if (result[0] == html) {
    //整个html解析结束
    Vnode.parent.children.pop(); //删除当前无用节点
    return { html: "" };
  } else if (result[1]) {
    //如果是结束标签</div>，则当前的vnode一定是div标签的子元素
    var parent = Vnode.parent.parent, //拿到div标签的父元素，给div设置下一个兄弟元素
      children = parent.children,
      index = children.length;
    Vnode.parent.children.pop(); //删除当前无用节点
    children[index] = createVnode();
    target = children[index];
    target.parent = parent;
    html = forward(html, result[0].length);
  } else {
    //如果不是结束标签
    Vnode.tagName = result[2];
    var reg = new RegExp(`\\b${result[2]}\\b`);
    if (!result[3] && !singleTag.match(reg)) {
      //如果不是类似input之类的单闭合标签
      Vnode.children[0] = createVnode();
      target = Vnode.children[0];
      target.parent = Vnode;
    } else {
      //如果是单闭合标签
      target = stackAdd(Vnode);
    }
    html = forward(html, result[2].length + 1);
    html = parseProps(html, Vnode);
    html = parseEnd(html, Vnode);
  }
  return {
    html,
    target
  };
}

function stackAdd(Vnode) {
  var children = Vnode.parent.children,
    index = children.length,
    target = null;
  children[index] = createVnode();
  target = children[index];
  target.parent = children[0].parent;
  return target;
}

function parseProps(html, Vnode) {
  var result = null;
  while ((result = html.match(attribute))) {
    Vnode.attrList.push(result[0]);
    Vnode.attrString += result[0];
    html = forward(html, result[0].length);
  }
  return html;
}

function parseEnd(html, Vnode) {
  var result = html.match(startTagClose);
  html = forward(html, result[0].length);
  return html;
}

export function createVnode() {
  return {
    attrList: [],
    attrString: "",
    children: [],
    parent: null,
    tagName: "",
    text: ""
  };
}

export function cloneVnode(Vnode) {
  let node = createVnode();
  node.attrString = Vnode.attrString;
  node.attrList = Vnode.attrList.concat();
  node.parent = Vnode.parent;
  node.tagName = Vnode.tagName;
  node.text = Vnode.text;
  cloneChildren(Vnode.children, node);
  return node;
}

function cloneChildren(children, node) {
  let nodeChildren = node.children;
  children.forEach(item => {
    nodeChildren.push(cloneVnode(item));
  });
}

function forward(temp, length) {
  return temp.slice(length);
}
