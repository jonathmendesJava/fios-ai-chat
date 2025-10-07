import type { ChatCategory } from '@/types/chat';

export const WEBHOOK_CONFIGS: Record<ChatCategory, { url: string; enabled: boolean }> = {
  'financeiro': {
    url: 'https://api-n8n.fios.net.br/webhook/330d0161-65a4-4e78-b977-739773d812cc',
    enabled: true
  },
  'suporte-tecnico': {
    url: '', // Webhook a ser configurado futuramente
    enabled: false
  },
  'comercial': {
    url: '', // Webhook a ser configurado futuramente
    enabled: false
  },
  'infra': {
    url: '', // Webhook a ser configurado futuramente
    enabled: false
  }
};

export const CATEGORY_NAMES: Record<ChatCategory, string> = {
  'financeiro': 'Financeiro',
  'suporte-tecnico': 'Suporte Técnico',
  'comercial': 'Comercial',
  'infra': 'Infraestrutura'
};
