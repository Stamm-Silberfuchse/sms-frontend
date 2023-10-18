import { useAuthStore } from '@/store/auth'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

const getSession = async () => {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    toast.error(error.message)
    return null
  }
  return data
}

const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  })
  if(error) {
    if(error.message === "Email not confirmed") {
      toast.info("Bitte bestätige deine E-Mail-Adresse.")
    } else if (error.message === "Invalid login credentials") {
      toast.error("Falsche Zugangsdaten.")
    } else {
      toast.error(error.message)
    }
    return null
  }
  console.log(data)
  if(data.user?.user_metadata?.status !== "verified") {
    signOut()
    toast.info('Dein Account ist leider nicht freigegeben.\nBitte wende dich an die Admins.')
    return null
  }
  return data
}

const signUp = async (email, password, name) => {
  console.log(import.meta.env.VITE_SITE_URL)
  console.log(import.meta.env.VITE_SITE_URL + '/confirm-registration')
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      emailRedirectTo: import.meta.env.VITE_SITE_URL + '/confirm-registration',
      data: {
        full_name: name,
        status: "pending"
      },
    }
  })
  if (error) {
    console.error(error)
    toast.error(error.message)
    return null
  }
  return data
}

const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  const authStore = useAuthStore()
  authStore.$reset()
  if (error) {
    toast.error(error.message)
    return null
  }
  return true
}

const resetPW = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'localhost:3000/update-password',
  })
  if (error) {
    toast.error(error.message)
    return null
  } else {
    toast.success("E-Mail versandt! Bitte überprüfe deine E-Mails.");
  }
  return data
}


export { supabase, signUp, signIn, signOut, resetPW, getUser, getSession }
