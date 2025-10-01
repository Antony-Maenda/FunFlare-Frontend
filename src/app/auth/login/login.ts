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
isLoading = false;
showPassword = false;
errorMessage = '';

constructor(
private fb: FormBuilder,
private authService: AuthService,
private router: Router
) {
this.loginForm = this.fb.group({
emailAdress: ['', [Validators.required, Validators.email]], // keep consistent with register.ts
password: ['', Validators.required, Validators.minLength(8)]
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

      if (!response.token) {
        this.errorMessage = 'Invalid login response from server.';
        this.isLoading = false;
        return;
      }

      // Save token & role in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.role);

      alert('✅ Login successful!');

      // Redirect based on role
      if (response.role === 'attendee') {
        this.router.navigate(['/attendee-dashboard']);
      } else if (response.role === 'organizer') {
        this.router.navigate(['/organizer-dashboard']);
      } else {
        this.errorMessage = 'Unknown role. Please contact support.';
      }

      this.isLoading = false;
    },
    error: (error) => {
      console.error('Login error:', error);
      this.errorMessage =
        error.error?.message || '❌ Invalid email or password, or account not verified.';
      this.isLoading = false;
    }
  });
} else {
  console.log('Form invalid:', this.loginForm.errors);
  this.errorMessage = 'Please enter valid email and password.';
}

}
}
