import {Component, inject, OnInit} from '@angular/core';
import {AuthService} from "../services/auth-service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-welcomepage',
  templateUrl: './welcomepage.component.html',
  styleUrls: ['./welcomepage.component.scss'],
  imports: [
    NgIf
  ],
  standalone: true
})
export class WelcomepageComponent implements OnInit {
  authService = inject(AuthService);
  authenticated = false;

  ngOnInit() {
    this.authenticated = this.authService.isAuthenticated();
  }

  authenticate() {
    this.authService.authenticate().then(result => {
      this.authenticated = result;
    })
  }
}
