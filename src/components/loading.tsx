import {TailwindColorBg} from "@/types/color";

export function Loading({loadingText, colorBg, colorFg}: { loadingText?: string, colorBg: TailwindColorBg, colorFg: TailwindColorBg }) {
  return (
    <main className={`min-h-screen flex items-center justify-center ${colorBg}`}>
      <div className={`p-4 rounded-xl ${colorFg} text-center`}>
        <div className="text-xl">加载中...</div>
        {loadingText && <div>{loadingText}</div>}
      </div>
    </main>
  )
}
