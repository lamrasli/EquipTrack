import React, { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../firebase";
import { useNavigate, Link } from "react-router-dom";
import loginImage from "../../../assets/images/login.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/accueil");
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email) {
      setError("Veuillez entrer votre adresse email");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Un email de réinitialisation a été envoyé. Vérifiez votre boîte de réception.");
      setIsForgotPassword(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-xl flex justify-center items-center">
        {/* Image Section (Left Side) */}
        <div className="hidden lg:block w-1/2 pr-6">
          <img
            src={loginImage}
            alt="Login"
            className="w-full h-full object-cover rounded-l-lg"
          />
        </div>

        {/* Form Section (Right Side) */}
        <div className="w-full lg:w-1/2 px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Bienvenue sur <span className="text-blue-600">EquipTrack</span>
            </h1>
            <p className="text-gray-600">
              Gérez vos équipements de manière efficace et professionnelle.
            </p>
          </div>

          {isForgotPassword ? (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-700 text-center">
                Réinitialisation du mot de passe
              </h2>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {successMessage}
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

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Retour à la connexion
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
              >
                Envoyer le lien de réinitialisation
              </button>
            </form>
          ) : (
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

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
              >
                Se connecter
              </button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Vous n'avez pas de compte ?{" "}
                  <Link
                    to="/register"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Créer un compte
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;