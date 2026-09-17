import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { User } from "../interfaces/interfaces";
import {
  findUserAndUpdate,
  getUserById,
  updateUserProfileImage,
} from "../services/services";
import { Loader } from "../components/Loader";
import Input from "../components/Input";
import { Button } from "../components/Button";
import SelectInput from "../components/SeletInput";
import { RootState } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import { AxiosResponse } from "axios";
import { isExpired, decodeToken } from "react-jwt";
import Modal from "../components/Modal";
import { validateInput } from "../helpers/inputValidators";
import {
  occupationsList,
  rolesList,
  sortedProvincesList,
} from "../helpers/selectLists";
import defaultUserIcon from "../assets/icons/default-user.svg";
import { AiOutlineEdit } from "react-icons/ai";
import { updateUser } from "../store/userSlice";

const EditProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = useSelector((state: RootState) => state.token.token);
  const storageUser = useSelector((state: RootState) => state.user);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User>(storageUser);
  const [userDecodedToken, setUserDecodedToken] = useState<User | null>(null);
  const [displayModal, setDisplayModal] = useState<boolean>(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [updateProfileImage, setUpdateProfileImage] = useState<boolean>(false);

  const getUserDecodedToken = async () => {
    if (!token) return;
    if (isExpired(token)) return;
    const decodedToken = decodeToken<User>(token);
    if (!decodedToken) return;
    setUserDecodedToken(decodedToken);
  };

  const handleGetUserById = async () => {
    if (!userDecodedToken) return;
    const userData: AxiosResponse = await getUserById(userDecodedToken?.id);
    setIsLoading(false);
    if (!userData)
      return console.log("Algo ha salido mal, intentalo de nuevo más tarde");
    if (userData.status !== 200) {
      return console.log(userData.data);
    }
    setUser(userData.data.userData);
    if (userData.data.userData.profileImage) setProfileImageUrl(userData.data.userData.profileImage);
  };

  const handleConfirmAndNavigate = () => {
    setDisplayModal(false);
    navigate("../profile");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const MAX_FILE_SIZE_MB = 2;
    const MAX_WIDTH = 400;
    const selectedImage = e.target.files && e.target.files[0];
  
    if (selectedImage) {
      if (selectedImage.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert(`El tamaño máximo permitido es de ${MAX_FILE_SIZE_MB} MB.`);
        e.target.value = "";
        return;
      }
  
      // Utilizar FileReader para leer la imagen como un objeto de datos
      const reader = new FileReader();
  
      reader.onload = (readerEvent) => {
        const image = new Image();
        image.onload = () => {
          // Calcular las nuevas dimensiones de la imagen
          const aspectRatio = image.width / image.height;
          const newWidth = Math.min(MAX_WIDTH, image.width);
          const newHeight = newWidth / aspectRatio;
  
          // Crear un lienzo para redimensionar la imagen
          const canvas = document.createElement("canvas");
          canvas.width = newWidth;
          canvas.height = newHeight;
  
          // Dibujar la imagen redimensionada en el lienzo
          const context = canvas.getContext("2d");
          context?.drawImage(image, 0, 0, newWidth, newHeight);
  
          // Convertir el lienzo a un Blob y luego a un archivo
          canvas.toBlob((blob) => {
            if (!blob) return;
            const resizedFile = new File([blob], selectedImage.name, {
              type: selectedImage.type,
              lastModified: Date.now(),
            });
  
            // Establecer la imagen redimensionada en el estado
            setProfileImage(resizedFile);
            const imageURL = URL.createObjectURL(resizedFile);
            setProfileImageUrl(imageURL);
            setUpdateProfileImage(true);
          }, selectedImage.type);
        };
  
        // Asignar la URL de la imagen al objeto Image
        image.src = readerEvent.target?.result as string;
      };
  
      // Leer la imagen como un objeto de datos
      reader.readAsDataURL(selectedImage);
    }
  };

  const uploadImage = async () => {
    if (!profileImage || !updateProfileImage || !token || !userDecodedToken)
      return null;
    try {
      const response = await updateUserProfileImage(
        token,
        userDecodedToken.id,
        profileImage
      );
      if (response?.status === 200) return response.data.user.profileImage;
      console.log(response?.data);
      return null;
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent<EventTarget>) => {
    e.preventDefault();

    if (!user.phone || !user.bio) return;

    const [nameValidations] = validateInput(user?.name, [
      "notEmpty",
      "minLength:8",
      "maxLength:50",
    ]);

    const [emailValidations] = validateInput(user?.email, [
      "notEmpty",
      "isEmail",
    ]);

    const [phoneValidations] = validateInput(user?.phone, [
      "notEmpty",
      "isValidPhone",
    ]);

    const [bioValidations] = validateInput(user?.bio, [
      "notEmpty",
      "minLength:50",
      "maxLength:150",
    ]);

    if (
      nameValidations.length > 0 ||
      phoneValidations.length > 0 ||
      bioValidations.length > 0 ||
      emailValidations.length > 0 ||
      !user.city ||
      !user.occupation
    ) {
      alert(
        "¡Ups! Alguno de los campos ingresados es incorrecto. Por favor, revisa los campos y vuelve a intentarlo."
      );
      return;
    }
    setIsLoading(true);
    if (!token) return alert("Debes iniciar sesión para hacer esto.");
    const profileImageFromHost = await uploadImage();
    const updatedUser: AxiosResponse = await findUserAndUpdate(token, {...user, ...(profileImageFromHost && {profileImage: profileImageFromHost}) });
    setIsLoading(false);
    if (!updatedUser)
      return alert("Algo ha salido mal, intentalo de nuevo más tarde");
    if (updatedUser.status !== 200) {
      return alert(updatedUser.data);
    }
    const userClientData = {
      id: updatedUser.data.user.id,
      name: updatedUser.data.user.name,
      email: updatedUser.data.user.email,
      role: updatedUser.data.user.role,
      ...(profileImageFromHost && { profileImage: profileImageFromHost}),
      ...(profileImageUrl && { profileImage: profileImageUrl})
    };
    setUser(userClientData);
    dispatch(updateUser(userClientData));
    setDisplayModal(true);
  };

  useEffect(() => {
    getUserDecodedToken();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userDecodedToken) {
      handleGetUserById();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDecodedToken]);

  return (
    <div className="m-auto w-full min-h-screen flex flex-col justify-center items-center bg-cover animate-sladeInFromBottomMedium lg:pt-20">
      {isLoading && <Loader />}
      <Modal
        display={displayModal}
        title="Perfil Actualizado"
        text="Tu perfil se ha actualizado correctamente."
        confirmText="Aceptar"
        handleConfirm={() => handleConfirmAndNavigate()}
        handleCloseModal={() => setDisplayModal(false)}
        displayCancelButton={false}
      />
      <div className="p-8 space-y-4 rounded-xl w-full max-w-xl">
        <form className="space-y-4" onSubmit={(e) => handleSubmit(e)}>
          <h3 className=" text-center text-3xl font-bold mb-4">Tus datos</h3>
          <input
            type="file"
            id="upload-file"
            className="hidden"
            onChange={handleImageChange}
          />
          <label htmlFor="upload-file" className="relative">
            <img
              src={profileImageUrl ?? defaultUserIcon}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = defaultUserIcon;
              }}
              className={`mx-auto my-6 object-cover drop-shadow-xl h-52 w-52 z-10 transition duration-150 ease-in overflow-hidden rounded-full $`}
              alt="User image"
              loading="lazy"
            />
            <div className="absolute top-40 left-16 w-full flex items-center justify-center">
              <div className="p-4 bg-emerald-600 rounded-full cursor-pointer transition duration-150 ease-in hover:bg-emerald-500 flex items-center justify-center ">
                <span className="text-white font-bold">
                  <AiOutlineEdit size={20} />
                </span>
              </div>
            </div>
          </label>
          <Input
            placeholder="Nombre completo"
            onChangeText={(e) =>
              setUser((prevUser) => ({ ...prevUser, name: e }))
            }
            value={user?.name}
            validations={["notEmpty", "minLength:8", "maxLength:50"]}
          />
          <Input
            placeholder="Correo electrónico"
            onChangeText={() => {}}
            value={user?.email || ""}
            validations={["notEmpty", "isEmail"]}
            disabled
          />
          <SelectInput
            onChange={(e) => setUser((prevUser) => ({ ...prevUser, role: e }))}
            options={rolesList}
            placeholder="Selecciona un tipo de usuario"
            value={user?.role || ""}
          />
          <SelectInput
            onChange={(e) => setUser((prevUser) => ({ ...prevUser, city: e }))}
            options={sortedProvincesList}
            placeholder="Selecciona una ubicación"
            value={user?.city || ""}
          />
          <Input
            placeholder="Teléfono"
            onChangeText={(e) =>
              setUser((prevUser) => ({ ...prevUser, phone: e }))
            }
            value={user?.phone || ""}
            validations={["isValidPhone"]}
          />
          {user?.role === "WORKER" && (
            <SelectInput
              onChange={(e) =>
                setUser((prevUser) => ({ ...prevUser, occupation: e }))
              }
              options={occupationsList}
              placeholder="Selecciona una ocupación"
              value={user?.occupation || ""}
            />
          )}
          {user?.role === "WORKER" && (
            <Input
              onChangeText={(e) =>
                setUser((prevUser) => ({ ...prevUser, bio: e }))
              }
              placeholder="Acerca de tí"
              value={user?.bio || ""}
              type="textarea"
              rows={3}
              validations={["minLength:50", "maxLength:150"]}
            />
          )}
          <Button title="Actualizar" className="w-full" onClick={() => {}} />
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
