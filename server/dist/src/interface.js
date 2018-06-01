"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ResponseCode;
(function (ResponseCode) {
    ResponseCode[ResponseCode["SUCCESS"] = 0] = "SUCCESS";
    ResponseCode[ResponseCode["UNLOGIN"] = 1] = "UNLOGIN";
    ResponseCode[ResponseCode["ACCESS_DENIED"] = 2] = "ACCESS_DENIED";
    ResponseCode[ResponseCode["INVALID_INPUT"] = 3] = "INVALID_INPUT";
    ResponseCode[ResponseCode["INCOMPLETE_INPUT"] = 4] = "INCOMPLETE_INPUT";
    ResponseCode[ResponseCode["ERROR"] = 5] = "ERROR";
    ResponseCode[ResponseCode["INCORRECT_USERNAME_OR_PASSWORD"] = 6] = "INCORRECT_USERNAME_OR_PASSWORD";
    ResponseCode[ResponseCode["UNREGISTERED"] = 7] = "UNREGISTERED";
    ResponseCode[ResponseCode["TOO_OFTEN"] = 8] = "TOO_OFTEN";
    ResponseCode[ResponseCode["FIND_NOTHING"] = 9] = "FIND_NOTHING";
    ResponseCode[ResponseCode["DUPLICATE_KEY"] = 11000] = "DUPLICATE_KEY";
})(ResponseCode = exports.ResponseCode || (exports.ResponseCode = {}));
var Gender;
(function (Gender) {
    Gender[Gender["MALE"] = 0] = "MALE";
    Gender[Gender["FEMALE"] = 1] = "FEMALE";
})(Gender = exports.Gender || (exports.Gender = {}));
var UserType;
(function (UserType) {
    UserType[UserType["ADMIN"] = 0] = "ADMIN";
    UserType[UserType["MEETING_ADMIN"] = 1] = "MEETING_ADMIN";
    UserType[UserType["ORDINARY"] = 2] = "ORDINARY";
})(UserType = exports.UserType || (exports.UserType = {}));
var UserMode;
(function (UserMode) {
    UserMode[UserMode["LOGIN"] = 0] = "LOGIN";
    UserMode[UserMode["REGISTER"] = 1] = "REGISTER";
})(UserMode = exports.UserMode || (exports.UserMode = {}));
var AttendanceStatus;
(function (AttendanceStatus) {
    AttendanceStatus[AttendanceStatus["PENDING"] = 0] = "PENDING";
    AttendanceStatus[AttendanceStatus["REFUSED"] = 1] = "REFUSED";
    AttendanceStatus[AttendanceStatus["AUDITED"] = 2] = "AUDITED"; // 审核通过,
})(AttendanceStatus = exports.AttendanceStatus || (exports.AttendanceStatus = {}));
exports.allStayTypes = ['不住宿', '合住', '独住标准间', '独住大床房'];
exports.stayTypeOptions = exports.allStayTypes.map((type) => ({ label: type, value: type }));
//# sourceMappingURL=interface.js.map