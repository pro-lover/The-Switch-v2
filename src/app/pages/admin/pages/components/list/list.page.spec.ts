import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentsListPage } from './list.page';


describe('Components ListPage', () => {
	let component: ComponentsListPage;
	let fixture: ComponentFixture<ComponentsListPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ComponentsListPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ComponentsListPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
