import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventTypesListPage } from './list.page';


describe('Event Types ListPage', () => {
	let component: EventTypesListPage;
	let fixture: ComponentFixture<EventTypesListPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [EventTypesListPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(EventTypesListPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
