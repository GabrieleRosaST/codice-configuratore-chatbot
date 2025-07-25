import React from 'react';
import { Link } from 'react-router-dom';
import configurazioneIcon from '../img/configurazioneIcon.svg';
import configurazioneIconActive from '../img/configurazioneIconActive.svg';
import argomentiIcon from '../img/argomentiIcon.svg';
import argomentiIconActive from '../img/argomentiIconActive.svg';
import pianoIcon from '../img/pianoIcon.svg';
import pianoIconActive from '../img/pianoIconActive.svg';
import { useLocation } from 'react-router-dom';
import { useStepContext } from '../context/StepContext';

function Navbar() {
    const location = useLocation();
    const currentPage = location.pathname.slice(1);
    const { completedSteps } = useStepContext(); // Usa il contesto per accedere allo stato

    const navItems = [
        {
            id: 'configurazione',
            label: 'Impostazioni iniziali',
            icon: configurazioneIcon,
            iconActive: configurazioneIconActive,
            link: '/configurazione',
            disabled: false,
        },
        {
            id: 'argomentiRiferimenti',
            label: 'Argomenti e Riferimenti',
            icon: argomentiIcon,
            iconActive: argomentiIconActive,
            link: '/argomentiRiferimenti',
            disabled: !completedSteps.step1,
        },
        {
            id: 'pianoLavoro',
            label: 'Piano di Lavoro',
            icon: pianoIcon,
            iconActive: pianoIconActive,
            link: '/pianoLavoro',
            disabled: !completedSteps.step2 || !completedSteps.step1,
        },
    ];

    return (
        <div className="h-18 w-full flex items-center justify-center mt-6">
            <div className="w-[48%] 2xl:w-[35%] h-11 bg-white flex justify-center gap-[6%] items-center rounded-[50px] border-[1px] border-black/[0.08]"
                style={{
                    boxShadow: '0px 3px 15.6px 6px rgba(0,0,0,0.015)'
                }}>
                {navItems.map((item) => (
                    <Link
                        key={item.id}
                        to={item.link}
                        className={`flex items-center px-4 py-2 rounded-[50px] h-full justify-center hover:scale-102 transition duration-180 ease-in-out
                        ${currentPage === item.id ? 'text-black font-medium text-[#1D2125]' : 'text-[#1D2125]'} 
                        ${item.disabled ? 'opacity-40 pointer-events-none' : ''}`}
                        onClick={(e) => {
                            if (item.disabled) {
                                e.preventDefault();
                                alert('Completa lo step precedente per accedere a questa sezione.');
                            }
                        }}
                    >
                        <img
                            src={currentPage === item.id ? item.iconActive : item.icon}
                            alt={`${item.label} Icon`}
                            className="w-3.5 h-3.5 "
                        />
                        <span className="text-[12px]  2xl:inline ml-2">{item.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default Navbar;