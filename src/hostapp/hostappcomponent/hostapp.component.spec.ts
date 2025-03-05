import {TestBed} from "@angular/core/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {HostAppComponent} from "./hostapp.component";
import {AuthService} from "@@auth-lib";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";

describe("HostAppComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HostAppComponent],
      providers: [
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj("AuthService", ["isLoggedIn"])
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  it("компонент должен создаваться", () => {
    const fixture = TestBed.createComponent(HostAppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
