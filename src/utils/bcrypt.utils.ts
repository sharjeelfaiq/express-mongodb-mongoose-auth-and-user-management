import createError from "http-errors";
import bcrypt from "bcryptjs";

interface HashOptions {
  rounds?: number;
}

interface HashResult {
  hash: string;
  rounds: number;
  salt: string;
}

export const bcryptUtils = {
  hashSync: (password: string, options: HashOptions = {}): string => {
    const { rounds = 12 } = options;

    if (!password) {
      throw createError(400, "Password is required for hashing");
    }

    if (Buffer.byteLength(password, "utf8") > 72) {
      throw createError(
        400,
        "Password exceeds maximum length of 72 UTF-8 bytes"
      );
    }

    try {
      return bcrypt.hashSync(password, rounds);
    } catch (error) {
      throw createError(500, "Failed to hash password");
    }
  },

  hash: async (
    password: string,
    options: HashOptions = {}
  ): Promise<string> => {
    const { rounds = 12 } = options;

    if (!password) {
      throw createError(400, "Password is required for hashing");
    }

    if (Buffer.byteLength(password, "utf8") > 72) {
      throw createError(
        400,
        "Password exceeds maximum length of 72 UTF-8 bytes"
      );
    }

    try {
      const salt = await bcrypt.genSalt(rounds);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw createError(500, "Failed to hash password");
    }
  },

  compareSync: (password: string, hash: string): boolean => {
    if (!password) {
      throw createError(400, "Password is required for comparison");
    }

    if (!hash) {
      throw createError(400, "Hash is required for comparison");
    }

    try {
      return bcrypt.compareSync(password, hash);
    } catch (error) {
      throw createError(500, "Failed to compare password");
    }
  },

  compare: async (password: string, hash: string): Promise<boolean> => {
    if (!password) {
      throw createError(400, "Password is required for comparison");
    }

    if (!hash) {
      throw createError(400, "Hash is required for comparison");
    }

    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw createError(500, "Failed to compare password");
    }
  },

  genSaltSync: (rounds: number = 12): string => {
    try {
      return bcrypt.genSaltSync(rounds);
    } catch (error) {
      throw createError(500, "Failed to generate salt");
    }
  },

  genSalt: async (rounds: number = 12): Promise<string> => {
    try {
      return await bcrypt.genSalt(rounds);
    } catch (error) {
      throw createError(500, "Failed to generate salt");
    }
  },

  getHashInfo: (hash: string): HashResult => {
    if (!hash) {
      throw createError(400, "Hash is required");
    }

    try {
      const rounds = bcrypt.getRounds(hash);
      const salt = bcrypt.getSalt(hash);

      return {
        hash,
        rounds,
        salt,
      };
    } catch (error) {
      throw createError(400, "Invalid hash format");
    }
  },

  willTruncate: (password: string): boolean => {
    if (!password) {
      return false;
    }

    return Buffer.byteLength(password, "utf8") > 72;
  },

  validatePassword: (
    password: string
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!password) {
      errors.push("Password is required");
    } else {
      if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
      }

      if (password.length > 128) {
        errors.push("Password must not exceed 128 characters");
      }

      if (Buffer.byteLength(password, "utf8") > 72) {
        errors.push("Password exceeds maximum length of 72 UTF-8 bytes");
      }

      if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
      }

      if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
      }

      if (!/\d/.test(password)) {
        errors.push("Password must contain at least one number");
      }

      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push("Password must contain at least one special character");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};
