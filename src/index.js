import { defineProxy, defineReactive, Watcher, Computed, Render } from './reactive';
import { cleanHtml } from './template';
import { parseHtml, } from './htmlParse';

function LV(options){
	this.init(options);
}

LV.prototype.init = function(options){
	mergeOptions(this,options)
	this.initMethod(this);
	this.initState(this);
	this.initRender(this);
}

LV.prototype.initRender = function(lv){
	let templateDom = lv.template;
	let template = document.querySelector(templateDom).innerText.trim();
	template = cleanHtml(template);
	var htmlAst = parseHtml(template);
	var render = new Render(lv,template,htmlAst);
}

LV.prototype.initState = function(lv){
	if(lv.data){
		initData(lv);
	}
	if(lv.watch){
		initWatch(lv);
	}
	if(lv.computed){
		initComputed(lv)
	}
}

LV.prototype.initMethod = function(lv){
	var methods = lv.methods;
	var computed = lv.computed;
	var watch = lv.watch;
	bindThis(lv.methods,lv);
	bindThis(lv.computed,lv);
	bindThis(lv.watch,lv);
}

function initData(lv){
	let data = lv.data;
	Object.keys(data).forEach(key=>{
		defineProxy(lv,key,data);
		defineReactive(data,key);
	})
}

function initWatch(lv){
	let watch = lv.watch;
	Object.keys(watch).forEach(key=>{
		let watcher = new Watcher(lv,watch,key);
	})
}

function initComputed(lv){
	let computed = lv.computed;
	Object.keys(computed).forEach(key=>{
		let computer = new Computed(lv,computed,key);
		defineProxy(lv,key,lv.data);
	})
}

function bindThis(methods,lv){
	if(methods){
		Object.keys(methods).forEach(name => {
			methods[name] = methods[name].bind(lv);
		});
	}
}

function mergeOptions(lv,options){
	Object.keys(options).forEach(key=>{
		lv[key] = options[key];
	})
}


export default LV;