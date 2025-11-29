"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { formatAddress } from "@/lib/web3/ethereum"
import { connectMetaMask, getCurrentAccount } from "@/lib/web3/ethereum"
import { Settings, Users, TrendingUp, Gift, BarChart3, Plus, Edit, Trash2, Save } from "lucide-react"

interface Task {
  id: string
  type: string
  title: string
  description: string
  points: number
  active: boolean
  created_at: string
}

interface Stats {
  users: { total: number; active: number }
  points: { total: number }
  activity: { rituals: number; spins: number; referrals: number }
}

export default function AdminPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"stats" | "tasks" | "users">("stats")
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [newTask, setNewTask] = useState<Partial<Task>>({})
  const router = useRouter()

  useEffect(() => {
    checkWallet()
  }, [])

  const checkWallet = async () => {
    try {
      const stored = localStorage.getItem("kabbalah_wallet")
      if (stored) {
        const { address } = JSON.parse(stored)
        setWalletAddress(address)
        await verifyAdmin(address)
      } else {
        router.push("/")
      }
    } catch {
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }

  const verifyAdmin = async (address: string) => {
    try {
      const res = await fetch(`/api/admin/stats?wallet=${address}`)
      const data = await res.json()

      if (!data.success && data.error === "Unauthorized") {
        router.push("/")
      } else if (data.success) {
        loadStats(address)
        loadTasks(address)
      }
    } catch (error) {
      console.error("[Admin] Verification error:", error)
      router.push("/")
    }
  }

  const loadStats = async (wallet: string) => {
    try {
      const res = await fetch(`/api/admin/stats?wallet=${wallet}`)
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error("[Admin] Error loading stats:", error)
    }
  }

  const loadTasks = async (wallet: string) => {
    try {
      const res = await fetch(`/api/admin/tasks?wallet=${wallet}`)
      const data = await res.json()
      if (data.success) {
        setTasks(data.data)
      }
    } catch (error) {
      console.error("[Admin] Error loading tasks:", error)
    }
  }

  const handleConnect = async () => {
    try {
      const { address } = await connectMetaMask()
      setWalletAddress(address)
      localStorage.setItem(
        "kabbalah_wallet",
        JSON.stringify({
          address,
          connectedAt: Date.now(),
        }),
      )
      await verifyAdmin(address)
    } catch (error) {
      console.error("[Admin] Connection error:", error)
    }
  }

  const handleSaveTask = async (task: Task) => {
    if (!walletAddress) return

    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: walletAddress, task }),
      })

      const data = await res.json()
      if (data.success) {
        setEditingTask(null)
        loadTasks(walletAddress)
      }
    } catch (error) {
      console.error("[Admin] Error saving task:", error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!walletAddress || !confirm("Are you sure you want to delete this task?")) return

    try {
      const res = await fetch(`/api/admin/tasks?wallet=${walletAddress}&taskId=${taskId}`, {
        method: "DELETE",
      })

      const data = await res.json()
      if (data.success) {
        loadTasks(walletAddress)
      }
    } catch (error) {
      console.error("[Admin] Error deleting task:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#FF9500] text-xl">Loading...</div>
      </div>
    )
  }

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <button
          onClick={handleConnect}
          className="px-8 py-4 bg-[#FF9500] text-black font-bold text-lg hover:bg-[#FFB340] transition-colors"
        >
          Connect MetaMask
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#FF9500]">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-white/50">{formatAddress(walletAddress)}</span>
            <button
              onClick={() => {
                localStorage.removeItem("kabbalah_wallet")
                router.push("/")
              }}
              className="px-4 py-2 border border-[#FF9500] text-[#FF9500] hover:bg-[#FF9500]/10 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-[#FF9500]/30">
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "stats"
                ? "border-b-2 border-[#FF9500] text-[#FF9500]"
                : "text-white/50 hover:text-white"
            }`}
          >
            <BarChart3 className="inline w-5 h-5 mr-2" />
            Statistics
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "tasks"
                ? "border-b-2 border-[#FF9500] text-[#FF9500]"
                : "text-white/50 hover:text-white"
            }`}
          >
            <Gift className="inline w-5 h-5 mr-2" />
            Tasks
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "users"
                ? "border-b-2 border-[#FF9500] text-[#FF9500]"
                : "text-white/50 hover:text-white"
            }`}
          >
            <Users className="inline w-5 h-5 mr-2" />
            Users
          </button>
        </div>

        {/* Stats Tab */}
        {activeTab === "stats" && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-[#FF9500]/30 bg-[#0a0a0a]">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-[#FF9500]" />
                <h3 className="text-xl font-bold">Users</h3>
              </div>
              <div className="text-3xl font-bold text-[#FF9500] mb-2">{stats.users.total}</div>
              <div className="text-white/50">Total users</div>
              <div className="text-lg text-white/70 mt-2">{stats.users.active} active (7 days)</div>
            </div>

            <div className="p-6 border border-[#FF9500]/30 bg-[#0a0a0a]">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-[#FF9500]" />
                <h3 className="text-xl font-bold">Points</h3>
              </div>
              <div className="text-3xl font-bold text-[#FF9500] mb-2">
                {stats.points.total.toLocaleString()}
              </div>
              <div className="text-white/50">Total points distributed</div>
            </div>

            <div className="p-6 border border-[#FF9500]/30 bg-[#0a0a0a]">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="w-6 h-6 text-[#FF9500]" />
                <h3 className="text-xl font-bold">Activity</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/50">Rituals:</span>
                  <span className="text-[#FF9500] font-bold">{stats.activity.rituals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Spins:</span>
                  <span className="text-[#FF9500] font-bold">{stats.activity.spins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Referrals:</span>
                  <span className="text-[#FF9500] font-bold">{stats.activity.referrals}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Tasks</h2>
              <button
                onClick={() => setNewTask({})}
                className="px-4 py-2 bg-[#FF9500] text-black font-bold hover:bg-[#FFB340] transition"
              >
                <Plus className="inline w-4 h-4 mr-2" />
                New Task
              </button>
            </div>

            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="p-6 border border-[#FF9500]/30 bg-[#0a0a0a]">
                  {editingTask === task.id ? (
                    <TaskEditForm
                      task={task}
                      onSave={(updated) => {
                        handleSaveTask(updated)
                        setEditingTask(null)
                      }}
                      onCancel={() => setEditingTask(null)}
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-[#FF9500]">{task.title}</h3>
                        <p className="text-white/70 mt-1">{task.description}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-white/50">Type: {task.type}</span>
                          <span className="text-[#FF9500]">Points: {task.points}</span>
                          <span className={task.active ? "text-green-500" : "text-red-500"}>
                            {task.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingTask(task.id)}
                          className="p-2 border border-[#FF9500] text-[#FF9500] hover:bg-[#FF9500]/10 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 border border-red-500 text-red-500 hover:bg-red-500/10 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="p-6 border border-[#FF9500]/30 bg-[#0a0a0a]">
            <h2 className="text-2xl font-bold mb-4">User Management</h2>
            <p className="text-white/50">User management interface coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
}

function TaskEditForm({
  task,
  onSave,
  onCancel,
}: {
  task: Task
  onSave: (task: Task) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Task>(task)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-white/50 mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 bg-black border border-[#FF9500]/30 text-white focus:border-[#FF9500] focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm text-white/50 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 bg-black border border-[#FF9500]/30 text-white focus:border-[#FF9500] focus:outline-none"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/50 mb-1">Points</label>
          <input
            type="number"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: Number.parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-black border border-[#FF9500]/30 text-white focus:border-[#FF9500] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-white/50 mb-1">Active</label>
          <select
            value={formData.active ? "true" : "false"}
            onChange={(e) => setFormData({ ...formData, active: e.target.value === "true" })}
            className="w-full px-4 py-2 bg-black border border-[#FF9500]/30 text-white focus:border-[#FF9500] focus:outline-none"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave(formData)}
          className="px-4 py-2 bg-[#FF9500] text-black font-bold hover:bg-[#FFB340] transition flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-[#FF9500] text-[#FF9500] hover:bg-[#FF9500]/10 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}


