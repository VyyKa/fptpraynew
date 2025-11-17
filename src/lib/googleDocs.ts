import { google } from "googleapis";

type PrayerPayload = {
  email: string;
  wish: string;
};

const DOCS_SCOPE = ["https://www.googleapis.com/auth/documents"];

const requiredEnvVars = [
  "GOOGLE_DOC_ID",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
] as const;

function assertGoogleEnv() {
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      throw new Error(`Missing required env var: ${key}`);
    }
  }
}

export async function appendPrayerToDoc(payload: PrayerPayload) {
  assertGoogleEnv();

  const docId = process.env.GOOGLE_DOC_ID!;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const privateKey = process
    .env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")
    .trim();

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: DOCS_SCOPE,
  });
  const docs = google.docs({ version: "v1", auth });

  const timestamp = new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
    timeStyle: "medium",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date());

  const entry = [
    "🙏 Lời nguyện mới",
    `• Thời gian: ${timestamp}`,
    `• Email: ${payload.email}`,
    `• Mong ước: ${payload.wish}`,
    "".padEnd(40, "—"),
    "",
  ].join("\n");

  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [
        {
          insertText: {
            endOfSegmentLocation: {},
            text: entry,
          },
        },
      ],
    },
  });
}

