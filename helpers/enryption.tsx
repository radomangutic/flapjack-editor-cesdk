import CryptoJS from "crypto-js";
import base64url from "base64url";
const secretKey = "sdfverdfjntrdfxvdcc433eathdrfbv";

export function encryptData(obj: any): string {
  const plaintext = JSON.stringify(obj);
  const ciphertext = CryptoJS.AES.encrypt(plaintext, secretKey).toString();
  return base64url(ciphertext);
}

// Function to decrypt data
export function decryptData(key: any): any {
  if(!key) return null
  const ciphertext = base64url.decode(key);
  const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
  const plaintext = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(plaintext);
}
