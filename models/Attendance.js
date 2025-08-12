const mongoose = require('mongoose')

const attendanceSchema = mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Attendance', attendanceSchema)
