import * as mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: 'User'
  },
  name: {type: String, required: true, trim: true},
  description: {type: String, trim: true},
  detail: {type: String, trim: true},
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
  createdDate: {type: Date, default: new Date()}
});

export = mongoose.model('Meeting', meetingSchema);
