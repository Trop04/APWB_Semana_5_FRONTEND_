// auth.models.ts
export interface LoginRequest {
    nombreUsuario: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    usuario?: Usuario;
}

export interface Usuario {
    id: number;
    nombreUsuario: string;
    email: string;
    ultimoAcceso?: Date;
}

export interface RegistroRequest {
    nombreUsuario: string;
    email: string;
    password: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    errors?: string[];
}

// producto.models.ts
export interface Producto {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    precio: number;
    stock: number;
    activo: boolean;
    fechaCreacion: Date;
    fechaModificacion?: Date;
    usuarioCreacion?: string;
}

export interface CrearProducto {
    codigo: string;
    nombre: string;
    descripcion?: string;
    precio: number;
    stock: number;
}

export interface ActualizarProducto {
    codigo: string;
    nombre: string;
    descripcion?: string;
    precio: number;
    stock: number;
    activo: boolean;
}