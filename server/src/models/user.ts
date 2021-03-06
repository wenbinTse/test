import * as mongoose from 'mongoose';
import { Gender, UserType, Status } from '../shared/interface';

const userSchema = new mongoose.Schema({
  name: {type: String, required: true, trim: true},
  userType: {type: UserType, default: UserType.ORDINARY},
  email: {type: String, required: true, unique: true, index: true, trim: true},
  password: {type: {hash: String, salt: String}, required: true},
  gender: {type: Gender},
  corporation: {type: String},
  title: {type: String},
  job: {type: String},
  profileImage: {type: mongoose.Schema.Types.ObjectId},
  createdDate: {type: Date, default: new Date()},
  validated: {type: Boolean, default: false},
  hashForValidation: {type: String},
  verificationCode: {
    type: {
      code: {type: String},
      sendTime: {type: Date}
    }
  },
  location: {
    type: {
      province: String,
      city: String,
      address: String
    },
    default: {
      province: '',
      city: '',
      address: ''
    }
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
  status: {type: Status, default: Status.ACTIVE}
});

export const User = mongoose.model('User', userSchema);
