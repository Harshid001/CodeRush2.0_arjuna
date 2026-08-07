import { generateInvoicePdf, InvoiceTemplateData } from '../../templates/invoice.template';
import { generateReceiptPdf, ReceiptTemplateData } from '../../templates/receipt.template';
import { generateAgentReportPdf, AgentReportTemplateData } from '../../templates/agent-report.template';

export class PdfService {
  /**
   * Generates a professional Invoice PDF as a Buffer / Uint8Array.
   */
  public async generateInvoice(data: InvoiceTemplateData): Promise<Uint8Array> {
    return await generateInvoicePdf(data);
  }

  /**
   * Generates a professional Cryptographic Receipt PDF as a Buffer / Uint8Array.
   */
  public async generateReceipt(data: ReceiptTemplateData): Promise<Uint8Array> {
    return await generateReceiptPdf(data);
  }

  /**
   * Generates an Agent Execution Audit Report PDF as a Buffer / Uint8Array.
   */
  public async generateAgentReport(data: AgentReportTemplateData): Promise<Uint8Array> {
    return await generateAgentReportPdf(data);
  }
}

export const pdfService = new PdfService();
