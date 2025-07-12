const TableSkeleton = ({ rows = 5, cols = 5 }) => (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm animate-pulse">
        <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                    {[...Array(cols)].map((_, i) => (
                        <th key={i} className="px-6 py-4 text-left">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {[...Array(rows)].map((_, rowIndex) => (
                    <tr key={rowIndex}>
                        {[...Array(cols)].map((_, colIndex) => (
                            <td key={colIndex} className="px-6 py-4">
                                <div className="h-4 bg-gray-200 rounded"></div>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default TableSkeleton;