'use client'
import InputField from "@/components/InputField";
import { setUsername } from "@/lib/features/username/usernameSlice";
import { useAppDispatch } from "@/lib/hooks";
import Image from "next/image";

export default function UsernameSetter()
{
    const dispatch = useAppDispatch();

    return (
        <div className="flex flex-column top-0 left-0 items-center justify-center gap-2">
            <Image
            className="w-20 h-20"
            width={0} height={0}
            src="/profile-icon.svg"
            alt="Profile icon"
            />
            <InputField onChange={ (username) => dispatch(setUsername(username)) } />
        </div>
    );
}