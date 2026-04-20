const { createAggregate } = require('evtstore');

const userAgg = createAggregate({
  stream: 'users',
  create: () => ({
    version: 0,
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
    socialMedia: [],
    profileImage: '',
    pioneer: false,
    forgottonPasswordToken: null,
    forgottonPasswordTokenExpireAt: null,
    verifyToken: null,
    verificationTokenExpireAt: null,
    disabled: false,
    deleted: false,
  }),
  fold: (evt, prev) => {
    switch (evt.type) {
      case 'userCreated':
        return {
          ...prev,
          version: 1,
          email: evt.email,
          userName: evt.userName,
          phoneNumber: evt.phoneNumber,
          dateOfBirth: evt.dateOfBirth || null,
          verifiedEmail: false,
          verifiedNIN: false,
          adminVerified: false,
          role: 'USER',
          rank: 1,
          verificationCompleted: false,
          socialMedia: [],
          profileImage: '',
          pioneer: false,
          forgottonPasswordToken: null,
          forgottonPasswordTokenExpireAt: null,
          verifyToken: null,
          verificationTokenExpireAt: null,
          disabled: false,
          deleted: false,
        };

      case 'userEmailVerified':
        return { ...prev, verifiedEmail: true };

      case 'userNINVerified':
        return { ...prev, verifiedNIN: true, verificationCompleted: true };

      case 'userAdminVerified':
        return { ...prev, adminVerified: true };

      case 'userProfileImageUpdated':
        return { ...prev, profileImage: evt.profileImage };

      case 'userNameChanged':
        return { ...prev, userName: evt.userName };

      case 'userPhoneNumberChanged':
        return { ...prev, phoneNumber: evt.phoneNumber };

      case 'userEmailChanged':
        return { ...prev, email: evt.email };

      case 'userRoleChanged':
        return { ...prev, role: evt.role };

      case 'userRankChanged':
        return { ...prev, rank: evt.rank };

      case 'userPioneerGranted':
        return { ...prev, pioneer: true };

      case 'userPasswordResetRequested':
        return {
          ...prev,
          forgottonPasswordToken: evt.token,
          forgottonPasswordTokenExpireAt: evt.expiresAt,
        };

      case 'userPasswordReset':
        return {
          ...prev,
          forgottonPasswordToken: null,
          forgottonPasswordTokenExpireAt: null,
        };

      case 'userDisabled':
        return { ...prev, disabled: true };

      case 'userDeleted':
        return { ...prev, disabled: true, deleted: true };

      case 'userLoggedIn':
        return { ...prev, lastLogin: new Date() };

      default:
        return prev;
    }
  },
});

module.exports = { userAgg };