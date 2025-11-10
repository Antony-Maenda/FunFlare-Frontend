import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Form valid:', this.loginForm.valid);
      console.log('Form value:', this.loginForm.value);

      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login response:', response);

          if (!response.jwtToken) {
            this.errorMessage = 'Invalid login response from server.';
            this.isLoading = false;
            return;
          }

          // ✅ Save jwtToken
          localStorage.setItem('jwtToken', response.jwtToken);

          // ✅ Normalize role: attendee → buyer
          const role = response.role?.toLowerCase();
          const normalizedRole = role === 'attendee' ? 'buyer' : role;

          // ✅ Store user details
          localStorage.setItem('role', normalizedRole);
          localStorage.setItem('username', response.username);

          alert('✅ Login successful!');

          // ✅ Redirect based on normalized role
          if (normalizedRole === 'buyer') {
            this.router.navigate(['/buyer-dashboard']);
          } else if (normalizedRole === 'organizer') {
            this.router.navigate(['/organizer-dashboard']);
          } else {
            this.errorMessage = 'Unknown role. Please contact support.';
          }

          this.isLoading = false;
        },
        error: (error) => {
          console.error('Login error:', error);
          if (error.status === 401) {
            this.errorMessage = '❌ Invalid email or password, or account not verified.';
          } else {
            this.errorMessage = error.error?.message || '❌ Login failed. Please try again.';
          }
          this.isLoading = false;
        }
      });
    } else {
      console.log('Form invalid:', this.loginForm.errors);
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Please enter valid email and password.';
    }
  }
}
