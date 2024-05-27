import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HowitworksPage } from './howitworks.page';

describe('HowitworksPage', () => {
  let component: HowitworksPage;
  let fixture: ComponentFixture<HowitworksPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [HowitworksPage],
    imports: [RouterTestingModule],
    teardown: { destroyAfterEach: false }
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HowitworksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
