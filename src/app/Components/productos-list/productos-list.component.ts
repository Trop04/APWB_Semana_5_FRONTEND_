import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Producto } from '../../Models/models';
import { ProductoService } from '../../Services/producto.service';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './productos-list.component.html',
  styleUrls: ['./productos-list.component.css']
})
export class ProductosListComponent implements OnInit, OnDestroy {
  productos: Producto[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  currentUser: any;
  private destroy$ = new Subject<void>();

  deletingId: number | null = null;
  showDeleteConfirm = false;
  productToDelete: Producto | null = null;

  constructor(
    private productoService: ProductoService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadProductos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProductos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.productoService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (productos) => {
          this.productos = productos;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando productos:', error);
          this.errorMessage = error.message || 'Error al cargar los productos';
          this.loading = false;
        }
      });
  }

  crear(): void {
    this.router.navigate(['/productos/nuevo']);
  }

  editar(id: number): void {
    this.router.navigate(['/productos/editar', id]);
  }

  confirmarEliminar(producto: Producto): void {
    this.productToDelete = producto;
    this.showDeleteConfirm = true;
  }

  cancelarEliminar(): void {
    this.showDeleteConfirm = false;
    this.productToDelete = null;
  }

  eliminar(): void {
    if (!this.productToDelete) return;

    const id = this.productToDelete.id;
    this.deletingId = id;
    this.errorMessage = '';
    this.showDeleteConfirm = false;

    this.productoService.delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Producto eliminado exitosamente';
          this.productos = this.productos.filter(p => p.id !== id);
          this.deletingId = null;
          this.productToDelete = null;

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Error eliminando producto:', error);
          this.errorMessage = error.message || 'Error al eliminar el producto';
          this.deletingId = null;
          this.productToDelete = null;
        }
      });
  }

  logout(): void {
    this.authService.logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Error en logout:', error);
          this.router.navigate(['/login']);
        }
      });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(d);
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
