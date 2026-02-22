import admin from "firebase-admin";

/**
 * Generates 250 founder codes and writes them to Firestore collection: founder_codes
 * - 100 guide codes
 * - 100 vendor codes
 * - 50 host codes
 *
 * Each document ID IS the code (example: GUIDE-001)
 * Fields match what your claimFounderCode() function expects:
 *   roleBucket: "guide" | "vendor" | "host"
 *   status: "available"
 *   claimedBy: ""
 *   claimedAt: null
 *   createdAt: serverTimestamp
 */
async function main() {
  // 1) Connect to Firestore using your existing Admin config (same as the app uses)
  // If your project already initializes admin somewhere else, this is safe to run once here.
  if (admin.apps.length === 0) {
    admin.initializeApp();
  }

  const db = admin.firestore();

  // 2) Safety: don’t accidentally double-create codes if they already exist
  // We will check for one known code. If it exists, we stop.
  const existing = await db.collection("founder_codes").doc("GUIDE-001").get();
  if (existing.exists) {
    console.log(
      "STOP: GUIDE-001 already exists in founder_codes. I will not create duplicates."
    );
    process.exit(0);
  }

  // 3) Helper to format numbers like 001, 002, ... 100
  const pad3 = (n: number) => String(n).padStart(3, "0");

  // 4) Build all codes
  const docs: Array<{ id: string; roleBucket: "guide" | "vendor" | "host" }> = [];

  for (let i = 1; i <= 100; i++) docs.push({ id: `GUIDE-${pad3(i)}`, roleBucket: "guide" });
  for (let i = 1; i <= 100; i++) docs.push({ id: `VENDOR-${pad3(i)}`, roleBucket: "vendor" });
  for (let i = 1; i <= 50; i++) docs.push({ id: `HOST-${pad3(i)}`, roleBucket: "host" });

  // 5) Write in batches (Firestore limits batch size)
  const BATCH_SIZE = 400;
  let written = 0;

  while (written < docs.length) {
    const batch = db.batch();
    const slice = docs.slice(written, written + BATCH_SIZE);

    for (const d of slice) {
      const ref = db.collection("founder_codes").doc(d.id);
      batch.set(ref, {
        code: d.id,
        role: d.roleBucket, // optional, but matches what you started doing manually
        roleBucket: d.roleBucket, // THIS is what your code queries on
        status: "available", // THIS is what your code queries on
        claimedBy: "",
        claimedAt: null,
        claimed: false, // optional; your claim code uses status, but leaving this is fine
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
    written += slice.length;
    console.log(`Wrote ${written}/${docs.length} founder codes...`);
  }

  console.log("DONE: All founder codes created.");
  process.exit(0);
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
}); 