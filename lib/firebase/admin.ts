import * as admin from "firebase-admin";

function getAdminApp() {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    return admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
}

export function getAdminDb() {
    return getAdminApp().firestore();
}

export function getAdminAuth() {
    return getAdminApp().auth();
}

// For backward compat — lazy proxies
export const adminDb = new Proxy({} as admin.firestore.Firestore, {
    get(_target, prop) {
        return (getAdminApp().firestore() as never)[prop as keyof admin.firestore.Firestore];
    },
});

export const adminAuth = new Proxy({} as admin.auth.Auth, {
    get(_target, prop) {
        return (getAdminApp().auth() as never)[prop as keyof admin.auth.Auth];
    },
});

export default admin;
