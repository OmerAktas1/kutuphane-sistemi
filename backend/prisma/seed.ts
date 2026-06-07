import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('1453.1071', 10);

  await prisma.member.upsert({
    where: { email: 'admin@kutuphane.com' },
    update: {},
    create: {
      memberNo: 'kutuphaneadmin',
      firstName: 'Kutuphane',
      lastName: 'Admin',
      email: 'admin@kutuphane.com',
      password: hashedPassword,
      phone: '555-000-0000',
      status: 'ACTIVE',
      maxBorrowLimit: 100,
      membershipExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 10)),
    },
  });
  console.log('Created admin user: admin@kutuphane.com (username: kutuphaneadmin)');

  // Create sample classes
  const classNames = ['9A', '9B', '10A', '10B', '11A', '11B', '12A', '12B'];
  const createdClasses = await Promise.all(
    classNames.map((name) =>
      prisma.class.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );
  console.log('Created classes:', createdClasses.length);

  // Create sample students
  const studentsData = [
    { firstName: 'Ahmet', lastName: 'Yilmaz', studentNumber: '1001', className: '9A' },
    { firstName: 'Ayse', lastName: 'Demir', studentNumber: '1002', className: '9A' },
    { firstName: 'Mehmet', lastName: 'Kaya', studentNumber: '1003', className: '9B' },
    { firstName: 'Fatma', lastName: 'Celik', studentNumber: '1004', className: '10A' },
    { firstName: 'Ali', lastName: 'Ozturk', studentNumber: '1005', className: '10A' },
    { firstName: 'Zeynep', lastName: 'Aydin', studentNumber: '1006', className: '10B' },
    { firstName: 'Mustafa', lastName: 'Koc', studentNumber: '1007', className: '11A' },
    { firstName: 'Elif', lastName: 'Tekin', studentNumber: '1008', className: '11A' },
    { firstName: 'Huseyin', lastName: 'Arslan', studentNumber: '1009', className: '11B' },
    { firstName: 'Selin', lastName: 'Bulut', studentNumber: '1010', className: '12A' },
  ];

  for (const student of studentsData) {
    const classRecord = createdClasses.find((c) => c.name === student.className);
    if (classRecord) {
      await prisma.student.upsert({
        where: { studentNumber: student.studentNumber },
        update: {},
        create: {
          firstName: student.firstName,
          lastName: student.lastName,
          studentNumber: student.studentNumber,
          classId: classRecord.id,
        },
      });
    }
  }
  console.log('Created students:', studentsData.length);

  // Create sample books
  const booksData = [
    { title: 'Savas ve Baris', location: 'A-101' },
    { title: 'Anna Karenina', location: 'A-102' },
    { title: 'Suc ve Ceza', location: 'A-103' },
    { title: '1984', location: 'B-201' },
    { title: 'Hayvan Ciftligi', location: 'B-202' },
    { title: 'Kurk Mantolu Madonna', location: 'B-203' },
    { title: 'Istanbul Hatirasi', location: 'C-301' },
    { title: 'Kara Kitap', location: 'C-302' },
    { title: 'Benim Adim Kirmizi', location: 'C-303' },
    { title: 'Yuzyillik Yalnizlik', location: 'D-401' },
  ];

  for (const book of booksData) {
    await prisma.book.create({
      data: {
        title: book.title,
        location: book.location,
        status: 'AVAILABLE',
      },
    });
  }
  console.log('Created books:', booksData.length);

  // Create system settings
  const existingSetting = await prisma.systemSetting.findFirst({ where: { key: 'LIBRARY_NAME' } });
  if (!existingSetting) {
    await prisma.systemSetting.createMany({
      data: [
        { key: 'BORROW_DAYS', value: '15', group: 'BORROWING', description: 'Odunc alma suresi (gun)' },
        { key: 'LIBRARY_NAME', value: 'Kutuphane Takip Sistemi', group: 'GENERAL', description: 'Kutuphane adi' },
      ],
    });
  }
  console.log('Created system settings');

  console.log('Database seeding completed!');
  console.log('Admin credentials:');
  console.log('  Username: kutuphaneadmin');
  console.log('  Password: 1453.1071');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
