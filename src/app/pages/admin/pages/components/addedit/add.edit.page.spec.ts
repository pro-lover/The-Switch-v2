import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentsAddEditPage } from './add.edit.page';


describe('Components Add/Edit Page', () => {
	let component: ComponentsAddEditPage;
	let fixture: ComponentFixture<ComponentsAddEditPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ComponentsAddEditPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ComponentsAddEditPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
