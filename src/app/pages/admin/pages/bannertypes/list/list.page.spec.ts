import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BannerTypesListPage } from './list.page';


describe('Banner Types ListPage', () => {
	let component: BannerTypesListPage;
	let fixture: ComponentFixture<BannerTypesListPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [BannerTypesListPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(BannerTypesListPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
