import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthSessionService } from '../../../contexts/auth/application/services/auth-session.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar" *ngIf="session.user() as user">
      <div class="nav-container">
        <div class="nav-links">
          <a *ngIf="isAdmin()" routerLink="/dashboard" routerLinkActive="active">Panel de control</a>
          <a *ngIf="!isClient()" routerLink="/operations" routerLinkActive="active">Paquetes</a>
          <a *ngIf="isClient()" routerLink="/client/packages" routerLinkActive="active">Mis paquetes</a>
          <a *ngIf="isAdmin()" routerLink="/clients" routerLinkActive="active">Clientes</a>
          <a *ngIf="isAdmin()" routerLink="/operators" routerLinkActive="active">Operadores</a>
          <a routerLink="/profile" routerLinkActive="active">Perfil</a>
        </div>
        <div class="user-actions">
          <span class="user-info">{{ user.name }} ({{ roleNames[user.role] || user.role }})</span>
          <button (click)="session.logout()" class="logout-btn">Cerrar sesión</button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 0 24px;
      margin-bottom: 24px;
    }
    .nav-container {
      max-width: 1180px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 64px;
    }
    .nav-links {
      display: flex;
      gap: 4px;
      height: 100%;
      align-items: center;
    }
    .nav-links a {
      color: #64748b;
      text-decoration: none;
      padding: 0 16px;
      height: 100%;
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: 500;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    .nav-links a:hover {
      color: #0f766e;
      background: #f1f5f9;
    }
    .nav-links a.active {
      color: #0f766e;
      border-bottom-color: #0f766e;
      background: #f0fdfa;
    }
    .user-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .user-info {
      font-size: 13px;
      color: #64748b;
    }
    .logout-btn {
      background: #fff;
      border: 1px solid #e2e8f0;
      color: #64748b;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .logout-btn:hover {
      background: #fee2e2;
      color: #991b1b;
      border-color: #fecaca;
    }
    @media (max-width: 768px) {
      .navbar {
        padding: 12px;
      }
      .nav-container {
        flex-direction: column;
        height: auto;
        gap: 12px;
        align-items: flex-start;
      }
      .nav-links {
        width: 100%;
        overflow-x: auto;
        padding-bottom: 4px;
      }
      .nav-links a {
        height: 40px;
        white-space: nowrap;
      }
      .user-actions {
        width: 100%;
        justify-content: space-between;
      }
    }
  `]
})
export class NavbarComponent {
  readonly session = inject(AuthSessionService);
  readonly roleNames: Record<string, string> = {
    admin: 'Administrador',
    operator: 'Operador',
    client: 'Cliente',
  };

  isAdmin(): boolean {
    return this.session.user()?.role === 'admin';
  }

  isClient(): boolean {
    return this.session.user()?.role === 'client';
  }
}
