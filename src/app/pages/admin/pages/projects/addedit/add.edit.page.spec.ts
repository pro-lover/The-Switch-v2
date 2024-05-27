import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectsAddEditPage } from './add.edit.page';


describe('Projects Add/Edit Page', () => {
	let component: ProjectsAddEditPage;
	let fixture: ComponentFixture<ProjectsAddEditPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ProjectsAddEditPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ProjectsAddEditPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
