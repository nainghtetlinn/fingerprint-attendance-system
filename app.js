require('dotenv').config()
const os = require('os')
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')

const dashboardRoutes = require('./routes/dashboard')
const authRoutes = require('./routes/auth')
const studentsRoutes = require('./routes/students')
const apiRoutes = require('./routes/api')

const { connectDB } = require('./config/db')

// DB Connection
connectDB()

const app = express()

// Middleware
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
  })
)

// Routes
app.get('/', (req, res) => res.redirect('/dashboard'))
app.use('/dashboard', dashboardRoutes)
app.use('/auth', authRoutes)
app.use('/students', studentsRoutes)
app.use('/api', apiRoutes)

function getLocalIP() {
  const nets = os.networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return 'localhost' // fallback
}

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})
