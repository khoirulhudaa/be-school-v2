// require('dotenv').config();

// const { Worker } = require('bullmq');
// const Redis = require('ioredis');
// const Attendance    = require('../models/kehadiran');
// const KehadiranGuru = require('../models/kehadiranGuru');

// const connection = new Redis(process.env.REDIS_URL, {
//   maxRetriesPerRequest: null
// });

// const worker = new Worker(
//   'attendance-queue',
//   async job => {
  
//     const data = job.data;
  
//     // UTAMAKAN CEK targetTable YANG DIKIRIM CONTROLLER
//     const saveToGuruTable = data.targetTable === 'kehadiran_guru' || data.userRole === 'teacher';
//     const originalTime = data.createdAt;

//     console.log(`[WORKER] Memproses Job: ${job.id}`);
//     console.log(`[WORKER] Role: ${data.userRole} | Target: ${data.targetTable} | Decision: ${saveToGuruTable ? 'GURU' : 'SISWA'}`);

//     if (saveToGuruTable) {
//       // ── Guru / Tendik → kehadiran_guru ──────────────────────────────────
//       await KehadiranGuru.create({
//         schoolId:     data.schoolId,
//         guruId:       data.guruId,
//         userRole:     'teacher',
//         status:       'Hadir',
//         currentClass: data.currentClass || null,
//         latitude:     data.latitude,
//         longitude:    data.longitude,
//         method:       data.method || null,
//         createdAt:    originalTime, // <-- MASUKKAN DISINI
//         updatedAt:    originalTime
//       });

//     } else {
//       // ── Siswa → kehadiran (tabel lama, tidak berubah) ───────────────────
//       await Attendance.create({
//         studentId:    data.studentId,
//         guruId:       null,
//         userRole:     data.userRole,
//         schoolId:     data.schoolId,
//         currentClass: data.currentClass,
//         status:       'Hadir',
//         latitude:     data.latitude,
//         longitude:    data.longitude,
//         createdAt:    originalTime, // <-- MASUKKAN DISINI
//         updatedAt:    originalTime
//       });

//     }
//   },
//   {
//     connection,
//     concurrency: 50
//   }
// );

// worker.on('completed', job => {
//   console.log(`[WORKER] Job ${job.id} completed`);
// });

// worker.on('failed', (job, err) => {
//   console.error(`[WORKER] Job ${job?.id} failed:`, err.message);
// });


const { Worker } = require('bullmq');
const Redis = require('ioredis');
const { Op } = require('sequelize');
const moment = require('moment-timezone');
const Attendance    = require('../models/kehadiran');
const KehadiranGuru = require('../models/kehadiranGuru');

const connection = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });

const worker = new Worker(
  'attendance-queue',
  async job => {
    const data = job.data;
    const saveToGuruTable = data.targetTable === 'kehadiran_guru' || data.userRole === 'teacher';

    console.log(`[WORKER] Job: ${job.id} | type: ${data.jobType || 'checkin'} | target: ${data.targetTable}`);

    // ── CHECKOUT: update record check-in ─────────────────────────────────
    if (data.jobType === 'checkout') {
      const Model = saveToGuruTable ? KehadiranGuru : Attendance;
      const today = moment().tz('Asia/Jakarta').format('YYYY-MM-DD');

      const whereClause = {
        schoolId:   data.schoolId,
        checkOutAt: null,
        ...(saveToGuruTable
          ? { guruId: data.guruId }
          : { studentId: data.studentId }
        ),
        createdAt: {
          [Op.between]: [
            moment.tz(`${today} 00:00:00`, 'Asia/Jakarta').toDate(),
            moment.tz(`${today} 23:59:59`, 'Asia/Jakarta').toDate(),
          ]
        }
      };

      const record = await Model.findOne({ where: whereClause });

      if (!record) {
        console.warn(`[WORKER CHECKOUT] No check-in record found | jobId:${job.id}`);
        return; // bukan error, data check-in mungkin belum masuk — job selesai
      }

      await record.update({
        checkOutAt:     data.checkOutAt,
        checkOutLat:    data.latitude,
        checkOutLon:    data.longitude,
        checkOutMethod: data.method,
        updatedAt:      data.checkOutAt,
      });

      console.log(`[WORKER CHECKOUT OK] recordId:${record.id} | ${data.checkOutAt} | method:${data.method}`);
      return;
    }

    // ── CHECK-IN: create record baru (existing logic) ─────────────────────
    const originalTime = data.createdAt;

    if (saveToGuruTable) {
      await KehadiranGuru.create({
        schoolId:     data.schoolId,
        guruId:       data.guruId,
        userRole:     'teacher',
        status:       'Hadir',
        currentClass: data.currentClass || null,
        latitude:     data.latitude,
        longitude:    data.longitude,
        method:       data.method || null,
        createdAt:    originalTime,
        updatedAt:    originalTime
      });
    } else {
      await Attendance.create({
        studentId:    data.studentId,
        guruId:       null,
        userRole:     data.userRole,
        schoolId:     data.schoolId,
        currentClass: data.currentClass,
        status:       'Hadir',
        latitude:     data.latitude,
        longitude:    data.longitude,
        method:       data.method || null,
        createdAt:    originalTime,
        updatedAt:    originalTime
      });
    }
  },
  { connection, concurrency: 50 }
);

worker.on('completed', job => console.log(`[WORKER] Job ${job.id} completed`));
worker.on('failed', (job, err) => console.error(`[WORKER] Job ${job?.id} failed:`, err.message));