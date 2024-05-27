import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EasingTypesListPage } from './list.page';


describe('Easing Types ListPage', () => {
	let component: EasingTypesListPage;
	let fixture: ComponentFixture<EasingTypesListPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [EasingTypesListPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(EasingTypesListPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
