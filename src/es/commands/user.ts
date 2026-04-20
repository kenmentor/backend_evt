import { createCommands } from 'evtstore';
import type { UserEvt, UserAgg, UserCmd } from '../types/user';
import { domain } from '../domain';

function getChangedFields<T extends object>(
  input: T,
  current: Record<string, unknown>,
  fields: Array<keyof T>
) {
  const changes: Record<string, unknown> = {};
  for (const field of fields) {
    const next = input[field];
    if (next !== undefined && next !== current[field as string]) {
      changes[field as string] = next;
    }
  }
  return changes;
}

export const userCmd = createCommands<UserEvt, UserAgg, UserCmd>(domain.users, {
  async create(cmd, agg) {
    if (agg.version > 0) throw new Error('User already exists');
    return {
      type: 'userCreated',
      email: cmd.email,
      userName: cmd.userName,
      phoneNumber: cmd.phoneNumber,
      passwordHash: cmd.passwordHash,
      dateOfBirth: cmd.dateOfBirth,
      performedBy: cmd.performedBy,
    };
  },

  async verifyEmail(cmd, agg) {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.deleted) throw new Error('User is deleted');
    if (agg.verifiedEmail) return;
    return {
      type: 'userEmailVerified',
      performedBy: cmd.performedBy,
    };
  },

  async verifyNIN(cmd, agg) {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.deleted) throw new Error('User is deleted');
    if (agg.verifiedNIN) return;
    return {
      type: 'userNINVerified',
      performedBy: cmd.performedBy,
    };
  },

  async adminVerify(cmd, agg) {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.deleted) throw new Error('User is deleted');
    if (agg.adminVerified) return;
    return {
      type: 'userAdminVerified',
      performedBy: cmd.performedBy,
    };
  },

  async updateProfileImage(cmd, agg) {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.deleted) throw new Error('User is deleted');
    if (!cmd.profileImage) throw new Error('Profile image required');
    return {
      type: 'userProfileImageUpdated',
      profileImage: cmd.profileImage,
      performedBy: cmd.performedBy,
    };
  },

  async changeName(cmd, agg) {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.deleted) throw new Error('User is deleted');
    if (!cmd.userName) throw new Error('Name required');
    if (agg.userName === cmd.userName) return;
    return {
      type: 'userNameChanged',
      userName: cmd.userName,
      performedBy: cmd.performedBy,
    };
  },

  async changePhoneNumber(cmd, agg) {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.deleted) throw new Error('User is deleted');
    if (!cmd.phoneNumber) throw new Error('Phone number required');
    if (agg.phoneNumber === cmd.phoneNumber) return;
    return {
      type: 'userPhoneNumberChanged',
      phoneNumber: cmd.phoneNumber,
      performedBy: cmd.performedBy,
    };
  },

  async changeEmail(cmd, agg) {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.deleted) throw new Error('User is deleted');
    if (!cmd.email) throw new Error('Email required');
    if (agg.email === cmd.email) return;
    return {
      type: 'userEmailChanged',
      email: cmd.email,
      performedBy: cmd.performedBy,
    };
  },

  async changeRole(cmd, agg) {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.deleted) throw new Error('User is deleted');
    if (!cmd.role) throw new Error('Role required');
    if (agg.role === cmd.role) return;
    return {
      type: 'userRoleChanged',
      role: cmd.role,
      performedBy: cmd.performedBy,
    };
  },

  async changeRank(cmd, agg) {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.deleted) throw new Error('User is deleted');
    if (cmd.rank === undefined) throw new Error('Rank required');
    if (agg.rank === cmd.rank) return;
    return {
      type: 'userRankChanged',
      rank: cmd.rank,
      performedBy: cmd.performedBy,
    };
  },

  async grantPioneer(cmd, agg) {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.deleted) throw new Error('User is deleted');
    if (agg.pioneer) return;
    return {
      type: 'userPioneerGranted',
      performedBy: cmd.performedBy,
    };
  },

  async requestPasswordReset(cmd, agg) {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.deleted) throw new Error('User is deleted');
    if (!cmd.token || !cmd.expiresAt) throw new Error('Token and expiresAt required');
    if (agg.forgottonPasswordToken) return;
    return {
      type: 'userPasswordResetRequested',
      token: cmd.token,
      expiresAt: cmd.expiresAt,
      performedBy: cmd.performedBy,
    };
  },

  async resetPassword(cmd, agg) {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.deleted) throw new Error('User is deleted');
    if (!agg.forgottonPasswordToken) return;
    return {
      type: 'userPasswordReset',
      performedBy: cmd.performedBy,
    };
  },

  async disable(cmd, agg) {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.deleted) throw new Error('User is deleted');
    if (agg.disabled) return;
    return {
      type: 'userDisabled',
      performedBy: cmd.performedBy,
    };
  },

  async delete(cmd, agg) {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.deleted) throw new Error('User already deleted');
    return {
      type: 'userDeleted',
      performedBy: cmd.performedBy,
    };
  },

  async login(cmd, agg) {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.deleted) throw new Error('User is deleted');
    if (agg.disabled) throw new Error('User is disabled');
    return {
      type: 'userLoggedIn',
      performedBy: cmd.performedBy,
    };
  },
});