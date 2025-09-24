import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth';
@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  providers: [AuthService], // Add this line
  templateUrl: './verify-email.html',
  styleUrls: ['./verify-email.css']
})
export class VerifyEmailComponent implements OnInit {
  message = 'Verifying your email...';
  isSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ Extract token from query params
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.authService.verifyEmail(token).subscribe({
          next: () => {
            this.isSuccess = true;
            this.message = '✅ Your email has been verified! Redirecting to login...';

            // Redirect after 3 seconds
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 3000);
          },
          error: () => {
            this.isSuccess = false;
            this.message = '❌ Invalid or expired verification link.';
          }
        });
      } else {
        this.message = '❌ No verification token found.';
      }
    });
  }
}
