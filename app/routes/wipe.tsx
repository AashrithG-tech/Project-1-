import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

interface FSItem {
    id: string;
    name: string;
    path: string;
    type: string;
}

const WipeApp = () => {
    const { auth, isLoading, error, fs, kv } = usePuterStore();
    const navigate = useNavigate();
    const [files, setFiles] = useState<FSItem[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [message, setMessage] = useState("");

    const loadFiles = async () => {
        try {
            const files = (await fs.readDir("/")) as FSItem[];
            setFiles(files);
        } catch (err) {
            console.error("Error loading files:", err);
            setFiles([]);
        }
    };

    useEffect(() => {
        loadFiles();
    }, []);

    useEffect(() => {
        if (!isLoading && !auth?.isAuthenticated) {
            navigate("/auth?next=/wipe");
        }
    }, [isLoading, auth, navigate]);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            setMessage("Wiping all app data...");

            // delete each file sequentially
            for (const file of files) {
                try {
                    await fs.delete(file.path);
                    console.log("Deleted:", file.path);
                } catch (err) {
                    console.warn("Failed to delete:", file.path, err);
                }
            }

            // flush key-value store
            await kv.flush();

            setMessage("All data deleted successfully ✅");
            await loadFiles();
        } catch (err) {
            console.error("Wipe failed:", err);
            setMessage("Error wiping app data ❌");
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="p-6">
            <h1 className="text-lg font-bold mb-4">
                Authenticated as: {auth?.user?.username || "Unknown"}
            </h1>

            <h2 className="text-md font-semibold mb-2">Existing files:</h2>
            <div className="flex flex-col gap-2 mb-4">
                {files.length > 0 ? (
                    files.map((file) => (
                        <div key={file.id} className="flex flex-row justify-between">
                            <p>{file.name}</p>
                            <span className="text-xs text-gray-500">{file.type}</span>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No files found.</p>
                )}
            </div>

            <button
                disabled={isDeleting}
                onClick={handleDelete}
                className={`px-4 py-2 rounded-md text-white ${
                    isDeleting ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
                }`}
            >
                {isDeleting ? "Deleting..." : "Wipe App Data"}
            </button>

            {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
        </div>
    );
};

export default WipeApp;
