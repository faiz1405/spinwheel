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

// Type declaration untuk CustomEvent
declare global {
  interface WindowEventMap {
    customModeToggle: CustomEvent<{ enabled: boolean }>;
  }
}

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
    select: { id: true, uniqueId: true, name: true, wonAt: true },
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
  const [customModeEnabled, setCustomModeEnabled] = useState(false);
  const submit = useSubmit();
  
  // Load custom mode setting from localStorage
  useEffect(() => {
    const savedCustomModeSetting = localStorage.getItem('customModeEnabled');
    if (savedCustomModeSetting !== null) {
      setCustomModeEnabled(JSON.parse(savedCustomModeSetting));
    }
  }, []);

  // Listen for custom mode toggle events
  useEffect(() => {
    const handleCustomModeToggle = (event: CustomEvent) => {
      setCustomModeEnabled(event.detail.enabled);
    };

    window.addEventListener('customModeToggle', handleCustomModeToggle as EventListener);
    
    return () => {
      window.removeEventListener('customModeToggle', handleCustomModeToggle as EventListener);
    };
  }, []);
  
  // Hitung berapa user yang tersisa berdasarkan mode
  const remainingUsers = customModeEnabled 
    ? users.filter(user => user.wonAt).length // Custom mode: hitung pemenang yang diset
    : users.filter(user => !user.wonAt).length; // Random mode: hitung yang belum menang

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
    
    let selectedUser;
    
    if (customModeEnabled) {
      // Custom mode: pilih user yang sudah diset sebagai pemenang
      const customWinners = users.filter(user => user.wonAt);
      if (customWinners.length === 0) {
        alert("Tidak ada pemenang custom yang diset! Silakan set pemenang di panel admin terlebih dahulu.");
        setIsSpinning(false);
        return;
      }
      // Pilih pemenang custom secara random
      const randomIndex = Math.floor(Math.random() * customWinners.length);
      selectedUser = customWinners[randomIndex];
    } else {
      // Random mode: pilih user random dari yang belum menang
      const availableUsers = users.filter(user => !user.wonAt);
      if (availableUsers.length === 0) {
        alert("Tidak ada peserta tersisa untuk dipilih!");
        setIsSpinning(false);
        return;
      }
      const randomIndex = Math.floor(Math.random() * availableUsers.length);
      selectedUser = availableUsers[randomIndex];
    }
    
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
      // Jika dalam custom mode, jangan tandai sebagai pemenang lagi
      if (customModeEnabled) {
        return;
      }
      
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
          
          {/* Mode Indicator */}
          {/* <div className="mb-4 text-center">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              customModeEnabled 
                ? 'bg-purple-600 text-white' 
                : 'bg-blue-600 text-white'
            }`}>
              <span className="mr-2">
                {customModeEnabled ? '🎯' : '🎲'}
              </span>
              Mode: {customModeEnabled ? 'Custom Pemenang' : 'Random'}
            </div>
          </div> */}
          
          <div className="spinwheel-content w-full max-w-[600px] lg:max-w-[1000px] md:mt-[60px]">
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

          
            {/* {showWinner && currentUser.name && (
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
            )} */}

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
                  <h3 className="text-xl font-bold mb-2">
                    {customModeEnabled ? '🎯 Tidak Ada Pemenang Custom!' : '🎉 Semua Peserta Sudah Menang!'}
                  </h3>
                  <p className="text-sm">
                    {customModeEnabled 
                      ? 'Silakan set pemenang custom di panel admin terlebih dahulu' 
                      : 'Silakan reset pemenang di panel admin untuk melanjutkan'
                    }
                  </p>
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