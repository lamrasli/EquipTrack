import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { RiLogoutBoxLine, RiDashboardLine, RiPieChartLine, RiFileTextLine, RiHome3Line, RiCloseLine } from "react-icons/ri";
import { motion } from "framer-motion";

function Header({ user }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 }
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto" }
  };

  const navItems = [
    { path: "/", name: "Accueil", icon: <RiHome3Line size={18} className="mr-1" /> },
    { path: "/Gestion-Des-Équipements", name: "Gestion", icon: <RiDashboardLine size={18} className="mr-1" /> },
    { path: "/Statistiques", name: "Stats", icon: <RiPieChartLine size={18} className="mr-1" /> },
    { path: "/Equipment-Documentation", name: "Docs", icon: <RiFileTextLine size={18} className="mr-1" /> }
  ];

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-xl sticky top-0 z-50 border-b border-gray-700">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo et Titre */}
          <motion.div 
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.1 }}
            className="flex items-center space-x-4"
          >
            <motion.div variants={itemVariants}>
              <Link to="/" className="flex items-center">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2897/2897763.png"
                  alt="Logo EquipTrack"
                  className="w-10 h-10 filter brightness-125 hover:rotate-6 hover:scale-110 transition-all duration-300"
                />
                <motion.h1 
                  className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-100 ml-3"
                  whileHover={{ scale: 1.02 }}
                >
                  EquipTrack
                </motion.h1>
              </Link>
            </motion.div>
          </motion.div>

          {/* Navigation Desktop */}
          <motion.nav 
            initial="hidden"
            animate="visible"
            className="hidden md:block"
          >
            <ul className="flex items-center space-x-1">
              {navItems.map((item, index) => (
                <motion.li 
                  key={item.path}
                  variants={itemVariants}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className="flex items-center px-4 py-2 text-md font-medium rounded-lg hover:bg-gray-700/60 transition-all duration-300 group border border-transparent hover:border-gray-600"
                  >
                    <span className="text-blue-300 group-hover:text-blue-100 transition-colors">
                      {item.icon}
                    </span>
                    <span className="ml-1 text-gray-200  group-hover:text-white">{item.name}</span>
                  </Link>
                </motion.li>
              ))}

              {user && (
                <motion.li variants={itemVariants}>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm font-medium rounded-lg hover:bg-red-900/40 transition-all duration-300 group border border-transparent hover:border-red-800/50"
                  >
                    <RiLogoutBoxLine size={18} className="mr-1 text-red-300 group-hover:text-red-200" />
                    <span className="text-gray-200 group-hover:text-white">Déconnexion</span>
                  </button>
                </motion.li>
              )}
            </ul>
          </motion.nav>

          {/* Menu mobile */}
          <div className="md:hidden text-gray-300">
            {/* Bouton menu burger */}
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-md hover:bg-gray-700/50 focus:outline-none"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <RiCloseLine size={24} />
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        <motion.div
          initial="hidden"
          animate={mobileMenuOpen ? "visible" : "hidden"}
          variants={mobileMenuVariants}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <div className="pt-4 pb-2">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <motion.li
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-base font-medium rounded-lg hover:bg-gray-700/60 transition-all duration-300 group"
                  >
                    <span className="text-blue-300 group-hover:text-blue-100 transition-colors">
                      {item.icon}
                    </span>
                    <span className="ml-3 text-gray-200 group-hover:text-white">{item.name}</span>
                  </Link>
                </motion.li>
              ))}

              {user && (
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-base font-medium rounded-lg hover:bg-red-900/40 transition-all duration-300 group"
                  >
                    <RiLogoutBoxLine size={18} className="text-red-300 group-hover:text-red-200" />
                    <span className="ml-3 text-gray-200 group-hover:text-white">Déconnexion</span>
                  </button>
                </motion.li>
              )}
            </ul>
          </div>
        </motion.div>
      </div>
    </header>
  );
}

export default Header;