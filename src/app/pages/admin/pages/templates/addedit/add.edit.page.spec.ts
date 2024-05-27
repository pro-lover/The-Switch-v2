import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TemplatesAddEditPage } from './add.edit.page';


describe('Templates Add/Edit Page', () => {
	let component: TemplatesAddEditPage;
	let fixture: ComponentFixture<TemplatesAddEditPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TemplatesAddEditPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TemplatesAddEditPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
