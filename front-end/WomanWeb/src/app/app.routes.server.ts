import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'library',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'expert',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'tools',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'menstrual',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'ovulation',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'pregnancy',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'pregnancy-test',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  // Dynamic routes - Server-side rendering
  {
    path: 'posts/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'expert/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'chat',
    renderMode: RenderMode.Server
  },
  {
    path: 'chat/:expertId',
    renderMode: RenderMode.Server
  },
  {
    path: 'profile',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
