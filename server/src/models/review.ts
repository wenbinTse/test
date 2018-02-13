import * as mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting'
  },
  content: {type: String, required: true},
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  },
  createdDate: {type: Date, default: new Date()},
  admin: {type: Boolean}, // 是否是管理员的发言
  numOfReply: {type: Number, default: 0}
});

export = mongoose.model('Review', reviewSchema);
