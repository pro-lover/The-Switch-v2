import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BannerTypesAddEditPage } from './add.edit.page';


describe('Banner Types Add/Edit Page', () => {
	let component: BannerTypesAddEditPage;
	let fixture: ComponentFixture<BannerTypesAddEditPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [BannerTypesAddEditPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(BannerTypesAddEditPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
