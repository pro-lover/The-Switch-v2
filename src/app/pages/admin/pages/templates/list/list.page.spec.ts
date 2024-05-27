import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TemplatesListPage } from './list.page';


describe('Templates ListPage', () => {
	let component: TemplatesListPage;
	let fixture: ComponentFixture<TemplatesListPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TemplatesListPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TemplatesListPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
