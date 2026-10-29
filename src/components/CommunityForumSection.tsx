import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Plus, 
  Search, 
  Filter, 
  Send, 
  Pin, 
  CheckCircle2, 
  UserCheck, 
  Sprout, 
  HelpCircle, 
  Bug, 
  TrendingUp, 
  Droplets, 
  Award, 
  Trash2, 
  Sparkles,
  Users,
  Copy,
  Clock
} from 'lucide-react';
import { User, CropType, DistrictZone } from '../types/auth';
import { ForumPost, ForumComment, ForumCategory } from '../types/forum';
import { ForumService } from '../services/forum';

interface CommunityForumSectionProps {
  user: User;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

const CATEGORIES: { id: ForumCategory | 'all'; label: string; icon: any }[] = [
  { id: 'all', label: 'Todas as Mensagens', icon: MessageSquare },
  { id: 'boas-praticas', label: 'Boas Práticas & Maneio', icon: Sprout },
  { id: 'duvidas', label: 'Dúvidas & Perguntas', icon: HelpCircle },
  { id: 'pragas-doencas', label: 'Pragas & Fitossanidade', icon: Bug },
  { id: 'mercado-precos', label: 'Mercado & Vendas', icon: TrendingUp },
  { id: 'clima-agua', label: 'Água & Clima', icon: Droplets },
  { id: 'sementes', label: 'Sementes & Variedades', icon: Award }
];

const AVAILABLE_CROPS: (CropType | 'Geral')[] = [
  'Geral',
  'Milho',
  'Mandioca',
  'Amendoim',
  'Feijão nhemba',
  'Mapira',
  'Caju',
  'Hortícolas',
  'Batata-doce',
  'Gergelim',
  'Banana',
  'Coco',
  'Feijão boer'
];

export const CommunityForumSection: React.FC<CommunityForumSectionProps> = ({
  user,
  onShowToast
}) => {
  const [posts, setPosts] = useState<ForumPost[]>(() => ForumService.getPosts());
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory | 'all'>('all');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Expanded comments map by post ID
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({
    'post_01_arsenio_biopesticida': true
  });
  
  // Active comment input text by post ID
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  
  // Create Post Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<ForumCategory>('boas-praticas');
  const [newPostCrop, setNewPostCrop] = useState<CropType | 'Geral'>(user.crop || 'Milho');

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Category filter
      if (selectedCategory !== 'all' && post.category !== selectedCategory) {
        return false;
      }
      // Crop filter
      if (selectedCrop !== 'all' && post.cropTag !== selectedCrop) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(query);
        const matchesContent = post.content.toLowerCase().includes(query);
        const matchesAuthor = post.authorName.toLowerCase().includes(query);
        const matchesZone = post.authorZone.toLowerCase().includes(query);
        if (!matchesTitle && !matchesContent && !matchesAuthor && !matchesZone) {
          return false;
        }
      }
      return true;
    });
  }, [posts, selectedCategory, selectedCrop, searchQuery]);

  // Overall community stats
  const communityStats = useMemo(() => {
    const totalPosts = posts.length;
    const totalComments = posts.reduce((acc, p) => acc + p.comments.length, 0);
    const totalLikes = posts.reduce((acc, p) => acc + p.likes.length, 0);
    const extensionistReplies = posts.reduce((acc, p) => 
      acc + p.comments.filter(c => c.isExtensionist).length + (p.isExtensionist ? 1 : 0), 0
    );

    return {
      totalPosts,
      totalComments,
      totalLikes,
      extensionistReplies
    };
  }, [posts]);

  // Handle Like Post
  const handleToggleLikePost = (postId: string) => {
    const { posts: updated, isLiked } = ForumService.toggleLikePost(postId, user.id);
    setPosts(updated);
    if (isLiked) {
      onShowToast('Apoiou esta publicação!', 'success');
    }
  };

  // Toggle comments expanded
  const handleToggleComments = (postId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Submit new comment
  const handleAddComment = (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    const { posts: updated } = ForumService.addComment(user, postId, content);
    setPosts(updated);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    onShowToast('Comentário publicado com sucesso!', 'success');

    // Ensure comment thread is open
    setExpandedComments(prev => ({ ...prev, [postId]: true }));
  };

  // Handle Like Comment
  const handleToggleLikeComment = (postId: string, commentId: string) => {
    const updated = ForumService.toggleLikeComment(postId, commentId, user.id);
    setPosts(updated);
  };

  // Handle Delete Post
  const handleDeletePost = (postId: string, title: string) => {
    if (window.confirm(`Tem a certeza que deseja eliminar a publicação "${title}"?`)) {
      const updated = ForumService.deletePost(postId, user.id);
      setPosts(updated);
      onShowToast('Publicação removida.', 'info');
    }
  };

  // Handle Create Post Submit
  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      onShowToast('Por favor, preencha o título e o conteúdo da mensagem.', 'info');
      return;
    }

    const created = ForumService.createPost(user, {
      title: newPostTitle,
      content: newPostContent,
      category: newPostCategory,
      cropTag: newPostCrop
    });

    setPosts(ForumService.getPosts());
    setShowCreateModal(false);
    setNewPostTitle('');
    setNewPostContent('');
    onShowToast(`Publicação "${created.title}" partilhada com a comunidade de Inhambane!`, 'success');
  };

  // Quick share copy
  const handleSharePost = (post: ForumPost) => {
    const text = `AgroResiliente Fórum:\n"${post.title}" por ${post.authorName} (${post.authorZone})\n\n${post.content.slice(0, 160)}...\n\nLeia mais na app AgroResiliente Inhambane.`;
    navigator.clipboard.writeText(text);
    onShowToast('Texto copiado para partilhar por WhatsApp ou SMS!', 'success');
  };

  // Helper relative time
  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = new Date().getTime() - new Date(isoString).getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) return 'Há momentos';
      if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
      if (diffDays === 1) return 'Ontem';
      if (diffDays < 7) return `Há ${diffDays} dias`;
      return new Date(isoString).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short' });
    } catch {
      return 'Recentemente';
    }
  };

  // Category Badge Helper
  const getCategoryInfo = (category: ForumCategory) => {
    const item = CATEGORIES.find(c => c.id === category);
    return item || { label: category, icon: MessageSquare };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Community Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-stone-900 via-emerald-950 to-stone-900 text-white shadow-xl relative overflow-hidden border border-emerald-900/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                <Users className="w-3.5 h-3.5" />
                <span>Espaço Comunitário & Extensão Rural</span>
              </span>
              <span className="text-white/30">·</span>
              <span className="text-xs text-stone-300">Homoíne · Maxixe · Massinga</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Fórum da Comunidade Agrícola
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1.5 max-w-xl leading-relaxed">
              Tire dúvidas com técnicos de extensão agrícola, partilhe receitas orgânicas, avise sobre pragas e informe preços de mercado na província de Inhambane.
            </p>
          </div>

          {/* Action button */}
          <div className="shrink-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Dúvida ou Prática</span>
            </button>
          </div>
        </div>

        {/* 4 Community Highlight Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-stone-800/80">
          <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 backdrop-blur-xs">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Publicações</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-display text-xl sm:text-2xl font-bold text-emerald-400">{communityStats.totalPosts}</span>
              <span className="text-xs text-stone-400">tópicos ativos</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 backdrop-blur-xs">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Apoio de Extensionistas</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-display text-xl sm:text-2xl font-bold text-emerald-400">{communityStats.extensionistReplies}</span>
              <span className="text-xs text-stone-400">orientações técnicas</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 backdrop-blur-xs">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Comentários & Dicas</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-display text-xl sm:text-2xl font-bold text-amber-400">{communityStats.totalComments}</span>
              <span className="text-xs text-stone-400">respostas da rede</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 backdrop-blur-xs">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Curtidas & Apoios</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-display text-xl sm:text-2xl font-bold text-amber-400">{communityStats.totalLikes}</span>
              <span className="text-xs text-stone-400">interações</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="space-y-3">
        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-700 text-white dark:bg-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter: Search and Crop Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por praga, sacha, mulching, adubo, localidade..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Crop Filter Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-xs text-stone-500 font-medium">Cultura:</span>
            <select
              value={selectedCrop}
              onChange={e => setSelectedCrop(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold focus:outline-none"
            >
              <option value="all">Todas as Culturas</option>
              {AVAILABLE_CROPS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
            <MessageSquare className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
            <h3 className="font-display text-base font-bold text-stone-800 dark:text-stone-200">
              Nenhuma mensagem encontrada
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mt-1 mb-4">
              Seja o primeiro a partilhar uma experiência de maneio ou colocar uma pergunta para a rede de produtores de Inhambane!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Nova Publicação</span>
            </button>
          </div>
        ) : (
          filteredPosts.map(post => {
            const isLiked = post.likes.includes(user.id);
            const isExpanded = !!expandedComments[post.id];
            const isAuthor = post.authorId === user.id;
            const categoryInfo = getCategoryInfo(post.category);
            const CategoryIcon = categoryInfo.icon;

            return (
              <div
                key={post.id}
                className={`p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border transition-all ${
                  post.pinned
                    ? 'border-emerald-300 dark:border-emerald-800 shadow-md ring-1 ring-emerald-500/20'
                    : 'border-stone-200 dark:border-stone-800 shadow-sm hover:border-emerald-500/40'
                }`}
              >
                {/* Pinned Badge if applicable */}
                {post.pinned && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-3 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full w-fit border border-emerald-200 dark:border-emerald-900">
                    <Pin className="w-3.5 h-3.5 fill-emerald-700 dark:fill-emerald-400" />
                    <span>Destaque Oficial da Extensão Agrícola · Homoíne</span>
                  </div>
                )}

                {/* Author Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {post.authorName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          {post.authorName}
                        </span>

                        {post.isExtensionist ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Extensionista</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[10px] font-semibold">
                            {post.authorType}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        <span>{post.authorZone}</span>
                        <span>·</span>
                        <span>{formatRelativeTime(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Right Badges & Options */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold">
                      <CategoryIcon className="w-3 h-3 text-emerald-600" />
                      <span>{categoryInfo.label}</span>
                    </span>

                    {post.cropTag && post.cropTag !== 'Geral' && (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200/60 dark:border-emerald-900/40">
                        {post.cropTag}
                      </span>
                    )}

                    {isAuthor && (
                      <button
                        onClick={() => handleDeletePost(post.id, post.title)}
                        className="p-1 text-stone-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Eliminar a minha publicação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <h3 className="font-display text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 mb-2 leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line mb-4">
                  {post.content}
                </p>

                {/* Post Interaction Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Like Button */}
                    <button
                      onClick={() => handleToggleLikePost(post.id)}
                      className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                        isLiked
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900/60'
                          : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{post.likes.length} {post.likes.length === 1 ? 'Apoio' : 'Apoios'}</span>
                    </button>

                    {/* Comments Toggle Button */}
                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className="px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{post.comments.length} {post.comments.length === 1 ? 'Resposta' : 'Respostas'}</span>
                    </button>
                  </div>

                  {/* Share button */}
                  <button
                    onClick={() => handleSharePost(post)}
                    className="px-2.5 py-1.5 rounded-xl text-stone-500 hover:text-emerald-700 dark:hover:text-emerald-400 font-semibold flex items-center gap-1.5 transition-colors"
                    title="Copiar para partilha no WhatsApp ou SMS"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Partilhar</span>
                  </button>
                </div>

                {/* Comments Section */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
                    {post.comments.length > 0 && (
                      <div className="space-y-2.5">
                        {post.comments.map(comment => {
                          const isCommentLiked = comment.likes.includes(user.id);

                          return (
                            <div
                              key={comment.id}
                              className={`p-3 rounded-2xl border text-xs ${
                                comment.isExtensionist
                                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-900/50'
                                  : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200/60 dark:border-stone-800'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-stone-900 dark:text-stone-100">
                                    {comment.authorName}
                                  </span>
                                  {comment.isExtensionist ? (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[9px] font-bold">
                                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                      <span>Técnico</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-stone-400">
                                      · {comment.authorZone}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-stone-400">
                                    {formatRelativeTime(comment.createdAt)}
                                  </span>

                                  <button
                                    onClick={() => handleToggleLikeComment(post.id, comment.id)}
                                    className={`flex items-center gap-1 text-[11px] font-semibold ${
                                      isCommentLiked ? 'text-rose-600' : 'text-stone-400 hover:text-stone-600'
                                    }`}
                                  >
                                    <Heart className={`w-3 h-3 ${isCommentLiked ? 'fill-rose-500' : ''}`} />
                                    {comment.likes.length > 0 && <span>{comment.likes.length}</span>}
                                  </button>
                                </div>
                              </div>

                              <p className="text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                                {comment.content}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* New Comment Input Box */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                        placeholder="Escreva um conselho ou comentário para o autor..."
                        className="flex-1 py-2 px-3 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />

                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Responder</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CREATE POST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-lg w-full p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                    Partilhar com a Comunidade
                  </h3>
                  <p className="text-xs text-stone-500">
                    A sua mensagem será visível para todos os produtores e extensionistas de Inhambane.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 flex items-center justify-center"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                  Título da Mensagem *
                </label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={e => setNewPostTitle(e.target.value)}
                  placeholder="Ex: Como combater lagarta no milho? ou Experiência com rega de manhã"
                  className="w-full py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                    Categoria do Tópico
                  </label>
                  <select
                    value={newPostCategory}
                    onChange={e => setNewPostCategory(e.target.value as ForumCategory)}
                    className="w-full py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                  >
                    <option value="boas-praticas">🌱 Boas Práticas & Maneio</option>
                    <option value="duvidas">❓ Dúvidas & Perguntas</option>
                    <option value="pragas-doencas">🐛 Pragas & Fitossanidade</option>
                    <option value="mercado-precos">💰 Mercado & Preços</option>
                    <option value="clima-agua">💧 Água & Clima</option>
                    <option value="sementes">🌾 Sementes & Variedades</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                    Cultura Relacionada
                  </label>
                  <select
                    value={newPostCrop}
                    onChange={e => setNewPostCrop(e.target.value as CropType | 'Geral')}
                    className="w-full py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                  >
                    {AVAILABLE_CROPS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                  Conteúdo / Descrição Detalhada *
                </label>
                <textarea
                  value={newPostContent}
                  onChange={e => setNewPostContent(e.target.value)}
                  rows={4}
                  placeholder="Descreva o que observou na machamba, o problema encontrado ou o método que resultou bem para si..."
                  className="w-full py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Author signature preview */}
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 text-stone-500 text-[11px] flex items-center justify-between">
                <span>Publicado como: <strong className="text-stone-800 dark:text-stone-200">{user.name}</strong></span>
                <span>Zona: <strong className="text-stone-800 dark:text-stone-200">{user.zone}</strong></span>
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs"
                >
                  Publicar no Fórum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
