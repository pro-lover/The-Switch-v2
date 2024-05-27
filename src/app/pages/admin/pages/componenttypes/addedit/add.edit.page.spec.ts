import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentTypesAddEditPage } from './add.edit.page';


describe('Component Types Add/Edit Page', () => {
	let component: ComponentTypesAddEditPage;
	let fixture: ComponentFixture<ComponentTypesAddEditPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ComponentTypesAddEditPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ComponentTypesAddEditPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
