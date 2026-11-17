export type MozOperator = 'Vodacom' | 'Tmcel' | 'Movitel' | 'Outro';
export type AlertChannel = 'sms' | 'whatsapp' | 'ambos';
export type ClimateAlertType = 'ciclone' | 'rajadas' | 'seca' | 'chuva_intensa' | 'praga';

export interface AlertSubscriber {
  id: string;
  name: string;
  phone: string;
  operator: MozOperator;
  district: string;
  locality: string;
  crop: string;
  channel: AlertChannel;
  active: boolean;
  createdAt: string;
}

export interface AlertDispatchLog {
  id: string;
  district: string;
  alertType: ClimateAlertType;
  severity: 'Crítico' | 'Alerta' | 'Preventivo';
  message: string;
  channel: AlertChannel;
  totalRecipients: number;
  apiDeliveredCount: number;
  providerUsed: string;
  operatorBreakdown: Record<MozOperator, number>;
  createdAt: string;
}

export interface GatewayCapabilities {
  smsGatewayConfigured: boolean;
  whatsappGatewayConfigured: boolean;
  providers: {
    twilio: boolean;
    africasTalking: boolean;
    whatsappCloud: boolean;
  };
}

export interface ClimateHazardEvaluation {
  type: ClimateAlertType;
  severity: 'Crítico' | 'Alerta' | 'Preventivo';
  title: string;
  metricSummary: string;
  suggestedSms: string;
}

export interface DistrictClimateCheckResult {
  district: string;
  source: string;
  metrics: {
    maxGustsKmH: number;
    maxWindKmH: number;
    maxDailyRainMm: number;
    total7dRainMm: number;
    maxTempC: number;
    avgEt0Mm: number;
  };
  hazards: ClimateHazardEvaluation[];
}

export interface DirectRecipientLink {
  id: string;
  name: string;
  phone: string;
  operator: MozOperator;
  district: string;
  whatsappUrl: string;
  smsUrl: string;
}

export const ClimateAlertService = {
  detectLocalOperator(rawPhone: string): MozOperator {
    const digits = rawPhone.replace(/\D/g, '').replace(/^258/, '');
    if (digits.startsWith('84') || digits.startsWith('85')) return 'Vodacom';
    if (digits.startsWith('82') || digits.startsWith('83')) return 'Tmcel';
    if (digits.startsWith('86') || digits.startsWith('87')) return 'Movitel';
    return 'Outro';
  },

  async fetchOverview(): Promise<{
    gateway: GatewayCapabilities;
    subscribers: AlertSubscriber[];
    dispatchLogs: AlertDispatchLog[];
  }> {
    const res = await fetch('/api/alerts/overview');
    if (!res.ok) throw new Error('Falha ao carregar painel de alertas.');
    return res.json();
  },

  async checkDistrictClimate(district: string): Promise<DistrictClimateCheckResult> {
    const res = await fetch(`/api/alerts/climate-check?district=${encodeURIComponent(district)}`);
    if (!res.ok) throw new Error('Falha ao verificar previsão climática.');
    return res.json();
  },

  async addSubscriber(payload: {
    name: string;
    phone: string;
    district: string;
    locality: string;
    crop: string;
    channel: AlertChannel;
  }): Promise<AlertSubscriber> {
    const res = await fetch('/api/alerts/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Não foi possível registar o contacto.');
    }
    return data.subscriber;
  },

  async toggleSubscriberActive(id: string, active: boolean): Promise<AlertSubscriber> {
    const res = await fetch(`/api/alerts/subscribers/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Erro ao atualizar estado.');
    return data.subscriber;
  },

  async deleteSubscriber(id: string): Promise<void> {
    const res = await fetch(`/api/alerts/subscribers/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Erro ao remover subscritor.');
  },

  async dispatchAlert(payload: {
    district: string;
    alertType: ClimateAlertType;
    severity: 'Crítico' | 'Alerta' | 'Preventivo';
    message: string;
    channel: AlertChannel;
  }): Promise<{ log: AlertDispatchLog; directLinks: DirectRecipientLink[] }> {
    const res = await fetch('/api/alerts/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Falha ao enviar alerta climático.');
    }
    return { log: data.log, directLinks: data.directLinks || [] };
  }
};
