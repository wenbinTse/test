import * as mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true
  }
});

export = mongoose.model('FeaturedMeeting', meetingSchema);
