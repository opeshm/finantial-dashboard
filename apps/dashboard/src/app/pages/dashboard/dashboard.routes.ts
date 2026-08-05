import { Routes } from '@angular/router';
import { AppLayoutComponent } from '../../shared/layout/app-layout/app-layout.component';
import { EcommerceComponent } from './ecommerce/ecommerce.component';
import { ProfileComponent } from '../profile/profile.component';
import { FormElementsComponent } from '../forms/form-elements/form-elements.component';
import { BasicTablesComponent } from '../tables/basic-tables/basic-tables.component';
import { BlankComponent } from '../blank/blank.component';
import { NotFoundComponent } from '../other-page/not-found/not-found.component';
import { InvoicesComponent } from '../invoices/invoices.component';
import { LineChartComponent } from '../charts/line-chart/line-chart.component';
import { BarChartComponent } from '../charts/bar-chart/bar-chart.component';
import { AlertsComponent } from '../ui-elements/alerts/alerts.component';
import { AvatarElementComponent } from '../ui-elements/avatar-element/avatar-element.component';
import { BadgesComponent } from '../ui-elements/badges/badges.component';
import { ButtonsComponent } from '../ui-elements/buttons/buttons.component';
import { ImagesComponent } from '../ui-elements/images/images.component';
import { VideosComponent } from '../ui-elements/videos/videos.component';
import { CalenderComponent } from '../calender/calender.component';
import { CompoundInterestComponent } from '../simulations/compound-interest/compound-interest.component';
import { DcaHistoricalComponent } from '../../features/dca-historical/ui/dca-historical.component';

/**
 * All authenticated dashboard routes are nested under AppLayoutComponent
 * (which provides the sidebar + header shell).
 * The parent route /dashboard is protected by authGuard in app.routes.ts.
 */
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: '',
        component: EcommerceComponent,
        pathMatch: 'full',
        title: 'Angular Ecommerce Dashboard | TailAdmin',
      },
      {
        path: 'calendar',
        component: CalenderComponent,
        title: 'Angular Calendar | TailAdmin',
      },
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'Angular Profile | TailAdmin',
      },
      {
        path: 'form-elements',
        component: FormElementsComponent,
        title: 'Angular Form Elements | TailAdmin',
      },
      {
        path: 'basic-tables',
        component: BasicTablesComponent,
        title: 'Angular Basic Tables | TailAdmin',
      },
      {
        path: 'blank',
        component: BlankComponent,
        title: 'Angular Blank | TailAdmin',
      },
      {
        path: 'invoice',
        component: InvoicesComponent,
        title: 'Angular Invoice | TailAdmin',
      },
      {
        path: 'line-chart',
        component: LineChartComponent,
        title: 'Angular Line Chart | TailAdmin',
      },
      {
        path: 'bar-chart',
        component: BarChartComponent,
        title: 'Angular Bar Chart | TailAdmin',
      },
      {
        path: 'alerts',
        component: AlertsComponent,
        title: 'Angular Alerts | TailAdmin',
      },
      {
        path: 'avatars',
        component: AvatarElementComponent,
        title: 'Angular Avatars | TailAdmin',
      },
      {
        path: 'badge',
        component: BadgesComponent,
        title: 'Angular Badges | TailAdmin',
      },
      {
        path: 'buttons',
        component: ButtonsComponent,
        title: 'Angular Buttons | TailAdmin',
      },
      {
        path: 'images',
        component: ImagesComponent,
        title: 'Angular Images | TailAdmin',
      },
      {
        path: 'videos',
        component: VideosComponent,
        title: 'Angular Videos | TailAdmin',
      },
      {
        path: 'simulations/compound-interest',
        component: CompoundInterestComponent,
        title: 'Simulador de Interés Compuesto | Dashboard',
      },
      {
        path: 'simulations/dca-historical',
        component: DcaHistoricalComponent,
        title: 'Simulador DCA Histórico | Dashboard',
      },
      {
        path: '**',
        component: NotFoundComponent,
        title: 'Página no encontrada | Dashboard',
      },
    ],
  },
];
