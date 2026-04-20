export type DataContext = 'live' | 'test';

export type UserEvt =
  | {
      type: 'userCreated';
      email: string;
      userName: string;
      phoneNumber: string;
      passwordHash?: string;
      dateOfBirth?: string;
      performedBy?: string;
    }
  | {
      type: 'userEmailVerified';
      performedBy?: string;
    }
  | {
      type: 'userNINVerified';
      performedBy?: string;
    }
  | {
      type: 'userAdminVerified';
      performedBy?: string;
    }
  | {
      type: 'userProfileImageUpdated';
      profileImage: string;
      performedBy?: string;
    }
  | {
      type: 'userNameChanged';
      userName: string;
      performedBy?: string;
    }
  | {
      type: 'userPhoneNumberChanged';
      phoneNumber: string;
      performedBy?: string;
    }
  | {
      type: 'userEmailChanged';
      email: string;
      performedBy?: string;
    }
  | {
      type: 'userRoleChanged';
      role: string;
      performedBy?: string;
    }
  | {
      type: 'userRankChanged';
      rank: number;
      performedBy?: string;
    }
  | {
      type: 'userPioneerGranted';
      performedBy?: string;
    }
  | {
      type: 'userPasswordResetRequested';
      token: string;
      expiresAt: number;
      performedBy?: string;
    }
  | {
      type: 'userPasswordReset';
      performedBy?: string;
    }
  | {
      type: 'userDisabled';
      performedBy?: string;
    }
  | {
      type: 'userDeleted';
      performedBy?: string;
    }
  | {
      type: 'userLoggedIn';
      performedBy?: string;
    };

export type UserAgg = {
  email: string;
  userName: string;
  phoneNumber: string;
  dateOfBirth?: string;
  NIN?: string;
  lastLogin?: Date;
  verifiedEmail: boolean;
  verifiedNIN: boolean;
  adminVerified: boolean;
  role: string;
  rank: number;
  verificationCompleted: boolean;
  socialMedia: string[];
  profileImage: string;
  pioneer: boolean;
  forgottonPasswordToken?: string;
  forgottonPasswordTokenExpireAt?: number;
  verifyToken?: string;
  verificationTokenExpireAt?: number;
  disabled: boolean;
  deleted: boolean;
};

export type UserCmd =
  | {
      type: 'create';
      email: string;
      userName: string;
      phoneNumber: string;
      passwordHash?: string;
      dateOfBirth?: string;
      performedBy?: string;
    }
  | {
      type: 'verifyEmail';
      performedBy?: string;
    }
  | {
      type: 'verifyNIN';
      performedBy?: string;
    }
  | {
      type: 'adminVerify';
      performedBy?: string;
    }
  | {
      type: 'updateProfileImage';
      profileImage: string;
      performedBy?: string;
    }
  | {
      type: 'changeName';
      userName: string;
      performedBy?: string;
    }
  | {
      type: 'changePhoneNumber';
      phoneNumber: string;
      performedBy?: string;
    }
  | {
      type: 'changeEmail';
      email: string;
      performedBy?: string;
    }
  | {
      type: 'changeRole';
      role: string;
      performedBy?: string;
    }
  | {
      type: 'changeRank';
      rank: number;
      performedBy?: string;
    }
  | {
      type: 'grantPioneer';
      performedBy?: string;
    }
  | {
      type: 'requestPasswordReset';
      token: string;
      expiresAt: number;
      performedBy?: string;
    }
  | {
      type: 'resetPassword';
      performedBy?: string;
    }
  | {
      type: 'disable';
      performedBy?: string;
    }
  | {
      type: 'delete';
      performedBy?: string;
    }
  | {
      type: 'login';
      performedBy?: string;
    };