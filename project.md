# ArifQueue — Smart Healthcare for Africa

## Project overview

**Product name:** ArifQueue (branded as *Smart Healthcare for Africa* on the landing experience).

**One-liner:** Digital queue management and healthcare tools that help patients skip long waits and help clinics run more smoothly.

**Target audience:** Patients and health facilities across multiple African countries: Ethiopia, Kenya, Nigeria, Ghana, South Africa, Tanzania, and Uganda.

**Core value:** *Skip the Queue, Get Care Faster.* The platform reduces waiting time (e.g. average wait saved), gives real-time queue visibility so patients know when it’s their turn, and offers pre-visit symptom guidance so people can make better decisions before arriving at a clinic.

---

## Who uses the app

| Role | Responsibility |
|------|-----------------|
| **Patients (Clients)** | Find clinics, join queues, get AI symptom guidance, manage appointments and messages. |
| **Clinic staff (Staff)** | Run live queues, advance or cancel reservations, view clinic insights, and message patients. |
| **Platform administrators (Admin)** | Approve clinics and staff, manage health centers and user accounts, view reports and audit trail. |

---

## Features by role

### Patients (Clients)

- **Registration and profile**  
  Sign up with email, phone (one-time code), or Google. Choose country and city during registration. Optionally complete a health profile (current condition, history, blood type, emergency contact) so the app can give better clinic recommendations.

- **Discover clinics**  
  See clinics near you on a map. Filter by nearest, shortest estimated wait, or specialty. View each clinic’s details, services, and operating status before deciding where to go.

- **Join and track queues**  
  Join a clinic’s queue and receive a queue number. See live updates when your turn is called or when the queue advances—no need to refresh the page.

- **AI symptom checker**  
  Pre-visit symptom chat that gives guidance and can suggest when it’s a good idea to see a clinic. This is for triage and education only, not a diagnosis.

- **Appointments and history**  
  Dedicated areas for “My Appointments” and visit history, ready to show your queue reservations and past visits as you use the app.

- **Messages**  
  In-app messaging (conversations) with the clinic or support.

- **Notifications**  
  Alerts when you join a queue and when your visit is completed, with real-time delivery so you stay informed.

---

### Clinic staff (Staff)

- **Live queue board**  
  View today’s queues for your health center. See the list of patients with queue number and status. Mark patients as “seen” (advance) or cancel reservations.

- **Queue setup**  
  Create queues (e.g. by service type and date) and update their status so patients see accurate availability.

- **Clinic insights**  
  Average wait time (with trend), patients seen today (with trend), and peak traffic hours to help plan capacity and staffing.

- **Contact patients**  
  Start or open a chat with a patient directly from the queue.

- **Settings**  
  Manage your link to your health center where applicable.

- **Schedule**  
  Placeholder for future shift and schedule management.

---

### Administrators (Admin)

- **Dashboard overview**  
  Key counts at a glance: pending staff registrations, health centers, staff, clients, active reservations, and queues—with quick links to take action.

- **Staff and clinic onboarding**  
  Review staff registration requests (including clinic details). Approve or reject with an email notification to the applicant. On approval, the health center can be created so the clinic is ready to use.

- **Health center management**  
  Add new centers (name, location, address, services, specialties, operating status). Block or unblock centers; blocked centers are hidden from patients.

- **User management**  
  List and manage staff accounts (activate, deactivate, block) and view clients.

- **Reports**  
  Queue status by health center (e.g. service, date, status, reservation count) for oversight.

- **Audit log**  
  Record of admin actions (approvals, rejections, block/unblock, create center, etc.) for accountability.

- **Chat**  
  Internal and support messaging using the same conversation system as clients.

---

## What makes the app useful

**For patients**  
Less time spent in physical queues; transparency (see your position and wait); better clinic discovery by location and estimated wait; pre-visit symptom guidance; one place for appointments, messages, and notifications.

**For clinics**  
A clear, live queue; fewer no-shows and smoother flow; simple metrics (wait times, volume, peak hours); direct messaging with patients.

**For the platform**  
Controlled growth through approved staff and centers; a full audit trail; regional focus (countries and cities) and optional admin regions (North, South, East, West, Central Africa) for scaling.

---

## Geography and localization

**Supported countries:** Ethiopia, Kenya, Nigeria, Ghana, South Africa, Tanzania, Uganda.

**Cities (examples per country):**  
Ethiopia (Addis Ababa, Dire Dawa, Mekelle); Kenya (Nairobi, Mombasa, Kisumu, Nakuru); Nigeria (Lagos, Abuja, Kano, Ibadan); Ghana (Accra, Kumasi, Tamale); South Africa (Johannesburg, Cape Town, Durban); Tanzania (Dar es Salaam, Dodoma, Mwanza); Uganda (Kampala, Entebbe, Gulu).

Registration uses country-specific phone codes so “clinics near you” and the map are accurate for the user’s chosen city.

---

## How it works

1. **Patient:** Registers, completes location (and optionally health profile), discovers clinics, joins a queue, and receives real-time updates and notifications.
2. **Staff:** Manage the queue and advance or cancel patients; create and update queues; view insights and message patients.
3. **Admins:** Approve new clinics and staff, manage the network of centers and users, and monitor activity through reports and the audit log.

Queue and notification updates are delivered in real time so patients and staff see changes without refreshing the page.

---

*For setup and deployment, see the README in this repository.*
