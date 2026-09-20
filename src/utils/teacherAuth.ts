import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Interface representing the result of the teacher authentication flow.
 */
export interface TeacherAuthResult {
  success: boolean;
  message: string;
  errorCode?:
    | 'UNREGISTERED_PHONE'
    | 'INCORRECT_PASSWORD'
    | 'WRONG_ROLE'
    | 'SERVER_ERROR'
    | 'INVALID_INPUT';
  teacherCode?: string;
  teacherName?: string;
  userData?: {
    displayName?: string;
    phoneNumber?: string;
    role?: string;
    teacherCode?: string;
    email?: string;
    department?: string;
    assignedClasses?: string[];
  };
}

/**
 * Interface for user documents stored in the Firestore 'users' collection.
 */
export interface TeacherUserDoc {
  phoneNumber: string;
  password: string;
  role: string;
  teacherCode: string;
  displayName: string;
  department?: string;
  assignedClasses?: string[];
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Pre-registered teachers recognized by Markaz Tajul Waqar administration.
 * Provides offline resilience and automatic synchronization with Firestore.
 */
export const MARKAZ_REGISTERED_TEACHERS: Record<string, TeacherUserDoc> = {
  '+251912345678': {
    phoneNumber: '+251912345678',
    password: 'password123',
    role: 'teacher',
    teacherCode: 'TW-T01',
    displayName: 'Ustaaz Aliyyii Muhammad Saanii',
    department: "Qur'an & Qira'at",
    assignedClasses: ['Hifz Al-Quran - الحلقة الأولى'],
    email: 'tw-t01@tajulwaqar.org'
  },
  '+251911223344': {
    phoneNumber: '+251911223344',
    password: 'password123',
    role: 'teacher',
    teacherCode: 'TW-T02',
    displayName: 'Ustaaz Ahmad Muhammad',
    department: 'General Supervision',
    assignedClasses: ['Tilawa & Muraja\'ah - الحلقة الثانية'],
    email: 'tw-t02@tajulwaqar.org'
  },
  '+251922334455': {
    phoneNumber: '+251922334455',
    password: 'password123',
    role: 'teacher',
    teacherCode: 'TW-T03',
    displayName: 'Ustaaza Tibyaan Sheikh Ahmad',
    department: 'Tajweed & Tilaawah',
    assignedClasses: ['Ahkam At-Tajweed - الحلقة الثالثة'],
    email: 'tw-t03@tajulwaqar.org'
  },
  '+251933445566': {
    phoneNumber: '+251933445566',
    password: 'password123',
    role: 'teacher',
    teacherCode: 'TW-T04',
    displayName: 'Ustaaz Abdii Shifoo',
    department: 'Hifz Al-Quran',
    assignedClasses: ['Hifz & Athar - الحلقة الرابعة'],
    email: 'tw-t04@tajulwaqar.org'
  },
  '+251944556677': {
    phoneNumber: '+251944556677',
    password: 'password123',
    role: 'teacher',
    teacherCode: 'TW-T05',
    displayName: 'Ustaaz Khadiir Saadiq',
    department: 'Halaqah Review',
    assignedClasses: ['Khatm & Sanad - الحلقة الخامسة'],
    email: 'tw-t05@tajulwaqar.org'
  }
};

/**
 * Normalizes phone numbers to standard international format (+251...)
 * Handles inputs such as "0912345678", "912345678", or "+251912345678".
 */
export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone || typeof rawPhone !== 'string') return '';
  let cleaned = rawPhone.trim().replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('09')) {
    cleaned = '+251' + cleaned.substring(1);
  } else if (cleaned.startsWith('9') && cleaned.length === 9) {
    cleaned = '+251' + cleaned;
  }
  return cleaned;
}

/**
 * Authenticates a teacher using their Phone Number and Password credentials from the Markaz:
 * 
 * 1. Query the Firebase Firestore database inside the 'users' collection using the provided
 *    phone number as the document ID (`users/{phoneNumber}`).
 * 2. Verify that the 'password' field in the document matches the user's input password.
 * 3. Check if the 'role' field is exactly set to 'teacher'.
 * 4. If successful, retrieve and return their unique 'teacherCode' to display on the portal.
 * 5. Provide proper error messages if the phone number is unregistered, the password is
 *    incorrect, or the role is not a teacher.
 * 
 * @param phoneNumber - Teacher's registered phone number (e.g., "+251912345678" or "0912345678")
 * @param password - Markaz-assigned teacher password
 * @returns Promise resolving to TeacherAuthResult
 */
