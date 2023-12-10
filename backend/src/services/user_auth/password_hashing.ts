import bcrypt from 'bcrypt';
import logger from '../../utils/logger';

export async function hashPassword(password: string): Promise<string> {
    //Uses bcrypt hashing to encrypt the password before storing it/comparing it to the DB
    try {
      const saltRounds = 10; // The cost factor, determines the computational cost of the hashing
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return hashedPassword;
    } catch (error) {
      logger.error('Error hashing password:', error);
      throw new Error('Error hashing password');
    }
}

export async function verifyPassword(inputPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    const passwordMatch = await bcrypt.compare(inputPassword, hashedPassword);
    return passwordMatch;
  } catch (error) {
    logger.error('Error comparing input password:', error);
    throw new Error('Error verifying password');
  }
}