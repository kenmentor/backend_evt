/**
 * User Event Repository - MongoDB Version
 * 
 * Events → user_events collection
 * Read Model → users collection
 */

const EventRepository = require('./EventRepository');

const initialState = {
  email: '',
  userName: '',
  phoneNumber: '',
  dateOfBirth: null,
  NIN: null,
  lastLogin: null,
  verifiedEmail: false,
  verifiedNIN: false,
  adminVerified: false,
  role: 'USER',
  rank: 1,
  verificationCompleted: false,
  socialMedai: [],
  profileImage: '',
  pioneer: false,
  forgottonPasswordToken: null,
  forgottonPasswordTokenExpireAt: null,
  verifyToken: null,
  verificationTokenExpireAt: null,
  disabled: false,
};

const fold = (evt, state) => {
  switch (evt.type) {
    case 'registered':
      return { email: evt.email, userName: evt.userName, phoneNumber: evt.phoneNumber, pioneer: false };
    case 'emailVerified':
      return { verifiedEmail: true };
    case 'ninVerified':
      return { verifiedNIN: true, verificationCompleted: true };
    case 'adminVerified':
      return { adminVerified: true };
    case 'profileImageUpdated':
      return { profileImage: evt.imageUrl };
    case 'loggedIn':
      return { lastLogin: new Date() };
    case 'roleChanged':
      return { role: evt.role };
    case 'rankChanged':
      return { rank: evt.rank };
    case 'pioneerGranted':
      return { pioneer: true };
    case 'passwordResetRequested':
      return { forgottonPasswordToken: evt.token, forgottonPasswordTokenExpireAt: evt.expiresAt };
    case 'passwordReset':
      return { forgottonPasswordToken: null, forgottonPasswordTokenExpireAt: null };
    case 'disabled':
      return { disabled: true };
    case 'deleted':
      return { disabled: true };
    default:
      return {};
  }
};

const eventHandlers = {
  registered: async (id, evt, repo) => {
    await repo._addToReadModel(id, {
      email: evt.email,
      userName: evt.userName,
      phoneNumber: evt.phoneNumber,
      verifiedEmail: false,
      adminVerified: false,
      role: 'USER',
      rank: 1,
      pioneer: false,
      disabled: false,
    });
  },
  emailVerified: async (id, _, repo) => repo._updateInReadModel(id, { verifiedEmail: true }),
  ninVerified: async (id, _, repo) => repo._updateInReadModel(id, { verifiedNIN: true, verificationCompleted: true }),
  adminVerified: async (id, _, repo) => repo._updateInReadModel(id, { adminVerified: true }),
  profileImageUpdated: async (id, evt, repo) => repo._updateInReadModel(id, { profileImage: evt.imageUrl }),
  loggedIn: async (id, _, repo) => repo._updateInReadModel(id, { lastLogin: new Date() }),
  roleChanged: async (id, evt, repo) => repo._updateInReadModel(id, { role: evt.role }),
  rankChanged: async (id, evt, repo) => repo._updateInReadModel(id, { rank: evt.rank }),
  pioneerGranted: async (id, _, repo) => repo._updateInReadModel(id, { pioneer: true }),
  passwordResetRequested: async (id, evt, repo) => repo._updateInReadModel(id, { forgottonPasswordToken: evt.token, forgottonPasswordTokenExpireAt: evt.expiresAt }),
  passwordReset: async (id, _, repo) => repo._updateInReadModel(id, { forgottonPasswordToken: null, forgottonPasswordTokenExpireAt: null }),
  disabled: async (id, _, repo) => repo._updateInReadModel(id, { disabled: true }),
  deleted: async (id, _, repo) => repo._updateInReadModel(id, { disabled: true }),
};

const commands = {
  register: async (cmd, agg) => {
    if (agg.version > 0) throw new Error('User already exists');
    return { type: 'registered', email: cmd.email, userName: cmd.userName, phoneNumber: cmd.phoneNumber };
  },
  verifyEmail: async (_, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.verifiedEmail) return;
    return { type: 'emailVerified' };
  },
  verifyNIN: async (_, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.verifiedNIN) return;
    return { type: 'ninVerified' };
  },
  adminVerify: async (_, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.adminVerified) return;
    return { type: 'adminVerified' };
  },
  login: async (_, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.disabled) throw new Error('User is disabled');
    return { type: 'loggedIn' };
  },
  updateProfileImage: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.profileImage === cmd.profileImage) return;
    return { type: 'profileImageUpdated', imageUrl: cmd.profileImage };
  },
  changeRole: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.role === cmd.role) return;
    return { type: 'roleChanged', role: cmd.role };
  },
  changeRank: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.rank === cmd.rank) return;
    return { type: 'rankChanged', rank: cmd.rank };
  },
  grantPioneer: async (_, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.pioneer) return;
    return { type: 'pioneerGranted' };
  },
  requestPasswordReset: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.forgottonPasswordToken) return;
    return { type: 'passwordResetRequested', token: cmd.token, expiresAt: cmd.expiresAt };
  },
  resetPassword: async (_, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    if (!agg.forgottonPasswordToken) return;
    return { type: 'passwordReset' };
  },
  disable: async (_, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    if (agg.disabled) return;
    return { type: 'disabled' };
  },
  delete: async (_, agg) => {
    if (agg.version === 0) throw new Error('User not found');
    return { type: 'deleted' };
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
