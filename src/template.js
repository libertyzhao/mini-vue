import { parseHtml } from './htmlParse';
import { diff } from './diff';
import { optimize } from './directive';

export function createRender(lv,template) {
	let Vnode = parseHtml(template);//生成基础虚拟dom，此时data和l-if等标签和数据还没有解析
	optimize(Vnode,lv);//进行data和l-if,l-for等标签的解析
	return Vnode;
}

export function cleanHtml(template){
	var div = document.createElement('div');
	div.innerHTML = template.trim();
	return div.innerHTML;
}

export function renderHtml(dom,template){
	//在这里给一个template，带v-if那些，然后吐出一个ok的Vnode;
	let vnode = createRender(this,template);
	// let html = render(this);
	// let vnode = parseHtml(html);
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

export function createDom(vnode){
	var dom = null;
	if(vnode.tagName === ''){
		return ;
	}if(vnode.tagName === 'text'){
		dom = document.createTextNode(vnode.text);
	}else if(vnode.tagName === 'comment'){
		dom = document.createComment(vnode.text)
	}else{
		dom = document.createElement(vnode.tagName);
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

