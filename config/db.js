const mongoose = require('mongoose')

const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(conn => {
      console.log(`MongoDB connected: ${conn.connection.host}`)
    })
    .catch(err => {
      console.log(err)
      process.exit(1)
    })
}

module.exports = { connectDB }
