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
    path: 'experts',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'tools/menstrual',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'tools/ovulation',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'tools/pregnancy',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'tools/pregnancy-test',
    renderMode: RenderMode.Prerender
  },
  // Dynamic routes - Tắt prerender, dùng Server
  {
    path: 'posts/:slug',
    renderMode: RenderMode.Server // Thay vì Prerender
  },
  {
    path: 'expert/:id',
    renderMode: RenderMode.Server // Thay vì Prerender
  },
  {
    path: 'chat/:expertId',
    renderMode: RenderMode.Server // Thay vì Prerender
  },
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
