"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Calendar } from "lucide-react"
import { useAccounting } from "@/contexts/accounting-context"

interface BalansData {
  id: number
  filialNomi: string
  oldingiOylardan: number
  birOylikHisoblangan: number
  jamiHisoblangan: number
  tolandi: {
    jami: number
    naqd: number
    prechisleniya: number
    karta: number
  }
  qoldiq: number
  jamiOylikXarajat: number
  jamiYigirmaAyirmasi: number
}

const filialOptions = ["Zarkent Filiali", "Nabrejniy Filiali"]

export default function BalansModule() {
  const { kirimData, chiqimData } = useAccounting()
  const [data, setData] = useState<BalansData[]>([])
  const [filters, setFilters] = useState({
    filial: "Barcha filiallar",
    startDate: "",
    endDate: "",
  })

  // Filter data based on date range
  const getFilteredKirimData = () => {
    if (!filters.startDate && !filters.endDate) return kirimData

    return kirimData.filter((item) => {
      const itemDate = new Date(item.lastUpdated)
      const startDate = filters.startDate ? new Date(filters.startDate) : null
      const endDate = filters.endDate ? new Date(filters.endDate) : null

      if (startDate && itemDate < startDate) return false
      if (endDate && itemDate > endDate) return false

      return true
    })
  }

  const getFilteredChiqimData = () => {
    if (!filters.startDate && !filters.endDate) return chiqimData

    return chiqimData.filter((item) => {
      const itemDate = new Date(item.sana.split("/").reverse().join("-"))
      const startDate = filters.startDate ? new Date(filters.startDate) : null
      const endDate = filters.endDate ? new Date(filters.endDate) : null

      if (startDate && itemDate < startDate) return false
      if (endDate && itemDate > endDate) return false

      return true
    })
  }

  useEffect(() => {
    const filteredKirimData = getFilteredKirimData()
    const filteredChiqimData = getFilteredChiqimData()

    // Group data by filial
    const filialGroups: { [key: string]: { kirim: any; chiqim: any } } = {}

    // Initialize all filials
    const allFilials = filters.filial === "Barcha filiallar" ? filialOptions : [filters.filial]

    allFilials.forEach((filial) => {
      filialGroups[filial] = {
        kirim: {
          oldingiOylardan: 0,
          birOylikHisoblangan: 0,
          jamiHisoblangan: 0,
          tolandi: { jami: 0, naqd: 0, prechisleniya: 0, karta: 0 },
          qoldiq: 0,
        },
        chiqim: {
          avvalgiOylardan: 0,
          birOylikHisoblangan: 0,
          jamiHisoblangan: 0,
          tolangan: 0,
          qoldiqQarzDorlik: 0,
          qoldiqAvans: 0,
        },
      }
    })

    // Aggregate Kirim data by filial
    filteredKirimData.forEach((item) => {
      if (filialGroups[item.filialNomi]) {
        filialGroups[item.filialNomi].kirim.oldingiOylardan += item.oldingiOylardan.summasi
        filialGroups[item.filialNomi].kirim.birOylikHisoblangan += item.birOylikHisoblanganSumma
        filialGroups[item.filialNomi].kirim.jamiHisoblangan += item.jamiQarzDorlik
        filialGroups[item.filialNomi].kirim.tolandi.jami += item.tolandi.jami
        filialGroups[item.filialNomi].kirim.tolandi.naqd += item.tolandi.naqd
        filialGroups[item.filialNomi].kirim.tolandi.prechisleniya += item.tolandi.prechisleniya
        filialGroups[item.filialNomi].kirim.tolandi.karta += item.tolandi.karta
        filialGroups[item.filialNomi].kirim.qoldiq += item.qoldiq
      }
    })

    // Aggregate Chiqim data by filial
    filteredChiqimData.forEach((item) => {
      if (filialGroups[item.filialNomi]) {
        filialGroups[item.filialNomi].chiqim.avvalgiOylardan += item.avvalgiOylardan
        filialGroups[item.filialNomi].chiqim.birOylikHisoblangan += item.birOylikHisoblangan
        filialGroups[item.filialNomi].chiqim.jamiHisoblangan += item.jamiHisoblangan
        filialGroups[item.filialNomi].chiqim.tolangan += item.tolangan
        filialGroups[item.filialNomi].chiqim.qoldiqQarzDorlik += item.qoldiqQarzDorlik
        filialGroups[item.filialNomi].chiqim.qoldiqAvans += item.qoldiqAvans
      }
    })

    // Create Balans data
 const balansData: BalansData[] = Object.entries(filialGroups).map(([filialNomi, data], index) => ({
  id: index + 1,
  filialNomi,
  oldingiOylardan: data.kirim.oldingiOylardan,
  birOylikHisoblangan: data.kirim.birOylikHisoblangan,
  jamiHisoblangan: data.kirim.jamiHisoblangan,
  tolandi: data.kirim.tolandi,
  qoldiq: data.kirim.qoldiq,
  jamiOylikXarajat: data.chiqim.tolangan, // <-- UPDATED
  jamiYigirmaAyirmasi: data.kirim.tolandi.jami - data.chiqim.tolangan, // <-- UPDATED
}))

    // Only show filials with data
    setData(
      balansData.filter(
        (item) => item.oldingiOylardan > 0 || item.birOylikHisoblangan > 0 || item.jamiOylikXarajat > 0,
      ),
    )
  }, [kirimData, chiqimData, filters])

  const downloadCSV = () => {
    const headers = [
      "Filial nomi",
      "Oldingi oylardan qoldiq summa",
      "Bir oylik hisoblangan summa (iyul)",
      "Jami hisoblangan summa",
      "Jami",
      "Naqd",
      "Prechisleniya",
      "Karta",
      "Qoldiq",
      "Jami bir oylik xarajat",
      "Jami yigirma puldan xarajatni ayirmasi sof foyda",
    ]

    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        [
          `"${row.filialNomi}"`,
          row.oldingiOylardan,
          row.birOylikHisoblangan,
          row.jamiHisoblangan,
          row.tolandi.jami,
          row.tolandi.naqd,
          row.tolandi.prechisleniya,
          row.tolandi.karta,
          row.qoldiq,
          row.jamiOylikXarajat,
          row.jamiYigirmaAyirmasi,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `balans_hisoboti_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const clearFilters = () => {
    setFilters({
      filial: "Barcha filiallar",
      startDate: "",
      endDate: "",
    })
  }

  const totals = data.reduce(
    (acc, row) => ({
      oldingiOylardan: acc.oldingiOylardan + row.oldingiOylardan,
      birOylikHisoblangan: acc.birOylikHisoblangan + row.birOylikHisoblangan,
      jamiHisoblangan: acc.jamiHisoblangan + row.jamiHisoblangan,
      jami: acc.jami + row.tolandi.jami,
      naqd: acc.naqd + row.tolandi.naqd,
      prechisleniya: acc.prechisleniya + row.tolandi.prechisleniya,
      karta: acc.karta + row.tolandi.karta,
      qoldiq: acc.qoldiq + row.qoldiq,
      jamiOylikXarajat: acc.jamiOylikXarajat + row.jamiOylikXarajat,
      jamiYigirmaAyirmasi: acc.jamiYigirmaAyirmasi + row.jamiYigirmaAyirmasi,
    }),
    {
      oldingiOylardan: 0,
      birOylikHisoblangan: 0,
      jamiHisoblangan: 0,
      jami: 0,
      naqd: 0,
      prechisleniya: 0,
      karta: 0,
      qoldiq: 0,
      jamiOylikXarajat: 0,
      jamiYigirmaAyirmasi: 0,
    },
  )

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Balans hisoboti</h1>
          <p className="text-gray-600">Filiallar bo'yicha Kirim va Chiqim modullaridan avtomatik olingan ma'lumotlar</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={downloadCSV} variant="outline" className="flex items-center gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            CSV yuktab olish
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-gray-400" />
          <h3 className="text-base font-medium">Filtr va sana oralig'i</h3>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <Select value={filters.filial} onValueChange={(value) => setFilters({ ...filters, filial: value })}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Barcha filiallar">Barcha filiallar</SelectItem>
                {filialOptions.map((filial) => (
                  <SelectItem key={filial} value={filial}>
                    {filial}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Input
              type="date"
              placeholder="Boshlanish sanasi"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="h-9"
            />
          </div>
          <div>
            <Input
              type="date"
              placeholder="Tugash sanasi"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="h-9"
            />
          </div>
          <div>
            <Button onClick={clearFilters} variant="outline" className="h-9 w-full bg-transparent">
              Tozalash
            </Button>
          </div>
        </div>
        {(filters.startDate || filters.endDate) && (
          <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
            <strong>Filtr qo'llanildi:</strong> {filters.startDate && `${filters.startDate} dan`}{" "}
            {filters.endDate && `${filters.endDate} gacha`}{" "}
            {filters.filial !== "Barcha filiallar" && `• ${filters.filial}`}
          </div>
        )}
      </div>

      {/* Financial Indicators Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Moliyaviy ko'rsatkichlar</h3>
          <p className="text-gray-600">
            Filiallar bo'yicha Kirim va Chiqim modullaridan avtomatik hisoblangan balans hisoboti ({data.length} filial)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">№</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Filial nomi</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Oldingi oylardan qoldiq summa</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Bir oylik hisoblangan summa (iyul)
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Jami hisoblangan summa</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700" colSpan={4}>
                  To'landi (iyul)
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Qoldiq</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Jami bir oylik xarajat</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Jami yigirma puldan xarajatni ayirmasi sof foyda
                </th>
              </tr>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-2"></th>
                <th className="px-4 py-2"></th>
                <th className="px-4 py-2"></th>
                <th className="px-4 py-2"></th>
                <th className="px-4 py-2"></th>
                <th className="px-2 py-2 text-xs text-gray-600">Jami</th>
                <th className="px-2 py-2 text-xs text-gray-600">Naqd</th>
                <th className="px-2 py-2 text-xs text-gray-600">Prechisleniya</th>
                <th className="px-2 py-2 text-xs text-gray-600">Karta</th>
                <th className="px-4 py-2"></th>
                <th className="px-4 py-2"></th>
                <th className="px-4 py-2"></th>
              </tr>

              {/* Totals Row */}
              <tr className="border-b-2 border-gray-300 bg-gray-100 font-medium">
                <td className="px-4 py-3 text-sm" colSpan={2}>
                  Jami ko'rsatkichlar:
                </td>
                <td className="px-4 py-3 text-sm text-right">{totals.oldingiOylardan.toLocaleString()} so'm</td>
                <td className="px-4 py-3 text-sm text-right">{totals.birOylikHisoblangan.toLocaleString()} so'm</td>
                <td className="px-4 py-3 text-sm text-right">{totals.jamiHisoblangan.toLocaleString()} so'm</td>
                <td className="px-4 py-3 text-sm text-right">{totals.jami.toLocaleString()} so'm</td>
                <td className="px-4 py-3 text-sm text-right">{totals.naqd.toLocaleString()} so'm</td>
                <td className="px-4 py-3 text-sm text-right">{totals.prechisleniya.toLocaleString()} so'm</td>
                <td className="px-4 py-3 text-sm text-right">{totals.karta.toLocaleString()} so'm</td>
                <td className="px-4 py-3 text-sm text-right">{totals.qoldiq.toLocaleString()} so'm</td>
                <td className="px-4 py-3 text-sm text-right">{totals.jamiOylikXarajat.toLocaleString()} so'm</td>
                <td
                  className={`px-4 py-3 text-sm text-right ${totals.jamiYigirmaAyirmasi >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {totals.jamiYigirmaAyirmasi.toLocaleString()} so'm
                </td>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((row, index) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{row.filialNomi}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {row.oldingiOylardan.toLocaleString()} so'm
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {row.birOylikHisoblangan.toLocaleString()} so'm
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {row.jamiHisoblangan.toLocaleString()} so'm
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {row.tolandi.jami.toLocaleString()} so'm
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {row.tolandi.naqd.toLocaleString()} so'm
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {row.tolandi.prechisleniya.toLocaleString()} so'm
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {row.tolandi.karta.toLocaleString()} so'm
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">{row.qoldiq.toLocaleString()} so'm</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {row.jamiOylikXarajat.toLocaleString()} so'm
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right ${row.jamiYigirmaAyirmasi >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {row.jamiYigirmaAyirmasi.toLocaleString()} so'm
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                    Tanlangan filtr bo'yicha ma'lumot topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Jami Daromad</h3>
          <p className="text-3xl font-bold text-green-600">{totals.jami.toLocaleString()} so'm</p>
          <p className="text-sm text-gray-600 mt-1">Bir oylik hisoblangan summa</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Jami Xarajat</h3>
          <p className="text-3xl font-bold text-red-600">{totals.jamiOylikXarajat.toLocaleString()} so'm</p>
          <p className="text-sm text-gray-600 mt-1">Bir oylik xarajatlar</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sof Foyda</h3>
          <p className={`text-3xl font-bold ${totals.jamiYigirmaAyirmasi >= 0 ? "text-green-600" : "text-red-600"}`}>
            {totals.jamiYigirmaAyirmasi.toLocaleString()} so'm
          </p>
          <p className="text-sm text-gray-600 mt-1">Daromad - Xarajat</p>
        </div>
      </div>
    </div>
  )
}
