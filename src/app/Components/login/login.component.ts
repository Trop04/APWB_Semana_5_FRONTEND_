import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  sessionExpired = false;
  returnUrl = '/productos';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Verificar si la sesión expiró
    this.route.queryParams.subscribe(params => {
      this.sessionExpired = params['sessionExpired'] === 'true';
      this.returnUrl = params['returnUrl'] || '/productos';
    });

    // Redirigir si ya está autenticado
    this.authService.isAuthenticated$
      .subscribe(isAuth => {
        if (isAuth) {
          this.router.navigateByUrl(this.returnUrl);
        }
      });

    this.authService.isAuthenticated$.subscribe(value => {
      console.log("Auth state:", value);
    });



    // Inicializar formulario con validaciones
    this.loginForm = this.formBuilder.group({
      nombreUsuario: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  get nombreUsuario() {
    return this.loginForm.get('nombreUsuario');
  }

  get password() {
    return this.loginForm.get('password');
  }

  hasError(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);

    if (control?.hasError('required')) {
      return `${this.getFieldLabel(controlName)} es obligatorio`;
    }

    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${this.getFieldLabel(controlName)} debe tener al menos ${minLength} caracteres`;
    }

    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `${this.getFieldLabel(controlName)} no puede exceder ${maxLength} caracteres`;
    }

    return '';
  }

  private getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      'nombreUsuario': 'Nombre de usuario',
      'password': 'Contraseña'
    };
    return labels[controlName] || controlName;
  }

  onSubmit(): void {
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Login exitoso');
          this.router.navigate([this.returnUrl]);
        } else {
          this.errorMessage = response.message;
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.errorMessage = error.message || 'Error al iniciar sesión';
        this.loading = false;
      }
    });
  }

  clearError(): void {
    this.errorMessage = '';
    this.sessionExpired = false;
  }
}
