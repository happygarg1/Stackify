import React, { useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Lookup from "@/app/data/Lookup";
import { Button } from "../ui/button";
import { useGoogleLogin } from "@react-oauth/google";
import { UserDetailContext } from "@/app/context/UserDetailContext";
import axios from "axios";
import { useMutation } from "convex/react";
import uuid4 from "uuid4";
import { api } from "@/convex/_generated/api";

const SignInDialog = ({ openDialog, closeDialog }) => {
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const CreateUser = useMutation(api.users.CreateUser);
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const userInfo = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: "Bearer " + tokenResponse?.access_token } }
      );
      const user = userInfo.data;
      await CreateUser({
        name: user?.name,
        email: user?.email,
        picture: user?.picture,
        uid: uuid4(),
      });
      if (typeof window !== undefined) {
        localStorage.setItem("user", JSON.stringify(user));
      }
      setUserDetail(userInfo?.data);
      closeDialog(false);
    },
    onError: (errorResponse) => console.log(errorResponse),
  });

  return (
    <Dialog open={openDialog} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="items-center text-center">
          <DialogTitle></DialogTitle>
          {/* Moved the heading out of DialogDescription */}
          <div className="font-bold text-2xl text-white">
            {Lookup.SIGNIN_HEADING}
          </div>
          <DialogDescription className="mt-2 text-center">
            {/* Kept the description text inside DialogDescription */}
            {Lookup.SIGNIN_SUBHEADING}
          </DialogDescription>
        </DialogHeader>

        {/* This div wraps the button and agreement text and is separate from the header */}
        <div className="flex flex-col items-center justify-center">
          <Button
            className="bg-blue-500 mt-3 gap-3 text-white hover:bg-blue-400"
            onClick={googleLogin}
          >
            Sign In with Google
          </Button>
          <p className="mt-2 text-sm text-gray-500 text-center">
            {Lookup.SIGNIn_AGREEMENT_TEXT}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignInDialog;