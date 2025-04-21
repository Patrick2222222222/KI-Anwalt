// pages/admin/users.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminSidebar from '../../components/AdminSidebar';
import styles from '../../styles/Admin.module.css';
import userStyles from '../../styles/AdminUsers.module.css';

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Fetch users data
    async function fetchUsers() {
      try {
        // In a real implementation, this would be an API call
        // For demo purposes, we'll use mock data
        const mockUsers = [
          { id: 1, firstName: 'Max', lastName: 'Mustermann', email: 'max@example.com', role: 'user', status: 'active', registeredDate: '2025-03-15', cases: 3 },
          { id: 2, firstName: 'Anna', lastName: 'Schmidt', email: 'anna@example.com', role: 'lawyer', status: 'active', registeredDate: '2025-03-10', cases: 12 },
          { id: 3, firstName: 'Thomas', lastName: 'Müller', email: 'thomas@example.com', role: 'user', status: 'inactive', registeredDate: '2025-02-28', cases: 1 },
          { id: 4, firstName: 'Laura', lastName: 'Weber', email: 'laura@example.com', role: 'user', status: 'active', registeredDate: '2025-03-05', cases: 5 },
          { id: 5, firstName: 'Michael', lastName: 'Schneider', email: 'michael@example.com', role: 'lawyer', status: 'active', registeredDate: '2025-02-20', cases: 8 },
          { id: 6, firstName: 'Sarah', lastName: 'Fischer', email: 'sarah@example.com', role: 'user', status: 'active', registeredDate: '2025-03-18', cases: 2 },
          { id: 7, firstName: 'David', lastName: 'Wagner', email: 'david@example.com', role: 'admin', status: 'active', registeredDate: '2025-01-15', cases: 0 },
          { id: 8, firstName: 'Julia', lastName: 'Becker', email: 'julia@example.com', role: 'user', status: 'inactive', registeredDate: '2025-02-10', cases: 0 },
          { id: 9, firstName: 'Markus', lastName: 'Hoffmann', email: 'markus@example.com', role: 'lawyer', status: 'active', registeredDate: '2025-03-01', cases: 15 },
          { id: 10, firstName: 'Lisa', lastName: 'Meyer', email: 'lisa@example.com', role: 'user', status: 'active', registeredDate: '2025-03-12', cases: 4 },
        ];
        
        setUsers(mockUsers);
        setTotalPages(Math.ceil(mockUsers.length / 10));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Filter and search users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'active' && user.status === 'active') ||
      (filter === 'inactive' && user.status === 'inactive') ||
      (filter === 'user' && user.role === 'user') ||
      (filter === 'lawyer' && user.role === 'lawyer') ||
      (filter === 'admin' && user.role === 'admin');
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const indexOfLastUser = currentPage * 10;
  const indexOfFirstUser = indexOfLastUser - 10;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  if (loading) {
    return (
      <div className={styles.adminLayout}>
        <Head>
          <title>Benutzer verwalten | lawmaster24.com</title>
          <link 
            rel="stylesheet" 
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" 
            integrity="sha512-Fo3rlrZj/k7ujTnHg4CGR2D7kSs0v4LLanw2qksYuRlEzO+tcaEPQogQ0KaoGN26/zrn20ImR1DfuLWnOo7aBA==" 
            crossOrigin="anonymous" 
            referrerPolicy="no-referrer" 
          />
        </Head>
        
        <AdminSidebar />
        
        <main className={styles.adminMain}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Benutzer werden geladen...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.adminLayout}>
      <Head>
        <title>Benutzer verwalten | lawmaster24.com</title>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" 
          integrity="sha512-Fo3rlrZj/k7ujTnHg4CGR2D7kSs0v4LLanw2qksYuRlEzO+tcaEPQogQ0KaoGN26/zrn20ImR1DfuLWnOo7aBA==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
      </Head>
      
      <AdminSidebar />
      
      <main className={styles.adminMain}>
        <div className={styles.adminHeader}>
          <h1>Benutzer verwalten</h1>
          <div className={styles.adminActions}>
            <button className={userStyles.addUserButton} onClick={() => router.push('/admin/users/add')}>
              <i className="fas fa-user-plus"></i> Benutzer hinzufügen
            </button>
          </div>
        </div>
        
        <div className={userStyles.userControls}>
          <div className={userStyles.searchFilter}>
            <div className={userStyles.searchBox}>
              <input 
                type="text" 
                placeholder="Suchen..." 
                value={searchTerm}
                onChange={handleSearch}
              />
              <i className="fas fa-search"></i>
            </div>
            
            <div className={userStyles.filterBox}>
              <select value={filter} onChange={handleFilterChange}>
                <option value="all">Alle Benutzer</option>
                <option value="active">Aktive Benutzer</option>
                <option value="inactive">Inaktive Benutzer</option>
                <option value="user">Nur Nutzer</option>
                <option value="lawyer">Nur Anwälte</option>
                <option value="admin">Nur Administratoren</option>
              </select>
            </div>
          </div>
          
          <div className={userStyles.userStats}>
            <div className={userStyles.statItem}>
              <span className={userStyles.statValue}>{users.length}</span>
              <span className={userStyles.statLabel}>Gesamt</span>
            </div>
            <div className={userStyles.statItem}>
              <span className={userStyles.statValue}>{users.filter(u => u.status === 'active').length}</span>
              <span className={userStyles.statLabel}>Aktiv</span>
            </div>
            <div className={userStyles.statItem}>
              <span className={userStyles.statValue}>{users.filter(u => u.role === 'user').length}</span>
              <span className={userStyles.statLabel}>Nutzer</span>
            </div>
            <div className={userStyles.statItem}>
              <span className={userStyles.statValue}>{users.filter(u => u.role === 'lawyer').length}</span>
              <span className={userStyles.statLabel}>Anwälte</span>
            </div>
          </div>
        </div>
        
        <div className={userStyles.userTable}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>E-Mail</th>
                <th>Rolle</th>
                <th>Status</th>
                <th>Registriert am</th>
                <th>Fälle</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`${userStyles.roleTag} ${userStyles[user.role]}`}>
                      {user.role === 'user' ? 'Nutzer' : user.role === 'lawyer' ? 'Anwalt' : 'Admin'}
                    </span>
                  </td>
                  <td>
                    <span className={`${userStyles.statusTag} ${userStyles[user.status]}`}>
                      {user.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td>{user.registeredDate}</td>
                  <td>{user.cases}</td>
                  <td>
                    <div className={userStyles.actionButtons}>
                      <button className={userStyles.editButton} onClick={() => router.push(`/admin/users/edit/${user.id}`)}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className={userStyles.viewButton} onClick={() => router.push(`/admin/users/${user.id}`)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className={userStyles.deleteButton} onClick={() => confirm('Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?')}>
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {currentUsers.length === 0 && (
                <tr>
                  <td colSpan="8" className={userStyles.noResults}>
                    Keine Benutzer gefunden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length > 10 && (
          <div className={userStyles.pagination}>
            <button 
              className={userStyles.pageButton} 
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                className={`${userStyles.pageButton} ${currentPage === page ? userStyles.activePage : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            
            <button 
              className={userStyles.pageButton} 
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
