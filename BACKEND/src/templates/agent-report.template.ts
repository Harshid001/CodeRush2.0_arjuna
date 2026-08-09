import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

export interface AgentReportTemplateData {
  reportId: string;
  userPrompt: string;
  category: string;
  priority: string;
  budgetLimit: string;
  candidatesCount: number;
  selectedProviderName: string;
  selectedProviderPrice: string;
  decisionScore: string;
  rationale: string;
  policyCheckResult: string;
  latencyCheck: string;
  qualityCheck: string;
  receiptId: string;
  invoiceId: string;
  transactionHash: string;
  executionTime: string;
  finalStatus: string;
}

export async function generateAgentReportPdf(data: AgentReportTemplateData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

  // Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.98, 0.98, 0.99),
  });

  // Top Dark Header Banner
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width,
    height: 100,
    color: rgb(0.06, 0.09, 0.16),
  });

  // Brand Logo & Title
  page.drawText('NexusAPI', {
    x: 40,
    y: height - 45,
    size: 22,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('MARKETPLACE AGENT AUDIT REPORT', {
    x: 40,
    y: height - 65,
    size: 9,
    font: fontBold,
    color: rgb(0.35, 0.6, 0.95),
  });

  // Title Right
  page.drawText('AGENT REPORT', {
    x: width - 180,
    y: height - 45,
    size: 16,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(`STATUS: ${data.finalStatus.toUpperCase()}`, {
    x: width - 180,
    y: height - 65,
    size: 10,
    font: fontBold,
    color: rgb(0.2, 0.75, 0.4),
  });

  let currentY = height - 130;

  // Prompt Box
  page.drawRectangle({
    x: 40,
    y: currentY - 55,
    width: width - 80,
    height: 55,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.88, 0.9, 0.94),
    borderWidth: 1,
  });

  page.drawText('USER PROMPT:', { x: 55, y: currentY - 18, size: 9, font: fontBold, color: rgb(0.4, 0.45, 0.55) });
  const truncatedPrompt = data.userPrompt.length > 80 ? data.userPrompt.slice(0, 80) + '...' : data.userPrompt;
  page.drawText(`"${truncatedPrompt}"`, { x: 55, y: currentY - 36, size: 10.5, font: fontRegular, color: rgb(0.1, 0.12, 0.18) });

  currentY -= 80;

  // Section 1: Detected Intent & Search Summary
  page.drawText('1. DETECTED INTENT & MARKETPLACE SEARCH', { x: 40, y: currentY, size: 11, font: fontBold, color: rgb(0.15, 0.2, 0.3) });
  page.drawLine({ start: { x: 40, y: currentY - 6 }, end: { x: width - 40, y: currentY - 6 }, thickness: 1, color: rgb(0.85, 0.88, 0.92) });
  currentY -= 24;

  const intentBoxHeight = 55;
  page.drawRectangle({ x: 40, y: currentY - intentBoxHeight, width: width - 80, height: intentBoxHeight, color: rgb(1, 1, 1), borderColor: rgb(0.88, 0.9, 0.94), borderWidth: 1 });

  page.drawText(`Category:`, { x: 55, y: currentY - 20, size: 9.5, font: fontBold, color: rgb(0.3, 0.35, 0.45) });
  page.drawText(data.category, { x: 135, y: currentY - 20, size: 9.5, font: fontRegular, color: rgb(0.1, 0.12, 0.18) });

  page.drawText(`Priority:`, { x: 55, y: currentY - 38, size: 9.5, font: fontBold, color: rgb(0.3, 0.35, 0.45) });
  page.drawText(data.priority, { x: 135, y: currentY - 38, size: 9.5, font: fontRegular, color: rgb(0.1, 0.12, 0.18) });

  page.drawText(`Budget Limit:`, { x: 300, y: currentY - 20, size: 9.5, font: fontBold, color: rgb(0.3, 0.35, 0.45) });
  page.drawText(data.budgetLimit, { x: 400, y: currentY - 20, size: 9.5, font: fontRegular, color: rgb(0.1, 0.12, 0.18) });

  page.drawText(`Nodes Evaluated:`, { x: 300, y: currentY - 38, size: 9.5, font: fontBold, color: rgb(0.3, 0.35, 0.45) });
  page.drawText(`${data.candidatesCount} candidate nodes`, { x: 400, y: currentY - 38, size: 9.5, font: fontRegular, color: rgb(0.1, 0.12, 0.18) });

  currentY -= intentBoxHeight + 25;

  // Section 2: Policy & Decision Engine Evaluation
  page.drawText('2. POLICY & DECISION ENGINE EVALUATION', { x: 40, y: currentY, size: 11, font: fontBold, color: rgb(0.15, 0.2, 0.3) });
  page.drawLine({ start: { x: 40, y: currentY - 6 }, end: { x: width - 40, y: currentY - 6 }, thickness: 1, color: rgb(0.85, 0.88, 0.92) });
  currentY -= 24;

  const evalBoxHeight = 85;
  page.drawRectangle({ x: 40, y: currentY - evalBoxHeight, width: width - 80, height: evalBoxHeight, color: rgb(1, 1, 1), borderColor: rgb(0.88, 0.9, 0.94), borderWidth: 1 });

  page.drawText(`Selected Winner:`, { x: 55, y: currentY - 20, size: 9.5, font: fontBold, color: rgb(0.3, 0.35, 0.45) });
  page.drawText(`${data.selectedProviderName} (${data.selectedProviderPrice})`, { x: 160, y: currentY - 20, size: 9.5, font: fontBold, color: rgb(0.1, 0.55, 0.25) });

  page.drawText(`Decision Score:`, { x: 55, y: currentY - 40, size: 9.5, font: fontBold, color: rgb(0.3, 0.35, 0.45) });
  page.drawText(`${data.decisionScore} / 100`, { x: 160, y: currentY - 40, size: 9.5, font: fontBold, color: rgb(0.2, 0.25, 0.35) });

  page.drawText(`Policy Compliance:`, { x: 55, y: currentY - 60, size: 9.5, font: fontBold, color: rgb(0.3, 0.35, 0.45) });
  page.drawText(data.policyCheckResult, { x: 160, y: currentY - 60, size: 9, font: fontRegular, color: rgb(0.1, 0.5, 0.2) });

  page.drawText(`Latency Audit:`, { x: 340, y: currentY - 20, size: 9.5, font: fontBold, color: rgb(0.3, 0.35, 0.45) });
  page.drawText(data.latencyCheck, { x: 440, y: currentY - 20, size: 9.5, font: fontRegular, color: rgb(0.1, 0.12, 0.18) });

  page.drawText(`Quality Audit:`, { x: 340, y: currentY - 40, size: 9.5, font: fontBold, color: rgb(0.3, 0.35, 0.45) });
  page.drawText(data.qualityCheck, { x: 440, y: currentY - 40, size: 9.5, font: fontRegular, color: rgb(0.1, 0.12, 0.18) });

  currentY -= evalBoxHeight + 25;

  // Section 3: Payment & Settlement Summary
  page.drawText('3. ON-CHAIN SETTLEMENT SUMMARY', { x: 40, y: currentY, size: 11, font: fontBold, color: rgb(0.15, 0.2, 0.3) });
  page.drawLine({ start: { x: 40, y: currentY - 6 }, end: { x: width - 40, y: currentY - 6 }, thickness: 1, color: rgb(0.85, 0.88, 0.92) });
  currentY -= 24;

  const payBoxHeight = 65;
  page.drawRectangle({ x: 40, y: currentY - payBoxHeight, width: width - 80, height: payBoxHeight, color: rgb(0.96, 0.97, 0.99), borderColor: rgb(0.85, 0.88, 0.94), borderWidth: 1 });

  page.drawText(`Invoice Ref:`, { x: 55, y: currentY - 20, size: 9, font: fontBold, color: rgb(0.3, 0.35, 0.45) });
  page.drawText(data.invoiceId, { x: 145, y: currentY - 20, size: 9, font: fontMono, color: rgb(0.1, 0.12, 0.18) });

  page.drawText(`Receipt Ref:`, { x: 320, y: currentY - 20, size: 9, font: fontBold, color: rgb(0.3, 0.35, 0.45) });
  page.drawText(data.receiptId, { x: 400, y: currentY - 20, size: 9, font: fontMono, color: rgb(0.1, 0.12, 0.18) });

  page.drawText(`Tx Hash:`, { x: 55, y: currentY - 42, size: 9, font: fontBold, color: rgb(0.3, 0.35, 0.45) });
  page.drawText(data.transactionHash || 'tx_algorand_avm_atomic_settled_001', { x: 145, y: currentY - 42, size: 8.5, font: fontMono, color: rgb(0.1, 0.5, 0.25) });

  currentY -= payBoxHeight + 35;

  // Embed QR Code Optional
  try {
    const qrDataText = JSON.stringify({
      reportId: data.reportId,
      receiptId: data.receiptId,
      invoiceId: data.invoiceId,
      txHash: data.transactionHash,
    });
    const qrDataUrl = await QRCode.toDataURL(qrDataText, { margin: 1, width: 100 });
    const qrImageBytes = Uint8Array.from(Buffer.from(qrDataUrl.split(',')[1], 'base64'));
    const qrImage = await pdfDoc.embedPng(qrImageBytes);

    page.drawImage(qrImage, {
      x: width - 140,
      y: 50,
      width: 80,
      height: 80,
    });

    page.drawText('Scan to Verify', { x: width - 135, y: 38, size: 8, font: fontRegular, color: rgb(0.5, 0.55, 0.65) });
  } catch {
    // Graceful QR fallback if rendering fails
  }

  // Footer
  page.drawLine({ start: { x: 40, y: 40 }, end: { x: width - 40, y: 40 }, thickness: 1, color: rgb(0.85, 0.88, 0.92) });
  page.drawText('Generated by Nexus API Marketplace · Cryptographic On-Chain AVM Receipt', {
    x: 40,
    y: 25,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.5, 0.55, 0.65),
  });

  page.drawText(`Page 1 of 1`, {
    x: width - 90,
    y: 25,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.5, 0.55, 0.65),
  });

  return await pdfDoc.save();
}
