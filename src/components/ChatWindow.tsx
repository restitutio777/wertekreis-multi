import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, MessageCircle, Loader, AlertCircle, RotateCw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { formatLocalizedTime } from '../utils/dateFormatting';

interface Message {
  id: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  conversation_id: string;
  is_read: boolean;
  sender_name?: string;
  sender_username?: string;
  receiver_name?: string;
  receiver_username?: string;
}

interface ChatWindowProps {
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
  onClose: () => void;
}

export default function ChatWindow({ currentUserId, otherUserId, otherUserName, onClose }: ChatWindowProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Effect to load messages when component mounts or user/other user changes
  useEffect(() => {
    loadMessages();
  }, [currentUserId, otherUserId]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load existing messages
  const loadMessages = async () => {
    if (!isSupabaseConfigured) return;

    try {
      // 1. Try to find an existing conversation ID
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        const { data: existingMessage, error: findError } = await supabase
          .from('messages')
          .select('conversation_id')
          .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
          .limit(1)
          .single();

        if (findError && findError.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error('Error finding existing conversation:', findError);
          setError(t('chat.errorLoadingMessages'));
          setIsLoading(false);
          return;
        }

        if (existingMessage) {
          currentConversationId = existingMessage.conversation_id;
          setConversationId(currentConversationId);
        }
      }

      // 2. If a conversation ID is found, load messages
      if (currentConversationId) {
        const { data, error } = await supabase
        .from('conversation_messages')
        .select('*') // Select all columns from the view
        .eq('conversation_id', currentConversationId)
        .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading messages:', error);
          setError(t('chat.errorLoadingMessages'));
        } else {
          setMessages(data || []);
          
          // Mark messages as read
          if (data && data.length > 0) {
            const unreadMessages = data.filter(msg => 
              msg.receiver_id === currentUserId && !msg.is_read
            );
            
            if (unreadMessages.length > 0) {
              await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('conversation_id', currentConversationId)
                .eq('receiver_id', currentUserId)
                .eq('is_read', false);
            }
          }
        }
      } else {
        // No existing conversation, so no messages to load yet
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError(t('chat.unexpectedErrorLoadingMessages'));
    } finally {
      setIsLoading(false);
    }
  };

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !isSupabaseConfigured || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      const messagePayload: { sender_id: string; receiver_id: string; content: string; conversation_id?: string } = {
        sender_id: currentUserId,
        receiver_id: otherUserId,
        content: newMessage.trim(),
      };

      // Only include conversation_id if it's already established
      if (conversationId) {
        messagePayload.conversation_id = conversationId;
      }

      const { data, error } = await supabase
        .from('messages')
        .insert([messagePayload])
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
      } else {
        loadMessages(); // Reload to ensure all messages are fetched with the new ID
        setNewMessage(''); // Clear the input
      }
    } catch (err) {
      console.error('Unerwarteter Fehler beim Senden der Nachricht:', err);
      setError(t('chat.unexpectedErrorSendingMessage'));
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!conversationId || !isSupabaseConfigured) return;

    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          const newMsg = payload.new as any;
          
          // Get the full message with sender/receiver names
          const { data } = await supabase
            .from('conversation_messages')
            .select('*')
            .eq('id', newMsg.id)
            .single();

          if (data) {
            setMessages(prev => [...prev, data]);
            
            // Mark as read if it's for the current user
            if (data.receiver_id === currentUserId) {
              await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', data.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, currentUserId, isSupabaseConfigured, t]); // Added t to deps for translation changes

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <div className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-cream rounded-xl max-w-md w-full shadow-2xl p-6">
          <div className="text-center">
            <AlertCircle size={48} className="text-warning-600 mx-auto mb-4" />
            <h3 className="font-medium text-rhino mb-2">Chat nicht verfügbar</h3>
            <p className="text-walnut text-sm mb-4">
              Die Chat-Funktion ist nicht verfügbar, da keine Datenbankverbindung besteht.
            </p>
            <button
              onClick={onClose}
              className="bg-rhino text-white py-2 px-4 rounded-lg font-medium hover:bg-rhino-700 transition-colors duration-200"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-md z-[60] flex items-center justify-center p-0 sm:p-4">
      <div className="bg-akaroa-50 rounded-none sm:rounded-2xl w-full h-full sm:max-w-lg sm:max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border-0 sm:border border-sandstone-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-rhino-900/95 to-rhino-800/95 backdrop-blur-md px-6 py-4 border-b border-rhino-700/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-desert to-desert-700 rounded-full flex items-center justify-center shadow-lg">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold font-logo text-cream text-lg">Chat mit {otherUserName}</h3>
                <p className="text-cream/70 text-sm">Verbundener Kontakt</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadMessages} // Call loadMessages to refresh
                className="p-2 hover:bg-rhino-700 rounded-lg transition-colors duration-200 active:scale-95"
                title={t('common.refresh')}
              >
                <RotateCw size={22} className="text-cream" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-rhino-700 rounded-lg transition-colors duration-200 active:scale-95"
              >
                <X size={22} className="text-cream" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-akaroa-50 to-akaroa-100 min-h-0 pb-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-rhino to-rhino-700 rounded-full flex items-center justify-center shadow-lg">
                  <Loader size={20} className="animate-spin text-white" />
                </div>
                <p className="text-walnut font-medium">Lade Nachrichten...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3 bg-error-50 rounded-xl p-6 border border-error-200">
                <AlertCircle size={32} className="text-error-600 mx-auto" />
                <div>
                  <p className="text-error-700 font-medium mb-2">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-desert hover:text-desert/80 underline text-sm font-medium"
                  >
                    Neu laden
                  </button>
                </div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 bg-cream/80 rounded-xl p-8 border border-sandstone-200 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-desert to-desert-700 rounded-full flex items-center justify-center shadow-lg mx-auto">
                  <MessageCircle size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold font-logo text-rhino mb-2">Noch keine Nachrichten</h4>
                  <p className="text-walnut text-sm">Schreibe die erste Nachricht und beginne das Gespräch!</p>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender_id === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-lg ${
                      isOwnMessage
                        ? 'bg-rhino-100 text-rhino border border-rhino-200 rounded-br-none'
                        : 'bg-cream text-walnut border border-sandstone-200 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed font-medium">{message.content}</p>
                    <p className={`text-xxs mt-2 ${isOwnMessage ? 'text-rhino/70' : 'text-walnut/70'}`}>
                      {formatLocalizedTime(new Date(message.created_at).toTimeString().slice(0, 5))}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="bg-akaroa-100 px-4 py-4 sm:px-6 sm:py-5 pb-safe-bottom border-t border-sandstone-300 flex-shrink-0">
          {error && (
            <div className="mb-3 p-3 bg-error-50 border border-error-200 rounded-lg">
              <p className="text-error-700 text-sm font-medium">{error}</p>
            </div>
          )}
          
          {/* Info text moved higher for better visibility */}
          <div className="mb-3 bg-desert/10 rounded-lg p-3 border border-desert/20">
            <p className="text-xxs text-desert text-center leading-tight font-medium">
              Enter zum Senden - deine Nachricht wird dann versendet,
            </p>
            <p className="text-xxs text-desert text-center leading-tight">
              erscheint jedoch noch nicht im Chat. (kein Echtzeit Chat)
            </p>
          </div>
          
          <div className="flex space-x-3 items-end">
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 bg-cream border border-sandstone-300 rounded-pill focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200 shadow-sm"
                placeholder="Nachricht schreiben..."
                disabled={isSending || !conversationId}
                maxLength={1000}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending || !conversationId}
              className="bg-desert text-white px-4 py-3 rounded-pill font-medium hover:bg-desert-700 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSending ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          {/* Character counter */}
          <div className="mt-2 flex justify-end">
            <span className="text-xxs text-walnut/80 font-medium">{newMessage.length}/1000 Zeichen</span>
          </div>
        </div>
      </div>
    </div>
  );
}