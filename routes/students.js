const express = require('express');
const router = express.Router();

const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

router.route('/').get(async (req, res) => {
  try {
    const { page = 1, size = 10, search = '' } = req.query;
    let query = {};

    const limit = parseInt(size, 10) || 10;
    const skip = (parseInt(page, 10) - 1) * limit;

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } },
      ];
    }

    const totalRecords = await Student.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    const students = await Student.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    res.render('students', {
      students,
      title: 'Students',
      currentPath: '/students',
      search,
      pagination: {
        totalPages,
        currentPage: parseInt(page, 10),
        pageSize: limit,
        totalRecords,
      },
    });
  } catch (err) {
    res.status(500).send('Internal server error');
  }
});

const getAttendingDaysCount = (startDate, endDate) => {
  let count = 0;
  const current = new Date(startDate);
  while (current <= endDate) {
    const day = current.getDay(); // 0 = Sun, 6 = Sat
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
};

router.route('/details/:id').get(async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).send('Student not found');
    }
    const records = await Attendance.find({ student: studentId }).sort({
      date: -1,
    });
    if (records.length > 0) {
      const firstDay = records[records.length - 1].date;
      const today = new Date();
      const totalAttendingDays = getAttendingDaysCount(firstDay, today);
      const attendancePercentage =
        totalAttendingDays > 0
          ? ((records.length / totalAttendingDays) * 100).toFixed(2)
          : 0;
      res.render('student_details', {
        student,
        records,
        registrationDate: firstDay,
        attendancePercentage,
        totalAttendingDays,
        attendedDays: records.length,
        title: 'Student Details',
        currentPath: '/students',
      });
    } else {
      res.render('student_details', {
        student,
        records,
        registrationDate: null,
        attendancePercentage: 0,
        totalAttendingDays: 0,
        attendedDays: 0,
        title: 'Student Details',
        currentPath: '/students',
      });
    }
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

router
  .route('/create')
  .get((req, res) => {
    res.render('register', {
      title: 'Register',
      currentPath: '/students/create',
      error: null,
    });
  })
  .post(async (req, res) => {
    try {
      const studentWithNoFpid = await Student.findOne({ fpid: null });
      if (studentWithNoFpid)
        return res.render('register', {
          title: 'Register',
          currentPath: '/students/create',
          error: 'Please register fingerprint for the previous student first.',
        });
      const { name, rollNo } = req.body;
      const exists = await Student.findOne({ rollNo });
      if (exists)
        return res.render('register', {
          title: 'Register',
          currentPath: '/students/create',
          error: 'Roll number already exists.',
        });
      await Student.create({ name, rollNo, fpid: null });
      res.redirect('/students');
    } catch (err) {
      res.status(500).send('Error creating student');
    }
  });

router.post('/delete/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (student) {
      await Attendance.deleteMany({ fingerprintId: student.fingerprintId });
    }
    res.redirect('/students');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting student and attendance.');
  }
});

module.exports = router;
