import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { RiLogoutBoxLine } from "react-icons/ri";
function Header({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  return (
    <header className="bg-gradient-to-r mb-12 from-gray-900 to-gray-800 text-white shadow-2xl">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between">
        {/* Section Logo et Titre */}
        <div className="flex items-center space-x-5">
          <Link to="/">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2897/2897763.png"
              alt="Logo"
              className="w-14 h-14 transform hover:rotate-6 hover:scale-105 transition-all duration-300 cursor-pointer"
            />
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-wide">
            <Link to="/">EquipTrack</Link>
          </h1>
        </div>

        {/* Menu de navigation */}
        <nav>
          <ul className="flex items-center space-x-10">
            <li>
              <Link
                to="/"
                className="text-md font-semibold text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300"
              >
                Vue D'ensemble
              </Link>
            </li>
            <li>
              <Link
                to="/Gestion-Des-Équipements"
                className="text-md font-semibold text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300"
              >
                Gestion
              </Link>
            </li>
            <li>
              <Link
                to="/Statistiques"
                className="text-md font-semibold text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300"
              >
                Statistiques
              </Link>
            </li>
            <li>
              <Link
                to="/Equipment-Documentation"
                className="text-md font-semibold text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300"
              >
                Documentation
              </Link>
            </li>
            {/* Bouton de déconnexion (affiché uniquement si l'utilisateur est connecté) */}
            {user && (
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-md font-semibold text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300"
                >
                  <RiLogoutBoxLine size={20} className="mr-2" />{" "}
                  {/* Icône avec un espacement à droite */}
                  Déconnexion
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
