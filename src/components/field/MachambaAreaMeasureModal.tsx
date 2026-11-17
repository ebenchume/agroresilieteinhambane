import React from 'react';
import { AriaModal } from '../AriaModal';
import { MachambaAreaMeasureSection } from './MachambaAreaMeasureSection';

interface MachambaAreaMeasureModalProps {
  isOpen: boolean;
  onClose: () => void;
  sunlightMode?: boolean;
  onApplyAreaHa?: (areaHa: number, label?: string) => void;
}

export const MachambaAreaMeasureModal: React.FC<MachambaAreaMeasureModalProps> = ({
  isOpen,
  onClose,
  sunlightMode = false,
  onApplyAreaHa
}) => {
  return (
    <AriaModal
      isOpen={isOpen}
      onClose={onClose}
      title="Medir Área da Machamba no Terreno"
      maxWidth="max-w-4xl"
    >
      <MachambaAreaMeasureSection
        compactModal
        sunlightMode={sunlightMode}
        onApplyAreaHa={
          onApplyAreaHa
            ? (areaHa, label) => {
                onApplyAreaHa(areaHa, label);
                onClose();
              }
            : undefined
        }
      />
    </AriaModal>
  );
};
