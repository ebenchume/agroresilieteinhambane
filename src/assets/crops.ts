/**
 * AgroResiliente Inhambane - Agricultural Crop Figures & Agronomic Profiles
 * Authentic photographic assets and technical specifications for Inhambane smallholders.
 * Enriched with traditional crops and resilient recommended crops for Homoíne.
 */

import milhoImg from './images/crop_milho_1794030985517.jpg';
import mandiocaImg from './images/crop_mandioca_1794030998682.jpg';
import amendoimImg from './images/crop_amendoim_1794031011147.jpg';
import cajuImg from './images/crop_caju_1794031024216.jpg';
import nhembaImg from './images/crop_nhemba_1794492921636.jpg';
import batatadoceImg from './images/crop_batatadoce_1794492921893.jpg';
import mapiraImg from './images/crop_mapira_1794492935435.jpg';
import feijaoboerImg from './images/crop_feijaoboer_1794492936374.jpg';
import gergelimImg from './images/crop_gergelim_1794492951282.jpg';
import feijaojugoImg from './images/crop_feijaojugo_1794492951498.jpg';

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
  category?: 'Tradicional de Inhambane' | 'Sugerida para Clima de Homoíne' | 'Cultura de Rendimento';
  homoineSuitability?: string;
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
    recommendedVarieties: ['Matuba (Precoce seca)', 'Chokwe (Branco)', 'PAN 53'],
    category: 'Tradicional de Inhambane',
    homoineSuitability: 'Muito cultivado em Homoíne; recomenda-se usar variedade Matuba e consorciar com leguminosas para reter humidade.'
  },
  {
    id: 'crop_mandioca',
    name: 'Mandioca',
    scientificName: 'Manihot esculenta Crantz',
    localNameXitswa: 'Mutsumbwe / Tshumbwe',
    image: mandiocaImg,
    cycleDays: 300,
    plantingSeason: 'Outubro - Dezembro (Arrancamento contínuo)',
    idealSoil: 'Solos arenosos profundos de planície costeira e interior',
    waterNeed: 'Baixa (Resiliente)',
    inhambaneDistricts: ['Homoíne', 'Zavala', 'Inharrime', 'Jangamo', 'Maxixe'],
    keyBenefit: 'Segurança alimentar infalível: tolera estiagens de até 4 meses sem quebra da raiz de reserva.',
    description: 'Raiz tuberosa sagrada contra a fome nas zonas costeiras e do interior de Inhambane. Fornece tanto raízes ricas em hidratos de carbono quanto folhas verdes tenras para a tradicional matapa de mandioca moçambicana.',
    recommendedVarieties: ['Chinamuna', 'Nikwaha', 'Almeirim', 'MZ08-112'],
    category: 'Tradicional de Inhambane',
    homoineSuitability: 'Pilar alimentar em Homoíne. Tolera solos arenosos pobres e resiste a secas prolongadas.'
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
    recommendedVarieties: ['Bebiano Branco', 'Mamane', 'Nambuzi (Local)'],
    category: 'Tradicional de Inhambane',
    homoineSuitability: 'Excelente adaptação aos solos arenosos de Homoíne. Gera renda rápida nas feiras locais.'
  },
  {
    id: 'crop_nhemba',
    name: 'Feijão Nhemba (Feijão-frade)',
    scientificName: 'Vigna unguiculata (L.) Walp.',
    localNameXitswa: 'Tihoco / Nhemba',
    image: nhembaImg,
    cycleDays: 70,
    plantingSeason: 'Novembro - Fevereiro (e 2ª época em Março)',
    idealSoil: 'Solos arenosos e franco-arenosos com boa drenagem',
    waterNeed: 'Baixa (Resiliente)',
    inhambaneDistricts: ['Homoíne', 'Maxixe', 'Panda', 'Massinga', 'Morrumbene', 'Zavala'],
    keyBenefit: 'Dupla colheita: folhas verdes para mucapata/matapa de nhemba e grãos proteicos com ciclo ultrarrápido (65-75 dias).',
    description: 'A leguminosa mais fiel aos produtores de Homoíne. Suporta temperaturas elevadas e estiagens severas, floresce com vigor e aduba o solo naturalmente fixando nitrogénio da atmosfera.',
    recommendedVarieties: ['IT18 (Precoce resistente)', 'INIA 36', 'Nhemba Roxa Local de Homoíne'],
    category: 'Tradicional de Inhambane',
    homoineSuitability: 'Ideal para o clima de Homoíne. Dá colheita garantida mesmo quando as chuvas atrasam ou cortam mais cedo.'
  },
  {
    id: 'crop_batata_doce',
    name: 'Batata-doce Alaranjada (BPA)',
    scientificName: 'Ipomoea batatas (L.) Lam.',
    localNameXitswa: 'Muhlaha / Muhlatsa',
    image: batatadoceImg,
    cycleDays: 95,
    plantingSeason: 'Novembro a Março (e todo ano com humidade residual em baixas)',
    idealSoil: 'Solos arenosos soltos, vales aluviais e zonas baixas de Homoíne',
    waterNeed: 'Baixa (Resiliente)',
    inhambaneDistricts: ['Homoíne', 'Jangamo', 'Maxixe', 'Inharrime', 'Morrumbene'],
    keyBenefit: 'Combate direto à desnutrição e carência de Vitamina A infantil; raízes ricas em betacaroteno e ramas para consumo animal.',
    description: 'Excelente cultura biofortificada recomendada pelo SDAE e investigação agrária para as machambas de Homoíne. A densa cobertura vegetal das ramas protege a terra contra a evaporação solar intensa do verão.',
    recommendedVarieties: ['Irene (Polpa Laranja)', 'Bela', 'Cecília', 'Sumaia', 'Erica'],
    category: 'Sugerida para Clima de Homoíne',
    homoineSuitability: 'Adapta-se com perfeição aos solos arenosos de Homoíne. Ciclo rápido de ~90 dias com excelente mercado local.'
  },
  {
    id: 'crop_mapira',
    name: 'Mapira (Sorgo Grão)',
    scientificName: 'Sorghum bicolor (L.) Moench',
    localNameXitswa: 'Mavele ya Mapira',
    image: mapiraImg,
    cycleDays: 100,
    plantingSeason: 'Outubro - Dezembro',
    idealSoil: 'Solos arenosos pobres, dunas interiores e zonas secas de Homoíne e Panda',
    waterNeed: 'Baixa (Resiliente)',
    inhambaneDistricts: ['Homoíne', 'Panda', 'Funhalouro', 'Mabote', 'Massinga'],
    keyBenefit: 'Cereal salva-vidas: consome 40% menos água que o milho e produz panículas cheias mesmo com veranicos prolongados.',
    description: 'Cereal de eleição para sugerir às comunidades de Homoíne no enfrentamento das mudanças climáticas. O sistema radicular profundo busca humidade subterrânea e o grão produz excelente farinha nutritiva para xima e papas.',
    recommendedVarieties: ['Macia (Precoce e saborosa)', 'Sima', 'SV2', 'Mapira Vermelha Local'],
    category: 'Sugerida para Clima de Homoíne',
    homoineSuitability: 'Recomendação prioritária para as zonas mais quentes e secas de Homoíne e Panda onde o milho sofre perda total.'
  },
  {
    id: 'crop_feijao_boer',
    name: 'Feijão Bóer (Nandolo)',
    scientificName: 'Cajanus cajan (L.) Millsp.',
    localNameXitswa: 'Nandolo / Ndhawa',
    image: feijaoboerImg,
    cycleDays: 160,
    plantingSeason: 'Novembro - Janeiro (Bordaduras e consórcio)',
    idealSoil: 'Solos arenosos profundos mesmo com fertilidade muito reduzida',
    waterNeed: 'Baixa (Resiliente)',
    inhambaneDistricts: ['Homoíne', 'Panda', 'Morrumbene', 'Massinga', 'Maxixe'],
    keyBenefit: 'Raízes pivotantes que descompactam o subsolo arenoso, barreira corta-vento contra tempestades e produção continuada no inverno.',
    description: 'Arbusto leguminoso agroflorestal recomendado para consórcios permanentes em Homoíne. Mantém a folhagem verde durante o pico da estiagem, protege as culturas vizinhas do vento e gera colheitas abundantes de feijão para sopa e venda.',
    recommendedVarieties: ['ICEAP 00557 (Média duração)', 'ICEAP 00040 (Precoce)', 'Nandolo Tradicional'],
    category: 'Sugerida para Clima de Homoíne',
    homoineSuitability: 'Cultura perfeita para consórcio agroecológico em Homoíne: não concorre por água superficial e enriquece o solo.'
  },
  {
    id: 'crop_gergelim',
    name: 'Gergelim (Sésamo)',
    scientificName: 'Sesamum indicum L.',
    localNameXitswa: 'Gergelim / Sésamo',
    image: gergelimImg,
    cycleDays: 90,
    plantingSeason: 'Dezembro - Janeiro (Com chuvas estabelecidas)',
    idealSoil: 'Solos franco-arenosos e arenosos com boa permeabilidade',
    waterNeed: 'Baixa (Resiliente)',
    inhambaneDistricts: ['Homoíne', 'Panda', 'Massinga', 'Morrumbene'],
    keyBenefit: 'Elevado valor comercial por quilograma nos armazéns de compra e grande resistência à aridez após o enraizamento inicial.',
    description: 'Cultura de rendimento em forte expansão recomendada aos camponeses de Homoíne para diversificar as fontes de dinheiro da machamba. O sésamo branco e creme tem alta procura pelas cooperativas e processadores de óleo.',
    recommendedVarieties: ['Lindi Branco', 'Niconga', 'Sésamo Creme de Inhambane'],
    category: 'Cultura de Rendimento',
    homoineSuitability: 'Ótima cultura comercial para Homoíne. Requer pouca água e os grãos têm peso leve e fácil transporte até aos mercados.'
  },
  {
    id: 'crop_feijao_jugo',
    name: 'Feijão Jugo (Tindluwa)',
    scientificName: 'Vigna subterranea (L.) Verdc.',
    localNameXitswa: 'Tindluwa / Feijão Jugo',
    image: feijaojugoImg,
    cycleDays: 120,
    plantingSeason: 'Novembro - Dezembro',
    idealSoil: 'Solos arenosos soltos, pobres em nutrientes minerais',
    waterNeed: 'Baixa (Resiliente)',
    inhambaneDistricts: ['Homoíne', 'Panda', 'Massinga', 'Zavala', 'Inharrime'],
    keyBenefit: 'A leguminosa subterrânea mais rústica de África: produz vagens nutritivas mesmo nas piores estiagens em que o amendoim comum aborta.',
    description: 'Tesouro da biodiversidade camponesa de Inhambane. Suas vagens subterrâneas arredondadas contêm proteínas, amido e minerais de alto valor biológico, sendo um escudo ancestral contra quebras de safra na região.',
    recommendedVarieties: ['Tindluwa Vermelha', 'Variedade Creme de Homoíne', 'Jugo Rajado Tradicional'],
    category: 'Sugerida para Clima de Homoíne',
    homoineSuitability: 'Extremamente resistente aos solos arenosos quentes de Homoíne. Tolera secas severas com produção garantida.'
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
    recommendedVarieties: ['Clones Enxertados CITT/INCAJU', 'Variedade Local de Homoíne'],
    category: 'Cultura de Rendimento',
    homoineSuitability: 'Cultura perene tradicional em Homoíne. Recomenda-se poda de limpeza e controlo biológico do oídio e broca.'
  }
];
