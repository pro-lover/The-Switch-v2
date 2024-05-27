import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TasksListPage } from './list.page';


describe('Tasks ListPage', () => {
	let component: TasksListPage;
	let fixture: ComponentFixture<TasksListPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TasksListPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TasksListPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
