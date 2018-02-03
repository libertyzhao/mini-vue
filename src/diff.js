import { createDom,childrenDom } from './template';
import { createVnode } from './htmlParse';

//保证每次diff之后，oldVnode永远是最新的
export function diff(oldVnode,Vnode){
	if(sameNode(oldVnode,Vnode)){
		patchVnode(oldVnode,Vnode);
	}else{
		const el = oldVnode.el;
		const parentEl = el.parentNode;
		createDom(Vnode);//生成新的dom
		if (parentEl !== null) {
			parentEl.insertBefore(Vnode.el,el.nextSibling)//插入新的dom
			parentEl.removeChild(el);//移除之前的dom
		}
	}
	return Vnode;
}

function sameNode(oldVnode,Vnode){
	return oldVnode && Vnode && oldVnode.tagName == Vnode.tagName;
}

function patchVnode(oldVnode,Vnode){
	if(Vnode.tagName === 'text' && oldVnode.tagName === 'text' ){
		if(Vnode.text !== oldVnode.text){
			oldVnode.el.textContent = Vnode.text;
			oldVnode.text = Vnode.text;
		}
	}else {
		if(oldVnode.attrString !== Vnode.attrString){			//需要替换props
			replaceAttr(oldVnode.el,Vnode.attrList);
			oldVnode.attrString = Vnode.attrString;
			oldVnode.attrList = Vnode.attrList;
		}
		// if (oldChildren && children) {
			diffChildren(oldVnode, Vnode);
		// }else if (children){
		// 	childrenDom(children,oldVnode.el);
		// 	oldVnode = Vnode;//创建一个新dom
		// }else if (oldChildren){
		// 	//移除之前dom
		// 	let parent = oldVnode.el.parentNode;
		// 	for(var i = 0,length = oldChildren.length ; i < length ;i++){
		// 		let el = null;
		// 		if(el = oldChildren[i].el){
		// 			parent.removeChild(el);
		// 		}
		// 	}
		// 	Vnode.children = [];
		// }
	}
}

function diffChildren(oldVnode,Vnode){
	let VnodeChildren = Vnode.children, oldVnodeChildren = oldVnode.children;
	const max = Math.max(VnodeChildren.length,oldVnodeChildren.length);
	for(var i = 0 ; i < max ; i++ ){
		let oNode = oldVnodeChildren[i];
		let node = VnodeChildren[i];

		if(!oNode){//说明新增了节点
			createDom(node);
			oldVnodeChildren[i] = node;
			oldVnode.el.appendChild(node.el);
		}else if(!node){//说明删除了节点
			oldVnode.el.removeChild(oldVnodeChildren[i].el);
			oldVnodeChildren.splice(i,1);
		}else{
			diff(oNode,node);
		}

	}
}

function replaceAttr(dom,attr){
	for(var i = 0, length = attr.length ; i < length ; i++){
		let keyValue = attr[i].split('=');
		dom.setAttribute(keyValue[0],keyValue[1]);
	}
}