const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }, 
    action: {
      type: String,
      enum: [
        'Task created',
        'Task assigned',
        'Status changed',
        'Priority changed',
        'Due date changed',
        'Comment added',
        'Task updated',
      ],
      required: true,
    },
    previousValue: {
      type: String,
      default: '',
    },
    newValue: {
      type: String,
      default: '',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('Activity', ActivitySchema);
