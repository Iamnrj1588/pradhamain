const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#8B1538]/20 border-t-[#8B1538] rounded-full animate-spin"></div>
        <p className="text-[#8B1538] font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default Loader;