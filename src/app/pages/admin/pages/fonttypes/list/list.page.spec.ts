import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FontTypesListPage } from './list.page';


describe('Font Types ListPage', () => {
	let component: FontTypesListPage;
	let fixture: ComponentFixture<FontTypesListPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [FontTypesListPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(FontTypesListPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
