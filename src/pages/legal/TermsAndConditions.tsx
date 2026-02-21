import React from 'react';
import { useTranslation } from '../../i18n';
import { useNavigate } from 'react-router-dom';
import './LegalPage.css';

const TermsAndConditions: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      <div className="legal-page-container">
        <button className="legal-back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="legal-content">
          <h1 className="legal-title">{t('legal.terms.title')}</h1>
          <div className="legal-text">
            <p className="legal-date">Last updated: November 21, 2025</p>
            
            <p className="legal-intro">
              Welcome to Perkins News ("Perkins," "we," "our," or "us"), a personalized news-aggregation and information service operated by Perkins Intel, legally registered in Argentina. By using our website, chatbots, applications, or any related features ("the Service"), you agree to the following Terms & Conditions.
            </p>
            
            <p>Please read them carefully.</p>

            <h2>1. About the Service</h2>
            <p>Perkins News aggregates and displays:</p>
            <ul>
              <li>Headlines</li>
              <li>Short excerpts</li>
              <li>Links to original news sources</li>
              <li>AI-generated summaries or classifications</li>
            </ul>
            <p>We do not publish or claim ownership of third-party articles. All original content belongs to its respective publisher.</p>

            <h2>2. Acceptance of Terms</h2>
            <p>By accessing or using the Service—whether via website, Telegram, WhatsApp, or any other platform—you agree to be bound by these Terms & Conditions and our Privacy Policy.</p>
            <p>If you do not agree, you must stop using the Service.</p>

            <h2>3. Use of Third-Party Content</h2>
            <p>Perkins News displays limited previews of news articles from external publishers. You acknowledge that:</p>
            <ul>
              <li>All articles, headlines, excerpts, images, and trademarks belong to their respective owners.</li>
              <li>We only show short excerpts provided through feeds or public sources.</li>
              <li>Full articles must always be accessed on the publisher's website.</li>
              <li>We do not host, modify, or distribute full copyrighted text.</li>
              <li>Use of third-party content is strictly for informational, non-commercial purposes.</li>
            </ul>

            <h2>4. Permitted Use</h2>
            <p>You may use Perkins News for personal, non-commercial purposes, including:</p>
            <ul>
              <li>Receiving curated news summaries</li>
              <li>Configuring personalized preferences</li>
              <li>Following topics, companies, industries, or countries</li>
            </ul>
            <p>You agree not to:</p>
            <ul>
              <li>Copy, scrape, or systematically extract content</li>
              <li>Reproduce, republish, or redistribute third-party news</li>
              <li>Use the Service for unlawful, abusive, or fraudulent purposes</li>
              <li>Misrepresent Perkins News as original journalism</li>
              <li>Interfere with the Service's security or operation</li>
            </ul>

            <h2>5. AI-Generated Content</h2>
            <p>Perkins News uses artificial intelligence (AI) to:</p>
            <ul>
              <li>Summarize news</li>
              <li>Categorize content</li>
              <li>Detect companies, industries, and topics</li>
            </ul>
            <p>AI outputs may be incomplete, inaccurate, or imperfect. You agree that the Service is provided "as is" and that decisions you make based on AI-generated content are at your own risk.</p>

            <h2>6. User Accounts and Preferences</h2>
            <p>Depending on the platform, we may store:</p>
            <ul>
              <li>Country, industry, and company preferences</li>
              <li>Chat identifiers (e.g., Telegram user ID, WhatsApp phone number)</li>
              <li>Interaction history related to menu selections and navigation</li>
            </ul>
            <p>You are responsible for any activity conducted through your chat account or messaging platform. You are also responsible for the security of your account and the data associated with it.</p>

            <h2>7. Data Protection and Privacy</h2>
            <p>Your privacy is important to us.</p>
            <p>Our processing of personal data is governed by the Privacy Policy and follows Argentina's Ley 25.326 and other Latin American data-protection principles.</p>
            <p>By using the Service, you consent to the storage and use of your data as described in the Privacy Policy.</p>

            <h2>8. Service Availability</h2>
            <p>We aim to provide continuous access but do not guarantee:</p>
            <ul>
              <li>Uninterrupted service</li>
              <li>Error-free operation</li>
              <li>Immediate delivery of notifications or summaries</li>
              <li>Access to specific news sources at all times</li>
            </ul>
            <p>We may modify, suspend, or discontinue parts of the Service at any time.</p>

            <h2>9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by applicable law:</p>
            <ul>
              <li>Perkins News is provided "as is" without warranties of any kind.</li>
              <li>We are not responsible for errors, omissions, or delays in third-party content.</li>
              <li>We do not guarantee the accuracy or completeness of AI-generated summaries.</li>
              <li>We are not liable for decisions, losses, or damages resulting from use of the Service.</li>
              <li>External news links lead to websites outside our control.</li>
            </ul>
            <p>If you are dissatisfied with the Service, your sole remedy is to stop using it.</p>

            <h2>10. Intellectual Property</h2>
            <p>Logos, trademarks, and branding used by Perkins News belong to us or our licensors.</p>
            <p>Third-party content remains the property of its respective owners.</p>
            <p>You may not reverse-engineer, decompile, or modify our software or bots.</p>

            <h2>11. Modifications to These Terms</h2>
            <p>We may update these Terms & Conditions as needed. Changes will be posted on our website or communicated through the bot. Continued use of the Service constitutes acceptance of the updated terms.</p>

            <h2>12. Governing Law</h2>
            <p>These Terms & Conditions are governed by the laws of the Republic of Argentina. Any disputes will be resolved in the competent courts of the City of Buenos Aires, unless local law requires otherwise.</p>
            <p>These Terms are entered into between you and Perkins Intel, the legal entity that owns and operates Perkins News.</p>

            <h2>13. Contact</h2>
            <p className="legal-contact">For questions, support, or legal requests:</p>
            <p>
              <strong>Perkins News</strong><br />
              Perkins Intel<br />
              <strong>📧 info@perkinsintel.com</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;

