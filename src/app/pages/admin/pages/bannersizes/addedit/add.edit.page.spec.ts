import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BannerSizesAddEditPage } from './add.edit.page';


describe('Banner Sizes Add/Edit Page', () => {
	let component: BannerSizesAddEditPage;
	let fixture: ComponentFixture<BannerSizesAddEditPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [BannerSizesAddEditPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(BannerSizesAddEditPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
