import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FontTypesAddEditPage } from './add.edit.page';


describe('Font Types Add/Edit Page', () => {
	let component: FontTypesAddEditPage;
	let fixture: ComponentFixture<FontTypesAddEditPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [FontTypesAddEditPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(FontTypesAddEditPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
