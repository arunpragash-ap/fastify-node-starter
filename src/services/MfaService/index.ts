import { authenticator } from "otplib";
import qrcode from "qrcode";
import { User } from "../../entities/User";
import { AppDataSource } from "../../config/database";
import { signJwt } from "../../utils/jwt";
import { Session } from "../../entities/Session";
import { randomBytes } from "crypto";

export class MfaService {
  async setup(userId: string) {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) throw new Error("User not found");
    const secret = authenticator.generateSecret();
    user.mfaSecret = secret;
    await userRepo.save(user);
    const otpauth = authenticator.keyuri(user.email, "LemonApp", secret);
    const qr = await qrcode.toDataURL(otpauth);
    return { secret, qr };
  }

  async verify(userId: string, token: string) {
    const userRepo = AppDataSource.getRepository(User);
    console.log(`Verifying MFA for userId: ${userId}, token: ${token}`);

    // Use createQueryBuilder to explicitly select mfaSecret which has select: false
    const user = await userRepo
      .createQueryBuilder("user")
      .where("user.id = :id", { id: userId })
      .addSelect("user.mfaSecret")
      .getOne();

    console.log(`User found:`, user ? "Yes" : "No");
    if (user) {
      console.log(`User mfaSecret: ${user.mfaSecret ? "Present" : "Missing"}`);
      console.log(`User mfaEnabled: ${user.mfaEnabled}`);
    }
    if (!user || !user.mfaSecret) throw new Error("MFA not setup");
    const isValid = authenticator.check(token, user.mfaSecret);
    console.log(`Token validation result: ${isValid}`);
    if (isValid) {
      user.mfaEnabled = true;
      await userRepo.save(user);
    }
    return isValid;
  }

  async disable(userId: string, token: string) {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo
      .createQueryBuilder("user")
      .where("user.id = :id", { id: userId })
      .addSelect("user.mfaSecret")
      .getOne();
    if (!user) throw new Error("User not found");
    if (!user.mfaSecret) throw new Error("MFA not setup");

    const isValid = authenticator.check(token, user.mfaSecret);
    if (!isValid) throw new Error("Invalid MFA token");

    user.mfaSecret = undefined;
    user.mfaEnabled = false;
    await userRepo.save(user);
    return true;
  }

  async verifyAndIssueTokens(userId: string, mfaCode: string) {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo
      .createQueryBuilder("user")
      .where("user.id = :id", { id: userId })
      .addSelect("user.mfaSecret")
      .getOne();
    if (!user || !user.mfaSecret) throw new Error("MFA not setup");
    const isValid = require("otplib").authenticator.check(
      mfaCode,
      user.mfaSecret,
    );
    if (!isValid) throw new Error("Invalid MFA code");
    // Issue JWT and session tokens
    const accessToken = signJwt({ userId });
    const refreshToken = randomBytes(32).toString("hex");
    const sessionRepo = AppDataSource.getRepository(Session);
    const session = sessionRepo.create({
      userId,
      refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await sessionRepo.save(session);
    return { accessToken, refreshToken };
  }

  async status(userId: string) {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) throw new Error("User not found");
    return { enabled: user.mfaEnabled };
  }
}
