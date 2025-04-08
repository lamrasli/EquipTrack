import React from "react";
import { FaFacebookF, FaLinkedinIn, FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";
import Royaume from "../assets/images/Royaume.png";
import { RiTwitterXFill } from "react-icons/ri";

function Footer() {
  const socialLinks = [
    { 
      icon: <FaFacebookF size={14} />, 
      url: "https://www.facebook.com/MarocDiplomatie/",
      color: "hover:bg-blue-100 hover:text-blue-600"
    },
    { 
      icon: <RiTwitterXFill  size={14} />, 
      url: "https://twitter.com/MarocDiplomatie",
      color: "hover:bg-blue-100 hover:text-blue-400"
    },
    { 
      icon: <FaLinkedinIn size={14} />, 
      url: "https://www.linkedin.com/company/maroc-diplomatie",
      color: "hover:bg-blue-100 hover:text-blue-700"
    }
  ];

  const footerLinks = [
    { name: "Accueil", path: "/" },
    { name: "Services", path: "/services" },
    { name: "Documents", path: "/documents" },
    { name: "Contact", path: "/contact" }
  ];

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Ministry Branding */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-3">
              <img
                src={Royaume}
                alt="Emblème du Maroc"
                className="w-10 h-10"
              />
              <div>
                <h2 className="text-lg font-bold">Ministère des Affaires Étrangères</h2>
                <p className="text-xs text-gray-400">Royaume du Maroc</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Plateforme officielle de gestion administrative et diplomatique du Royaume du Maroc.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <h3 className="text-md font-semibold uppercase tracking-wider text-gray-300">
              Navigation
            </h3>
            <ul className="space-y-3">
              {footerLinks.map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <a 
                    href={link.path}
                    className="text-gray-400 hover:text-white text-sm transition-colors duration-300 flex items-center"
                  >
                    <span className="w-1 h-1 bg-gray-500 rounded-full mr-3"></span>
                    {link.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-md font-semibold uppercase tracking-wider text-gray-300">
              Contact
            </h3>
            <address className="not-italic text-gray-400 text-sm space-y-4">
              <p className="flex items-start">
                <FaMapMarkerAlt className="w-4 h-4 mt-0.5 mr-3 text-gray-500" />
                Avenue Mohammed VI,<br />Rabat, Maroc
              </p>
              <p className="flex items-center">
                <FaPhone className="w-4 h-4 mr-3 text-gray-500" />
                +212 0 00 00 00 00
              </p>
              <p className="flex items-center">
                <FaEnvelope className="w-4 h-4 mr-3 text-gray-500" />
                contact@diplomatie.ma
              </p>
            </address>
          </motion.div>

          {/* Newsletter */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-md font-semibold uppercase tracking-wider text-gray-300">
              Newsletter
            </h3>
            <p className="text-gray-400 text-sm">
              Abonnez-vous pour recevoir les dernières actualités.
            </p>
            <form className="flex flex-col space-y-3">
              <input 
                type="email" 
                placeholder="Votre email" 
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent placeholder-gray-500"
                required
              />
              <button 
                type="submit" 
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-all duration-300 text-sm font-medium"
              >
                S'abonner
              </button>
            </form>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Copyright */}
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-gray-500 text-xs mb-4 md:mb-0 text-center md:text-left"
          >
            &copy; {new Date().getFullYear()} Ministère des Affaires Étrangères - Tous droits réservés.
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
            className="flex space-x-3"
          >
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 ${social.color} transition-all duration-300`}
                whileHover={{ y: -2 }}
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