const admin = require("firebase-admin");

async function main() {
  // Connect to Firestore using the default credentials in Firebase Studio/App Hosting
  if (admin.apps.length === 0) {
    admin.initializeApp();
  }

  const db = admin.firestore();
  const pad3 = (n) => String(n).padStart(3, "0");

  // Build the inventory: 100 guides, 100 vendors, 50 hosts
  const docs = [];
  for (let i = 1; i <= 100; i++) docs.push({ id: `GUIDE-${pad3(i)}`, roleBucket: "guide" });
  for (let i = 1; i <= 100; i++) docs.push({ id: `VENDOR-${pad3(i)}`, roleBucket: "vendor" });
  for (let i = 1; i <= 50; i++) docs.push({ id: `HOST-${pad3(i)}`, roleBucket: "host" });

  let created = 0;
  let skipped = 0;

  for (const d of docs) {
    const ref = db.collection("founder_codes").doc(d.id);

    // create() only succeeds if the doc doesn't already exist.
    // This prevents overwriting claimed codes like GUIDE-001.
    try {
      await ref.create({
        code: d.id,
        roleBucket: d.roleBucket,
        status: "available",
        claimedBy: "",
        claimedAt: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      created++;
    } catch (err) {
      skipped++;
    }
  }

  console.log(`DONE. Created: ${created}. Skipped (already existed): ${skipped}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});