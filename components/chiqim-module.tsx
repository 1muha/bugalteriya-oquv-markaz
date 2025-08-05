"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Download, Search, Plus, Edit, Trash2 } from "lucide-react"
import { useAccounting } from "@/contexts/accounting-context"

// ...existing code...
const formatNumber = (value: string | number) => value ?? ""
// ...existing code...


const parseNumber = (value: string) => {
  return Number.parseFloat(value.replace(/,/g, "")) || 0
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

const filialOptions = ["Toshkent filiali", "Samarqand filiali", "Buxoro filiali", "Andijon filiali", "Namangan filiali"]

function ChiqimModule() {
  const { chiqimData, loading, addChiqim, updateChiqim, deleteChiqim } = useAccounting()

  const [filters, setFilters] = useState({
    searchTerm: "",
    chiqimTuri: "",
    filial: "Barcha filiallar",
    startDate: "",
    endDate: "",
  })

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ChiqimData | null>(null)
  const [newEntry, setNewEntry] = useState<Partial<ChiqimData>>({})

  // Auto-calculation functions
  const calculateJamiHisoblangan = (avvalgiOylardan: number, birOylikHisoblangan: number) => {
    return avvalgiOylardan + birOylikHisoblangan
  }

  const calculateQoldiqValues = (jamiHisoblangan: number, tolangan: number) => {
    const difference = jamiHisoblangan - tolangan

    if (difference > 0) {
      return {
        qoldiqQarzDorlik: difference,
        qoldiqAvans: 0,
      }
    } else {
      return {
        qoldiqQarzDorlik: 0,
        qoldiqAvans: Math.abs(difference),
      }
    }
  }

  const filteredData = useMemo(() => {
    return chiqimData.filter((item) => {
      const matchesSearch =
        !filters.searchTerm ||
        item.nomi.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.chiqimNomi.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.filialNomi.toLowerCase().includes(filters.searchTerm.toLowerCase())

      const matchesType =
        !filters.chiqimTuri || item.chiqimNomi.toLowerCase().includes(filters.chiqimTuri.toLowerCase())

      const matchesFilial = filters.filial === "Barcha filiallar" || item.filialNomi === filters.filial

      const matchesDateRange = (() => {
        if (!filters.startDate && !filters.endDate) return true

        const itemDate = new Date(item.sana.split("/").reverse().join("-"))
        const startDate = filters.startDate ? new Date(filters.startDate) : null
        const endDate = filters.endDate ? new Date(filters.endDate) : null

        if (startDate && itemDate < startDate) return false
        if (endDate && itemDate > endDate) return false

        return true
      })()

      return matchesSearch && matchesType && matchesFilial && matchesDateRange
    })
  }, [chiqimData, filters])

  const downloadCSV = () => {
    const headers = [
      "Sana",
      "Nomi",
      "Filial nomi",
      "Chiqim nomi",
      "Avvalgi oylardan qoldiq",
      "Bir oylik hisoblangan summa",
      "Jami hisoblangan summa",
      "To'langan summa",
      "Qoldiq qarzdorlik",
      "Qoldiq avans",
    ]

    const csvContent = [
      headers.join(","),
      ...filteredData.map((row) =>
        [
          row.sana,
          `"${row.nomi}"`,
          `"${row.filialNomi}"`,
          `"${row.chiqimNomi}"`,
          row.avvalgiOylardan,
          row.birOylikHisoblangan,
          row.jamiHisoblangan,
          row.tolangan,
          row.qoldiqQarzDorlik,
          row.qoldiqAvans,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `chiqimlar_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const addNewEntry = async () => {
    if (newEntry.nomi && newEntry.chiqimNomi) {
      try {
        const jamiHisoblangan = calculateJamiHisoblangan(
          newEntry.avvalgiOylardan || 0,
          newEntry.birOylikHisoblangan || 0,
        )
        const qoldiqValues = calculateQoldiqValues(jamiHisoblangan, newEntry.tolangan || 0)

        const entry = {
          sana: newEntry.sana || new Date().toLocaleDateString("en-GB"),
          nomi: newEntry.nomi || "",
          filialNomi: newEntry.filialNomi || "Toshkent filiali",
          chiqimNomi: newEntry.chiqimNomi || "",
          avvalgiOylardan: newEntry.avvalgiOylardan || 0,
          birOylikHisoblangan: newEntry.birOylikHisoblangan || 0,
          jamiHisoblangan,
          tolangan: newEntry.tolangan || 0,
          qoldiqQarzDorlik: qoldiqValues.qoldiqQarzDorlik,
          qoldiqAvans: qoldiqValues.qoldiqAvans,
        }

        await addChiqim(entry)
        setNewEntry({})
        setIsAddModalOpen(false)
      } catch (error) {
        console.error("Error adding entry:", error)
        alert("Xatolik yuz berdi. Qaytadan urinib ko'ring.")
      }
    }
  }

  const updateEntry = async (updatedEntry: ChiqimData) => {
    try {
      const jamiHisoblangan = calculateJamiHisoblangan(updatedEntry.avvalgiOylardan, updatedEntry.birOylikHisoblangan)
      const qoldiqValues = calculateQoldiqValues(jamiHisoblangan, updatedEntry.tolangan)

      const finalEntry = {
        ...updatedEntry,
        jamiHisoblangan,
        qoldiqQarzDorlik: qoldiqValues.qoldiqQarzDorlik,
        qoldiqAvans: qoldiqValues.qoldiqAvans,
      }

      await updateChiqim(updatedEntry.id, finalEntry)
      setEditingItem(null)
    } catch (error) {
      console.error("Error updating entry:", error)
      alert("Xatolik yuz berdi. Qaytadan urinib ko'ring.")
    }
  }

  const deleteEntry = async (id: number) => {
    if (confirm("Haqiqatan ham bu yozuvni o'chirmoqchimisiz?")) {
      try {
        await deleteChiqim(id)
      } catch (error) {
        console.error("Error deleting entry:", error)
        alert("Xatolik yuz berdi. Qaytadan urinib ko'ring.")
      }
    }
  }

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      chiqimTuri: "",
      filial: "Barcha filiallar",
      startDate: "",
      endDate: "",
    })
  }

  const totals = filteredData.reduce(
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ma'lumotlar yuklanmoqda...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Chiqimlar boshqaruvi</h1>
          <p className="text-gray-600">Barcha chiqimlar va to'lovlarni boshqaring</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={downloadCSV} variant="outline" className="flex items-center gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            CSV yuktab olish
          </Button>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Yangi chiqim
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Yangi chiqim qo'shish</DialogTitle>
                <p className="text-sm text-gray-600">
                  Chiqim ma'lumotlarini kiriting (Jami hisoblangan va Qoldiqlar avtomatik hisoblanadi)
                </p>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <Label htmlFor="sana">Sana</Label>
                  <Input
                    id="sana"
                    type="date"
                    value={newEntry.sana || ""}
                    onChange={(e) => setNewEntry({ ...newEntry, sana: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="nomi">Nomi</Label>
                  <Input
                    id="nomi"
                    value={newEntry.nomi || ""}
                    onChange={(e) => setNewEntry({ ...newEntry, nomi: e.target.value })}
                    placeholder="Xodim yoki tashkilot nomi"
                  />
                </div>
                <div>
                  <Label htmlFor="filialNomi">Filial nomi</Label>
                  <Select
                    value={newEntry.filialNomi || "Toshkent filiali"}
                    onValueChange={(value) => setNewEntry({ ...newEntry, filialNomi: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filial tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {filialOptions.map((filial) => (
                        <SelectItem key={filial} value={filial}>
                          {filial}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="chiqimNomi">Chiqim nomi</Label>
                  <Input
                    id="chiqimNomi"
                    value={newEntry.chiqimNomi || ""}
                    onChange={(e) => setNewEntry({ ...newEntry, chiqimNomi: e.target.value })}
                    placeholder="Chiqim turi"
                  />
                </div>
                <div>
                  <Label htmlFor="avvalgiOylardan">Avvalgi oylardan qoldiq</Label>
                  <Input
                    id="avvalgiOylardan"
                    type="text"
                    value={formatNumber(newEntry.avvalgiOylardan || "")}
                    onChange={(e) => setNewEntry({ ...newEntry, avvalgiOylardan: parseNumber(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="birOylikHisoblangan">Bir oylik hisoblangan summa</Label>
                  <Input
                    id="birOylikHisoblangan"
                    type="text"
                    value={formatNumber(newEntry.birOylikHisoblangan || "")}
                    onChange={(e) => setNewEntry({ ...newEntry, birOylikHisoblangan: parseNumber(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="jamiHisoblangan" className="text-green-600">
                    Jami hisoblangan summa (Avtomatik)
                  </Label>
                  <Input
                    id="jamiHisoblangan"
                    type="number"
                    value={calculateJamiHisoblangan(newEntry.avvalgiOylardan || 0, newEntry.birOylikHisoblangan || 0)}
                    disabled
                    className="bg-green-50 text-green-700"
                  />
                </div>
                <div>
                  <Label htmlFor="tolangan">To'langan summa</Label>
                  <Input
                    id="tolangan"
                    type="number"
                    value={newEntry.tolangan || ""}
                    onChange={(e) => setNewEntry({ ...newEntry, tolangan: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="qoldiqQarzDorlik" className="text-red-600">
                    Qoldiq qarzdorlik (Avtomatik)
                  </Label>
                  <Input
                    id="qoldiqQarzDorlik"
                    type="number"
                    value={
                      calculateQoldiqValues(
                        calculateJamiHisoblangan(newEntry.avvalgiOylardan || 0, newEntry.birOylikHisoblangan || 0),
                        newEntry.tolangan || 0,
                      ).qoldiqQarzDorlik
                    }
                    disabled
                    className="bg-red-50 text-red-700"
                  />
                </div>
                <div>
                  <Label htmlFor="qoldiqAvans" className="text-blue-600">
                    Qoldiq avans (Avtomatik)
                  </Label>
                  <Input
                    id="qoldiqAvans"
                    type="number"
                    value={
                      calculateQoldiqValues(
                        calculateJamiHisoblangan(newEntry.avvalgiOylardan || 0, newEntry.birOylikHisoblangan || 0),
                        newEntry.tolangan || 0,
                      ).qoldiqAvans
                    }
                    disabled
                    className="bg-blue-50 text-blue-700"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Bekor qilish
                </Button>
                <Button onClick={addNewEntry} className="bg-gray-900 hover:bg-gray-800 text-white">
                  Saqlash
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-4 w-4 text-gray-400" />
          <h3 className="text-base font-medium">Qidiruv va filtr</h3>
        </div>
        <div className="grid grid-cols-6 gap-3">
          <div>
            <Input
              placeholder="Qidiruv..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="h-9"
            />
          </div>
          <div>
            <Input
              placeholder="Chiqim turi..."
              value={filters.chiqimTuri}
              onChange={(e) => setFilters({ ...filters, chiqimTuri: e.target.value })}
              className="h-9"
            />
          </div>
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
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="h-9"
            />
          </div>
          <div>
            <Input
              type="date"
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
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium">Chiqimlar jadvali ({filteredData.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">№</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Sana</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nomi</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Filial nomi</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Chiqim nomi</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Avvalgi oylardan qoldiq</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Bir oylik hisoblangan summa</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Jami hisoblangan</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">To'langan summa</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Qoldiq qarzdorlik</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Qoldiq avans</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Amallar</th>
              </tr>
              {/* Totals Row */}
              <tr className="border-b-2 border-gray-300 bg-gray-100 font-medium">
                <td className="px-4 py-3 text-sm" colSpan={5}>
                  Jami ko'rsatkichlar:
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-700">
                  {totals.avvalgiOylardan.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-700">
                  {totals.birOylikHisoblangan.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-right text-green-600">
                  {totals.jamiHisoblangan.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-700">{totals.tolangan.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-right text-red-600">
                  {totals.qoldiqQarzDorlik.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-right text-blue-600">{totals.qoldiqAvans.toLocaleString()}</td>
                <td className="px-4 py-3"></td>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{row.sana}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{row.nomi}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{row.filialNomi}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{row.chiqimNomi}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">{row.avvalgiOylardan.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">
                    {row.birOylikHisoblangan.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-green-600">
                    {row.jamiHisoblangan.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">{row.tolangan.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-red-600">{row.qoldiqQarzDorlik.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-blue-600">{row.qoldiqAvans.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingItem(row)}
                        className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteEntry(row.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chiqimni tahrirlash</DialogTitle>
              <p className="text-sm text-gray-600">
                Ma'lumotlarni yangilang (Jami hisoblangan va Qoldiqlar avtomatik hisoblanadi)
              </p>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="edit-sana">Sana</Label>
                <Input
                  id="edit-sana"
                  type="date"
                  value={
                    editingItem.sana
                      ? new Date(editingItem.sana.split("/").reverse().join("-")).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, sana: new Date(e.target.value).toLocaleDateString("en-GB") })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-nomi">Nomi</Label>
                <Input
                  id="edit-nomi"
                  value={editingItem.nomi}
                  onChange={(e) => setEditingItem({ ...editingItem, nomi: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-filialNomi">Filial nomi</Label>
                <Select
                  value={editingItem.filialNomi}
                  onValueChange={(value) => setEditingItem({ ...editingItem, filialNomi: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filial tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {filialOptions.map((filial) => (
                      <SelectItem key={filial} value={filial}>
                        {filial}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-chiqimNomi">Chiqim nomi</Label>
                <Input
                  id="edit-chiqimNomi"
                  value={editingItem.chiqimNomi}
                  onChange={(e) => setEditingItem({ ...editingItem, chiqimNomi: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-avvalgiOylardan">Avvalgi oylardan qoldiq</Label>
                <Input
                  id="edit-avvalgiOylardan"
                  type="text"
                  value={formatNumber(editingItem.avvalgiOylardan)}
                  onChange={(e) => setEditingItem({ ...editingItem, avvalgiOylardan: parseNumber(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-birOylikHisoblangan">Bir oylik hisoblangan summa</Label>
                <Input
                  id="edit-birOylikHisoblangan"
                  type="text"
                  value={formatNumber(editingItem.birOylikHisoblangan)}
                  onChange={(e) => setEditingItem({ ...editingItem, birOylikHisoblangan: parseNumber(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-jamiHisoblangan" className="text-green-600">
                  Jami hisoblangan summa (Avtomatik)
                </Label>
                <Input
                  id="edit-jamiHisoblangan"
                  type="number"
                  value={calculateJamiHisoblangan(editingItem.avvalgiOylardan, editingItem.birOylikHisoblangan)}
                  disabled
                  className="bg-green-50 text-green-700"
                />
              </div>
              <div>
                <Label htmlFor="edit-tolangan">To'langan summa</Label>
                <Input
                  id="edit-tolangan"
                  type="number"
                  value={editingItem.tolangan}
                  onChange={(e) => setEditingItem({ ...editingItem, tolangan: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-qoldiqQarzDorlik" className="text-red-600">
                  Qoldiq qarzdorlik (Avtomatik)
                </Label>
                <Input
                  id="edit-qoldiqQarzDorlik"
                  type="number"
                  value={
                    calculateQoldiqValues(
                      calculateJamiHisoblangan(editingItem.avvalgiOylardan, editingItem.birOylikHisoblangan),
                      editingItem.tolangan,
                    ).qoldiqQarzDorlik
                  }
                  disabled
                  className="bg-red-50 text-red-700"
                />
              </div>
              <div>
                <Label htmlFor="edit-qoldiqAvans" className="text-blue-600">
                  Qoldiq avans (Avtomatik)
                </Label>
                <Input
                  id="edit-qoldiqAvans"
                  type="number"
                  value={
                    calculateQoldiqValues(
                      calculateJamiHisoblangan(editingItem.avvalgiOylardan, editingItem.birOylikHisoblangan),
                      editingItem.tolangan,
                    ).qoldiqAvans
                  }
                  disabled
                  className="bg-blue-50 text-blue-700"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                Bekor qilish
              </Button>
              <Button onClick={() => updateEntry(editingItem)} className="bg-gray-900 hover:bg-gray-800 text-white">
                Saqlash
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Export totals function for Balans module
export const getChiqimTotals = () => {
  return {
    jamiOylikXarajat: 0,
    jamiYigirmaAyirmasi: 0,
  }
}

// Default export
export default ChiqimModule
