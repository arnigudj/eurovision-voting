"use server";

import { redirect } from "next/navigation";

export default async function RootPage() {
  redirect(`/users`);
}

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useUser } from "@/context/UserContext";
// import { Contest } from "./api/contests/types";
// import ContestHeader from "@/components/Contest/ContestHeader";
// import Input from "@/components/Input/Input";
// import DragDropUpload from "@/components/DragDropUpload/DragDropUpload";
// import Button from "@/components/Button/Button";

// export default function HomePage() {
//   const { user, setUser } = useUser();
//   const [contest, setContest] = useState<Contest>();
//   const [preview, setPreview] = useState<string>();
//   const [nickname, setNickname] = useState("");
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const handleSubmit = async () => {
//     if (!nickname.trim()) {
//       setError("Nickname is required");
//       return;
//     }
//     if (!imageFile) {
//       setError("Selfie is required");
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     const form = new FormData();
//     form.append("file", imageFile);
//     form.append("nickname", nickname);

//     const res = await fetch("/api/users", {
//       method: "POST",
//       body: form,
//     });

//     const data = await res.json();
//     setLoading(false);

//     if (!res.ok) {
//       setError(data.error);
//     } else {
//       setUser(data);
//       router.push("/voting");
//     }
//   };

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       if(user){
//         router.push(`/users/${user.id}/voting`);
//         return
//       }
//       const [contestRes] = await Promise.all([fetch(`/api/contests/active`)]);

//       setContest(await contestRes.json());

//       setLoading(false);

//     };

//     load();
//   }, [router, user]);

//   return (
//     <div>
//       <ContestHeader contest={contest}></ContestHeader>

//       <DragDropUpload
//         label='Upload your selfie'
//         previewUrl={user?.image_url || preview}
//         onFileSelect={(file) => {
//           setImageFile(file);
//           if (file) setPreview(URL.createObjectURL(file));
//         }}
//       />
//       <Input
//         type="text"
//         placeholder="Enter your name"
//         value={nickname}
//         onChange={(e) => setNickname(e.target.value)}
//       />

//       {error && <p style={{ color: "red" }}>{error}</p>}

//       <Button
//         onClick={handleSubmit}
//         disabled={loading}
//         style={{ marginTop: 16 }}
//       >
//         {loading ? "Submitting..." : "Join the contest!"}
//       </Button>
//     </div>
//   );
// }
