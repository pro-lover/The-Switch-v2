import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, Client, Project, Role } from '@app/core/models';
import { AccountService, AlertService, ClientService, ProjectService } from '@app/core/services';
import * as introJs from 'intro.js';
import { first } from 'rxjs/operators';

@Component({
	templateUrl: './add.edit.page.html',
	styleUrls: ['./add.edit.page.scss'],
})
export class ProjectsAddEditPage implements OnInit {

	//user onboarding
	private introJS = introJs();

	form!: FormGroup;
	id!: string;
	isAddMode!: boolean;
	loading = false;
	submitted = false;

	Role = Role;
	formDataClients!: Client[];
	client!: Client;
	project!: Project;
	account!: Account;

	constructor(
		private formBuilder: FormBuilder,
		private route: ActivatedRoute,
		private router: Router,
		private dialog: MatDialog,
		private location: Location,
		private accountService: AccountService,
		private clientService: ClientService,
		private projectService: ProjectService,
		private alertService: AlertService,
		private _snackBar: MatSnackBar
	) {

		this.account = this.accountService.accountValue;
		this.onboarding();

		this.clientService.getAll()
				.pipe(first())
				.subscribe( (x: Client[]) => {
					this.formDataClients = x;
				});
	}

	// convenience getter for easy access to form fields
	get f() { return this.form.controls; }

	ngOnInit() {
		this.id = this.route.snapshot.params['id'];
		this.isAddMode = !this.id;

		this.form = this.formBuilder.group({
			name: ['', Validators.required],
			description: ['', Validators.required],
			clientId: ['', Validators.required]
		});

		if (!this.isAddMode) {
			this.projectService.getById(this.id)
				.pipe(first())
				.subscribe( (x:Project) => {
					this.form.patchValue(x);
					this.form.value.clientId = x.clientId;
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
		introJs().setOptions({
			showStepNumbers: true,
			showProgress: true,
				steps : [
					{
						intro: 'first',
						title: 'Click here to go back to previous page.',
						element: '.btn btn-dark'
					},
					{
						intro: 'second',
						title: 'Click here to select a client.',
						element: '.form-group col-12 col-md-4'
					},
					{
						intro: 'third',
						title: 'Add a project name.',
						element: '.form-group col-12 col-md-4'
					},
					{
						intro: 'fourth',
						title: 'Add a project description.',
						element: '.form-group col-12 col-md-8'
					},
					{
						intro: 'fifth',
						title: 'Save new project.',
						element: '.btn btn-success'
					},
					{
						intro: 'sixth',
						title: 'Cancel creating a new project.',
						element: '.btn btn-secondary'
					},
			],
		});
	}

	public help(): void {

		//this.introJS.refresh();

		//this.introJS.addHints();

		//this.introJS.showHints();

		this.introJS.start();

		/*this._snackBar.open( 'Help/Onboarding Feature still in WIP.', 'close', {
			horizontalPosition: 'center',
			verticalPosition: 'top',
		});*/
	}

	private createRecord() {
        this.projectService.create(this.form.value)
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
        this.projectService.update(this.id, this.form.value)
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
