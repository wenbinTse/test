export enum ResponseCode {
  SUCCESS,
  UNLOGIN,
  ACCESS_DENIED,
  INVALID_INPUT,
  INCOMPLETE_INPUT,
  ERROR,
  INCORRECT_USERNAME_OR_PASSWORD,
  UNREGISTERED,
  TOO_OFTEN,
  DUPLICATE_KEY = 11000
}

export enum Gender {
  MALE,
  FEMALE
}

export enum UserType {
  ADMIN,
  MEETING_ADMIN,
  ORDINARY
}

export interface User {
  _id: string;
  name: string;
  profileImageSrc: string;
  email: string;
  userType: UserType;
}

export enum UserMode {
  LOGIN,
  REGISTER
}
