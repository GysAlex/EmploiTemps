// src/pages/Courses.jsx
import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useModal } from "../hooks/useModal";
import { CourseManagementModal } from "../components/modals/CourseManagementModal";
import { useCourses } from "../hooks/useCourses";

// Import skeleton components
import CardSkeleton from "../components/skeletons/CardSkeleton";
import TableSkeleton from "../components/skeletons/TableSkeleton";
import CourseCardSkeleton from "../components/skeletons/CourseCardSkeleton";

const Courses = () => {
    const { openModal } = useModal();
    const { courses, deleteCourse, loading, error, fetchCourses } = useCourses();

    console.log("Bonjour tout le monde, voici les cours:", courses);

    const [search, setSearch] = useState("");
    const [levelFilter, setLevelFilter] = useState("Tous les niveaux");
    const [teacherFilter, setTeacherFilter] = useState("Tous les enseignants");

    // Recharger les cours si une erreur se produit (optionnel, selon la stratégie de gestion d'erreur)
    useEffect(() => {
        if (error) {
            console.error("Erreur détectée dans Courses component:", error);
        }
    }, [error]);

    const getLevelColorClass = (level) => {
        switch (level) {
            case "Niveau 1": return "bg-blue-100 text-blue-700";
            case "Niveau 2": return "bg-green-100 text-green-700";
            case "Niveau 3": return "bg-purple-100 text-purple-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const filteredCourses = useMemo(() => {
        // We now filter even if loading/error, but the display will be skeletons if loading
        // or an error message if error, so this change is minor for this context.
        // It's still good practice to not perform heavy filtering if data is not ready.
        let currentCourses = courses;

        if (search) {
            currentCourses = currentCourses.filter((course) => {
                const searchLower = search.toLowerCase();
                const teacherName = course.user ? course.user.name : ''; // Changed from course.teacher to course.user
                return (
                    course.name.toLowerCase().includes(searchLower) ||
                    (course.description && course.description.toLowerCase().includes(searchLower)) || // Add check for description
                    teacherName.toLowerCase().includes(searchLower)
                );
            });
        }

        if (levelFilter !== "Tous les niveaux") {
            currentCourses = currentCourses.filter(course => course.level === levelFilter);
        }

        if (teacherFilter !== "Tous les enseignants") {
            currentCourses = currentCourses.filter(course => course.user && course.user.name === teacherFilter); // Changed from course.teacher to course.user
        }

        return currentCourses;
    }, [search, levelFilter, teacherFilter, courses]);

    const uniqueTeachers = useMemo(() => {
        const teachersMap = new Map();
        courses.forEach(course => {
            if (course.user) { // Use course.user for consistency
                teachersMap.set(course.user.id, course.user.name);
            }
        });
        return Array.from(teachersMap, ([id, name]) => ({ id, name }));
    }, [courses]);


    // Statistiques (basées sur les données complètes, pas les filtrées)
    const totalCourses = courses.length;
    const level1Courses = courses.filter(c => c.level === "Niveau 1").length;
    const level2Courses = courses.filter(c => c.level === "Niveau 2").length;
    const level3Courses = courses.filter(c => c.level === "Niveau 3").length;
    const totalTeachersAssigned = uniqueTeachers.length;

    // Gestion de l'ouverture des modales
    const handleAddCourse = () => {
        openModal(CourseManagementModal);
    };

    const handleEditCourse = (course) => {
        openModal(CourseManagementModal, {courseData: course});
    };

    const handleDeleteCourse = async (courseId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) {
            await deleteCourse(courseId);
        }
    };

    // If there's an error, display the error message.
    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-red-600">
                <p className="text-xl">Erreur lors du chargement des cours.</p>
                <button onClick={fetchCourses} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md">
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 min-h-screen">
            {/* ——— Header ——— */}
            <div className="my-2 text-md text-[#0694A2] flex flex-col gap-3 items-strech justify-center">
                <Link to={-1} className='flex items-center w-fit rounded-2xl gap-2 px-3 py-2 text-white bg-[#0694A2]'>
                    <i className="fa-solid fa-arrow-left"></i>retour
                </Link>
                <span>gestion des cours</span>
            </div>

            {/* ——— Cards statistiques ——— */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                ) : (
                    <>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Nombre total de cours</p>
                                    <p className="text-2xl font-bold text-teal-600">{totalCourses}</p>
                                    <p className="text-sm text-gray-500">cours enregistrés</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Répartition par niveau</p>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span>Niveau 1</span>
                                        <span className="font-medium text-teal-600">{level1Courses} cours</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Niveau 2</span>
                                        <span className="font-medium text-teal-600">{level2Courses} cours</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Niveau 3</span>
                                        <span className="font-medium text-teal-600">{level3Courses} cours</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Enseignants assignés</p>
                                    <p className="text-2xl font-bold text-teal-600">{totalTeachersAssigned}</p>
                                    <p className="text-sm text-gray-500">enseignants</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ——— Outils (Recherche / Filtres / Actions) ——— */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Bloc gauche */}
                <div className="flex flex-col sm:flex-row flex-1 items-start sm:items-center gap-4">

                    {/* Barre de recherche */}
                    <div className="relative flex-1 max-w-md">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                            <i className="fas fa-search"></i>
                        </span>
                        <input
                            type="text"
                            placeholder="Rechercher un cours..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>

                    {/* Filtres */}
                    <div className="flex flex-wrap gap-2">
                        <select
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                            className="text-sm bg-white border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option>Tous les niveaux</option>
                            {CourseManagementModal.getAvailableLevels().map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                        <select
                            value={teacherFilter}
                            onChange={(e) => setTeacherFilter(e.target.value)}
                            className="text-sm border bg-white border-gray-300 rounded-md px-3 py-2"
                        >
                            <option>Tous les enseignants</option>
                            {uniqueTeachers.map(teacher => (
                                <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Bloc actions */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => {
                            setSearch("");
                            setLevelFilter("Tous les niveaux");
                            setTeacherFilter("Tous les enseignants");
                        }}
                        className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 inline-flex items-center gap-2"
                    >
                        <i className="fas fa-redo"></i> Réinitialiser
                    </button>
                    <button
                        onClick={handleAddCourse}
                        className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-md hover:bg-teal-700 inline-flex items-center gap-2"
                    >
                        <i className="fas fa-plus"></i> Ajouter un cours
                    </button>
                </div>
            </div>

            {/* ——— Vue mobile (cartes) ——— */}
            <div className="block lg:hidden">
                <div className="space-y-4">
                    {loading ? (
                        <>
                            <CourseCardSkeleton /><CourseCardSkeleton /><CourseCardSkeleton />
                            {/* Render multiple skeletons if needed */}
                        </>
                    ) : filteredCourses.length === 0 ? (
                        <p className="text-center text-gray-500 text-sm">Aucun cours trouvé.</p>
                    ) : (
                        filteredCourses.map((course) => (
                            <div key={course.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                {course.name}
                                            </h3>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => { /* Logique pour voir un cours, si nécessaire */ }}
                                                    className="text-teal-600 hover:text-teal-900 transition-colors duration-150"
                                                    title="Voir"
                                                >
                                                    <i className="fas fa-eye text-sm"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleEditCourse(course)}
                                                    className="text-teal-600 hover:text-teal-900 transition-colors duration-150"
                                                    title="Modifier"
                                                >
                                                    <i className="fas fa-edit text-sm"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCourse(course.id)}
                                                    className="text-red-600 hover:text-red-900 transition-colors duration-150"
                                                    title="Supprimer"
                                                >
                                                    <i className="fas fa-trash text-sm"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                            {course.description ? (
                                                <>
                                                    {course.description.substring(0, 70)}
                                                    {course.description.length > 70 ? '...' : ''}
                                                </>
                                            ) : (
                                                'Aucune description'
                                            )}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">
                                                {course.user ? course.user.name : 'N/A'}
                                            </span>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColorClass(course.level)}`}>
                                                {course.level}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ——— Vue desktop (tableau) ——— */}
            <div className="hidden lg:block overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                {loading ? (
                    <TableSkeleton rows={5} cols={5} /> // Adjust rows/cols as needed
                ) : (
                    <table className="min-w-full text-sm divide-y divide-gray-200">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 text-left">Nom du cours</th>
                                <th className="px-6 py-4 text-left">Description</th>
                                <th className="px-6 py-4 text-left">Enseignant</th>
                                <th className="px-6 py-4 text-left">Niveau</th>
                                <th className="px-6 py-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCourses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                                        Aucun cours trouvé.
                                    </td>
                                </tr>
                            ) : (
                                filteredCourses.map((course) => (
                                    <tr key={course.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            {course.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <div className="max-w-xs truncate" title={course.description}>
                                                {course.description ? (
                                                    <>
                                                        {course.description.substring(0, 70)}
                                                        {course.description.length > 70 ? '...' : ''}
                                                    </>
                                                ) : (
                                                    'Aucune description'
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                            {course.user ? course.user.name : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColorClass(course.level)}`}>
                                                {course.level}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-4 text-gray-600">
                                                <button
                                                    onClick={() => { /* Logique pour voir un cours, si nécessaire */ }}
                                                    title="Voir"
                                                    className="hover:text-teal-600"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleEditCourse(course)}
                                                    title="Modifier"
                                                    className="hover:text-cyan-700"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCourse(course.id)}
                                                    title="Supprimer"
                                                    className="hover:text-red-700"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ——— Pagination ——— */}
            <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg flex items-center justify-between text-sm text-gray-700">
                {loading ? (
                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                ) : (
                    <span>
                        Affichage de 1 à {filteredCourses.length} sur {totalCourses} résultats
                    </span>
                )}
                <div className="flex gap-2">
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-500 bg-white hover:bg-gray-50" disabled>
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <span className="px-3 py-1 bg-teal-600 text-white rounded-md">1</span>
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-500 bg-white hover:bg-gray-50" disabled>
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

CourseManagementModal.getAvailableLevels = () => ["Niveau 1", "Niveau 2", "Niveau 3"];

export default Courses;