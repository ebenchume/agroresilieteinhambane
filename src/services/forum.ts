/**
 * AgroResiliente Inhambane - Community Forum Service
 * Offline-first persistent storage and management of farmer discussions,
 * practical agronomic advice, queries, and peer knowledge exchange.
 */

import { ForumPost, ForumComment, ForumCategory } from '../types/forum';
import { CropType, DistrictZone, UserType, User } from '../types/auth';
import { NotificationsService } from './notifications';

const STORAGE_FORUM_KEY = 'agro_community_forum_v2';

const INITIAL_POSTS: ForumPost[] = [
  {
    id: 'post_01_arsenio_biopesticida',
    authorId: 'usr_arsenio_02',
    authorName: 'Arsénio Matsinhe',
    authorZone: 'Homoíne-Sede',
    authorCrop: 'Milho',
    authorType: 'Extensionista',
    isExtensionist: true,
    pinned: true,
    title: 'Receita Natural: Biopesticida de Folhas de Nim e Cinzas para o Cartucho do Milho',
    content: 'Caros produtores de Homoíne e Maculuve: com os dias quentes e noites amenas, observamos primeiros focos de lagarta do cartucho nos milhos com 20 a 35 dias. Para evitar custos com pesticidas químicos, macere 1 kg de folhas de nim esmagadas e 2 copos de cinza de lenha limpa em 10 litros de água. Deixe repousar 24 horas, coe com um pano fino e aplique com borrifador ou vassourinha de palha diretamente no cartucho das plantas pela manhã fresca (antes das 08h30). Tem efeito repelente imediato e não queima a planta.',
    category: 'pragas-doencas',
    cropTag: 'Milho',
    likes: ['usr_maria_01', 'usr_joaquim_03'],
    createdAt: '2026-10-26T07:30:00Z',
    comments: [
      {
        id: 'comm_01_maria',
        postId: 'post_01_arsenio_biopesticida',
        authorId: 'usr_maria_01',
        authorName: 'Maria João Tembe',
        authorZone: 'Homoíne-Sede',
        authorType: 'Mulher chefe de família',
        content: 'Técnico Arsénio, usei essa mistura na semana passada no meu milho Matuba e as lagartas pararam de furar as folhas! Muito obrigada pela partilha.',
        likes: ['usr_arsenio_02'],
        createdAt: '2026-10-26T10:15:00Z'
      },
      {
        id: 'comm_02_joaquim',
        postId: 'post_01_arsenio_biopesticida',
        authorId: 'usr_joaquim_03',
        authorName: 'Joaquim Cossa',
        authorZone: 'Maculuve',
        authorType: 'Familiar',
        content: 'Pode-se usar também folhas de piripiri misturadas se não tivermos nim suficiente na nossa zona de Maculuve?',
        likes: [],
        createdAt: '2026-10-26T14:40:00Z'
      },
      {
        id: 'comm_03_arsenio_resp',
        postId: 'post_01_arsenio_biopesticida',
        authorId: 'usr_arsenio_02',
        authorName: 'Arsénio Matsinhe',
        authorZone: 'Homoíne-Sede',
        authorType: 'Extensionista',
        isExtensionist: true,
        content: 'Sim, Sr. Joaquim! O piripiri maduro moído com um pouco de sabão neutro caseiro funciona muito bem como repelente forte. Dilua bem para não irritar os olhos durante a aplicação.',
        likes: ['usr_joaquim_03', 'usr_maria_01'],
        createdAt: '2026-10-26T16:20:00Z'
      }
    ]
  },
  {
    id: 'post_02_maria_mulching',
    authorId: 'usr_maria_01',
    authorName: 'Maria João Tembe',
    authorZone: 'Homoíne-Sede',
    authorCrop: 'Mandioca',
    authorType: 'Mulher chefe de família',
    pinned: false,
    title: 'Experiência com Cobertura Morta (Mulching) nos Camalhões de Mandioca e Batata-doce',
    content: 'Olá comunidade AgroResiliente. Quero dar o meu testemunho sobre a técnica de mulching que aprendemos no centro de demonstração. Cobri os camalhões com palha seca de milho e capim cortado numa espessura de 5 cm. Passámos 6 dias sem chuva aqui em Homoíne e, ao afastar a palha, a terra continua preta, húmida e fresca! Não nasceu quase nenhuma erva daninha, o que me poupou horas de sacha com a enxada.',
    category: 'boas-praticas',
    cropTag: 'Mandioca',
    likes: ['usr_arsenio_02', 'usr_joaquim_03'],
    createdAt: '2026-10-25T11:20:00Z',
    comments: [
      {
        id: 'comm_04_arsenio',
        postId: 'post_02_maria_mulching',
        authorId: 'usr_arsenio_02',
        authorName: 'Arsénio Matsinhe',
        authorZone: 'Homoíne-Sede',
        authorType: 'Extensionista',
        isExtensionist: true,
        content: 'Excelente prática, Dona Maria! O solo de Homoíne é arenoso e evapora até 4 mm de água por dia sob o sol do meio-dia. O mulching é a maior defesa do pequeno produtor.',
        likes: ['usr_maria_01'],
        createdAt: '2026-10-25T12:05:00Z'
      }
    ]
  },
  {
    id: 'post_03_joaquim_amendoim',
    authorId: 'usr_joaquim_03',
    authorName: 'Joaquim Cossa',
    authorZone: 'Maculuve',
    authorCrop: 'Amendoim',
    authorType: 'Familiar',
    pinned: false,
    title: 'Dúvida: Qual o melhor teste para saber se o Amendoim Bebiano está pronto para colher?',
    content: 'Companheiros, tenho 1 hectare de amendoim Bebiano Branco semeado em Maculuve. Já completou 98 dias. Algumas plantas começam a perder o verde escuro das folhas e tenho medo de arrancar cedo demais com grãos leitosos ou esperar muito e as vagens soltarem-se dentro da terra. Qual é o vosso método prático para decidir o dia certo?',
    category: 'duvidas',
    cropTag: 'Amendoim',
    likes: ['usr_maria_01'],
    createdAt: '2026-10-24T15:00:00Z',
    comments: [
      {
        id: 'comm_05_arsenio',
        postId: 'post_03_joaquim_amendoim',
        authorId: 'usr_arsenio_02',
        authorName: 'Arsénio Matsinhe',
        authorZone: 'Homoíne-Sede',
        authorType: 'Extensionista',
        isExtensionist: true,
        content: 'Sr. Joaquim, faça o seguinte teste: desenterre 3 a 5 plantas aleatórias na machamba. Abra 10 vagens maduras. Raspe com a unha o interior da casca. Se o interior estiver escuro ou castanho com veios bem definidos, 75% da produção está no ponto. Se ainda estiver branco e esponjoso, aguarde mais 7 a 10 dias.',
        likes: ['usr_joaquim_03'],
        createdAt: '2026-10-24T17:30:00Z'
      }
    ]
  },
  {
    id: 'post_04_mercado_maxixe',
    authorId: 'usr_maria_01',
    authorName: 'Maria João Tembe',
    authorZone: 'Homoíne-Sede',
    authorCrop: 'Milho',
    authorType: 'Mulher chefe de família',
    pinned: false,
    title: 'Preço do Feijão Nhemba e Milho no Mercado Grossista da Maxixe hoje',
    content: 'Informação útil para quem está a planear escoar produção: estive hoje de manhã na Maxixe. Há camiões à procura de milho seco de boa qualidade a pagar 32 a 35 MT/kg. O feijão nhemba vermelho está com forte procura entre 45 e 52 MT/kg dependendo da limpeza do saco. Não vendam a intermediários por menos de 28 MT na machamba!',
    category: 'mercado-precos',
    cropTag: 'Feijão nhemba',
    likes: ['usr_arsenio_02', 'usr_joaquim_03'],
    createdAt: '2026-10-23T09:10:00Z',
    comments: []
  }
];

