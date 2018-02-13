import * as mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true
  },
  content: {type: String, required: true},
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  },
  createdDate: {type: Date, default: new Date()}
});

export = mongoose.model('Review', reviewSchema);
