import React, { useState, useEffect } from "react";
import { NavLink as Link } from 'react-router-dom';
import namada from '../namada.svg';

function Navbar () {
    const [pageURL, setPageURL] = useState(0);

    useEffect(() => {
        const arrayA = window.location.href.split("/")
        if(arrayA[arrayA.length - 1] === 'blocks' || arrayA[arrayA.length - 2] === 'blocks') {
            setPageURL("BLOCKS");
        } else if (arrayA[arrayA.length - 1] === 'search' || arrayA[arrayA.length - 2] === 'search') {
            setPageURL("SEARCH");
        } else if (arrayA[arrayA.length - 1] === 'validators' || arrayA[arrayA.length - 2] === 'validators') {
            setPageURL("VALIDATORS");
        } else {
            setPageURL("HOME");
        }
    })

    return (
        <div>
            <div className='z-10 bg-[#000000] space-y-10'>
                <div className='flex-1 flex items-center justify-between space-x-1 p-4 text-sm text-[#FFFF00]'>
                    <div>
                        <Link onClick={() => {setPageURL("HOME");}} to='/'>
                            <img className="w-12 h-12" src={namada} />
                        </Link>
                    </div>
                    <div className="flex-1 flex items-center justify-end space-x-5 p-4 text-sm text-[#FFFF00]">
                        <Link onClick={() => {setPageURL("HOME");}} to='/'className={`flex items-center justify-center py-2`}>
                            <div className="hover:text-[#00FFFF]">HOME</div>
                        </Link>
                        <Link onClick={() => {setPageURL("BLOCKS");}} to='/blocks' className={`flex items-center justify-center py-2`}>
                            <div className="hover:text-[#00FFFF]">BLOCKS</div>
                        </Link>
                        {/* <Link onClick={() => {setPageURL("VALIDATORS");}} to='/validators' className={`flex items-center justify-center py-2`}>
                            <div className="hover:text-[#00FFFF]">VAIDATORS</div>
                        </Link> */}
                        <Link onClick={() => {setPageURL("SEARCH");}} to='/search' className={`flex items-center justify-center py-2`}>
                            <div className="hover:text-[#00FFFF]">SEARCH</div>
                        </Link>
                    </div>
                </div> 
            </div>
        </div>
    )
}

export default Navbar;