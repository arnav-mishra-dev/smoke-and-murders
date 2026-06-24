import Board from "./Board";

export default function Game()
{
    return (
        <div className="relative flex justify-center items-center w-dvw h-dvh">
            <Board data={["test", "abb", "player", "123", "123", "123"]} />
        </div>
    );
}