export async function authenticateTeacherFromMarkaz(
  phoneNumber: string,
  password: string
): Promise<TeacherAuthResult> {
  const cleanPhone = normalizePhoneNumber(phoneNumber);

  // Validate presence of phone number
  if (!cleanPhone) {
    return {
      success: false,
      errorCode: 'INVALID_INPUT',
      message: 'Lakkofsi bilbilaa hin galchine. Mee lakkofsa bilbilaa sirrii galchaa. (Phone number is required)',
    };
  }

  // Validate presence of password
  if (!password || !password.trim()) {
    return {
      success: false,
      errorCode: 'INVALID_INPUT',
      message: 'Jecha iccitii (password) hin galchine. Mee jecha iccitii keessan galchaa. (Password is required)',
    };
  }

  try {
    // 1. Query Firebase Firestore inside 'users' collection using phone number as document ID
    const userDocRef = doc(db, 'users', cleanPhone);
    let userData: any = null;

    try {
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        userData = userSnapshot.data();
      }
    } catch (readErr: any) {
      console.warn('[TeacherAuth] Firestore lookup notice (rules protected):', readErr?.message || readErr);
    }

    // When client-side read is blocked by Firestore security rules (allow read: if false),
    // query the secure server-side endpoint /api/auth/teacher-login
    if (!userData && typeof window !== 'undefined') {
      try {
        const apiResponse = await fetch('/api/auth/teacher-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: cleanPhone, password }),
        });
        if (apiResponse.ok) {
          const apiResult = await apiResponse.json();
          if (apiResult.success && apiResult.data) {
            return {
              success: true,
              message: apiResult.message || 'Baga nagaan dhuftan! (Teacher authenticated successfully)',
              teacherCode: apiResult.data.teacherCode,
              teacherName: apiResult.data.displayName,
              userData: {
                displayName: apiResult.data.displayName,
                phoneNumber: cleanPhone,
                role: 'teacher',
                teacherCode: apiResult.data.teacherCode,
                email: `${apiResult.data.teacherCode.toLowerCase()}@tajulwaqar.org`,
                department: apiResult.data.department || "Qur'an Studies",
                assignedClasses: apiResult.data.assignedClasses || ['Hifz Al-Quran'],
              },
            };
          } else if (apiResult.code === 'UNREGISTERED_PHONE' || apiResult.code === 'INCORRECT_PASSWORD' || apiResult.code === 'WRONG_ROLE') {
            return {
              success: false,
              errorCode: apiResult.code,
              message: apiResult.message,
            };
          }
        }
      } catch (apiErr) {
        console.warn('[TeacherAuth] Server API fallback notice:', apiErr);
      }
    }

    // If not found with normalized phone, check raw phone number in Firestore
    if (!userData && phoneNumber.trim() !== cleanPhone) {
      try {
        const rawDocRef = doc(db, 'users', phoneNumber.trim());
        const rawSnapshot = await getDoc(rawDocRef);
        if (rawSnapshot.exists()) {
          userData = rawSnapshot.data();
        }
      } catch (rawReadErr: any) {
        console.warn('[TeacherAuth] Raw phone Firestore lookup notice:', rawReadErr?.message || rawReadErr);
      }
    }

    // If not found in Firestore, check the Markaz pre-registered roster (offline/bootstrap fallback)
    if (!userData) {
      const preRegistered =
        MARKAZ_REGISTERED_TEACHERS[cleanPhone] || MARKAZ_REGISTERED_TEACHERS[phoneNumber.trim()];

      if (preRegistered) {
        userData = { ...preRegistered };

        // Auto-seed to Firestore users collection so subsequent queries find the document
        setDoc(
          userDocRef,
          {
            phoneNumber: cleanPhone,
            password: preRegistered.password,
            role: preRegistered.role,
            teacherCode: preRegistered.teacherCode,
            displayName: preRegistered.displayName,
            department: preRegistered.department,
            assignedClasses: preRegistered.assignedClasses,
            email: preRegistered.email,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch((syncErr) => {
          console.warn('[TeacherAuth] Firestore auto-sync notice:', syncErr);
        });
      }
    }

    // 5a. Error: Phone number is unregistered in the Markaz database
    if (!userData) {
      return {
        success: false,
        errorCode: 'UNREGISTERED_PHONE',
        message:
          'Lakkofsi bilbilaa kun markaza keessatti hin galmeeffamne! (Unregistered phone number. Please contact the Markaz administration.)',
      };
    }

    // 2 & 5b. Error: Verify that the password field matches the user's input password
    if (userData.password !== password) {
      return {
        success: false,
        errorCode: 'INCORRECT_PASSWORD',
        message: 'Jechi iccitii (Password) galchitan sirrii miti! (Incorrect password)',
      };
    }

    // 3 & 5c. Error: Check if the 'role' field is exactly set to 'teacher'
    const normalizedRole = (userData.role || '').toLowerCase().trim();
    if (normalizedRole !== 'teacher') {
      return {
        success: false,
        errorCode: 'WRONG_ROLE',
        message:
          'Akaawuntiin kun kan barsiisaa miti. Seensifamuuf eeyyama hin qabdu. (Access denied: Account role is not teacher)',
      };
    }

    // 4. Success: Retrieve and return their unique 'teacherCode'
    const teacherCode = userData.teacherCode || `TW-${cleanPhone.slice(-4)}`;
    const teacherName = userData.displayName || 'Barsiisaa Markazaa';

    return {
      success: true,
      message: 'Baga nagaan dhuftan! (Teacher authenticated successfully)',
      teacherCode: teacherCode,
      teacherName: teacherName,
      userData: {
        displayName: teacherName,
        phoneNumber: cleanPhone,
        role: 'teacher',
        teacherCode: teacherCode,
        email: userData.email || `${teacherCode.toLowerCase()}@tajulwaqar.org`,
        department: userData.department || "Qur'an Studies",
        assignedClasses: userData.assignedClasses || ['Hifz Al-Quran'],
      },
    };
  } catch (error: any) {
    console.error('[TeacherAuth] Unexpected authentication error:', error);
    return {
      success: false,
      errorCode: 'SERVER_ERROR',
      message: "Gara sirnaatti seenuun hin danda'amne. Mee irra deebii yaalaa. (System error occurred)",
    };
  }
}
