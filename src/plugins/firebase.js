import { initializeApp } from "firebase/app"
import {
  getFirestore as fbGetFirestore,
  setDoc as fbSetDoc,
  doc as fbDoc,
  connectFirestoreEmulator as fbConnectFirestoreEmulator
} from "firebase/firestore"
import {
  getAuth as fbGetAuth,
  createUserWithEmailAndPassword as fbCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  connectAuthEmulator as fbConnectAuthEmulator
} from "firebase/auth"
import {
  getStorage as fbGetStorage,
  connectStorageEmulator as fbConnectStorageEmulator
} from "firebase/storage"
import {
  getFunctions as fbGetFunctions
} from "firebase/functions"
import {
  connectFunctionsEmulator as fbConnectFunctionsEmulator,
} from "firebase/functions"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// init firebase
export const firebaseApp = initializeApp(firebaseConfig)

export const db = fbGetFirestore(firebaseApp, import.meta.env.VITE_FB_DB_NAME)
export const auth = fbGetAuth()
export const storage = fbGetStorage()
export const functions = fbGetFunctions(firebaseApp, "europe-west3")

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = fbOnAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    }, reject)
  })
}

export const signUp = async (email, password, role, displayName) => {
  // register user
  const user = await fbCreateUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user
      return user
    })
    .catch((error) => {
      const errorCode = error.code
      const errorMessage = error.message
      console.error(errorCode, errorMessage)
    })

  // create firestore entry
  await fbSetDoc(fbDoc(db, 'users', user.uid), {
    email: user.email,
    displayName: displayName,
    createdTimestamp: new Date(),
    role: role,
    photoAvailable: false,
    photoURL: {
      x128: '',
      x512: '',
      x1024: ''
    },
  })
  return user
}

export const signIn = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user
      return user
    })
    .catch((error) => {
      const errorCode = error.code
      const errorMessage = error.message
      console.error(errorCode, errorMessage)
      return false
    })
}

export const signOut = async () => {
  await fbSignOut(auth)
    .catch((error) => {
      console.error(error.code, error.message)
      throw error
    })
}

if (import.meta.env.VITE_FB_USE_EMULATOR === 'true' && import.meta.env.MODE === 'development') {
  console.log('using firebase emulator')
  fbConnectAuthEmulator(auth, 'http://localhost:9099')
  fbConnectFirestoreEmulator(db, '127.0.0.1', 8080)
  fbConnectFunctionsEmulator(functions, '127.0.0.1', 5001)
  fbConnectStorageEmulator(storage, '127.0.0.1', 9199)
} else {
  console.log(`using firebase ${import.meta.env.MODE}`)
}
