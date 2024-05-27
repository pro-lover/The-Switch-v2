import { FormGroup } from '@angular/forms';


// custom validator to check that two fields match
export function ValidateYear(controlName: string) {
	return (formGroup: FormGroup) => {
		const currentYear = new Date().getFullYear();
		const control = formGroup.controls[controlName];

		if (control.errors && !control.errors['validateYear']) {
			// return if another validator has already found an error on the control
			return;
		}

		control.setErrors(null);

		// set error on control if validation fails
		// disable future years validation
		/* * /
		if (control.value > currentYear ) {
			control.setErrors({ validateYear: true });
		} else {
			control.setErrors(null);
		}
		/**/
	}
}
