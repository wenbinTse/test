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
  meetings: Meeting[];
}

export enum UserMode {
  LOGIN,
  REGISTER
}

export enum AttendanceStatus {
  PENDING, // 审核中
  REFUSED,
  AUDITED // 审核通过,
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
  _id: string;
  name: string;
  location: Location;
  description: string;
  detail: string;
  startDate: Date;
  endDate: Date;
  guests: Guest[];
  images: string[];
  stayTypes: string[];
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
  admin: boolean;
}

export interface Attandence {
  _id: string;
  taxPayerId: string;
  invoiceTitle: string;
  meeting: Meeting;
  user: User;
  phone: string;
  forecastArriveTime: string;
  stayType: string;
  stayDates: Date[];
  remarks: string;
  status: AttendanceStatus;
  createdDate: Date;
}

export interface FileObject {
  id: string;
  name: string;
  fileType: string;
  size: number;
  createdDate: Date;
}

export const allStayTypes: string[] = ['不住宿', '合住', '独住标准间', '独住大床房'];

export const stayTypeOptions: Array<{label: string, value: string}> =
  allStayTypes.map((type) => ({label: type, value: type}));
