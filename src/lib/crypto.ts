'use client';

import CryptoJS from 'crypto-js';

export function encrypt(text: string, key: string): string {
  if (!key) throw new Error("A key is required for encryption.");
  return CryptoJS.AES.encrypt(text, key).toString();
}

export function decrypt(ciphertext: string, key: string): string {
  if (!key) throw new Error("A key is required for decryption.");
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  try {
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    if (!originalText) {
      throw new Error("Decryption failed: Invalid key or corrupted data.");
    }
    return originalText;
  } catch (error) {
    throw new Error("Decryption failed: Invalid key or corrupted data.");
  }
}
