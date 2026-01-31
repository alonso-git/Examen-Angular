import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { ProductFormComponent } from './features/products/product-form/product-form.component';
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [publicGuard], // Authenticated users cannot login again
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard], // Unauthenticated users cannot access the site
    children: [
      // Make the main layout part of all its childrens
      { path: 'products', component: ProductListComponent },
      { path: 'products/add', component: ProductFormComponent },
      { path: 'products/edit/:id', component: ProductFormComponent },
      { path: '', redirectTo: 'products', pathMatch: 'full' },
    ],
  },
  // Any unknown route leads to login
  { path: '**', redirectTo: 'login' },
];
