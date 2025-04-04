import React, { RefObject } from 'react';

interface PasswordValidation {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
}

interface PasswordRequirementsTooltipProps {
    passwordValidation: PasswordValidation;
    tooltipRef: RefObject<HTMLDivElement>;
}

const PasswordRequirementsTooltip: React.FC<PasswordRequirementsTooltipProps> = ({
    passwordValidation,
    tooltipRef
}) => {
    return (
        <div 
            ref={tooltipRef}
            className="absolute right-0 mt-2 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10 dark:bg-gray-800 dark:border-gray-700"
            style={{ transform: 'translateX(100%)', marginRight: '10px' }}
        >
            <h4 className="text-gray-700 mb-2 font-medium dark:text-gray-300">Requisitos de contraseña:</h4>
            <ul className="space-y-1">
                <li className="flex items-center">
                    <span className={`inline-flex items-center justify-center w-5 h-5 mr-2 rounded-full ${passwordValidation.length ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {passwordValidation.length ? '✓' : '✗'}
                    </span>
                    <span className={passwordValidation.length ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                        Entre 8 y 64 caracteres
                    </span>
                </li>
                <li className="flex items-center">
                    <span className={`inline-flex items-center justify-center w-5 h-5 mr-2 rounded-full ${passwordValidation.lowercase ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {passwordValidation.lowercase ? '✓' : '✗'}
                    </span>
                    <span className={passwordValidation.lowercase ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                        Al menos una minúscula
                    </span>
                </li>
                <li className="flex items-center">
                    <span className={`inline-flex items-center justify-center w-5 h-5 mr-2 rounded-full ${passwordValidation.uppercase ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {passwordValidation.uppercase ? '✓' : '✗'}
                    </span>
                    <span className={passwordValidation.uppercase ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                        Al menos una mayúscula
                    </span>
                </li>
                <li className="flex items-center">
                    <span className={`inline-flex items-center justify-center w-5 h-5 mr-2 rounded-full ${passwordValidation.number ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {passwordValidation.number ? '✓' : '✗'}
                    </span>
                    <span className={passwordValidation.number ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                        Al menos un número
                    </span>
                </li>
                <li className="flex items-center">
                    <span className={`inline-flex items-center justify-center w-5 h-5 mr-2 rounded-full ${passwordValidation.special ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {passwordValidation.special ? '✓' : '✗'}
                    </span>
                    <span className={passwordValidation.special ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                        Al menos un carácter especial
                    </span>
                </li>
            </ul>
        </div>
    );
};

export default PasswordRequirementsTooltip;