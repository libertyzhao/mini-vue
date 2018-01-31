

export function createRender(template){
	let reg =/{{[ \t]*([\w\W]*?)[ \t]*}}/g,result;
	let index = 0;
	while(result = reg.exec(template)){
		template = template.replace(result[0],'${lv.'+result[1]+'}');
	}
	let render = new Function('lv','return `'+template+'`');
	return render;
}
