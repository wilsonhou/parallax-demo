import { WebGL } from "@/components/webgl";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-black">
      <div className="fixed inset-0 pointer-events-none ">
        <WebGL />
        {/* hello */}
      </div>

      {/* <section> </section> */}
    </main>
  );
}
