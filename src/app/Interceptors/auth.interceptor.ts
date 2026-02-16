import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Clonar la petición para agregar withCredentials
  const authReq = req.clone({
    withCredentials: true,
    setHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Obtener token XSRF de la cookie si existe
  const xsrfToken = getCookie('XSRF-TOKEN');
  let finalReq = authReq;

  if (xsrfToken && (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE')) {
    finalReq = authReq.clone({
      setHeaders: {
        'X-XSRF-TOKEN': xsrfToken
      }
    });
  }

  return next(finalReq).pipe(
    catchError((error: HttpErrorResponse) => {

      const isAuthEndpoint =
        req.url.includes('/api/Auth/login') ||
        req.url.includes('/api/Auth/validate') ||
        req.url.includes('/api/Auth/register');

      if (error.status === 401 && !isAuthEndpoint) {
        console.error('Sesión expirada. Redirigiendo a login...');
        router.navigate(['/login'], {
          queryParams: { returnUrl: router.url, sessionExpired: true }
        });
      }

      if (error.status === 403) {
        console.error('Acceso prohibido');
      }

      if (error.status === 0) {
        console.error('Error de conexión con el servidor');
      }

      return throwError(() => error);
    })
  );
};

function getCookie(name: string): string | null {
  const nameLenPlus = (name.length + 1);
  return document.cookie
    .split(';')
    .map(c => c.trim())
    .filter(cookie => cookie.substring(0, nameLenPlus) === `${name}=`)
    .map(cookie => decodeURIComponent(cookie.substring(nameLenPlus)))[0] || null;
}
