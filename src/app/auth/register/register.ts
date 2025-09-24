import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // ✅ Build form with validation
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      organization: [''], // optional
      password: ['', [Validators.required, Validators.minLength(6)]],
      isOrganizer: [false] // checkbox
    });
  }

  onSubmit() {
  if (this.registerForm.valid) {
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        alert('✅ Registration successful! Please check your email to verify your account.');
        this.router.navigate(['/login']); // optional, or wait until after email verification
      },
      error: () => {
        alert('❌ Registration failed. Try again.');
      }
    });
  }
}
}
