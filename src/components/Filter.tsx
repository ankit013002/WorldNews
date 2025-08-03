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
    <div className="absolute top-0 dock dock-xl bg-gray-200/3 select-none pointer-events-auto">
      {categories.map(({ key, icon }) => (
        <button
          key={key}
          onClick={() => setArticleSelection(key)}
          className={`dock-item flex flex-col items-center ${
            articleSelection === key ? "dock-active" : ""
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
