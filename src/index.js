import { defineProxy, defineReactive, Watcher, Computed } from './reactive';

function LV(options){
	this.init(options);
}

LV.prototype.init = function(options){
	mergeOptions(this,options)
	this.initMethod(this);
	this.initRender(this);
	this.initState(this);
}

LV.prototype.initRender = function(lv){

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
		watch[key].watcher = watcher;
	})
}

function initComputed(lv){
	let computed = lv.computed;
	Object.keys(computed).forEach(key=>{
		let computer = new Computed(lv,computed,key);
		computed[key].computer = computer;
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