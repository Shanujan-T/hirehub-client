import { THEME_KEY } from "@/lib/constants";

export function ThemeInitScript() {
  const script = `(function(){try{var k=${JSON.stringify(THEME_KEY)};var p=localStorage.getItem(k)||"light";if(p==="system"){p=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";localStorage.setItem(k,p)}var d=document.documentElement;if(p==="dark"){d.classList.add("dark")}else{d.classList.remove("dark")}d.setAttribute("data-theme-preference",p)}catch(e){}})();`;

  return (
    <script
      id="theme-init"
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
