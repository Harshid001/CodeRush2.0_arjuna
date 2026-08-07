import { Router, Request, Response } from 'express';
import { pdfService } from '../services/pdf/pdf.service';

const router = Router();

/**
 * GET /api/pdf/invoice/:id
 * Generates and downloads an Invoice PDF
 */
router.get('/invoice/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const pdfBytes = await pdfService.generateInvoice({
      invoiceNumber: id.startsWith('INV-') ? id : `INV-${id}`,
      receiptId: `rcpt_${Date.now()}`,
      date: new Date().toISOString(),
      status: 'PAID',
      providerName: 'OpenCore Labs - GPT-4 Vision Pro',
      providerCompany: 'OpenCore Labs Node',
      category: 'LLM & Multimodal AI',
      paymentType: 'exact',
      walletAddress: (req.query.wallet as string) || '36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4',
      network: 'Algorand TestNet (AVM exact)',
      amountPaid: '$0.0500',
      transactionHash: (req.query.txHash as string) || `tx_algorand_avm_atomic_${Date.now()}`,
    });

    const filename = `invoice-${id.startsWith('INV-') ? id : `INV-${id}`}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (error: any) {
    console.error('[PDF Routes] Error generating Invoice PDF:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate Invoice PDF' });
  }
});

/**
 * GET /api/pdf/receipt/:id
 * Generates and downloads a Receipt PDF
 */
router.get('/receipt/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const pdfBytes = await pdfService.generateReceipt({
      receiptId: id.startsWith('RCP-') ? id : `RCP-${id}`,
      providerName: 'OpenCore Labs - GPT-4 Vision Pro',
      walletAddress: (req.query.wallet as string) || '36UMZNGBAZMINJH7266YYGHTR2OLEHTFRREB6ROQI3XA54EQXXCLTZTMG4',
      network: 'Algorand TestNet (AVM exact)',
      settlementStatus: 'CONFIRMED',
      transactionHash: (req.query.txHash as string) || `tx_algorand_avm_atomic_${Date.now()}`,
      paymentTime: new Date().toISOString(),
      signature: 'sig_avm_atomic_group_confirmed_ok',
      verificationStatus: 'VALID (AVM)',
    });

    const filename = `receipt-${id.startsWith('RCP-') ? id : `RCP-${id}`}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (error: any) {
    console.error('[PDF Routes] Error generating Receipt PDF:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate Receipt PDF' });
  }
});

/**
 * GET /api/pdf/agent-report/:id
 * Generates and downloads an Agent Execution Report PDF
 */
router.get('/agent-report/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const pdfBytes = await pdfService.generateAgentReport({
      reportId: id,
      userPrompt: (req.query.prompt as string) || 'Execute high-throughput sentiment extraction for Algorand ecosystem.',
      category: 'LLM & NLP',
      priority: 'high_quality',
      budgetLimit: '$5.00',
      candidatesCount: 4,
      selectedProviderName: 'OpenCore Labs - GPT-4 Vision Pro',
      selectedProviderPrice: '$0.0500',
      decisionScore: '94.8',
      rationale: 'Highest quality score (98.4%) and lowest latency (180ms) within budget policy limit.',
      policyCheckResult: 'APPROVED — Within max budget & allowed daily provider cap.',
      latencyCheck: '180ms (Fastest candidate)',
      qualityCheck: '98.4% Quality Rating',
      receiptId: `rcpt_${Date.now()}`,
      invoiceId: `inv_${Date.now()}`,
      transactionHash: (req.query.txHash as string) || `tx_algorand_avm_atomic_${Date.now()}`,
      executionTime: new Date().toISOString(),
      finalStatus: 'COMPLETED',
    });

    const filename = `agent-report-${id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (error: any) {
    console.error('[PDF Routes] Error generating Agent Report PDF:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate Agent Report PDF' });
  }
});

export default router;
