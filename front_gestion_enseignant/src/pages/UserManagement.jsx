import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous les rôles');

  // Données utilisateurs avec noms ajoutés
  const users = [
    {
      id: 1,
      name: 'Jean Dupont',
      email: 'jean.dupont@universite.fr',
      role: 'Administrateur',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Marie Laurent',
      email: 'marie.laurent@universite.fr',
      role: 'Enseignant',
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b047?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Thomas Bernard',
      email: 'thomas.bernard@universite.fr',
      role: 'Enseignant',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 4,
      name: 'Sophie Martin',
      email: 'sophie.martin@universite.fr',
      role: 'Administrateur',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 5,
      name: 'Pierre Dubois',
      email: 'pierre.dubois@universite.fr',
      role: 'Enseignant',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 6,
      name: 'Camille Leroy',
      email: 'camille.leroy@universite.fr',
      role: 'Enseignant',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 7,
      name: 'Lucas Moreau',
      email: 'lucas.moreau@universite.fr',
      role: 'Administrateur',
      photo: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=100&h=100&fit=crop&crop=face'
    }
  ];

  // Calcul des statistiques
  const totalUsers = users.length;
  const adminCount = users.filter(user => user.role === 'Administrateur').length;
  const teacherCount = users.filter(user => user.role === 'Enseignant').length;

  // Filtres disponibles
  const filters = ['Tous les rôles', 'Administrateur', 'Enseignant'];

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'Tous les rôles' || user.role === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Style pour chaque rôle
  const getRoleStyle = (role) => {
    switch(role) {
      case 'Administrateur':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Enseignant':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <div className="min-h-screen">
        <div className="my-2 text-md text-[#0694A2] flex flex-col gap-3 items-strech justify-center">
            <Link to={-1} className='flex items-center w-fit rounded-2xl gap-2 px-3 py-2 text-white bg-[#0694A2] '><i className="fa-solid fa-arrow-left"></i>retour</Link>
            <span>gestion des utilisateurs</span>
        </div>
      {/* Import FontAwesome CSS */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
        integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" 
        crossOrigin="anonymous" 
        referrerPolicy="no-referrer" 
      />
      
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Grille des statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Total utilisateurs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-users text-teal-600 text-xl"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nombre total d'utilisateurs</p>
                <p className="text-3xl font-bold text-teal-600">{totalUsers}</p>
              </div>
            </div>
          </div>

          {/* Administrateurs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-user-shield text-blue-600 text-xl"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nombre d'administrateurs</p>
                <p className="text-3xl font-bold text-blue-600">{adminCount}</p>
              </div>
            </div>
          </div>

          {/* Enseignants */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-chalkboard-teacher text-green-600 text-xl"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nombre d'enseignants</p>
                <p className="text-3xl font-bold text-green-600">{teacherCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section principale */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header avec recherche et bouton d'ajout */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Barre de recherche */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-400"></i>
                </div>
                <input
                  type="text"
                  placeholder="Rechercher par email ou nom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Bouton d'ajout */}
              <button className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition-colors duration-200 w-full lg:w-auto justify-center">
                <i className="fas fa-plus mr-2"></i>
                Ajouter un utilisateur
              </button>
            </div>

            {/* Filtres par boutons */}
            <div className="mt-6">
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      activeFilter === filter
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Vue mobile - Cartes */}
          <div className="block md:hidden">
            <div className="space-y-4 p-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-12 w-12 rounded-full object-cover"
                        src={user.photo}
                        alt={user.name}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </h3>
                        <div className="flex space-x-2">
                          <button className="text-teal-600 hover:text-teal-900 transition-colors duration-150">
                            <i className="fas fa-edit text-sm"></i>
                          </button>
                          <button className="text-red-600 hover:text-red-900 transition-colors duration-150">
                            <i className="fas fa-trash text-sm"></i>
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 truncate">
                        {user.email}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleStyle(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vue desktop - Tableau */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PHOTO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      EMAIL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RÔLE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-full object-cover"
                              src={user.photo}
                              alt={user.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleStyle(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button className="text-teal-600 hover:text-teal-900 transition-colors duration-150">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="text-red-600 hover:text-red-900 transition-colors duration-150">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                Affichage de 1 à {filteredUsers.length} sur {filteredUsers.length} utilisateurs
              </div>
              <div className="flex space-x-2">
                <button 
                  className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
                  disabled
                >
                  Précédent
                </button>
                <button 
                  className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
                  disabled
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}