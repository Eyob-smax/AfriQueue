import { createAuthClient } from "better-auth/react";
import { phoneNumberClient } from "better-auth/client/plugins";
import { jwtClient } from "better-auth/client/plugins";

const client = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : undefined,
  basePath: "/api/auth",
  plugins: [phoneNumberClient(), jwtClient()],
});

/** Client type extended with phone number plugin (sendOtp, verify). */
type PhoneNumberPlugin = {
  phoneNumber: {
    sendOtp: (args: {
      phoneNumber: string;
    }) => Promise<{ error?: { message?: string } }>;
    verify: (args: {
      phoneNumber: string;
      code: string;
    }) => Promise<{ data?: unknown; error?: { message?: string } }>;
  };
};

type JwtPlugin = {
  token: () => Promise<{ data?: { token?: string }; error?: unknown }>;
};

export const authClient = client as typeof client &
  PhoneNumberPlugin &
  JwtPlugin;
