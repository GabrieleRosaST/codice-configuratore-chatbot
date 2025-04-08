import React from 'react';
import lineaDopoIconaSuggerimento from '../img/lineaDopoIconaSuggerimento.svg';

import { useSelector } from 'react-redux';



function Suggerimento({ value, onChange, isEditable, icon }) {

    const formState = useSelector((state) => state.form);

    return (
        <div className="w-[633px] h-11 relative  mb-2">
            <div className="w-[633px] h-11 absolute left-0 top-0">
                <div
                    className="w-[678px] h-11 absolute left-[-1px] top-[-1px] rounded-[10px] bg-white border border-[#bfbfbf]/[0.56]"
                    style={{ boxShadow: "0px 0px 6.7px 4px rgba(0,0,0,0.02)" }}
                ></div>
            </div>
            <img
                src={icon}
                alt="Icona suggerimento"
                className="absolute left-[14px] top-[11px] w-[20px] h-[20px]"
            />
            <img
                src={lineaDopoIconaSuggerimento}
                alt="Linea dopo icona"
                className="absolute left-[47px] top-[4.5px] w-[2px] h-[32px]"
            />
            {isEditable ? (
                <input
                    type="text"
                    value={formState.newSuggerimento}
                    placeholder="Nuovo suggerimento..."
                    onChange={(e) => {
                        if (e.target.value.length <= 20) {
                            dispatch(updateForm({ newSuggerimento: e.target.value }))
                        }
                    }}
                    className="w-[678px] h-11 absolute left-{[-1px] top-[-1px] pl-16 rounded-[10px]  text-left text-[#495057] bg-transparent  focus:outline-none focus:border-1 focus:border-[#495057]"
                />
            ) : (
                <p className="w-[547.72px] h-7 absolute left-[62px] top-2  text-left text-[#495057]">
                    {value}
                </p>
            )}
        </div>
    );
}

export default Suggerimento;