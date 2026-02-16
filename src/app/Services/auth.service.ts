import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoginRequest, LoginResponse, Usuario, RegistroRequest, ApiResponse } from '../Models/models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'https://localhost:7296/api/Auth';
    private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        this.checkAuthStatus();
    }

    /**
     * Verifica el estado de autenticación al iniciar
     */
  private checkAuthStatus(): void {
    this.validateSession().subscribe({
      next: (response) => {
        if (response.success && response.usuario) {
          this.currentUserSubject.next(response.usuario);
          this.isAuthenticatedSubject.next(true);
        } else {
          this.isAuthenticatedSubject.next(false);
        }
      },
      error: () => {
        if (!this.currentUserSubject.value) {
          this.isAuthenticatedSubject.next(false);
        }
      }
    });
  }


    /**
     * El Login
     */
    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials, {
            withCredentials: true 
        }).pipe(
            tap(response => {
                if (response.success && response.usuario) {
                    this.currentUserSubject.next(response.usuario);
                    this.isAuthenticatedSubject.next(true);
                }
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Registro de nuevo usuario
     */
    register(data: RegistroRequest): Observable<ApiResponse<Usuario>> {
        return this.http.post<ApiResponse<Usuario>>(`${this.apiUrl}/register`, data).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Logout de usuario
     */
    logout(): Observable<any> {
        return this.http.post(`${this.apiUrl}/logout`, {}, {
            withCredentials: true
        }).pipe(
            tap(() => {
                this.currentUserSubject.next(null);
                this.isAuthenticatedSubject.next(false);
                this.router.navigate(['/login']);
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Valida la sesión actual
     */
  validateSession(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/validate`, {
      withCredentials: true
    });
  }


    /**
     * Obtiene el usuario actual
     */
    getCurrentUser(): Usuario | null {
        return this.currentUserSubject.value;
    }

    /**
     * Verifica si el usuario está autenticado
     */
    isAuthenticated(): boolean {
        return this.isAuthenticatedSubject.value;
    }

    /**
     * Manejo de errores
     */
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Ocurrió un error desconocido';

        if (error.error instanceof ErrorEvent) {
            // Error del lado del cliente
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Error del lado del servidor
            if (error.status === 401) {
                errorMessage = 'Credenciales inválidas o sesión expirada';
            } else if (error.status === 403) {
                errorMessage = 'No tiene permisos para realizar esta acción';
            } else if (error.status === 400) {
                errorMessage = error.error?.message || 'Datos inválidos';
            } else if (error.status === 0) {
                errorMessage = 'No se pudo conectar con el servidor';
            } else {
                errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
            }
        }

        console.error('Error en AuthService:', error);
        return throwError(() => new Error(errorMessage));
    }
}
