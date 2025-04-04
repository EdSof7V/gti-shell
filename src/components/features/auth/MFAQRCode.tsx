import React from 'react';
import {QRCodeSVG} from 'qrcode.react';

interface MFAQRCodeProps {
  uri: string;
  size?: number;
}

const MFAQRCode: React.FC<MFAQRCodeProps> = ({ uri, size = 200 }) => {
  if (!uri) {
    return <div className="text-red-500">URI no válido</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <QRCodeSVG 
        value={uri} 
        size={size} 
        level="H" 
      />
    </div>
  );
};

export default MFAQRCode;