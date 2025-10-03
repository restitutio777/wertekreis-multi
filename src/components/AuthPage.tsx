import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, KeyRound, Home } from 'lucide-react';
import { authHelpers } from '../lib/supabaseClient';
import SoulCirclesText from './SoulCirclesText';
import LanguageSelector from './LanguageSelector';

type AuthFlow = 'login' | 'signup' | 'forgotPassword' | 'resetPassword';

interface AuthPageProps {
  onAuthSuccess: () => void;
  onNavigate: (page: string) => void;
  initialAuthFlow?: AuthFlow;
}

export default function AuthPage({ onAuthSuccess, onNavigate, initialAuthFlow = 'login' }: AuthPageProps) {
  const { t } = useTranslation();
  const [authFlow, setAuthFlow] = useState<AuthFlow>(initialAuthFlow);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Update authFlow when initialAuthFlow prop changes
  useEffect(() => {
    setAuthFlow(initialAuthFlow);
  }, [initialAuthFlow]);

  // Check for password reset flow on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    
    if (type === 'recovery') {
      setAuthFlow('resetPassword');
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const validatePassword = (pwd: string): boolean => {
    return pwd.length >= 6;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (authFlow === 'login') {
        const { error } = await authHelpers.signIn(email, password);
        if (error) throw error;
        onAuthSuccess();
      } else if (authFlow === 'signup') {
        if (!validatePassword(password)) {
          throw new Error('Das Passwort muss mindestens 6 Zeichen lang sein');
        }
        if (password !== confirmPassword) {
          throw new Error('Die Passwörter stimmen nicht überein');
        }
        
        const { error } = await authHelpers.signUp(email, password, {
          username,
          display_name: displayName
        });
        if (error) throw error;
        
        setMessage({
          type: 'success',
          text: 'Registrierung erfolgreich! Bitte überprüfe deine E-Mails zur Bestätigung.'
        });
      } else if (authFlow === 'forgotPassword') {
        const { error } = await authHelpers.resetPasswordForEmail(email);
        if (error) throw error;
        
        setMessage({
          type: 'success',
          text: 'Ein Link zum Zurücksetzen des Passworts wurde an deine E-Mail-Adresse gesendet.'
        });
      } else if (authFlow === 'resetPassword') {
        if (!validatePassword(password)) {
          throw new Error('Das Passwort muss mindestens 6 Zeichen lang sein');
        }
        if (password !== confirmPassword) {
          throw new Error('Die Passwörter stimmen nicht überein');
        }
        
        const { error } = await authHelpers.updatePassword(password);
        if (error) throw error;
        
        setMessage({
          type: 'success',
          text: 'Passwort erfolgreich zurückgesetzt! Du wirst zur Anmeldung weitergeleitet.'
        });
        
        // Redirect to login after successful password reset
        setTimeout(() => {
          setAuthFlow('login');
          setPassword('');
          setConfirmPassword('');
          setMessage(null);
        }, 2000);
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Ein Fehler ist aufgetreten'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setAuthFlow(authFlow === 'login' ? 'signup' : 'login');
    setMessage(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    setDisplayName('');
  };

  const getFlowIcon = () => {
    switch (authFlow) {
      case 'login':
        return <Lock className="w-8 h-8 text-purple-600" />;
      case 'signup':
        return <User className="w-8 h-8 text-purple-600" />;
      case 'forgotPassword':
        return <Mail className="w-8 h-8 text-blue-600" />;
      case 'resetPassword':
        return <KeyRound className="w-8 h-8 text-green-600" />;
    }
  };

  const getFlowTitle = () => {
    switch (authFlow) {
      case 'login':
        return t('auth.login');
      case 'signup':
        return t('auth.createProfile');
      case 'forgotPassword':
        return t('auth.resetPassword');
      case 'resetPassword':
        return t('auth.resetPassword');
    }
  };

  const getFlowDescription = () => {
    switch (authFlow) {
      case 'login':
        return t('auth.welcomeBack');
      case 'signup':
        return t('auth.joinCommunity');
      case 'forgotPassword':
        return t('auth.resetPassword');
      case 'resetPassword':
        return t('auth.resetPassword');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-cream flex items-center justify-center px-3 py-4 md:p-4 relative">
        {/* Background Image with Overlay */}
        <div className="fixed inset-0 z-0">
          <img 
            src="/topglobe copy.jpg" 
            alt="Werte•Kreis Background" 
            className="w-full h-full object-cover object-center sm:object-center lg:object-center"
            style={{ 
              imageRendering: 'crisp-edges',
              filter: 'contrast(1.1) brightness(1.05) saturate(1.1)',
              transform: 'scale(1.1)',
              transformOrigin: 'center center'
            }}
          />
          {/* Minimal overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-akaroa-100/60 via-akaroa-200/60 to-akaroa-300/70"></div>
          {/* Very subtle accent overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-rhino/8 via-transparent to-walnut/12"></div>
        </div>

        <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
          {/* Desktop Navigation Button */}
          <div className="lg:flex hidden mb-4 relative z-10">
            <button
              onClick={() => onNavigate('home')}
              className="bg-akaroa-100 text-rhino hover:bg-akaroa-200 rounded-lg transition-colors duration-200 p-2 flex items-center space-x-2"
              title="Zurück zur Startseite"
            >
              <Home size={20} />
              <span className="text-sm font-medium">Startseite</span>
            </button>
          </div>

          <div className="bg-cream/70 backdrop-blur-[15px] rounded-2xl shadow-glass-card overflow-hidden relative z-10 border border-sandstone-300/50">
            {/* Header */}
            <div className="bg-akaroa-100/60 backdrop-blur-[10px] px-8 py-6 text-center shadow-glass-summary border-b border-sandstone-300/50">
              {/* Soul Circles Branding */}
              <div className="mb-4 relative">
                {/* Enhanced background for logo visibility */}
                <div className="absolute inset-0 bg-rhino/5 backdrop-blur-[5px] rounded-lg border border-rhino/10"></div>
                <div className="relative z-10 py-2">
                  <SoulCirclesText variant="monochrome" size="lg" className="relative" />
                </div>
              </div>
              
              {/* Password Reset Help */}
              {authFlow === 'forgotPassword' && (
                <div className="bg-rhino/15 backdrop-blur-[8px] rounded-lg p-4 border border-rhino/20 shadow-glass-card">
                  <div className="text-sm text-desert">
                    <div className="font-medium mb-2 text-rhino">Keine E-Mail erhalten?</div>
                    <div className="space-y-2 text-walnut">
                      <p><strong>Bitte überprüfen Sie:</strong></p>
                      <ul className="space-y-1 ml-4 text-walnut">
                        <li>• Ihren Spam-/Junk-Ordner</li>
                        <li>• Die korrekte E-Mail-Adresse</li>
                        <li>• Warten Sie 5-10 Minuten (E-Mails können verzögert ankommen)</li>
                      </ul>
                      <div className="mt-3 pt-2 border-t border-walnut/30">
                        <p className="text-xs text-walnut">
                          <strong>Immer noch keine E-Mail?</strong><br />
                          Versuchen Sie den Vorgang erneut oder kontaktieren Sie unseren Support unter{' '}
                          <a href="mailto:werte-im-wandel@mailbox.org" className="underline hover:text-rhino">
                            werte-im-wandel@mailbox.org
                          </a>
                        </p>
                        <p className="text-xs mt-1 text-walnut">
                          Geben Sie dabei Ihre E-Mail-Adresse und den Zeitpunkt der Anfrage an.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <h1 className="text-2xl font-light font-logo text-rhino mb-2">
                {getFlowTitle()}
              </h1>
              <p className="text-walnut/80 text-sm font-light">
                {authFlow === 'signup' ? t('auth.findWhatLives') : getFlowDescription()}
              </p>
              
              {/* Language Selector */}
              <div className="mt-4 flex justify-center">
                <LanguageSelector />
              </div>
            </div>

            {/* Form Content */}
            <div className="px-6 py-8 md:p-8">
              {/* Message Display */}
              {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                  message.type === 'success' 
                    ? 'bg-success-50/80 backdrop-blur-[5px] border border-success-200/70 text-success-700' 
                    : 'bg-error-50/80 backdrop-blur-[5px] border border-error-200/70 text-error-700'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0" />
                  )}
                  <span className="text-sm">{message.text}</span>
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-6">
                {/* Email Field (all flows except resetPassword) */}
                {authFlow !== 'resetPassword' && (
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-walnut mb-2">
                      {t('auth.email')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-walnut w-5 h-5" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200"
                        placeholder={t('auth.email')}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Username Field (signup only) */}
                {authFlow === 'signup' && (
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-walnut mb-2">
                      {t('auth.username')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-walnut w-5 h-5" />
                      <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200"
                        placeholder={t('auth.username')}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Display Name Field (signup only) */}
                {authFlow === 'signup' && (
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-walnut mb-2">
                      {t('auth.displayName')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-walnut w-5 h-5" />
                      <input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200"
                        placeholder={t('auth.displayName')}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Password Field (login, signup, resetPassword) */}
                {authFlow !== 'forgotPassword' && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-walnut mb-2">
                      {t('auth.password')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-walnut w-5 h-5" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                          authFlow !== 'login' && password && !validatePassword(password)
                            ? 'border-error-300 bg-error-50/80 backdrop-blur-[5px]'
                            : 'bg-cream/80 backdrop-blur-[5px] border-sandstone-300/60'
                        }`}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-walnut hover:text-rhino transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {authFlow !== 'login' && password && !validatePassword(password) && (
                      <p className="mt-1 text-sm text-error-600">
                        {t('auth.passwordMinLength')}
                      </p>
                    )}
                  </div>
                )}

                {/* Confirm Password Field (signup, resetPassword) */}
                {(authFlow === 'signup' || authFlow === 'resetPassword') && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-walnut mb-2">
                      {t('auth.confirmPassword')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-walnut w-5 h-5" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                          confirmPassword && password !== confirmPassword
                            ? 'border-error-300 bg-error-50/80 backdrop-blur-[5px]'
                            : 'bg-cream/80 backdrop-blur-[5px] border-sandstone-300/60'
                        }`}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-walnut hover:text-rhino transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="mt-1 text-sm text-error-600">
                        {t('auth.passwordsDoNotMatch')}
                      </p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-desert/70 backdrop-blur-[8px] text-white py-3 px-4 rounded-lg font-medium shadow-glass-button hover:shadow-glass-button-hover hover:bg-desert/80 focus:outline-none focus:ring-2 focus:ring-desert focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-desert-600/50 hover:border-desert-600/60 transform hover:scale-[1.02] active:scale-[0.99]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t('auth.processing')}
                    </div>
                  ) : (
                    getFlowTitle()
                  )}
                </button>
              </form>

              {/* Back Button (for forgotPassword and resetPassword) */}
              {(authFlow === 'forgotPassword' || authFlow === 'resetPassword') && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthFlow('login');
                    setMessage(null);
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="w-full flex items-center justify-center gap-2 text-walnut hover:text-rhino py-2 transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('auth.backToLogin')}
                </button>
              )}

              {/* Toggle Mode (login/signup only) */}
              {(authFlow === 'login' || authFlow === 'signup') && (
                <div className="text-center pt-4 border-t border-sandstone-300">
                  <p className="text-sm text-walnut">
                    {authFlow === 'login' ? t('auth.noAccount') : t('auth.alreadyRegistered')}
                  </p>
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-desert hover:text-desert-700 font-semibold text-base mt-2 px-3 py-1 rounded-md bg-desert/20 backdrop-blur-[5px] hover:bg-desert/30 transition-all duration-200 border border-desert/30 hover:border-desert/40"
                  >
                    {authFlow === 'login' ? t('auth.registerNow') : t('auth.toLogin')}
                  </button>
                </div>
              )}

              {/* Forgot Password Link (only for login) */}
              {authFlow === 'login' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthFlow('forgotPassword')}
                    className="text-desert hover:text-desert/80 text-sm underline transition-colors duration-200"
                  >
                    {t('auth.forgotPassword')}
                  </button>
                </div>
              )}

              {/* App Features Description - What awaits you in the app */}
              {(authFlow === 'login' || authFlow === 'signup') && (
                <div className="mt-6 p-4 bg-desert/20 backdrop-blur-[8px] rounded-lg border border-desert/30 text-sm leading-relaxed shadow-glass-card">
                  <div className="space-y-3">
                    <p className="font-medium font-logo text-rhino flex items-center space-x-2">
                      <span>✨</span>
                      <span>{t('auth.appFeatures.title')}</span>
                    </p>
                    <ul className="space-y-2 text-walnut">
                      <li className="flex items-start space-x-3">
                        <span className="w-1.5 h-1.5 bg-desert rounded-full mt-2 flex-shrink-0"></span>
                        <span>{t('auth.appFeatures.findLikeMinded')}</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="w-1.5 h-1.5 bg-desert rounded-full mt-2 flex-shrink-0"></span>
                        <span>{t('auth.appFeatures.shareSpaces')}</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="w-1.5 h-1.5 bg-desert rounded-full mt-2 flex-shrink-0"></span>
                        <span>{t('auth.appFeatures.discoverEvents')}</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="w-1.5 h-1.5 bg-desert rounded-full mt-2 flex-shrink-0"></span>
                        <span>{t('auth.appFeatures.authenticConnect')}</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="w-1.5 h-1.5 bg-desert rounded-full mt-2 flex-shrink-0"></span>
                        <span>{t('auth.appFeatures.contribute')}</span>
                      </li>
                    </ul>
                    <div className="mt-4 pt-3 border-t border-desert/30">
                      <p className="text-xs text-desert text-center font-medium">
                        🌿 {t('auth.appFeatures.platformDescription')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {/* Privacy Policy Notice */}
              <div className="mt-6 p-4 bg-akaroa-100/70 backdrop-blur-[8px] rounded-lg border border-sandstone-300/50 text-sm text-walnut leading-relaxed shadow-glass-summary">
                <div className="space-y-3">
                  <p className="font-medium font-logo text-rhino">
                    {t('auth.privacyNotice.title')}
                  </p>
                  <p>
                    {t('auth.privacyNotice.description')}
                  </p>
                  <p>
                    {t('auth.privacyNotice.detailsLink')}{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('legal')}
                      className="text-desert hover:text-desert-700 underline transition-colors duration-200 font-medium"
                    >
                      {t('auth.privacyNotice.privacyPolicy')}
                    </button>
                    .
                  </p>
                  <p>
                    {t('auth.privacyNotice.consent')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}