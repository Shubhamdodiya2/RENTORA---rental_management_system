const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');
const { sequelize, RefreshToken, PasswordResetToken, AuditLog } = require('../models');

class TokenService {
  /**
   * Compute SHA-256 hash of a raw token string
   */
  static hashToken(rawToken) {
    return crypto.createHash('sha256').update(String(rawToken)).digest('hex');
  }

  /**
   * Generate Access and Refresh Token pair for an authenticated user
   */
  static async generateTokens(user, roles = [], ipAddress = null, userAgent = null) {
    const roleNames = Array.isArray(roles) ? roles : [roles];

    // Access Token (15 min)
    const accessPayload = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: roleNames,
      mustChangePassword: user.mustChangePassword || false
    };

    const accessToken = jwt.sign(accessPayload, env.JWT.SECRET, {
      expiresIn: env.JWT.EXPIRES_IN
    });

    // Refresh Token (7 days)
    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Persist refresh token in database
    await RefreshToken.create({
      userId: user.id,
      tokenHash,
      expiresAt,
      isRevoked: false,
      ipAddress,
      userAgent
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresAt
    };
  }

  /**
   * Atomically rotate refresh token with row locking and theft detection
   */
  static async rotateRefreshToken(rawRefreshToken, ipAddress = null, userAgent = null) {
    if (!rawRefreshToken) {
      throw new Error('Refresh token is required');
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const t = await sequelize.transaction();

    try {
      // Find token with row lock for update
      const tokenRecord = await RefreshToken.findOne({
        where: { tokenHash },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      // Scenario 1: Token does not exist
      if (!tokenRecord) {
        await t.rollback();
        const err = new Error('Invalid refresh token');
        err.statusCode = 401;
        throw err;
      }

      // Scenario 2: Token was ALREADY REVOKED (Theft / Replay attack detected)
      if (tokenRecord.isRevoked) {
        console.warn(`[SECURITY ALERT] Refresh token reuse detected for User ID: ${tokenRecord.userId}. Revoking all sessions.`);
        
        // Revoke ALL refresh tokens for this user
        await RefreshToken.update(
          { isRevoked: true },
          { where: { userId: tokenRecord.userId }, transaction: t }
        );

        await AuditLog.create({
          adminName: 'SYSTEM_SECURITY',
          action: 'TOKEN_THEFT_DETECTED',
          module: 'AUTH',
          description: `Refresh token replay attack detected from IP: ${ipAddress}. Revoked all user sessions.`,
          targetId: tokenRecord.userId,
          ipAddress,
          userAgent
        }, { transaction: t });

        await t.commit();
        const err = new Error('Security alert: Token reuse detected. All active sessions have been revoked.');
        err.statusCode = 401;
        throw err;
      }

      // Scenario 3: Token has expired
      if (new Date(tokenRecord.expiresAt) < new Date()) {
        tokenRecord.isRevoked = true;
        await tokenRecord.save({ transaction: t });
        await t.commit();
        const err = new Error('Refresh token has expired');
        err.statusCode = 401;
        throw err;
      }

      // Valid Active Token: Rotate it atomically
      tokenRecord.isRevoked = true;
      await tokenRecord.save({ transaction: t });

      // Generate replacement pair
      const newRawRefreshToken = crypto.randomBytes(40).toString('hex');
      const newTokenHash = this.hashToken(newRawRefreshToken);
      const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await RefreshToken.create({
        userId: tokenRecord.userId,
        tokenHash: newTokenHash,
        expiresAt: newExpiresAt,
        isRevoked: false,
        ipAddress,
        userAgent
      }, { transaction: t });

      await t.commit();

      return {
        userId: tokenRecord.userId,
        newRefreshToken: newRawRefreshToken,
        expiresAt: newExpiresAt
      };

    } catch (error) {
      if (!t.finished) await t.rollback();
      throw error;
    }
  }

  /**
   * Revoke single refresh token on logout
   */
  static async revokeRefreshToken(rawRefreshToken) {
    if (!rawRefreshToken) return;
    const tokenHash = this.hashToken(rawRefreshToken);
    await RefreshToken.update({ isRevoked: true }, { where: { tokenHash } });
  }

  /**
   * Revoke all active refresh tokens for a user (on password change, reset, or logout-all)
   */
  static async revokeAllUserTokens(userId) {
    if (!userId) return;
    await RefreshToken.update({ isRevoked: true }, { where: { userId } });
  }

  /**
   * Create a single-use password reset token (valid 1 hour)
   */
  static async createPasswordResetToken(userId) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await PasswordResetToken.create({
      userId,
      tokenHash,
      expiresAt,
      isUsed: false
    });

    return rawToken;
  }

  /**
   * Verify a password reset token
   */
  static async verifyPasswordResetToken(rawToken) {
    if (!rawToken) return null;
    const tokenHash = this.hashToken(rawToken);

    const record = await PasswordResetToken.findOne({
      where: { tokenHash, isUsed: false }
    });

    if (!record || new Date(record.expiresAt) < new Date()) {
      return null;
    }

    return record;
  }

  /**
   * Consume and mark reset token as used
   */
  static async consumePasswordResetToken(tokenId) {
    await PasswordResetToken.update({ isUsed: true }, { where: { id: tokenId } });
  }
}

module.exports = TokenService;
