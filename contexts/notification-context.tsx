"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Notification {
  id: number
  title: string
  message: string
  date: string
  isRecurring: boolean
  frequency: "monthly" | "yearly" | "weekly"
  isActive: boolean
  createdAt: string
}

interface NotificationContextType {
  notifications: Notification[]
  activeNotifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void
  updateNotification: (id: number, notification: Partial<Notification>) => void
  deleteNotification: (id: number) => void
  dismissNotification: (id: number) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Ijara to'lovi",
      message: "Ijara pulini to'lashni unutmang",
      date: "2024-02-01",
      isRecurring: true,
      frequency: "monthly",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Kommunal xizmatlar",
      message: "Kommunal xizmatlar uchun to'lov qiling",
      date: "2024-02-01",
      isRecurring: true,
      frequency: "monthly",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ])

  const [activeNotifications, setActiveNotifications] = useState<Notification[]>([])

  // Check for notifications that should be shown
  useEffect(() => {
    const checkNotifications = () => {
      const today = new Date()
      const todayStr = today.toISOString().split("T")[0]

      const shouldShow = notifications.filter((notification) => {
        if (!notification.isActive) return false

        const notificationDate = new Date(notification.date)

        if (notification.isRecurring) {
          if (notification.frequency === "monthly") {
            // Show on the same day each month
            return today.getDate() === notificationDate.getDate()
          } else if (notification.frequency === "yearly") {
            // Show on the same date each year
            return today.getDate() === notificationDate.getDate() && today.getMonth() === notificationDate.getMonth()
          } else if (notification.frequency === "weekly") {
            // Show on the same day of week
            return today.getDay() === notificationDate.getDay()
          }
        } else {
          // One-time notification
          return todayStr === notification.date
        }
        return false
      })

      setActiveNotifications(shouldShow)
    }

    checkNotifications()
    // Check every hour
    const interval = setInterval(checkNotifications, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [notifications])

  const addNotification = (notification: Omit<Notification, "id" | "createdAt">) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.max(...notifications.map((n) => n.id), 0) + 1,
      createdAt: new Date().toISOString(),
    }
    setNotifications([...notifications, newNotification])
  }

  const updateNotification = (id: number, updatedNotification: Partial<Notification>) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, ...updatedNotification } : n)))
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const dismissNotification = (id: number) => {
    setActiveNotifications(activeNotifications.filter((n) => n.id !== id))
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        activeNotifications,
        addNotification,
        updateNotification,
        deleteNotification,
        dismissNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
