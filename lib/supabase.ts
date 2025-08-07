import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface KirimData {
  id: number
  korxona_nomi: string
  inn: string
  tel_raqami: string
  ismi: string
  xizmat_turi: string
  filial_nomi: string
  xodim: string
  oldingi_oylar_soni: number
  oldingi_oylar_summasi: number
  bir_oylik_hisoblangan_summa: number
  jami_qarz_dorlik: number
  tolandi_jami: number
  tolandi_naqd: number
  tolandi_prechisleniya: number
  tolandi_karta: number
  qoldiq: number
  last_updated: string
  created_at: string
}

export interface ChiqimData {
  id: number
  sana: string
  nomi: string
  filial_nomi: string
  chiqim_nomi: string
  avvalgi_oylardan: number
  bir_oylik_hisoblangan: number
  jami_hisoblangan: number
  tolangan: number
  qoldiq_qarz_dorlik: number
  qoldiq_avans: number
  created_at: string
}

export interface NotificationData {
  id: number
  title: string
  message: string
  date: string
  is_recurring: boolean
  frequency: "monthly" | "yearly" | "weekly"
  is_active: boolean
  created_at: string
}
