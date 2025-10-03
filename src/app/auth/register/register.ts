import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
//import { AuthService } from '../../services/auth';
import { AuthService } from '../../services/auth.service';  // Points to auth.service.ts

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
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private userRegistrationService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        emailAdress: ['', [Validators.required, Validators.email]], // 👈 important
        phoneNumber: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
        organization_name: [''],
        isOrganizer: [false]
      },
      { validators: this.passwordMatchValidator } // ✅ custom validator
    );
  }

  // ✅ custom validator to match password and confirm password
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
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
          const errorMessage =
            error.error?.message || 'Registration failed. Please check your input and try again.';
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
