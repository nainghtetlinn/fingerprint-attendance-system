const express = require('express')
const router = express.Router()

const Student = require('../models/Student')
const Attendance = require('../models/Attendance')

router
  .route('/register')
  .get(async (req, res) => {
    try {
      const student = await Student.findOne({ fpid: null })

      if (!student)
        return res.status(404).send('All student have been registered.')

      res.status(200).send(student._id)
    } catch (err) {
      res.status(500).send('Error updating student and attendance.')
    }
  })
  .post(async (req, res) => {
    try {
      const { fpid } = req.body
      const exists = await Student.findOne({ fpid })
      if (exists) return res.status(400).send('Fingerprint ID already exists.')

      const student = await Student.findOneAndUpdate(
        { fpid: null },
        { fpid },
        { new: true }
      )
      if (!student)
        return res.status(400).send('Student already registered fingerprint.')

      res.status(200).send('Updated successfully.')
    } catch (err) {
      res.status(500).send('Error updating student and attendance.')
    }
  })

router.post('/attendance', async (req, res) => {
  try {
    const { fpid } = req.body
    const student = await Student.findOne({ fpid })
    if (!student) return res.status(404).send('Student not found.')

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)
    const attendance = await Attendance.findOne({
      student: student._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    })
    if (attendance) return res.status(400).send('Already submitted attendance.')

    await Attendance.create({ student: student._id, date: new Date() })
    res.status(200).send('Attendance submitted successfully.')
  } catch (err) {
    res.status(500).send('Error submitting attendance.')
  }
})

module.exports = router
