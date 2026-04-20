import { createAggregate } from 'evtstore';
import type { UserEvt, UserAgg } from '../types/user';

export const userAgg = createAggregate<UserEvt, UserAgg, 'users'>({
  stream: 'users',
  create: (): UserAgg => ({
    email: '',
    userName: '',
    phoneNumber: '',
    dateOfBirth: undefined,
    NIN: undefined,
    lastLogin: undefined,
    verifiedEmail: false,
    verifiedNIN: false,
    adminVerified: false,
    role: 'USER',
    rank: 1,
    verificationCompleted: false,
    socialMedia: [],
    profileImage: '',
    pioneer: false,
    forgottonPasswordToken: undefined,
    forgottonPasswordTokenExpireAt: undefined,
    verifyToken: undefined,
    verificationTokenExpireAt: undefined,
    disabled: false,
    deleted: false,
  }),
  fold: (evt, prev): UserAgg => {
    switch (evt.type) {
      case 'userCreated':
        return {
          ...prev,
          email: evt.email,
          userName: evt.userName,
          phoneNumber: evt.phoneNumber,
          dateOfBirth: evt.dateOfBirth,
          verifiedEmail: false,
          verifiedNIN: false,
          adminVerified: false,
          role: 'USER',
          rank: 1,
          verificationCompleted: false,
          socialMedia: [],
          profileImage: '',
          pioneer: false,
          forgottonPasswordToken: undefined,
          forgottonPasswordTokenExpireAt: undefined,
          verifyToken: undefined,
          verificationTokenExpireAt: undefined,
          disabled: false,
          deleted: false,
        };

      case 'userEmailVerified':
        return {
          ...prev,
          verifiedEmail: true,
        };

      case 'userNINVerified':
        return {
          ...prev,
          verifiedNIN: true,
          verificationCompleted: true,
        };

      case 'userAdminVerified':
        return {
          ...prev,
          adminVerified: true,
        };

      case 'userProfileImageUpdated':
        return {
          ...prev,
          profileImage: evt.profileImage,
        };

      case 'userNameChanged':
        return {
          ...prev,
          userName: evt.userName,
        };

      case 'userPhoneNumberChanged':
        return {
          ...prev,
          phoneNumber: evt.phoneNumber,
        };

      case 'userEmailChanged':
        return {
          ...prev,
          email: evt.email,
        };

      case 'userRoleChanged':
        return {
          ...prev,
          role: evt.role,
        };

      case 'userRankChanged':
        return {
          ...prev,
          rank: evt.rank,
        };

      case 'userPioneerGranted':
        return {
          ...prev,
          pioneer: true,
        };

      case 'userPasswordResetRequested':
        return {
          ...prev,
          forgottonPasswordToken: evt.token,
          forgottonPasswordTokenExpireAt: evt.expiresAt,
        };

      case 'userPasswordReset':
        return {
          ...prev,
          forgottonPasswordToken: undefined,
          forgottonPasswordTokenExpireAt: undefined,
        };

      case 'userDisabled':
        return {
          ...prev,
          disabled: true,
        };

      case 'userDeleted':
        return {
          ...prev,
          disabled: true,
          deleted: true,
        };

      case 'userLoggedIn':
        return {
          ...prev,
          lastLogin: new Date(),
        };

      default:
        return prev;
    }
  },
});