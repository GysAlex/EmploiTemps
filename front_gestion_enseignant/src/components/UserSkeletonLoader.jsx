export function UserSkeletonLoader ({ count = 5, isMobile = false })  {
    // Skeleton pour la vue mobile (cartes)
    if (isMobile) {
        return (
            <>
                {Array.from({ length: count }).map((_, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 animate-pulse">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </>
        );
    }

    // Skeleton pour la vue desktop (tableau)
    return (
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
                {Array.from({ length: count }).map((_, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150 animate-pulse">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200"></div>
                                <div className="ml-4">
                                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-40 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                                <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                                <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
