import CryptoJS from 'crypto-js';
import { Request, Response, NextFunction } from 'express';

// key
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-secret-key';

// crypt
export const encryptionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // dec
  if (req.body && req.body.encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(req.body.encryptedData, ENCRYPTION_KEY);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      if (decryptedString) req.body = JSON.parse(decryptedString);
    } catch (err) {
      return res.status(400).json({ status: 400, message: 'Invalid encrypted data', isError: true });
    }
  }

  // enc
  const originalJson = res.json;
  res.json = function (body: any): any {
    if (body && typeof body === 'object' && !body.isError && process.env.ENCRYPTION_ENABLED === 'true') {
      try {
        const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(body), ENCRYPTION_KEY).toString();
        return originalJson.call(this, { encryptedData });
      } catch (err) {
        return originalJson.call(this, body);
      }
    }
    return originalJson.call(this, body);
  };

  next();
};
