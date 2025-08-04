import { FaBriefcase, FaTheaterMasks, FaNewspaper } from "react-icons/fa";
import { GiHealthNormal } from "react-icons/gi";
import { MdOutlineScience, MdSportsSoccer } from "react-icons/md";
import { GrTechnology } from "react-icons/gr";
import React from "react";

interface FilterProps {
  articleSelection: string;
  setArticleSelection: React.Dispatch<React.SetStateAction<string>>;
}

const Filter: React.FC<FilterProps> = ({
  articleSelection,
  setArticleSelection,
}) => {
  const categories = [
    { key: "Business", icon: <FaBriefcase /> },
    { key: "Entertainment", icon: <FaTheaterMasks /> },
    { key: "General", icon: <FaNewspaper /> },
    { key: "Health", icon: <GiHealthNormal /> },
    { key: "Science", icon: <MdOutlineScience /> },
    { key: "Sports", icon: <MdSportsSoccer /> },
    { key: "Technology", icon: <GrTechnology /> },
  ];

  return (
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-4 px-4 py-2 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-lg border border-white/20 rounded-2xl flex space-x-4 z-50 select-none pointer-events-auto">
      {categories.map(({ key, icon }) => (
        <button
          key={key}
          onClick={() => setArticleSelection(key)}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-lg cursor-pointer ${
            articleSelection === key
              ? "bg-white/20 backdrop-blur-md text-white"
              : "text-white/70 hover:bg-white/10 hover:backdrop-blur-sm"
          }`}
        >
          {icon}
          <span className="dock-label">{key}</span>
        </button>
      ))}
    </div>
  );
};

export default Filter;
