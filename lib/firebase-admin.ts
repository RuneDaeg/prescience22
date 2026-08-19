export async function getFirebaseDb() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase service account environment variables are missing.");
  }

  const [{ cert, getApps, initializeApp }, { getFirestore }] = await Promise.all([
    import("firebase-admin/app"),
    import("firebase-admin/firestore"),
  ]);
  const app = getApps()[0] ?? initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });

  return getFirestore(app);
}

function normalizePrivateKey(value: string | undefined) {
  if (!value) return value;

  let normalized = value.trim();
  const firstCharacter = normalized[0];
  const lastCharacter = normalized.at(-1);

  if (
    normalized.length >= 2 &&
    (firstCharacter === '"' || firstCharacter === "'") &&
    firstCharacter === lastCharacter
  ) {
    normalized = normalized.slice(1, -1);
  }

  return normalized.replace(/\\n/g, "\n").trim();
}
