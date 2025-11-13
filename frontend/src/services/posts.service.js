/**
 * SALON PWA - Posts Service
 * API calls for managing portfolio posts (stylist gallery)
 */

import { get, post, put, del, upload } from './api';

/**
 * Get all posts with optional filters
 * @param {Object} filters - Filter parameters
 * @param {string} filters.stylist_id - Filter by stylist ID
 * @param {string} filters.category - Filter by category/tag
 * @param {string} filters.sort - Sort field (created_at, likes_count)
 * @param {string} filters.order - Sort order (asc, desc)
 * @param {number} filters.page - Page number
 * @param {number} filters.per_page - Items per page
 * @returns {Promise<Object>} Posts list with pagination
 */
export const getPosts = async (filters = {}) => {
  const response = await get('/posts', { params: filters });
  return response.data;
};

/**
 * Get single post by ID
 * @param {string|number} id - Post ID
 * @returns {Promise<Object>} Post data with images and comments
 */
export const getPost = async (id) => {
  const response = await get(`/posts/${id}`);
  return response.data;
};

/**
 * Create new post with images
 * @param {Object} data - Post data
 * @param {string} data.title - Post title
 * @param {string} data.description - Post description
 * @param {Array<string>} data.tags - Post tags/categories
 * @param {Array<File>} images - Image files
 * @param {Function} onUploadProgress - Progress callback
 * @returns {Promise<Object>} Created post
 */
export const createPost = async (data, images = [], onUploadProgress) => {
  const formData = new FormData();

  // Add post data
  formData.append('title', data.title);
  formData.append('description', data.description);

  // Add tags
  if (data.tags && data.tags.length > 0) {
    data.tags.forEach((tag, index) => {
      formData.append(`tags[${index}]`, tag);
    });
  }

  // Add images
  images.forEach((image, index) => {
    formData.append(`images[${index}]`, image);
  });

  const response = await upload('/posts', formData, onUploadProgress);
  return response.data;
};

/**
 * Update existing post
 * @param {string|number} id - Post ID
 * @param {Object} data - Updated post data
 * @returns {Promise<Object>} Updated post
 */
export const updatePost = async (id, data) => {
  const response = await put(`/posts/${id}`, data);
  return response.data;
};

/**
 * Delete post
 * @param {string|number} id - Post ID
 * @returns {Promise<void>}
 */
export const deletePost = async (id) => {
  await del(`/posts/${id}`);
};

/**
 * Like/unlike a post
 * @param {string|number} id - Post ID
 * @returns {Promise<Object>} Updated post with like status
 */
export const likePost = async (id) => {
  const response = await post(`/posts/${id}/like`);
  return response.data;
};

/**
 * Unlike a post
 * @param {string|number} id - Post ID
 * @returns {Promise<Object>} Updated post with like status
 */
export const unlikePost = async (id) => {
  const response = await del(`/posts/${id}/like`);
  return response.data;
};

/**
 * Get post comments
 * @param {string|number} id - Post ID
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @returns {Promise<Object>} Comments with pagination
 */
export const getPostComments = async (id, page = 1, perPage = 20) => {
  const response = await get(`/posts/${id}/comments`, {
    params: { page, per_page: perPage },
  });
  return response.data;
};

/**
 * Comment on a post
 * @param {string|number} id - Post ID
 * @param {string} comment - Comment text
 * @returns {Promise<Object>} Created comment
 */
export const commentOnPost = async (id, comment) => {
  const response = await post(`/posts/${id}/comments`, { comment });
  return response.data;
};

/**
 * Delete a comment
 * @param {string|number} postId - Post ID
 * @param {string|number} commentId - Comment ID
 * @returns {Promise<void>}
 */
export const deleteComment = async (postId, commentId) => {
  await del(`/posts/${postId}/comments/${commentId}`);
};

/**
 * Get trending posts
 * @param {number} limit - Number of posts to fetch
 * @returns {Promise<Array>} Trending posts
 */
export const getTrendingPosts = async (limit = 10) => {
  const response = await get('/posts/trending', {
    params: { limit },
  });
  return response.data;
};

/**
 * Get posts from followed stylists (feed)
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @returns {Promise<Object>} Feed posts with pagination
 */
export const getFeedPosts = async (page = 1, perPage = 20) => {
  const response = await get('/posts/feed', {
    params: { page, per_page: perPage },
  });
  return response.data;
};

/**
 * Search posts by tags or description
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} Search results
 */
export const searchPosts = async (query, filters = {}) => {
  const response = await get('/posts/search', {
    params: { q: query, ...filters },
  });
  return response.data;
};

/**
 * Add image to existing post
 * @param {string|number} id - Post ID
 * @param {File} image - Image file
 * @returns {Promise<Object>} Updated post
 */
export const addPostImage = async (id, image) => {
  const formData = new FormData();
  formData.append('image', image);

  const response = await post(`/posts/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Delete image from post
 * @param {string|number} postId - Post ID
 * @param {string|number} imageId - Image ID
 * @returns {Promise<void>}
 */
export const deletePostImage = async (postId, imageId) => {
  await del(`/posts/${postId}/images/${imageId}`);
};

export default {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getPostComments,
  commentOnPost,
  deleteComment,
  getTrendingPosts,
  getFeedPosts,
  searchPosts,
  addPostImage,
  deletePostImage,
};
