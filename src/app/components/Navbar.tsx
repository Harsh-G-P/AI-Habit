"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, BarChart2, LogIn, LogOut, Menu, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const [image, setImage] = useState<string>("");

  const topMenu = [
    { id: "home", label: "Home", icon: <Home size={20} />, href: "/" },
    { id: "insights", label: "Insights", icon: <BarChart2 size={20} />, href: "/insights" },
    { id: "logged", label: "Logged", icon: <BarChart2 size={20} />, href: "/logged" },
  ];

  // Fetch user profile image
  const fetchUserImage = async () => {
    try {
      const res = await fetch("/api/user/update", { method: "GET" });
      const data = await res.json();
      if (data.success) {
        setImage(data.user.image ? `${data.user.image}?t=${Date.now()}` : "");
      }
    } catch (err) {
      console.error("Failed to fetch user image:", err);
    }
  };

  // Run on mount and whenever session changes
  useEffect(() => {
  let interval: ReturnType<typeof setInterval>;

  if (session) {
    fetchUserImage(); // initial fetch

    // Poll every 60 seconds
    interval = setInterval(fetchUserImage, 60000);
  }

  return () => clearInterval(interval);
}, [session]);


  return (
    <div className="flex">
      {/* Mobile toggle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 text-gray-700 bg-white rounded-lg shadow"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 w-56 text-white flex flex-col justify-between p-4 min-h-screen transform transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        ${isOpen ? "bg-gray-900/70 backdrop-blur-md" : "bg-gray-900"}`}
      >
        {/* Top Content */}
        <div className="flex-1 overflow-y-auto pr-2">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between md:hidden mb-4">
            <Link href='/'><h1 className="text-xl font-bold">Habit AI</h1></Link>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white p-2 rounded-lg hover:bg-gray-700"
            >
              <X size={22} />
            </button>
          </div>

          {/* Desktop Title */}
           <Link href='/'><h1 className="hidden md:block text-xl font-bold mb-6">Habit AI</h1></Link>

          {/* Top Menu Links */}
          <nav className="flex flex-col space-y-2">
            {topMenu.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                  pathname === item.href
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Buttons */}
        <div className="md:sticky absolute bottom-4 left-0 w-full flex flex-col gap-2 px-4">
          {session ? (
            <>
              <Link
                href="/profile"
                className="ml-[-10px] w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                {image ? (
                  <img
                    key={image} // forces React to reload
                    src={image}
                    alt="User Avatar"
                    onError={() => setImage("")}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      backgroundColor: "#16a34a",
                      color: "white",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #6b7280",
                      fontSize: 14,
                    }}
                  >
                    {session.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <span>Profile</span>
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/log" })}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link
              href="/log"
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <LogIn size={20} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
