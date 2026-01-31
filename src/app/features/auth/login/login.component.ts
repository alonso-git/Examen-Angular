import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-login',
  standalone: true,
  // Make available everythin HTML needs
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  // Dependency injection
  private fb = inject(FormBuilder);
  private authServcice = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Form definition
  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  // Signals for reactive UI
  hidePassword = signal(true);
  isLoading = signal(false);

  togglePassword(event: MouseEvent) {
    this.hidePassword.update((value) => !value);
    event.stopPropagation();
  }

  obtainCredentials() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      panelClass: 'dialog-container',
      data: {
        title: 'Credenciales',
        message: 'Usuario: johnd\nContraseña: m38rmF$',
      },
    });
  }

  onSubmit() {
    this.isLoading.set(true);

    if (this.loginForm.invalid) return;

    const { username, password } = this.loginForm.value;

    this.authServcice.login(username!, password!).subscribe({
      next: () => {
        this.router.navigate(['/products']);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.snackBar.open('Error: Credenciales inválidas', 'Cerrar', { duration: 3000 });
        console.error(err);
        this.loginForm.reset();
        this.isLoading.set(false);
      },
    });
  }
}
