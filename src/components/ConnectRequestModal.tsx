import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, Heart, MessageCircle, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { connectionRequestHelpers, isSupabaseConfigured } from '../lib/supabaseClient';

interface ConnectRequestModalProps {
  receiverProfileId: string;
  receiverName: string;
  currentUserId: string;
  onClose: () => void;
  onSendSuccess: () => void;
}

const proposalOptions = [
  { value: 'Silent Walk', key: 'connection.proposals.silentWalk', icon: '🚶‍♀️' },
  { value: 'Tea & Soul Talk', key: 'connection.proposals.teaTalk', icon: '🍵' },
  { value: 'Book Circle', key: 'connection.proposals.bookCircle', icon: '📚' },
  { value: 'Just Connect', key: 'connection.proposals.justConnect', icon: '💫' }
] as const;

export default function ConnectRequestModal({ 
  receiverProfileId, 
  receiverName, 
  currentUserId, 
  onClose, 
  onSendSuccess 
}: ConnectRequestModalProps) {
  const { t } = useTranslation();
  const [selectedProposal, setSelectedProposal] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [existingRequest, setExistingRequest] = useState<any>(null);

  // Check for existing request on mount
  useEffect(() => {
    const checkExisting = async () => {
      if (!isSupabaseConfigured) return;

      try {
        const { data, error } = await connectionRequestHelpers.checkExistingRequest(currentUserId, receiverProfileId);
        if (!error && data) {
          setExistingRequest(data);
        }
      } catch (error) {
        console.error('Error checking existing request:', error);
      }
    };

    checkExisting();
  }, [currentUserId, receiverProfileId]);

  // Clear status message after 5 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProposal) {
      setStatusMessage({ type: 'error', text: 'Bitte wähle einen Vorschlag aus.' });
      return;
    }

    if (!isSupabaseConfigured) {
      setStatusMessage({ type: 'error', text: 'Verbindung zur Datenbank nicht verfügbar.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const { data, error } = await connectionRequestHelpers.sendRequest(
        currentUserId,
        receiverProfileId,
        selectedProposal as any,
        message.trim() || undefined
      );

      if (error) {
        console.error('Error sending request:', error);
        if (error.code === '23505') { // Unique constraint violation
          setStatusMessage({ type: 'error', text: 'Du hast bereits eine Anfrage an diese Person gesendet.' });
        } else {
          setStatusMessage({ type: 'error', text: `Fehler beim Senden: ${error.message}` });
        }
      } else {
        setStatusMessage({ type: 'success', text: 'Kontaktanfrage erfolgreich gesendet!' });
        setTimeout(() => {
          onSendSuccess();
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error sending request:', error);
      setStatusMessage({ type: 'error', text: 'Unerwarteter Fehler beim Senden der Anfrage.' });
    } finally {
      setIsLoading(false);
    }
  };

  // If there's an existing request, show status instead of form
  if (existingRequest) {
    const isCurrentUserSender = existingRequest.sender_id === currentUserId;

    return (
      <div className="fixed inset-0 bg-deep-charcoal/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"> {/* Black */}
        <div className="bg-silver-100 rounded-xl max-w-md w-full shadow-2xl"> {/* Silver-100 */}
          <div className="flex items-center justify-between p-6 border-b border-stone-200">
            <div className="flex items-center space-x-3">
              <Heart size={20} className="text-burnt-sienna" /> {/* Lion */}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors duration-200"
            >
              <X size={20} className="text-silver-700" /> {/* Silver-700 */}
            </button>
          </div>

          <div className="p-6 text-center space-y-4">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${ /* This div will be updated in a later step */
              existingRequest.status === 'accepted' ? 'bg-deep-sage-green/10' : // Deep Sage Green
              existingRequest.status === 'pending' ? 'bg-muted-gold/10' : // Muted Gold
              'bg-burnt-sienna/10' // Lion
            }`}>
              {existingRequest.status === 'accepted' ? '✅' :
               existingRequest.status === 'pending' ? '⏳' : '❌'}
            </div>
            
            <div>
              <p className="text-sm text-silver-500"> {/* Silver-500 */}
                Vorschlag: {existingRequest.proposal_type}
              </p>
              {existingRequest.message && (
                <p className="text-sm text-silver-500 mt-2 italic"> {/* Silver-500 */}
                  "{existingRequest.message}"
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full bg-burnt-sienna text-pure-white py-3 px-6 rounded-lg font-medium hover:bg-burnt-sienna/80 transition-colors duration-200" // Lion
            >
              {t('common.understood')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-md z-50 flex items-center justify-center p-4 pb-24">
      <div className="bg-silver-100 rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl"> {/* Silver-100 */}
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <div className="flex items-center space-x-3">
            <Heart size={20} className="text-burnt-sienna" /> {/* Lion */}
            <h3 className="font-medium font-logo text-rhino">{t('connection.sendRequest')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors duration-200"
          >
            <X size={20} className="text-silver-700" /> {/* Silver-700 */}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] bg-white">
          {/* Status Message */}
          {statusMessage && (
            <div className={`rounded-lg p-4 flex items-center space-x-3 mb-6 ${ /* This div will be updated in a later step */
              statusMessage.type === 'success' ? 'bg-deep-sage-green/10 text-deep-sage-green border border-deep-sage-green/20' : // Deep Sage Green
              statusMessage.type === 'error' ? 'bg-burnt-sienna/10 text-burnt-sienna border border-burnt-sienna/20' : // Lion
              'bg-vibrant-teal/10 text-vibrant-teal border border-vibrant-teal/20' // Vibrant Teal
            }`}>
              {statusMessage.type === 'success' && <CheckCircle size={20} className="text-deep-sage-green" />} {/* Deep Sage Green */}
              {statusMessage.type === 'error' && <AlertCircle size={20} className="text-burnt-sienna" />} {/* Lion */}
              {statusMessage.type === 'info' && <AlertCircle size={20} className="text-vibrant-teal" />} {/* Vibrant Teal */}
              <span className="text-sm font-medium text-deep-charcoal">{statusMessage.text}</span> {/* Black */}
            </div>
          )}

          <form id="connect-request-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
              <p className="text-silver-500"> {/* Silver-500 */}
                {t('connection.contactQuestion', { name: receiverName })}
              </p>
              <p className="text-sm text-silver-500 mt-1"> {/* Silver-500 */}
                {t('connection.selectProposalAndMessage')}
              </p>
            </div>

              {/* Proposal Selection */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">
                  {t('connection.proposalType')} *
                </label>
                <div className="space-y-3">
                  {proposalOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedProposal === option.value
                          ? 'border-burnt-sienna/40 bg-burnt-sienna/10' // Lion
                          : 'border-silver-200 hover:border-burnt-sienna/20 hover:bg-burnt-sienna/5' // Silver-200, Lion
                      }`}
                    >
                      <input
                        type="radio"
                        name="proposal"
                        value={option.value}
                        checked={selectedProposal === option.value}
                        onChange={(e) => setSelectedProposal(e.target.value)}
                        className="mt-1 w-4 h-4 text-burnt-sienna border-silver-200 focus:ring-burnt-sienna" // Lion, Silver-200
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 text-deep-charcoal"> {/* Black */}
                          <span className="text-lg">{option.icon}</span>
                          <span className="font-medium">{t(`${option.key}.title`)}</span>
                        </div>
                        <p className="text-sm text-silver-500 mt-1">{t(`${option.key}.description`)}</p> {/* Silver-500 */}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Optional Message */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  {t('connection.message')} ({t('common.optional')})
                </label>
                <div className="relative">
                  <MessageCircle size={18} className="absolute left-3 top-3 text-silver-500" /> {/* Silver-500 */}
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-sandstone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200 resize-none"
                    rows={3}
                    placeholder={t('connection.messagePlaceholder')}
                    maxLength={500}
                  />
                </div>
                <p className="text-xs text-silver-500 mt-1"> {/* Silver-500 */}
                  {message.length}/500 {t('connection.characters')}
                </p>
              </div>

              {/* Privacy Notice */}
              <div className="bg-burnt-sienna/10 rounded-lg p-4"> {/* Lion/10 */}
                <div className="flex items-start space-x-3">
                  <Heart size={18} className="text-burnt-sienna flex-shrink-0 mt-0.5" /> {/* Lion */}
                  <div className="text-sm text-burnt-sienna"> {/* Lion */}
                    <div className="font-medium mb-1">{t('connection.privacyNotice.title')}</div>
                    <ul className="space-y-1 text-burnt-sienna"> {/* Lion */}
                      <li>• {t('connection.privacyNotice.contactSharing')}</li>
                      <li>• {t('connection.privacyNotice.canDecline')}</li>
                      <li>• {t('connection.privacyNotice.respectDecision')}</li>
                    </ul>
                  </div>
                </div>
              </div>
          </form>
        </div>

        {/* Fixed Footer with Submit Button */}
        <div className="p-6 border-t border-sandstone-300 bg-white rounded-b-xl">
          <button
            type="submit"
            form="connect-request-form"
            disabled={isLoading || !selectedProposal || !isSupabaseConfigured}
            className="w-full bg-burnt-sienna text-pure-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" // Lion
          >
            {isLoading ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span>{t('connection.sendingRequest')}</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>{t('connection.sendRequest')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}