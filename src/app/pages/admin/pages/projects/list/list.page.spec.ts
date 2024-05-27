import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectsListPage } from './list.page';


describe('Projects ListPage', () => {
	let component: ProjectsListPage;
	let fixture: ComponentFixture<ProjectsListPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ProjectsListPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ProjectsListPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
