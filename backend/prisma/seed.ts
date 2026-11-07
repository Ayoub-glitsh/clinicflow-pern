import { PrismaClient, UserRole, AppointmentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ─── Users ────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin123!', 10);
  const staffHash = await bcrypt.hash('Staff123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@clinicflow.com' },
    update: {},
    create: {
      email: 'admin@clinicflow.com',
      passwordHash: adminHash,
      role: UserRole.admin,
    },
  });

  const staff1 = await prisma.user.upsert({
    where: { email: 'staff1@clinicflow.com' },
    update: {},
    create: {
      email: 'staff1@clinicflow.com',
      passwordHash: staffHash,
      role: UserRole.staff,
    },
  });

  const staff2 = await prisma.user.upsert({
    where: { email: 'staff2@clinicflow.com' },
    update: {},
    create: {
      email: 'staff2@clinicflow.com',
      passwordHash: staffHash,
      role: UserRole.staff,
    },
  });

  console.log(`✅ Users seeded: ${admin.email}, ${staff1.email}, ${staff2.email}`);

  // ─── Patients ─────────────────────────────────────────────────────────────
  const patientsData = [
    {
      fullName: 'Youssef Ait Brahim',
      cin: 'BE123456',
      birthDate: new Date('1985-03-12'),
      phone: '+212661234567',
    },
    {
      fullName: 'Fatima Zahra El Fassi',
      cin: 'BK789012',
      birthDate: new Date('1992-07-24'),
      phone: '+212672345678',
    },
    {
      fullName: 'Mohammed Benali',
      cin: 'CD345678',
      birthDate: new Date('1978-11-05'),
      phone: '+212683456789',
    },
    {
      fullName: 'Khadija Ouali',
      cin: 'HH901234',
      birthDate: new Date('1995-01-30'),
      phone: '+212694567890',
    },
    {
      fullName: 'Rachid Tazi',
      cin: 'JA567890',
      birthDate: new Date('1969-09-18'),
      phone: '+212605678901',
    },
  ];

  const patients = await Promise.all(
    patientsData.map((p) =>
      prisma.patient.upsert({
        where: { cin: p.cin },
        update: {},
        create: p,
      })
    )
  );

  console.log(`✅ Patients seeded: ${patients.map((p) => p.cin).join(', ')}`);

  // ─── Appointments ─────────────────────────────────────────────────────────
  //
  // Distribution: 4 pending, 3 confirmed, 3 cancelled
  // Each patient gets at least 1 appointment.
  // Confirmed appointments per patient are spaced ≥ 1 hour apart
  // to satisfy the 30-minute conflict rule.
  //
  // Spread across different weeks to avoid any cross-patient conflict issues.
  //
  // Patient[0] – Youssef:     1 confirmed, 1 pending
  // Patient[1] – Fatima:      1 confirmed, 1 cancelled
  // Patient[2] – Mohammed:    1 confirmed, 1 pending
  // Patient[3] – Khadija:     1 cancelled, 1 pending
  // Patient[4] – Rachid:      1 cancelled, 1 pending
  //                             ─────────────────────
  //                             3 confirmed, 4 pending, 3 cancelled ✓

  const appointmentsData: {
    patientIndex: number;
    appointmentDate: Date;
    status: AppointmentStatus;
    notes: string | null;
    createdByEmail: string;
  }[] = [
    // ── Patient 0 (Youssef) ──
    {
      patientIndex: 0,
      appointmentDate: new Date('2024-06-10T09:00:00.000Z'),
      status: AppointmentStatus.confirmed,
      notes: 'Consultation de suivi',
      createdByEmail: staff1.email,
    },
    {
      patientIndex: 0,
      appointmentDate: new Date('2024-06-17T10:00:00.000Z'),
      status: AppointmentStatus.pending,
      notes: null,
      createdByEmail: staff1.email,
    },

    // ── Patient 1 (Fatima) ──
    {
      patientIndex: 1,
      appointmentDate: new Date('2024-06-11T08:30:00.000Z'),
      status: AppointmentStatus.confirmed,
      notes: 'Bilan sanguin',
      createdByEmail: staff2.email,
    },
    {
      patientIndex: 1,
      appointmentDate: new Date('2024-06-18T14:00:00.000Z'),
      status: AppointmentStatus.cancelled,
      notes: 'Annulé par le patient',
      createdByEmail: staff2.email,
    },

    // ── Patient 2 (Mohammed) ──
    {
      patientIndex: 2,
      appointmentDate: new Date('2024-06-12T11:00:00.000Z'),
      status: AppointmentStatus.confirmed,
      notes: 'Radiographie',
      createdByEmail: admin.email,
    },
    {
      patientIndex: 2,
      appointmentDate: new Date('2024-06-19T09:30:00.000Z'),
      status: AppointmentStatus.pending,
      notes: null,
      createdByEmail: staff1.email,
    },

    // ── Patient 3 (Khadija) ──
    {
      patientIndex: 3,
      appointmentDate: new Date('2024-06-13T15:00:00.000Z'),
      status: AppointmentStatus.cancelled,
      notes: 'Patient indisponible',
      createdByEmail: staff2.email,
    },
    {
      patientIndex: 3,
      appointmentDate: new Date('2024-06-20T10:00:00.000Z'),
      status: AppointmentStatus.pending,
      notes: null,
      createdByEmail: staff1.email,
    },

    // ── Patient 4 (Rachid) ──
    {
      patientIndex: 4,
      appointmentDate: new Date('2024-06-14T08:00:00.000Z'),
      status: AppointmentStatus.cancelled,
      notes: 'Reporté',
      createdByEmail: admin.email,
    },
    {
      patientIndex: 4,
      appointmentDate: new Date('2024-06-21T11:30:00.000Z'),
      status: AppointmentStatus.pending,
      notes: null,
      createdByEmail: staff2.email,
    },
  ];

  // Resolve createdBy user IDs
  const userByEmail: Record<string, string> = {
    [admin.email]: admin.id,
    [staff1.email]: staff1.id,
    [staff2.email]: staff2.id,
  };

  let upsertedCount = 0;

  for (const appt of appointmentsData) {
    const patientId = patients[appt.patientIndex].id;
    const createdById = userByEmail[appt.createdByEmail];

    // Idempotent find-or-create keyed on patientId + appointmentDate
    const existing = await prisma.appointment.findFirst({
      where: {
        patientId,
        appointmentDate: appt.appointmentDate,
      },
    });

    if (!existing) {
      await prisma.appointment.create({
        data: {
          patientId,
          appointmentDate: appt.appointmentDate,
          status: appt.status,
          notes: appt.notes,
          createdBy: createdById,
        },
      });
      upsertedCount++;
    }
  }

  console.log(`✅ Appointments seeded: ${upsertedCount} created (${appointmentsData.length - upsertedCount} already existed)`);
  console.log('🎉 Seed completed successfully.');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
