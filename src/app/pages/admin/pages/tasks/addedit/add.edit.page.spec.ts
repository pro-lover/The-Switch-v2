import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TasksAddEditPage } from './add.edit.page';


describe('Tasks Add/Edit Page', () => {
	let component: TasksAddEditPage;
	let fixture: ComponentFixture<TasksAddEditPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TasksAddEditPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TasksAddEditPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
