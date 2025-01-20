import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      
          <div>
            <h3 className="text-xl font-bold mb-4">Sobre Nós</h3>
            <p className="text-gray-400">
            Somos uma plataforma de recomendação de filmes e séries, ajudando você a descobrir os melhores títulos para assistir. Aqui, você encontra sugestões personalizadas, avaliações e muito mais!
            </p>
          </div>

         
          <div>
            <h3 className="text-xl font-bold mb-4">Links Úteis</h3>
            <ul className="text-gray-400">
              <li className="mb-2">
                <a href="#" className="hover:text-white transition-colors">
                  Política de Privacidade
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="hover:text-white transition-colors">
                  Termos de Serviço
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="hover:text-white transition-colors">
                  Ajuda
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="hover:text-white transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>

        
          <div>
            <h3 className="text-xl font-bold mb-4">Redes Sociais</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook size={24} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter size={24} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram size={24} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>
        </div>

    
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Flixrecom. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;