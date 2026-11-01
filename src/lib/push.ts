import { apiRequest } from './api';
import { readStore } from './storage';
import type { AccountInfo, PushSettings } from '../types';

/** Token konta, jeśli jesteś zalogowany/zalogowana (w wersji prywatnej powiadomienia są tylko dla właściciela). */
function accountToken(): string | undefined {
  return readStore<AccountInfo | null>('account', null)?.token;
}

/** Powiadomienia push o przebudzeniu: działają także przy zamkniętej stronie. */

export function pushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value + '='.repeat((4 - (value.length % 4)) % 4);
  return Uint8Array.from(atob(padded.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
}

async function registration(): Promise<ServiceWorkerRegistration> {
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) throw new Error('Powiadomienia działają dopiero na opublikowanej stronie (https). Odśwież stronę i spróbuj ponownie.');
  return reg;
}

export async function currentSubscription(): Promise<PushSubscription | null> {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return reg ? reg.pushManager.getSubscription() : null;
}

function timeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Warsaw';
  } catch {
    return 'Europe/Warsaw';
  }
}

async function saveSubscription(subscription: PushSubscription, settings: PushSettings) {
  await apiRequest('push.php?action=subscribe', { body: { subscription: subscription.toJSON(), settings, tz: timeZone() }, token: accountToken() });
}

export async function enablePush(vapidPublicKey: string, settings: PushSettings): Promise<void> {
  if (!pushSupported()) throw new Error('Ta przeglądarka nie obsługuje powiadomień push.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Powiadomienia są zablokowane. Zezwól na nie w ustawieniach przeglądarki.');
  const reg = await registration();
  const subscription =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlToBytes(vapidPublicKey) as BufferSource }));
  await saveSubscription(subscription, settings);
}

export async function updatePush(settings: PushSettings): Promise<void> {
  const subscription = await currentSubscription();
  if (subscription) await saveSubscription(subscription, settings);
}

export async function disablePush(): Promise<void> {
  const subscription = await currentSubscription();
  if (!subscription) return;
  await apiRequest('push.php?action=unsubscribe', { body: { endpoint: subscription.endpoint } }).catch(() => undefined);
  await subscription.unsubscribe();
}

export async function testPush(): Promise<string> {
  const subscription = await currentSubscription();
  if (!subscription) throw new Error('Najpierw włącz powiadomienia.');
  const result = await apiRequest<{ message: string }>('push.php?action=test', { body: { endpoint: subscription.endpoint }, token: accountToken() });
  return result.message;
}
