import crypto from "crypto";

const KEY = Buffer.from(process.env.AES_KEY!, "hex"); // 32 bytes hex
const ALGO = "aes-256-cbc";

export function encrypt(buffer: Buffer) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGO, KEY, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return { data: encrypted, iv: iv.toString("hex") };
}

export function decrypt(data: Buffer, ivHex: string) {
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
    return Buffer.concat([decipher.update(data), decipher.final()]);
}
