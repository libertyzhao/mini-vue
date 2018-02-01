import { createDom,childrenDom } from './template';

export function diff(oldVnode,Vnode){
	if(sameNode(oldVnode,Vnode)){
		patchVnode(oldVnode,Vnode);
	}else{//直接用当前dom替换以前的dom
		const el = oldVnode.el;
		const parentEl = el.parentNode;
		createDom(Vnode);//生成新的dom
		if (parentEle !== null) {
			parentEl.insertBefore(Vnode.el,el.nextSibling)//插入新的dom
			parentEl.removeChild(el)//移除之前的dom
			oldVnode = Vnode
		}
	}
	return Vnode;
}

function sameNode(oldVnode,Vnode){
	return oldVnode && Vnode && oldVnode.tagName == Vnode.tagName;
}

function patchVnode(oldVnode,Vnode){
	let oldChildren = oldVnode.children, children = Vnode.children;
	if(Vnode.tagName === 'text' && oldVnode.tagName === 'text' ){
		if(Vnode.children !== oldVnode.children){
			oldVnode.el.textContent = Vnode.children;
			oldVnode.children = Vnode.children;
		}
	}else {
		if(oldVnode.attrString !== Vnode.attrList){
			//需要替换props
		}
		// if (oldChildren && children) {
			diffChildren(oldChildren, children);
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

function diffChildren(oldVnodeChildren,VnodeChildren){
	const max = Math.max(VnodeChildren.length,oldVnodeChildren.length);
	for(var i = 0 ; i < max ; i++ ){
		let oldVnode = oldVnodeChildren[i];
		let Vnode = VnodeChildren[i];
		diff(oldVnode,Vnode);
	}
}

function replaceAttr(){

}