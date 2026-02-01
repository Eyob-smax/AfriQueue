import { db } from "./index";
import { healthCenters, queues } from "./schema";

async function seed() {
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
      },
      {
        name: "Westlands Family Clinic",
        city: "Nairobi",
        address: "Westlands",
        latitude: "-1.2656",
        longitude: "36.8067",
        status: "OPEN",
      },
      {
        name: "Pangani Care Point",
        city: "Nairobi",
        address: "Pangani",
        latitude: "-1.2833",
        longitude: "36.8333",
        status: "OPEN",
      },
    ])
    .returning({ id: healthCenters.id });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (hc1?.id) {
    await db.insert(queues).values([
      { health_center_id: hc1.id, service_type: "General", queue_date: today },
      { health_center_id: hc1.id, service_type: "Consultation", queue_date: today },
    ]);
  }
  if (hc2?.id) {
    await db.insert(queues).values([
      { health_center_id: hc2.id, service_type: "General", queue_date: today },
    ]);
  }
  if (hc3?.id) {
    await db.insert(queues).values([
      { health_center_id: hc3.id, service_type: "General", queue_date: today },
    ]);
  }

  console.log("Seed complete: health centers and queues");
}

seed().catch(console.error);
