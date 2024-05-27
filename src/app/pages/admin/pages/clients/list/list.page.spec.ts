import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientsListPage } from './list.page';


describe('Clients ListPage', () => {
	let component: ClientsListPage;
	let fixture: ComponentFixture<ClientsListPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ClientsListPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ClientsListPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
