import { useEffect, useRef, useState } from "react";
import defaultUserIcon from "../assets/icons/default-user.svg";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useLogOut } from "../hooks/useLogOut";

const UserAvatarDropdown = () => {
  const navigate = useNavigate();
  
  const user = useSelector((state: RootState) => state.user);

  const [displayDropdownItems, setDisplayDropdownItems] =
    useState<boolean>(false);
  
    const { logOut } = useLogOut();

  const dropdownOptions = [
    { onClick: () => navigate("/profile"), text: "Perfil" },
    { onClick: () => logOut(navigate), text: "Cerrar sesión" },
  ];

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const closeDropdownOnOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setDisplayDropdownItems(false);
      }
    };

    document.addEventListener("click", closeDropdownOnOutsideClick);

    return () => {
      document.removeEventListener("click", closeDropdownOnOutsideClick);
    };
  }, []);

  return (
    <div
      className="relative w-9 cursor-pointer flex justify-end"
      onClick={() => setDisplayDropdownItems(!displayDropdownItems)}
      ref={containerRef}
    >
      <img
        src={user.profileImage ?? defaultUserIcon}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = defaultUserIcon;
        }}
        alt="User avatar"
        className="w-9 h-9 rounded-full overflow-hidden object-cover"
      />
      {displayDropdownItems && (
        <ul className="absolute text-end top-14 p-6 space-y-3 w-40 rounded-lg bg-slate-900 bg-opacity-80 backdrop-blur-xl shadow-2xl animate-sladeInFromBottomShort">
          {dropdownOptions.map((dropDownTiem, idx) => {
            return (
              <li 
              className="block font-medium transition duration-150 hover:opacity-70"
              onClick={dropDownTiem.onClick}
              key={idx}
              >
                {dropDownTiem.text}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default UserAvatarDropdown;
