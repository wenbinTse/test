export enum ResponseCode {
  SUCCESS,
  ACCESS_DENIED,
  INVALID_INPUT,
  INCOMPLETE_INPUT,
  ERROR,
  INCORRECT_USERNAME_OR_PASSWORD,
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

export interface Location {
  province: string;
  city: string;
  address: string;
}

export interface Password {
  hash: string;
  salt: string;
}

export interface Addressee {
  name: string;
  email: string;
}