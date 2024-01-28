import * as crypto from "node:crypto";

export function decrypt(
  encrypted: string,
  keyOrSecret: string,
  maybe_iv?: string,
): string {
  let key: string | Buffer;
  let iv: string | Buffer;
  let contents: string | Buffer;
  if (maybe_iv) {
    key = keyOrSecret;
    iv = maybe_iv;
    contents = encrypted;
  } else {
    // copied from 'https://github.com/brix/crypto-js/issues/468'
    const cypher = Buffer.from(encrypted, "base64");
    const salt = cypher.subarray(8, 16);
    const password = Buffer.concat([Buffer.from(keyOrSecret, "binary"), salt]);
    const md5Hashes = [];
    let digest = password;
    for (let i = 0; i < 3; i++) {
      md5Hashes[i] = crypto.createHash("md5").update(digest).digest();
      digest = Buffer.concat([md5Hashes[i]!, password]);
    }
    key = Buffer.concat([md5Hashes[0]!, md5Hashes[1]!]);
    iv = md5Hashes[2]!;
    contents = cypher.subarray(16);
  }

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decrypted =
    decipher.update(
      contents as any,
      typeof contents === "string" ? "base64" : undefined,
      "utf8",
    ) + decipher.final();

  return decrypted;
}

export function encrypt(anything: string, key: string, iv: string): string {
  const cypher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cypher.update(anything, "utf-8", "base64");
  encrypted += cypher.final("base64");

  return encrypted;
}
