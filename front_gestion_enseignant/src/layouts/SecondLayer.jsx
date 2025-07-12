import { NavLink, Outlet, Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import React, { useState, useRef, useEffect } from 'react';
import { useUser } from "../hooks/useUser";

export function SecondLayer() {
    const { logout, state, setUser, setUserState } = useAuth();

    const { user, loading } = useUser(); 

    console.log("Données utilisateur dans SecondLayer:", user);

    const handleLogout = async () => {
        await logout();
        setUserState(false);
        setUser(null)
    };

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeItem, setActiveItem] = useState('dashboard');
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    const menuItems = [
        { id: 'dashboard', to: '', label: 'Tableau de bord', icon: 'fas fa-chart-pie', active: true },
        { id: 'promotions', to: 'promotions', label: 'Promotions', icon: 'fas fa-users' },
        { id: 'teachers', to: 'teachers', label: 'Enseignants', icon: 'fas fa-chalkboard-teacher' },
        { id: 'courses', to: 'courses', label: 'Cours', icon: 'fas fa-book' },
        { id: 'schedule', to: 'schedules', label: 'Emplois du temps', icon: 'fas fa-clock' },
        { id: 'admins', to: 'admins', label: 'Utilisateurs', icon: 'fas fa-user-cog' },
        { id: 'classrooms', to: 'classrooms', label: 'Salles de classe', icon: 'fas fa-door-open' },
        { id: 'settings', to: 'settings', label: 'Paramètres', icon: 'fas fa-cog' },
    ];

    const location = useLocation();

    useEffect(() => {
        // Mettre à jour l'élément actif en fonction de l'URL actuelle
        const currentPath = location.pathname.split('/').pop(); // Récupérer la dernière partie de l'URL
        const activeMenuItem = menuItems.find(item => item.to === currentPath);
        if (activeMenuItem) {
            setActiveItem(activeMenuItem.id);
        } else {
            setActiveItem('dashboard'); // Par défaut, si aucun élément ne correspond
        }
    },[location.pathname]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleMenuClick = (itemId) => {
        setActiveItem(itemId);
    };

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    // Fermer le menu utilisateur si on clique ailleurs
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

    // --- Composant Skeleton pour le profil utilisateur ---
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

    // --- Composant Spinner pour le chargement initial de la page ---
    const FullPageSpinner = () => (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <svg className="animate-spin h-10 w-10 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    );

    // Première vérification : le statut d'authentification du hook useAuth
    // Si state est undefined, cela signifie que useAuth n'a pas encore déterminé l'état d'authentification.
    // On affiche un spinner pleine page.
    if (state === undefined) {
        return <FullPageSpinner />;
    }

    // Deuxième vérification : si l'utilisateur n'est pas authentifié (state est false)
    if (state === false) {
        return <Navigate to="/login" />;
    }

    // Troisième vérification : le chargement des données utilisateur du hook useUser
    // Si useAuth a confirmé l'authentification (state est true), mais les données 'user' sont toujours en chargement.
    if (loading) {
        // Optionnel: Vous pourriez rendre un squelette complet de la mise en page
        // ou simplement un spinner centralisé si la sidebar et la navbar sont statiques.
        // Pour cet exemple, nous allons rendre la structure principale et y intégrer le squelette pour les parties dynamiques.
        return (
            <div className="flex h-screen bg-gray-50">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

                {/* Sidebar (peut être rendue statiquement si elle ne dépend pas de user data) */}
                <div className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:static lg:inset-0
                `}>
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <i className="fas fa-chart-pie text-[#0694A2]"></i>
                            Admin Panel
                        </h1>
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            <i className="fas fa-times text-[#9CA3AF]"></i>
                        </button>
                    </div>

                    <nav className="mt-6 px-3">
                        {menuItems.map((item) => {
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

                {/* Main Content (inclut la navbar avec skeleton) */}
                <div className="flex-1 flex flex-col lg:ml-0">
                    {/* Navbar avec UserProfileSkeleton */}
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

                            {/* Afficher le squelette du profil utilisateur ici */}
                            <UserProfileSkeleton />
                        </div>
                    </header>

                    {/* Zone de contenu principale - Spinner centralisé ou un squelette plus grand */}
                    <main className="flex-1 flex justify-center items-center overflow-auto p-6">
                        <FullPageSpinner /> {/* Ou un squelette plus spécifique au contenu principal */}
                    </main>
                </div>
            </div>
        );
    }

    // Quand 'state' est true ET 'loading' est false, les données utilisateur sont prêtes
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Font Awesome CDN */}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:inset-0
            `}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <i className="fas fa-chart-pie text-[#0694A2]"></i>
                        Admin Panel
                    </h1>
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <i className="fas fa-times text-[#9CA3AF]"></i>
                    </button>
                </div>

                <nav className="mt-6 px-3">
                    {menuItems.map((item) => {
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

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-0 ">
                {/* Navbar */}
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

                        {/* Menu utilisateur avec dropdown (maintenant que user est chargé) */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={toggleUserMenu}
                                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                            >
                                {/* user est garanti d'être non-null ici */}
                                <img
                                    src={user.profile_image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                                    alt="Avatar"
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-medium text-gray-800">{user.name}</p>
                                    <p className="text-xs text-[#9CA3AF]">{user.roles ? user.roles[0].replace('_', ' ').charAt(0).toUpperCase() + user.roles[0].replace('_', ' ').slice(1) : 'admin'}</p>
                                </div>
                                <i className={`fas fa-chevron-down text-[#9CA3AF] text-xs transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}></i>
                            </button>

                            {/* Dropdown Menu */}
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