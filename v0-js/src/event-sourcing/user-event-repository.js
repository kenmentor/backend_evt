/**
 * User Event Repository - MongoDB Version (Updated)
 * 
 * Events → user_events collection
 * Read Model → users collection
 * 
 * Event naming: userCreated, userEmailVerified, etc. (aggregate prefix + past tense)
 */

const EventRepository = require('./EventRepository');

const initialState = {
  email: '', userName: '', phoneNumber: '', dateOfBirth: null, NIN: null, lastLogin: null,
  verifiedEmail: false, verifiedNIN: false, adminVerified: false, role: 'USER', rank: 1,
  verificationCompleted: false, socialMedai: [], profileImage: '', pioneer: false,
  forgottonPasswordToken: null, forgottonPasswordTokenExpireAt: null, verifyToken: null,
  verificationTokenExpireAt: null, disabled: false, deleted: false,
};

const fold = (evt, state) => {
  switch (evt.type) {
    case 'userCreated':
      return { email: evt.email, userName: evt.userName, phoneNumber: evt.phoneNumber, pioneer: false };
    case 'userEmailVerified':
      return { verifiedEmail: true };
    case 'userNINVerified':
      return { verifiedNIN: true, verificationCompleted: true };
    case 'userAdminVerified':
      return { adminVerified: true };
    case 'userProfileImageUpdated':
      return { profileImage: evt.profileImage };
    case 'userLoggedIn':
      return { lastLogin: new Date() };
    case 'userRoleChanged':
      return { role: evt.role };
    case 'userRankChanged':
      return { rank: evt.rank };
    case 'userPioneerGranted':
      return { pioneer: true };
    case 'userPasswordResetRequested':
      return { forgottonPasswordToken: evt.token, forgottonPasswordTokenExpireAt: evt.expiresAt };
    case 'userPasswordReset':
      return { forgottonPasswordToken: null, forgottonPasswordTokenExpireAt: null };
    case 'userDisabled':
      return { disabled: true };
    case 'userDeleted':
      return { disabled: true, deleted: true };
    default:
      return {};
  }
};

const eventHandlers = {
  userCreated: async (id, evt, repo) => {
    await repo._addToReadModel(id, {
      email: evt.email, userName: evt.userName, phoneNumber: evt.phoneNumber,
      verifiedEmail: false, adminVerified: false, role: 'USER', rank: 1, pioneer: false, disabled: false,
    });
  },
  userEmailVerified: async (id, _, repo) => repo._updateInReadModel(id, { verifiedEmail: true }),
  userNINVerified: async (id, _, repo) => repo._updateInReadModel(id, { verifiedNIN: true, verificationCompleted: true }),
  userAdminVerified: async (id, _, repo) => repo._updateInReadModel(id, { adminVerified: true }),
  userProfileImageUpdated: async (id, evt, repo) => repo._updateInReadModel(id, { profileImage: evt.profileImage }),
  userLoggedIn: async (id, _, repo) => repo._updateInReadModel(id, { lastLogin: new Date() }),
  userRoleChanged: async (id, evt, repo) => repo._updateInReadModel(id, { role: evt.role }),
  userRankChanged: async (id, evt, repo) => repo._updateInReadModel(id, { rank: evt.rank }),
  userPioneerGranted: async (id, _, repo) => repo._updateInReadModel(id, { pioneer: true }),
  userPasswordResetRequested: async (id, evt, repo) => repo._updateInReadModel(id, { forgottonPasswordToken: evt.token, forgottonPasswordTokenExpireAt: evt.expiresAt }),
  userPasswordReset: async (id, _, repo) => repo._updateInReadModel(id, { forgottonPasswordToken: null, forgottonPasswordTokenExpireAt: null }),
  userDisabled: async (id, _, repo) => repo._updateInReadModel(id, { disabled: true }),
  userDeleted: async (id, _, repo) => repo._updateInReadModel(id, { disabled: true, deleted: true }),
};

const commands = {
  register: async (cmd, agg) => {
    if (agg.version > 0) throw new Error('User already exists');
    return { type: 'userCreated', email: cmd.email, userName: cmd.userName, phoneNumber: cmd.phoneNumber };
  },
  verifyEmail: async (_, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.verifiedEmail) return;
    return { type: 'userEmailVerified' };
  },
  verifyNIN: async (_, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.verifiedNIN) return;
    return { type: 'userNINVerified' };
  },
  adminVerify: async (_, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.adminVerified) return;
    return { type: 'userAdminVerified' };
  },
  login: async (_, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.disabled) throw new Error('User is disabled');
    return { type: 'userLoggedIn' };
  },
  updateProfileImage: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.profileImage === cmd.profileImage) return;
    return { type: 'userProfileImageUpdated', profileImage: cmd.profileImage };
  },
  changeRole: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.role === cmd.role) return;
    return { type: 'userRoleChanged', role: cmd.role };
  },
  changeRank: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.rank === cmd.rank) return;
    return { type: 'userRankChanged', rank: cmd.rank };
  },
  grantPioneer: async (_, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.pioneer) return;
    return { type: 'userPioneerGranted' };
  },
  requestPasswordReset: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.forgottonPasswordToken) return;
    return { type: 'userPasswordResetRequested', token: cmd.token, expiresAt: cmd.expiresAt };
  },
  resetPassword: async (_, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    if (!agg.forgottonPasswordToken) return;
    return { type: 'userPasswordReset' };
  },
  disable: async (_, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.disabled) return;
    return { type: 'userDisabled' };
  },
  delete: async (_, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    return { type: 'userDeleted' };
  },
};

let userEventRepo = null;

function createUserEventRepo(readModelCollection) {
  if (userEventRepo) return userEventRepo;
  
  userEventRepo = new EventRepository('user', 'user-events', {
    initialState,
    fold,
    commands,
    eventHandlers,
  }, readModelCollection);

  userEventRepo._initEventSourcing();
  return userEventRepo;
}

module.exports = { createUserEventRepo };