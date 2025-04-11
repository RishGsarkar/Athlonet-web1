const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  sportName: { type: String, required: true },
  eventName: { type: String, required: true },
  date: { type: Date, required: true },
  entryFee: { type: Number },
  prize: { type: String },
  ageGroup: { type: String },
  additionalNote: { type: String },
  createdAt: { type: Date, default: Date.now },
  isTeamBased: { type: Boolean, default: false },
  participantsPerTeam: { type: Number },
  registeredUsers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    teamName: { type: String },
    teamMembers: [String]
  }]
});

module.exports = mongoose.model('Event', eventSchema);