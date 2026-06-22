import { useAppStore, useAppSelector, useAppDispatch } from "@/lib/hooks";

export default function UsernameSetter()
{
    const store = useAppStore();
    const name = useAppSelector(state => state.username.value);
    const dispatch = useAppDispatch();

    return (
        <>
        </>
    );
}