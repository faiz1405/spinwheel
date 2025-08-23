import React, { useState, useEffect } from 'react';
import type { Route } from "./+types/home";
import prisma from "../lib/prismaClient";
import "./style.css";
import bg from "../assets/img/logo.png";
import text from "../assets/img/text.svg";
import flare from "../assets/img/Vector.svg";
import SplitFlap from "../components/SplitFlap";
import WinnerPopup from "../components/WinnerPopup";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "LiuGong Spinwheel" },
    { name: "description", content: "LiuGong Spinwheel" },
  ];
}

const initialUser = {
  id: 0,
  uniqueId: '?????',
  name: '????????', // 8 karakter tanda tanya
};

export async function loader({request}: Route.LoaderArgs) {
  const users = await prisma.user.findMany({
    select: { id: true, uniqueId: true, name: true },
    orderBy: { createdAt: "desc" },
  });
  return { users };
}

export default function Home({loaderData}: Route.ComponentProps) {
  const { users } = loaderData;
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [isSpinning, setIsSpinning] = useState(false);
  const [shouldAnimateId, setShouldAnimateId] = useState(false);
  const [shouldAnimateName, setShouldAnimateName] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

    const handleSpin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    
    // Pilih user random
    const randomIndex = Math.floor(Math.random() * users.length);
    const selectedUser = users[randomIndex];
    
    // Set user baru
    setCurrentUser(selectedUser);
    
    // Start animasi ID dan nama bersamaan
    setShouldAnimateId(true);
    setShouldAnimateName(true);
  };

  const handleIdAnimationComplete = () => {
    setShouldAnimateId(false);
  };

  const handleNameAnimationComplete = () => {
    setShouldAnimateName(false);
  };

  // Monitor when both animations are complete
  useEffect(() => {
    if (isSpinning && !shouldAnimateId && !shouldAnimateName) {
      setIsSpinning(false);
      setTimeout(() => {
        setShowPopup(true);
      }, 500);
    }
  }, [shouldAnimateId, shouldAnimateName, isSpinning]);

  const handleTryAgain = () => {
    setShowPopup(false);
    setCurrentUser(initialUser);
    // Reset semua state animasi
    setShouldAnimateId(false);
    setShouldAnimateName(false);
    setIsSpinning(false);
  };

  return(
    // spinwheel with split flap animation
    <>
      <div className="spinwheel w-full h-screen bg-spinwheel relative md:pt-[72px]">
        <div className="w-full h-full flex flex-col items-center ">
          <img src={bg} alt="logo" className=" w-1/5" />
          <div className="relative md:w-[947px] md:h-[52px] text-center mx-auto md:mt-10 md:mb-4">
            <img src={text} alt="text" className="w-full inline-block " />
            <img src={flare} alt="flare" className="absolute top-[-71px] right-[35px]  md:mt-10 md:mb-4 mix-blend-screen" />
          </div>
          <h1 className="text-white text-2xl italic font-bold rounded-2xl" >Be the lucky winner in LiuGong Gala Dinner 2025</h1>
          <div className="spinwheel-content w-[600px] h-[312px]  md:mt-[60px]">
            <div className="uniqueId-wrapper md:mb-10 flex items-center justify-center">
              <SplitFlap 
                from="id"
                text={currentUser.uniqueId?.toUpperCase() || '?????'} 
                className="text-2xl w-full h-[100px]" 
                speed={700}
                shouldAnimate={shouldAnimateId}
                onAnimationComplete={handleIdAnimationComplete}
              />
            </div>
            <div className="name-wrapper flex items-center justify-center">
              <SplitFlap 
                from="name"
                text={(currentUser.name?.toUpperCase() || '????????').padEnd(8, ' ').substring(0, 8)} 
                className="text-2xl w-full h-[100px]" 
                speed={500}
                shouldAnimate={shouldAnimateName}
                onAnimationComplete={handleNameAnimationComplete}
              />
            </div>

            <button 
              className={`text-white md:text-2xl font-bold mt-[65px] block mx-auto md:w-[254px] md:h-[70px] rounded-2xl -skew-x-12 bg-spinwheel-button ${isSpinning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              onClick={handleSpin}
              disabled={isSpinning}
            >
              {isSpinning ? 'SPINNING...' : "LET'S ROLL!"}
            </button>
          </div>
        </div>

          <div className="text-white text-base absolute bottom-14 left-14 italic">Synergy in motion, sustainability in mine</div>

      </div>
      {showPopup && <WinnerPopup user={currentUser} onTryAgain={handleTryAgain} />}
    </>
  );
}
