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
	if(!this.newVnode){
		this.newVnode = vnode;
		
	}else if(this.newVnode && this.oldVnode){
		this.newVnode = this.oldVnode;
		this.oldVnode = vnode;
		diff(this.oldVnode,this.newVnode);
	}else{
		this.oldVnode = vnode;
		diff(this.oldVnode,this.newVnode);
	}
	dom.innerHTML = html;
}
