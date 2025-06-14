export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/sign-in/', '/sign-up/'],
    },
    sitemap: 'https://agente-marketing-innotech.vercel.app/sitemap.xml',
  };
}
