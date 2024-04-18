import { useEffect, useState } from "react";
import ProfileCardSkeleton from "../components/Skeletons/ProfileCardSkeleton";
import ProfileCard from "../components/ProfileCard";
import { getUserById, getUserFavoritesServices } from "../services/services";
import { FavoriteService, User } from "../interfaces/interfaces";
import { AxiosResponse } from "axios";
import { useSelector } from "react-redux/es/hooks/useSelector";
import { RootState } from "../store/store";
import { isExpired, decodeToken } from "react-jwt";
import ServiceCardSkeleton from "../components/Skeletons/ServiceCardSkeleton";
import ServiceCard from "../components/ServiceCard";
import CreateNewServiceCard from "../components/CreateNewServiceCard";

const ProfilePage = () => {

  const token = useSelector((state: RootState) => state.token.token);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [userDecodedToken, setUserDecodedToken] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<FavoriteService[]>([]);

  const getUserDecodedToken = async () => {
    if (!token) return;
    if (isExpired(token)) return;
    const decodedToken = decodeToken<User>(token);
    if (!decodedToken) return;
    setUserDecodedToken(decodedToken);
  };

  const handleGetUserById = async () => {
    if (!userDecodedToken) return;
    const userData: AxiosResponse = await getUserById(userDecodedToken.id);
    setIsLoading(false);
    if (!userData)
      return console.log("Algo ha salido mal, intentalo de nuevo más tarde");
    if (userData.status !== 200) {
      return console.log(userData.data.msg);
    }
    if (userData.data.userData) {
      setUser(userData.data.userData);
    }
  };

  const handleGetFavoritesServices = async () => {
    if (!token || !user?.id) return null;
    setIsLoading(true);
    const favoritesServices: AxiosResponse = await getUserFavoritesServices(
      token,
      user?.id
      );
    if (!favoritesServices || favoritesServices.status !== 200) return null;
    setFavorites(favoritesServices.data);
    setIsLoading(false);
  };

  useEffect(() => {
    getUserDecodedToken();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleGetFavoritesServices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  useEffect(() => {
    if (userDecodedToken) {
      handleGetUserById();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDecodedToken]);

  return (
    <section className="min-h-screen max-w-7xl m-auto px-6 pb-12">
      <div className="pt-28 h-full w-full flex flex-col items-start lg:flex-row gap-8">
        {isLoading || !user ? (
          <ProfileCardSkeleton />
        ) : (
          <ProfileCard
            worker={user}
            className="animate-sladeInFromBottomShort"
            ButtonFunction="editProfile"
          />
        )}
        <article className="w-full space-y-4">
          {user?.role === "WORKER" && (
            <>
              <h4 className=" text-2xl font-semibold self-start animate-sladeInFromBottomMedium">
                Servicios
              </h4>
              <div className="grid grid-cols-1 gap-6 w-full md:p-0 md:grid-cols-2 animate-sladeInFromBottomMedium">
                {user && user.updatedAt ? (
                  <CreateNewServiceCard />
                ) : (
                  "Actualiza tu perfil para crear nuevos servicios."
                )}
                {isLoading || !user
                  ? Array.from({ length: 8 }, (_, index) => (
                      <ServiceCardSkeleton key={index} />
                    ))
                  : user?.services?.map((service) => {
                      return (
                        <ServiceCard
                          service={service}
                          key={service.id}
                          userId={userDecodedToken?.id}
                          user={userDecodedToken || undefined}
                        />
                      );
                    })}
              </div>
            </>
          )}
          {user && (
            <>
              <h4 className=" text-2xl font-semibold self-start animate-sladeInFromBottomMedium">
                Favoritos
              </h4>
              <div className="grid grid-cols-1 gap-6 w-full md:p-0 md:grid-cols-2 animate-sladeInFromBottomMedium">
                {isLoading || !user
                  ? Array.from({ length: 8 }, (_, index) => (
                      <ServiceCardSkeleton key={index} />
                    ))
                  : !favorites.length
                  ? "Aún no has agregado servicios a favoritos."
                  : favorites.map((favorite) => {
                      return (
                        <ServiceCard
                          service={favorite.service}
                          user={favorite.user}
                          key={favorite.id}
                        />
                      );
                    })}
              </div>
            </>
          )}
        </article>
      </div>
    </section>
  );
};

export default ProfilePage;
