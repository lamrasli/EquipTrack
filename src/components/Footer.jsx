import React from 'react';

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 mt-12 shadow-2xl">
      <div className="container mx-auto text-center">
        {/* Copyright */}
        <p className="text-sm mb-4 text-gray-300">
          &copy; 2025 Gestion des Équipements. Tous droits réservés.
        </p>

        {/* Footer Details */}
        <div className="mb-6">
          <p className="text-sm text-gray-300">
            Site web créé par{' '}
            <a
              href="https://lamraslibadr.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-300"
            >
              <strong>Badr Lamrasli</strong>
            </a>
            {' '}| Contact :{' '}
            <a
              href="mailto:info@gestion-equipements.com"
              className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-300"
            >
              <strong>info@gestion-equipements.com</strong>
            </a>
          </p>
        </div>

        {/* Footer Links */}
        <div className="flex justify-center gap-6 text-sm">
          <a
            href="#"
            className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-300"
          >
            Politique de confidentialité
          </a>
          <span className="text-gray-400">|</span>
          <a
            href="#"
            className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-300"
          >
            Conditions d'utilisation
          </a>
          <span className="text-gray-400">|</span>
          <a
            href="#"
            className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-300"
          >
            Aide
          </a>
        </div>

        {/* Social Media Icons (Optional) */}
        <div className="mt-6 flex justify-center space-x-6">
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M24 4.56v14.91c0 .97-.79 1.76-1.76 1.76H1.76C.79 21.23 0 20.44 0 19.47V4.56C0 3.59.79 2.8 1.76 2.8h20.48c.97 0 1.76.79 1.76 1.76zM9.6 18.24V9.6H7.2v8.64h2.4zm-1.2-9.84c.84 0 1.44-.6 1.44-1.32-.02-.72-.6-1.32-1.44-1.32-.84 0-1.44.6-1.44 1.32 0 .72.6 1.32 1.44 1.32zm10.8 9.84V13.2c0-2.16-1.2-3.12-2.76-3.12-1.32 0-1.92.72-2.28 1.2v-1.08H12v8.64h2.4V13.8c0-.6.12-1.2.84-1.2.72 0 .72.72.72 1.2v4.44h2.4z" />
            </svg>
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M22.23 5.924c-.806.358-1.67.6-2.577.708a4.515 4.515 0 001.98-2.49 9.036 9.036 0 01-2.86 1.09 4.507 4.507 0 00-7.68 4.108 12.8 12.8 0 01-9.29-4.71 4.507 4.507 0 001.394 6.015 4.48 4.48 0 01-2.04-.563v.057a4.507 4.507 0 003.616 4.415 4.52 4.52 0 01-2.034.077 4.507 4.507 0 004.21 3.13 9.04 9.04 0 01-5.6 1.93c-.364 0-.724-.02-1.08-.063a12.78 12.78 0 006.92 2.03c8.3 0 12.84-6.88 12.84-12.84 0-.195-.004-.39-.013-.584a9.17 9.17 0 002.26-2.34z" />
            </svg>
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2.04c-5.5 0-9.96 4.46-9.96 9.96 0 4.41 3.61 8.09 8.28 9.36v-6.61h-2.49v-2.75h2.49v-2.1c0-2.48 1.51-3.84 3.73-3.84 1.08 0 2.21.19 2.21.19v2.43h-1.25c-1.23 0-1.61.76-1.61 1.54v1.86h2.73l-.44 2.75h-2.29v6.61c4.67-1.27 8.28-4.95 8.28-9.36 0-5.5-4.46-9.96-9.96-9.96z" />
            </svg>
          </a>
        </div>
        <div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;