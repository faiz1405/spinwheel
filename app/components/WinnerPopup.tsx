import React from 'react';
import bg from "../assets/img/logo.png";
import congrate from "../assets/img/congrat.png";

interface User {
  uniqueId: string;
  nama: string;
}

interface WinnerPopupProps {
  user: User;
  onTryAgain: () => void;
}

const WinnerPopup: React.FC<WinnerPopupProps> = ({ user, onTryAgain }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <img src={bg} alt="bg" className="md:w-[337px] md:h-[150px]" />
        <img src={congrate} alt="congrate" className="md:w-[258px] md:h-[110px] md:mt-[-20px]" />
        <div className="md:w-[300px] text-center ">
          <p className="text-white text-2xl font-bold">{user.nama}</p>
          <div className="md:w-[300px] md:h-[1px] bg-white md:my-3.5"></div>
          <p className="text-white text-2xl font-bold">{user.uniqueId}</p>

          <p className='text-white text-base my-5'><span className=" font-bold">Congratulations</span> You have been selected 
          as one of the winners!</p>
        </div>
        <button className="popup-try-again-btn" onClick={onTryAgain}>
        Roll Again
        </button>
      </div>
    </div>
  );
};

export default WinnerPopup;
