/** Load .env so DATABASE_URL is set when running via tsx (e.g. npm run db:seed) */
import "dotenv/config";
import { db } from "./index";
import {
  users,
  clientProfiles,
  staffProfiles,
  healthCenters,
  queues,
  reservations,
  notifications,
  conversations,
  conversationParticipants,
  messages,
} from "./schema";
import { hashAdminPassword } from "../lib/admin-session";

/** Default password for all seeded demo users (hash stored in DB). */
const SEED_DEMO_PASSWORD = "Password1!";

async function seed() {
  // --- Health centers (with description, services, specialties) ---
  const [hc1, hc2, hc3] = await db
    .insert(healthCenters)
    .values([
      {
        name: "City Central Health",
        city: "Nairobi",
        address: "CBD, Nairobi",
        latitude: "-1.2921",
        longitude: "36.8219",
        status: "OPEN",
        description: "Full-service hospital with emergency and outpatient care.",
        services: "General practice, Emergency, Lab, Pharmacy, X-Ray",
        specialties: ["General", "Emergency", "Pediatrics"],
        operating_status: "OPEN",
        queue_availability: true,
      },
      {
        name: "Westlands Family Clinic",
        city: "Nairobi",
        address: "Westlands",
        latitude: "-1.2656",
        longitude: "36.8067",
        status: "OPEN",
        description: "Family-focused clinic for routine and preventive care.",
        services: "Check-ups, Vaccinations, Minor procedures",
        specialties: ["Family Medicine", "Pediatrics", "Preventive"],
        operating_status: "OPEN",
        queue_availability: true,
      },
      {
        name: "Pangani Care Point",
        city: "Nairobi",
        address: "Pangani",
        latitude: "-1.2833",
        longitude: "36.8333",
        status: "OPEN",
        description: "Community health center serving Pangani and surrounding areas.",
        services: "General, Maternal, Chronic care",
        specialties: ["General", "Maternal Health", "Chronic Care"],
        operating_status: "OPEN",
        queue_availability: true,
      },
    ])
    .returning({ id: healthCenters.id });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // --- Queues ---
  const queueRows = await db
    .insert(queues)
    .values([
      { health_center_id: hc1?.id ?? null, service_type: "General", queue_date: today, status: "ACTIVE", max_capacity: 50 },
      { health_center_id: hc1?.id ?? null, service_type: "Consultation", queue_date: today, status: "ACTIVE", max_capacity: 30 },
      { health_center_id: hc2?.id ?? null, service_type: "General", queue_date: today, status: "ACTIVE", max_capacity: 40 },
      { health_center_id: hc3?.id ?? null, service_type: "General", queue_date: today, status: "ACTIVE", max_capacity: 25 },
    ])
    .returning({ id: queues.id });
  const [q1, q2, q3] = queueRows;

  // --- Users: clients and staff (password hashed and stored for demo) ---
  const seedPasswordHash = hashAdminPassword(SEED_DEMO_PASSWORD);
  const insertedUsers = await db
    .insert(users)
    .values([
      { full_name: "Alice Wanjiku", email: "alice.w@example.com", phone: "+254700111222", role: "CLIENT", status: "ACTIVE", city: "Nairobi", country: "Kenya", password_hash: seedPasswordHash },
      { full_name: "Bob Ochieng", email: "bob.o@example.com", phone: "+254700333444", role: "CLIENT", status: "ACTIVE", city: "Nairobi", country: "Kenya", password_hash: seedPasswordHash },
      { full_name: "Grace Muthoni", email: "grace.m@example.com", phone: "+254700555666", role: "CLIENT", status: "ACTIVE", city: "Nairobi", country: "Kenya", password_hash: seedPasswordHash },
      { full_name: "David Kamau", email: "david.k@example.com", phone: "+254700777888", role: "CLIENT", status: "ACTIVE", city: "Nairobi", country: "Kenya", password_hash: seedPasswordHash },
      { full_name: "Mary Njeri", email: "mary.n@example.com", phone: "+254700999000", role: "CLIENT", status: "ACTIVE", city: "Nairobi", country: "Kenya", password_hash: seedPasswordHash },
      { full_name: "Dr. James Otieno", email: "james.staff@example.com", phone: "+254711000111", role: "STAFF", status: "ACTIVE", city: "Nairobi", country: "Kenya", password_hash: seedPasswordHash },
      { full_name: "Nurse Sarah Wambui", email: "sarah.staff@example.com", phone: "+254711222333", role: "STAFF", status: "ACTIVE", city: "Nairobi", country: "Kenya", password_hash: seedPasswordHash },
    ])
    .returning({ id: users.id, role: users.role });

  const [client1, client2, client3, client4, client5, staff1, staff2] = insertedUsers;

  // --- Client profiles ---
  await db.insert(clientProfiles).values([
    { user_id: client1!.id, blood_type: "O+", health_condition: "Generally healthy" },
    { user_id: client2!.id, blood_type: "A+", emergency_contact: "+254722111222" },
    { user_id: client3!.id, chronic_illnesses: "Asthma (mild)" },
    { user_id: client4!.id, blood_type: "B+", health_history: "No significant history" },
    { user_id: client5!.id, any_disabilities: false },
  ]);

  // --- Staff profiles (linked to health centers) ---
  const approvedDate = new Date();
  await db.insert(staffProfiles).values([
    { user_id: staff1!.id, health_center_id: hc1?.id ?? null, role_in_center: "Doctor", department: "General", approved_date: approvedDate },
    { user_id: staff2!.id, health_center_id: hc2?.id ?? null, role_in_center: "Nurse", department: "Outpatient", approved_date: approvedDate },
  ]);

  // --- Reservations (clients in queues) ---
  if (q1?.id && q2?.id && q3?.id) {
    await db.insert(reservations).values([
      { queue_id: q1.id, client_id: client1!.id, queue_number: 1, status: "PENDING" },
      { queue_id: q1.id, client_id: client2!.id, queue_number: 2, status: "PENDING" },
      { queue_id: q1.id, client_id: client3!.id, queue_number: 3, status: "CONFIRMED" },
      { queue_id: q2.id, client_id: client4!.id, queue_number: 1, status: "PENDING" },
      { queue_id: q3.id, client_id: client5!.id, queue_number: 1, status: "PENDING" },
    ]);
  }

  // --- Notifications (sample for clients and staff) ---
  await db.insert(notifications).values([
    { user_id: client1!.id, type: "QUEUE_JOINED", reference_id: null, is_read: false },
    { user_id: client2!.id, type: "QUEUE_REMINDER", reference_id: null, is_read: true },
    { user_id: staff1!.id, type: "QUEUE_COMPLETED", reference_id: null, is_read: false },
  ]);

  // --- One direct conversation between staff and client with a message ---
  const [conv] = await db
    .insert(conversations)
    .values({ type: "DIRECT", is_active: true })
    .returning({ id: conversations.id });

  if (conv?.id) {
    await db.insert(conversationParticipants).values([
      { conversation_id: conv.id, user_id: staff1!.id },
      { conversation_id: conv.id, user_id: client1!.id },
    ]);
    const [msg] = await db
      .insert(messages)
      .values({
        conversation_id: conv.id,
        sender_id: client1!.id,
        content: "Hi, I'm in the queue for General today. What time should I expect to be seen?",
        content_type: "TEXT",
      })
      .returning({ id: messages.id });
    if (msg?.id) {
      await db.insert(notifications).values({
        user_id: staff1!.id,
        type: "CHAT_MESSAGE",
        reference_id: msg.id,
        is_read: false,
      });
    }
  }

  console.log("Seed complete: health centers, queues, users (5 clients, 2 staff) with hashed password, profiles, reservations, notifications, 1 conversation.");
  console.log("Demo user password (for Supabase Auth / testing):", SEED_DEMO_PASSWORD);
}

seed().catch(console.error);
