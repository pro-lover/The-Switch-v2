import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TemplateBannersListPage } from './list.template.banners.page';


describe('Templates ListPage', () => {
	let component: TemplateBannersListPage;
	let fixture: ComponentFixture<TemplateBannersListPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TemplateBannersListPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TemplateBannersListPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
