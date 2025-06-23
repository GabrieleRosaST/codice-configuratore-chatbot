import React, { useState, useRef } from 'react';
import headerCorso from '../img/headerCorso.svg';
import footerCorso from '../img/footerCorso.svg';
import fotoBot from '../img/fotoBot.svg';
import frecciaDown from '../img/frecciaDown.svg';
import sidebarIcon from '../img/sidebarIcon.svg';
import ApriFullscreenIcon from '../img/ApriFullscreenIcon.svg';
import frecciaUp from '../img/frecciaUp.svg';
import chiudiFullscreenIcon from '../img/chiudiFullscreenIcon.svg';
import invioButtonChat from '../img/invioButtonChat.svg';


function CorsoChatbot() {
    const [isChatOpen, setIsChatOpen] = useState(true); // Stato per gestire l'espansione
    const [isFullscreen, setIsFullscreen] = useState(false); // Stato per gestire il fullscreen
    const divRef = useRef(null); // Riferimento al div da mettere in fullscreen

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen); // Inverte lo stato
    };

    const handleFullscreen = () => {
        if (divRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen(); // Esce dalla modalità fullscreen
                setIsFullscreen(false); // Aggiorna lo stato
            } else {
                divRef.current.requestFullscreen(); // Entra in modalità fullscreen
                setIsFullscreen(true); // Aggiorna lo stato
            }
        }
    };

    return (
        <div className='flex flex-col justify-start items-center w-full h-full bg-white'>
            <div className="w-full bg-red-100 h-auto ">
                <img src={headerCorso} className="w-full" />
            </div>

            {isChatOpen ? (
                <div
                    ref={divRef} // Aggiungi il riferimento al div
                    className=" mt-12 mb-10 w-[1270px] h-[760px] bg-[#f8f9ff] border border-[#0b0751]/[0.045] flex flex-col justify-start relative"
                    style={{
                        maxWidth: document.fullscreenElement ? '100%' : '1338px',
                        maxHeight: document.fullscreenElement ? '100%' : '920px',
                        borderRadius: document.fullscreenElement ? '0' : '7px',
                        boxShadow: '0px 0px 31px 12px rgba(0,0,0,0)',
                    }}
                >

                    {/* Header del chatbot */}
                    <div className="w-full h-17 flex justify-between items-center ">


                        <div className="h-full w-19 flex justify-center items-center">
                            <button className="w-[32px] h-[32px] flex justify-center items-center cursor-pointer opacity-70 transform  duration-200 hover:opacity-100">
                                <img src={sidebarIcon} className="w-[23px] h-[23px] " />
                            </button>
                        </div>


                        <button
                            className="w-[40px] h-[40px] rounded-[50px]  border border-[#0b0751]/[0.00] flex justify-center items-center cursor-pointer opacity-70 transform hover:opacity-100 duration-200 ease-in-out"
                            onClick={toggleChat}
                            style={{ display: isFullscreen ? 'none' : 'flex' }}
                        >
                            <img src={frecciaUp} className="w-[20px] h-[20px]" />
                        </button>


                        <div className="h-full w-17 flex justify-center items-center">
                            <button
                                className="w-[30px] h-[32px] flex justify-center items-center cursor-pointer opacity-75 transform duration-200 hover:opacity-100"
                                onClick={handleFullscreen}
                            >
                                <img
                                    src={isFullscreen ? chiudiFullscreenIcon : ApriFullscreenIcon}
                                    className={isFullscreen ? "w-[25px] h-[25px]" : "w-[20px] h-[20px]"}
                                />
                            </button>
                        </div>


                    </div>


                    {/* Barra input chat */}
                    <div
                        className={`w-full h-20 absolute flex justify-center items-center ${isFullscreen ? 'bottom-10' : 'bottom-5'
                            } transition-all duration-300`}
                    >

                        <div className='w-[960px] relative flex justify-center items-center'>
                            <input
                                type="text"
                                className='w-[960px] h-[47px] rounded-[25px] bg-white border border-[#6982ab]/[0.22] pl-6 pr-10 text-[17px] text-left text-[#495057] focus:outline-none focus:border-red-500 '
                                placeholder="Scrivi un messaggio..."
                            />

                            <button className=' absolute right-3 cursor-pointer'>
                                <img src={invioButtonChat} alt="" />
                            </button>
                        </div>

                    </div>

                </div>


            ) : (
                <div className="h-40 w-full flex justify-center items-center mt-3 ">
                    <div className="w-[1300px] h-[85px] bg-[#F8F9FF] rounded-[50px] flex justify-between items-center">
                        <div className="">
                            <img src={fotoBot} alt="" />
                        </div>

                        <div className="flex flex-grow h-full justify-start items-center pl-8 gap-9">
                            <p className="h-7 text-3xl font-medium text-left text-[#212061] mb-2">HCI Tutor</p>
                            <p className="text-xl text-left text-[#495057]/[0.65] mt-[5px]">
                                Il tuo supporto personale per lo studio del corso
                            </p>
                        </div>

                        <div className="w-[160px] h-[45px] h-full mr-1 flex justify-center items-center">
                            <button
                                className="w-[108px] h-[45px] rounded-[50px] bg-white border border-[#6982ab]/[0.18] flex justify-center items-center relative cursor-pointer transform hover:scale-103 duration-200 "
                                style={{ boxShadow: '0px 0px 12px 4px rgba(0,0,0,0.01)' }}
                                onClick={toggleChat}
                            >
                                <p className="w-[66px] h-[43px] text-[19px] absolute left-2 text-center text-[#495057] flex justify-center items-center">
                                    Apri
                                </p>
                                <div className="right-2 absolute h-full w-[40px] flex justify-center">
                                    <img src={frecciaDown} className="w-[16px]" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full bg-red-100 h-auto">
                <img src={footerCorso} className="w-full" />
            </div>
        </div>
    );
}

export default CorsoChatbot;