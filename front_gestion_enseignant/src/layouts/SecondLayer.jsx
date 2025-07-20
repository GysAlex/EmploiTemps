import { NavLink, Outlet, Link, Navigate, useLocation } from "react-router-dom"
import { useAuth } from '../hooks/useAuth'
import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useUser } from "../hooks/useUser"
import { formatImageUrl } from "../utils/imageUtils" // Importez la fonction utilitaire

export function SecondLayer() {
    const { logout, state, setUser, setUserState } = useAuth()
    const { user, loading } = useUser();
    const location = useLocation();

    console.log("Données utilisateur dans SecondLayer:", user)

    const handleLogout = async () => {
        await logout()
        setUserState(false)
        setUser(null)
    };

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeItem, setActiveItem] = useState('dashboard');
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    // État pour gérer la redirection en cas d'accès non autorisé
    const [redirectTo, setRedirectTo] = useState(null);

    // Définir tous les éléments de menu possibles avec leurs rôles associés
    const allMenuItems = useMemo(() => [
        { id: 'dashboard', to: '', label: 'Tableau de bord', icon: 'fas fa-chart-pie', roles: ['admin', 'super_admin'] }, // Les enseignants peuvent aussi voir le tableau de bord
        { id: 'promotions', to: 'promotions', label: 'Promotions', icon: 'fas fa-users', roles: ['admin', 'super_admin'] },
        { id: 'courses', to: 'courses', label: 'Cours', icon: 'fas fa-book', roles: ['admin', 'super_admin'] },
        { id: 'schedules', to: 'schedules', label: 'Emplois du temps', icon: 'fas fa-clock', roles: ['admin', 'super_admin'] },
        // Nouvel élément de menu pour les enseignants
        { id: 'planning', to: 'my-schedule', label: 'Mon Planning', icon: 'fas fa-calendar-alt', roles: ['enseignant'] },
        { id: 'admins', to: 'admins', label: 'Utilisateurs', icon: 'fas fa-user-cog', roles: ['admin', 'super_admin'] },
        { id: 'classrooms', to: 'classrooms', label: 'Salles de classe', icon: 'fas fa-door-open', roles: ['admin', 'super_admin'] },
        { id: 'profile', to: 'profile', label: 'Profil', icon: 'fas fa-user', roles: ['admin', 'super_admin', 'enseignant'] }, // Le profil est accessible à tous
    ], []);

    // Filtrer les éléments de menu en fonction des rôles de l'utilisateur
    const filteredMenuItems = useMemo(() => {
        if (!user || !user.roles) {
            return [];
        }

        // Utilise directement user.roles car c'est déjà un tableau de noms de rôles (chaînes)
        const userRoles = user.roles;

        return allMenuItems.filter(item => {
            return item.roles && item.roles.some(role => userRoles.includes(role));
        });
    }, [user, allMenuItems]);

    // Effet pour gérer l'autorisation des routes
    // useEffect(() => {
    //     if (!loading && user) { // S'exécute seulement après que les données utilisateur sont chargées
    //         const currentPathSegment = location.pathname.split('/').pop();
    //         // Normaliser le chemin : la route racine '' correspond à 'dashboard' pour la logique de rôle
    //         const targetPath = currentPathSegment === '' ? 'dashboard' : currentPathSegment;

    //         // Trouver l'élément de menu qui correspond au chemin actuel
    //         const currentRouteMenuItem = allMenuItems.find(item => {
    //             // Si l'item.to est vide, cela correspond à la route 'dashboard'
    //             const itemToNormalized = item.to === '' ? 'dashboard' : item.to;
    //             return itemToNormalized === targetPath;
    //         });

    //         // Vérifier si l'utilisateur a accès à ce chemin
    //         // Utilise directement user.roles car c'est déjà un tableau de noms de rôles (chaînes)
    //         const userRoles = user.roles || [];
    //         const hasAccess = currentRouteMenuItem && currentRouteMenuItem.roles.some(role => userRoles.includes(role));

    //         if (!hasAccess) {
    //             // Si l'utilisateur n'a pas accès, rediriger vers la première route accessible
    //             if (filteredMenuItems.length > 0) {
    //                 setRedirectTo('dashboard/' + filteredMenuItems[0].to);
    //             } else {
    //                 // Cas d'urgence : si aucune route n'est accessible (ne devrait pas arriver avec une bonne config)
    //                 setRedirectTo('/unauthorized'); // Ou une page d'erreur générique
    //             }
    //         } else {
    //             setRedirectTo(null); // Effacer toute redirection en attente si l'accès est accordé
    //         }
    //     }
    // }, [user, loading, location.pathname, allMenuItems, filteredMenuItems]); // Dépendances de l'effet

    // Effet pour définir l'élément de menu actif dans la barre latérale
    useEffect(() => {
        const currentPathSegment = location.pathname.split('/').pop();

        const targetPathForActive = currentPathSegment === '' ? 'dashboard' : currentPathSegment;

        const activeMenuItem = filteredMenuItems.find(item => {
            const itemToNormalized = item.to === '' ? 'dashboard' : item.to;
            return itemToNormalized === targetPathForActive;
        });

        if (activeMenuItem) {
            setActiveItem(activeMenuItem.id);
        } else if (filteredMenuItems.length > 0) {
            // Si la route actuelle n'est pas dans les menus filtrés mais que d'autres routes sont accessibles,
            // définir le premier élément comme actif (par exemple après une redirection)
            setActiveItem(filteredMenuItems[0].id);
        } else {
            setActiveItem(''); // Aucun élément actif si aucun menu n'est disponible
        }
    }, [location.pathname, filteredMenuItems]);


    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleMenuClick = (itemId) => {
        setActiveItem(itemId);
    };

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const UserProfileSkeleton = () => (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="hidden sm:block text-left">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
            <i className="fas fa-chevron-down text-[#9CA3AF] text-xs"></i>
        </div>
    );

    const FullPageSpinner = () => (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <svg className="animate-spin h-10 w-10 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    );

    // Gestion des états de chargement et d'authentification
    if (state === undefined || loading) {
        return <FullPageSpinner />;
    }

    if (state === false) {
        return <Navigate to="/login" />;
    }

    // Effectuer la redirection si redirectTo est défini et différent du chemin actuel
    // Utiliser `replace` pour éviter d'ajouter la route non autorisée à l'historique de navigation
    if (redirectTo && redirectTo !== location.pathname.split('/').pop()) {
        return <Navigate to={`/${redirectTo}`} replace />;
    }


    return (
        <div className="flex h-screen bg-gray-50">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:inset-0
            `}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <i className="fas fa-chart-pie text-[#0694A2]"></i>
                        Time Sync
                    </h1>
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <i className="fas fa-times text-[#9CA3AF]"></i>
                    </button>
                </div>

                <nav className="mt-6 px-3">
                    {filteredMenuItems.map((item) => {
                        const isActive = activeItem === item.id;
                        return (
                            <NavLink
                                key={item.id}
                                onClick={() => handleMenuClick(item.id)}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-3 mb-1 text-left rounded-lg transition-all duration-200 ease-in-out group
                                    ${isActive
                                        ? 'bg-[#0694A2]/10 text-[#0694A2] border-r-2 border-[#0694A2]'
                                        : 'text-[#9CA3AF] hover:bg-gray-50 hover:text-gray-800'
                                    }
                                `}
                                to={item.to}
                            >
                                <i className={`
                                    ${item.icon} w-5 text-center transition-colors duration-200
                                    ${isActive ? 'text-[#0694A2]' : 'text-[#9CA3AF] group-hover:text-gray-600'}
                                `}></i>
                                <span className="font-medium">{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-2 h-2 bg-[#0694A2] rounded-full animate-pulse" />
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Overlay pour mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/35 bg-opacity-50 z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Contenu principal */}
            <div className="flex-1 flex flex-col lg:ml-0 ">
                <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            <i className="fas fa-bars text-[#9CA3AF]"></i>
                        </button>

                        <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                            <i className="fas fa-search text-[#9CA3AF]"></i>
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="bg-transparent border-none outline-none text-sm text-gray-600 placeholder-[#9CA3AF] w-64"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <i className="fas fa-bell text-[#9CA3AF]"></i>
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                        </button>

                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={toggleUserMenu}
                                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                            >
                                <img
                                    src={formatImageUrl(user?.profile_image)} // Utilisez la fonction utilitaire ici
                                    alt="Avatar"
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                                    {/* Afficher le premier rôle si disponible, sinon 'Utilisateur' */}
                                    <p className="text-xs text-[#9CA3AF]">{user?.roles && user.roles.length > 0 ? user.roles[0].replace('_', ' ').charAt(0).toUpperCase() + user.roles[0].replace('_', ' ').slice(1) : 'Utilisateur'}</p>
                                </div>
                                <i className={`fas fa-chevron-down text-[#9CA3AF] text-xs transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}></i>
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    <Link
                                        to="profile"
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <i className="fas fa-user text-[#9CA3AF] w-4"></i>
                                        Profil
                                    </Link>
                                    <a
                                        href="#"
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <i className="fas fa-cog text-[#9CA3AF] w-4"></i>
                                        Paramètres
                                    </a>
                                    <hr className="my-2 border-gray-200" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <i className="fas fa-sign-out-alt text-red-500 w-4"></i>
                                        Se déconnecter
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
