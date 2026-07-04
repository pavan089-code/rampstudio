# Firebase Setup and Security Rules

These examples are intentionally strict for the admin CRM.

## Firestore Rules

```txt
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null;
    }

    match /bookings/{bookingId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();

      match /notes/{noteId} {
        allow read, create, update, delete: if isAdmin();
      }

      match /notifications/{notificationId} {
        allow read, create, update, delete: if isAdmin();
      }
    }

    match /settings/{settingId} {
      allow read, write: if isAdmin();
    }
  }
}
```

## Authentication Rules

Create admin users manually in Firebase Console:

1. Open Firebase Console.
2. Go to Authentication > Sign-in method.
3. Enable Email/Password.
4. Go to Users and add approved admin accounts only.

For stricter production access, add Firebase Admin SDK custom claims in a trusted backend and update the `isAdmin()` function to check `request.auth.token.admin == true`.

## Deployment Steps

1. Create a Firebase project.
2. Register a Web App and copy the Firebase config into `.env.local`.
3. Enable Firestore Database in production mode.
4. Publish the Firestore rules above.
5. Enable Email/Password Authentication.
6. Create admin users.
7. Deploy the Next.js app with the same `NEXT_PUBLIC_FIREBASE_*` variables.

## Booking Confirmation Environment Variables

Server-side confirmation sending also requires:

```env
RESEND_API_KEY=YOUR_RESEND_API_KEY
FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
FIREBASE_CLIENT_EMAIL=YOUR_SERVICE_ACCOUNT_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
WHATSAPP_DELIVERY_PROVIDER=wa.me
WHATSAPP_ACCESS_TOKEN=YOUR_META_WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID=YOUR_META_PHONE_NUMBER_ID
```

Use `WHATSAPP_DELIVERY_PROVIDER=wa.me` for link-based delivery. Switch to
`meta` after wiring the Meta WhatsApp Business Cloud API call in
`src/lib/whatsapp.ts`.
