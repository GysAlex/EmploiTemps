const CardSkeleton = () => (
    <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
        <div className="flex items-center justify-between">
            <div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div> {/* Optional icon placeholder */}
        </div>
    </div>
);

export default CardSkeleton;