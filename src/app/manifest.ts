import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cardlisher',
    short_name: 'Cardlisher',
    description: 'A flashcard app',
    start_url: '/appenter',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/app-icon/32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/app-icon/64x64.png',
        sizes: '64x64',
        type: 'image/png',
      },
      {
        src: '/app-icon/128x128.png',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        src: '/app-icon/128x128@2x.png',
        sizes: '256x256',
        type: 'image/png',
      },
    ],
    screenshots: [
      {
        src: '/screenshots/1.png',
        form_factor: 'wide',
        label: 'Main screen',
        sizes: '1919x1079',
      },
      {
        src: '/screenshots/2.png',
        form_factor: 'narrow',
        label: 'Main screen',
        sizes: '386x866',
      },
    ],
  };
}
