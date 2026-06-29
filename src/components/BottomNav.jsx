import React, { useState } from 'react';
import { PlusCircle, ScrollText, PieChart, Menu, ChevronLeft } from 'lucide-react';
import IconeTenda from './IconeTenda';

export default function BottomNav({ telaAtual, setTelaAtual }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { id: 'LISTA', label: 'Início', icon: IconeTenda },
    { id: 'NOVO', label: 'Lançar', icon: PlusCircle },
    { id: 'HISTORICO', label: 'Histórico', icon: ScrollText },
    { id: 'RESUMO', label: 'Resumo', icon: PieChart }
  ];

  return (
    <>
      <style>
        {`
          /* ========================================== */
          /* ESTILO MOBILE: Barra Fixa e Fina na Base   */
          /* ========================================== */
          .menu-navegacao {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background-color: rgba(15, 51, 56, 0.98);
            display: flex;
            justify-content: space-around;
            align-items: center;
            /* Padding inteligente para não encostar na barra de gestos do iPhone/Android */
            padding: 8px 8px calc(8px + env(safe-area-inset-bottom)) 8px;
            border-radius: 24px 24px 0 0; /* Arredonda apenas o topo */
            box-shadow: 0 -4px 25px rgba(0,0,0,0.15);
            z-index: 1000;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(12px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          body.dark .menu-navegacao {
            background-color: rgba(15, 23, 42, 0.98);
            border-top: 1px solid #334155;
            box-shadow: 0 -4px 25px rgba(0,0,0,0.5);
          }

          /* BLINDAGEM SUPREMA CONTRA O CSS GLOBAL DO VITE */
          .btn-nav {
            background: none;
            border: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px; /* Mais coladinho (ícone e texto) */
            cursor: pointer;
            color: #94a3b8 !important; 
            font-weight: 600;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            padding: 4px 12px;
            border-radius: 16px;
          }

          /* Força todos os SVGs (Lucide ou Custom) a acatarem a cor do botão */
          .btn-nav svg {
            stroke: currentColor !important;
            transition: stroke 0.3s ease;
          }

          .btn-nav:hover { color: #cbd5e1 !important; }
          body.dark .btn-nav:hover { color: #e2e8f0 !important; }

          .icone-container {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px; /* Bolinha mais delicada */
            height: 38px; /* Bolinha mais delicada */
            border-radius: 50%;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .btn-nav span {
            font-size: 10px; /* Texto minimamente mais delicado */
            opacity: 0.85;
            transition: all 0.3s;
            white-space: nowrap;
          }

          /* ========================================== */
          /* ESTADO ATIVO                               */
          /* ========================================== */
          .btn-nav.ativo { color: #0d9488 !important; }
          body.dark .btn-nav.ativo { color: #2dd4bf !important; }

          .btn-nav.ativo .icone-container {
            background-color: #0d9488 !important; 
            color: #ffffff !important; 
            transform: translateY(-2px); /* Pulinho menor */
            box-shadow: 0 4px 12px rgba(13, 148, 136, 0.4);
          }
          
          body.dark .btn-nav.ativo .icone-container {
            background-color: #2dd4bf !important; 
            color: #0f172a !important; 
            box-shadow: 0 4px 12px rgba(45, 212, 191, 0.3);
          }

          .btn-nav.ativo span {
            opacity: 1;
            font-weight: 800;
            transform: translateY(-1px);
          }

          .toggle-btn { display: none; }

          /* ========================================== */
          /* ESTILO DESKTOP                             */
          /* ========================================== */
          @media (min-width: 768px) {
            .menu-navegacao {
              bottom: 0;
              top: 0;
              left: 0;
              transform: none;
              height: 100vh;
              width: ${isExpanded ? '240px' : '86px'};
              flex-direction: column;
              justify-content: center;
              padding: 24px 12px;
              border-radius: 0 32px 32px 0;
              border-top: none;
              align-items: ${isExpanded ? 'flex-start' : 'center'};
            }

            .container-aplicacao {
              padding-left: ${isExpanded ? '260px' : '110px'} !important;
            }

            .toggle-btn {
              display: flex;
              position: absolute;
              top: 24px;
              left: ${isExpanded ? 'auto' : '50%'};
              right: ${isExpanded ? '24px' : 'auto'};
              transform: ${isExpanded ? 'none' : 'translateX(-50%)'};
              background: none;
              border: none;
              color: #94a3b8 !important;
              cursor: pointer;
              padding: 8px;
              border-radius: 12px;
              transition: 0.2s;
            }

            .toggle-btn:hover { background-color: rgba(0,0,0,0.05); color: #0f172a !important; }
            body.dark .toggle-btn:hover { background-color: rgba(255,255,255,0.05); color: #f8fafc !important; }

            .btn-nav {
              flex-direction: row;
              width: 100%;
              justify-content: ${isExpanded ? 'flex-start' : 'center'};
              padding: ${isExpanded ? '12px 16px' : '12px 0'};
              gap: ${isExpanded ? '16px' : '0'};
            }

            .btn-nav.ativo .icone-container {
              transform: none; 
            }

            .btn-nav span {
              display: ${isExpanded ? 'block' : 'none'};
              font-size: 15px;
              font-weight: 700;
              opacity: ${isExpanded ? '1' : '0'};
              transform: none;
            }
          }
        `}
      </style>

      <nav className="menu-navegacao">
        
        <button 
          className="toggle-btn" 
          onClick={() => setIsExpanded(!isExpanded)} 
          title={isExpanded ? 'Recolher Menu' : 'Expandir Menu'}
        >
          {isExpanded ? <ChevronLeft size={24} /> : <Menu size={24} />}
        </button>

        {navItems.map((item) => {
          const isActive = telaAtual === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setTelaAtual(item.id)}
              className={`btn-nav ${isActive ? 'ativo' : ''}`}
            >
              <div className="icone-container">
                <Icon size={20} strokeWidth={2.5} className="icone-svg" />
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}