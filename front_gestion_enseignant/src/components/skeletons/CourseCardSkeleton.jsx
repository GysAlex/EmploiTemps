const CourseCardSkeleton = () => (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 animate-pulse">
        <div className="flex items-start space-x-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                    <div className="h-5 bg-gray-200 rounded w-2/3"></div> {/* Course Name */}
                    <div className="flex space-x-2">
                        <div className="h-5 w-5 bg-gray-200 rounded-full"></div> {/* Eye icon */}
                        <div className="h-5 w-5 bg-gray-200 rounded-full"></div> {/* Edit icon */}
                        <div className="h-5 w-5 bg-gray-200 rounded-full"></div> {/* Delete icon */}
                    </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div> {/* Description line 1 */}
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div> {/* Description line 2 */}
                <div className="flex items-center justify-between mt-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div> {/* Teacher Name */}
                    <div className="h-6 bg-gray-200 rounded-full w-1/4"></div> {/* Level tag */}
                </div>
            </div>
        </div>
    </div>
);

export default CourseCardSkeleton;