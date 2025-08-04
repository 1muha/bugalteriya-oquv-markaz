"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Bell, Plus, Edit, Trash2, X } from "lucide-react"
import { useNotifications } from "@/contexts/notification-context"

export default function NotificationManager() {
  const {
    notifications,
    activeNotifications,
    addNotification,
    updateNotification,
    deleteNotification,
    dismissNotification,
  } = useNotifications()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [editingNotification, setEditingNotification] = useState<any>(null)
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    date: "",
    isRecurring: true,
    frequency: "monthly" as "monthly" | "yearly" | "weekly",
    isActive: true,
  })

  const addNewNotification = () => {
    if (newNotification.title && newNotification.message && newNotification.date) {
      addNotification(newNotification)
      setNewNotification({
        title: "",
        message: "",
        date: "",
        isRecurring: true,
        frequency: "monthly",
        isActive: true,
      })
      setIsAddModalOpen(false)
    }
  }

  const updateExistingNotification = () => {
    if (editingNotification) {
      updateNotification(editingNotification.id, editingNotification)
      setEditingNotification(null)
    }
  }

  return (
    <>
      {/* Active Notifications Display */}
      {activeNotifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {activeNotifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-orange-100 border border-orange-300 rounded-lg p-4 shadow-lg max-w-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-orange-800">{notification.title}</h4>
                  <p className="text-sm text-orange-700 mt-1">{notification.message}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => dismissNotification(notification.id)}
                  className="h-6 w-6 p-0 text-orange-600 hover:bg-orange-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notification Bell with Count */}
      <div className="relative">
        <Button variant="ghost" size="sm" onClick={() => setIsManageModalOpen(true)} className="relative p-2">
          <Bell className="h-5 w-5" />
          {activeNotifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {activeNotifications.length}
            </span>
          )}
        </Button>

        {/* Manage Notifications Modal */}
        <Dialog open={isManageModalOpen} onOpenChange={setIsManageModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Bildirishnomalarni boshqarish</DialogTitle>
              <div className="flex justify-end">
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gray-900 hover:bg-gray-800 text-white flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Yangi bildirishnoma
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yangi bildirishnoma qo'shish</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="title">Sarlavha</Label>
                        <Input
                          id="title"
                          value={newNotification.title}
                          onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                          placeholder="Ijara to'lovi"
                        />
                      </div>
                      <div>
                        <Label htmlFor="message">Xabar</Label>
                        <Input
                          id="message"
                          value={newNotification.message}
                          onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                          placeholder="Ijara pulini to'lashni unutmang"
                        />
                      </div>
                      <div>
                        <Label htmlFor="date">Sana</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newNotification.date}
                          onChange={(e) => setNewNotification({ ...newNotification, date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="frequency">Takrorlash</Label>
                        <Select
                          value={newNotification.frequency}
                          onValueChange={(value: "monthly" | "yearly" | "weekly") =>
                            setNewNotification({ ...newNotification, frequency: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Har oy</SelectItem>
                            <SelectItem value="weekly">Har hafta</SelectItem>
                            <SelectItem value="yearly">Har yil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                        Bekor qilish
                      </Button>
                      <Button onClick={addNewNotification} className="bg-gray-900 hover:bg-gray-800 text-white">
                        Saqlash
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </DialogHeader>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div key={notification.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {notification.date} •{" "}
                        {notification.frequency === "monthly"
                          ? "Har oy"
                          : notification.frequency === "weekly"
                            ? "Har hafta"
                            : "Har yil"}{" "}
                        •{notification.isActive ? " Faol" : " Nofaol"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingNotification(notification)}
                        className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Notification Modal */}
        {editingNotification && (
          <Dialog open={!!editingNotification} onOpenChange={() => setEditingNotification(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bildirishnomani tahrirlash</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="edit-title">Sarlavha</Label>
                  <Input
                    id="edit-title"
                    value={editingNotification.title}
                    onChange={(e) => setEditingNotification({ ...editingNotification, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-message">Xabar</Label>
                  <Input
                    id="edit-message"
                    value={editingNotification.message}
                    onChange={(e) => setEditingNotification({ ...editingNotification, message: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-date">Sana</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingNotification.date}
                    onChange={(e) => setEditingNotification({ ...editingNotification, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-frequency">Takrorlash</Label>
                  <Select
                    value={editingNotification.frequency}
                    onValueChange={(value: "monthly" | "yearly" | "weekly") =>
                      setEditingNotification({ ...editingNotification, frequency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Har oy</SelectItem>
                      <SelectItem value="weekly">Har hafta</SelectItem>
                      <SelectItem value="yearly">Har yil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-active"
                    checked={editingNotification.isActive}
                    onChange={(e) => setEditingNotification({ ...editingNotification, isActive: e.target.checked })}
                  />
                  <Label htmlFor="edit-active">Faol</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingNotification(null)}>
                  Bekor qilish
                </Button>
                <Button onClick={updateExistingNotification} className="bg-gray-900 hover:bg-gray-800 text-white">
                  Saqlash
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  )
}
