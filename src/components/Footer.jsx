import React from "react";
import { FaFacebookF, FaInstagram, FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";

function Footer() {
  const socialLinks = [
    { 
      icon: <FaFacebookF size={18} />, 
      url: "https://www.facebook.com/badr.lamrasli",
      color: "hover:text-blue-600"
    },
    { 
      icon: <FaInstagram size={18} />, 
      url: "https://www.instagram.com/tak.ka.r/",
      color: "hover:text-pink-500"
    },
    { 
      icon: <FaGithub size={18} />, 
      url: "https://github.com/lamrasli",
      color: "hover:text-gray-300"
    }
  ];

  const footerLinks = [
    { name: "Politique de confidentialité", },
    { name: "Conditions d'utilisation",  },
    { name: "Aide",  },
    { name: "Contact",   }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-12 pb-6 shadow-2xl border-t border-gray-700">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              <img
                src="https://cdn-icons-png.flaticon.com/512/2897/2897763.png"
                alt="Logo"
                className="w-10 h-10 filter brightness-125"
              />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-100">
                EquipTrack
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              La solution ultime pour la gestion professionnelle de vos équipements.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-blue-300">Liens rapides</h3>
            <ul className="space-y-2">
              {footerLinks.map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span 
                    className="text-gray-400 hover:text-blue-300 text-sm transition-colors duration-300 flex items-center"
                  >
                    <span className="w-1 h-1 bg-blue-400 rounded-full mr-2"></span>
                    {link.name}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-blue-300">Contact</h3>
            <address className="not-italic text-gray-400 text-sm space-y-2">
              <p className="flex items-start">
                <svg className="w-4 h-4 mt-0.5 mr-2 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@gestion-equipements.com
              </p>
              <p className="flex items-start">
                <svg className="w-4 h-4 mt-0.5 mr-2 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +212 6 26 35 34 54
              </p>
              <p className="flex items-start">
                <svg className="w-4 h-4 mt-0.5 mr-2 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Rabat, Maroc
              </p>
            </address>
          </motion.div>

          {/* Newsletter */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-blue-300">Newsletter</h3>
            <p className="text-gray-400 text-sm">
              Abonnez-vous pour recevoir les dernières mises à jour.
            </p>
            <form className="flex flex-col space-y-3">
              <input 
                type="email" 
                placeholder="Votre email" 
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button 
                type="submit" 
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl"
              >
                S'abonner
              </button>
            </form>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-6"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Copyright */}
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-gray-500 text-sm mb-4 md:mb-0"
          >
            &copy; {new Date().getFullYear()} Gestion des Équipements. Tous droits réservés.
            <br className="md:hidden" /> Créé par{" "}
            <a 
              href="https://lamraslibadr.netlify.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-300 hover:underline"
            >
              Badr Lamrasli
            </a>
          </motion.p>

          {/* Social Links */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex space-x-4"
          >
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 ${social.color} transition-colors duration-300`}
                whileHover={{ y: -3, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {social.icon}
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;