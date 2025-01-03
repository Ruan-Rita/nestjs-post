import * as bcrypt from 'bcryptjs';
import { HashingService } from './hashing.service';

export class BcryptService extends HashingService {
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const test = bcrypt.hash(password, salt);

    return test;
  }

  async compare(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }
}
