import admin from 'firebase-admin';

// Kiểm tra biến môi trường quan trọng
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.FIREBASE_PROJECT_ID;
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

if (!privateKey || !clientEmail || !projectId || !storageBucket) {
    throw new Error('❌ Missing Firebase configuration in .env file');
}

// Khởi tạo Firebase Admin SDK (Singleton pattern)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            // Fix lỗi xuống dòng (\n) khi đọc từ file .env
            privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
        storageBucket: storageBucket,
    });
    console.log('✅ Firebase Admin Initialized Successfully');
}

// Export cái bucket để dùng ở các Service khác
export const bucket = admin.storage().bucket();