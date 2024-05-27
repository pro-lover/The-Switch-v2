
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, Animation, Role } from '@app/core/models';
import { AccountService, AlertService, AnimationService, AnimationTypeService } from '@app/core/services';
import * as introJs from 'intro.js';
import { first } from 'rxjs/operators';

@Component({
	templateUrl: './add.edit.page.html',
	styleUrls: ['./add.edit.page.scss'],
})
export class AnimationTypesAddEditPage implements OnInit {

	//user onboarding
	private introJS = introJs();

	form!: FormGroup;
	id!: string;
	isAddMode!: boolean;
	loading = false;
	submitted = false;

	Role = Role;
	animation!: Animation;
	account!: Account;

	constructor(
		private formBuilder: FormBuilder,
		private route: ActivatedRoute,
		private router: Router,
		private dialog: MatDialog,
		private location: Location,
		private accountService: AccountService,
		private animationService: AnimationService,
		private animationTypeService: AnimationTypeService,
		private alertService: AlertService
	) {

		this.account = this.accountService.accountValue;
		this.onboarding();
	}

	// convenience getter for easy access to form fields
	get f() { return this.form.controls; }

	ngOnInit() {
		this.id = this.route.snapshot.params['id'];
		this.isAddMode = !this.id;

		this.form = this.formBuilder.group({
			name: ['', Validators.required],
			description: ['', Validators.required]
		});

		if (!this.isAddMode) {
			this.animationService.getById(this.id)
				.pipe(first())
				.subscribe( (x) => {
					this.form.patchValue(x);
				});
		}
	}

	onSubmit() {
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
			showProgress: true
			/** /
			steps: [
				{
					title: 'Template Banner Design',
					intro: "As an Admin user, you can design the layout of for the banner."
				}

				{
					element: '.walkthrough-adding-components',
					intro: "Click here to create a new account.",
					position: 'bottom-right-aligned'
				},
				/** /
			],
			/** /
			hints: [
				{
					element: '#mat-tab-label-0-0',
					hint: 'Click here to add new components.',
					hintPosition: 'top-middle',
				},
				{
					element: '#mat-tab-label-0-1',
					hint: 'Once a component is added. It will be listed in this tab for you to edit/save.',
					hintPosition: 'top-middle'
				}
			]
			/**/
		});
	}

	public help(): void {

		//this.introJS.refresh();

		//this.introJS.addHints();

		//this.introJS.showHints();

		//this.introJS.start();

		this.alertService.info('Help/Onboarding Feature still in WIP.', { keepAfterRouteChange: true });
	}

	private createRecord() {
        this.animationTypeService.create(this.form.value)
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

	private updateRecord() {
        this.animationTypeService.update(this.id, this.form.value)
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