export const ForumService = {
  /**
   * Get all forum posts from localStorage or default seed
   */
  getPosts(): ForumPost[] {
    try {
      const raw = localStorage.getItem(STORAGE_FORUM_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Error reading forum posts:', e);
    }

    this.savePosts(INITIAL_POSTS);
    return INITIAL_POSTS;
  },

  /**
   * Save posts to storage
   */
  savePosts(posts: ForumPost[]) {
    try {
      localStorage.setItem(STORAGE_FORUM_KEY, JSON.stringify(posts));
    } catch (e) {
      console.error('Error saving forum posts:', e);
    }
  },

  /**
   * Create a new forum post
   */
  createPost(
    user: User,
    data: {
      title: string;
      content: string;
      category: ForumCategory;
      cropTag: CropType | 'Geral';
    }
  ): ForumPost {
    const posts = this.getPosts();
    const newPost: ForumPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      authorId: user.id,
      authorName: user.name,
      authorZone: user.zone,
      authorCrop: user.crop,
      authorType: user.type,
      isExtensionist: user.type === 'Extensionista',
      title: data.title.trim(),
      content: data.content.trim(),
      category: data.category,
      cropTag: data.cropTag,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString()
    };

    const updated = [newPost, ...posts];
    this.savePosts(updated);

    // Notify community
    NotificationsService.sendPush(
      'Nova Publicação na Comunidade',
      `${user.name} partilhou "${newPost.title}" no fórum de Inhambane.`,
      'system'
    );

    return newPost;
  },

  /**
   * Toggle like on a post
   */
  toggleLikePost(postId: string, userId: string): { posts: ForumPost[]; isLiked: boolean; likesCount: number } {
    const posts = this.getPosts();
    let isLiked = false;
    let likesCount = 0;

    const updated = posts.map(p => {
      if (p.id !== postId) return p;
      const alreadyLiked = p.likes.includes(userId);
      const newLikes = alreadyLiked 
        ? p.likes.filter(id => id !== userId)
        : [...p.likes, userId];
      
      isLiked = !alreadyLiked;
      likesCount = newLikes.length;
      return { ...p, likes: newLikes };
    });

    this.savePosts(updated);
    return { posts: updated, isLiked, likesCount };
  },

  /**
   * Add comment to a post
   */
  addComment(
    user: User,
    postId: string,
    content: string
  ): { posts: ForumPost[]; newComment: ForumComment } {
    const posts = this.getPosts();
    const commentId = `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newComment: ForumComment = {
      id: commentId,
      postId,
      authorId: user.id,
      authorName: user.name,
      authorZone: user.zone,
      authorType: user.type,
      isExtensionist: user.type === 'Extensionista',
      content: content.trim(),
      likes: [],
      createdAt: new Date().toISOString()
    };

    let targetPostTitle = '';

    const updated = posts.map(p => {
      if (p.id !== postId) return p;
      targetPostTitle = p.title;
      return {
        ...p,
        comments: [...p.comments, newComment]
      };
    });

    this.savePosts(updated);

    // Send push notice
    NotificationsService.sendPush(
      'Novo Comentário no Fórum',
      `${user.name} comentou na publicação "${targetPostTitle.slice(0, 35)}...".`,
      'system'
    );

    return { posts: updated, newComment };
  },

  /**
   * Toggle like on a comment
   */
  toggleLikeComment(postId: string, commentId: string, userId: string): ForumPost[] {
    const posts = this.getPosts();

    const updated = posts.map(p => {
      if (p.id !== postId) return p;
      const newComments = p.comments.map(c => {
        if (c.id !== commentId) return c;
        const alreadyLiked = c.likes.includes(userId);
        const newLikes = alreadyLiked
          ? c.likes.filter(id => id !== userId)
          : [...c.likes, userId];
        return { ...c, likes: newLikes };
      });
      return { ...p, comments: newComments };
    });

    this.savePosts(updated);
    return updated;
  },

  /**
   * Delete post (author or extensionist only)
   */
  deletePost(postId: string, userId: string): ForumPost[] {
    const posts = this.getPosts();
    const updated = posts.filter(p => !(p.id === postId && (p.authorId === userId || p.authorId.startsWith('usr_arsenio'))));
    this.savePosts(updated);
    return updated;
  }
};
