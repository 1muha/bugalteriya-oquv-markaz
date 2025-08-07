"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Download, Search, Plus, Edit, Trash2 } from "lucide-react";
import { useAccounting } from "@/contexts/accounting-context";

interface ChiqimData {
  id: number;
  sana: string;
  nomi: string;
  filialNomi: string;
  chiqimNomi: string;
  avvalgiOylardan: number;
  birOylikHisoblangan: number;
  jamiHisoblangan: number;
  tolangan: {
    jami: number;
    naqd: number;
    prechisleniya: number;
    karta: number;
  };
  qoldiqQarzDorlik: number;
  qoldiqAvans: number;
}

const filialOptions = ["Zarkent Filiali", "Nabrejniy Filiali"];

const formatNumber = (value: string | number | undefined | null, separator: string = ",") => {
  if (value === null || value === undefined || value === "") return "";
  const digits = String(value).replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

const parseNumber = (value: string) => {
  return Number.parseFloat(value.replace(/,/g, "")) || 0;
};

const calculateTolanganJami = (naqd: number, prechisleniya: number, karta: number) => {
  return (naqd || 0) + (prechisleniya || 0) + (karta || 0);
};

const calculateJamiHisoblangan = (avvalgiOylardan: number, birOylikHisoblangan: number) => {
  return avvalgiOylardan + birOylikHisoblangan;
};

const calculateQoldiqValues = (jamiHisoblangan: number, tolangan: { naqd: number; prechisleniya: number; karta: number }) => {
  const jamiTolangan = calculateTolanganJami(tolangan.naqd, tolangan.prechisleniya, tolangan.karta);
  const difference = jamiHisoblangan - jamiTolangan;
  return {
    qoldiqQarzDorlik: difference > 0 ? difference : 0,
    qoldiqAvans: difference < 0 ? Math.abs(difference) : 0,
  };
};

export default function ChiqimModule() {
  const { chiqimData, loading, addChiqim, updateChiqim, deleteChiqim } = useAccounting();
  const [filters, setFilters] = useState({
    searchTerm: "",
    chiqimTuri: "",
    filial: "Barcha filiallar",
    startDate: "",
    endDate: "",
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChiqimData | null>(null);
  const [newEntry, setNewEntry] = useState<Partial<ChiqimData>>({
    sana: "",
    nomi: "",
    filialNomi: "Zarkent Filiali",
    chiqimNomi: "",
    avvalgiOylardan: 0,
    birOylikHisoblangan: 0,
    tolangan: { jami: 0, naqd: 0, prechisleniya: 0, karta: 0 },
  });

  const filteredData = useMemo(() => {
    return chiqimData.filter((item) => {
      const matchesSearch =
        !filters.searchTerm ||
        item.nomi.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.chiqimNomi.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.filialNomi.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesType =
        !filters.chiqimTuri || item.chiqimNomi.toLowerCase().includes(filters.chiqimTuri.toLowerCase());
      const matchesFilial = filters.filial === "Barcha filiallar" || item.filialNomi === filters.filial;
      const matchesDateRange = (() => {
        if (!filters.startDate && !filters.endDate) return true;
        const itemDate = new Date(item.sana.split("/").reverse().join("-"));
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
        return true;
      })();
      return matchesSearch && matchesType && matchesFilial && matchesDateRange;
    });
  }, [chiqimData, filters]);

  const totals = filteredData.reduce(
    (acc, row) => ({
      avvalgiOylardan: acc.avvalgiOylardan + row.avvalgiOylardan,
      birOylikHisoblangan: acc.birOylikHisoblangan + row.birOylikHisoblangan,
      jamiHisoblangan: acc.jamiHisoblangan + row.jamiHisoblangan,
      tolanganJami: acc.tolanganJami + row.tolangan.jami,
      tolanganNaqd: acc.tolanganNaqd + row.tolangan.naqd,
      tolanganPrechisleniya: acc.tolanganPrechisleniya + row.tolangan.prechisleniya,
      tolanganKarta: acc.tolanganKarta + row.tolangan.karta,
      qoldiqQarzDorlik: acc.qoldiqQarzDorlik + row.qoldiqQarzDorlik,
      qoldiqAvans: acc.qoldiqAvans + row.qoldiqAvans,
    }),
    {
      avvalgiOylardan: 0,
      birOylikHisoblangan: 0,
      jamiHisoblangan: 0,
      tolanganJami: 0,
      tolanganNaqd: 0,
      tolanganPrechisleniya: 0,
      tolanganKarta: 0,
      qoldiqQarzDorlik: 0,
      qoldiqAvans: 0,
    }
  );

  const downloadCSV = () => {
    const headers = [
      "Sana",
      "Nomi",
      "Filial nomi",
      "Chiqim nomi",
      "Avvalgi oylardan qoldiq",
      "Bir oylik hisoblangan summa",
      "Jami hisoblangan summa",
      "To'langan summa (Jami)",
      "Naqd",
      "Prechisleniya",
      "Karta",
      "Qoldiq qarzdorlik",
      "Qoldiq avans",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredData.map((row) =>
        [
          `"${row.sana}"`,
          `"${row.nomi}"`,
          `"${row.filialNomi}"`,
          `"${row.chiqimNomi}"`,
          formatNumber(row.avvalgiOylardan),
          formatNumber(row.birOylikHisoblangan),
          formatNumber(row.jamiHisoblangan),
          formatNumber(row.tolangan.jami),
          formatNumber(row.tolangan.naqd),
          formatNumber(row.tolangan.prechisleniya),
          formatNumber(row.tolangan.karta),
          formatNumber(row.qoldiqQarzDorlik),
          formatNumber(row.qoldiqAvans),
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `chiqimlar_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addNewEntry = async () => {
    if (newEntry.nomi && newEntry.chiqimNomi) {
      try {
        const jamiHisoblangan = calculateJamiHisoblangan(
          newEntry.avvalgiOylardan || 0,
          newEntry.birOylikHisoblangan || 0
        );
        const tolanganJami = calculateTolanganJami(
          newEntry.tolangan?.naqd || 0,
          newEntry.tolangan?.prechisleniya || 0,
          newEntry.tolangan?.karta || 0
        );
        const qoldiqValues = calculateQoldiqValues(jamiHisoblangan, {
          naqd: newEntry.tolangan?.naqd || 0,
          prechisleniya: newEntry.tolangan?.prechisleniya || 0,
          karta: newEntry.tolangan?.karta || 0,
        });
        const entry = {
          sana: newEntry.sana || new Date().toLocaleDateString("en-GB"),
          nomi: newEntry.nomi || "",
          filialNomi: newEntry.filialNomi || "Zarkent Filiali",
          chiqimNomi: newEntry.chiqimNomi || "",
          avvalgiOylardan: newEntry.avvalgiOylardan || 0,
          birOylikHisoblangan: newEntry.birOylikHisoblangan || 0,
          jamiHisoblangan,
          tolangan: {
            jami: tolanganJami,
            naqd: newEntry.tolangan?.naqd || 0,
            prechisleniya: newEntry.tolangan?.prechisleniya || 0,
            karta: newEntry.tolangan?.karta || 0,
          },
          qoldiqQarzDorlik: qoldiqValues.qoldiqQarzDorlik,
          qoldiqAvans: qoldiqValues.qoldiqAvans,
        };
        await addChiqim(entry);
        setNewEntry({
          sana: "",
          nomi: "",
          filialNomi: "Zarkent Filiali",
          chiqimNomi: "",
          avvalgiOylardan: 0,
          birOylikHisoblangan: 0,
          tolangan: { jami: 0, naqd: 0, prechislenıya: 0, karta: 0 },
        });
        setIsAddModalOpen(false);
      } catch (error) {
        console.error("Error adding entry:", error);
        alert("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
      }
    }
  };

  const updateEntry = async (updatedEntry: ChiqimData) => {
    try {
      const jamiHisoblangan = calculateJamiHisoblangan(updatedEntry.avvalgiOylardan, updatedEntry.birOylikHisoblangan);
      const tolanganJami = calculateTolanganJami(
        updatedEntry.tolangan.naqd,
        updatedEntry.tolangan.prechisleniya,
        updatedEntry.tolangan.karta
      );
      const qoldiqValues = calculateQoldiqValues(jamiHisoblangan, updatedEntry.tolangan);
      const finalEntry = {
        ...updatedEntry,
        jamiHisoblangan,
        tolangan: {
          ...updatedEntry.tolangan,
          jami: tolanganJami,
        },
        qoldiqQarzDorlik: qoldiqValues.qoldiqQarzDorlik,
        qoldiqAvans: qoldiqValues.qoldiqAvans,
      };
      await updateChiqim(updatedEntry.id, finalEntry);
      setEditingItem(null);
    } catch (error) {
      console.error("Error updating entry:", error);
      alert("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    }
  };

  const deleteEntry = async (id: number) => {
    if (confirm("Haqiqatan ham bu yozuvni o'chirmoqchimisiz?")) {
      try {
        await deleteChiqim(id);
      } catch (error) {
        console.error("Error deleting entry:", error);
        alert("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
      }
    }
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      chiqimTuri: "",
      filial: "Barcha filiallar",
      startDate: "",
      endDate: "",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ma'lumotlar yuklanmoqda...</div>
      </div>
    );
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
            CSV yuklab olish
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
                    value={newEntry.filialNomi || "Zarkent Filiali"}
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
                    value={formatNumber(newEntry.avvalgiOylardan) || ""}
                    onChange={(e) => setNewEntry({ ...newEntry, avvalgiOylardan: parseNumber(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="birOylikHisoblangan">Bir oylik hisoblangan summa</Label>
                  <Input
                    id="birOylikHisoblangan"
                    type="text"
                    value={formatNumber(newEntry.birOylikHisoblangan) || ""}
                    onChange={(e) => setNewEntry({ ...newEntry, birOylikHisoblangan: parseNumber(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-base font-medium">To'langan summa</Label>
                  <div className="grid grid-cols-4 gap-3 mt-2">
                    <div>
                      <Label htmlFor="tolangan-jami" className="text-sm text-green-600">Jami (Avtomatik)</Label>
                      <Input
                        id="tolangan-jami"
                        type="number"
                        value={calculateTolanganJami(
                          newEntry.tolangan?.naqd || 0,
                          newEntry.tolangan?.prechisleniya || 0,
                          newEntry.tolangan?.karta || 0
                        )}
                        disabled
                        className="bg-green-50 text-green-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tolangan-naqd" className="text-sm">Naqd</Label>
                      <Input
                        id="tolangan-naqd"
                        type="text"
                        value={formatNumber(newEntry.tolangan?.naqd) || ""}
                        onChange={(e) =>
                          setNewEntry({
                            ...newEntry,
                            tolangan: { ...newEntry.tolangan, naqd: parseNumber(e.target.value) },
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tolangan-prechisleniya" className="text-sm">Prechisleniya</Label>
                      <Input
                        id="tolangan-prechisleniya"
                        type="text"
                        value={formatNumber(newEntry.tolangan?.prechisleniya) || ""}
                        onChange={(e) =>
                          setNewEntry({
                            ...newEntry,
                            tolangan: { ...newEntry.tolangan, prechisleniya: parseNumber(e.target.value) },
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tolangan-karta" className="text-sm">Karta</Label>
                      <Input
                        id="tolangan-karta"
                        type="text"
                        value={formatNumber(newEntry.tolangan?.karta) || ""}
                        onChange={(e) =>
                          setNewEntry({
                            ...newEntry,
                            tolangan: { ...newEntry.tolangan, karta: parseNumber(e.target.value) },
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
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
                  <Label htmlFor="qoldiqQarzDorlik" className="text-red-600">
                    Qoldiq qarzdorlik (Avtomatik)
                  </Label>
                  <Input
                    id="qoldiqQarzDorlik"
                    type="number"
                    value={calculateQoldiqValues(
                      calculateJamiHisoblangan(newEntry.avvalgiOylardan || 0, newEntry.birOylikHisoblangan || 0),
                      {
                        naqd: newEntry.tolangan?.naqd || 0,
                        prechisleniya: newEntry.tolangan?.prechisleniya || 0,
                        karta: newEntry.tolangan?.karta || 0,
                      }
                    ).qoldiqQarzDorlik}
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
                    value={calculateQoldiqValues(
                      calculateJamiHisoblangan(newEntry.avvalgiOylardan || 0, newEntry.birOylikHisoblangan || 0),
                      {
                        naqd: newEntry.tolangan?.naqd || 0,
                        prechisleniya: newEntry.tolangan?.prechisleniya || 0,
                        karta: newEntry.tolangan?.karta || 0,
                      }
                    ).qoldiqAvans}
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
          </ ChiqimModule() {
  const { chiqimData, loading, addChiqim, updateChiqim, deleteChiqim } = useAccounting();
  const [filters, setFilters] = useState({
    searchTerm: "",
    chiqimTuri: "",
    filial: "Barcha filiallar",
    startDate: "",
    endDate: "",
  });
  const [isAddModalOpen,
