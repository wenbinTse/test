"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
class Urls {
}
Urls.profileImage = (id) => {
    if (id) {
        return config_1.default.server + '/api/file/profileImage/' + id;
    }
    return '';
};
Urls.meetingImage = (id) => config_1.default.server + '/api/file/meetingImage/' + id;
exports.Urls = Urls;
//# sourceMappingURL=urls.js.map