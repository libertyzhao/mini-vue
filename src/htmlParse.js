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
 */

var singleTag = 'br hr img input';

var startTagOpen = /<(\/)?([a-zA-Z]*)[^>\/]*(\/)?>/;
var attribute = /^\s*([^\s=]*)=(["'\w]*)/;
var startTagClose = /^\s*(\/?)>/;
var endTag = `<\/([a-zA-Z]*)[^>]*>`;

var target = null;
var nodeId = 1;

export function parseHtml(html, Vnode = createVnode()) {
  if (!html) {
    return Vnode;
  }
  var textLength = html.indexOf("<");
  if (textLength !== 0) {
    html = parseText(textLength, html, Vnode);
  } else {
    html = parseDom(html, Vnode);
  }
  parseHtml(html, target);
  return Vnode;
}

function parseText(textLength, html, Vnode) {
  if (textLength === -1) {
    textLength = 0;
  }
  var text = html.slice(0, textLength);
  Vnode.tagName = "text";
  Vnode.children = text;
  stackAdd(Vnode);
  return forward(html, text.length).trim();
}

function parseDom(html, Vnode) {
  var result = html.match(startTagOpen);
  if (result[0] == html) {
    return "";
  } else if (result[1]) {
    var index = Vnode.parent.parent.children.length;
    Vnode.parent.parent.children[index] = createVnode();
    target = Vnode.parent.parent.children[index];
    target.parent = Vnode.parent.parent;
    html = forward(html, result[0].length);
  } else {
    Vnode.tagName = result[2];
    if (!result[3] && !singleTag.includes(result[2])) {
      Vnode.children[0] = createVnode();
      target = Vnode.children[0];
      target.parent = Vnode;
    } else {
      stackAdd(Vnode);
    }
    html = forward(html, result[2].length + 1);
    html = parseProps(html, Vnode);
    html = parseEnd(html, Vnode).trim();
  }
  return html;
}

function stackAdd(Vnode) {
  var index = Vnode.parent.children.length;
  Vnode.parent.children[index] = createVnode();
  target = Vnode.parent.children[index];
  target.parent = Vnode.parent.children[0].parent;
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

function createVnode() {
  return {
    tagName: "",
    parent: null,
    attrList: [],
    children: [],
    attrString:'',
  };
}

function forward(temp, length) {
  return temp.slice(length);
}
