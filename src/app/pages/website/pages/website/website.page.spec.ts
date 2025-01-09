import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { WebsitePage } from './website.page';

describe('WebsitePage', () => {
  let component: WebsitePage;
  let fixture: ComponentFixture<WebsitePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [WebsitePage],
    imports: [RouterTestingModule],
    teardown: { destroyAfterEach: false }
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebsitePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
