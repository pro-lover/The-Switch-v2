import { Pipe, PipeTransform } from '@angular/core';

import * as moment from 'moment';

@Pipe({
    name: 'age'
})
export class AgePipe implements PipeTransform {

	transform(value: string): any {
		var date = moment(value);

		if( date.isValid() ) {
			// if you do not want fraction values:
			let years = moment().diff(value, 'years', false);

			return years;

		} else {

			return value;

		}
	}

}
