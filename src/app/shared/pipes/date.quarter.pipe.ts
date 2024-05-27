import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';


@Pipe({
    name: 'dateQuarter'
})
export class DateQuarterPipe implements PipeTransform {

	transform(value: string): any {
		let date = moment(value);

		if( date.isValid() ) {
			// Month      getMonth()  quarter
			// ---------  ----------  -------
			// January         0         1
			// February        1         1
			// March           2         1
			// April           3         2
			// May             4         2
			// June            5         2
			// July            6         3
			// August          7         3
			// September       8         3
			// October         9         4
			// November       10         4
			// December       11         4

			// For the fiscal year
			// Oct-Dec = 2
			// Jan-Mar = 3
			// Apr-Jun = 4
			// Jul-Sep = 1

			let datte = new Date(value);
			//let quarter = Math.floor((datte.getMonth() + 3) / 3); // Standard Quarter
			let quarter = Math.floor((datte.getMonth()/3)) + 3;		// For the fiscal year

			quarter = quarter > 4? quarter - 4 : quarter;

			if( quarter === 3 || quarter === 4 ) {
				return (datte.getFullYear()-1) + '/Q' + quarter;
			} else {
				return datte.getFullYear() + '/Q' + quarter;
			}

		} else {

			return value;

		}
	}

}
