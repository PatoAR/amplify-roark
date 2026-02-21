import React from 'react';
import { useTranslation } from '../../i18n';
import { useNavigate } from 'react-router-dom';
import './LegalPage.css';

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      <div className="legal-page-container">
        <button className="legal-back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="legal-content">
          <h1 className="legal-title">{t('legal.privacy.title')}</h1>
          <div className="legal-text">
            <p className="legal-date">Last updated: November 21, 2025</p>
            
            <p className="legal-intro">
              This Privacy Policy explains how Perkins News ("Perkins," "we," "our," or "us"), legally registered in Argentina, collects, uses, stores, and protects personal data from users located in Argentina and other Latin American countries.
            </p>
            
            <p>We comply with Argentina's Ley 25.326 de Protección de Datos Personales and similar privacy protections in the region.</p>

            <h2>1. Data Controller</h2>
            <p>The data controller responsible for your personal data is:</p>
            <p>
              <strong>Perkins News</strong><br />
              Perkins Intel<br />
              Email: info@perkinsintel.com
            </p>

            <h2>2. Information We Collect</h2>
            <p>We collect only the information strictly necessary to deliver a personalized news service.</p>

            <h3>2.1. Information You Provide Voluntarily</h3>
            <ul>
              <li>Preferences (countries, industries, companies, categories)</li>
              <li>Interaction data within the bot's menus</li>
              <li>Contact identifiers:
                <ul>
                  <li>Telegram user ID or chat ID</li>
                  <li>WhatsApp phone number</li>
                  <li>Email address (only if you provide it)</li>
                </ul>
              </li>
            </ul>

            <h3>2.2. Automatically Collected Information</h3>
            <p>Basic technical data required by messaging platforms (e.g., Telegram/WhatsApp metadata). We do not track users outside our service and do not use cookies.</p>
            <p>We do not process sensitive data as defined by Ley 25.326 (e.g., health, religion, political opinions, biometrics).</p>

            <h2>3. Purpose of Data Processing</h2>
            <p>We use your data exclusively for:</p>
            <ul>
              <li>Delivering personalized news</li>
              <li>Classifying articles based on your interests</li>
              <li>Sending optional notifications</li>
              <li>Improving relevance and accuracy of our service</li>
              <li>Responding to user inquiries</li>
              <li>Ensuring the proper operation of the platform and bots</li>
            </ul>
            <p>We do not use your data for profiling beyond personalization of content.</p>

            <h2>4. Legal Basis for Processing</h2>
            <p>We process personal data under the following legal bases (as per Ley 25.326):</p>
            <ul>
              <li><strong>Your consent (Art. 5):</strong> By interacting with our bot or service</li>
              <li><strong>Legitimate interest:</strong> To provide a relevant and functional news service</li>
              <li><strong>Contractual execution:</strong> When personalization or notifications require stored preferences</li>
            </ul>
            <p>Consent can be withdrawn at any time (see Section 10).</p>

            <h2>5. Data Storage and Security</h2>
            <p>Your data is stored using secure cloud services (e.g., AWS) with servers located in regions that ensure adequate levels of protection.</p>
            <p>We implement appropriate technical and organizational measures to prevent:</p>
            <ul>
              <li>Unauthorized access</li>
              <li>Accidental loss</li>
              <li>Alteration</li>
              <li>Misuse</li>
            </ul>
            <p>Only authorized personnel may access your data for operational purposes.</p>

            <h2>6. Data Sharing</h2>
            <p>We do not sell, rent, or trade personal data.</p>
            <p>We only share data in these limited scenarios:</p>
            <ul>
              <li>Service providers (e.g., AWS) acting as data processors</li>
              <li>Legal obligations required by competent authorities</li>
              <li>Platform integration (e.g., Telegram/WhatsApp), which handles message transport</li>
            </ul>
            <p>We do not share preferences, identifiers, or user activity with advertisers or analytics networks.</p>

            <h2>7. Use of Third-Party Content</h2>
            <p>Perkins News aggregates headlines, excerpts, and links from external news publishers.</p>
            <p>When clicking a link, you leave our service and visit a third-party website with its own privacy policy. We are not responsible for third-party practices.</p>

            <h2>8. Use of Artificial Intelligence</h2>
            <p>We use AI models to:</p>
            <ul>
              <li>Summarize news</li>
              <li>Classify content</li>
              <li>Detect company names or topics</li>
            </ul>
            <p>AI does not process your identity or personal data in a way that identifies you. Only your non-identifying preferences may influence personalization.</p>

            <h2>9. Data Retention</h2>
            <p>Data is kept only for the time necessary to provide the service.</p>
            <p>If you stop interacting with the service for an extended period, we may delete your data automatically.</p>
            <p>You may request deletion at any time (see below).</p>

            <h2>10. Your Rights (ARCO Rights – Ley 25.326)</h2>
            <p>Under Argentine law and similar regional laws, you have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Know what data we hold</li>
              <li><strong>Rectification:</strong> Update or correct your information</li>
              <li><strong>Cancellation:</strong> Request deletion</li>
              <li><strong>Opposition:</strong> Object to certain processing activities</li>
            </ul>
            <p>You may also:</p>
            <ul>
              <li>Withdraw your consent</li>
              <li>Request information on how your data is used</li>
              <li>Request portability when applicable</li>
            </ul>
            <p>To exercise these rights, contact us at:</p>
            <p><strong>📧 info@perkinsintel.com</strong></p>
            <p>We will respond within the legal deadlines.</p>

            <h2>11. International Data Transfers</h2>
            <p>If data is stored or processed outside Argentina, we ensure the destination country or provider offers adequate levels of protection, consistent with Ley 25.326 requirements.</p>

            <h2>12. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy to reflect changes in our service or legal requirements. Updates will be published on our website or communicated through the bot.</p>

            <h2>13. Contact</h2>
            <p className="legal-contact">For privacy-related questions or rights requests:</p>
            <p>
              <strong>Perkins News</strong><br />
              Perkins Intel<br />
              Email: info@perkinsintel.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

