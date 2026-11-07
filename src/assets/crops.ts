/**
 * AgroResiliente Inhambane - Agricultural Crop Figures & Agronomic Profiles
 * Authentic photographic assets and technical specifications for Inhambane smallholders.
 */

import milhoImg from './images/crop_milho_1794030985517.jpg';
import mandiocaImg from './images/crop_mandioca_1794030998682.jpg';
import amendoimImg from './images/crop_amendoim_1794031011147.jpg';
import cajuImg from './images/crop_caju_1794031024216.jpg';

export interface CropFigure {
  id: string;
  name: string;
  scientificName: string;
  localNameXitswa: string;
  image: string;
  cycleDays: number;
  plantingSeason: string;
  idealSoil: string;
  waterNeed: 'Baixa (Resiliente)' | 'Média' | 'Alta';
  inhambaneDistricts: string[];
  keyBenefit: string;
  description: string;
  recommendedVarieties: string[];
}

export const INHAMBANE_CROPS: CropFigure[] = [
  {
    id: 'crop_milho',
    name: 'Milho',
    scientificName: 'Zea mays L.',
    localNameXitswa: 'Mavele / Tifela',
    image: milhoImg,
    cycleDays: 105,
    plantingSeason: 'Outubro - Novembro (1ª época)',
    idealSoil: 'Solos francos a arenosos com adubação orgânica de fundo',
    waterNeed: 'Média',
    inhambaneDistricts: ['Homoíne', 'Massinga', 'Maxixe', 'Morrumbene'],
    keyBenefit: 'Base calórica essencial para farinha de milho (xima) e consociação rica com feijão nhemba.',
    description: 'Cultura cerealífera rainha da primeira época em Inhambane. As espigas douradas bem formadas resistem aos veranicos quando semeadas no compasso de 80x25cm com variedades precoces recomendadas pela investigação do IIAM.',
    recommendedVarieties: ['Matuba (Precoce seca)', 'Chokwe (Branco)', 'PAN 53']
  },
  {
    id: 'crop_mandioca',
    name: 'Mandioca',
    scientificName: 'Manihot esculenta Crantz',
    localNameXitswa: 'Mutsumbwe / Tshumbwe',
    image: mandiocaImg,
    cycleDays: 300,
    plantingSeason: 'Outubro - Dezembro (Arrancamento contínuo)',
    idealSoil: 'Solos arenosos profundos de planície costeira',
    waterNeed: 'Baixa (Resiliente)',
    inhambaneDistricts: ['Homoíne', 'Zavala', 'Inharrime', 'Jangamo', 'Maxixe'],
    keyBenefit: 'Segurança alimentar infalível: tolera estiagens de até 4 meses sem quebra da raiz de reserva.',
    description: 'Raiz tuberosa sagrada contra a fome nas zonas costeiras e do interior de Inhambane. Fornece tanto raízes ricas em hidratos de carbono quanto folhas verdes tenras para a tradicional matapa de mandioca moçambicana.',
    recommendedVarieties: ['Chinamuna', 'Nikwaha', 'Almeirim', 'MZ08-112']
  },
  {
    id: 'crop_amendoim',
    name: 'Amendoim',
    scientificName: 'Arachis hypogaea L.',
    localNameXitswa: 'Mahlawu / Tinjiya',
    image: amendoimImg,
    cycleDays: 110,
    plantingSeason: 'Outubro - Novembro (Primeiras chuvas)',
    idealSoil: 'Solos arenosos soltos bem drenados sem pedras',
    waterNeed: 'Baixa (Resiliente)',
    inhambaneDistricts: ['Homoíne', 'Morrumbene', 'Panda', 'Massinga'],
    keyBenefit: 'Fixação biológica de azoto e fonte concentrada de proteína vegetal e óleo para a família.',
    description: 'Leguminosa vital para as mulheres produtoras de Inhambane. Semeado denso em camalhões para quebrar o ciclo dos afídeos da roseta, produz vagens subterrâneas fartas com alta cotação nos mercados de Homoíne e Maxixe.',
    recommendedVarieties: ['Bebiano Branco', 'Mamane', 'Nambuzi (Local)']
  },
  {
    id: 'crop_caju',
    name: 'Caju & Castanha',
    scientificName: 'Anacardium occidentale L.',
    localNameXitswa: 'Mukanju / Tikanju',
    image: cajuImg,
    cycleDays: 365,
    plantingSeason: 'Perene (Colheita de Outubro a Janeiro)',
    idealSoil: 'Solos arenosos costeiros e dunas fixas',
    waterNeed: 'Baixa (Resiliente)',
    inhambaneDistricts: ['Homoíne', 'Inhambane-Cidade', 'Maxixe', 'Morrumbene', 'Vilankulo'],
    keyBenefit: 'Principal fonte de rendimento financeiro comercial e exportação em Moçambique.',
    description: 'Árvore nobre dos pomares de Inhambane. A polpa sumarenta da maçã de caju é consumida fresca ou transformada em néctar e bebida artesanal, enquanto a castanha de caju de alta qualidade garante receita em dinheiro vivo para as associações agrícolas.',
    recommendedVarieties: ['Clones Enxertados CITT/INCAJU', 'Variedade Local de Homoíne']
  }
];
