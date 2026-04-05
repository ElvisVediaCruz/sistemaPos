import PDFDocument from 'pdfkit';
import { print } from 'pdf-to-printer';
import * as fs from 'fs';
import * as path from 'path';

const TICKET_WIDTH = 226; // ~80mm en puntos
const MARGIN = 10;
const FONT_SIZE = 8;
const LINE_CHARS = 36; // caracteres por línea con Courier 8pt en este ancho

// Carpeta fija de recibos: pos-backend/receipts/
const RECEIPTS_DIR = path.join(process.cwd(), 'receipts');

export interface ItemRecibo {
  nombre: string;
  cantidad: number;
  precio_historico: number;
}

export interface ReciboDatos {
  nro_factura: string;
  fecha: Date;
  metodo_pago: string;
  items: ItemRecibo[];
  total: number;
}

const SEP  = '='.repeat(LINE_CHARS);
const SEPL = '-'.repeat(LINE_CHARS);

function padLine(left: string, right: string): string {
  const spaces = LINE_CHARS - left.length - right.length;
  return left + ' '.repeat(Math.max(1, spaces)) + right;
}

function centerLine(text: string): string {
  const spaces = Math.max(0, Math.floor((LINE_CHARS - text.length) / 2));
  return ' '.repeat(spaces) + text;
}

function fmtCurrency(n: number): string {
  return `$${n.toFixed(2)}`;
}

function fmtDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}  ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function fmtDateFile(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

export async function imprimirRecibo(data: ReciboDatos): Promise<void> {
  const nombre    = process.env.NEGOCIO_NOMBRE    || 'Punto de Venta';
  const direccion = process.env.NEGOCIO_DIRECCION || '';
  const telefono  = process.env.NEGOCIO_TELEFONO  || '';
  const mensaje   = process.env.NEGOCIO_MENSAJE   || '¡Gracias por su compra!';

  const lines: string[] = [
    SEP,
    centerLine(nombre),
    SEP,
  ];

  if (direccion) lines.push(centerLine(direccion));
  if (telefono)  lines.push(centerLine(`Tel: ${telefono}`));

  lines.push(SEPL);
  lines.push(`Factura: ${data.nro_factura}`);
  lines.push(`Fecha:   ${fmtDate(data.fecha)}`);
  lines.push(SEPL);

  for (const item of data.items) {
    const displayNombre = item.nombre.length > 20
      ? item.nombre.substring(0, 18) + '..'
      : item.nombre;
    const left  = `${displayNombre}  x${item.cantidad}`;
    const right = fmtCurrency(item.precio_historico * item.cantidad);
    lines.push(padLine(left, right));
  }

  lines.push(SEPL);
  lines.push(padLine('TOTAL:', fmtCurrency(data.total)));
  lines.push(`Pago:    ${data.metodo_pago}`);
  lines.push(SEP);
  lines.push(centerLine(mensaje));
  lines.push(SEP);

  const lineHeight = Math.ceil(FONT_SIZE * 1.35);
  const pageHeight = lines.length * lineHeight + MARGIN * 4;

  const doc = new PDFDocument({
    size: [TICKET_WIDTH, pageHeight],
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
  });

  // Crear carpeta receipts/ si no existe
  if (!fs.existsSync(RECEIPTS_DIR)) {
    fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
  }

  const fileName = `${data.nro_factura}_${fmtDateFile(data.fecha)}.pdf`;
  const filePath = path.join(RECEIPTS_DIR, fileName);
  const writeStream = fs.createWriteStream(filePath);

  await new Promise<void>((resolve, reject) => {
    doc.pipe(writeStream);
    doc.font('Courier').fontSize(FONT_SIZE);

    for (const l of lines) {
      doc.text(l, { lineGap: 0 });
    }

    doc.end();
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  await print(filePath);
  console.log(`[PrintService] Recibo guardado y enviado a impresora: ${filePath}`);
}
