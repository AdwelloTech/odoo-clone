import React from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Image from "next/image";

const ProfilePage = () => {
  return (
    <section>
      <ProtectedRoute>
        <div className="relative bg-[#111111] min-h-screen ">
          <Image
            alt="bg"
            src="/bg-img.png"
            className="absolute top-0 left-0 w-full h-[40vh] rotate-180 opacity-20"
            height={1080}
            width={1080}
          />
        </div>
      </ProtectedRoute>
    </section>
  );
};

export default ProfilePage;
