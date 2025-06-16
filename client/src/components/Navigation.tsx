import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { Heart, Moon, Sun, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth.tsx";

export function Navigation() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <Heart className="text-medical-blue text-2xl" />
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Rural Health Tracker
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className={`text-slate-700 dark:text-slate-300 hover:text-medical-blue dark:hover:text-medical-blue transition-colors ${
                    location === item.path ? "text-medical-blue" : ""
                  }`}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href={user.isAdmin ? "/admin" : "/dashboard"}>
                  <Button variant="ghost" className="text-slate-700 dark:text-slate-300">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="text-slate-700 dark:text-slate-300"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="ghost" className="text-slate-700 dark:text-slate-300">
                  Login
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Dark Mode Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-yellow-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <div className="px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className="block w-full text-left py-2 text-slate-700 dark:text-slate-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
            {user ? (
              <>
                <Link href={user.isAdmin ? "/admin" : "/dashboard"}>
                  <Button
                    variant="ghost"
                    className="block w-full text-left py-2 text-slate-700 dark:text-slate-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-slate-700 dark:text-slate-300"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="block w-full text-left py-2 text-slate-700 dark:text-slate-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
