import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EasingTypesAddEditPage } from './add.edit.page';


describe('Easing Types Add/Edit Page', () => {
	let component: EasingTypesAddEditPage;
	let fixture: ComponentFixture<EasingTypesAddEditPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [EasingTypesAddEditPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(EasingTypesAddEditPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
