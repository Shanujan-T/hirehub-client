import { THEME_KEY } from "@/lib/constants";

export function ThemeInitScript() {
  const script = `(function(){try{var k=${JSON.stringify(THEME_KEY)};var stored=localStorage.getItem(k);var pref=stored==="light"||stored==="dark"||stored==="system"?stored:"system";var resolved=pref==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):pref;var d=document.documentElement;if(resolved==="dark"){d.classList.add("dark")}else{d.classList.remove("dark")}d.setAttribute("data-theme",resolved);d.setAttribute("data-theme-preference",pref);if(!stored){localStorage.setItem(k,"system")}}catch(e){}})();`;

  return (
    <script
      id="theme-init"
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
