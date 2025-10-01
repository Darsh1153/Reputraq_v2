'use client';

import { useState, useEffect } from 'react';
import styles from './UsersList.module.scss';

interface User {
  id: number;
  name: string;
}

export function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading users...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.usersSection}>
      <h2 className={styles.usersTitle}>Users ({users.length})</h2>
      <ul className={styles.usersList}>
        {users.map((user) => (
          <li key={user.id} className={styles.userItem}>
            <span className={styles.userName}>{user.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
