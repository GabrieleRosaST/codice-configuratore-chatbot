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
import sfondoConfig from '../img/sfondoConfig.svg';
import sfondoArgomenti from '../img/sfondoArgomenti.svg';
import sfondoPiano from '../img/sfondoPiano.svg';




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
            background: {
                src: sfondoConfig,
                style: { left: '0', zIndex: 3 },
            },

        },
        {
            id: 'argomentiRiferimenti',
            label: 'Argomenti e Riferimenti',
            icon: argomentiIcon,
            iconActive: argomentiIconActive,
            link: '/argomentiRiferimenti',
            disabled: !completedSteps.step1,
            background: {
                src: sfondoArgomenti,
                style: { left: '300px ', zIndex: 2 },
            },
        },
        {
            id: 'pianoLavoro',
            label: 'Piano di Lavoro',
            icon: pianoIcon,
            iconActive: pianoIconActive,
            link: '/pianoLavoro',
            disabled: !completedSteps.step2 || !completedSteps.step1,
            background: {
                src: sfondoPiano,
                style: { left: '600px ', zIndex: 1 },
            },
        },
    ];

    return (
        <div className=" h-19  pt-1  mt-11">


            {/* Navbar */}
            <div
                className=" w-[950px] h-[51px]  mx-auto relative"
            //style={{ boxShadow: '0px 3px 15px rgba(0, 0, 0, 0.05)' }}
            >
                {/* Sfondi dinamici */}

                {navItems.map((item) => (
                    <Link
                        key={item.id}
                        to={item.link}
                        className={`w-[350px]  h-[51px] absolute  ${item.disabled ? ' cursor-not-allowed' : ''
                            }`}
                        style={item.background.style}
                        onClick={(e) => {
                            if (item.disabled) {
                                e.preventDefault();
                                alert('Completa lo step precedente per accedere a questa sezione.');
                            }
                        }}
                    >
                        <img
                            src={item.background.src}
                            className=" object-cover p-0 m-0 inset-0 "
                        />
                        <div className={`flex items-center justify-center space-x-2 absolute left-1/2 w-[200px] transform -translate-x-1/2 top-[21px] ${item.disabled ? 'opacity-30' : ''
                            }`}>
                            <img
                                src={currentPage === item.id ? item.iconActive : item.icon}
                                alt={`${item.label} Icon`}
                                className="w-[19px] h-[19px] "
                            />
                            <span
                                className={` ${currentPage === item.id ? 'font-medium text-[#1d2125]' : 'text-[#1d2125]'} `}
                            >
                                {item.label}
                            </span>
                        </div>


                    </Link>
                ))}







            </div>
        </div>
    );
}

export default Navbar;