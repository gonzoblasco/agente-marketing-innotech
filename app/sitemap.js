import { getAllAgents } from './lib/supabase';

export default async function sitemap() {
  const baseUrl = 'https://agente-marketing-innotech.vercel.app';

  // URLs estáticas
  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  // URLs dinámicas de agentes
  try {
    const agents = await getAllAgents();
    const agentUrls = agents.map((agent) => ({
      url: `${baseUrl}/chat/${agent.id}`,
      lastModified: new Date(
        agent.updated_at || agent.created_at || new Date()
      ),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticUrls, ...agentUrls];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticUrls;
  }
}
