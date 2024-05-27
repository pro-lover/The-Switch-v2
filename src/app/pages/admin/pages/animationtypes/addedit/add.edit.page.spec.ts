import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimationTypesAddEditPage } from './add.edit.page';


describe('Animation Types Add/Edit Page', () => {
	let component: AnimationTypesAddEditPage;
	let fixture: ComponentFixture<AnimationTypesAddEditPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AnimationTypesAddEditPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AnimationTypesAddEditPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
