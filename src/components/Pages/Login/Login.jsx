import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../../firebase";
import { useNavigate } from "react-router-dom";
import Royaume from "../../../assets/images/Royaume.png";

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
      setSuccessMessage(
        "Un email de réinitialisation a été envoyé. Vérifiez votre boîte de réception."
      );
      setIsForgotPassword(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Arrière-plan avec zellige très léger et dégradés */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "url('https://previews.123rf.com/images/nete/nete1609/nete160900014/63560280-mosa%C3%AFque-blanche-et-noire-zellige-moroccan-transparente.jpg')",
            backgroundSize: "400px",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white"></div>
      </div>

      {/* Carte principale */}
      <div className="w-full max-w-5xl mx-4 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-gray-100 relative z-10 transform transition-all hover:shadow-2xl">
        {/* Dégradé de couleur côté gauche */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-red-800 to-red-600 opacity-90"></div>

        {/* Section gauche - Identité ministérielle */}
        <div className="hidden lg:flex lg:w-2/5 flex-col relative z-10 bg-gradient-to-b from-red-800 to-red-700 p-10">
          {/* Contenu principal centré verticalement */}
          <div className="flex flex-col items-center justify-center flex-grow">
            {/* Emblème royal avec ombre portée */}
            <div className="mb-8 p-4 bg-white bg-opacity-10 rounded-full">
              <img
                src={Royaume}
                alt="Emblème du Royaume du Maroc"
                className="h-32 w-32 object-contain filter drop-shadow-lg"
              />
            </div>

            {/* Titre principal */}
            <h1 className="text-3xl font-bold text-center text-white mb-4 drop-shadow-md">
              EQUIP TRACK
            </h1>

            {/* Séparateur décoratif */}
            <div className="w-20 h-1 bg-yellow-400 mb-6 rounded-full"></div>

            {/* Sous-titre ministériel */}
            <div className="text-center">
              <p className="text-white text-lg font-medium mb-1">
                Ministère des Affaires Étrangères
              </p>
              <p className="text-white text-opacity-90 text-sm leading-tight">
                de la Coopération Africaine et des
                <br />
                Marocains Résidant à l'Étranger
              </p>
            </div>
          </div>

          {/* Pied de page avec copyright */}
          <div className="mt-auto pt-6 border-t border-red-500">
            <div className="flex flex-col items-center">
              <p className="text-white text-opacity-80 text-xs text-center">
                © {new Date().getFullYear()} Ministère des Affaires Étrangères
              </p>
              <p className="text-white text-opacity-70 text-xxs mt-1">
                Tous droits réservés
              </p>
            </div>
          </div>
        </div>

        {/* Version mobile */}
        <div className="lg:hidden py-6 px-6 bg-gradient-to-r from-red-800 to-red-600 flex flex-col items-center">
          <img
            src="https://images.seeklogo.com/logo-png/30/1/royaume-du-maroc-kingdom-of-morocco-logo-png_seeklogo-309860.png"
            alt="Emblème du Royaume du Maroc"
            className="h-16 mb-4"
          />
          <h1 className="text-xl font-bold text-white text-center">
            Royaume du Maroc
          </h1>
          <p className="text-white text-xs text-center mt-1 opacity-90">
            Ministère des Affaires Étrangères
          </p>
        </div>

        {/* Section droite - Formulaire */}
        <div className="w-full lg:w-3/5 p-8 lg:p-12 bg-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              {isForgotPassword
                ? "Réinitialisation du mot de passe"
                : "Accès Sécurisé"}
            </h2>
            <div className="flex justify-center">
              <div className="w-12 h-1 bg-red-600 mb-4"></div>
            </div>
            <p className="text-gray-600 text-sm">
              {isForgotPassword
                ? "Entrez votre email professionnel pour recevoir les instructions"
                : "Veuillez saisir vos identifiants ministériels"}
            </p>
          </div>

          {isForgotPassword ? (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{successMessage}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Institutionnel
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="votre.email@diplomatie.ma"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Retour à la connexion
                </button>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-medium py-2.5 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
                >
                  Envoyer les instructions
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Institutionnel
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="votre.email@diplomatie.ma"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Mot de passe oublié ?
                </button>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-medium py-2.5 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
                >
                  Connexion
                </button>
              </div>

              <div className="pt-6 mt-8 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-xs text-gray-500 font-mono">
                    Système technique - Accès réservé au personnel habilité
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    v2.4.1 | Dernière mise à jour :{" "}
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
