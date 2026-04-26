import BentoGrid from "@/components/BentoGrid";
import RecommendationMarquee from "@/components/RecommendationMarquee";

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center py-2.5 md:py-5 px-4 overflow-hidden">
      <BentoGrid />
      <RecommendationMarquee />
    </div>
  );
}
