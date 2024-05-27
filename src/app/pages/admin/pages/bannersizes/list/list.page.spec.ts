import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BannerSizesListPage } from './list.page';


describe('Banner Sizes ListPage', () => {
	let component: BannerSizesListPage;
	let fixture: ComponentFixture<BannerSizesListPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [BannerSizesListPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(BannerSizesListPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
