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
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private userRegistrationService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      emailAdress: ['', [Validators.required, Validators.email]], // Changed from email
      phoneNumber: ['', Validators.required], // Changed from phone
      organization_name: [''], // Changed from organization, not required for attendees
      password: ['', [Validators.required, Validators.minLength(8)]], // Changed to minLength(8)
      isOrganizer: [false]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      console.log('Form valid:', this.registerForm.valid);
      console.log('Form value:', this.registerForm.value);
      this.isLoading = true;
      this.userRegistrationService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('Registration response:', response);
          alert('✅ Registration successful! Please check your email to verify your account.');
          this.registerForm.reset();
          this.router.navigate(['/login']);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Registration error:', error);
          const errorMessage = error.error?.message || 'Registration failed. Please check your input and try again.';
          alert(`❌ ${errorMessage}`);
          this.isLoading = false;
        }
      });
    } else {
      console.log('Form invalid:', this.registerForm.errors);
      console.log('Form controls:', this.registerForm.controls);
    }
  }
}