"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Download, Search, Plus, Edit, Trash2 } from "lucide-react";
import { useAccounting } from "@/contexts/accounting-context";

interface KirimData {
  id: number;
  korxonaNomi: string;
  inn: string;
  telRaqami: string;
  ismi: string;
  xizmatTuri: string;
  filialNomi: string;
  xodim: string;
  oldingiOylardan: {
    oylarSoni: number;
    summasi: number;
  };
  birOylikHisoblanganSumma: number;
  jamiQarzDorlik: number;
  tolandi: {
    jami: number;
    naqd: number;
    prechisleniya: number;
    karta: number;
  };
  qoldiq: number;
  qoldiq_avans: number; // Using underscore consistently
  lastUpdated: string;
}

const filialOptions = ["Zarkent Filiali", "Nabrejniy Filiali"];

const formatNumber = (
  value: string | number | undefined | null,
  separator: string = ","
) => {
  if (value === null || value === undefined || value === "") return "";
  const digits = String(value).replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

const calculateQoldiqAndAvans = (jamiQarzDorlik: number, tolandiJami: number) => {
  const difference = jamiQarzDorlik - tolandiJami;
  if (difference >= 0) {
    return { qoldiq: difference, qoldiq_avans: 0 };
  } else {
    return { qoldiq: 0, qoldiq_avans: -difference };
  }
};

export default function KirimModule() {
  const { kirimData, loading, addKirim, updateKirim, deleteKirim } = useAccounting();
  const [filters, setFilters] = useState({
    searchTerm: "",
    filial: "Barcha filiallar",
    advanced: "all",
    startDate: "",
    endDate: "",
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KirimData | null>(null);
  const [newEntry, setNewEntry] = useState<Partial<KirimData>>({
    xodim: "",
    oldingiOylardan: { oylarSoni: 0, summasi: 0 },
    tolandi: { jami: 0, naqd: 0, prechisleniya: 0, karta: 0 },
    qoldiq_avans: 0, // NEW FIELD
  });

  const parseNumber = (value: string) => {
    return Number.parseFloat(value.replace(/,/g, "")) || 0;
  };

  const calculateJamiQarzDorlik = (oldingiSummasi: number, birOylikSumma: number) => {
    return oldingiSummasi + birOylikSumma;
  };

  const calculateTolandiJami = (naqd: number, prechisleniya: number, karta: number) => {
    return naqd + prechisleniya + karta;
  };

  const filteredData = useMemo(() => {
    return kirimData.filter((item) => {
      const matchesSearch =
        !filters.searchTerm ||
        item.korxonaNomi.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.inn.includes(filters.searchTerm) ||
        item.ismi.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (item.xodim && item.xodim.toLowerCase().includes(filters.searchTerm.toLowerCase()));
      const matchesFilial = filters.filial === "Barcha filiallar" || item.filialNomi === filters.filial;
      const matchesAdvanced =
        filters.advanced === "all" ||
        (filters.advanced === "paid" && item.tolandi.jami > 0) ||
        (filters.advanced === "unpaid" && item.tolandi.jami === 0);
      const matchesDateRange = (() => {
        if (!filters.startDate && !filters.endDate) return true;
        const itemDate = new Date(item.lastUpdated);
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
        return true;
      })();
      return matchesSearch && matchesFilial && matchesAdvanced && matchesDateRange;
    });
  }, [kirimData, filters]);

  const downloadCSV = () => {
    const headers = [
      "Korxona nomi",
      "INN",
      "Tel raqami",
      "Ismi",
      "Xizmat turi",
      "Filial nomi",
      "Xodim",
      "Oylar soni",
      "Summasi",
      "Bir oylik hisoblangan summa",
      "Jami qarzdorlik",
      "Jami",
      "Naqd",
      "Prechisleniya",
      "Karta",
      "Qoldiq",
      "Qoldiq avans", // NEW HEADER
    ];
    const csvContent = [
      headers.join(","),
      ...filteredData.map((row) =>
        [
          `"${row.korxonaNomi}"`,
          row.inn,
          row.telRaqami,
          `"${row.ismi}"`,
          `"${row.xizmatTuri}"`,
          `"${row.filialNomi}"`,
          `"${row.xodim}"`,
          row.oldingiOylardan.oylarSoni,
          row.oldingiOylardan.summasi,
          row.birOylikHisoblanganSumma,
          row.jamiQarzDorlik,
          row.tolandi.jami,
          row.tolandi.naqd,
          row.tolandi.prechisleniya,
          row.tolandi.karta,
          row.qoldiq,
          row.qoldiq_avans, // NEW DATA
        ].join(","),
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `jami_hisobot_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

   const addNewEntry = async () => {
    if (newEntry.korxonaNomi && newEntry.inn) {
      try {
        const jamiQarzDorlik = calculateJamiQarzDorlik(
          newEntry.oldingiOylardan?.summasi || 0,
          newEntry.birOylikHisoblanganSumma || 0,
        );
        const tolandiJami = calculateTolandiJami(
          newEntry.tolandi?.naqd || 0,
          newEntry.tolandi?.prechisleniya || 0,
          newEntry.tolandi?.karta || 0,
        );
        
        // CALCULATE BOTH FIELDS
        const { qoldiq, qoldiq_avans } = calculateQoldiqAndAvans(jamiQarzDorlik, tolandiJami);
        const entry = {
          korxonaNomi: newEntry.korxonaNomi || "",
          inn: newEntry.inn || "",
          telRaqami: newEntry.telRaqami || "",
          ismi: newEntry.ismi || "",
          xizmatTuri: newEntry.xizmatTuri || "",
          filialNomi: newEntry.filialNomi || "Zarkent filiali",
          xodim: newEntry.xodim || "",
          oldingiOylardan: {
            oylarSoni: newEntry.oldingiOylardan?.oylarSoni || 0,
            summasi: newEntry.oldingiOylardan?.summasi || 0,
          },
          birOylikHisoblanganSumma: newEntry.birOylikHisoblanganSumma || 0,
          jamiQarzDorlik,
          jamiQarzDorlik,
          tolandi: {
            jami: tolandiJami,
            naqd: newEntry.tolandi?.naqd || 0,
            prechisleniya: newEntry.tolandi?.prechisleniya || 0,
            karta: newEntry.tolandi?.karta || 0,
          },
          qoldiq,
          qoldiq_avans, // NEW FIELD
          lastUpdated: new Date().toISOString(),
        };
        await addKirim(entry);
        setNewEntry({
          xodim: "",
          oldingiOylardan: { oylarSoni: 0, summasi: 0 },
          tolandi: { jami: 0, naqd: 0, prechisleniya: 0, karta: 0 },
          qoldiq_avans: 0, // RESET NEW FIELD
        });
        setIsAddModalOpen(false);
      } catch (error) {
        console.error("Error adding entry:", error);
        alert("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
      }
    }
  };

  const updateEntry = async (updatedEntry: KirimData) => {
    try {
      const jamiQarzDorlik = calculateJamiQarzDorlik(
        updatedEntry.oldingiOylardan.summasi,
        updatedEntry.birOylikHisoblanganSumma,
      );
      const tolandiJami = calculateTolandiJami(
        updatedEntry.tolandi.naqd,
        updatedEntry.tolandi.prechisleniya,
        updatedEntry.tolandi.karta,
      );
      
      // CALCULATE BOTH FIELDS
      const { qoldiq, qoldiq_avans } = calculateQoldiqAndAvans(jamiQarzDorlik, tolandiJami);
      
      const finalEntry = {
        ...updatedEntry,
        jamiQarzDorlik,
        tolandi: {
          ...updatedEntry.tolandi,
          jami: tolandiJami,
        },
        qoldiq,
        qoldiq_avans, // NEW FIELD
        lastUpdated: new Date().toISOString(),
      };
      
      await updateKirim(updatedEntry.id, finalEntry);
      setEditingItem(null);
    } catch (error) {
      console.error("Error updating entry:", error);
      alert("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    }
  };

  const deleteEntry = async (id: number) => {
    try {
      await deleteKirim(id);
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    }
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      filial: "Barcha filiallar",
      advanced: "all",
      startDate: "",
      endDate: "",
    });
  };

  const totals = filteredData.reduce(
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
      qoldiq_avans: acc.qoldiq_avans + row.qoldiq_avans, // NEW TOTAL
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
      qoldiq_avans: 0, // NEW TOTAL
    },
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ma'lumotlar yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Kirimlar boshqaruvi</h1>
          <p className="text-gray-600">Barcha kirimlar va to'lovlarni boshqaring</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={downloadCSV} variant="outline" className="flex items-center gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Yangi yozuv
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Yangi yozuv qo'shish</DialogTitle>
                <p className="text-sm text-gray-600">
                  Ma'lumotlarni kiriting (Jami qarzdorlik va Qoldiq avtomatik hisoblanadi)
                </p>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <Label htmlFor="korxonaNomi">Korxona nomi</Label>
                  <Input
                    id="korxonaNomi"
                    value={newEntry.korxonaNomi || ""}
                    onChange={(e) => setNewEntry({ ...newEntry, korxonaNomi: e.target.value })}
                    placeholder="Korxona nomi"
                  />
                </div>
                <div>
                  <Label htmlFor="inn">INN</Label>
                  <Input
                    id="inn"
                    value={newEntry.inn || ""}
                    onChange={(e) => setNewEntry({ ...newEntry, inn: e.target.value })}
                    placeholder="INN"
                  />
                </div>
                <div>
                  <Label htmlFor="telRaqami">Tel raqami</Label>
                  <Input
                    id="telRaqami"
                    value={newEntry.telRaqami || ""}
                    onChange={(e) => setNewEntry({ ...newEntry, telRaqami: e.target.value })}
                    placeholder="Tel raqami"
                  />
                </div>
                <div>
                  <Label htmlFor="ismi">Ismi</Label>
                  <Input
                    id="ismi"
                    value={newEntry.ismi || ""}
                    onChange={(e) => setNewEntry({ ...newEntry, ismi: e.target.value })}
                    placeholder="Ism Familiya"
                  />
                </div>
                <div>
                  <Label htmlFor="xizmatTuri">Xizmat turi</Label>
                  <Input
                    id="xizmatTuri"
                    value={newEntry.xizmatTuri || ""}
                    onChange={(e) => setNewEntry({ ...newEntry, xizmatTuri: e.target.value })}
                    placeholder="Xizmat turi"
                  />
                </div>
                <div>
                  <Label htmlFor="filialNomi">Filial nomi</Label>
                  <Select
                    value={newEntry.filialNomi || "Zarkent filiali"}
                    onValueChange={(value) => setNewEntry({ ...newEntry, filialNomi: value })}
                  >
                    <SelectTrigger id="filialNomi">
                      <SelectValue placeholder="Filialni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {filialOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="xodim">Xodim</Label>
                  <Input
                    id="xodim"
                    value={newEntry.xodim || ""}
                    onChange={(e) => setNewEntry({ ...newEntry, xodim: e.target.value })}
                    placeholder="Ism Familiya"
                  />
                </div>
                <div>
                  <Label htmlFor="oylarSoni">Oldingi oylardan oylar soni</Label>
                  <Input
                    id="oylarSoni"
                    type="number"
                    value={newEntry.oldingiOylardan?.oylarSoni || 0}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        oldingiOylardan: {
                          ...newEntry.oldingiOylardan,
                          oylarSoni: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    placeholder="Oylar soni"
                  />
                </div>
                <div>
                  <Label htmlFor="summasi">Oldingi oylardan summasi</Label>
                  <Input
                    id="summasi"
                    value={formatNumber(newEntry.oldingiOylardan?.summasi) || ""}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        oldingiOylardan: {
                          ...newEntry.oldingiOylardan,
                          summasi: parseNumber(e.target.value),
                        },
                      })
                    }
                    placeholder="Summasi"
                  />
                </div>
                <div>
                  <Label htmlFor="birOylikHisoblanganSumma">Bir oylik hisoblangan summa</Label>
                  <Input
                    id="birOylikHisoblanganSumma"
                    value={formatNumber(newEntry.birOylikHisoblanganSumma) || ""}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        birOylikHisoblanganSumma: parseNumber(e.target.value),
                      })
                    }
                    placeholder="Bir oylik summa"
                  />
                </div>
                <div>
                  <Label htmlFor="naqd">Naqd</Label>
                  <Input
                    id="naqd"
                    value={formatNumber(newEntry.tolandi?.naqd) || ""}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        tolandi: { ...newEntry.tolandi, naqd: parseNumber(e.target.value) },
                      })
                    }
                    placeholder="Naqd"
                  />
                </div>
                <div>
                  <Label htmlFor="prechisleniya">Prechisleniya</Label>
                  <Input
                    id="prechisleniya"
                    value={formatNumber(newEntry.tolandi?.prechisleniya) || ""}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        tolandi: { ...newEntry.tolandi, prechisleniya: parseNumber(e.target.value) },
                      })
                    }
                    placeholder="Prechisleniya"
                  />
                </div>
                <div>
                  <Label htmlFor="karta">Karta</Label>
                  <Input
                    id="karta"
                    value={formatNumber(newEntry.tolandi?.karta) || ""}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        tolandi: { ...newEntry.tolandi, karta: parseNumber(e.target.value) },
                      })
                    }
                    placeholder="Karta"
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
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Korxona, INN, ism yoki xodim bo'yicha qidirish..."
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
          />
        </div>
        <Select
          value={filters.filial}
          onValueChange={(value) => setFilters({ ...filters, filial: value })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filialni tanlang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Barcha filiallar">Barcha filiallar</SelectItem>
            {filialOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.advanced}
          onValueChange={(value) => setFilters({ ...filters, advanced: value })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Holatni tanlang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="paid">To'langan</SelectItem>
            <SelectItem value="unpaid">To'lanmagan</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          className="w-40"
        />
        <Input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="w-40"
        />
        <Button variant="outline" onClick={clearFilters}>
          Tozalash
        </Button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium">Jami hisobot jadvali ({filteredData.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">№</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
                  Korxona nomi
                </th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">INN</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
                  Tel raqami
                </th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">Ismi</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
                  Xizmat turi
                </th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
                  Filial nomi
                </th>
                <th className="px-3 py-3 text-left text-sm font-medium text-purple-700 border-r border-gray-200">
                  Xodim
                </th>
                <th
                  className="px-3 py-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200"
                  colSpan={2}
                >
                  Oldingi oylardan qoldiq
                </th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
                  Bir oylik hisoblangan summa
                </th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
                  Jami qarzdorlik
                </th>
                <th
                  className="px-3 py-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200"
                  colSpan={4}
                >
                  To'landi
                </th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
                  Qoldiq
                </th>
                <th className="px-3 py-3 text-left text-sm font-medium text-blue-600 border-r border-gray-200">
                  Qoldiq avans
                </th>
                <th className="px-3 py-3 text-center text-sm font-medium text-gray-700">Amallar</th>
              </tr>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-3 py-2 border-r border-gray-200"></th>
                <th className="px-3 py-2 border-r border-gray-200"></th>
                <th className="px-3 py-2 border-r border-gray-200"></th>
                <th className="px-3 py-2 border-r border-gray-200"></th>
                <th className="px-3 py-2 border-r border-gray-200"></th>
                <th className="px-3 py-2 border-r border-gray-200"></th>
                <th className="px-3 py-2 border-r border-gray-200"></th>
                <th className="px-3 py-2 border-r border-gray-200"></th>
                <th className="px-2 py-2 text-xs text-gray-600 border-r border-gray-200">Oylar soni</th>
                <th className="px-2 py-2 text-xs text-gray-600 border-r border-gray-200">Summasi</th>
                <th className="px-3 py-2 border-r border-gray-200"></th>
                <th className="px-3 py-2 border-r border-gray-200"></th>
                <th className="px-2 py-2 text-xs text-gray-600 border-r border-gray-200">Jami</th>
                <th className="px-2 py-2 text-xs text-gray-600 border-r border-gray-200">Naqd</th>
                <th className="px-2 py-2 text-xs text-gray-600 border-r border-gray-200">Prechisleniya</th>
                <th className="px-2 py-2 text-xs text-gray-600 border-r border-gray-200">Karta</th>
                <th className="px-3 py-2 border-r border-gray-200"></th>
                <th className="px-3 py-2 border-r border-gray-200"></th>
                <th className="px-3 py-2"></th>
              </tr>
              <tr className="border-b-2 border-gray-300 bg-gray-100 font-medium">
                <td className="px-3 py-3 text-sm border-r border-gray-200" colSpan={8}>
                  Jami ko'rsatkichlar:
                </td>
                <td className="px-3 py-3 text-sm text-right text-blue-600 border-r border-gray-200">
                  {totals.oylarSoni}
                </td>
                <td className="px-3 py-3 text-sm text-right text-green-600 border-r border-gray-200">
                  {formatNumber(totals.summasi)}
                </td>
                <td className="px-3 py-3 text-sm text-right text-purple-600 border-r border-gray-200">
                  {formatNumber(totals.birOylikHisoblanganSumma)}
                </td>
                <td className="px-3 py-3 text-sm text-right text-green-600 border-r border-gray-200">
                  {formatNumber(totals.jamiQarzDorlik)}
                </td>
                <td className="px-3 py-3 text-sm text-right border-r border-gray-200">{formatNumber(totals.jami)}</td>
                <td className="px-3 py-3 text-sm text-right border-r border-gray-200">{formatNumber(totals.naqd)}</td>
                <td className="px-3 py-3 text-sm text-right border-r border-gray-200">
                  {formatNumber(totals.prechisleniya)}
                </td>
                <td className="px-3 py-3 text-sm text-right border-r border-gray-200">{formatNumber(totals.karta)}</td>
                <td className="px-3 py-3 text-sm text-right text-red-600 border-r border-gray-200">
                  {formatNumber(totals.qoldiq)}
                </td>
                <td className="px-3 py-3 text-sm text-right text-blue-600 border-r border-gray-200">
                  {formatNumber(totals.qoldiq_avans)}
                </td>
                <td className="px-3 py-3"></td>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    row.oldingiOylardan.summasi > 1 ? "bg-red-300" : ""
                  }`}
                >
                  <td className="px-3 py-3 text-sm text-gray-900 border-r border-gray-200">{index + 1}</td>
                  <td className="px-3 py-3 text-sm text-gray-900 font-medium border-r border-gray-200">
                    {row.korxonaNomi}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-700 border-r border-gray-200">{row.inn}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 border-r border-gray-200">{row.telRaqami}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 border-r border-gray-200">{row.ismi}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 border-r border-gray-200">{row.xizmatTuri}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 border-r border-gray-200">{row.filialNomi}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 border-r border-gray-200">{row.xodim}</td>
                  <td className="px-3 py-3 text-sm text-right text-gray-700 border-r border-gray-200">
                    {row.oldingiOylardan.oylarSoni}
                  </td>
                  <td className="px-3 py-3 text-sm text-right text-gray-700 border-r border-gray-200">
                    {formatNumber(row.oldingiOylardan.summasi)}
                  </td>
                  <td className="px-3 py-3 text-sm text-right text-gray-700 border-r border-gray-200">
                    {formatNumber(row.birOylikHisoblanganSumma)}
                  </td>
                  <td className="px-3 py-3 text-sm text-right text-green-600 border-r border-gray-200">
                    {formatNumber(row.jamiQarzDorlik)}
                  </td>
                  <td className="px-3 py-3 text-sm text-right text-gray-700 border-r border-gray-200">
                    {formatNumber(row.tolandi.jami)}
                  </td>
                  <td className="px-3 py-3 text-sm text-right text-gray-700 border-r border-gray-200">
                    {formatNumber(row.tolandi.naqd)}
                  </td>
                  <td className="px-3 py-3 text-sm text-right text-gray-700 border-r border-gray-200">
                    {formatNumber(row.tolandi.prechisleniya)}
                  </td>
                  <td className="px-3 py-3 text-sm text-right text-gray-700 border-r border-gray-200">
                    {formatNumber(row.tolandi.karta)}
                  </td>
                  <td className="px-3 py-3 text-sm text-right text-red-600 border-r border-gray-200">
                    {formatNumber(row.qoldiq)}
                  </td>
                  <td className="px-3 py-3 text-sm text-right text-blue-600 border-r border-gray-200">
                    {formatNumber(row.qoldiq_avans)}
                  </td>
                  <td className="px-3 py-3 text-center">
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
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yozuvni tahrirlash</DialogTitle>
              <p className="text-sm text-gray-600">
                Ma'lumotlarni yangila (Jami qarzdorlik va Qoldiq avtomatik hisoblanadi)
              </p>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="edit-korxonaNomi">Korxona nomi</Label>
                <Input
                  id="edit-korxonaNomi"
                  value={editingItem.korxonaNomi}
                  onChange={(e) => setEditingItem({ ...editingItem, korxonaNomi: e.target.value })}
                  placeholder="Korxona nomi"
                />
              </div>
              <div>
                <Label htmlFor="edit-inn">INN</Label>
                <Input
                  id="edit-inn"
                  value={editingItem.inn}
                  onChange={(e) => setEditingItem({ ...editingItem, inn: e.target.value })}
                  placeholder="INN"
                />
              </div>
              <div>
                <Label htmlFor="edit-telRaqami">Tel raqami</Label>
                <Input
                  id="edit-telRaqami"
                  value={editingItem.telRaqami}
                  onChange={(e) => setEditingItem({ ...editingItem, telRaqami: e.target.value })}
                  placeholder="Tel raqami"
                />
              </div>
              <div>
                <Label htmlFor="edit-ismi">Ismi</Label>
                <Input
                  id="edit-ismi"
                  value={editingItem.ismi}
                  onChange={(e) => setEditingItem({ ...editingItem, ismi: e.target.value })}
                  placeholder="Ism Familiya"
                />
              </div>
              <div>
                <Label htmlFor="edit-xizmatTuri">Xizmat turi</Label>
                <Input
                  id="edit-xizmatTuri"
                  value={editingItem.xizmatTuri}
                  onChange={(e) => setEditingItem({ ...editingItem, xizmatTuri: e.target.value })}
                  placeholder="Xizmat turi"
                />
              </div>
              <div>
                <Label htmlFor="edit-filialNomi">Filial nomi</Label>
                <Select
                  value={editingItem.filialNomi}
                  onValueChange={(value) => setEditingItem({ ...editingItem, filialNomi: value })}
                >
                  <SelectTrigger id="edit-filialNomi">
                    <SelectValue placeholder="Filialni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {filialOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-xodim">Xodim</Label>
                <Input
                  id="edit-xodim"
                  value={editingItem.xodim}
                  onChange={(e) => setEditingItem({ ...editingItem, xodim: e.target.value })}
                  placeholder="Ism Familiya"
                />
              </div>
              <div>
                <Label htmlFor="edit-oylarSoni">Oldingi oylardan oylar soni</Label>
                <Input
                  id="edit-oylarSoni"
                  type="number"
                  value={editingItem.oldingiOylardan.oylarSoni}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      oldingiOylardan: {
                        ...editingItem.oldingiOylardan,
                        oylarSoni: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  placeholder="Oylar soni"
                />
              </div>
              <div>
                <Label htmlFor="edit-summasi">Oldingi oylardan summasi</Label>
                <Input
                  id="edit-summasi"
                  value={formatNumber(editingItem.oldingiOylardan.summasi) || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      oldingiOylardan: {
                        ...editingItem.oldingiOylardan,
                        summasi: parseNumber(e.target.value),
                      },
                    })
                  }
                  placeholder="Summasi"
                />
              </div>
              <div>
                <Label htmlFor="edit-birOylikHisoblanganSumma">Bir oylik hisoblangan summa</Label>
                <Input
                  id="edit-birOylikHisoblanganSumma"
                  value={formatNumber(editingItem.birOylikHisoblanganSumma) || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      birOylikHisoblanganSumma: parseNumber(e.target.value),
                    })
                  }
                  placeholder="Bir oylik summa"
                />
              </div>
              <div>
                <Label htmlFor="edit-naqd">Naqd</Label>
                <Input
                  id="edit-naqd"
                  value={formatNumber(editingItem.tolandi.naqd) || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      tolandi: { ...editingItem.tolandi, naqd: parseNumber(e.target.value) },
                    })
                  }
                  placeholder="Naqd"
                />
              </div>
              <div>
                <Label htmlFor="edit-prechisleniya">Prechisleniya</Label>
                <Input
                  id="edit-prechisleniya"
                  value={formatNumber(editingItem.tolandi.prechisleniya) || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      tolandi: { ...editingItem.tolandi, prechisleniya: parseNumber(e.target.value) },
                    })
                  }
                  placeholder="Prechisleniya"
                />
              </div>
              <div>
                <Label htmlFor="edit-karta">Karta</Label>
                <Input
                  id="edit-karta"
                  value={formatNumber(editingItem.tolandi.karta) || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      tolandi: { ...editingItem.tolandi, karta: parseNumber(e.target.value) },
                    })
                  }
                  placeholder="Karta"
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
  );
}
