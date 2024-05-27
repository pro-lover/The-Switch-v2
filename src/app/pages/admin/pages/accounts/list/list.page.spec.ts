import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountsListPage } from './list.page';


describe('Accounts ListPage', () => {
	let component: AccountsListPage;
	let fixture: ComponentFixture<AccountsListPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AccountsListPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AccountsListPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
