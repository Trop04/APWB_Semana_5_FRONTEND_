import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Producto, CrearProducto, ActualizarProducto, ApiResponse } from '../Models/models';

@Injectable({
    providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'https://localhost:7296/api/productos'; 

    constructor(private http: HttpClient) { }

    /**
     * Obtener todos los productos
     */
    getAll(): Observable<Producto[]> {
        return this.http.get<ApiResponse<Producto[]>>(this.apiUrl, {
            withCredentials: true
        }).pipe(
            map(response => {
                if (response.success && response.data) {
                    return response.data;
                }
                throw new Error(response.message || 'Error al obtener productos');
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Obtener producto por ID
     */
    getById(id: number): Observable<Producto> {
        return this.http.get<ApiResponse<Producto>>(`${this.apiUrl}/${id}`, {
            withCredentials: true
        }).pipe(
            map(response => {
                if (response.success && response.data) {
                    return response.data;
                }
                throw new Error(response.message || 'Producto no encontrado');
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Crear nuevo producto
     */
    create(producto: CrearProducto): Observable<Producto> {
        return this.http.post<ApiResponse<Producto>>(this.apiUrl, producto, {
            withCredentials: true
        }).pipe(
            map(response => {
                if (response.success && response.data) {
                    return response.data;
                }
                throw new Error(response.message || 'Error al crear producto');
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Actualizar producto existente
     */
    update(id: number, producto: ActualizarProducto): Observable<Producto> {
        return this.http.put<ApiResponse<Producto>>(`${this.apiUrl}/${id}`, producto, {
            withCredentials: true
        }).pipe(
            map(response => {
                if (response.success && response.data) {
                    return response.data;
                }
                throw new Error(response.message || 'Error al actualizar producto');
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Eliminar producto
     */
    delete(id: number): Observable<boolean> {
        return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`, {
            withCredentials: true
        }).pipe(
            map(response => {
                if (response.success) {
                    return true;
                }
                throw new Error(response.message || 'Error al eliminar producto');
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Manejo centralizado de errores
     */
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Ocurrió un error desconocido';

        if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
        } else {
            if (error.status === 401) {
                errorMessage = 'No autorizado. Por favor, inicie sesión nuevamente';
            } else if (error.status === 403) {
                errorMessage = 'No tiene permisos para realizar esta acción';
            } else if (error.status === 404) {
                errorMessage = 'Producto no encontrado';
            } else if (error.status === 400) {
                const apiError = error.error as ApiResponse<any>;
                errorMessage = apiError?.message || 'Datos inválidos';
                if (apiError?.errors && apiError.errors.length > 0) {
                    errorMessage += ': ' + apiError.errors.join(', ');
                }
            } else if (error.status === 0) {
                errorMessage = 'No se pudo conectar con el servidor';
            } else {
                const apiError = error.error as ApiResponse<any>;
                errorMessage = apiError?.message || `Error del servidor: ${error.status}`;
            }
        }

        console.error('Error en ProductoService:', error);
        return throwError(() => new Error(errorMessage));
    }
}
