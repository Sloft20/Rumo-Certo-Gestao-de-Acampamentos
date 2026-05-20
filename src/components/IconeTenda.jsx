import React from 'react';

export default function IconeTenda({ size = 24, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="120 230 720 500" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Trocamos o 'fill' fixo por 'currentColor' para herdar a cor do botão (cinza ou verde-água).
        Usamos 'opacity' para recriar as sombras e manter o efeito 3D da tenda!
      */}
      <g>
        {/* Lado Esquerdo (Mais claro) */}
        <polygon fill="currentColor" opacity="0.7" points="481,252.1 208.3,687.8 481,687.8" />
        {/* Lado Direito (Mais escuro) */}
        <polygon fill="currentColor" opacity="0.9" points="481,252.1 750.2,687.8 481,687.8" />
        
        {/* Detalhes de Sombra nas abas */}
        <polygon fill="currentColor" opacity="0.6" points="481,687.5 481,614.3 255.6,614.3 208.5,687.5" />
        <polygon fill="currentColor" opacity="1.0" points="750,687.5 706.4,614.3 556.6,614.3 590.3,687.5" />
        
        {/* Base de Madeira (Piso) */}
        <path fill="currentColor" opacity="0.8" d="M758.9,718.7h-558c-8.6,0-15.6-7-15.6-15.6l0,0c0-8.6,7-15.6,15.6-15.6h557.9c8.6,0,15.6,7,15.6,15.6l0,0 C774.5,711.7,767.5,718.7,758.9,718.7z" />
        
        {/* Estacas e Porta (Mais escuras) */}
        <line fill="none" stroke="currentColor" opacity="0.9" strokeWidth="30.5" strokeLinecap="round" strokeMiterlimit="10" x1="152.9" y1="667.7" x2="152.9" y2="708" />
        <line fill="none" stroke="currentColor" opacity="0.9" strokeWidth="30.5" strokeLinecap="round" strokeMiterlimit="10" x1="807.1" y1="667.7" x2="807.1" y2="708" />
        <polygon fill="currentColor" opacity="0.3" points="481,449.8 590.3,687.5 369.7,687.5" /> {/* Interior da porta */}
        <polygon fill="currentColor" opacity="0.5" points="481,449.8 301.8,620.3 369.7,687.5" /> {/* Aba da porta */}
        
        {/* Cordas (Linhas finas) */}
        <polyline fill="none" stroke="currentColor" opacity="0.6" strokeWidth="10.1" strokeLinecap="round" strokeMiterlimit="10" points="490.6,241.3 164.6,681.4 131.6,681.4" />
        <polyline fill="none" stroke="currentColor" opacity="0.6" strokeWidth="10.1" strokeLinecap="round" strokeMiterlimit="10" points="471.2,241.3 795.4,681.4 828.4,681.4" />
      </g>
    </svg>
  );
}