import React from 'react';

// Composant Skeleton Loader pour le tableau des emplois du temps
export function TimetableSkeletonLoader({ count = 5 }) {
    return (
        <>
            {/* Vue Desktop (pour les lignes du tableau) */}
            <div className="hidden lg:block">
                <table className="w-full">
                    <tbody className="divide-y divide-slate-200">
                        {Array.from({ length: count }).map((_, index) => (
                            <tr key={index} className="animate-pulse bg-white">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="h-4 bg-gray-200 rounded w-4"></div> {/* Checkbox placeholder */}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="h-4 bg-gray-200 rounded w-24"></div> {/* Week name */}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="h-4 bg-gray-200 rounded w-20"></div> {/* Level */}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="h-4 bg-gray-200 rounded w-40"></div> {/* Promotion name */}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="h-4 bg-gray-200 rounded w-28"></div> {/* Timetable status */}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex space-x-2">
                                        <div className="h-6 w-6 bg-gray-200 rounded-full"></div> {/* View icon */}
                                        <div className="h-6 w-6 bg-gray-200 rounded-full"></div> {/* Edit icon */}
                                        <div className="h-6 w-20 bg-gray-200 rounded"></div> {/* Button */}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Vue Mobile (pour les cartes) */}
            <div className="block lg:hidden space-y-4 p-4">
                {Array.from({ length: count }).map((_, index) => (
                    <div key={index} className="animate-pulse bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                        <div className="flex items-start space-x-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div> {/* Promotion name */}
                                    <div className="flex space-x-2">
                                        <div className="h-6 w-6 bg-gray-200 rounded-full"></div> {/* View icon */}
                                        <div className="h-6 w-6 bg-gray-200 rounded-full"></div> {/* Edit icon */}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-4 bg-gray-200 rounded w-20"></div> {/* Week name */}
                                    <div className="h-4 bg-gray-200 rounded w-10"></div> {/* Level */}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="h-6 w-28 bg-gray-200 rounded-full"></div> {/* Status */}
                                    <div className="h-6 w-24 bg-gray-200 rounded"></div> {/* Button */}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}