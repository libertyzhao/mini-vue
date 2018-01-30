import { defineReactive } from './reactive';

function LV(options){
	Object.keys(options).forEach(key=>{
		this[key] = options[key];
	})
	this.init();
}

LV.prototype.init = function(){
	this.initRender(this);
	this.initState(this);
}

LV.prototype.initRender = function(lv){

}

LV.prototype.initState = function(lv){
	if(lv.data){
		initData(lv);
	}
}

function initData(lv){
	let data = lv.data;
	Object.keys(data).forEach(key=>{
		defineReactive(data,key);
	})
}


export default LV;