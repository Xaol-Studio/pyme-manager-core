/**
 * Commercial WhatsApp Quote Generator
 */
import { CartSummary } from './types.js';
import { formatCentsToMxn } from './money.js';

export function formatQuoteText(
  businessName: string,
  summary: CartSummary,
  customerName?: string
): string {
  const greeting = customerName ? `Hola ${customerName}!` : 'Hola!';
  const dateStr = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const lines: string[] = [
    `📋 *COTIZACIÓN FORMAL · ${businessName.toUpperCase()}*`,
    `📅 Fecha: ${dateStr}`,
    '--------------------------------',
  ];

  for (const item of summary.items) {
    const formattedUnit = formatCentsToMxn(item.unitPriceCents);
    const formattedLine = formatCentsToMxn(item.lineTotalCents);
    lines.push(`• *${item.quantity}x* ${item.product.name}`);
    lines.push(`  SKU: \`${item.product.sku}\` | Unit: ${formattedUnit} -> Total: ${formattedLine}`);
  }

  lines.push('--------------------------------');
  lines.push(`Subtotal: ${formatCentsToMxn(summary.subtotalCents)}`);

  if (summary.discountCents > 0) {
    lines.push(`Descuento: -${formatCentsToMxn(summary.discountCents)}`);
  }

  for (const tax of summary.taxBreakdown) {
    lines.push(`${tax.percentageLabel}: ${formatCentsToMxn(tax.taxAmountCents)}`);
  }

  lines.push(`*TOTAL NETO: ${formatCentsToMxn(summary.grandTotalCents)}*`);
  lines.push('--------------------------------');
  lines.push('⚡ Precios sujetos a existencias. ¿Confirmamos tu pedido?');

  return lines.join('\n');
}

export function generateWhatsAppQuoteUrl(
  phoneNumber: string,
  businessName: string,
  summary: CartSummary,
  customerName?: string
): string {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const text = formatQuoteText(businessName, summary, customerName);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
