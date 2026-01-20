import { PrismaClient, UserRole, AttendanceStatus, AttendanceType, PaymentStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data (careful in production!)
  console.log("🗑️  Clearing existing data...");
  await prisma.attendance.deleteMany();
  await prisma.finance.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.classSubject.deleteMany();
  await prisma.classTeacher.deleteMany();
  await prisma.studentParent.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.agenda.deleteMany();
  await prisma.gallery.deleteMany();
  await prisma.information.deleteMany();
  await prisma.holiday.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create School
  console.log("🏫 Creating school...");
  const school = await prisma.school.create({
    data: {
      name: "SMA Negeri 1 Eduvate",
      npsn: "12345678",
      email: "admin@sma1eduvate.sch.id",
      phone: "021-12345678",
      address: "Jl. Pendidikan No. 1, Jakarta Selatan",
      status: "ACTIVE",
      quota: 500,
      activeUsers: 0,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    },
  });

  // 2. Create Admin User
  console.log("👤 Creating admin user...");
  const adminUser = await prisma.user.create({
    data: {
      name: "Admin Sekolah",
      email: "admin@eduvate.com",
      password: hashedPassword,
      role: UserRole.SCHOOL_ADMIN,
      nik: "3171234567890001",
      phone: "081234567890",
      schoolId: school.id,
    },
  });

  // 3. Create Teachers
  console.log("👨‍🏫 Creating teachers...");
  const teachersData = [
    { name: "Budi Santoso, S.Pd", email: "budi@school.com", nik: "3171234567890002", position: "Guru Matematika" },
    { name: "Siti Nurhaliza, S.Pd", email: "siti@school.com", nik: "3171234567890003", position: "Guru Bahasa Indonesia" },
    { name: "Ahmad Rizki, S.Pd", email: "ahmad@school.com", nik: "3171234567890004", position: "Guru Bahasa Inggris" },
    { name: "Dewi Lestari, S.Pd", email: "dewi@school.com", nik: "3171234567890005", position: "Guru Fisika" },
    { name: "Eko Prasetyo, S.Pd", email: "eko@school.com", nik: "3171234567890006", position: "Guru Kimia" },
  ];

  const teachers = [];
  for (const teacherData of teachersData) {
    const user = await prisma.user.create({
      data: {
        name: teacherData.name,
        email: teacherData.email,
        password: hashedPassword,
        role: UserRole.TEACHER,
        nik: teacherData.nik,
        schoolId: school.id,
      },
    });

    const teacher: any = await prisma.teacher.create({
      data: {
        userId: user.id,
        schoolId: school.id,
        employeeId: `T${String(teachers.length + 1).padStart(4, "0")}`,
        nip: `19${80 + teachers.length}010120230${teachers.length + 1}001`,
        position: teacherData.position,
      },
    });

    teachers.push(teacher);
  }

  // 4. Create Classes
  console.log("🎓 Creating classes...");
  const classes = [];
  for (let grade = 10; grade <= 12; grade++) {
    for (const section of ["A", "B"]) {
      const classData = await prisma.class.create({
        data: {
          name: `Kelas ${grade} ${section}`,
          grade: grade,
          section: section,
          academicYear: "2025/2026",
          capacity: 30,
          schoolId: school.id,
        },
      });
      classes.push(classData);
    }
  }

  // 5. Create Subjects
  console.log("📚 Creating subjects...");
  const subjectsData = [
    { name: "Matematika", code: "MAT" },
    { name: "Bahasa Indonesia", code: "BIND" },
    { name: "Bahasa Inggris", code: "BING" },
    { name: "Fisika", code: "FIS" },
    { name: "Kimia", code: "KIM" },
    { name: "Biologi", code: "BIO" },
    { name: "Sejarah", code: "SEJ" },
    { name: "Geografi", code: "GEO" },
  ];

  const subjects = [];
  for (const subjectData of subjectsData) {
    const subject = await prisma.subject.create({
      data: {
        name: subjectData.name,
        code: subjectData.code,
        schoolId: school.id,
      },
    });
    subjects.push(subject);
  }

  // 6. Assign Teachers to Classes (Homeroom)
  console.log("👥 Assigning homeroom teachers...");
  for (let i = 0; i < Math.min(classes.length, teachers.length); i++) {
    await prisma.classTeacher.create({
      data: {
        classId: classes[i]!.id,
        teacherId: teachers[i]!.id,
        isHomeroom: true,
      },
    });
  }

  // 7. Assign Subjects to Classes
  console.log("📖 Assigning subjects to classes...");
  for (const classData of classes) {
    for (const subject of subjects) {
      await prisma.classSubject.create({
        data: {
          classId: classData.id,
          subjectId: subject.id,
        },
      });
    }
  }

  // 8. Create Students
  console.log("🎒 Creating students...");
  const students = [];
  let studentCounter = 1;

  for (const classData of classes) {
    // Create 5 students per class (for faster seeding)
    for (let i = 1; i <= 5; i++) {
      const user = await prisma.user.create({
        data: {
          name: `Siswa ${studentCounter}`,
          email: `siswa${studentCounter}@school.com`,
          password: hashedPassword,
          role: UserRole.STUDENT,
          nik: `3271${String(234567890000 + studentCounter).padStart(12, "0")}`,
          schoolId: school.id,
        },
      });

      const student = await prisma.student.create({
        data: {
          userId: user.id,
          schoolId: school.id,
          studentId: `S${String(studentCounter).padStart(5, "0")}`,
          nis: `20250${String(studentCounter).padStart(3, "0")}`,
          nisn: `00${String(25000 + studentCounter).padStart(8, "0")}`,
          enrollmentYear: 2025,
          currentClassId: classData.id,
        },
      });

      students.push(student);
      studentCounter++;
    }
  }

  // 9. Create Parents
  console.log("👨‍👩‍👧‍👦 Creating parents...");
  for (let i = 0; i < Math.min(20, students.length); i++) {
    const user = await prisma.user.create({
      data: {
        name: `Orang Tua Siswa ${i + 1}`,
        email: `parent${i + 1}@school.com`,
        password: hashedPassword,
        role: UserRole.PARENT,
        nik: `3371${String(234567890000 + i + 1).padStart(12, "0")}`,
        phone: `081${String(200000000 + i).padStart(9, "0")}`,
        schoolId: school.id,
      },
    });

    const parent = await prisma.parent.create({
      data: {
        userId: user.id,
        schoolId: school.id,
        occupation: i % 2 === 0 ? "Wiraswasta" : "PNS",
      },
    });

    // Link parent to student
    await prisma.studentParent.create({
      data: {
        studentId: students[i]!.id,
        parentId: parent.id,
        relationship: i % 2 === 0 ? "Ayah" : "Ibu",
        isPrimary: true,
      },
    });
  }

  // 10. Create Attendance Records (10 days history with batch insert)
  console.log("✅ Creating attendance records (10 days)...");
  const today = new Date();
  const statuses = [
    AttendanceStatus.PRESENT,
    AttendanceStatus.PRESENT,
    AttendanceStatus.PRESENT,
    AttendanceStatus.PRESENT,
    AttendanceStatus.PRESENT,
    AttendanceStatus.LATE,
    AttendanceStatus.ABSENT,
    AttendanceStatus.SICK,
    AttendanceStatus.PERMISSION,
  ];

  // Generate attendance for last 10 days with bulk insert
  const attendanceRecords = [];
  for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Create attendance for all students (more realistic)
    for (const student of students) {
      // Random chance to have attendance (95% attendance rate)
      if (Math.random() < 0.95) {
        const status = statuses[Math.floor(Math.random() * statuses.length)]!;
        const checkInHour = status === AttendanceStatus.LATE ? 7 + Math.random() * 0.5 : 7;
        const checkInMinute = Math.floor(Math.random() * 60);
        const checkOutHour = 15;
        const checkOutMinute = Math.floor(Math.random() * 60);

        attendanceRecords.push({
          schoolId: school.id,
          studentId: student.id,
          classId: student.currentClassId!,
          teacherId: teachers[Math.floor(Math.random() * teachers.length)]!.id,
          date: new Date(date.setHours(0, 0, 0, 0)),
          status: status,
          type: dayOffset < 7 ? AttendanceType.MANUAL : [AttendanceType.MANUAL, AttendanceType.SCANNER][Math.floor(Math.random() * 2)]!,
          checkInTime: status === AttendanceStatus.PRESENT || status === AttendanceStatus.LATE
            ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(checkInHour), checkInMinute, 0)
            : null,
          checkOutTime: status === AttendanceStatus.PRESENT
            ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), checkOutHour, checkOutMinute, 0)
            : null,
          notes: status === AttendanceStatus.SICK ? "Sakit" : status === AttendanceStatus.PERMISSION ? "Izin keluarga" : null,
        });
      }
    }
  }

  // Bulk insert attendance records
  await prisma.attendance.createMany({ data: attendanceRecords });
  console.log(`✅ Created ${attendanceRecords.length} attendance records across 10 days!`);

  // 11. Create Exams
  console.log("📝 Creating exams...");
  const exam = await prisma.exam.create({
    data: {
      schoolId: school.id,
      title: "Ujian Tengah Semester Ganjil",
      description: "UTS Semester 1 Tahun Ajaran 2025/2026",
      type: "UTS",
      subjectId: subjects[0]!.id,
      classId: classes[0]!.id,
      teacherId: teachers[0]!.id,
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-02-15"),
      duration: 90,
    },
  });

  // 12. Create Exam Results
  console.log("📊 Creating exam results...");
  for (const student of students.slice(0, 10)) {
    await prisma.examResult.create({
      data: {
        examId: exam.id,
        studentId: student.id,
        score: 70 + Math.floor(Math.random() * 30),
        grade: ["A", "B", "B", "C"][Math.floor(Math.random() * 4)],
      },
    });
  }

  // 13. Create Finance Records
  console.log("💰 Creating finance records...");
  for (const student of students.slice(0, 20)) {
    await prisma.finance.create({
      data: {
        schoolId: school.id,
        studentId: student.id,
        type: "SPP",
        description: `SPP Bulan Januari 2026`,
        amount: 500000,
        paidAmount: Math.random() > 0.3 ? 500000 : 0,
        status: Math.random() > 0.3 ? PaymentStatus.PAID : PaymentStatus.UNPAID,
        dueDate: new Date("2026-01-10"),
        paidDate: Math.random() > 0.3 ? new Date("2026-01-05") : null,
      },
    });
  }

  // 14. Create Agenda
  console.log("📅 Creating agenda...");
  await prisma.agenda.create({
    data: {
      schoolId: school.id,
      title: "Rapat Orang Tua Siswa",
      description: "Rapat koordinasi dengan orang tua siswa",
      startDate: new Date("2026-02-15T09:00:00"),
      endDate: new Date("2026-02-15T12:00:00"),
      location: "Aula Sekolah",
    },
  });

  await prisma.agenda.create({
    data: {
      schoolId: school.id,
      title: "Ujian Akhir Semester",
      description: "Pelaksanaan UAS semester ganjil",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-06-15"),
      location: "Ruang Kelas",
    },
  });

  // 15. Create Information
  console.log("📢 Creating information...");
  await prisma.information.create({
    data: {
      schoolId: school.id,
      title: "Selamat Datang di Eduvate!",
      content: "Sistem manajemen sekolah modern telah aktif. Selamat menggunakan!",
      category: "Announcement",
      isPinned: true,
    },
  });

  // 16. Create Holidays
  console.log("🎉 Creating holidays...");
  const holidays = [
    { name: "Tahun Baru 2026", date: new Date("2026-01-01") },
    { name: "Isra Mi'raj", date: new Date("2026-02-06") },
    { name: "Hari Raya Nyepi", date: new Date("2026-03-22") },
    { name: "Wafat Isa Almasih", date: new Date("2026-04-10") },
    { name: "Hari Buruh", date: new Date("2026-05-01") },
    { name: "Kenaikan Isa Almasih", date: new Date("2026-05-21") },
  ];

  for (const holiday of holidays) {
    await prisma.holiday.create({
      data: {
        schoolId: school.id,
        name: holiday.name,
        date: holiday.date,
      },
    });
  }

  // 17. Create Gallery Items
  console.log("🖼️  Creating gallery items...");
  const galleryItems = [
    {
      title: "Upacara Bendera Senin",
      description: "Upacara bendera rutin setiap hari Senin",
      imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
      category: "Kegiatan Sekolah",
    },
    {
      title: "Lomba Olahraga Antar Kelas",
      description: "Kejuaraan basket antar kelas tingkat SMA",
      imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
      category: "Olahraga",
    },
    {
      title: "Wisuda Angkatan 2024",
      description: "Prosesi wisuda kelulusan angkatan 2024",
      imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800",
      category: "Acara",
    },
    {
      title: "Praktikum Kimia",
      description: "Kegiatan praktikum di laboratorium kimia",
      imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800",
      category: "Akademik",
    },
    {
      title: "Pentas Seni Tahunan",
      description: "Pertunjukan seni dan budaya siswa",
      imageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800",
      category: "Seni & Budaya",
    },
  ];

  for (const item of galleryItems) {
    await prisma.gallery.create({
      data: {
        schoolId: school.id,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        category: item.category,
      },
    });
  }

  // 18. Create Alumni (Graduated Students)
  console.log("🎓 Creating alumni...");
  const alumniData = [
    { name: "Ahmad Fauzi", email: "ahmad.fauzi@alumni.com", graduationYear: 2024, nis: "20220001", nisn: "0025000001" },
    { name: "Bella Safira", email: "bella.safira@alumni.com", graduationYear: 2024, nis: "20220002", nisn: "0025000002" },
    { name: "Citra Dewi", email: "citra.dewi@alumni.com", graduationYear: 2024, nis: "20220003", nisn: "0025000003" },
    { name: "Doni Pratama", email: "doni.pratama@alumni.com", graduationYear: 2023, nis: "20210001", nisn: "0024000001" },
    { name: "Eka Putri", email: "eka.putri@alumni.com", graduationYear: 2023, nis: "20210002", nisn: "0024000002" },
    { name: "Fajar Ramadan", email: "fajar.ramadan@alumni.com", graduationYear: 2023, nis: "20210003", nisn: "0024000003" },
    { name: "Gita Permata", email: "gita.permata@alumni.com", graduationYear: 2022, nis: "20200001", nisn: "0023000001" },
    { name: "Hendra Kusuma", email: "hendra.kusuma@alumni.com", graduationYear: 2022, nis: "20200002", nisn: "0023000002" },
    { name: "Indah Lestari", email: "indah.lestari@alumni.com", graduationYear: 2022, nis: "20200003", nisn: "0023000003" },
    { name: "Joko Widodo", email: "joko.widodo@alumni.com", graduationYear: 2021, nis: "20190001", nisn: "0022000001" },
  ];

  let alumniCount = 0;
  for (const alumniInfo of alumniData) {
    const user = await prisma.user.create({
      data: {
        name: alumniInfo.name,
        email: alumniInfo.email,
        password: hashedPassword,
        role: UserRole.STUDENT,
        nik: `3571${String(234567890000 + alumniCount + 1000).padStart(12, "0")}`,
        phone: `082${String(100000000 + alumniCount).padStart(9, "0")}`,
        address: `Jl. Alumni No. ${alumniCount + 1}, Jakarta`,
        schoolId: school.id,
      },
    });

    await prisma.student.create({
      data: {
        userId: user.id,
        schoolId: school.id,
        studentId: `A${String(alumniCount + 1).padStart(5, "0")}`,
        nis: alumniInfo.nis,
        nisn: alumniInfo.nisn,
        enrollmentYear: alumniInfo.graduationYear - 3,
        graduationYear: alumniInfo.graduationYear,
        isAlumni: true,
        currentClassId: null, // No current class for alumni
      },
    });

    alumniCount++;
  }

  console.log("✅ Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - 1 School created`);
  console.log(`   - 1 Admin user`);
  console.log(`   - ${teachers.length} Teachers`);
  console.log(`   - ${students.length} Students`);
  console.log(`   - ${alumniCount} Alumni`);
  console.log(`   - ${classes.length} Classes`);
  console.log(`   - ${subjects.length} Subjects`);
  console.log(`   - 30 Attendance records`);
  console.log(`   - 10 Exam results`);
  console.log(`   - 20 Finance records`);
  console.log(`   - 2 Agenda items`);
  console.log(`   - 6 Holidays`);
  console.log(`   - 5 Gallery items`);
  console.log("\n🔑 Login credentials:");
  console.log("   Email: admin@eduvate.com");
  console.log("   Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
