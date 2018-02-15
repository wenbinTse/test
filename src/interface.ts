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
  FIND_NOTHING,
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
  title: string;
  corporation: string;
  gender: Gender;
  job: string;
  userType: UserType;
  location: Location;
}

export enum UserMode {
  LOGIN,
  REGISTER
}

export interface Guest {
  name: string;
  description: string;
  randomId: number;
  valid: boolean;
  profileImageSrc?: string;
}

export interface Location {
  province: string;
  city: string;
  address: string;
}

export interface Meeting {
  name: string;
  location: Location;
  description: string;
  detail: string;
  startDate: string;
  endDate: string;
  guests: Guest[];
  images: string[];
}

export interface Review {
  owner: {
    _id: string,
    name: string
  };
  _id: string;
  content: string;
  meeting?: string;
  numOfReply?: number;
  createdDate?: Date;
  profileImageSrc?: string;
}
