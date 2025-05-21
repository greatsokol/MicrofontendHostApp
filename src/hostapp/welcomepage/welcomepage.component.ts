import {Component, inject} from '@angular/core';
import {AuthService} from "../services/auth-service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-welcomepage',
  templateUrl: './welcomepage.component.html',
  styleUrls: ['./welcomepage.component.css'],
  imports: [
    NgIf
  ],
  standalone: true
})
export class WelcomepageComponent {
  authService = inject(AuthService);
}
