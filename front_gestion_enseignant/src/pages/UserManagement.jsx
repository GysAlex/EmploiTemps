import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useManageUser } from '../hooks/useManageUser';
import { useModal } from '../hooks/useModal';
import { UserManagementModal } from '../components/modals/UserManagementModal' ; // Assurez-vous du chemin correct de votre modal
import { UserSkeletonLoader } from '../components/UserSkeletonLoader'; // Importation du nouveau composant Skeleton Loader

export default function UserManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('Tous les rôles');

    // Récupération des données et fonctions du hook useManageUser
    const { users, loading, error, fetchUsers, deleteUser } = useManageUser();
    const { openModal } = useModal();

    const totalUsers = users.length;

    useEffect(() => {
        fetchUsers();
    }, []);

    const adminCount = users.filter(user =>
        user.roles?.some(roleObject =>
            roleObject.name === 'super_admin' || roleObject.name === 'admin'
        )
    ).length;

    const teacherCount = users.filter(user =>
        user.roles?.some(roleObject =>
            roleObject.name === 'enseignant'
        )
    ).length;

    // Filtres disponibles (ajustés pour correspondre aux rôles de votre backend)
    const filters = ['Tous les rôles', 'super_admin', 'admin', 'enseignant'];

    // Filtrage des utilisateurs
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesFilter = activeFilter === 'Tous les rôles' ||
                          (user.roles && user.roles.some(roleObject => roleObject.name === activeFilter));

        return matchesSearch && matchesFilter;
    });

    // Style pour chaque rôle (adapté à vos rôles backend)
    const getRoleStyle = (role) => {
        switch(role) {
            case 'super_admin':
                return 'bg-purple-100 text-purple-800 border border-purple-200';
            case 'admin':
                return 'bg-blue-100 text-blue-800 border border-blue-200';
            case 'enseignant':
                return 'bg-green-100 text-green-800 border border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    // Fonction pour ouvrir la modal en mode création
    const handleCreateUser = () => {
        openModal(UserManagementModal, {userData: null } ); // Re-fetch après fermeture
    };

    // Fonction pour ouvrir la modal en mode mise à jour
    const handleEditUser = (user) => {
        openModal(UserManagementModal, {userData: user} ); // Re-fetch après fermeture
    };

    // Fonction pour gérer la suppression d'un utilisateur
    const handleDeleteUser = async (userId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
            await deleteUser(userId);
            // Après la suppression, re-fetcher les utilisateurs pour rafraîchir la liste
        }
    };

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen text-red-600 text-lg">
                Erreur : Impossible de charger les utilisateurs.
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="my-2 text-md text-[#0694A2] flex flex-col gap-3 items-stretch justify-center">
                <Link to={-1} className='flex items-center w-fit rounded-2xl gap-2 px-3 py-2 text-white bg-[#0694A2] '>
                    <i className="fa-solid fa-arrow-left"></i>retour
                </Link>
                <span>gestion des utilisateurs</span>
            </div>

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
                                {/* Affiche le nombre réel ou un placeholder si en chargement */}
                                <p className="text-3xl font-bold text-teal-600">
                                    {loading ? <span className="h-8 w-16 bg-gray-200 rounded animate-pulse"></span> : totalUsers}
                                </p>
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
                                <p className="text-3xl font-bold text-blue-600">
                                    {loading ? <span className="h-8 w-16 bg-gray-200 rounded animate-pulse"></span> : adminCount}
                                </p>
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
                                <p className="text-3xl font-bold text-green-600">
                                    {loading ? <span className="h-8 w-16 bg-gray-200 rounded animate-pulse"></span> : teacherCount}
                                </p>
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
                              
                                    placeholder="Rechercher par email, nom ou téléphone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block text-sm w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    disabled={loading} // Désactive la recherche pendant le chargement initial
                                />
                            </div>

                            {/* Bouton d'ajout */}
                            <button
                                onClick={handleCreateUser}
                                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition-colors duration-200 w-full lg:w-auto justify-center"
                                disabled={loading} // Désactive le bouton pendant le chargement
                            >
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
                                        disabled={loading} // Désactive les filtres pendant le chargement
                                    >
                                        {filter.replace('_', ' ').charAt(0).toUpperCase() + filter.replace('_', ' ').slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Vue mobile - Cartes */}
                    <div className="block md:hidden">
                        <div className="space-y-4 p-4">
                            {loading ? (
                                <UserSkeletonLoader count={3} isMobile={true} /> // Affiche 3 cartes skeleton pour mobile
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <div key={user.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                <img
                                                    className="h-12 w-12 rounded-full object-cover"
                                                    src={user.photo || `https://ui-avatars.com/api/?name=${user.name}&background=E0F2F7&color=0694A2&bold=true`}
                                                    alt={user.name}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="text-sm font-medium text-gray-900 truncate">
                                                        {user.name}
                                                    </h3>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEditUser(user)}
                                                            className="text-teal-600 hover:text-teal-900 transition-colors duration-150"
                                                        >
                                                            <i className="fas fa-edit text-sm"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="text-red-600 hover:text-red-900 transition-colors duration-150"
                                                        >
                                                            <i className="fas fa-trash text-sm"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2 truncate">
                                                    {user.email}
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles && user.roles.map((roleObject) => ( // Renommé 'role' en 'roleObject' pour plus de clarté
                                                        <span
                                                            key={roleObject.id} // Utilisez l'ID de l'objet rôle comme clé unique
                                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleStyle(roleObject.name)}`} // Passez roleObject.name à getRoleStyle
                                                        >
                                                            {roleObject.name.replace('_', ' ').charAt(0).toUpperCase() + roleObject.name.replace('_', ' ').slice(1)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-8">Aucun utilisateur trouvé.</p>
                            )}
                        </div>
                    </div>

                    {/* Vue desktop - Tableau */}
                    <div className="hidden md:block">
                        <div className="overflow-x-auto">
                            {loading ? (
                                <UserSkeletonLoader count={5} isMobile={false} /> // Affiche 5 lignes skeleton pour desktop
                            ) : filteredUsers.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                UTILISATEUR
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                CONTACT
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                RÔLES
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
                                                                src={user.photo || `https://ui-avatars.com/api/?name=${user.name}&background=E0F2F7&color=0694A2&bold=true`}
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
                                                    <div className="text-sm text-gray-500">{user.phone}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                  <div className="flex flex-wrap gap-1">
                                                      {user.roles && user.roles.map((roleObject) => ( // Renommé 'role' en 'roleObject' pour plus de clarté
                                                          <span
                                                              key={roleObject.id} // Utilisez l'ID de l'objet rôle comme clé unique
                                                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleStyle(roleObject.name)}`} // Passez roleObject.name à getRoleStyle
                                                          >
                                                              {roleObject.name.replace('_', ' ').charAt(0).toUpperCase() + roleObject.name.replace('_', ' ').slice(1)}
                                                          </span>
                                                      ))}
                                                  </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-3">
                                                        <button
                                                            onClick={() => handleEditUser(user)}
                                                            className="text-teal-600 hover:text-teal-900 transition-colors duration-150"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="text-red-600 hover:text-red-900 transition-colors duration-150"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center text-gray-500 py-8">Aucun utilisateur trouvé.</p>
                            )}
                        </div>
                    </div>

                    {/* Pagination - Gardé tel quel, mais nécessitera une implémentation backend réelle */}
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                                Affichage de 1 à {filteredUsers.length} sur {users.length} utilisateurs
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