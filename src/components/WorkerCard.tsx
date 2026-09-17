import { User } from "../interfaces/interfaces";
import defaultUserIcon from "../assets/icons/default-user.svg";
import { Link } from "react-router-dom";

interface WorkerCardProps {
  worker: User;
}

const WorkerCard = ({ worker }: WorkerCardProps) => {
  const { id, name, occupation, city, profileImage, bio } = worker;

  return (
    <Link
      to={`../worker/${id}`}
      className="group rounded-lg overflow-hidden bg-slate-900 flex flex-col cursor-pointer animate-sladeInFromBottomShort transition duration-150 hover:bg-slate-800 lg:flex-row lg:justify-between lg:items-center"
    >
      <div
        className={`relative h-full flex items-center justify-center lg:order-last bg-opacity-80 transition duration-150 group-hover:bg-opacity-60 lg:justify-end`}
        style={{
          minWidth: "12rem"
        }}
      >
        <img
          src={profileImage ?? defaultUserIcon}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = defaultUserIcon;
          }}
          className="drop-shadow-xl h-40 w-40 z-10 transition duration-150 ease-in rounded-full object-cover p-6"
          alt="User image"
          loading="lazy"
        />
      </div>
      <div className="space-y-1 p-6 lg:overflow-hidden">
        <h4 className="font-bold text-3xl line-clamp-1">{name}</h4>
        <span className="line-clamp-1">{city}</span>
        <h5 className={`font-bold text-xl text-emerald-600 line-clamp-1`}>
          {occupation}
        </h5>
        <p className=" text-slate-400 line-clamp-2">{bio || ""}</p>
      </div>
    </Link>
  );
};

export default WorkerCard;
