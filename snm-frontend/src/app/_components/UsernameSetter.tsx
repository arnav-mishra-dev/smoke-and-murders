'use client'
import InputField from "./InputField";
import { ConnectionContext } from "@/lib/context";
import Image from "next/image";
import { use } from "react";

export default function UsernameSetter()
{
    const context = use(ConnectionContext);

    return (
        <div className="flex flex-column top-0 left-0 items-center justify-center gap-2">
            <Image
            className="w-20 h-20"
            width={0} height={0}
            src="/profile-icon.svg"
            alt="Profile icon"
            />
            <InputField onChange={ (username) => context?.SetUsername(username) } />
        </div>
    );
}