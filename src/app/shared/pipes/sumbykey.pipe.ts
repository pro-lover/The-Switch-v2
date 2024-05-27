import { Pipe, PipeTransform } from '@angular/core';

import * as _ from 'underscore';

@Pipe({
    name: 'sumByKey'
})
export class SumByKeyPipe implements PipeTransform {

	transform( key: string, data:any[] ): number {

		//console.log('sumByKey:', key, data);
		var sum = 0;
        for ( var i = data.length - 1; i >= 0; i-- ) {

        	//if( data[i][key] === false || data[i][key] == null ) {} else {
				if(  data[i].label == key ) {
					//sum += parseInt( data[i][key] );

					sum =  data[i].data.reduce((a, b) => a + b, 0);
				}
        		//sum += parseInt( data[i][key] );
        	//}
        }

        return sum;
	}

}
