import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventTypesAddEditPage } from './add.edit.page';


describe('Event Types Add/Edit Page', () => {
	let component: EventTypesAddEditPage;
	let fixture: ComponentFixture<EventTypesAddEditPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [EventTypesAddEditPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(EventTypesAddEditPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
