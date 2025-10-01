'use client';

import { useState, useEffect } from 'react';
import { UserEditModal } from '@/components/UserEditModal';
import { CreateUserModal } from '@/components/CreateUserModal';
import styles from './page.module.scss';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  plan: 'normal' | 'pro' | 'enterprise';
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'PATCH',
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  const handleDeny = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/deny`, {
        method: 'PATCH',
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Denial failed:', err);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Deletion failed:', err);
    }
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        fetchUsers();
        setShowEditModal(false);
        setSelectedUser(null);
      } else {
        throw new Error('Failed to update user');
      }
    } catch (err) {
      console.error('Update failed:', err);
      throw err;
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        fetchUsers();
        setShowCreateModal(false);
      } else {
        throw new Error('Failed to create user');
      }
    } catch (err) {
      console.error('Create failed:', err);
      throw err;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: styles.pending,
      approved: styles.approved,
      denied: styles.denied,
    };
    return `${styles.statusBadge} ${statusStyles[status as keyof typeof statusStyles]}`;
  };

  const getPlanBadge = (plan: string) => {
    const planStyles = {
      normal: styles.normal,
      pro: styles.pro,
      enterprise: styles.enterprise,
    };
    return `${styles.planBadge} ${planStyles[plan as keyof typeof planStyles]}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Panel</h1>
        <div className={styles.actions}>
          <button 
            className={styles.createButton}
            onClick={() => setShowCreateModal(true)}
          >
            Create User
          </button>
          <button 
            className={styles.refreshButton}
            onClick={fetchUsers}
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchUsers}>Try Again</button>
        </div>
      )}

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h3>Total Users</h3>
          <p className={styles.statNumber}>{users.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Pending</h3>
          <p className={styles.statNumber}>
            {users.filter(u => u.status === 'pending').length}
          </p>
        </div>
        <div className={styles.statCard}>
          <h3>Approved</h3>
          <p className={styles.statNumber}>
            {users.filter(u => u.status === 'approved').length}
          </p>
        </div>
        <div className={styles.statCard}>
          <h3>Denied</h3>
          <p className={styles.statNumber}>
            {users.filter(u => u.status === 'denied').length}
          </p>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className={styles.nameCell}>
                  <div>
                    <div className={styles.name}>{user.name}</div>
                    <div className={styles.phone}>{user.phone}</div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.companyName}</td>
                <td>
                  <span className={getPlanBadge(user.plan)}>
                    {user.plan.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span className={getStatusBadge(user.status)}>
                    {user.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className={styles.actionsCell}>
                  <div className={styles.actionButtons}>
                    {user.status === 'pending' && (
                      <>
                        <button
                          className={styles.approveButton}
                          onClick={() => handleApprove(user.id)}
                        >
                          Approve
                        </button>
                        <button
                          className={styles.denyButton}
                          onClick={() => handleDeny(user.id)}
                        >
                          Deny
                        </button>
                      </>
                    )}
                    <button
                      className={styles.editButton}
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && !loading && (
        <div className={styles.empty}>
          <p>No users found</p>
        </div>
      )}

      <UserEditModal
        user={selectedUser}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
      />

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateUser}
      />
    </div>
  );
}
