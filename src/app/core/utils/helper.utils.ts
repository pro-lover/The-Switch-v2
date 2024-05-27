
// https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
export const groupBy = (xs:any[], key:string | number): any => {
	return xs.reduce(function(rv, x) {
		(rv[x[key]] = rv[x[key]] || []).push(x);
		return rv;
	}, {});
}

export const getCartesianProduct = (a:any): any => {

	const cartesian:any = (objXarr:any) => {
			const 	names 		= Object.keys( objXarr ),
					len   		= names.length -1,
					resp:any  	= [];

			buildIn( {}, 0)

			return resp;

			function buildIn(obj:any, indx:any) {
				const key = names[indx];
				for (const val of objXarr[ key ] )
				{
					const oo = {...obj,[key]:val}
					if (indx < len )  buildIn(oo, indx +1)
					else resp.push( oo )
				}
			}
	}

	const c:any = cartesian(a);
	return c;

}

//https://stackoverflow.com/questions/44698967/requesting-blob-images-and-transforming-to-base64-with-fetch-api
export const urlContentToDataUri = (url:string): Promise<string | ArrayBuffer | null> => {
	return  fetch(url)
			.then( response => response.blob() )
			.then( blob => new Promise( callback =>{
				const reader = new FileReader() ;
				reader.onload = function(){ callback(this.result) } ;
				reader.readAsDataURL(blob) ;
			}) ) ;
}

// Public Domain/MIT
export const generateUUID = (): string => {
	let d = new Date().getTime();//Timestamp
	//Time in microseconds since page-load or 0 if unsupported
	let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		let r = Math.random() * 16;//random number between 0 and 16
		if(d > 0){//Use timestamp until depleted
			r = (d + r)%16 | 0;
			d = Math.floor(d/16);
		} else {//Use microseconds since page-load if supported
			r = (d2 + r)%16 | 0;
			d2 = Math.floor(d2/16);
		}
		return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
}

export const compare = (a: number | string | boolean, b: number | string | boolean, isAsc: boolean) : number => {
	return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
