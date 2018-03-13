import * as mongoose from 'mongoose';
import { AttendanceStatus } from '../shared/interface';

const attendanceSchema = new mongoose.Schema({
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taxPayerId: {
    type: String
  },
  invoiceTitle: {
    type: String
  },
  phone: {
    type: String
  },
  forecastArriveTime: {
    type: String
  }, // 预计到达时间
  stayType: {type: String}, // 住宿类型
  stayDates: {type: [Date]}, // 住宿日期
  remarks: {type: String}, // 备注
  status: {type: AttendanceStatus, default: AttendanceStatus.PENDING},
  checkedIn: {type: Boolean, default: false},
  createdDate: {type: Date, default: new Date()}
});

attendanceSchema.index({meeting: 1, user: 1}, {unique: true});

export const Attendance = mongoose.model('Attendance', attendanceSchema);
