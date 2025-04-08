import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import {
  RiLogoutBoxLine,
  RiDashboardLine,
  RiPieChartLine,
  RiFileTextLine,
  RiHome3Line,
  RiCloseLine,
} from "react-icons/ri";
import { motion } from "framer-motion";
import Royaume from "../assets/images/Royaume.png";
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
    visible: { opacity: 1, y: 0 },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto" },
  };

  const navItems = [
    {
      path: "/",
      name: "Accueil",
      icon: <RiHome3Line size={18} className="mr-2" />,
    },
    {
      path: "/Gestion-Des-Équipements",
      name: "Gestion",
      icon: <RiDashboardLine size={18} className="mr-2" />,
    },
    {
      path: "/Statistiques",
      name: "Statistiques",
      icon: <RiPieChartLine size={18} className="mr-2" />,
    },
    {
      path: "/Equipment-Documentation",
      name: "Documents",
      icon: <RiFileTextLine size={18} className="mr-2" />,
    },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-6 py-4">
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
                <div className=" flex items-center ">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/2897/2897763.png"
                    alt="Logo EquipTrack"
                    className="w-8 h-8 filter brightness-0 invert"
                  />
                  <div className="flex items-center space-x-3">
                    <img
                      src={Royaume}
                      alt="Emblème du Maroc"
                      className="w-10 h-10 "
                    />
                  </div>
                </div>
                <motion.h1
                  className="text-xl font-semibold text-gray-800 ml-3"
                  whileHover={{ scale: 1.02 }}
                >
                  <span className="text-red-700">Equip</span>Track
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
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-700 rounded-lg transition-colors duration-300 group"
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </motion.li>
              ))}

              {user && (
                <motion.li variants={itemVariants}>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-700 rounded-lg transition-colors duration-300 group"
                  >
                    <RiLogoutBoxLine size={18} className="mr-2" />
                    <span>Déconnexion</span>
                  </button>
                </motion.li>
              )}
            </ul>
          </motion.nav>

          {/* Menu mobile */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none text-gray-600"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <RiCloseLine size={24} />
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
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
                    className="flex items-center px-4 py-3 text-base font-medium text-gray-600 hover:text-red-700 rounded-lg transition-colors duration-300"
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
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
                    className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-600 hover:text-red-700 rounded-lg transition-colors duration-300"
                  >
                    <RiLogoutBoxLine size={18} className="mr-2" />
                    <span>Déconnexion</span>
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
