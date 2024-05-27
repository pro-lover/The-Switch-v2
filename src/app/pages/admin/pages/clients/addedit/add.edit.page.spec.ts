import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientsAddEditPage } from './add.edit.page';


describe('Clients Add/Edit Page', () => {
	let component: ClientsAddEditPage;
	let fixture: ComponentFixture<ClientsAddEditPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ClientsAddEditPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ClientsAddEditPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
