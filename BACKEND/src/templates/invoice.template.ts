import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

export interface InvoiceTemplateData {
  invoiceNumber: string;
  receiptId: string;
  date: string;
  status: string;
  providerName: string;
  providerCompany?: string;
  category?: string;
  version?: string;
  paymentType?: string;
  walletAddress: string;
  network?: string;
  amountPaid: string;
  transactionHash: string;
  decisionScore?: string;
  decisionRationale?: string;
}

export async function generateInvoicePdf(data: InvoiceTemplateData): Promise<Uint8Array> {
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

  page.drawText('PAY-PER-USE AGENTIC COMMERCE MARKETPLACE', {
    x: 40,
    y: height - 65,
    size: 9,
    font: fontBold,
    color: rgb(0.35, 0.6, 0.95),
  });

  // Invoice Title Right
  page.drawText('OFFICIAL INVOICE', {
    x: width - 180,
    y: height - 45,
    size: 16,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(`STATUS: ${data.status.toUpperCase()}`, {
    x: width - 180,
    y: height - 65,
    size: 10,
    font: fontBold,
    color: rgb(0.2, 0.75, 0.4),
  });

  let currentY = height - 130;

  // Metadata Card Box
  page.drawRectangle({
    x: 40,
    y: currentY - 70,
    width: width - 80,
    height: 70,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.88, 0.9, 0.94),
    borderWidth: 1,
  });

  page.drawText(`INVOICE NUMBER:`, { x: 55, y: currentY - 22, size: 9, font: fontBold, color: rgb(0.4, 0.45, 0.55) });
  page.drawText(data.invoiceNumber, { x: 55, y: currentY - 38, size: 12, font: fontBold, color: rgb(0.1, 0.12, 0.18) });

  page.drawText(`RECEIPT REF:`, { x: 230, y: currentY - 22, size: 9, font: fontBold, color: rgb(0.4, 0.45, 0.55) });
  page.drawText(data.receiptId, { x: 230, y: currentY - 38, size: 11, font: fontMono, color: rgb(0.2, 0.25, 0.35) });

  page.drawText(`DATE & TIME:`, { x: 410, y: currentY - 22, size: 9, font: fontBold, color: rgb(0.4, 0.45, 0.55) });
  page.drawText(new Date(data.date).toLocaleDateString() + ' ' + new Date(data.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), { x: 410, y: currentY - 38, size: 10, font: fontRegular, color: rgb(0.1, 0.12, 0.18) });

  currentY -= 95;

  // Section 1: Provider Information
  page.drawText('PROVIDER INFORMATION', { x: 40, y: currentY, size: 11, font: fontBold, color: rgb(0.15, 0.2, 0.3) });
  page.drawLine({ start: { x: 40, y: currentY - 6 }, end: { x: width - 40, y: currentY - 6 }, thickness: 1, color: rgb(0.85, 0.88, 0.92) });
  currentY -= 24;

  const provBoxHeight = 60;
  page.drawRectangle({ x: 40, y: currentY - provBoxHeight, width: width - 80, height: provBoxHeight, color: rgb(1, 1, 1), borderColor: rgb(0.88, 0.9, 0.94), borderWidth: 1 });
  
  page.drawText(`Provider Name:`, { x: 55, y: currentY - 20, size: 10, font: fontBold, color: rgb(0.3, 0.35, 0.45) });
  page.drawText(data.providerName, { x: 155, y: currentY - 20, size: 10, font: fontRegular, color: rgb(0.1, 0.12, 0.18) });

  page.drawText(`Category:`, { x: 55, y: currentY - 40, size: 10, font: fontBold, color: rgb(0.3, 0.35, 0.45) });
  page.drawText(data.category || 'LLM & NLP Microservice', { x: 155, y: currentY - 40, size: 10, font: fontRegular, color: rgb(0.1, 0.12, 0.18) });

  page.drawText(`Company Node:`, { x: 330, y: currentY - 20, size: 10, font: fontBold, color: rgb(0.3, 0.35, 0.45) });
  page.drawText(data.providerCompany || 'OpenCore Labs Node', { x: 430, y: currentY - 20, size: 10, font: fontRegular, color: rgb(0.1, 0.12, 0.18) });

  page.drawText(`Protocol Ver:`, { x: 330, y: currentY - 40, size: 10, font: fontBold, color: rgb(0.3, 0.35, 0.45) });
  page.drawText(data.version || 'v402-AVM 2.6', { x: 430, y: currentY - 40, size: 10, font: fontRegular, color: rgb(0.1, 0.12, 0.18) });

  currentY -= provBoxHeight + 30;

  // Section 2: Payment & Settlement Details Table
  page.drawText('PAYMENT & SETTLEMENT DETAILS', { x: 40, y: currentY, size: 11, font: fontBold, color: rgb(0.15, 0.2, 0.3) });
  page.drawLine({ start: { x: 40, y: currentY - 6 }, end: { x: width - 40, y: currentY - 6 }, thickness: 1, color: rgb(0.85, 0.88, 0.92) });
  currentY -= 24;

  // Table Header
  page.drawRectangle({ x: 40, y: currentY - 22, width: width - 80, height: 22, color: rgb(0.92, 0.94, 0.97) });
  page.drawText('DESCRIPTION', { x: 50, y: currentY - 15, size: 9, font: fontBold, color: rgb(0.25, 0.3, 0.4) });
  page.drawText('TYPE', { x: 300, y: currentY - 15, size: 9, font: fontBold, color: rgb(0.25, 0.3, 0.4) });
  page.drawText('NETWORK', { x: 380, y: currentY - 15, size: 9, font: fontBold, color: rgb(0.25, 0.3, 0.4) });
  page.drawText('AMOUNT (USD)', { x: 475, y: currentY - 15, size: 9, font: fontBold, color: rgb(0.25, 0.3, 0.4) });
  currentY -= 22;

  // Row 1
  page.drawRectangle({ x: 40, y: currentY - 28, width: width - 80, height: 28, color: rgb(1, 1, 1), borderColor: rgb(0.9, 0.92, 0.95), borderWidth: 1 });
  page.drawText(`API Request Session - ${data.providerName}`, { x: 50, y: currentY - 18, size: 9.5, font: fontRegular, color: rgb(0.1, 0.12, 0.18) });
  page.drawText(data.paymentType || 'exact', { x: 300, y: currentY - 18, size: 9, font: fontRegular, color: rgb(0.2, 0.25, 0.35) });
  page.drawText(data.network || 'Algorand Testnet', { x: 380, y: currentY - 18, size: 9, font: fontRegular, color: rgb(0.2, 0.25, 0.35) });
  page.drawText(`$${parseFloat(data.amountPaid.replace(/[^0-9.]/g, '') || '0.05').toFixed(4)}`, { x: 475, y: currentY - 18, size: 10, font: fontBold, color: rgb(0.1, 0.12, 0.18) });
  currentY -= 28;

  // Row 2
  page.drawRectangle({ x: 40, y: currentY - 28, width: width - 80, height: 28, color: rgb(0.98, 0.99, 1), borderColor: rgb(0.9, 0.92, 0.95), borderWidth: 1 });
  page.drawText('AVM Smart Contract Network Fee', { x: 50, y: currentY - 18, size: 9.5, font: fontRegular, color: rgb(0.1, 0.12, 0.18) });
  page.drawText('network', { x: 300, y: currentY - 18, size: 9, font: fontRegular, color: rgb(0.2, 0.25, 0.35) });
  page.drawText(data.network || 'Algorand Testnet', { x: 380, y: currentY - 18, size: 9, font: fontRegular, color: rgb(0.2, 0.25, 0.35) });
  page.drawText('$0.0002', { x: 475, y: currentY - 18, size: 9.5, font: fontRegular, color: rgb(0.1, 0.12, 0.18) });
  currentY -= 40;

  // Total Summary Row Right
  page.drawText('TOTAL PAID:', { x: 370, y: currentY, size: 11, font: fontBold, color: rgb(0.15, 0.2, 0.3) });
  page.drawText(`$${parseFloat(data.amountPaid.replace(/[^0-9.]/g, '') || '0.05').toFixed(4)} USD`, { x: 450, y: currentY, size: 13, font: fontBold, color: rgb(0.1, 0.6, 0.3) });
  currentY -= 35;

  // Blockchain Hash & Wallet Card
  const hashBoxHeight = 65;
  page.drawRectangle({ x: 40, y: currentY - hashBoxHeight, width: width - 80, height: hashBoxHeight, color: rgb(0.96, 0.97, 0.99), borderColor: rgb(0.85, 0.88, 0.94), borderWidth: 1 });

  page.drawText('Wallet Address:', { x: 55, y: currentY - 20, size: 9, font: fontBold, color: rgb(0.3, 0.35, 0.45) });
  page.drawText(data.walletAddress || '36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4', { x: 145, y: currentY - 20, size: 8.5, font: fontMono, color: rgb(0.1, 0.12, 0.18) });

  page.drawText('Transaction Hash:', { x: 55, y: currentY - 44, size: 9, font: fontBold, color: rgb(0.3, 0.35, 0.45) });
  page.drawText(data.transactionHash || 'tx_algorand_avm_atomic_settled_001', { x: 145, y: currentY - 44, size: 8.5, font: fontMono, color: rgb(0.1, 0.5, 0.25) });

  currentY -= hashBoxHeight + 30;

  // Embed QR Code Optional
  try {
    const qrDataText = JSON.stringify({
      invoice: data.invoiceNumber,
      receipt: data.receiptId,
      txHash: data.transactionHash,
      wallet: data.walletAddress,
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
  } catch (e) {
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
