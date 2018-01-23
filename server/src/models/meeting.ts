import * as mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String, required: true},
  startDate: {type: String, required: true},
  endDate: {type: String, required: true},
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
