import { supabase } from "./supabase"

// Kirim Data Functions
export async function getKirimData() {
  const { data, error } = await supabase.from("kirim_data").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching kirim data:", error)
    return []
  }

  return data.map((item) => ({
    id: item.id,
    korxonaNomi: item.korxona_nomi,
    inn: item.inn,
    telRaqami: item.tel_raqami,
    ismi: item.ismi,
    xizmatTuri: item.xizmat_turi,
    filialNomi: item.filial_nomi,
    xodim: item.xodim,
    oldingiOylardan: {
      oylarSoni: item.oldingi_oylar_soni,
      summasi: item.oldingi_oylar_summasi,
    },
    birOylikHisoblanganSumma: item.bir_oylik_hisoblangan_summa,
    jamiQarzDorlik: item.jami_qarz_dorlik,
    tolandi: {
      jami: item.tolandi_jami,
      naqd: item.tolandi_naqd,
      prechisleniya: item.tolandi_prechisleniya,
      karta: item.tolandi_karta,
    },
    qoldiq: item.qoldiq,
    qoldiq_avans: item.qoldiq_avans, // NEW FIELD
    lastUpdated: item.last_updated,
  }))
}

export async function addKirimData(data: any) {
  const { data: result, error } = await supabase
    .from("kirim_data")
    .insert({
      korxona_nomi: data.korxonaNomi,
      inn: data.inn,
      tel_raqami: data.telRaqami,
      ismi: data.ismi,
      xizmat_turi: data.xizmatTuri,
      filial_nomi: data.filialNomi,
      xodim: data.xodim,
      oldingi_oylar_soni: data.oldingiOylardan.oylarSoni,
      oldingi_oylar_summasi: data.oldingiOylardan.summasi,
      bir_oylik_hisoblangan_summa: data.birOylikHisoblanganSumma,
      jami_qarz_dorlik: data.jamiQarzDorlik,
      tolandi_jami: data.tolandi.jami,
      tolandi_naqd: data.tolandi.naqd,
      tolandi_prechisleniya: data.tolandi.prechisleniya,
      tolandi_karta: data.tolandi.karta,
      qoldiq: data.qoldiq,
      qoldiq_avans: data.qoldiq_avans, // NEW FIELD
    })
    .select()

  if (error) {
    console.error("Error adding kirim data:", error)
    throw error
  }

  return result
}

export async function updateKirimData(id: number, data: any) {
  const { data: result, error } = await supabase
    .from("kirim_data")
    .update({
      korxona_nomi: data.korxonaNomi,
      inn: data.inn,
      tel_raqami: data.telRaqami,
      ismi: data.ismi,
      xizmat_turi: data.xizmatTuri,
      filial_nomi: data.filialNomi,
      xodim: data.xodim,
      oldingi_oylar_soni: data.oldingiOylardan.oylarSoni,
      oldingi_oylar_summasi: data.oldingiOylardan.summasi,
      bir_oylik_hisoblangan_summa: data.birOylikHisoblanganSumma,
      jami_qarz_dorlik: data.jamiQarzDorlik,
      tolandi_jami: data.tolandi.jami,
      tolandi_naqd: data.tolandi.naqd,
      tolandi_prechisleniya: data.tolandi.prechisleniya,
      tolandi_karta: data.tolandi.karta,
      qoldiq: data.qoldiq,
      qoldiq_avans: data.qoldiq_avans, // NEW FIELD
      last_updated: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating kirim data:", error)
    throw error
  }

  return result
}

export async function deleteKirimData(id: number) {
  const { error } = await supabase.from("kirim_data").delete().eq("id", id)

  if (error) {
    console.error("Error deleting kirim data:", error)
    throw error
  }
}

// Chiqim Data Functions
export async function getChiqimData() {
  const { data, error } = await supabase.from("chiqim_data").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching chiqim data:", error)
    return []
  }

  return data.map((item) => ({
    id: item.id,
    sana: item.sana,
    nomi: item.nomi,
    filialNomi: item.filial_nomi,
    chiqimNomi: item.chiqim_nomi,
    avvalgiOylardan: item.avvalgi_oylardan,
    birOylikHisoblangan: item.bir_oylik_hisoblangan,
    jamiHisoblangan: item.jami_hisoblangan,
    tolangan: item.tolangan,
    qoldiqQarzDorlik: item.qoldiq_qarz_dorlik,
    qoldiqAvans: item.qoldiq_avans,
  }))
}

export async function addChiqimData(data: any) {
  const { data: result, error } = await supabase
    .from("chiqim_data")
    .insert({
      sana: data.sana,
      nomi: data.nomi,
      filial_nomi: data.filialNomi,
      chiqim_nomi: data.chiqimNomi,
      avvalgi_oylardan: data.avvalgiOylardan,
      bir_oylik_hisoblangan: data.birOylikHisoblangan,
      jami_hisoblangan: data.jamiHisoblangan,
      tolangan: data.tolangan,
      qoldiq_qarz_dorlik: data.qoldiqQarzDorlik,
      qoldiq_avans: data.qoldiqAvans,
    })
    .select()

  if (error) {
    console.error("Error adding chiqim data:", error)
    throw error
  }

  return result
}

export async function updateChiqimData(id: number, data: any) {
  const { data: result, error } = await supabase
    .from("chiqim_data")
    .update({
      sana: data.sana,
      nomi: data.nomi,
      filial_nomi: data.filialNomi,
      chiqim_nomi: data.chiqimNomi,
      avvalgi_oylardan: data.avvalgiOylardan,
      bir_oylik_hisoblangan: data.birOylikHisoblangan,
      jami_hisoblangan: data.jamiHisoblangan,
      tolangan: data.tolangan,
      qoldiq_qarz_dorlik: data.qoldiqQarzDorlik,
      qoldiq_avans: data.qoldiqAvans,
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating chiqim data:", error)
    throw error
  }

  return result
}

export async function deleteChiqimData(id: number) {
  const { error } = await supabase.from("chiqim_data").delete().eq("id", id)

  if (error) {
    console.error("Error deleting chiqim data:", error)
    throw error
  }
}

// Notification Functions
export async function getNotifications() {
  const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching notifications:", error)
    return []
  }

  return data.map((item) => ({
    id: item.id,
    title: item.title,
    message: item.message,
    date: item.date,
    isRecurring: item.is_recurring,
    frequency: item.frequency,
    isActive: item.is_active,
    createdAt: item.created_at,
  }))
}

export async function addNotification(data: any) {
  const { data: result, error } = await supabase
    .from("notifications")
    .insert({
      title: data.title,
      message: data.message,
      date: data.date,
      is_recurring: data.isRecurring,
      frequency: data.frequency,
      is_active: data.isActive,
    })
    .select()

  if (error) {
    console.error("Error adding notification:", error)
    throw error
  }

  return result
}

export async function updateNotification(id: number, data: any) {
  const { data: result, error } = await supabase
    .from("notifications")
    .update({
      title: data.title,
      message: data.message,
      date: data.date,
      is_recurring: data.isRecurring,
      frequency: data.frequency,
      is_active: data.isActive,
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating notification:", error)
    throw error
  }

  return result
}

export async function deleteNotification(id: number) {
  const { error } = await supabase.from("notifications").delete().eq("id", id)

  if (error) {
    console.error("Error deleting notification:", error)
    throw error
  }
}
