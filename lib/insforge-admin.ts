import { createAdminClient, type InsForgeClient } from '@insforge/sdk';

let adminClient: InsForgeClient | null = null;

/** Cliente admin (API key) para operaciones de servidor. */
export function getInsforgeAdmin(): InsForgeClient {
  if (!adminClient) {
    const baseUrl = process.env.INSFORGE_URL ?? process.env.NEXT_PUBLIC_INSFORGE_URL;
    const apiKey = process.env.INSFORGE_API_KEY;
    if (!baseUrl || !apiKey) {
      throw new Error('Faltan INSFORGE_URL (o NEXT_PUBLIC_INSFORGE_URL) o INSFORGE_API_KEY');
    }
    adminClient = createAdminClient({ baseUrl, apiKey });
  }
  return adminClient;
}
