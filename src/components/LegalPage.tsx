import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Shield, Mail, Phone, MapPin, Lock, Eye, UserCheck, Database, Trash2, Home } from 'lucide-react';
import SoulCirclesText from './SoulCirclesText';

interface LegalPageProps {
  onNavigate: (page: 'home' | 'map_search' | 'legal' | 'auth' | 'profile') => void;
}

export default function LegalPage({ onNavigate }: LegalPageProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-cream relative">
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

      {/* Header */}
      <div className="bg-rhino-900/70 backdrop-blur-[15px] shadow-glass-nav border-b border-rhino-700/50 relative z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Shield size={24} className="text-cream" />
              <h1 className="text-xl font-light font-logo text-cream">{t('legal.title')}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md lg:max-w-4xl mx-auto px-3 py-6 md:p-6 space-y-8 relative z-10">
        {/* Desktop Navigation Button */}
        <div className="lg:flex hidden">
          <button
            onClick={() => onNavigate('home')}
            className="bg-akaroa-100/70 backdrop-blur-[8px] text-rhino hover:bg-akaroa-200/80 rounded-lg transition-all duration-200 p-2 flex items-center space-x-2 shadow-glass-button hover:shadow-glass-button-hover border border-sandstone-300/50 hover:border-sandstone-300/60 transform hover:scale-[1.02]"
            title="Zurück zur Startseite"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Zurück zur Startseite</span>
          </button>
        </div>

        {/* Impressum Section */}
        <div className="bg-akaroa/60 backdrop-blur-[15px] rounded-xl p-6 shadow-glass-card border border-sandstone-300/50 space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rhino to-rhino-700 rounded-full shadow-lg">
              <Shield size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold font-logo text-rhino">{t('legal.imprint')}</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold font-logo text-rhino mb-4">{t('legal.tmgInfo')}:</h3>
              <div className="bg-akaroa-200/70 backdrop-blur-[5px] rounded-lg p-4 space-y-2 shadow-glass-summary border border-akaroa-300/50">
                <p className="font-semibold text-rhino">Philippe Ramakers</p>
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-rhino" />
                  <span className="text-walnut">60 RUE FRANCOIS IER</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-rhino" />
                  <span className="text-walnut">75008 PARIS</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-rhino" />
                  <span className="text-walnut">Frankreich</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold font-logo text-rhino mb-3">{t('legal.representedBy')}:</h4>
              <p className="text-walnut">Philippe Ramakers</p>
            </div>

            <div>
              <h4 className="font-semibold font-logo text-rhino mb-3">{t('legal.contact')}:</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-akaroa-200/70 backdrop-blur-[5px] rounded-lg shadow-glass-summary border border-akaroa-300/50">
                  <Phone size={18} className="text-rhino flex-shrink-0" />
                  <span className="text-walnut">(+33) 0773883823</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-akaroa-200/70 backdrop-blur-[5px] rounded-lg shadow-glass-summary border border-akaroa-300/50">
                  <Mail size={18} className="text-rhino flex-shrink-0" />
                  <a 
                    href="mailto:werte-im-wandel@mailbox.org"
                    className="text-walnut hover:text-desert transition-colors duration-200"
                  >
                    werte-im-wandel@mailbox.org
                  </a>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-akaroa-200/70 backdrop-blur-[5px] rounded-lg shadow-glass-summary border border-akaroa-300/50">
                  <Eye size={18} className="text-rhino flex-shrink-0" />
                  <a 
                    href="https://soulcircles.website"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-walnut hover:text-desert transition-colors duration-200"
                  >
                    https://soulcircles.website
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold font-logo text-rhino mb-3">{t('legal.vatId')}:</h4>
              <p className="text-walnut font-mono">FR 0J903804755</p>
            </div>

            <div>
              <h4 className="font-semibold font-logo text-rhino mb-3">{t('legal.contentResponsible')}:</h4>
              <p className="text-walnut">Philippe Ramakers</p>
              <p className="text-walnut text-sm">60 RUE FRANCOIS IER, 75008 PARIS</p>
            </div>

            <div className="bg-desert/20 backdrop-blur-[5px] rounded-lg p-4 shadow-glass-summary border border-desert/30">
              <h4 className="font-semibold font-logo text-rhino mb-3">{t('legal.disputeResolution')}</h4>
              <div className="space-y-3 text-sm text-walnut">
                <p>
                  {t('legal.disputeText1')}{' '}
                  <a 
                    href="https://ec.europa.eu/consumers/odr/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-desert hover:text-desert/80 underline"
                  >
                    https://ec.europa.eu/consumers/odr/
                  </a>{' '}
                  {t('legal.disputeText2')}.
                </p>
                <p>
                  {t('legal.disputeText3')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Datenschutzerklärung Section */}
        <div className="bg-akaroa/60 backdrop-blur-[15px] rounded-xl p-6 shadow-glass-card border border-sandstone-300/50 space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rhino to-rhino-700 rounded-full shadow-lg">
              <Lock size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold font-logo text-rhino">{t('legal.privacyPolicy')}</h2>
          </div>

          <div className="space-y-8">
            <div className="bg-desert/20 backdrop-blur-[5px] rounded-lg p-4 shadow-glass-summary border border-desert/30">
              <p className="text-sm text-desert leading-relaxed">
                {t('legal.privacyIntro')}
              </p>
            </div>

            {/* Section 1: Verantwortlicher */}
            <div>
              <h3 className="text-xl font-semibold font-logo text-rhino mb-4">1. {t('legal.responsibleParty')}</h3>
              <div className="bg-akaroa-200/70 backdrop-blur-[5px] rounded-lg p-4 space-y-2 shadow-glass-summary border border-akaroa-300/50">
                <p className="text-walnut">
                  {t('legal.gdprResponsible')}:
                </p>
                <div className="mt-3 space-y-1">
                  <p className="font-semibold text-rhino">Philippe Ramakers</p>
                  <p className="text-walnut">60 RUE FRANCOIS IER</p>
                  <p className="text-walnut">75008 PARIS</p>
                  <p className="text-walnut">Frankreich</p>
                  <p className="text-walnut">E-Mail: werte-im-wandel@mailbox.org</p>
                  <p className="text-walnut">Website: https://soulcircles.website</p>
                </div>
              </div>
            </div>

            {/* Section 2: Datenschutzbeauftragter */}
            <div>
              <h3 className="text-xl font-semibold font-logo text-rhino mb-4">2. Kontaktdaten des Datenschutzbeauftragten</h3>
              <p className="text-walnut">
                Ein Datenschutzbeauftragter ist nicht bestellt, da dies gesetzlich nicht vorgeschrieben ist. Bei Fragen zum Datenschutz können Sie sich direkt an den Verantwortlichen unter den oben genannten Kontaktdaten wenden.
              </p>
            </div>

            {/* Section 3: Allgemeines */}
            <div>
              <h3 className="text-xl font-semibold font-logo text-rhino mb-4">3. Allgemeines zur Datenverarbeitung</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium font-logo text-rhino mb-3">3.1. Umfang der Verarbeitung personenbezogener Daten</h4>
                  <p className="text-walnut leading-relaxed">
                    Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies zur Bereitstellung einer funktionsfähigen Webanwendung sowie unserer Inhalte und Leistungen erforderlich ist. Die Verarbeitung personenbezogener Daten unserer Nutzer erfolgt regelmäßig nur nach Einwilligung des Nutzers. Eine Ausnahme gilt in solchen Fällen, in denen eine vorherige Einholung einer Einwilligung aus tatsächlichen Gründen nicht möglich ist und die Verarbeitung der Daten durch gesetzliche Vorschriften gestattet ist.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-medium font-logo text-rhino mb-3">3.2. Rechtsgrundlagen für die Verarbeitung personenbezogener Daten</h4>
                  <div className="space-y-3 text-walnut">
                    <p>Soweit wir für Verarbeitungsvorgänge personenbezogener Daten eine Einwilligung der betroffenen Person einholen, dient <strong>Art. 6 Abs. 1 lit. a DSGVO</strong> als Rechtsgrundlage.</p>
                    <p>Bei der Verarbeitung von personenbezogenen Daten, die zur Erfüllung eines Vertrages, dessen Vertragspartei die betroffene Person ist, erforderlich ist, dient <strong>Art. 6 Abs. 1 lit. b DSGVO</strong> als Rechtsgrundlage. Dies gilt auch für Verarbeitungsvorgänge, die zur Durchführung vorvertraglicher Maßnahmen erforderlich sind.</p>
                    <p>Soweit eine Verarbeitung personenbezogener Daten zur Erfüllung einer rechtlichen Verpflichtung erforderlich ist, der unser Unternehmen unterliegt, dient <strong>Art. 6 Abs. 1 lit. c DSGVO</strong> als Rechtsgrundlage.</p>
                    <p>Für den Fall, dass lebenswichtige Interessen der betroffenen Person oder einer anderen natürlichen Person eine Verarbeitung personenbezogener Daten erforderlich machen, dient <strong>Art. 6 Abs. 1 lit. d DSGVO</strong> als Rechtsgrundlage.</p>
                    <p>Ist die Verarbeitung zur Wahrung eines berechtigten Interesses unseres Unternehmens oder eines Dritten erforderlich und überwiegen die Interessen, Grundrechte und Grundfreiheiten des Betroffenen das erstgenannte Interesse nicht, so dient <strong>Art. 6 Abs. 1 lit. f DSGVO</strong> als Rechtsgrundlage für die Verarbeitung.</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium font-logo text-rhino mb-3">3.3. Datenlöschung und Speicherdauer</h4>
                  <p className="text-walnut leading-relaxed">
                    Die personenbezogenen Daten der betroffenen Person werden gelöscht oder gesperrt, sobald der Zweck der Speicherung entfällt. Eine Speicherung kann darüber hinaus erfolgen, wenn dies durch den europäischen oder nationalen Gesetzgeber in unionsrechtlichen Verordnungen, Gesetzen oder sonstigen Vorschriften, denen der Verantwortliche unterliegt, vorgesehen wurde. Eine Sperrung oder Löschung der Daten erfolgt auch dann, wenn eine durch die genannten Normen vorgeschriebene Speicherfrist abläuft, es sei denn, dass eine Erforderlichkeit zur weiteren Speicherung der Daten für einen Vertragsabschluss oder eine Vertragserfüllung besteht.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4: Detaillierte Datenverarbeitung */}
            <div>
              <h3 className="text-xl font-semibold font-logo text-rhino mb-4">4. Verarbeitung personenbezogener Daten im Detail</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium font-logo text-rhino mb-3 flex items-center space-x-2">
                    <Database size={18} />
                    <span>4.1. Bereitstellung der Website und Erstellung von Logfiles</span>
                  </h4>
                  <div className="bg-akaroa-200/70 backdrop-blur-[5px] rounded-lg p-4 space-y-3 shadow-glass-summary border border-akaroa-300/50">
                    <p className="text-walnut">Bei jedem Aufruf unserer Internetseite erfasst unser System automatisiert Daten und Informationen vom Computersystem des aufrufenden Rechners.</p>
                    <div>
                      <p className="font-medium text-rhino mb-2">Folgende Daten werden hierbei erhoben:</p>
                      <ul className="list-disc list-inside text-walnut space-y-1 ml-4">
                        <li>IP-Adresse des Nutzers</li>
                        <li>Datum und Uhrzeit des Zugriffs</li>
                        <li>Name und URL der abgerufenen Datei</li>
                        <li>Website, von der aus der Zugriff erfolgt (Referrer-URL)</li>
                        <li>Verwendeter Browser und ggf. das Betriebssystem Ihres Rechners sowie der Name Ihres Access-Providers</li>
                      </ul>
                    </div>
                    <p className="text-walnut">
                      Die Speicherung der IP-Adresse erfolgt, um die Funktionsfähigkeit der Website zu gewährleisten und die Sicherheit unserer informationstechnischen Systeme sicherzustellen. Die Daten werden gelöscht, sobald sie für die Erreichung des Zweckes ihrer Erhebung nicht mehr erforderlich sind, spätestens nach sieben Tagen.
                    </p>
                    <p className="text-desert font-medium">Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium font-logo text-rhino mb-3 flex items-center space-x-2">
                    <UserCheck size={18} />
                    <span>4.2. Registrierung und Profilerstellung</span>
                  </h4>
                  <div className="bg-akaroa-200/70 backdrop-blur-[5px] rounded-lg p-4 space-y-3 shadow-glass-summary border border-akaroa-300/50">
                    <p className="text-walnut">Unsere Webanwendung bietet Nutzern die Möglichkeit, sich zu registrieren und ein persönliches Profil zu erstellen.</p>
                    <div>
                      <p className="font-medium text-rhino mb-2">Im Rahmen der Registrierung werden folgende Daten erhoben:</p>
                      <ul className="list-disc list-inside text-walnut space-y-1 ml-4">
                        <li>E-Mail-Adresse</li>
                        <li>Passwort (verschlüsselt gespeichert)</li>
                        <li>Benutzername</li>
                        <li>Anzeigename</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-rhino mb-2">Nach erfolgreicher Registrierung können Nutzer optional weitere Profildaten hinzufügen:</p>
                      <ul className="list-disc list-inside text-walnut space-y-1 ml-4">
                        <li>Biografie</li>
                        <li>Interessensbereiche</li>
                        <li>Standort (Stadt, Land)</li>
                        <li>Avatar-URL</li>
                        <li>Privatsphäre-Einstellungen (öffentlich, nur Freunde, privat)</li>
                        <li>E-Mail-Benachrichtigungseinstellungen</li>
                        <li>Einwilligung zur Datenverarbeitung</li>
                      </ul>
                    </div>
                    <p className="text-desert font-medium">Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) / Art. 6 Abs. 1 lit. a DSGVO (Einwilligung für optionale Angaben)</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium font-logo text-rhino mb-3 flex items-center space-x-2">
                    <Mail size={18} />
                    <span>4.3. Chat-Funktionalität und Nachrichtenversand</span>
                  </h4>
                  <div className="bg-akaroa-200/70 backdrop-blur-[5px] rounded-lg p-4 space-y-3 shadow-glass-summary border border-akaroa-300/50">
                    <p className="text-walnut">Unsere Webanwendung ermöglicht es registrierten Nutzern, über eine Chat-Funktion miteinander zu kommunizieren.</p>
                    <div>
                      <p className="font-medium text-rhino mb-2">Hierbei werden folgende Daten verarbeitet:</p>
                      <ul className="list-disc list-inside text-walnut space-y-1 ml-4">
                        <li><strong>Inhalt der Nachrichten:</strong> Der Text der gesendeten Nachrichten</li>
                        <li><strong>Absender- und Empfänger-ID:</strong> Zur Zuordnung der Kommunikation</li>
                        <li><strong>Zeitstempel:</strong> Datum und Uhrzeit des Nachrichtenversands</li>
                        <li><strong>Konversations-ID:</strong> Zur Gruppierung von Nachrichten innerhalb einer Konversation</li>
                        <li><strong>Lesestatus:</strong> Information, ob eine Nachricht gelesen wurde</li>
                      </ul>
                    </div>
                    <div className="bg-desert/30 backdrop-blur-[5px] rounded-lg p-3 shadow-glass-summary border border-desert/40">
                      <p className="text-desert font-medium text-sm">
                        <strong>Besonderheit:</strong> Die Nachrichten werden nicht in Echtzeit übermittelt, sondern mit einer gewissen Verzögerung. Dies dient der Sicherstellung einer bedachten Kommunikation und der Einhaltung unserer Werte.
                      </p>
                    </div>
                    <p className="text-desert font-medium">Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium font-logo text-rhino mb-3 flex items-center space-x-2">
                    <MapPin size={18} />
                    <span>4.4. Standortbasierte Funktionen (Orte und Umkreissuche)</span>
                  </h4>
                  <div className="bg-akaroa-200/70 backdrop-blur-[5px] rounded-lg p-4 space-y-3 shadow-glass-summary border border-akaroa-300/50">
                    <p className="text-walnut">Die Anwendung ermöglicht es Nutzern, besondere Orte hinzuzufügen und nach Orten in ihrer Nähe zu suchen.</p>
                    <div>
                      <p className="font-medium text-rhino mb-2">Hierbei werden folgende Daten verarbeitet:</p>
                      <ul className="list-disc list-inside text-walnut space-y-1 ml-4">
                        <li><strong>Ortsname und Beschreibung:</strong> Von Nutzern eingegebene Informationen zu Orten</li>
                        <li><strong>Geografische Koordinaten:</strong> Vom Nutzer manuell gesetzt oder über die Browser-Geolocation-API ermittelt (nach expliziter Einwilligung)</li>
                        <li><strong>Interessensbereich des Ortes:</strong> Kategorie, die den Ort beschreibt</li>
                      </ul>
                    </div>
                    <p className="text-desert font-medium">Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) / Art. 6 Abs. 1 lit. a DSGVO (Einwilligung für Geolocation)</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium font-logo text-rhino mb-3 flex items-center space-x-2">
                    <Eye size={18} />
                    <span>4.5. Event-Management</span>
                  </h4>
                  <div className="bg-akaroa-200/70 backdrop-blur-[5px] rounded-lg p-4 space-y-3 shadow-glass-summary border border-akaroa-300/50">
                    <p className="text-walnut">Nutzer können Events erstellen, verwalten und sich für Events anmelden.</p>
                    <div>
                      <p className="font-medium text-rhino mb-2">Dabei werden folgende Daten verarbeitet:</p>
                      <ul className="list-disc list-inside text-walnut space-y-1 ml-4">
                        <li><strong>Event-Details:</strong> Titel, Beschreibung, Datum, Uhrzeit, Ort, Kategorie, Bild-URL, Website-Link, Kontaktinformationen, maximale Teilnehmerzahl</li>
                        <li><strong>Ersteller-ID:</strong> Zur Zuordnung des Events zum erstellenden Nutzer</li>
                        <li><strong>RSVP-Status:</strong> Information über die Teilnahmeabsicht eines Nutzers an einem Event</li>
                      </ul>
                    </div>
                    <p className="text-desert font-medium">Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium font-logo text-rhino mb-3">4.6. Cookies</h4>
                  <div className="bg-akaroa-200/70 backdrop-blur-[5px] rounded-lg p-4 space-y-3 shadow-glass-summary border border-akaroa-300/50">
                    <p className="text-walnut">
                      Unsere Website verwendet Cookies. Bei Cookies handelt es sich um Textdateien, die im Internetbrowser bzw. vom Internetbrowser auf dem Computersystem des Nutzers gespeichert werden.
                    </p>
                    <div>
                      <p className="font-medium text-rhino mb-2">In den Cookies werden dabei folgende Daten gespeichert und übermittelt:</p>
                      <ul className="list-disc list-inside text-walnut space-y-1 ml-4">
                        <li>Spracheinstellungen</li>
                        <li>Login-Informationen (z.B. Session-Token für die Authentifizierung)</li>
                      </ul>
                    </div>
                    <p className="text-desert font-medium">Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO / Art. 6 Abs. 1 lit. a DSGVO (für Analysezwecke)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Datenweitergabe */}
            <div>
              <h3 className="text-xl font-semibold font-logo text-rhino mb-4">5. Datenweitergabe an Dritte und internationale Datenübermittlung</h3>
              <p className="text-walnut mb-4">
                Ihre Daten werden grundsätzlich nicht an Dritte weitergegeben, es sei denn, dies ist zur Vertragserfüllung notwendig, Sie haben ausdrücklich eingewilligt oder eine gesetzliche Verpflichtung besteht.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium font-logo text-rhino mb-3">5.1. Supabase</h4>
                  <div className="bg-akaroa-200/70 backdrop-blur-[5px] rounded-lg p-4 space-y-3 shadow-glass-summary border border-akaroa-300/50">
                    <p className="text-walnut">
                      Wir nutzen Supabase als Backend-as-a-Service-Plattform für unsere Datenbank, Authentifizierung und Edge Functions. Ihre personenbezogenen Daten werden auf den Servern von Supabase gespeichert und verarbeitet.
                    </p>
                    <p className="text-walnut">
                      Supabase ist ein US-amerikanisches Unternehmen. Die Daten können daher in den USA oder anderen Ländern außerhalb der EU/EWR verarbeitet werden. Wir haben mit Supabase entsprechende Auftragsverarbeitungsverträge (AVV) abgeschlossen, die die Einhaltung der DSGVO-Standards sicherstellen sollen.
                    </p>
                    <p className="text-walnut">
                      Weitere Informationen zum Datenschutz bei Supabase finden Sie in deren Datenschutzerklärung:{' '}
                      <a 
                        href="https://supabase.com/privacy" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-desert hover:text-desert/80 underline"
                      >
                        https://supabase.com/privacy
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 6: Betroffenenrechte */}
            <div>
              <h3 className="text-xl font-semibold font-logo text-rhino mb-4">6. Betroffenenrechte</h3>
              <p className="text-walnut mb-4">Als betroffene Person stehen Ihnen nach der DSGVO folgende Rechte zu:</p>
              
              <div className="space-y-4">
                <div className="bg-akaroa-200/70 backdrop-blur-[5px] rounded-lg p-4 shadow-glass-summary border border-akaroa-300/50">
                  <h4 className="font-medium font-logo text-rhino mb-2">6.1. Recht auf Auskunft (Art. 15 DSGVO)</h4>
                  <p className="text-walnut text-sm">
                    Sie haben das Recht, eine Bestätigung darüber zu verlangen, ob Sie betreffende personenbezogene Daten verarbeitet werden; ist dies der Fall, so haben Sie ein Recht auf Auskunft über diese personenbezogenen Daten und auf weitere Informationen.
                  </p>
                </div>

                <div className="bg-akaroa-200/70 backdrop-blur-[5px] rounded-lg p-4 shadow-glass-summary border border-akaroa-300/50">
                  <h4 className="font-medium font-logo text-rhino mb-2">6.2. Recht auf Berichtigung (Art. 16 DSGVO)</h4>
                  <p className="text-walnut text-sm">
                    Sie haben das Recht, unverzüglich die Berichtigung unrichtiger oder die Vervollständigung unvollständiger personenbezogener Daten zu verlangen.
                  </p>
                </div>

                <div className="bg-akaroa-200/70 backdrop-blur-[5px] rounded-lg p-4 shadow-glass-summary border border-akaroa-300/50">
                  <h4 className="font-medium font-logo text-rhino mb-2">6.3. Recht auf Löschung („Recht auf Vergessenwerden") (Art. 17 DSGVO)</h4>
                  <p className="text-walnut text-sm">
                    Sie haben das Recht, zu verlangen, dass Sie betreffende personenbezogene Daten unverzüglich gelöscht werden, sofern einer der in Art. 17 Abs. 1 DSGVO genannten Gründe zutrifft.
                  </p>
                </div>

                <div className="bg-akaroa-200/70 backdrop-blur-[5px] rounded-lg p-4 shadow-glass-summary border border-akaroa-300/50">
                  <h4 className="font-medium font-logo text-rhino mb-2">6.4. Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</h4>
                  <p className="text-walnut text-sm">
                    Sie haben das Recht, die Einschränkung der Verarbeitung zu verlangen, wenn eine der in Art. 18 Abs. 1 DSGVO genannten Voraussetzungen gegeben ist.
                  </p>
                </div>

                <div className="bg-akaroa-200/70 backdrop-blur-[5px] rounded-lg p-4 shadow-glass-summary border border-akaroa-300/50">
                  <h4 className="font-medium font-logo text-rhino mb-2">6.5. Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</h4>
                  <p className="text-walnut text-sm">
                    Sie haben das Recht, die Sie betreffenden personenbezogenen Daten in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten und diese Daten einem anderen Verantwortlichen zu übermitteln.
                  </p>
                </div>

                <div className="bg-akaroa-200/70 backdrop-blur-[5px] rounded-lg p-4 shadow-glass-summary border border-akaroa-300/50">
                  <h4 className="font-medium font-logo text-rhino mb-2">6.6. Widerspruchsrecht (Art. 21 DSGVO)</h4>
                  <p className="text-walnut text-sm">
                    Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit gegen die Verarbeitung Sie betreffender personenbezogener Daten Widerspruch einzulegen.
                  </p>
                </div>

                <div className="bg-akaroa-200/70 backdrop-blur-[5px] rounded-lg p-4 shadow-glass-summary border border-akaroa-300/50">
                  <h4 className="font-medium font-logo text-rhino mb-2">6.7. Recht auf Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO)</h4>
                  <p className="text-walnut text-sm">
                    Sie haben das Recht, Ihre einmal erteilte Einwilligung zur Verarbeitung von Daten jederzeit mit Wirkung für die Zukunft zu widerrufen.
                  </p>
                </div>

                <div className="bg-akaroa-200/70 backdrop-blur-[5px] rounded-lg p-4 shadow-glass-summary border border-akaroa-300/50">
                  <h4 className="font-medium font-logo text-rhino mb-2">6.8. Recht auf Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</h4>
                  <p className="text-walnut text-sm">
                    Sie haben das Recht auf Beschwerde bei einer Aufsichtsbehörde, insbesondere in dem Mitgliedstaat Ihres gewöhnlichen Aufenthaltsorts, wenn Sie der Ansicht sind, dass die Verarbeitung der Sie betreffenden personenbezogenen Daten gegen die DSGVO verstößt.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 7: Änderungen */}
            <div>
              <h3 className="text-xl font-semibold font-logo text-rhino mb-4">7. Änderung der Datenschutzerklärung</h3>
              <div className="bg-akaroa-200/70 backdrop-blur-[5px] rounded-lg p-4 shadow-glass-summary border border-akaroa-300/50">
                <p className="text-walnut">
                  Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen, z.B. bei der Einführung neuer Services. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.
                </p>
                <p className="text-desert font-medium mt-3">
                  <strong>Stand:</strong> 1. Juli 2025
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-akaroa/60 backdrop-blur-[15px] rounded-xl p-6 shadow-glass-card border border-sandstone-300/50">
          <div className="text-center space-y-3">
            <div className="text-2xl">🌿</div>
            <SoulCirclesText variant="monochrome" size="sm" className="relative" />
            <p className="text-sm text-walnut">
              {t('legal.appTagline')}
            </p>
            <p className="text-xs text-walnut">
              Version 1.0 • {t('legal.lastUpdated')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}