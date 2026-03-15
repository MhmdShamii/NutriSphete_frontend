import { useSelector } from "react-redux";

export default function Home() {
    const username = useSelector((state: any) => state.user?.name);
    return (
        <div>
            welcome home {username}
        </div>
    );
}