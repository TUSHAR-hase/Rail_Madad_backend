import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  // Existing fields...
  category: String,
  subCategory: String,
  details: String,
  trainNo: String,
  
  // CHANGE 25: Add coachNumber field
  coachNo: {
    type: String,
   
  },
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",   // Users model ka naam
    required: true   // Agar aapko compulsory chahiye to true rakho
  },
  pnrNumber: String,
  department: String,
  status: String,
  userPhone: {
  type: String,
  required: false
},

  // CHANGE 26: Add improved call tracking fields
  maxCallAttempts: {
    type: Number,
    default: 3
  },
      resolved: { type: Boolean, default: false }, 
    resolvedAt: { type: Date, default: null },
    resolutionTimeMinutes: { type: Number, default: null },
    resolvedWithin5Min: { type: Boolean, default: false },
  lastCallTime: Date,
  lastRetryReason: String,
  
  // CHANGE 27: Add call history array
  callHistory: [{
    attempt: Number,
    callSid: String,
    status: String,
    timestamp: Date,
    isRetry: {
      type: Boolean,
      default: false
    }
  }],
  
  // CHANGE 28: Add SMS tracking fields
  smsBackupTime: Date,
  notificationMethod: {
    type: String,
    enum: ['IVR_CALL', 'SMS_FALLBACK', 'BOTH'],
    default: 'IVR_CALL'
  },
  
  notificationErrors: {
    type: Boolean,
    default: false
  },
  
  lastErrorTime: Date,
  
  // CHANGE 29: Add acknowledgment tracking
  acknowledgedBy: String,
  acknowledgedMethod: {
    type: String,
    enum: ['IVR', 'SMS', 'MANUAL'],
    default: 'IVR'
  },
  
  // Existing fields...
  callAttempts: Number,
  acknowledgmentReceived: Boolean,
  acknowledgedAt: Date,
  staffCalled: Boolean,
  callSid: String,
  assignedTo: {
    name: String,
    phone: String,
    department: String
  },
  staffNotified: Boolean,
  smsSid: String,
  smsBackup: Boolean,
  lastCallStatus: String,
  lastCallStatusTime: Date,
  callsFailed: Boolean
}, {
  timestamps: true
});

// CHANGE 30: Add indexes for better performance
complaintSchema.index({ acknowledgmentReceived: 1, createdAt: 1 });
complaintSchema.index({ callAttempts: 1, status: 1 });
complaintSchema.index({ trainNo: 1, coachNumber: 1 });
const Complaint =mongoose.models.Complaints|| mongoose.model("Complaints", complaintSchema);


export default Complaint;
