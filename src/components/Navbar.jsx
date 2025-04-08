import React from 'react';
import { Link } from 'react-router-dom';
import configurazioneIcon from '../img/configurazioneIcon.svg';
import configurazioneIconActive from '../img/configurazioneIconActive.svg';
import argomentiIcon from '../img/argomentiIcon.svg';
import argomentiIconActive from '../img/argomentiIconActive.svg';
import pianoIcon from '../img/pianoIcon.svg';
import pianoIconActive from '../img/pianoIconActive.svg';
import { useLocation } from 'react-router-dom';


function Navbar() {
    const location = useLocation();
    const currentPage = location.pathname.slice(1);

    const navItems = [
        { id: 'configurazione', label: 'Configurazione', icon: configurazioneIcon, iconActive: configurazioneIconActive, link: '/configurazione' },
        { id: 'argomentiRiferimenti', label: 'Argomenti e Riferimenti', icon: argomentiIcon, iconActive: argomentiIconActive, link: '/argomentiRiferimenti' },
        { id: 'pianoLavoro', label: 'Piano di Lavoro', icon: pianoIcon, iconActive: pianoIconActive, link: '/pianoLavoro' },
    ];

    return (
        <div className="h-20 mt-9 mb-2 flex justify-center items-center">
            <div className="w-[1101px] h-[51px] bg-white border border-[#E5E5E7] rounded-[25px] flex justify-center items-center gap-40 px-6 mx-auto" style={{ boxShadow: '0px 3px 15px rgba(0, 0, 0, 0.05)' }}>
                {navItems.map((item) => (
                    <Link key={item.id} to={item.link} className="flex items-center gap-2">
                        <img src={currentPage === item.id ? item.iconActive : item.icon} alt={`${item.label} Icon`} className="w-[19px] h-[19px]" />
                        <span className={`text-lg ${currentPage === item.id ? 'font-medium text-[#1d2125]' : 'text-[#1d2125]'}`}>
                            {item.label}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default Navbar;