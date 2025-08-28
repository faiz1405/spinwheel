import React, { useState, useEffect } from 'react';
import { Form, useSubmit } from 'react-router';
import type { Route } from "./+types/home";
import prisma from "../lib/prismaClient";
import "./style.css";
import logo1 from "../assets/img/logo1.svg";
import logo2 from "../assets/img/logo2.svg";
import logo3 from "../assets/img/logo3.svg";
import text from "../assets/img/text.svg";
import flare from "../assets/img/Vector.svg";
import SplitFlap from "../components/SplitFlap";
import Confetti from "../components/Confetti";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "LiuGong Spinwheel" },
    { name: "description", content: "LiuGong Spinwheel" },
  ];
}

const initialUser = {
  id: '',
  uniqueId: '?????????',
  name: '????????',
};

export async function loader({request}: Route.LoaderArgs) {
  const users = await prisma.user.findMany({
    select: { id: true, uniqueId: true, name: true },
    where: { wonAt: null }, // Hanya user yang belum menang
    orderBy: { createdAt: "desc" },
  });
  return { users };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const action = formData.get("action");
  
  if (action === "markWinner") {
    const userId = formData.get("userId") as string;
    
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { wonAt: new Date() }
      });
    }
    
    return { success: true };
  }
  
  return { success: false };
}

export default function Home({loaderData, actionData}: Route.ComponentProps & { actionData?: any }) {
  const { users } = loaderData;
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [isSpinning, setIsSpinning] = useState(false);
  const [shouldAnimateId, setShouldAnimateId] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const submit = useSubmit();
  
  // Hitung berapa user yang tersisa
  const remainingUsers = users.length;

  const handleSpin = () => {
    if (isSpinning) return;
    
    // Cek apakah masih ada user yang tersisa
    if (users.length === 0) {
      alert("Tidak ada peserta tersisa untuk dipilih!");
      return;
    }
    
    setIsSpinning(true);
    setShowWinner(false); // Reset winner display
    setShowConfetti(false); // Reset confetti
    
    // Pilih user random
    const randomIndex = Math.floor(Math.random() * users.length);
    const selectedUser = users[randomIndex];
    
    // Set user baru
    setCurrentUser(selectedUser);
    
    // Start animasi ID saja
    setShouldAnimateId(true);
  };

  const handleIdAnimationComplete = () => {
    setShouldAnimateId(false);
    setIsSpinning(false);
    // Tampilkan nama dan confetti setelah animasi selesai
    setTimeout(() => {
      setShowWinner(true);
      setShowConfetti(true);
      // Tandai user sebagai pemenang di database
      markUserAsWinner(currentUser.id);
      // Reload halaman setelah 3 detik untuk update counter
    }, 500);
  };

  const markUserAsWinner = async (userId: string) => {
    try {
      const form = document.getElementById('winner-form') as HTMLFormElement;
      if (form) {
        const userIdInput = form.querySelector('input[name="userId"]') as HTMLInputElement;
        if (userIdInput) {
          userIdInput.value = userId;
        }
        submit(new FormData(form), { method: "post" });
      }
    } catch (error) {
      console.error("Error marking user as winner:", error);
    }
  };

  const handleTryAgain = () => {
    setShowWinner(false);
    setShowConfetti(false);
    setCurrentUser(initialUser);
    setShouldAnimateId(false);
    setIsSpinning(false);
  };

  return(
    // spinwheel with split flap animation
    <>
      {/* Confetti Component */}
      <Confetti isActive={showConfetti} />
      
      <Form method="post" id="winner-form">
        <input type="hidden" name="action" value="markWinner" />
        <input type="hidden" name="userId" value={currentUser.id} />
      </Form>
      
      <div className="spinwheel w-full h-screen bg-spinwheel relative md:pt-[72px]">
        <div className="w-full h-full flex flex-col items-center justify-center">
         <div className="flex flex-row gap-6 w-full max-w-[800px] justify-center mb-12">
            <img src={logo2} alt="logo" className="w-1/3 md:w-1/5 "/>
            <img src={logo3} alt="logo" className="w-1/3 md:w-1/5 "/>
            <img src={logo1} alt="logo" className="w-1/3 md:w-1/5 "/>
         </div>
          <div className="relative md:w-[947px] lg:w-[1200px] md:h-[52px] lg:h-[70px] text-center mx-auto mb-8">
            <img src={text} alt="text" className="w-1/2 md:w-full lg:w-full inline-block" />
            <img src={flare} alt="flare" className="absolute top-[-71px] right-[35px] md:mt-10 md:mb-4 mix-blend-screen" />
          </div>
          <h1 className="text-white text-2xl lg:text-3xl italic font-bold rounded-2xl mb-8 text-center">Be the lucky winner in LiuGong Gala Dinner 2025</h1>
          
          <div className="spinwheel-content w-full max-w-[600px] lg:max-w-[800px] md:mt-[60px]">
            <div className="uniqueId-wrapper md:mb-10">
              <SplitFlap 
                from="id"
                text={currentUser.uniqueId?.toUpperCase() || '????????'} 
                className="text-2xl lg:text-3xl w-full h-[100px] lg:h-[120px]" 
                speed={300}
                shouldAnimate={shouldAnimateId}
                onAnimationComplete={handleIdAnimationComplete}
              />
            </div>

            {/* Winner Name Display - muncul setelah spin selesai */}
            {showWinner && currentUser.name && (
              <div className="winner-name-display mb-8 text-center animate-fade-in w-full">
                <div className="winner-name-wrapper">
                  <div className="winner-header">
                    <span className="confetti-left">🎊</span>
                    <h2 className="winner-title">CONGRATULATIONS!</h2>
                    <span className="confetti-right">🎊</span>
                  </div>
                  <div className="winner-name-container">
                    <p className="winner-name">{currentUser.name.toUpperCase()}</p>
                  </div>
                </div>
              </div>
            )}

            {remainingUsers > 0 ? (
              <button 
                className={`text-white md:text-2xl lg:text-3xl font-bold mt-8 block mx-auto md:w-[254px] lg:w-[300px] md:h-[70px] lg:h-[80px] rounded-2xl -skew-x-12 bg-spinwheel-button ${isSpinning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                onClick={handleSpin}
                disabled={isSpinning}
              >
                {isSpinning ? 'SPINNING...' : "LET'S ROLL!"}
              </button>
            ) : (
              <div className="mt-8 text-center">
                <div className="bg-yellow-600 text-white px-6 py-4 rounded-2xl inline-block">
                  <h3 className="text-xl font-bold mb-2">🎉 Semua Peserta Sudah Menang!</h3>
                  <p className="text-sm">Silakan reset pemenang di panel admin untuk melanjutkan</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* <div className="text-white text-base absolute bottom-14 left-14 italic">Synergy in motion, sustainability in mine</div> */}

      </div>
    </>
  );
}