import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentTypesListPage } from './list.page';


describe('Component Types ListPage', () => {
	let component: ComponentTypesListPage;
	let fixture: ComponentFixture<ComponentTypesListPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ComponentTypesListPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ComponentTypesListPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
