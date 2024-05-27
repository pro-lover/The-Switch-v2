import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimationsListPage } from './list.page';


describe('Animations ListPage', () => {
	let component: AnimationsListPage;
	let fixture: ComponentFixture<AnimationsListPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AnimationsListPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AnimationsListPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
