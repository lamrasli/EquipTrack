import imprmobile from "../../../assets/images/imprmobile.png";
import impr402 from "../../../assets/images/impr402.png";
import impr404 from "../../../assets/images/impr404.png";
import impr426 from "../../../assets/images/impr426.png";
import scan2000 from "../../../assets/images/scan2000.png";
import scan2500 from "../../../assets/images/scan2500.png";
import minig3 from "../../../assets/images/minig3.png";
import minig5 from "../../../assets/images/minig5.png";
import ucg3 from "../../../assets/images/ucg3.png";
import tpE73 from "../../../assets/images/tpE73.png";
import HPV212 from "../../../assets/images/HPV212.png";
import HPP22v from "../../../assets/images/HPP22v.png";
import kvm2vga from "../../../assets/images/kvm2vga.png";
import kvm4vga from "../../../assets/images/kvm4vga.png";
const equipmentData = [
  // Imprimantes
  {
    id: 1,
    category: "Imprimante",
    brand: "HP",
    model: "LaserJet Pro 402",
    image: impr402,
    specs: {
      type: "Laser",
      vitesse: "33 ppm",
      résolution: "1200 x 1200 dpi",
      connectivité: "USB, Ethernet",
      mémoire: "128 MB",
      capacitéPapier: "250 feuilles",
    },
    ficheTechnique: {
      dimensions: "38 x 34 x 23 cm",
      poids: "8.5 kg",
      garantie: "1 an",
      description: "Imprimante laser rapide et efficace pour les bureaux.",
    },
  },
  {
    id: 2,
    category: "Imprimante",
    brand: "HP",
    model: "LaserJet Pro 404",
    image: impr404,
    specs: {
      type: "Laser",
      vitesse: "35 ppm",
      résolution: "1200 x 1200 dpi",
      connectivité: "USB, Ethernet, Wi-Fi",
      mémoire: "256 MB",
      capacitéPapier: "300 feuilles",
    },
    ficheTechnique: {
      dimensions: "38 x 34 x 23 cm",
      poids: "9 kg",
      garantie: "1 an",
      description: "Imprimante laser avec connectivité avancée.",
    },
  },
  {
    id: 3,
    category: "Imprimante",
    brand: "HP",
    model: "LaserJet Pro 426",
    image: impr426,
    specs: {
      type: "Laser",
      vitesse: "40 ppm",
      résolution: "1200 x 1200 dpi",
      connectivité: "USB, Ethernet, Wi-Fi",
      mémoire: "512 MB",
      capacitéPapier: "350 feuilles",
    },
    ficheTechnique: {
      dimensions: "38 x 34 x 23 cm",
      poids: "10 kg",
      garantie: "1 an",
      description: "Imprimante laser hautes performances.",
    },
  },
  // Scanners
  {
    id: 4,
    category: "Scanner",
    brand: "HP",
    model: "ScanJet 2000s2",
    image: scan2000,
    specs: {
      type: "Scanner à plat",
      résolution: "1200 x 1200 dpi",
      vitesse: "15 ppm",
      connectivité: "USB",
      format: "A4",
    },
    ficheTechnique: {
      dimensions: "30 x 45 x 10 cm",
      poids: "3.5 kg",
      garantie: "1 an",
      description: "Scanner à plat idéal pour les documents A4.",
    },
  },
  {
    id: 5,
    category: "Scanner",
    brand: "HP",
    model: "ScanJet 2500",
    image: scan2500,
    specs: {
      type: "Scanner à plat",
      résolution: "2400 x 2400 dpi",
      vitesse: "20 ppm",
      connectivité: "USB, Wi-Fi",
      format: "A4",
    },
    ficheTechnique: {
      dimensions: "30 x 45 x 10 cm",
      poids: "4 kg",
      garantie: "1 an",
      description: "Scanner à plat avec haute résolution.",
    },
  },
  // PC Mini
  {
    id: 6,
    category: "PC Mini",
    brand: "HP",
    model: "Mini G3",
    image: minig3,
    specs: {
      processeur: "Intel Core i5",
      ram: "4 GB",
      stockage: "256 GB HDD",
      ports: "USB 3.0, HDMI, Ethernet",
      système: "Windows 10 Pro",
    },
    ficheTechnique: {
      dimensions: "18 x 18 x 4 cm",
      poids: "1.2 kg",
      garantie: "1 an",
      description: "PC Mini compact et performant.",
    },
  },
  {
    id: 7,
    category: "PC Mini",
    brand: "HP",
    model: "Mini G5",
    image: minig5,
    specs: {
      processeur: "Intel Core i5",
      ram: "16 GB",
      stockage: "512 GB hdd",
      ports: "USB 3.0, HDMI, Ethernet",
      système: "Windows 10 Pro",
    },
    ficheTechnique: {
      dimensions: "18 x 18 x 4 cm",
      poids: "1.5 kg",
      garantie: "1 an",
      description: "PC Mini haute performance pour les utilisateurs exigeants.",
    },
  },
  // Unité Centrale
  {
    id: 8,
    category: "Unité Centrale",
    brand: "HP",
    model: "Pc Complet Hp 400 G3",
    image: ucg3,
    specs: {
      processeur: "Intel Core i5",
      ram: "8 GB",
      stockage: "1 TB HDD",
      ports: "USB 3.0, HDMI, VGA",
      système: "Windows 10 Pro",
    },
    ficheTechnique: {
      dimensions: "40 x 15 x 40 cm",
      poids: "8 kg",
      garantie: "1 an",
      description: "Unité centrale fiable pour un usage quotidien.",
    },
  },
  {
    id: 9,
    category: "Unité Centrale",
    brand: "Lenovo",
    model: "ThinkCentre E73 MT",
    image: tpE73,
    specs: {
      processeur: "Intel® Pentium® Processor G3220",
      ram: "2 GB",
      stockage: "500 GB HDD",
      ports: "USB 3.0, HDMI, DisplayPort",
      système: "Windows 7",
    },
    ficheTechnique: {
      dimensions: "40 x 15 x 40 cm",
      poids: "7.5 kg",
      garantie: "1 an",
      description: "Unité centrale performante pour les professionnels.",
    },
  },
  // Écrans
  {
    id: 10,
    category: "Écran",
    brand: "HP",
    model: "V212a",
    image: HPV212,
    specs: {
      taille: "21.5 pouces",
      résolution: "1920 x 1080",
      technologie: "LED",
      ports: "HDMI, VGA",
      tauxRafraîchissement: "60 Hz",
    },
    ficheTechnique: {
      dimensions: "50 x 40 x 20 cm",
      poids: "3 kg",
      garantie: "1 an",
      description: "Écran LED avec une excellente qualité d'image.",
    },
  },
  {
    id: 11,
    category: "Écran",
    brand: "HP",
    model: "P22v G5 FH",
    image: HPP22v,
    specs: {
      taille: "21.5 pouces",
      résolution: "1920 x 1080",
      technologie: "IPS",
      ports: "HDMI, DisplayPort",
      tauxRafraîchissement: "75 Hz",
    },
    ficheTechnique: {
      dimensions: "50 x 40 x 20 cm",
      poids: "3.2 kg",
      garantie: "1 an",
      description: "Écran IPS avec des angles de vision larges.",
    },
  },
  // Imprimante Mobile
  {
    id: 12,
    category: "Imprimante Mobile",
    brand: "HP",
    model: "OfficeJet 2000",
    image: imprmobile,
    specs: {
      type: "Jet d'encre",
      vitesse: "20 ppm",
      résolution: "1200 x 1200 dpi",
      connectivité: "USB, Wi-Fi, Bluetooth",
      autonomie: "8 heures",
    },
    ficheTechnique: {
      dimensions: "32 x 18 x 6 cm",
      poids: "2 kg",
      garantie: "1 an",
      description: "Imprimante mobile pratique et légère.",
    },
  },
  // Switch KVM
  {
    id: 13,
    category: "Switch KVM",
    brand: "D-Link",
    model: "KVM-121 2-Port",
    image: kvm2vga,
    specs: {
      ports: "2 ports USB",
      résolution: "1920 x 1080",
      compatibilité: "HDMI, USB",
      alimentation: "Via USB",
    },
    ficheTechnique: {
      dimensions: "10 x 8 x 3 cm",
      poids: "0.5 kg",
      garantie: "1 an",
      description:
        "Switch KVM pour contrôler deux ordinateurs avec un seul ensemble clavier/souris.",
    },
  },
  {
    id: 14,
    category: "Switch KVM",
    brand: "DKVM-4U",
    model: "4-Port USB",
    image: kvm4vga,
    specs: {
      ports: "4 ports USB",
      résolution: "1920 x 1080",
      compatibilité: "HDMI, USB",
      alimentation: "Via USB",
    },
    ficheTechnique: {
      dimensions: "10 x 8 x 3 cm",
      poids: "0.6 kg",
      garantie: "1 an",
      description: "Switch KVM pour contrôler jusqu'à quatre ordinateurs.",
    },
  },
];

export default equipmentData;
