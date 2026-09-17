import { User } from "../interfaces/interfaces";
import defaultUserIcon from "../assets/icons/default-user.svg";
import {
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineCalendar,
} from "react-icons/ai";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { Button } from "./Button";
import { callUserPhone } from "../helpers/callUserPhone";
import { useNavigate } from "react-router-dom";

interface ProfileCardProps {
  worker: User;
  className?: string;
  ButtonFunction?: "visitProfile" | "callUserPhone" | "editProfile";
  userId?: string;
}

const ProfileCard = ({
  worker,
  className,
  ButtonFunction = "callUserPhone",
  userId,
}: ProfileCardProps) => {
  const {
    name,
    email,
    bio,
    city,
    occupation,
    profileImage,
    phone,
    createdAt,
    role,
  } = worker;
  const createdAtDate = createdAt ? new Date(createdAt) : null;

  const navigate = useNavigate();

  return (
    <div
      className={`bg-slate-900 w-full lg:w-[36rem] rounded-lg px-6 ${className}`}
    >
      <div
        className={`relative h-full col-span-6 flex justify-center items-center bg-opacity-80 transition duration-150 pt-6 group-hover:bg-opacity-60`}
      >
        <img
          src={profileImage ?? defaultUserIcon}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = defaultUserIcon;
          }}
          className={`object-cover drop-shadow-xl h-40 w-40 z-10 transition duration-150 ease-in rounded-full`}
          alt="User image"
          loading="lazy"
        />
      </div>
      <div className="py-6 divide-y space-y-3 divide-slate-400/20">
        <div className="space-y-1 pb-3">
          <h4 className="font-bold text-3xl line-clamp-1 text-center">
            {name}
          </h4>
          {role === "WORKER" && (
            <>
              <h5
                className={`font-bold text-xl text-emerald-600 line-clamp-1 text-center`}
              >
                {occupation}
              </h5>
              <p className=" text-slate-400 line-clamp-2 text-center">{bio}</p>
            </>
          )}
        </div>
        <div className="pt-6 space-y-3">
          <div className="flex justify-between">
            <p className="text-slate-400 flex items-center">
              <span className="mr-2">
                <AiOutlineCalendar />
              </span>
              Miembro desde:
            </p>
            <p className="font-medium">
              {createdAtDate?.toLocaleString("es-ES", {
                year: "numeric",
                month: "long",
              })}
            </p>
          </div>
          {city && (
            <div className="flex justify-between">
              <p className="text-slate-400 flex items-center">
                <span className="mr-2">
                  <HiOutlineLocationMarker />
                </span>
                Ubicación:
              </p>
              <p className={`font-medium ${!city && "text-slate-500"}`}>
                {city ?? "No especificada"}
              </p>
            </div>
          )}
          {phone && (
            <div className="flex justify-between">
              <p className="text-slate-400 flex items-center">
                <span className="mr-2">
                  <AiOutlinePhone />
                </span>
                Teléfono:
              </p>
              <p className={`font-medium ${!phone && "text-slate-500"}`}>
                {phone}
              </p>
            </div>
          )}
          <div className="flex justify-between flex-wrap overflow-auto">
            <p className="text-slate-400 flex items-center">
              <span className="mr-2">
                <AiOutlineMail />
              </span>
              Email:
            </p>
            <p className="text-end font-medium">{email}</p>
          </div>
          <div className="pt-6">
            <Button
              onClick={
                ButtonFunction === "callUserPhone"
                  ? () => callUserPhone(worker.phone)
                  : ButtonFunction === "visitProfile"
                  ? () => navigate(`../worker/${worker.id}`)
                  : () => navigate(`../profile/edit`)
              }
              widthFull
              title={
                userId === worker.id
                  ? "Editar"
                  : ButtonFunction === "callUserPhone"
                  ? "Llamar"
                  : ButtonFunction === "visitProfile"
                  ? "Visitar perfil"
                  : "Editar"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
