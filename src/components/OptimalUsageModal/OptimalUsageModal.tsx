import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import Modal from '../Header/Modal';
import './OptimalUsageModal.css';

interface OptimalUsageModalProps {
  show: boolean;
  onClose: () => void;
}

const OptimalUsageModal: React.FC<OptimalUsageModalProps> = ({ show, onClose }) => {
  const { t } = useTranslation();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('perkins-optimal-usage-modal-hidden', 'true');
    }
    onClose();
  };

  const handleDontShowAgainChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDontShowAgain(event.target.checked);
  };

  return (
    <Modal
      show={show}
      onClose={handleClose}
      title={t('optimalUsage.title')}
    >
      <div className="modal-form-layout">
        <div className="form-section">
          <h3 className="section-title">{t('optimalUsage.splitScreen.title')}</h3>
          <p className="section-description">
            {t('optimalUsage.splitScreen.description')}
          </p>
          <div className="image-container">
            <img 
              src="/split_screen.png" 
              alt={t('optimalUsage.splitScreen.imageAlt')}
              className="usage-image split-screen-image"
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">{t('optimalUsage.articleSize.title')}</h3>
          <p className="section-description">
            {t('optimalUsage.articleSize.description')}
          </p>
        </div>

        <div className="form-section">
          <h3 className="section-title">{t('optimalUsage.openRight.title')}</h3>
          <p className="section-description">
            {t('optimalUsage.openRight.description')}
          </p>
          <div className="image-container">
            <img 
              src="/open_right.png" 
              alt={t('optimalUsage.openRight.imageAlt')}
              className="usage-image"
            />
          </div>
        </div>

        <div className="usage-tip">
          <span className="tip-icon">💡</span>
          <p className="tip-text">{t('optimalUsage.tip')}</p>
        </div>

        <div className="modal-form-footer">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={handleDontShowAgainChange}
              className="checkbox-input"
            />
            <span className="checkbox-text">{t('optimalUsage.dontShowAgain')}</span>
          </label>
        </div>
      </div>
    </Modal>
  );
};

export default OptimalUsageModal;
