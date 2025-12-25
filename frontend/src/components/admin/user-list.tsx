import { useState, useEffect } from "react";
import { UserWithDetails } from "@/lib/types";
import { fetchUsers, updateUser, deleteUser } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export function UserList() {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "viewer">("viewer");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: UserWithDetails) => {
    setEditingId(user.id);
    setEditName(user.name);
    setEditRole(user.role);
  };

  const handleSave = async (id: number) => {
    try {
      await updateUser(id, { name: editName, role: editRole });
      setEditingId(null);
      loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  const handleDelete = async (id: number, email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;
    try {
      await deleteUser(id);
      loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400 transition-colors">
        {error}
      </div>
    );
  }

  return (
    <div className="card-base overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-100/80 dark:bg-slate-800/50 transition-colors">
          <tr>
            <th className="table-header">Name</th>
            <th className="table-header">Email</th>
            <th className="table-header">Role</th>
            <th className="table-header">Joined</th>
            <th className="table-header text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {users.map((user) => (
            <tr
              key={user.id}
              className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <td className="px-6 py-4">
                {editingId === user.id ? (
                  <Input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                ) : (
                  <span className="text-slate-900 dark:text-white font-medium">
                    {user.name}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                {user.email}
              </td>
              <td className="px-6 py-4">
                {editingId === user.id ? (
                  <Select
                    value={editRole}
                    onValueChange={(value) =>
                      setEditRole(value as "admin" | "viewer")
                    }
                  >
                    <SelectTrigger className="w-[110px] h-8 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span
                    className={
                      user.role === "admin" ? "badge-admin" : "badge-viewer"
                    }
                  >
                    {user.role}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                {editingId === user.id ? (
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="primary"
                      className="bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-green-500/20"
                      onClick={() => handleSave(user.id)}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-indigo-100 dark:bg-indigo-600/20 hover:bg-indigo-200 dark:hover:bg-indigo-600/40 text-indigo-600 dark:text-indigo-400"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-red-100 dark:bg-red-600/20 hover:bg-red-200 dark:hover:bg-red-600/40 text-red-600 dark:text-red-400"
                      onClick={() => handleDelete(user.id, user.email)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="text-center py-12 text-slate-500">No users found</div>
      )}
    </div>
  );
}
