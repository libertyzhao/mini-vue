export function defineReactive(target,key){
	target[`__${key}`] = target[key];
	Object.defineProperty(target,key,{
		get(){
			console.log('执行了get');
			return target[`__${key}`];
		},
		set(value){
			console.log('执行了set');
			target[`__${key}`] = value;
			return value;
		}
	})
}

 