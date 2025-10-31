import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
    credentials = {
    email: '',
    password: ''
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.router.navigate(['/']);
        } else {
          this.errorMessage = 'Email hoặc mật khẩu không đúng';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
      }
    });
  }

  loginWithDemo(role: 'admin' | 'user'): void {
    if (role === 'admin') {
      this.credentials.email = 'admin@athengaudio.com';
      this.credentials.password = 'admin123';
    } else {
      this.credentials.email = 'user@athengaudio.com';
      this.credentials.password = 'user123';
    }
    this.onSubmit();
  }
}
