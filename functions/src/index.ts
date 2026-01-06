import {initializeApp} from "firebase-admin/app";
import {FieldValue, getFirestore} from "firebase-admin/firestore";
import {auth, firestore} from "firebase-functions/v1";
import {onCall, HttpsError} from "firebase-functions/v2/https";

initializeApp();
const db = getFirestore();

/**
 * Normalizes a username by trimming whitespace and converting to lowercase.
 * Also validates the username format.
 *
 * @param {string} raw - The raw username string to normalize.
 * @return {object} An object containing the original and normalized username.
 * @throws {HttpsError} If the username is invalid.
 */
function normalizeUsername(raw: string) {
  const usernameOriginal = raw.trim();
  const usernameLower = usernameOriginal.toLowerCase();

  // 3-20 chars, a-z 0-9 underscore only (case-insensitive)
  if (!/^[a-z0-9_]{3,20}$/.test(usernameLower)) {
    throw new HttpsError(
      "invalid-argument",
      "Username must be 3-20 chars and only a-z, 0-9, underscore."
    );
  }

  return {usernameOriginal, usernameLower};
}

// Auth trigger: create initial profile + private user docs
export const onAuthUserCreate = auth.user().onCreate(async (user) => {
  const uid = user.uid;
  const email = user.email ?? "";
  const providerId = user.providerData?.[0]?.providerId ?? null;
  const now = Date.now();

  const profileRef = db.collection("profiles").doc(uid);
  const privateRef = db.collection("privateUsers").doc(uid);

  await Promise.all([
    profileRef.set(
      {
        displayName: user.displayName ?? "",
        username: null,
        bio: "",
        photoURL: user.photoURL ?? null,
        createdAt: now,
        lastLoginAt: now,
        submissionCount: 0,
      },
      {merge: true}
    ),
    privateRef.set(
      {
        email,
        providerId,
        lastLoginAt: now,
      },
      {merge: true}
    ),
  ]);
});

// Firestore trigger: keep profile submissionCount in sync
export const onSubmissionCreate = firestore
  .document("submissions/{id}")
  .onCreate(async (snapshot) => {
    const data = snapshot.data();
    const uid = data?.uid;
    if (!uid) return;
    await db.collection("profiles").doc(uid).set(
      {submissionCount: FieldValue.increment(1)},
      {merge: true}
    );
  });

export const onSubmissionDelete = firestore
  .document("submissions/{id}")
  .onDelete(async (snapshot) => {
    const data = snapshot.data();
    const uid = data?.uid;
    if (!uid) return;
    await db.collection("profiles").doc(uid).set(
      {submissionCount: FieldValue.increment(-1)},
      {merge: true}
    );
  });

// Callable (v2): claim username atomically
export const claimUsername = onCall<{username?: string}>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Login required.");

  const raw = String(request.data?.username ?? "");
  const {usernameOriginal, usernameLower} = normalizeUsername(raw);

  const usernameRef = db.collection("usernames").doc(usernameLower);
  const profileRef = db.collection("profiles").doc(uid);

  await db.runTransaction(async (tx) => {
    const existing = await tx.get(usernameRef);
    if (existing.exists) {
      throw new HttpsError("already-exists", "Username is taken.");
    }

    tx.set(usernameRef, {
      uid,
      usernameOriginal,
      createdAt: Date.now(),
    });

    tx.set(profileRef, {username: usernameOriginal}, {merge: true});
  });

  return {ok: true, username: usernameOriginal};
});

// Callable (v2): vote on submission (updates counters safely)
export const voteSubmission = onCall<{
  submissionId?: string;
  value?: number;
}>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Login required.");

  const submissionId = String(request.data?.submissionId ?? "");
  const value = Number(request.data?.value); // 1, -1, or 0

  if (!submissionId) {
    throw new HttpsError("invalid-argument", "Missing submissionId.");
  }
  if (![1, -1, 0].includes(value)) {
    throw new HttpsError("invalid-argument", "Vote value must be 1, -1, or 0.");
  }

  const subRef = db.collection("submissions").doc(submissionId);
  const voteRef = subRef.collection("votes").doc(uid);

  await db.runTransaction(async (tx) => {
    const [subSnap, voteSnap] = await Promise.all([
      tx.get(subRef),
      tx.get(voteRef),
    ]);
    if (!subSnap.exists) {
      throw new HttpsError("not-found", "Submission not found.");
    }

    const oldValue = voteSnap.exists ? voteSnap.data()?.value ?? 0 : 0;

    // no-op
    if (oldValue === value) return;

    let upDelta = 0;
    let downDelta = 0;
    let scoreDelta = 0;

    // remove old
    if (oldValue === 1) {
      upDelta -= 1;
      scoreDelta -= 1;
    }
    if (oldValue === -1) {
      downDelta -= 1;
      scoreDelta += 1;
    }

    // apply new
    if (value === 1) {
      upDelta += 1;
      scoreDelta += 1;
    }
    if (value === -1) {
      downDelta += 1;
      scoreDelta -= 1;
    }

    // IMPORTANT: Use FieldValue.increment to ensure atomicity and avoid race
    // conditions. Do NOT rely on reading `subSnap` values and adding to them
    // manually.
    tx.set(
      subRef,
      {
        voteUp: FieldValue.increment(upDelta),
        voteDown: FieldValue.increment(downDelta),
        voteScore: FieldValue.increment(scoreDelta),
      },
      {merge: true}
    );

    if (value === 0) {
      tx.delete(voteRef);
    } else {
      tx.set(
        voteRef,
        {
          value,
          updatedAt: Date.now(),
          createdAt: voteSnap.exists ?
            voteSnap.data()?.createdAt ?? Date.now() :
            Date.now(),
        },
        {merge: true}
      );
    }
  });

  return {ok: true};
});
