"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  getKirimData,
  getChiqimData,
  addKirimData,
  addChiqimData,
  updateKirimData,
  updateChiqimData,
  deleteKirimData,
  deleteChiqimData,
} from "@/lib/database"

interface KirimData {
  id: number
  korxonaNomi: string
  inn: string
  telRaqami: string
  ismi: string
  xizmatTuri: string
  filialNomi: string
  xodim: string
  oldingiOylardan: {
    oylarSoni: number
    summasi: number
  }
  birOylikHisoblanganSumma: number
  jamiQarzDorlik: number
  tolandi: {
    jami: number
    naqd: number
    prechisleniya: number
    karta: number
  }
  qoldiq: number
  lastUpdated: string
}

interface ChiqimData {
  id: number
  sana: string
  nomi: string
  filialNomi: string
  chiqimNomi: string
  avvalgiOylardan: number
  birOylikHisoblangan: number
  jamiHisoblangan: number
  tolangan: number
  qoldiqQarzDorlik: number
  qoldiqAvans: number
}

interface AccountingContextType {
  kirimData: KirimData[]
  chiqimData: ChiqimData[]
  loading: boolean
  setKirimData: (data: KirimData[]) => void
  setChiqimData: (data: ChiqimData[]) => void
  addKirim: (data: any) => Promise<void>
  updateKirim: (id: number, data: any) => Promise<void>
  deleteKirim: (id: number) => Promise<void>
  addChiqim: (data: any) => Promise<void>
  updateChiqim: (id: number, data: any) => Promise<void>
  deleteChiqim: (id: number) => Promise<void>
  refreshData: () => Promise<void>
  getKirimTotals: () => any
  getChiqimTotals: () => any
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined)

export function AccountingProvider({ children }: { children: ReactNode }) {
  const [kirimData, setKirimData] = useState<KirimData[]>([])
  const [chiqimData, setChiqimData] = useState<ChiqimData[]>([])
  const [loading, setLoading] = useState(true)

  // Load data from Supabase on mount
  useEffect(() => {
    refreshData()
  }, [])

  const refreshData = async () => {
    setLoading(true)
    try {
      const [kirimResult, chiqimResult] = await Promise.all([getKirimData(), getChiqimData()])
      setKirimData(kirimResult)
      setChiqimData(chiqimResult)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const addKirim = async (data: any) => {
    try {
      await addKirimData(data)
      await refreshData() // Refresh to get updated data
    } catch (error) {
      console.error("Error adding kirim:", error)
      throw error
    }
  }

  const updateKirim = async (id: number, data: any) => {
    try {
      await updateKirimData(id, data)
      await refreshData()
    } catch (error) {
      console.error("Error updating kirim:", error)
      throw error
    }
  }

  const deleteKirim = async (id: number) => {
    try {
      await deleteKirimData(id)
      await refreshData()
    } catch (error) {
      console.error("Error deleting kirim:", error)
      throw error
    }
  }

  const addChiqim = async (data: any) => {
    try {
      await addChiqimData(data)
      await refreshData()
    } catch (error) {
      console.error("Error adding chiqim:", error)
      throw error
    }
  }

  const updateChiqim = async (id: number, data: any) => {
    try {
      await updateChiqimData(id, data)
      await refreshData()
    } catch (error) {
      console.error("Error updating chiqim:", error)
      throw error
    }
  }

  const deleteChiqim = async (id: number) => {
    try {
      await deleteChiqimData(id)
      await refreshData()
    } catch (error) {
      console.error("Error deleting chiqim:", error)
      throw error
    }
  }

  const getKirimTotals = () => {
    return kirimData.reduce(
      (acc, row) => ({
        oylarSoni: acc.oylarSoni + row.oldingiOylardan.oylarSoni,
        summasi: acc.summasi + row.oldingiOylardan.summasi,
        birOylikHisoblanganSumma: acc.birOylikHisoblanganSumma + row.birOylikHisoblanganSumma,
        jamiQarzDorlik: acc.jamiQarzDorlik + row.jamiQarzDorlik,
        jami: acc.jami + row.tolandi.jami,
        naqd: acc.naqd + row.tolandi.naqd,
        prechisleniya: acc.prechisleniya + row.tolandi.prechisleniya,
        karta: acc.karta + row.tolandi.karta,
        qoldiq: acc.qoldiq + row.qoldiq,
      }),
      {
        oylarSoni: 0,
        summasi: 0,
        birOylikHisoblanganSumma: 0,
        jamiQarzDorlik: 0,
        jami: 0,
        naqd: 0,
        prechisleniya: 0,
        karta: 0,
        qoldiq: 0,
      },
    )
  }

  const getChiqimTotals = () => {
    return chiqimData.reduce(
      (acc, row) => ({
        avvalgiOylardan: acc.avvalgiOylardan + row.avvalgiOylardan,
        birOylikHisoblangan: acc.birOylikHisoblangan + row.birOylikHisoblangan,
        jamiHisoblangan: acc.jamiHisoblangan + row.jamiHisoblangan,
        tolangan: acc.tolangan + row.tolangan,
        qoldiqQarzDorlik: acc.qoldiqQarzDorlik + row.qoldiqQarzDorlik,
        qoldiqAvans: acc.qoldiqAvans + row.qoldiqAvans,
      }),
      {
        avvalgiOylardan: 0,
        birOylikHisoblangan: 0,
        jamiHisoblangan: 0,
        tolangan: 0,
        qoldiqQarzDorlik: 0,
        qoldiqAvans: 0,
      },
    )
  }

  return (
    <AccountingContext.Provider
      value={{
        kirimData,
        chiqimData,
        loading,
        setKirimData,
        setChiqimData,
        addKirim,
        updateKirim,
        deleteKirim,
        addChiqim,
        updateChiqim,
        deleteChiqim,
        refreshData,
        getKirimTotals,
        getChiqimTotals,
      }}
    >
      {children}
    </AccountingContext.Provider>
  )
}

export function useAccounting() {
  const context = useContext(AccountingContext)
  if (context === undefined) {
    throw new Error("useAccounting must be used within an AccountingProvider")
  }
  return context
}
