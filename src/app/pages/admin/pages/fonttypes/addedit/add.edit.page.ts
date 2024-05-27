import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, Role } from '@app/core/models';
import { AccountService, AlertService, FontTypeService } from '@app/core/services';
import { first } from 'rxjs/operators';
import * as introJs from 'intro.js';

export interface fontStyle {
	name: string;
}
export interface fontWeight {
	name: string;
}

@Component({
	templateUrl: './add.edit.page.html',
	styleUrls: ['./add.edit.page.scss'],
})
export class FontTypesAddEditPage implements OnInit {

	form!: FormGroup;
	id!: string;
	isAddMode!: boolean;
	loading = false;
	submitted = false;

	Role = Role;
	//fontType!: FontType;
	account!: Account;

	public FontStyles: fontStyle[] = [
		{
			name: 'normal'
		},
		{
			name: 'italic'
		}
	];

	public FontWeights: fontWeight[] = [
		{
			name: 'normal'
		},
		{
			name: 'bold'
		},
		{
			name: '100'
		},
		{
			name: '200'
		},
		{
			name: '300'
		},
		{
			name: '500'
		},
		{
			name: '900'
		}
		/** /
		{
			name: 'Extra bold'
		},
		{
			name: 'Black'
		},
		/**/
	];

	//user onboarding
	private introJS = introJs();

	constructor(
		private formBuilder: FormBuilder,
		private route: ActivatedRoute,
		private router: Router,
		private dialog: MatDialog,
		private location: Location,
		private accountService: AccountService,
		private fontTypeService: FontTypeService,
		private alertService: AlertService,
		private _snackBar: MatSnackBar
	) {

		this.account = this.accountService.accountValue;
		this.onboarding();
	}

	// convenience getter for easy access to form fields
	get f() { return this.form.controls; }

	ngOnInit() {
		this.id = this.route.snapshot.params['id'];
		this.isAddMode = !this.id;

		// to validate
		//const reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

		//(https?:\/\/)([\\da-z.-]*)(.*)(\.css)

		this.form = this.formBuilder.group({
			name: ['', Validators.required],
			description: ['', Validators.required],
			fontFamily: ['', Validators.required],
			fontStyle: ['', Validators.required],
			fontWeight: ['', Validators.required],
			styleSheet: ['', [
					Validators.required,
					Validators.pattern('(https?:\/\/)([\\da-z.-]*)(.*)(\.css)')
				]
			]
			//styleSheet: ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')] ]
		});

		if (!this.isAddMode) {
			this.fontTypeService.getById(this.id)
				.pipe(first())
				.subscribe( (x) => {
					this.form.patchValue(x);
				});
		}
	}

	public onSubmit(): void {
		this.submitted = true;

		// reset alerts on submit
		this.alertService.clear();

		// stop here if form is invalid
		if (this.form.invalid) {
			return;
		}

		this.loading = true;
		if (this.isAddMode) {
			this.createRecord();
		} else {
			this.updateRecord();
		}
	}

	public back(): void {
		this.location.back();
	}

	private onboarding(): void {

		this.introJS.setOptions({
			showStepNumbers: true,
			showProgress: true,

				steps : [
					{
						intro: 'Click here to go back to previous page',
						element: '#btn-back'
					},
					{
						intro: 'Enter font name.',
						title: 'Creating Fonts.',
						element: '#inputName'
					},
					{
						intro: 'Enter font description.',
						element: '#inputDesc'
					},
					{
						intro: 'Enter font family',
						element: '#inputFontFam'
					},
					{
						intro: 'Select font weight.',
						element: '#inputFontW'
					},
					{
						intro: 'Select font style',
						element: '#inputFontStyle'
					},
					{
						intro: 'Provide a stylesheet URL.',
						element: '#inputStylesheet'
					},
					{
						intro: 'Click here to save new font type.',
						element: '#btn-save'
					},
					{
						intro: 'Click here to cancel creation of a new font.',
						element: '#btn-cancel'
					}
			],
		});
	}

	public help(): void {

		//this.introJS.refresh();

		//this.introJS.addHints();

		//this.introJS.showHints();

		this.introJS.start();
	}

	private createRecord(): void {
        this.fontTypeService.create(this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Record created successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
	}

	private updateRecord(): void {
        this.fontTypeService.update(this.id, this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Update successful', { keepAfterRouteChange: true });
                    this.router.navigate(['../../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
	}

}
