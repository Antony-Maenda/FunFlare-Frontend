import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          if (!res.token) {
            this.errorMessage = 'Invalid login response';
            return;
          }

          // Save token & role
          localStorage.setItem('token', res.token);
          localStorage.setItem('role', res.role);

          // Redirect based on role
          if (res.role === 'buyer') {
            this.router.navigate(['/buyer-dashboard']);
          } else if (res.role === 'organizer') {
            this.router.navigate(['/organizer-dashboard']);
          } else {
            this.errorMessage = 'Unknown role. Please contact support.';
          }
        },
        error: (err) => {
          console.error('❌ Login error:', err);
          this.errorMessage = 'Invalid email or password, or account not verified.';
        }
      });
    } else {
      this.errorMessage = 'Please enter valid email and password.';
    }
  }
}
