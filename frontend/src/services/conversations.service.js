/**
 * SALON PWA - Conversations Service
 * API calls for managing chat conversations and messages
 */

import { get, post, patch, del } from './api';

/**
 * Get all conversations for current user
 * @param {Object} filters - Filter parameters
 * @param {boolean} filters.unread_only - Show only unread conversations
 * @param {number} filters.page - Page number
 * @param {number} filters.per_page - Items per page
 * @returns {Promise<Object>} Conversations list with pagination
 */
export const getConversations = async (filters = {}) => {
  try {
    const response = await get('/conversations', { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single conversation by ID
 * @param {string|number} id - Conversation ID
 * @returns {Promise<Object>} Conversation data with participants
 */
export const getConversation = async (id) => {
  try {
    const response = await get(`/conversations/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new conversation
 * @param {string|number} recipientId - Recipient user ID
 * @param {string} message - Initial message (optional)
 * @returns {Promise<Object>} Created conversation
 */
export const createConversation = async (recipientId, message = null) => {
  try {
    const data = { recipient_id: recipientId };
    if (message) data.message = message;

    const response = await post('/conversations', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get messages in a conversation
 * @param {string|number} conversationId - Conversation ID
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @returns {Promise<Object>} Messages with pagination
 */
export const getMessages = async (conversationId, page = 1, perPage = 50) => {
  try {
    const response = await get(`/conversations/${conversationId}/messages`, {
      params: { page, per_page: perPage },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Send message in conversation
 * @param {string|number} conversationId - Conversation ID
 * @param {string} message - Message text
 * @param {Array<File>} attachments - Optional file attachments
 * @returns {Promise<Object>} Sent message
 */
export const sendMessage = async (conversationId, message, attachments = []) => {
  try {
    if (attachments.length > 0) {
      // Send with attachments using FormData
      const formData = new FormData();
      formData.append('message', message);
      attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });

      const response = await post(`/conversations/${conversationId}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } else {
      // Send text-only message
      const response = await post(`/conversations/${conversationId}/messages`, { message });
      return response.data;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Mark conversation as read
 * @param {string|number} conversationId - Conversation ID
 * @returns {Promise<Object>} Updated conversation
 */
export const markAsRead = async (conversationId) => {
  try {
    const response = await patch(`/conversations/${conversationId}/read`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark message as read
 * @param {string|number} conversationId - Conversation ID
 * @param {string|number} messageId - Message ID
 * @returns {Promise<Object>} Updated message
 */
export const markMessageAsRead = async (conversationId, messageId) => {
  try {
    const response = await patch(`/conversations/${conversationId}/messages/${messageId}/read`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete conversation
 * @param {string|number} conversationId - Conversation ID
 * @returns {Promise<void>}
 */
export const deleteConversation = async (conversationId) => {
  try {
    await del(`/conversations/${conversationId}`);
  } catch (error) {
    throw error;
  }
};

/**
 * Delete message
 * @param {string|number} conversationId - Conversation ID
 * @param {string|number} messageId - Message ID
 * @returns {Promise<void>}
 */
export const deleteMessage = async (conversationId, messageId) => {
  try {
    await del(`/conversations/${conversationId}/messages/${messageId}`);
  } catch (error) {
    throw error;
  }
};

/**
 * Get unread message count
 * @returns {Promise<Object>} Unread count
 */
export const getUnreadCount = async () => {
  try {
    const response = await get('/conversations/unread-count');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Search conversations
 * @param {string} query - Search query
 * @returns {Promise<Object>} Search results
 */
export const searchConversations = async (query) => {
  try {
    const response = await get('/conversations/search', {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Mute conversation notifications
 * @param {string|number} conversationId - Conversation ID
 * @returns {Promise<Object>} Updated conversation
 */
export const muteConversation = async (conversationId) => {
  try {
    const response = await patch(`/conversations/${conversationId}/mute`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Unmute conversation notifications
 * @param {string|number} conversationId - Conversation ID
 * @returns {Promise<Object>} Updated conversation
 */
export const unmuteConversation = async (conversationId) => {
  try {
    const response = await patch(`/conversations/${conversationId}/unmute`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Start typing indicator
 * @param {string|number} conversationId - Conversation ID
 * @returns {Promise<void>}
 */
export const startTyping = async (conversationId) => {
  try {
    await post(`/conversations/${conversationId}/typing`);
  } catch (error) {
    // Silently fail for typing indicators
    console.error('Typing indicator failed:', error);
  }
};

export default {
  getConversations,
  getConversation,
  createConversation,
  getMessages,
  sendMessage,
  markAsRead,
  markMessageAsRead,
  deleteConversation,
  deleteMessage,
  getUnreadCount,
  searchConversations,
  muteConversation,
  unmuteConversation,
  startTyping,
};
