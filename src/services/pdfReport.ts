/**
 * AgroResiliente Inhambane - PDF Export Service
 * Generates official PDF reports for producer security audit, 2FA backup codes, and agricultural market bulletins.
 */

import { jsPDF } from 'jspdf';
import { User, AuditLog, MarketPrice, CropCycle } from '../types/auth';

export const PdfReportService = {
  /**
   * Export security certificate and producer account credentials summary
   */
  exportSecurityReport(user: User, logs: AuditLog[]) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryGreen = [26, 122, 76]; // #1A7A4C
    const darkGreen = [15, 74, 46];

    // Header bar
    doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.rect(0, 0, 210, 24, 'F');

    // Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('AGRORESILIENTE INHAMBANE', 14, 12);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Plataforma Digital de Apoio ao Produtor Familiar · Homoíne · Moçambique', 14, 18);

    // Document Title
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('RELATÓRIO DE CONTA E AUDITORIA DE SEGURANÇA', 14, 36);

    const issueDate = new Date().toLocaleString('pt-MZ', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Emitido em: ${issueDate} | Referência: MZ-AGRO-${user.id.toUpperCase()}`, 14, 42);

    // Section 1: Dados do Produtor
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 46, 196, 46);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
    doc.text('1. DADOS DE IDENTIFICAÇÃO DO PRODUTOR', 14, 53);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);

    const leftColX = 14;
    const rightColX = 110;
    let y = 60;

    doc.text(`Nome Completo:`, leftColX, y);
    doc.setFont('helvetica', 'bold');
    doc.text(user.name, leftColX + 32, y);

    doc.setFont('helvetica', 'normal');
    doc.text(`Telefone (M-Pesa/e-Mola):`, rightColX, y);
    doc.setFont('helvetica', 'bold');
    doc.text(user.phone, rightColX + 42, y);

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(`E-mail Registado:`, leftColX, y);
    doc.setFont('helvetica', 'bold');
    doc.text(user.email || 'Não associado', leftColX + 32, y);

    doc.setFont('helvetica', 'normal');
    doc.text(`Localidade / Zona:`, rightColX, y);
    doc.setFont('helvetica', 'bold');
    doc.text(user.zone, rightColX + 42, y);

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(`Cultura Principal:`, leftColX, y);
    doc.setFont('helvetica', 'bold');
    doc.text(user.crop, leftColX + 32, y);

    doc.setFont('helvetica', 'normal');
    doc.text(`Tipo de Produtor:`, rightColX, y);
    doc.setFont('helvetica', 'bold');
    doc.text(user.type, rightColX + 42, y);

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(`Plano de Serviço:`, leftColX, y);
    doc.setFont('helvetica', 'bold');
    doc.text(user.plan, leftColX + 32, y);

    // Section 2: Estado de Segurança & Autenticação
    y += 12;
    doc.line(14, y, 196, y);
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
    doc.text('2. ESTADO DA PROTEÇÃO & MULTIFATOR (MFA/2FA)', 14, y);

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);

    // Security badges simulated
    doc.setFillColor(user.twoFactorEnabled ? 232 : 254, user.twoFactorEnabled ? 243 : 242, user.twoFactorEnabled ? 236 : 242);
    doc.roundedRect(14, y, 88, 14, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(user.twoFactorEnabled ? primaryGreen[0] : 185, user.twoFactorEnabled ? primaryGreen[1] : 28, user.twoFactorEnabled ? primaryGreen[2] : 28);
    doc.text(`2FA / TOTP: ${user.twoFactorEnabled ? 'ATIVADO (ALTA SEGURANÇA)' : 'DESATIVADO'}`, 18, y + 9);

    doc.setFillColor(user.biometricRegistered ? 232 : 241, user.biometricRegistered ? 243 : 245, user.biometricRegistered ? 236 : 249);
    doc.roundedRect(108, y, 88, 14, 2, 2, 'F');
    doc.setTextColor(user.biometricRegistered ? primaryGreen[0] : 71, user.biometricRegistered ? primaryGreen[1] : 85, user.biometricRegistered ? primaryGreen[2] : 105);
    doc.text(`Biometria: ${user.biometricRegistered ? 'SENSOR VINCULADO (ATIVO)' : 'NÃO VINCULADO'}`, 112, y + 9);

    // Section 3: Backup Emergency Codes
    y += 22;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y, 196, y);
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
    doc.text('3. CÓDIGOS DE RECUPERAÇÃO DE EMERGÊNCIA (2FA)', 14, y);

    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Guarde estes códigos em local seguro. Cada código é de uso único caso perca o acesso ao telemóvel ou 2FA.', 14, y);

    y += 6;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, 182, 24, 2, 2, 'F');

    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);

    const codes = user.backupCodes && user.backupCodes.length > 0 
      ? user.backupCodes 
      : ['8421-9920', '3128-4491', '7503-1182', '9934-2051', '6219-5502', '4410-8823'];

    let codeX = 22;
    let codeY = y + 8;
    codes.forEach((code, i) => {
      doc.text(`[${i + 1}] ${code}`, codeX, codeY);
      codeX += 58;
      if (codeX > 150) {
        codeX = 22;
        codeY += 8;
      }
    });

    // Section 4: Log de Auditoria Recente
    y += 32;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
    doc.text('4. HISTÓRICO RECENTE DE ACESSO & AUDITORIA', 14, y);

    y += 6;
    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('DATA / HORA', 18, y + 5);
    doc.text('AÇÃO REGISTADA', 60, y + 5);
    doc.text('ESTADO', 120, y + 5);
    doc.text('DISPOSITIVO / IP', 150, y + 5);

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    const recentLogs = logs.slice(0, 6);
    if (recentLogs.length === 0) {
      doc.text('Nenhum evento recente registado para este utilizador.', 18, y + 6);
      y += 10;
    } else {
      recentLogs.forEach((log) => {
        const dateStr = new Date(log.timestamp).toLocaleDateString('pt-MZ', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
        doc.text(dateStr, 18, y + 5);
        doc.text(log.action.slice(0, 32), 60, y + 5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(log.status === 'success' ? primaryGreen[0] : 185, log.status === 'success' ? primaryGreen[1] : 28, log.status === 'success' ? primaryGreen[2] : 28);
        doc.text(log.status.toUpperCase(), 120, y + 5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(log.device.slice(0, 24), 150, y + 5);
        y += 6.5;
      });
    }

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('AgroResiliente Inhambane · República de Moçambique · Suporte: +258 876 473 432 · ebenchume@sapo.mz', 14, 287);

    // Save PDF
    const filename = `AgroResiliente_Seguranca_${user.name.split(' ')[0]}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
    return filename;
  },

  /**
   * Export Agricultural Market Bulletin and Weather Alerts PDF
   */
  exportMarketReport(user: User, prices: MarketPrice[]) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryGreen = [26, 122, 76];

    // Header bar
    doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.rect(0, 0, 210, 24, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('BOLETIM DE COTAÇÕES DE MERCADO & CLIMA', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('AgroResiliente Inhambane · Província de Inhambane, Moçambique', 14, 18);

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(`Preços Oficiais em Homoíne, Maxixe, Inhambane e Massinga`, 14, 35);

    const issueDate = new Date().toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Data de referência: ${issueDate} · Produtor: ${user.name} (${user.zone})`, 14, 41);

    // Table
    let y = 48;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('CULTURA', 18, y + 5.5);
    doc.text('MERCADO', 65, y + 5.5);
    doc.text('INTERVALO DE PREÇO', 115, y + 5.5);
    doc.text('TENDÊNCIA', 165, y + 5.5);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    prices.forEach((item, index) => {
      if (index % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(14, y, 182, 8, 'F');
      }
      doc.setFont('helvetica', 'bold');
      doc.text(item.crop, 18, y + 5.5);
      doc.setFont('helvetica', 'normal');
      doc.text(item.market, 65, y + 5.5);
      doc.text(`${item.minPrice} – ${item.maxPrice} ${item.unit}`, 115, y + 5.5);
      
      const trendLabel = item.trend === 'up' ? '▲ Em alta' : item.trend === 'down' ? '▼ Em baixa' : '— Estável';
      doc.text(trendLabel, 165, y + 5.5);
      y += 8;
    });

    // Agro Climate advisory box
    y += 6;
    doc.setFillColor(232, 243, 236);
    doc.roundedRect(14, y, 182, 34, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.text('RECOMENDAÇÕES CLIMÁTICAS & PRÁTICAS RESILIENTES (INHAMBANE)', 20, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text('• Solo e Mulching: Aplique cobertura morta para reter a humidade do solo e reduzir perdas por evaporação em 30-40%.', 20, y + 15);
    doc.text('• Variedades Melhoradas: Privilegie estacas de mandioca e sementes tolerantes a secas sazonais recomendadas pelo IIAM.', 20, y + 21);
    doc.text('• Comercialização: Consulte os preços atualizados diariamente via USSD (*123#) ou SMS para o 123 sem gastar saldo de dados.', 20, y + 27);

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('AgroResiliente Inhambane · Relatório gerado offline em conformidade com a política de dados.', 14, 287);

    const filename = `Boletim_Mercado_Inhambane_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
    return filename;
  },

  /**
   * Export Agrometeorological Weather & Irrigation Bulletin PDF
   */
  exportWeatherReport(user: User, weather: any) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryGreen = [26, 122, 76];
    const darkGreen = [15, 74, 46];

    // Header bar
    doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.rect(0, 0, 210, 24, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('BOLETIM AGROMETEOROLÓGICO DE INHAMBANE', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Previsão Localizada e Recomendações de Maneio · ${weather.location.name} (${weather.location.district})`, 14, 18);

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(`Condições Atuais e Balanço Hídrico para ${user.name}`, 14, 34);

    const issueDate = new Date().toLocaleString('pt-MZ', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Emitido em: ${issueDate} · Fonte de Dados: Open-Meteo & Agrometeorologia Inhambane`, 14, 40);

    // Current metrics box
    let y = 46;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, y, 182, 28, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
    doc.text(`ESTADO ATUAL DO TEMPO EM ${weather.location.name.toUpperCase()}`, 18, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(`Temperatura: ${weather.current.temperature}°C (Sensação: ${weather.current.apparentTemperature}°C)`, 18, y + 14);
    doc.text(`Humidade do Ar: ${weather.current.relativeHumidity}%`, 18, y + 21);

    doc.text(`Humidade do Solo (0-1cm): ${weather.current.soilMoisturePercent}%`, 105, y + 14);
    doc.text(`Evapotranspiração ET₀: ${weather.current.evapotranspirationTodayMm} mm/dia`, 105, y + 21);

    // 7-Day Table
    y += 35;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
    doc.text('PREVISÃO DE 7 DIAS E ORIENTAÇÕES PARA A MACHAMBA', 14, y);

    y += 5;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('DIA', 18, y + 5);
    doc.text('ESTADO', 45, y + 5);
    doc.text('MIN / MÁX', 85, y + 5);
    doc.text('CHUVA (MM)', 115, y + 5);
    doc.text('ORIENTAÇÃO AGRÍCOLA', 145, y + 5);

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    (weather.daily || []).forEach((day: any, i: number) => {
      if (i % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(14, y, 182, 8, 'F');
      }
      doc.setFont('helvetica', 'bold');
      doc.text(day.dayOfWeek, 18, y + 5.5);
      doc.setFont('helvetica', 'normal');
      doc.text(day.weatherLabel.slice(0, 18), 45, y + 5.5);
      doc.text(`${day.tempMin}°C / ${day.tempMax}°C`, 85, y + 5.5);
      doc.text(`${day.precipitationProb}% (${day.precipitationMm}mm)`, 115, y + 5.5);
      doc.text(day.advisory.slice(0, 28) + '...', 145, y + 5.5);
      y += 8;
    });

    // Recommendations block
    y += 6;
    doc.setFillColor(232, 243, 236);
    doc.roundedRect(14, y, 182, 30, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.text('ALERTAS AGROMETEOROLÓGICOS E RECOMENDAÇÕES OFICIAIS', 18, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const alerts = weather.agriculturalAlerts || [];
    alerts.forEach((alt: string, index: number) => {
      doc.text(`• ${alt}`, 18, y + 14 + (index * 6));
    });

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('AgroResiliente Inhambane · Suporte Técnico: +258 876 473 432 · ebenchume@sapo.mz', 14, 287);

    const filename = `Boletim_Clima_${weather.location.name}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
    return filename;
  },

  /**
   * Export agricultural crop calendar report with planting dates, harvest estimations, and reminders
   */
  exportCropCalendarReport(user: User, cycles: CropCycle[]) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryGreen = [26, 122, 76];
    const darkGreen = [15, 74, 46];

    // Header bar
    doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.rect(0, 0, 210, 24, 'F');

    // Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text('AGRORESILIENTE INHAMBANE', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('Plano Agronómico Oficial · Calendário de Cultivo e Previsão de Colheita', 14, 18);

    // Document Title
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('CALENDÁRIO AGRÍCOLA E CRONOGRAMA DE MACHAMBAS', 14, 35);

    const issueDate = new Date().toLocaleString('pt-MZ', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Produtor: ${user.name} | Zona: ${user.zone} | Emitido: ${issueDate}`, 14, 41);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 45, 196, 45);

    let y = 52;

    cycles.forEach((cycle, index) => {
      // Check if page overflow
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      // Cycle header box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, y, 182, 20, 2, 2, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, y, 182, 20, 2, 2, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
      doc.text(`${index + 1}. ${cycle.plotName} - Cultura: ${cycle.crop} ${cycle.variety ? `(${cycle.variety})` : ''}`, 18, y + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Área: ${cycle.areaHectares} ha | Plantio: ${cycle.plantingDate} | Colheita Prevista: ${cycle.estimatedHarvestDate} | Estado: ${cycle.status.toUpperCase()}`, 18, y + 14);

      y += 24;

      // Table of reminders / stages
      doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.rect(14, y, 182, 6.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('DATA PREVISTA', 18, y + 4.5);
      doc.text('AÇÃO / MARCO AGRONÓMICO', 52, y + 4.5);
      doc.text('PRIORIDADE', 140, y + 4.5);
      doc.text('ESTADO', 170, y + 4.5);
      y += 6.5;

      cycle.reminders.forEach((r, rIdx) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        const bg = rIdx % 2 === 0 ? 255 : 248;
        doc.setFillColor(bg, bg, bg);
        doc.rect(14, y, 182, 7, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        doc.text(r.dueDate, 18, y + 5);
        doc.text(r.title.slice(0, 48), 52, y + 5);
        doc.text(r.priority.toUpperCase(), 140, y + 5);
        doc.setFont('helvetica', r.completed ? 'bold' : 'normal');
        doc.setTextColor(r.completed ? 22 : 100, r.completed ? 101 : 116, r.completed ? 52 : 139);
        doc.text(r.completed ? 'CONCLUÍDO' : 'PENDENTE', 170, y + 5);

        y += 7;
      });

      y += 6;
    });

    // Technical extension note
    if (y > 245) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(232, 243, 236);
    doc.roundedRect(14, y, 182, 22, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.text('ASSISTÊNCIA TÉCNICA E EXTENSÃO AGRÍCOLA · HOMÍNE', 18, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text('Para dúvidas sobre maneio, fitossanidade ou sementes certificadas, contacte o extensionista da sua zona:', 18, y + 12);
    doc.text('Técnico Arsénio Matsinhe · Tel/WhatsApp: +258 876 473 432 · Canal USSD Gratuito: *123#', 18, y + 17);

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('AgroResiliente Inhambane · Plataforma de Agricultura Resiliente · agroresiliente.co.mz', 14, 287);

    const filename = `Calendario_Cultivo_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
    return filename;
  },

  /**
   * Export Farm Profitability & Cost Sheet PDF
   */
  exportFarmFinancialReport(user: User, calc: {
    crop: string;
    area: number;
    areaUnit: string;
    totalCost: number;
    expectedYieldKg: number;
    marketPricePerKg: number;
    grossRevenue: number;
    netProfit: number;
    profitMargin: number;
    breakEvenPrice: number;
    costItems: { item: string; amount: number; description: string }[];
  }) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryGreen = [26, 122, 76];
    const warmAmber = [217, 119, 6];

    // Header bar
    doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.rect(0, 0, 210, 24, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('AGRORESILIENTE INHAMBANE', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('Calculadora Agrícola & Gestão Financeira da Machamba · Homoíne · Moçambique', 14, 18);

    // Title
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('FICHA DE CUSTOS DE PRODUÇÃO E RENTABILIDADE', 14, 34);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Produtor(a): ${user.name} | Zona: ${user.zone} | Cultura: ${calc.crop} (${calc.area} ${calc.areaUnit})`, 14, 40);

    // Financial Overview Cards
    const cardY = 46;
    // Box 1: Custo Total
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, cardY, 42, 22, 2, 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('CUSTO TOTAL ESTIMADO', 17, cardY + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(220, 38, 38);
    doc.text(`${calc.totalCost.toLocaleString('pt-MZ')} MT`, 17, cardY + 15);

    // Box 2: Receita Bruta
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(60, cardY, 42, 22, 2, 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('RECEITA BRUTA PREVISTA', 63, cardY + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`${calc.grossRevenue.toLocaleString('pt-MZ')} MT`, 63, cardY + 15);

    // Box 3: Lucro Líquido
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(106, cardY, 46, 22, 2, 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(5, 150, 105);
    doc.text('LUCRO LÍQUIDO PREVISTO', 109, cardY + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(calc.netProfit >= 0 ? 5 : 220, calc.netProfit >= 0 ? 150 : 38, calc.netProfit >= 0 ? 105 : 38);
    doc.text(`${calc.netProfit.toLocaleString('pt-MZ')} MT`, 109, cardY + 15);

    // Box 4: Margem & Preço Mínimo
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(156, cardY, 40, 22, 2, 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('MARGEM / EQUILÍBRIO', 159, cardY + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.text(`${calc.profitMargin.toFixed(1)}% | ${calc.breakEvenPrice.toFixed(1)} MT/kg`, 159, cardY + 15);

    // Table of Costs
    let y = 76;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('Discriminação dos Custos de Produção da Machamba', 14, y);

    y += 5;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('RUBRICA / OPERAÇÃO', 18, y + 5.5);
    doc.text('DETALHE / QUANTIDADE', 90, y + 5.5);
    doc.text('VALOR (MT)', 160, y + 5.5);

    y += 9;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    calc.costItems.forEach((c, i) => {
      if (i % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y - 2, 182, 8, 'F');
      }
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.text(c.item, 18, y + 3.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(c.description, 90, y + 3.5);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(`${c.amount.toLocaleString('pt-MZ')} MT`, 160, y + 3.5);
      y += 8;
    });

    // Subtotal line
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, 196, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Total de Despesas Diretas:', 90, y);
    doc.setTextColor(220, 38, 38);
    doc.text(`${calc.totalCost.toLocaleString('pt-MZ')} MT`, 160, y);

    // Productivity & Market projection
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('Projeção de Colheita e Venda nos Mercados de Inhambane', 14, y);

    y += 6;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, 182, 30, 2, 2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`• Produção Estimada da Parcela: ${calc.expectedYieldKg.toLocaleString('pt-MZ')} kg (${(calc.expectedYieldKg / (calc.area || 1)).toFixed(0)} kg/${calc.areaUnit})`, 18, y + 7);
    doc.text(`• Preço Médio de Venda Considerado: ${calc.marketPricePerKg} MT/kg (baseado em cotações de Maxixe e Homoíne)`, 18, y + 14);
    doc.text(`• Ponto de Equilíbrio (Preço Mínimo para não ter prejuízo): ${calc.breakEvenPrice.toFixed(2)} MT/kg`, 18, y + 21);
    doc.text(`• Margem Operacional sobre a Receita: ${calc.profitMargin.toFixed(1)}%`, 18, y + 27);

    // Extensionist advice box
    y += 36;
    doc.setFillColor(232, 243, 236);
    doc.roundedRect(14, y, 182, 20, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.text('RECOMENDAÇÃO TÉCNICA DO SDAE HOMÓINE', 18, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text('Para maximizar a margem líquida, planeie a venda escalonada e evite intermediários informais na borda da machamba.', 18, y + 12);
    doc.text('Utilize a Associação de Produtores para negociar transporte coletivo (Canter/Chapa) até ao mercado grossista da Maxixe.', 18, y + 16);

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('AgroResiliente Inhambane · Gestão Agrária Sustentável · Apoio Técnico SDAE', 14, 287);

    const filename = `Ficha_Rentabilidade_${calc.crop}_${user.name.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
    return filename;
  }
};

