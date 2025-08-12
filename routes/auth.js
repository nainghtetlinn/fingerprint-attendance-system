const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')

const User = require('../models/User')

// Show login form
router
  .route('/login')
  .get((req, res) => {
    res.render('login', { error: null })
  })
  .post(async (req, res) => {
    try {
      const { username, password } = req.body
      const user = await User.findOne({ username })

      if (!user) {
        return res.render('login', { error: 'User not found' })
      }

      const match = bcrypt.compare(password, user.password)
      if (!match) {
        return res.render('login', { error: 'Incorrect password' })
      }

      req.session.userId = user._id
      res.redirect('/')
    } catch (err) {
      res.status(500).send('Internal server error')
    }
  })

router.route('/logout').get((req, res) => {
  req.session.destroy(() => res.redirect('/auth/login'))
})

module.exports = router
