import { Routes } from '@angular/router';
import { AuthGuard } from './Guards/auth.guard';
import { LoginComponent } from './Components/login/login.component';
import { ProductosListComponent } from './Components/productos-list/productos-list.component';
import { ProductoFormComponent } from './Components/productos-form/productos-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/productos', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'productos',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: ProductosListComponent },
      { path: 'nuevo', component: ProductoFormComponent },
      { path: 'editar/:id', component: ProductoFormComponent }
    ]
  },
  { path: '**', redirectTo: '/productos' }
];
