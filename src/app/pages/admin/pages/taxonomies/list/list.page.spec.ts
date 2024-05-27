import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaxonomiesListPage } from './list.page';


describe('Font Types ListPage', () => {
	let component: TaxonomiesListPage;
	let fixture: ComponentFixture<TaxonomiesListPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TaxonomiesListPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TaxonomiesListPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
