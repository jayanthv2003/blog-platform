import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FiTrash2 } from 'react-icons/fi';
import adminService from '../services/adminService';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import useAuth from '../hooks/useAuth';
import useDebounce from '../hooks/useDebounce';
import { formatDate } from '../utils/format';

const ManageUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({ pages: 1 });
  const debouncedSearch = useDebounce(search, 400);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ search: debouncedSearch, page });
      setUsers(res.users);
      setPageInfo(res);
    } catch (error) {
      toast.error('Could not load users');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleToggle = async (targetUser) => {
    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      await adminService.updateUser(targetUser._id, { role: nextRole });
      toast.success(`${targetUser.name} is now ${nextRole === 'admin' ? 'an admin' : 'a regular user'}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update role');
    }
  };

  const handleActiveToggle = async (targetUser) => {
    try {
      await adminService.updateUser(targetUser._id, { isActive: !targetUser.isActive });
      toast.success(targetUser.isActive ? 'User deactivated' : 'User reactivated');
      fetchUsers();
    } catch (error) {
      toast.error('Could not update user');
    }
  };

  const handleDelete = async (targetUser) => {
    if (!window.confirm(`Permanently delete ${targetUser.name}'s account?`)) return;
    try {
      await adminService.deleteUser(targetUser._id);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete user');
    }
  };

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        placeholder="Search by name or email…"
        className="mb-5 w-full max-w-sm rounded-full border border-line bg-transparent px-4 py-2 text-sm text-ink outline-none focus-visible:outline-2 dark:border-line-dark dark:text-paper"
      />

      {loading ? (
        <Loader label="Loading users" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line dark:border-line-dark">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-ink/[0.03] text-xs uppercase text-slate dark:border-line-dark dark:bg-paper/5">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line dark:divide-line-dark">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink dark:text-paper">{u.name}</p>
                    <p className="text-xs text-slate">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRoleToggle(u)}
                      disabled={u._id === currentUser?._id}
                      className="rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-medium capitalize text-ink hover:bg-ink/10 disabled:opacity-40 dark:bg-paper/10 dark:text-paper"
                    >
                      {u.role}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleActiveToggle(u)}
                      disabled={u._id === currentUser?._id}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium disabled:opacity-40 ${
                        u.isActive ? 'bg-moss-light text-moss' : 'bg-rust/10 text-rust'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(u)}
                      disabled={u._id === currentUser?._id}
                      className="rounded-full p-1.5 text-ink/60 hover:bg-rust/10 hover:text-rust disabled:opacity-30 dark:text-paper/60"
                      aria-label="Delete user"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} pages={pageInfo.pages} onChange={setPage} />
    </div>
  );
};

export default ManageUsers;
