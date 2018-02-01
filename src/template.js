import { parseHtml } from './htmlParse';
import { diff } from './diff';

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

export function renderHtml(dom,render){
	let html = render(this);
	let vnode = parseHtml(html);
	console.log(vnode);
	if(!this.oldVnode){
		this.oldVnode = vnode;
		var fra = document.createDocumentFragment();
		var elDom = createDom(vnode,fra);
		fra.appendChild(elDom);
		dom.appendChild(fra)
	}else{
		this.newVnode = vnode;
		diff(this.oldVnode,this.newVnode);
	}
}

export function createDom(vnode,fra){
	if(vnode.tagName === ''){
		return ;
	}if(vnode.tagName === 'text'){
		var dom = document.createTextNode(vnode.children);
	}else{
		var dom = document.createElement(vnode.tagName);
		childrenDom(vnode.children,dom);
	}
	vnode.el = dom;
	return dom;
}

export function childrenDom(children,dom){
	if(children){
		for(let i = 0, length = children.length ; i < length ; i++){
			let eldom = null;
			if(eldom = createDom(children[i],dom)){
				dom.appendChild(eldom);
			}
		}
	}
}

