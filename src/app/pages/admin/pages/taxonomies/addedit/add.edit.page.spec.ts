import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaxonomiesAddEditPage } from './add.edit.page';


describe('Font Types Add/Edit Page', () => {
	let component: TaxonomiesAddEditPage;
	let fixture: ComponentFixture<TaxonomiesAddEditPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TaxonomiesAddEditPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TaxonomiesAddEditPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
