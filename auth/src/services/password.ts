import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export class Password {
  static async hashPassword(password: string) {
    const salt = randomBytes(8).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;

    return `${buf.toString("hex")}.${salt}`;
  }

  static async comparePassword(
    storedPassword: string,
    suppliedPassword: string
  ) {
    const [hashedPassword, salt] = storedPassword.split(".");
    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

    return buf.toString("hex") === hashedPassword;
  }
}

// import { randomBytes, scrypt, timingSafeEqual } from "crypto";
// import { promisify } from "util";

// const scryptAsync = promisify(scrypt);

// export class Password {
//   static async hashPassword(password: string): Promise<string> {
//     const salt = randomBytes(8).toString("hex");
//     const hashedPasswordBuf = (await scryptAsync(password, salt, 64)) as Buffer;
//     const hashedPassword = hashedPasswordBuf.toString("hex");
//     return `${hashedPassword}.${salt}`;
//   }

//   static async comparePassword(
//     storedPassword: string,
//     suppliedPassword: string
//   ): Promise<boolean> {
//     // split() returns array
//     const [hashedPassword, salt] = storedPassword.split(".");
//     // we need to pass buffer values to timingSafeEqual
//     const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
//     // we hash the new sign-in password
//     const suppliedPasswordBuf = (await scryptAsync(
//       suppliedPassword,
//       salt,
//       64
//     )) as Buffer;
//     // compare the new supplied password with the stored hashed password
//     return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
//   }
// }
