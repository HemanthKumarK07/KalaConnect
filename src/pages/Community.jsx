import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Heart, Share2, Search, TrendingUp, Award, Shield, Calendar, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SectionReveal from '../components/SectionReveal';
import Button from '../components/Button';
import useCommunityStore from '../store/useCommunityStore';
import useAuthStore from '../store/useAuthStore';
import { communityTopics, monthlyChallenges } from '../data/community';
import { useToast } from '../components/Toast';
import SkeletonLoader from '../components/SkeletonLoader';
import './Community.css';

export default function Community() {
  const { t } = useTranslation('community');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  
  const { posts, loading, fetchPosts, toggleLike, addPost } = useCommunityStore();
  const { user, isAuthenticated } = useAuthStore();
  const { showToast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Filter by topic and search
  const filtered = posts.filter((p) => {
    const matchesTopic = selectedTopic === 'all' || p.topicId === selectedTopic;
    const matchesSearch =
      !searchQuery ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authorName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    if (!isAuthenticated) {
      showToast(t('post.loginToPost'), 'warning');
      return;
    }

    const success = await addPost({
      content: newPostContent,
      topicId: selectedTopic !== 'all' ? selectedTopic : 'topic-01',
      topic: selectedTopic !== 'all'
        ? communityTopics.find((t) => t.id === selectedTopic)?.name || 'General Discussion'
        : 'General Discussion',
    });
    
    if (success) {
      setNewPostContent('');
      showToast(t('post.postSuccess'), 'success');
    } else {
      showToast(t('post.postError'), 'error');
    }
  };

  return (
    <div className="community-page">
      {/* Hero */}
      <section className="community-hero">
        <div className="container">
          <SectionReveal animation="fade-up">
            <span className="tag" style={{ marginBottom: 'var(--space-4)', display: 'inline-block' }}>
              <Users size={12} /> {t('hero.tag')}
            </span>
            <h1 className="community-hero__title font-hero">
              {t('hero.title').split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
            </h1>
            <p className="community-hero__subtitle">
              {t('hero.subtitle')}
            </p>
          </SectionReveal>
        </div>
      </section>

      <div className="container">
        <div className="community-layout">
          {/* Main Feed */}
          <div className="community-feed">
            {/* Search */}
            <div className="community-search">
              <Search size={18} style={{ color: 'var(--color-text-tertiary)' }} />
              <input
                type="text"
                placeholder={t('search.placeholder')}
                className="community-search__input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Create Post */}
            <div className="community-create">
              <div className="community-create__avatar">
                {isAuthenticated && user?.name
                  ? user.name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : '?'}
              </div>
              <form onSubmit={handleCreatePost} style={{ flex: 1 }}>
                <input
                  type="text"
                  className="input"
                  placeholder={t('post.postPlaceholder')}
                  style={{ border: 'none', background: 'transparent', padding: 0 }}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                  <Button type="submit" variant="accent" size="sm" disabled={!newPostContent.trim()}>
                    {t('post.post')}
                  </Button>
                </div>
              </form>
            </div>

            {/* Posts */}
            <div className="community-posts">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="community-post card" style={{ padding: 'var(--space-5)' }}>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                      <SkeletonLoader type="avatar" />
                      <div style={{ flex: 1 }}>
                        <SkeletonLoader type="text" style={{ width: '120px', height: '16px', marginBottom: '5px' }} />
                        <SkeletonLoader type="text" style={{ width: '80px', height: '12px' }} />
                      </div>
                    </div>
                    <SkeletonLoader type="text" count={3} />
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div className="community-empty">
                  <div className="community-empty__icon">💬</div>
                  <p className="community-empty__text">
                    {searchQuery ? t('empty.noPostsHint') : t('empty.noPosts')}
                  </p>
                </div>
              ) : (
                filtered.map((post, i) => (
                  <SectionReveal key={post._id} animation="fade-up" delay={i * 0.05}>
                    <article className="community-post card">
                      <div className="community-post__header">
                        <div
                          className="avatar avatar--sm"
                          style={{
                            background: [
                              'linear-gradient(135deg, #C9A66B, #8A6A4A)',
                              'linear-gradient(135deg, #4F6958, #3A5042)',
                              'linear-gradient(135deg, #6B5C7A, #4A3F5C)',
                              'linear-gradient(135deg, #C4A882, #5C4A35)',
                            ][i % 4],
                          }}
                        >
                          {post.authorName?.charAt(0) || '?'}
                        </div>
                        <div className="community-post__author-info">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <span className="community-post__author-name">{post.authorName || 'Unknown'}</span>
                            {post.authorRole === 'Verified Artisan' && (
                              <Shield size={13} style={{ color: 'var(--color-forest)' }} />
                            )}
                          </div>
                          <span className="community-post__meta">
                            {post.authorRole || 'Member'} • {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {post.title && <h3 className="community-post__title">{post.title}</h3>}
                      <p className="community-post__content">{post.content}</p>

                      <div className="community-post__actions">
                        <button
                          className={`community-post__action ${user && post.likedBy?.includes(user._id) ? 'liked' : ''}`}
                          onClick={() => {
                            if (!isAuthenticated) return showToast(t('post.loginToPost'), 'warning');
                            toggleLike(post._id);
                          }}
                        >
                          <Heart size={16} fill={user && post.likedBy?.includes(user._id) ? 'currentColor' : 'none'} />
                          <span className="font-number">{post.likes}</span>
                        </button>
                        <button className="community-post__action">
                          <MessageSquare size={16} />
                          <span className="font-number">{post.comments}</span>
                        </button>
                        <button className="community-post__action">
                          <Share2 size={16} />
                          <span className="font-number">{post.shares}</span>
                        </button>
                      </div>
                    </article>
                  </SectionReveal>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="community-sidebar">
            {/* Topics */}
            <div className="community-sidebar__section">
              <h3 className="community-sidebar__title">Topics</h3>
              <div className="community-topics">
                <button
                  className={`community-topic ${selectedTopic === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedTopic('all')}
                >
                  <span>🌐</span>
                  <span>{t('topics.all')}</span>
                </button>
                {communityTopics.map((topic) => (
                  <button
                    key={topic.id}
                    className={`community-topic ${selectedTopic === topic.id ? 'active' : ''}`}
                    onClick={() => setSelectedTopic(topic.id)}
                  >
                    <span>{topic.icon}</span>
                    <span>{topic.name}</span>
                    <span className="font-number community-topic__count">{topic.posts}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Challenge */}
            <div className="community-sidebar__section">
              <h3 className="community-sidebar__title">
                <Award size={16} /> {t('challenges.title')}
              </h3>
              {monthlyChallenges
                .filter((c) => c.status === 'active')
                .map((ch) => (
                  <div key={ch.id} className="community-challenge">
                    <h4
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 600,
                        marginBottom: 'var(--space-2)',
                      }}
                    >
                      {ch.title}
                    </h4>
                    <p
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-secondary)',
                        marginBottom: 'var(--space-3)',
                        lineHeight: 'var(--leading-relaxed)',
                      }}
                    >
                      {ch.description}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-tertiary)',
                      }}
                    >
                      <span>
                        <Users size={12} /> {t('challenges.participants', { count: ch.participants })}
                      </span>
                      <span>
                        <Calendar size={12} /> Ends{' '}
                        {new Date(ch.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Trending */}
            <div className="community-sidebar__section">
              <h3 className="community-sidebar__title">
                <TrendingUp size={16} /> Trending
              </h3>
              <div className="community-trending">
                {[...posts]
                  .sort((a, b) => b.likes - a.likes)
                  .slice(0, 3)
                  .map((p, i) => (
                    <div key={p.id} className="community-trending-item">
                      <span
                        className="font-number"
                        style={{
                          fontSize: 'var(--text-lg)',
                          fontWeight: 700,
                          color: 'var(--color-accent)',
                          width: '28px',
                        }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <p
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 500,
                            lineHeight: 'var(--leading-snug)',
                          }}
                        >
                          {p.title || p.content?.substring(0, 60) + '...'}
                        </p>
                        <p
                          style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-tertiary)',
                            marginTop: '2px',
                          }}
                        >
                          {p.likes} likes
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
