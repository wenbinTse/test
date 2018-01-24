import * as mongoose from 'mongoose';
import { Location, Gender, UserType } from '../shared/interface';

const userSchema = new mongoose.Schema({
  name: {type: String, required: true, trim: true},
  userType: {type: UserType, default: UserType.ORDINARY},
  email: {type: String, required: true, unique: true, index: true, trim: true},
  location: {type: Location},
  gender: {type: Gender},
  profileImage: {type: mongoose.Schema.Types.ObjectId},
  createdDate: {type: Date, default: new Date()}
});

export = mongoose.model('User', userSchema);
