import { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, Badge } from '../../components/ui';
import * as postsService from '../../services/posts.service';

/**
 * Stylist Portfolio Page
 * Manage portfolio posts and showcase work
 */
const StylistPortfolio = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const [postData, setPostData] = useState({
    caption: '',
    images: [],
    hashtags: '',
  });

  useEffect(() => {
    loadPosts();
  }, []);

  /**
   * Load portfolio posts
   */
  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const response = await postsService.getPosts();
      setPosts(response.data || response);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle create post
   */
  const handleCreatePost = async () => {
    try {
      await postsService.createPost(postData);
      setShowCreateModal(false);
      setPostData({ caption: '', images: [], hashtags: '' });
      loadPosts();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  /**
   * Handle delete post
   */
  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postsService.deletePost(postId);
        loadPosts();
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Portfolio</h1>
            <p className="text-gray-400">Showcase your best work to attract clients</p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Post
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <p className="text-gray-400 text-sm mb-1">Total Posts</p>
            <p className="text-3xl font-bold text-white">{posts.length}</p>
          </Card>
          <Card>
            <p className="text-gray-400 text-sm mb-1">Total Likes</p>
            <p className="text-3xl font-bold text-yellow-400">1,234</p>
          </Card>
          <Card>
            <p className="text-gray-400 text-sm mb-1">Total Comments</p>
            <p className="text-3xl font-bold text-blue-400">256</p>
          </Card>
          <Card>
            <p className="text-gray-400 text-sm mb-1">Engagement Rate</p>
            <p className="text-3xl font-bold text-green-400">8.5%</p>
          </Card>
        </div>

        {/* Portfolio Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="p-0 overflow-hidden cursor-pointer group relative"
                onClick={() => setSelectedPost(post)}
              >
                <div className="aspect-square bg-gray-700 relative">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                    <div className="text-white text-sm flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      {post.likes_count || 0}
                    </div>
                    <div className="text-white text-sm flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                      {post.comments_count || 0}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <div className="text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg mb-2">No posts yet</p>
              <p className="text-sm mb-6">Start building your portfolio by creating your first post</p>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Create Your First Post
              </Button>
            </div>
          </Card>
        )}

        {/* Create Post Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setPostData({ caption: '', images: [], hashtags: '' });
          }}
          title="Create New Post"
        >
          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Images
              </label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-yellow-400 transition-colors cursor-pointer">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-400 text-sm mb-2">Drag & drop or click to upload</p>
                <p className="text-gray-500 text-xs">PNG, JPG up to 10MB</p>
              </div>
            </div>

            {/* Caption */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Caption
              </label>
              <textarea
                value={postData.caption}
                onChange={(e) => setPostData(prev => ({ ...prev, caption: e.target.value }))}
                rows={4}
                placeholder="Write a caption for your post..."
                className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
              />
            </div>

            {/* Hashtags */}
            <Input
              type="text"
              label="Hashtags"
              placeholder="#haircut #hairstyle #beauty"
              value={postData.hashtags}
              onChange={(e) => setPostData(prev => ({ ...prev, hashtags: e.target.value }))}
              fullWidth
              helpText="Separate hashtags with spaces"
            />

            {/* Actions */}
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setShowCreateModal(false);
                  setPostData({ caption: '', images: [], hashtags: '' });
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" fullWidth onClick={handleCreatePost}>
                Publish Post
              </Button>
            </div>
          </div>
        </Modal>

        {/* Post Detail Modal */}
        <Modal
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          title="Post Details"
        >
          {selectedPost && (
            <div className="space-y-4">
              <img
                src={selectedPost.image || '/placeholder-image.png'}
                alt={selectedPost.caption}
                className="w-full rounded-lg"
              />
              <p className="text-white">{selectedPost.caption}</p>
              <div className="flex items-center space-x-4 text-gray-400 text-sm">
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  {selectedPost.likes_count || 0} likes
                </span>
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  {selectedPost.comments_count || 0} comments
                </span>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" fullWidth>
                  Edit
                </Button>
                <Button variant="danger" fullWidth onClick={() => handleDeletePost(selectedPost.id)}>
                  Delete
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default StylistPortfolio;
