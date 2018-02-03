export function findIndex(arr,item){
	for(let i = 0, length = arr.length ; i < length ; i++){
		if(arr[i] === item){
			return i;
		}
	}
	return -1;
}