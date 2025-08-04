"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import KirimModule from "@/components/kirim-module"
import ChiqimModule from "@/components/chiqim-module"
import BalansModule from "@/components/balans-module"
import NotificationManager from "@/components/notification-manager"
import { FileText } from "lucide-react"
import { AccountingProvider } from "@/contexts/accounting-context"
import { NotificationProvider } from "@/contexts/notification-context"

export default function AccountingService() {
  return (
    <NotificationProvider>
      <AccountingProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-2 rounded">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">Buxgalteriya Xizmatlari</h1>
                    <p className="text-sm text-gray-600">Professional hisobotlar xizmatlari</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <NotificationManager />
                  <button className="text-gray-600 hover:text-gray-900">Yangilash</button>
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                    A
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-6 py-6">
            <Tabs defaultValue="kirim" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-white rounded-lg border border-gray-200">
                <TabsTrigger
                  value="kirim"
                  className="text-base font-medium py-3 px-6 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900"
                >
                  Kirim
                </TabsTrigger>
                <TabsTrigger
                  value="chiqim"
                  className="text-base font-medium py-3 px-6 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900"
                >
                  Chiqim
                </TabsTrigger>
                <TabsTrigger
                  value="balans"
                  className="text-base font-medium py-3 px-6 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900"
                >
                  Balans
                </TabsTrigger>
              </TabsList>

              <TabsContent value="kirim">
                <KirimModule />
              </TabsContent>

              <TabsContent value="chiqim">
                <ChiqimModule />
              </TabsContent>

              <TabsContent value="balans">
                <BalansModule />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </AccountingProvider>
    </NotificationProvider>
  )
}
