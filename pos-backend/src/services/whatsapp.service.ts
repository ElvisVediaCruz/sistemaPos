import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import {
  WHATSAPP_ENABLED,
  WHATSAPP_ALLOWED_NUMBERS,
  WHATSAPP_SESSION_PATH,
} from '../config/env';
import { handleCommand } from '../commands/whatsapp.commands';

let isReady = false;

export const getWhatsAppStatus = () => ({ enabled: WHATSAPP_ENABLED, ready: isReady });

export const initWhatsApp = (): void => {
  if (!WHATSAPP_ENABLED) {
    console.log('[WhatsApp] Bot deshabilitado por configuracion (WHATSAPP_ENABLED=false).');
    return;
  }

  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: WHATSAPP_SESSION_PATH }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  client.on('qr', (qr) => {
    console.log('[WhatsApp] Escanea el codigo QR con tu telefono para vincular la cuenta:');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    isReady = true;
    console.log('[WhatsApp] Bot conectado y listo para recibir consultas.');
  });

  client.on('disconnected', (reason) => {
    isReady = false;
    console.warn('[WhatsApp] Desconectado:', reason);
  });

  client.on('auth_failure', (msg) => {
    isReady = false;
    console.error('[WhatsApp] Fallo de autenticacion:', msg);
  });

  client.on('message', async (msg: Message) => {
    await onMessage(msg);
  });

  client.initialize().catch((err) => {
    console.error('[WhatsApp] Error al inicializar cliente:', err);
  });
};

const onMessage = async (msg: Message): Promise<void> => {
  if (msg.isGroupMsg || msg.type !== 'chat') return;

  const senderNumber = msg.from.replace('@c.us', '');

  if (!WHATSAPP_ALLOWED_NUMBERS.includes(senderNumber)) return;

  const text = msg.body.trim().toLowerCase();

  try {
    const response = await handleCommand(text);
    await msg.reply(response);
  } catch (err) {
    console.error('[WhatsApp] Error procesando comando:', err);
    await msg.reply('Ocurrio un error interno. Por favor intenta de nuevo.');
  }
};
