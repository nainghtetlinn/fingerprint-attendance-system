const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
  name: String,
  rollNo: String,
  fpid: String,
})

module.exports = mongoose.model('Student', studentSchema)
