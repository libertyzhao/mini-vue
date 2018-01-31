
export function createRender(template) {
  let reg = /{{[ \t]*([\w\W]*?)[ \t]*}}/g,
    result;
  let index = 0;
  while ((result = reg.exec(template))) {
    template = template.replace(result[0], "${lv." + result[1] + "}");
  }
  let render = new Function("lv", "return `" + template + "`");
  return render;
}

export function cleanHtml(template){
	var div = document.createElement('div');
	div.innerHTML = template.trim();
	return div.innerHTML;
}

export function createVnode(template){
	// var reg = //g
}

function Vnode(tagName, props, children) {
  this.tagName = tagName;
  this.props = props;
  this.children = children;
}
