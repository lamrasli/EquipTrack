import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase";
import { useNavigate } from "react-router-dom";
// Import the image using a relative path
import loginImage from "../../../assets/images/login.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/accueil");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className=" w-full mx-auto p-6 bg-white rounded-lg shadow-xl flex justify-center items-center">
        {/* Image Section (Left Side) */}
        <div className="hidden lg:block w-1/2 pr-6">
          <img
            src={loginImage}
            alt="Login"
            className="w-full h-full object-cover rounded-l-lg"
          />
        </div>

        {/* Form Section (Right Side) */}
        <div className="w-lg ">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Bienvenue sur <span className="text-blue-600">EquipTrack</span>
            </h1>
            <p className="text-gray-600">
              Gérez vos équipements de manière efficace et professionnelle.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Adresse e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez votre e-mail"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez votre mot de passe"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

