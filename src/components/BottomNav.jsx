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
          /* ESTILO MOBILE: Cápsula Flutuante na base   */
          /* ========================================== */
          .menu-navegacao {
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 400px;
            background-color: rgba(15, 51, 56, 0.95);
            display: flex;
            justify-content: space-around;
            padding: 10px 8px;
            border-radius: 32px;
            box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15);
            z-index: 1000;
            border: 1px solid #e2e8f0;
            backdrop-filter: blur(12px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          body.dark .menu-navegacao {
            background-color: rgba(30, 41, 59, 0.95);
            border-color: #334155;
            box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5);
          }

          .btn-nav {
            background: none;
            border: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            color: #94a3b8;
            font-weight: 600;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            padding: 6px 16px;
            border-radius: 24px;
          }

          .btn-nav:hover { color: #64748b; }
          body.dark .btn-nav:hover { color: #cbd5e1; }

          .icone-container {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .btn-nav span {
            font-size: 11px;
            opacity: 0.8;
            transition: all 0.3s;
            white-space: nowrap;
          }

          /* ========================================== */
          /* ESTADO ATIVO (CORREÇÃO DE CONTRASTE)       */
          /* ========================================== */
          .btn-nav.ativo { color: #0d9488; }
          body.dark .btn-nav.ativo { color: #2dd4bf; }

          /* Bolinha sólida com ícone branco (Modo Claro) */
          .btn-nav.ativo .icone-container {
            background-color: #0d9488; 
            color: #ffffff; 
            transform: translateY(-4px);
            box-shadow: 0 4px 12px rgba(13, 148, 136, 0.4);
          }
          
          /* Bolinha neon com ícone escuro (Modo Escuro) */
          body.dark .btn-nav.ativo .icone-container {
            background-color: #2dd4bf; 
            color: #0f172a; 
            box-shadow: 0 4px 12px rgba(45, 212, 191, 0.3);
          }

          .btn-nav.ativo span {
            opacity: 1;
            font-weight: 800;
            transform: translateY(-2px);
          }

          .toggle-btn { display: none; }

          /* ========================================== */
          /* ESTILO DESKTOP: Lateral Toda e Expansível  */
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
              color: rgb(148, 163, 184);
              cursor: pointer;
              padding: 8px;
              border-radius: 12px;
              transition: 0.2s;
            }

            .toggle-btn:hover { background-color: rgba(0,0,0,0.05); color: #0f172a; }
            body.dark .toggle-btn:hover { background-color: rgba(255,255,255,0.05); color: #f8fafc; }

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
                <Icon size={22} strokeWidth={2.5} className="icone-svg" />
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}