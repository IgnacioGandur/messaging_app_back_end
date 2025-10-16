
const checkIfUrlPointsToImage = async (url: string) => {
    const response = await fetch(url, { method: "HEAD" });
    const isImage = response.headers.get("Content-Type")?.startsWith("image");

    if (!isImage) {
        throw new Error("The profile picture URL should point to an image.");
    }

    return true;
}

export default checkIfUrlPointsToImage;
