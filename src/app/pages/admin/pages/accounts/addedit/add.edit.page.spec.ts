import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountsAddEditPage } from './add.edit.page';


describe('Accounts Add/Edit Page', () => {
	let component: AccountsAddEditPage;
	let fixture: ComponentFixture<AccountsAddEditPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AccountsAddEditPage],
			teardown: { destroyAfterEach: false }
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AccountsAddEditPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
