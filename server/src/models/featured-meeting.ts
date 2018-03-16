import * as mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true
  }
});

export const FeaturedMeeting = mongoose.model('FeaturedMeeting', meetingSchema);
