import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimationsAddEditPage } from './add.edit.page';


describe('Animations Add/Edit Page', () => {
	let component: AnimationsAddEditPage;
	let fixture: ComponentFixture<AnimationsAddEditPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AnimationsAddEditPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AnimationsAddEditPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
