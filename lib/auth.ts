/**
 * Better Auth: Neon + Drizzle. Identity lives in Better Auth tables (user, session, account, etc.).
 * On user create, databaseHooks sync the auth user into the app "users" table via syncAuthUserToAppUser.
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { phoneNumber } from "better-auth/plugins/phone-number";
import { jwt } from "better-auth/plugins/jwt";
import { db } from "@/drizzle";
import * as schema from "@/drizzle/schema";
import { syncAuthUserToAppUser } from "@/lib/sync-app-user";
import Twilio from "twilio";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

function getTwilioClient() {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return null;
  return Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

export const auth = betterAuth({
  basePath: "/api/auth",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      jwks: schema.jwks,
    },
  }),
  advanced: {
    database: {
      // Generate UUID for all models so "user" matches app "users" table and account/session/verification/jwks get non-null ids.
      generateId: () => crypto.randomUUID(),
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.BETTER_AUTH_GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Better Auth passes (createdUser, context) — first arg is the new user record.
        after: async (user) => {
          await syncAuthUserToAppUser({
            id: user.id,
            name: user.name,
            email: user.email,
            phoneNumber: (user as { phoneNumber?: string }).phoneNumber,
            image: user.image,
            role: (user as { role?: string }).role,
          });
        },
      },
    },
  },
  plugins: [
    phoneNumber({
      sendOTP: async ({ phoneNumber: to, code }) => {
        const client = getTwilioClient();
        const from = TWILIO_PHONE_NUMBER;
        if (!client || !from) {
          console.error("[auth] Twilio not configured; OTP not sent");
          return;
        }
        try {
          await client.messages.create({
            body: `Your Africare verification code is: ${code}`,
            from,
            to,
          });
        } catch (err) {
          console.error("[auth] Twilio send OTP error:", err);
        }
      },
      signUpOnVerification: {
        getTempEmail: (phoneNumber) =>
          `${phoneNumber.replace(/\D/g, "")}@phone.africare.local`,
        getTempName: (phoneNumber) => phoneNumber || "User",
      },
    }),
    jwt(),
    nextCookies(),
  ],
});

export type Auth = typeof auth;
