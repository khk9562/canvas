"use client";
import React, {
  createContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";

type Voice = SpeechSynthesisVoice;

interface PlayListContextProps {
  userList: any[];
  setUserList: Dispatch<SetStateAction<any[]>>;
  showLoginErrorModal: boolean;
  setShowLoginErrorModal: Dispatch<SetStateAction<boolean>>;
  showLoginNeedModal: boolean;
  setShowLoginNeedModal: Dispatch<SetStateAction<boolean>>;
  showSessionExModal: boolean;
  setShowSessionExModal: Dispatch<SetStateAction<boolean>>;
  session: string;
  sLiveId: string;
  setSLiveId: Dispatch<SetStateAction<string>>;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
  setTotalPages: Dispatch<SetStateAction<number>>;
  selectedVoice: Voice | null;
  setSelectedVoice: React.Dispatch<React.SetStateAction<Voice | null>>;
  selectedGoogleVoice: any;
  setSelectedGoogleVoice: React.Dispatch<React.SetStateAction<any>>;
  heartVoiceUseYN: boolean;
  setHeartVoiceUseYN: React.Dispatch<React.SetStateAction<boolean>>;
  spoonVoiceUseYN: boolean;
  setSpoonVoiceUseYN: React.Dispatch<React.SetStateAction<boolean>>;
  removeSession: () => void;
  newVersion: string;
  setNewVersion: React.Dispatch<React.SetStateAction<string>>;
  getVersion: () => void;
}

export const PlayListContext = createContext<PlayListContextProps>({
  userList: [],
  setUserList: () => {},
  showLoginErrorModal: false,
  setShowLoginErrorModal: () => {},
  showLoginNeedModal: false,
  setShowLoginNeedModal: () => {},
  showSessionExModal: false,
  setShowSessionExModal: () => {},
  session: "",
  sLiveId: "",
  setSLiveId: () => {},
  currentPage: 1,
  setCurrentPage: () => {},
  totalPages: 10,
  setTotalPages: () => {},
  selectedVoice: null,
  setSelectedVoice: () => {},
  selectedGoogleVoice: null,
  setSelectedGoogleVoice: () => {},
  heartVoiceUseYN: false,
  setHeartVoiceUseYN: () => {},
  spoonVoiceUseYN: false,
  setSpoonVoiceUseYN: () => {},
  removeSession: () => {},

  newVersion: "",
  setNewVersion: () => {},
  getVersion: () => {},
});

interface PlayListProviderProps {
  children: ReactNode;
}

export const PlayListProvider: React.FC<PlayListProviderProps> = ({
  children,
}) => {
  let session: any = null;
  if (typeof window !== "undefined") {
    session = localStorage.getItem("accessToken");
  }
  const [userList, setUserList] = useState<any[]>([]);
  const [showLoginErrorModal, setShowLoginErrorModal] =
    useState<boolean>(false);
  const [showLoginNeedModal, setShowLoginNeedModal] = useState<boolean>(false);
  const [showSessionExModal, setShowSessionExModal] = useState<boolean>(false);
  const [sLiveId, setSLiveId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(10);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [selectedGoogleVoice, setSelectedGoogleVoice] = useState<any | null>(
    null
  );
  const [heartVoiceUseYN, setHeartVoiceUseYN] = useState<boolean>(false);
  const [spoonVoiceUseYN, setSpoonVoiceUseYN] = useState<boolean>(false);
  const [newVersion, setNewVersion] = useState<string>("");

  const removeSession = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("dj_tag");
    location.reload();
  };

  const getVersion = async () => {
    try {
      const settings: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: session,
        },
        body: JSON.stringify({}),
      };

      const fetchResponse = await fetch(
        `${process.env.NEXT_PUBLIC_ROOROO_API as string}/sticker/version/get`,
        settings
      );
      const data = await fetchResponse.json();
      // console.log("getVersion On Provider", data);
      if (data.ok) {
        setNewVersion(data?.data.value1);
        // return data?.data.value1;
      }
    } catch (e) {
      console.error("getVersion", e);
    }
  };

  return (
    <PlayListContext.Provider
      value={{
        userList,
        setUserList,
        showLoginErrorModal,
        setShowLoginErrorModal,
        showLoginNeedModal,
        setShowLoginNeedModal,
        showSessionExModal,
        setShowSessionExModal,
        session,
        sLiveId,
        setSLiveId,
        currentPage,
        setCurrentPage,
        totalPages,
        setTotalPages,
        selectedVoice,
        setSelectedVoice,
        selectedGoogleVoice,
        setSelectedGoogleVoice,
        heartVoiceUseYN,
        setHeartVoiceUseYN,
        spoonVoiceUseYN,
        setSpoonVoiceUseYN,
        removeSession,
        newVersion,
        setNewVersion,
        getVersion,
      }}
    >
      {children}
    </PlayListContext.Provider>
  );
};
