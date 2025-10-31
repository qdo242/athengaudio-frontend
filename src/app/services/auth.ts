import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, Observable, of, switchMap } from 'rxjs';
import { LoginRequest, RegisterRequest, User, ProfileUpdateRequest, ChangePasswordRequest } from '../interfaces/user';

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'currentUser';
  
  // BehaviorSubject để theo dõi trạng thái đăng nhập
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  // Getter cho currentUser
  get currentUserValue(): User | null {
    return this.currentUser;
  }

  // Getter cho trạng thái đăng nhập
  get isLoggedIn(): boolean {
    return !!this.currentUser && !!localStorage.getItem(this.TOKEN_KEY);
  }

  // Getter cho role
  get userRole(): string | null {
    return this.currentUser?.role || null;
  }

  // Getter cho tên user
  get userName(): string | null {
    return this.currentUser?.name || null;
  }

  // Getter cho email
  get userEmail(): string | null {
    return this.currentUser?.email || null;
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem(this.USER_KEY);
    const token = localStorage.getItem(this.TOKEN_KEY);
    
    if (userData && token) {
      this.currentUser = JSON.parse(userData);
      this.currentUserSubject.next(this.currentUser);
    }
  }

  private saveUserToStorage(user: User, token: string): void {
    const userData = {
      ...user,
      updatedAt: new Date()
    };
    
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    localStorage.setItem(this.TOKEN_KEY, token);
    this.currentUser = userData;
    this.currentUserSubject.next(this.currentUser);
  }

  private clearStorage(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUser = null;
    this.currentUserSubject.next(null);
  }

  login(loginData: LoginRequest): Observable<AuthResponse> {
    return of(null).pipe(
      delay(1000),
      switchMap(() => {
        if (loginData.email === 'admin@athengaudio.com' && loginData.password === 'admin123') {
          const user: User = {
            id: 1,
            email: loginData.email,
            name: 'Quản Trị Viên',
            phone: '0123456789',
            address: 'Hà Nội, Việt Nam',
            avatar: 'assets/images/avatar-admin.png',
            role: 'admin',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date(),
            orders: [],
            wishlist: [1, 3, 7]
          };
          
          this.saveUserToStorage(user, 'mock-jwt-token-admin');
          return of({
            success: true,
            user: user,
            message: 'Đăng nhập thành công! Chào mừng Quản Trị Viên!',
            token: 'mock-jwt-token-admin'
          });
        } else if (loginData.email === 'user@example.com' && loginData.password === 'user123') {
          const user: User = {
            id: 2,
            email: loginData.email,
            name: 'Nguyễn Văn A',
            phone: '0987654321',
            address: 'TP.HCM, Việt Nam',
            avatar: 'assets/images/avatar-user.png',
            role: 'user',
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date(),
            orders: [],
            wishlist: [2, 4, 5]
          };
          
          this.saveUserToStorage(user, 'mock-jwt-token-user');
          return of({
            success: true,
            user: user,
            message: 'Đăng nhập thành công! Chào mừng Nguyễn Văn A!',
            token: 'mock-jwt-token-user'
          });
        } else if (loginData.email === 'test@example.com' && loginData.password === 'test123') {
          const user: User = {
            id: 3,
            email: loginData.email,
            name: 'Người Dùng Test',
            phone: '0912345678',
            address: 'Đà Nẵng, Việt Nam',
            avatar: 'assets/images/avatar-user.png',
            role: 'user',
            createdAt: new Date('2024-03-01'),
            updatedAt: new Date(),
            orders: [],
            wishlist: [1, 2, 3]
          };
          
          this.saveUserToStorage(user, 'mock-jwt-token-test');
          return of({
            success: true,
            user: user,
            message: 'Đăng nhập thành công! Chào mừng Người Dùng Test!',
            token: 'mock-jwt-token-test'
          });
        } else {
          return of({
            success: false,
            message: 'Email hoặc mật khẩu không chính xác!'
          });
        }
      })
    );
  }

  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return of(null).pipe(
      delay(1500),
      switchMap(() => {
        // Kiểm tra điều khoản
        if (!registerData.agreeToTerms) {
          return of({
            success: false,
            message: 'Vui lòng đồng ý với điều khoản sử dụng!'
          });
        }

        const existingUser = this.getUserByEmail(registerData.email);
        if (existingUser) {
          return of({
            success: false,
            message: 'Email đã được sử dụng!'
          });
        }

        if (registerData.password !== registerData.confirmPassword) {
          return of({
            success: false,
            message: 'Mật khẩu xác nhận không khớp!'
          });
        }

        if (registerData.password.length < 6) {
          return of({
            success: false,
            message: 'Mật khẩu phải có ít nhất 6 ký tự!'
          });
        }

        const newUser: User = {
          id: Date.now(),
          email: registerData.email,
          name: registerData.name,
          phone: registerData.phone || '',
          address: '',
          avatar: 'assets/images/avatar-default.png',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
          orders: [],
          wishlist: []
        };

        this.saveUserToStorage(newUser, 'mock-jwt-token-new-user');
        
        return of({
          success: true,
          user: newUser,
          message: 'Đăng ký thành công! Chào mừng ' + registerData.name + '!',
          token: 'mock-jwt-token-new-user'
        });
      })
    );
  }

  logout(): Observable<{ success: boolean; message: string }> {
    const userName = this.currentUser?.name || 'Người dùng';
    this.clearStorage();
    return of({
      success: true,
      message: `Đăng xuất thành công! Tạm biệt ${userName}!`
    });
  }

  getCurrentUser(): Observable<User | null> {
    return of(this.currentUser);
  }

  isLoggedInObservable(): Observable<boolean> {
    return of(this.isLoggedIn);
  }

  isAdmin(): Observable<boolean> {
    return of(this.currentUser?.role === 'admin');
  }

  isAdminSync(): boolean {
    return this.currentUser?.role === 'admin';
  }

  updateProfile(profileData: ProfileUpdateRequest): Observable<AuthResponse> {
    return of(null).pipe(
      delay(800),
      switchMap(() => {
        if (!this.currentUser) {
          return of({
            success: false,
            message: 'Người dùng chưa đăng nhập!'
          });
        }

        const updatedUser: User = {
          ...this.currentUser,
          name: profileData.name,
          phone: profileData.phone,
          address: profileData.address,
          avatar: profileData.avatar || this.currentUser.avatar,
          updatedAt: new Date()
        };

        const token = localStorage.getItem(this.TOKEN_KEY);
        if (token) {
          this.saveUserToStorage(updatedUser, token);
        }

        return of({
          success: true,
          user: updatedUser,
          message: 'Cập nhật thông tin thành công!'
        });
      })
    );
  }

  changePassword(passwordData: ChangePasswordRequest): Observable<{ success: boolean; message: string }> {
    return of(null).pipe(
      delay(800),
      switchMap(() => {
        const currentPasswordValid = this.validateCurrentPassword(passwordData.currentPassword);
        
        if (!currentPasswordValid) {
          return of({
            success: false,
            message: 'Mật khẩu hiện tại không chính xác!'
          });
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
          return of({
            success: false,
            message: 'Mật khẩu xác nhận không khớp!'
          });
        }

        if (passwordData.newPassword.length < 6) {
          return of({
            success: false,
            message: 'Mật khẩu phải có ít nhất 6 ký tự!'
          });
        }

        if (passwordData.newPassword === passwordData.currentPassword) {
          return of({
            success: false,
            message: 'Mật khẩu mới phải khác mật khẩu hiện tại!'
          });
        }

        return of({
          success: true,
          message: 'Đổi mật khẩu thành công!'
        });
      })
    );
  }

  addToWishlist(productId: number): Observable<{ success: boolean; message: string }> {
    if (!this.currentUser) {
      return of({
        success: false,
        message: 'Vui lòng đăng nhập để thêm vào wishlist!'
      });
    }

    if (!this.currentUser.wishlist) {
      this.currentUser.wishlist = [];
    }

    if (this.currentUser.wishlist.includes(productId)) {
      return of({
        success: false,
        message: 'Sản phẩm đã có trong wishlist!'
      });
    }

    this.currentUser.wishlist.push(productId);
    this.currentUser.updatedAt = new Date();
    
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      this.saveUserToStorage(this.currentUser, token);
    }

    return of({
      success: true,
      message: 'Đã thêm vào wishlist!'
    });
  }

  removeFromWishlist(productId: number): Observable<{ success: boolean; message: string }> {
    if (!this.currentUser || !this.currentUser.wishlist) {
      return of({
        success: false,
        message: 'Không tìm thấy sản phẩm trong wishlist!'
      });
    }

    const initialLength = this.currentUser.wishlist.length;
    this.currentUser.wishlist = this.currentUser.wishlist.filter(id => id !== productId);
    
    if (this.currentUser.wishlist.length === initialLength) {
      return of({
        success: false,
        message: 'Sản phẩm không có trong wishlist!'
      });
    }

    this.currentUser.updatedAt = new Date();
    
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      this.saveUserToStorage(this.currentUser, token);
    }

    return of({
      success: true,
      message: 'Đã xóa khỏi wishlist!'
    });
  }

  getWishlist(): Observable<number[]> {
    return of(this.currentUser?.wishlist || []);
  }

  clearWishlist(): Observable<{ success: boolean; message: string }> {
    if (!this.currentUser) {
      return of({
        success: false,
        message: 'Người dùng chưa đăng nhập!'
      });
    }

    this.currentUser.wishlist = [];
    this.currentUser.updatedAt = new Date();
    
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      this.saveUserToStorage(this.currentUser, token);
    }

    return of({
      success: true,
      message: 'Đã xóa tất cả sản phẩm khỏi wishlist!'
    });
  }

  // Helper methods
  private getUserByEmail(email: string): User | null {
    const users: User[] = [
      {
        id: 1,
        email: 'admin@athengaudio.com',
        name: 'Quản Trị Viên',
        role: 'admin',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        orders: [],
        wishlist: []
      },
      {
        id: 2,
        email: 'user@example.com',
        name: 'Nguyễn Văn A',
        role: 'user',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date(),
        orders: [],
        wishlist: []
      },
      {
        id: 3,
        email: 'test@example.com',
        name: 'Người Dùng Test',
        role: 'user',
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date(),
        orders: [],
        wishlist: []
      }
    ];
    
    return users.find(user => user.email === email) || null;
  }

  private validateCurrentPassword(password: string): boolean {
    // Mock validation - trong thực tế sẽ kiểm tra với server
    // Ở đây coi như mật khẩu nào cũng đúng cho demo
    return password.length >= 1;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  refreshToken(): Observable<string> {
    const newToken = 'mock-refreshed-jwt-token-' + Date.now();
    localStorage.setItem(this.TOKEN_KEY, newToken);
    return of(newToken);
  }

  hasPermission(permission: string): Observable<boolean> {
    if (!this.currentUser) {
      return of(false);
    }

    const permissions: { [key: string]: string[] } = {
      'admin': [
        'manage_products', 
        'manage_users', 
        'view_reports', 
        'manage_orders',
        'manage_categories',
        'view_dashboard'
      ],
      'user': [
        'view_products', 
        'place_orders', 
        'manage_wishlist',
        'view_profile',
        'write_reviews'
      ]
    };

    const userPermissions = permissions[this.currentUser.role] || [];
    return of(userPermissions.includes(permission));
  }

  // Method để lấy user initials cho avatar
  getUserInitials(): string {
    if (!this.currentUser?.name) return 'U';
    return this.currentUser.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Method để kiểm tra xem user có phải là admin không (sync)
  checkAdminAccess(): boolean {
    return this.isLoggedIn && this.isAdminSync();
  }

  // Method để lấy thông tin user đơn giản
  getUserInfo(): { name: string; email: string; role: string; avatar?: string } | null {
    if (!this.currentUser) return null;
    
    return {
      name: this.currentUser.name,
      email: this.currentUser.email,
      role: this.currentUser.role,
      avatar: this.currentUser.avatar
    };
  }

  // Method để simulate token expiration
  simulateTokenExpiration(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
  }
}