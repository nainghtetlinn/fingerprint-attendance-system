const express = require('express')
const router = express.Router()

const Attendance = require('../models/Attendance')
const isLoggedIn = require('../middleware/isLoggedIn')

router.route('/').get(isLoggedIn, async (req, res) => {
  try {
    const { filter = 'all', page = 1, size = 10 } = req.query
    let query = {}

    if (filter === 'today') {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date()
      endOfDay.setHours(23, 59, 59, 999)

      query.date = { $gte: startOfDay, $lte: endOfDay }
    } else if (filter === 'month') {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      query.date = { $gte: start, $lte: end }
    }

    const limit = parseInt(size, 10) || 10
    const skip = (parseInt(page, 10) - 1) * limit

    const totalRecords = await Attendance.countDocuments(query)
    const totalPages = Math.ceil(totalRecords / limit)

    const records = await Attendance.find(query)
      .populate('student')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)

    res.render('dashboard', {
      records,
      filter,
      title: 'Dashboard',
      currentPath: '/dashboard',
      pagination: {
        currentPage: parseInt(page, 10),
        pageSize: limit,
        totalRecords,
        totalPages,
      },
    })
  } catch (err) {
    res.status(500).send('Failed to load dashboard')
  }
})

module.exports = router
