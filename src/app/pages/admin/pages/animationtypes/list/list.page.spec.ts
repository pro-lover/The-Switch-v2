import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimationTypesListPage } from './list.page';


describe('Animation Types ListPage', () => {
	let component: AnimationTypesListPage;
	let fixture: ComponentFixture<AnimationTypesListPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AnimationTypesListPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AnimationTypesListPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
