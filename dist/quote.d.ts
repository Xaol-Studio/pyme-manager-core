/**
 * Commercial WhatsApp Quote Generator
 */
import { CartSummary } from './types.js';
export declare function formatQuoteText(businessName: string, summary: CartSummary, customerName?: string): string;
export declare function generateWhatsAppQuoteUrl(phoneNumber: string, businessName: string, summary: CartSummary, customerName?: string): string;
