
import { useNavigate } from "react-router-dom";
import { sidebarLinks } from "@/components/navigation/AppSidebarLinks";

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#e3f1fa] via-[#f5fafe] to-[#fff]">
      <h1 className="text-4xl font-extrabold mb-4 font-dmsans">Welcome to Mindlyfe</h1>
      <p className="text-xl text-gray-600 mb-8">Your all-in-one mental wellness app.</p>
      <div className="flex flex-wrap gap-4 justify-center">
        {sidebarLinks.map(link => (
          <button key={link.label}
            className="px-8 py-4 rounded-xl bg-primary/90 text-white font-bold shadow-lg text-lg hover:bg-primary mt-2 min-w-[180px]"
            onClick={() => navigate(link.path)}
          >
            {link.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Index;
