import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FileUploadService } from './file-upload.services';

describe('WebsitePage', () => {
  let component: FileUploadService;
  let fixture: ComponentFixture<FileUploadService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [FileUploadService],
    imports: [RouterTestingModule],
    teardown: { destroyAfterEach: false }
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
