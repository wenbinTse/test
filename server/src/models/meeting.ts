import * as mongoose from 'mongoose';
import { Location } from '../shared/interface';

const meetingSchema = new mongoose.Schema({
  name: {type: String, required: true, trim: true},
  description: {type: String, required: true, trim: true},
  startDate: {type: String, required: true},
  endDate: {type: String, required: true},
  images: {type: [mongoose.Schema.Types.ObjectId]},
  location: {
    type: {
      province: String,
      city: String,
      address: String
    }
  },
  guests: {
    type: [{
      name: String,
      description: String
    }]
  },
  contacts: [{
    name: String,
    email: String,
    phone: String
  }],
  createdDate: {type: Date, default: new Date()}
});

export = mongoose.model('Meeting', meetingSchema);
